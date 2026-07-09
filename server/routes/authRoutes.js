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

/* ===============================================
         FORGET PASSWORD
================================================= */

router.post("/forgot-password/verify-user", async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { email, file_number } = req.body;

    const [rows] = await connection.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      AND file_number = ?
      AND is_active = 1
      LIMIT 1
      `,
      [email, file_number]
    );

    if (rows.length === 0) {
      return res.json({
        Status: false,
        Error: "Invalid email or file number",
      });
    }

    const staffId = rows[0].id;

    const token = crypto.randomBytes(32).toString("hex");

    const expires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await connection.query(
      `
      INSERT INTO password_recovery_sessions
      (staff_id, token, expires_at)
      VALUES(?,?,?)
      `,
      [staffId, token, expires]
    );

    const [questions] = await connection.query(
      `
      SELECT
      ssa.question_id,
      sq.question
      FROM staff_security_answers ssa
      JOIN security_questions sq
      ON sq.id = ssa.question_id
      WHERE ssa.staff_id = ?
      ORDER BY ssa.slot_number ASC
      `,
      [staffId]
    );

    return res.json({
      Status: true,
      Token: token,
      Questions: questions,
    });

  } catch (err) {
    console.log(err);

    return res.json({
      Status: false,
      Error: "Unable to verify account",
    });
  }
});

router.post("/forgot-password/verify-answers", async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { token, answers } = req.body;

    const [session] = await connection.query(
      `
      SELECT *
      FROM password_recovery_sessions
      WHERE token = ?
      AND verified = 0
      AND expires_at > NOW()
      `,
      [token]
    );

    if (session.length === 0) {
      return res.json({
        Status: false,
        Error: "Recovery session expired",
      });
    }

    const staffId = session[0].staff_id;

    const [savedAnswers] = await connection.query(
      `
      SELECT *
      FROM staff_security_answers
      WHERE staff_id=?
      ORDER BY slot_number ASC
      `,
      [staffId]
    );

    let matched = 0;

    for (let i = 0; i < savedAnswers.length; i++) {
      const ok = await bcrypt.compare(
        answers[i].trim().toLowerCase(),
        savedAnswers[i].answer_hash
      );

      if (ok) matched++;
    }

    if (matched !== 3) {
      return res.json({
        Status: false,
        Error: "One or more answers are incorrect. Please try again",
      });
    }

    await connection.query(
      `
      UPDATE password_recovery_sessions
      SET verified = 1
      WHERE token = ?
      `,
      [token]
    );

    return res.json({
      Status: true,
      Message: "Security questions verified",
    });

  } catch (err) {
    return res.json({
      Status: false,
      Error: "Verification failed",
    });
  }
});

router.post("/forgot-password/reset", async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { token, password } = req.body;

    // PASSWORD VALIDATION
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.json({
        Status: false,
        Error:
          "Password must be at least 8 characters and contain uppercase, lowercase, number and special character.",
      });
    }

    // VERIFY SESSION
    const [session] = await connection.query(
      `
      SELECT *
      FROM password_recovery_sessions
      WHERE token = ?
      AND verified = 1
      AND expires_at > NOW()
      `,
      [token]
    );

    if (session.length === 0) {
      return res.json({
        Status: false,
        Error: "Session expired",
      });
    }

    // UPDATE PASSWORD
    const hash = await bcrypt.hash(password, 10);

    await connection.query(
      `
      UPDATE users
      SET password_hash = ?
      WHERE id = ?
      `,
      [hash, session[0].staff_id]
    );

    // Remove recovery session after successful reset
    await connection.query(
      `
      DELETE FROM password_recovery_sessions
      WHERE token = ?
      `,
      [token]
    );

    return res.json({
      Status: true,
      Message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);

    return res.json({
      Status: false,
      Error: "Unable to reset password",
    });
  }
});

export { router as authRouter };
