import express from "express";
import { connectToDatabase } from "../lib/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { UAParser } from "ua-parser-js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // Generate session ID
    const sessionId = crypto.randomUUID();

    if (!username || !password) {
      return res.status(400).json({
        Status: false,
        Error: "Username and password are required",
      });
    }

    const connection = await connectToDatabase(); // MySQL connection

    // 1️⃣ Get user by username
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE username = ? LIMIT 1",
      [username],
    );

    const user = users[0];

    if (!user) {
      return res.status(401).json({
        Status: false,
        Error: "Invalid username or password",
      });
    }

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        Status: false,
        Error: "Invalid username or password",
      });
    }

    // 3️⃣ Check account status
    if (user.is_active !== 1) {
      return res.status(401).json({
        Status: false,
        Error: "Account not active",
      });
    }

    if (user.is_locked === 1) {
      return res.status(401).json({
        Status: false,
        Error: "Account is locked",
      });
    }

    // 4️⃣ Get role name from roles table
    const [roles] = await connection.execute(
      "SELECT name FROM roles WHERE id = ? LIMIT 1",
      [user.role_id],
    );

    const roleData = roles[0];
    if (!roleData) {
      return res.status(500).json({
        Status: false,
        Error: "Role not found",
      });
    }

    const roleName = roleData.name;

    // 5️⃣ Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: roleName,
        session_id: sessionId,
      },
      process.env.JWT_KEY,
      { expiresIn: "1d" },
    );

    // 6️⃣ Send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    /* audit log start */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser =
      `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`.trim();
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`.trim();
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";

    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;
    const userId = user.id;
    await connection.query(
      `INSERT INTO audit_logs
   (user_id, session_id, action, entity_type, description,
    ip_address, user_agent_raw, browser, os, device, status)
   VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        userId,
        sessionId,
        "LOGIN",
        "AUTH",
        "User logged in",
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );
    /* audit log end */

     // update user last login
    await connection.execute(
      "UPDATE users SET last_login = NOW() WHERE id = ?",
      [user.id],
    );

    // 7️⃣ Send response
    return res.json({
      Status: true,
      Message: "Login successful",
      role: roleName,
      id: user.id,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

router.get("/logout", async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const token = req.cookies.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        // Close the LOGIN session instead of inserting new row
        await connection.query(
          `UPDATE audit_logs
           SET logout_at = NOW(),
               session_duration = TIMESTAMPDIFF(SECOND, created_at, NOW()),
               status = 'COMPLETED'
           WHERE session_id = ?
             AND user_id = ?
             AND action = 'LOGIN'
             AND logout_at IS NULL`,
          [decoded.session_id, decoded.id]
        );

      } catch (verifyError) {
        console.log("Token invalid/expired during logout");
        // Do not crash or insert anything
      }
    }

    // Always clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({ Status: true, Message: "Logout successful" });

  } catch (err) {
    console.error("Logout error:", err);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({ Status: true });
  }
});



router.get("/logou", async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const token = req.cookies.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        // Parse device info
        const parser = new UAParser(req.headers["user-agent"]);
        const ua = parser.getResult();

        const browser =
          `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`.trim();
        const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`.trim();
        const device = ua.device.vendor
          ? `${ua.device.vendor} ${ua.device.model}`
          : "Desktop";

        const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

        await connection.query(
          `INSERT INTO audit_logs
           (user_id, session_id, action, entity_type, description, user_agent_raw,
            ip_address, browser, os, device, status)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [
            decoded.id,
            decoded.session_id,
            "LOGOUT",
            "AUTH",
            "User logged out successfully",
            req.headers["user-agent"],
            ip,
            browser,
            os,
            device,
            "SUCCESS",
          ],
        );
      } catch (verifyError) {
        // Token invalid or expired → log attempt
        await connection.query(
          `INSERT INTO audit_logs
           (action, entity_type, description, status)
           VALUES (?,?,?,?)`,
          [
            "LOGOUT",
            "AUTH",
            "Logout attempted with invalid/expired token",
            "FAILED",
          ],
        );
      }
    }

    // Always clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({ Status: true, Message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);

    // Even if DB fails, never break logout
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({ Status: true });
  }
});

export { router as authRouter };
