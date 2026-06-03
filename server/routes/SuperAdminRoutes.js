import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mime from "mime-types";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "../lib/db.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { UAParser } from "ua-parser-js";
import XLSX from "xlsx";

const router = express.Router();

/* ===========================
   __dirname (ESM fix)
=========================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ===========================
   Ensure storage directory
=========================== */
const documentsDir = path.join(__dirname, "..", "Public", "Documents");
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9_-]/g, "_");

const generateTimestamp = () => {
  const d = new Date();
  return (
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0") +
    "_" +
    String(d.getHours()).padStart(2, "0") +
    String(d.getMinutes()).padStart(2, "0") +
    String(d.getSeconds()).padStart(2, "0")
  );
};

/* ===========================
   Multer config
=========================== */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, documentsDir),

  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = sanitizeFilename(path.basename(file.originalname, ext));

    const timestamp = generateTimestamp();
    //const version = "v1.0"; // initial upload version

    const finalName = `${base}_${timestamp}${ext}`;

    cb(null, finalName);
  },
});

const upload = multer({ storage });

/* ===========================
   Multer config for Staff Registration import
=========================== */

const importStorage = multer.memoryStorage();

const importUpload = multer({
  storage: importStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ===========================
   Support Screenshot Folder
=========================== */
const supportsDir = path.join(__dirname, "..", "Public", "Supports");

if (!fs.existsSync(supportsDir)) {
  fs.mkdirSync(supportsDir, { recursive: true });
}

/* ===========================
   Support Multer Config
=========================== */
const supportStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, supportsDir),

  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = sanitizeFilename(path.basename(file.originalname, ext));
    const timestamp = generateTimestamp();

    cb(null, `${base}_${timestamp}${ext}`);
  },
});

/* ===========================
   Image-only filter
=========================== */
const imageFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false); // reject non-images silently
  }
};

/* ===========================
   Support Upload Instance
=========================== */
const uploadSupport = multer({
  storage: supportStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

//DELETE FILE HELPER
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("File delete error:", err);
    });
  }
};

/* ===========================
   JWT middleware
=========================== */
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ Status: false, Error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    req.user = {
      id: decoded.id,
      session_id: decoded.session_id,
    };

    next();
  } catch (err) {
    return res.status(403).json({ Status: false, Error: "Invalid token" });
  }
};

/* ===========================
   FETCH DEPARTMENTS
=========================== */
router.get("/departments", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.query(
      `
  SELECT id, name, name_abbreviation, created_at 
  FROM departments
  WHERE name != 'Partner'
  ORDER BY name ASC
  `,
    );

    res.json({
      Status: true,
      Departments: rows,
    });
  } catch (err) {
    res.json({ Status: false });
  }
});
/* ===========================
   GET DOCUMENT CATEGORIES
=========================== */
router.get("/categories", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  const [rows] = await connection.query(
    "SELECT id, name FROM document_categories ORDER BY name ASC",
  );

  res.json(rows);
});

/* ===========================
   GET DOCUMENT SUB-CATEGORIES
=========================== */
router.get("/categories/:id/subcategories", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  const [rows] = await connection.query(
    "SELECT id, name FROM document_subcategories WHERE category_id = ? ORDER BY name ASC",
    [req.params.id],
  );

  res.json(rows);
});

/* ===========================
   GET ACTIVE DOCUMENTS DISTINCT YEARS
=========================== */
router.get("/documents/distinct_years", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    // Fetch years
    const [years] = await connection.query(
      `
      SELECT DISTINCT YEAR(created_at) AS year
      FROM documents
      WHERE is_flagged = 0
      AND is_archived = 0
      AND is_delete = 0
      AND is_delete_flagged = 0
      AND document_status = 'Active'
      ORDER BY year DESC
      `,
    );

    res.json({
      Status: true,
      Years: years.map((y) => y.year),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});

/* ===========================
   GET WHO LOGGED IN  
=========================== */
router.get("/user", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.execute(
      `SELECT 
          u.id,
          u.title,
          u.full_name,
          u.file_number,
          u.designation,
          u.division_unit_state,
          u.gender,
          u.username,
          u.email,
          u.phone_number,
          u.created_at,
          u.updated_at,
          u.is_active,
          u.last_login,
          r.name AS role,
          d.name AS department
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [req.user.id],
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        Status: false,
        Error: "User not found",
      });
    }

    res.json({
      Status: true,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

/* ===========================
   UPDATE PROFILE 
=========================== */
router.put("/profile/update", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();
  const userId = req.user.id;

  const { designation, email, phone_number, title, division_unit_state } =
    req.body;

  try {
    await connection.beginTransaction();

    // Get existing user
    const [[existingUser]] = await connection.query(
      "SELECT designation,email,phone_number,title, division_unit_state FROM users WHERE id=?",
      [userId],
    );

    if (!existingUser) {
      await connection.rollback();
      return res.json({ Status: false, Error: "User not found" });
    }

    // Duplicate email
    const [emailCheck] = await connection.query(
      "SELECT id FROM users WHERE email=? AND id != ?",
      [email, userId],
    );

    if (emailCheck.length) {
      await connection.rollback();
      return res.json({
        Status: false,
        Error: "Email already exists",
      });
    }

    // Duplicate phone
    const [phoneCheck] = await connection.query(
      "SELECT id FROM users WHERE phone_number=? AND id != ?",
      [phone_number, userId],
    );

    if (phoneCheck.length) {
      await connection.rollback();
      return res.json({
        Status: false,
        Error: "Phone number already exists",
      });
    }

    /* -------------------------
       DETECT CHANGES
    ------------------------- */

    const detectChanges = (oldObj, newObj) => {
      let changes = [];
      let oldValues = {};
      let newValues = {};

      Object.keys(newObj).forEach((key) => {
        if (oldObj[key] !== newObj[key]) {
          changes.push(key);
          oldValues[key] = oldObj[key];
          newValues[key] = newObj[key];
        }
      });

      return { changes, oldValues, newValues };
    };

    const { changes, oldValues, newValues } = detectChanges(existingUser, {
      designation,
      email,
      phone_number,
      title,
      division_unit_state,
    });

    if (changes.length === 0) {
      await connection.rollback();
      return res.json({
        Status: false,
        Error: "No changes detected",
      });
    }

    /* -------------------------
       UPDATE USER
    ------------------------- */

    await connection.query(
      `UPDATE users
       SET designation=?, email=?, phone_number=?, title=?, division_unit_state=?
       WHERE id=?`,
      [designation, email, phone_number, title, division_unit_state, userId],
    );

    /* -------------------------
       AUDIT LOG
    ------------------------- */

    const sessionId = req.user.session_id;

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
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        userId,
        sessionId,
        "UPDATE PROFILE",
        "USER",
        userId,
        `Updated profile fields: ${changes.join(", ")}`,
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    await connection.commit();

    return res.json({
      Status: true,
      Message: "Profile updated successfully",
    });
  } catch (err) {
    await connection.rollback();
    console.error("Profile Update Error:", err);

    return res.status(500).json({
      Status: false,
      Error: "Profile update failed",
    });
  }
});

/* ===========================
   CHANGE PASSWORD 
=========================== */
router.post("/change-password", verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  const sessionId = req.user.session_id;

  try {
    const connection = await connectToDatabase();

    const [userResult] = await connection.query(
      "SELECT * FROM users WHERE id = ?",
      [userId],
    );

    if (userResult.length === 0) {
      return res.json({ Status: false, Error: "User not found" });
    }

    const user = userResult[0];

    // ✅ Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.json({
        Status: false,
        Error: "Current password is incorrect",
      });
    }

    // ✅ Prevent reuse (check last 5 passwords)
    const [history] = await connection.query(
      `SELECT password_hash FROM password_history 
       WHERE user_id = ? 
       ORDER BY created_at DESC LIMIT 5`,
      [userId],
    );

    for (let record of history) {
      const reused = await bcrypt.compare(newPassword, record.password_hash);
      if (reused) {
        return res.json({
          Status: false,
          Error: "You cannot reuse a recent password",
        });
      }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Save old password in history
    await connection.query(
      "INSERT INTO password_history (user_id, password_hash) VALUES (?, ?)",
      [userId, user.password_hash],
    );

    // ✅ Update password
    await connection.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      hashedNewPassword,
      userId,
    ]);

    /* ===========================
       DEVICE INFO
    =========================== */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";
    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    /* ===========================
       AUDIT LOG
    =========================== */
    await connection.query(
      `INSERT INTO audit_logs
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values, ip_address, user_agent_raw,
       browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        userId,
        sessionId,
        "CHANGE PASSWORD",
        "AUTH",
        userId,
        "User changed password",
        null,
        null,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.json({
      Status: false,
      Error: "Server error",
    });
  }
});

/* ===========================
   USER SEARCH
=========================== */
router.get("/users/search", verifyToken, async (req, res) => {
  try {
    const { q } = req.query;

    const connection = await connectToDatabase();

    const [[user]] = await connection.query(
      `SELECT 
          u.id,
          u.title,
          u.full_name,
          u.file_number,
          u.designation,
          u.division_unit_state,
          u.gender,
          u.department_id,
          u.username,
          u.email,
          u.phone_number,
          u.created_at,
          u.updated_at,
          u.is_active,
          u.last_login,
          r.name AS role,
          d.name AS department
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
        WHERE email = ? OR file_number = ? OR phone_number = ? `,
      [q, q, q],
    );

    res.json({
      Status: true,
      user: user || null,
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
  }
});

/* ===========================
   ADMIN
=========================== */
router.get("/admins", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.execute(
      `SELECT 
          u.id,
          u.title,
          u.full_name,
          u.file_number,
          u.designation,
          u.division_unit_state,
          u.gender,
          u.department_id,
          u.username,
          u.email,
          u.phone_number,
          u.created_at,
          u.updated_at,
          u.is_active,
          u.last_login,
          r.name AS role,
          d.name AS department
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE r.name = ? ORDER BY created_at DESC `,
      ["ADMIN"],
    );

    res.json({ Status: true, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch admins" });
  }
});

router.put("/users/make-admin/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    // Get user
    const [[user]] = await connection.query(
      "SELECT * FROM users WHERE id = ?",
      [id],
    );

    if (!user) {
      return res.json({ Status: false, Error: "User not found" });
    }

    await connection.query("UPDATE users SET role_id = 2 WHERE id = ?", [id]);

    /* ================= AUDIT LOG ================= */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";

    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    await connection.query(
      `INSERT INTO audit_logs
       (user_id, session_id, action, entity_type, entity_id, description,
        ip_address, user_agent_raw, browser, os, device, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "UPDATE USER ROLE",
        "USER",
        id,
        `Changed user "${user.full_name}" role to administrator`,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );
    res.json({
      Status: true,
      Message: "User promoted to Administrator",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
  }
});

router.put("/admins/toggle-status/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    // Get current status
    const [[user]] = await connection.query(
      "SELECT full_name, is_active FROM users WHERE id = ?",
      [id],
    );

    if (!user) {
      return res.json({ Status: false, Error: "User not found" });
    }

    const newStatus = user.is_active ? 0 : 1;

    // Update
    await connection.query("UPDATE users SET is_active = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    /* ================= AUDIT LOG ================= */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";

    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    await connection.query(
      `INSERT INTO audit_logs
       (user_id, session_id, action, entity_type, entity_id, description,
        ip_address, user_agent_raw, browser, os, device, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        newStatus ? "ACTIVATE ADMIN" : "DEACTIVATE ADMIN",
        "USER",
        id,
        `${newStatus ? "Activated" : "Deactivated"} admin "${user.full_name}" account`,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: `Admin ${newStatus ? "activated" : "deactivated"} successfully`,
    });
  } catch (err) {
    console.error(err);
    return res.json({ Status: false, Error: "Failed to update status" });
  }
});

router.post("/users/create-admin", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const {
      title,
      full_name,
      gender,
      designation,
      division_unit_state,
      file_number,
      email,
      phone_number,
      username,
      password,
      department_id,
    } = req.body;

    if (!full_name || !email || !username || !password) {
      return res.json({
        Status: false,
        Error: "Required fields missing",
      });
    }

    // 🔍 CHECK EXISTING USER
    const [[existing]] = await connection.query(
      "SELECT id FROM users WHERE email = ? OR username = ? OR phone_number = ?",
      [email, username, phone_number],
    );

    if (existing) {
      return res.json({
        Status: false,
        Error: "User already exists",
      });
    }

    // 🔐 HASH PASSWORD
    const hash = await bcrypt.hash(password, 10);

    // 🧠 GET ADMIN ROLE ID
    const [[role]] = await connection.query(
      "SELECT id FROM roles WHERE name = 'ADMIN'",
    );

    if (!role) {
      return res.json({
        Status: false,
        Error: "Admin role not found",
      });
    }

    // 🆕 INSERT USER
    const [insertResult] = await connection.query(
      `INSERT INTO users
      (title, full_name, gender, designation, division_unit_state,
       file_number, email, phone_number, username, password_hash,
       department_id, role_id, is_active, is_locked, is_removed, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
      [
        title,
        full_name,
        gender,
        designation,
        division_unit_state,
        file_number,
        email,
        phone_number,
        username,
        hash,
        department_id || null,
        role.id,
        1, // active
        0, // not locked
        0, // not removed
      ],
    );

    const newUserId = insertResult.insertId;

    /* -------------------------
       AUDIT LOG
    ------------------------- */

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
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "CREATE ADMIN ACCOUNT",
        "USER",
        newUserId,
        `Create new admin user account for "${full_name}"`,
        null,
        null,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: "Admin created successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({
      Status: false,
      Error: "Server error",
    });
  }
});

router.put("/admins/reset-password/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const defaultPassword = "Admin@123"; // ✅ change if needed
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Get existing user
    const [[existingUser]] = await connection.query(
      "SELECT * FROM users WHERE id=?",
      [id],
    );

    if (!existingUser) {
      return res.json({ Status: false, Error: "User not found" });
    }

    await connection.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      hashedPassword,
      id,
    ]);

    /* ===========================
       DEVICE INFO
    =========================== */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";
    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    /* ===========================
       AUDIT LOG
    =========================== */
    await connection.query(
      `INSERT INTO audit_logs
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values, ip_address, user_agent_raw,
       browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "RESET ADMIN PASSWORD",
        "AUTH",
        id,
        `Reset ${existingUser.full_name} password to default`,
        null,
        null,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: "Password reset to default (Admin@123)",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Reset failed" });
  }
});

router.put("/admins/update/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const {
      title,
      full_name,
      gender,
      designation,
      division_unit_state,
      file_number,
      email,
      phone_number,
      username,
      department_id,
    } = req.body;

    // Get existing user
    const [[existingUser]] = await connection.query(
      "SELECT * FROM users WHERE id=?",
      [id],
    );

    if (!existingUser) {
      return res.json({ Status: false, Error: "User not found" });
    }

    /* -------------------------
       DETECT CHANGES
    ------------------------- */

    const detectChanges = (oldObj, newObj) => {
      let changes = [];
      let oldValues = {};
      let newValues = {};

      Object.keys(newObj).forEach((key) => {
        if (oldObj[key] !== newObj[key]) {
          changes.push(key);
          oldValues[key] = oldObj[key];
          newValues[key] = newObj[key];
        }
      });

      return { changes, oldValues, newValues };
    };

    const { changes, oldValues, newValues } = detectChanges(existingUser, {
      title,
      full_name,
      gender,
      designation,
      division_unit_state,
      file_number,
      email,
      phone_number,
      username,
      department_id,
    });

    if (changes.length === 0) {
      return res.json({
        Status: false,
        Error: "No changes detected",
      });
    }

    await connection.query(
      `
      UPDATE users SET
        title = ?,
        full_name = ?,
        gender = ?,
        designation = ?,
        division_unit_state = ?,
        file_number = ?,
        email = ?,
        phone_number = ?,
        username = ?,
        department_id = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        title,
        full_name,
        gender,
        designation,
        division_unit_state,
        file_number,
        email,
        phone_number,
        username,
        department_id,
        id,
      ],
    );

    /* -------------------------
       AUDIT LOG
    ------------------------- */

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
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "UPDATE ADMIN ACCOUNT",
        "USER",
        id,
        `Update "${existingUser.full_name}" profile fields: ${changes.join(", ")}`,
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    res.json({
      Status: true,
      Message: "Admin updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Update failed" });
  }
});

/* ===========================
   FOCAL PERSON
=========================== */
router.get("/focalperson", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.execute(
      `SELECT 
          u.id,
          u.title,
          u.full_name,
          u.file_number,
          u.designation,
          u.division_unit_state,
          u.gender,
          u.department_id,
          u.username,
          u.email,
          u.phone_number,
          u.created_at,
          u.updated_at,
          u.is_active,
          u.last_login,
          r.name AS role,
          d.name AS department
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE r.name = ? ORDER BY created_at DESC `,
      ["FOCAL_PERSON"],
    );

    res.json({ Status: true, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch admins" });
  }
});

router.put("/users/make-focalperson/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    // Get user
    const [[user]] = await connection.query(
      "SELECT * FROM users WHERE id = ?",
      [id],
    );

    if (!user) {
      return res.json({ Status: false, Error: "User not found" });
    }

    await connection.query("UPDATE users SET role_id = 3 WHERE id = ?", [id]);

    /* ================= AUDIT LOG ================= */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";

    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    await connection.query(
      `INSERT INTO audit_logs
       (user_id, session_id, action, entity_type, entity_id, description,
        ip_address, user_agent_raw, browser, os, device, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "UPDATE USER ROLE",
        "USER",
        id,
        `Changed user "${user.full_name}" role to focal person`,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    res.json({
      Status: true,
      Message: "User promoted to department/zone focal person",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
  }
});

router.put("/focalperson/toggle-status/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    // Get current status
    const [[user]] = await connection.query(
      "SELECT full_name, is_active FROM users WHERE id = ?",
      [id],
    );

    if (!user) {
      return res.json({ Status: false, Error: "User not found" });
    }

    const newStatus = user.is_active ? 0 : 1;

    // Update
    await connection.query("UPDATE users SET is_active = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    /* ================= AUDIT LOG ================= */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";

    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    await connection.query(
      `INSERT INTO audit_logs
       (user_id, session_id, action, entity_type, entity_id, description,
        ip_address, user_agent_raw, browser, os, device, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        newStatus ? "ACTIVATE FOCAL PERSON" : "DEACTIVATE FOCAL PERSON",
        "USER",
        id,
        `${newStatus ? "Activated" : "Deactivated"} focal person "${user.full_name}" account`,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: `Focal person ${newStatus ? "activated" : "deactivated"} successfully`,
    });
  } catch (err) {
    console.error(err);
    return res.json({ Status: false, Error: "Failed to update status" });
  }
});

router.post("/users/create-focalperson", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const {
      title,
      full_name,
      gender,
      designation,
      division_unit_state,
      file_number,
      email,
      phone_number,
      username,
      password,
      department_id,
    } = req.body;

    if (!full_name || !email || !username || !password) {
      return res.json({
        Status: false,
        Error: "Required fields missing",
      });
    }

    // 🔍 CHECK EXISTING USER
    const [[existing]] = await connection.query(
      "SELECT id FROM users WHERE email = ? OR username = ? OR phone_number = ?",
      [email, username, phone_number],
    );

    if (existing) {
      return res.json({
        Status: false,
        Error: "User already exists",
      });
    }

    // 🔐 HASH PASSWORD
    const hash = await bcrypt.hash(password, 10);

    // 🧠 GET ADMIN ROLE ID
    const [[role]] = await connection.query(
      "SELECT id FROM roles WHERE name = 'FOCAL_PERSON'",
    );

    if (!role) {
      return res.json({
        Status: false,
        Error: "Admin role not found",
      });
    }

    // 🆕 INSERT USER
    const [insertResult] = await connection.query(
      `INSERT INTO users
      (title, full_name, gender, designation, division_unit_state,
       file_number, email, phone_number, username, password_hash,
       department_id, role_id, is_active, is_locked, is_removed, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
      [
        title,
        full_name,
        gender,
        designation,
        division_unit_state,
        file_number,
        email,
        phone_number,
        username,
        hash,
        department_id || null,
        role.id,
        1, // active
        0, // not locked
        0, // not removed
      ],
    );

    const newUserId = insertResult.insertId;

    /* -------------------------
       AUDIT LOG
    ------------------------- */

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
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "CREATE FOCAL PERSON ACCOUNT",
        "USER",
        newUserId,
        `Create new focal person user account for "${full_name}"`,
        null,
        null,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: "Focal person created successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({
      Status: false,
      Error: "Server error",
    });
  }
});

router.put("/focalperson/reset-password/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const defaultPassword = "FP@123"; // ✅ change if needed
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Get existing user
    const [[existingUser]] = await connection.query(
      "SELECT * FROM users WHERE id=?",
      [id],
    );

    if (!existingUser) {
      return res.json({ Status: false, Error: "User not found" });
    }

    await connection.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      hashedPassword,
      id,
    ]);

    /* ===========================
       DEVICE INFO
    =========================== */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";
    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    /* ===========================
       AUDIT LOG
    =========================== */
    await connection.query(
      `INSERT INTO audit_logs
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values, ip_address, user_agent_raw,
       browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "RESET FOCAL PERSON PASSWORD",
        "AUTH",
        id,
        `Reset ${existingUser.full_name} password to default`,
        null,
        null,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: "Password reset to default (FP@123)",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Reset failed" });
  }
});

router.put("/focalperson/update/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const {
      title,
      full_name,
      gender,
      designation,
      division_unit_state,
      file_number,
      email,
      phone_number,
      username,
      department_id,
    } = req.body;

    // Get existing user
    const [[existingUser]] = await connection.query(
      "SELECT * FROM users WHERE id=?",
      [id],
    );

    if (!existingUser) {
      return res.json({ Status: false, Error: "User not found" });
    }

    /* -------------------------
       DETECT CHANGES
    ------------------------- */

    const detectChanges = (oldObj, newObj) => {
      let changes = [];
      let oldValues = {};
      let newValues = {};

      Object.keys(newObj).forEach((key) => {
        if (oldObj[key] !== newObj[key]) {
          changes.push(key);
          oldValues[key] = oldObj[key];
          newValues[key] = newObj[key];
        }
      });

      return { changes, oldValues, newValues };
    };

    const { changes, oldValues, newValues } = detectChanges(existingUser, {
      title,
      full_name,
      gender,
      designation,
      division_unit_state,
      file_number,
      email,
      phone_number,
      username,
      department_id,
    });

    if (changes.length === 0) {
      return res.json({
        Status: false,
        Error: "No changes detected",
      });
    }

    await connection.query(
      `
      UPDATE users SET
        title = ?,
        full_name = ?,
        gender = ?,
        designation = ?,
        division_unit_state = ?,
        file_number = ?,
        email = ?,
        phone_number = ?,
        username = ?,
        department_id = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        title,
        full_name,
        gender,
        designation,
        division_unit_state,
        file_number,
        email,
        phone_number,
        username,
        department_id,
        id,
      ],
    );

    /* -------------------------
       AUDIT LOG
    ------------------------- */

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
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "UPDATE FOCAL PERSON ACCOUNT",
        "USER",
        id,
        `Update focal person "${existingUser.full_name}" profile fields: ${changes.join(", ")}`,
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    res.json({
      Status: true,
      Message: "Focal person updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Update failed" });
  }
});

/* ===========================
   STAFF
=========================== */
router.get("/staff", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.execute(
      `SELECT 
          u.id,
          u.title,
          u.full_name,
          u.file_number,
          u.designation,
          u.division_unit_state,
          u.gender,
          u.department_id,
          u.username,
          u.email,
          u.phone_number,
          u.created_at,
          u.updated_at,
          u.is_active,
          u.last_login,
          r.name AS role,
          d.name AS department
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE r.name = ? ORDER BY created_at DESC `,
      ["STAFF"],
    );

    res.json({ Status: true, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch admins" });
  }
});

router.put("/users/make-staff/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    // Get user
    const [[user]] = await connection.query(
      "SELECT * FROM users WHERE id = ?",
      [id],
    );

    if (!user) {
      return res.json({ Status: false, Error: "User not found" });
    }

    await connection.query("UPDATE users SET role_id = 4 WHERE id = ?", [id]);

    /* ================= AUDIT LOG ================= */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";

    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    await connection.query(
      `INSERT INTO audit_logs
       (user_id, session_id, action, entity_type, entity_id, description,
        ip_address, user_agent_raw, browser, os, device, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "UPDATE USER ROLE",
        "USER",
        id,
        `Changed user "${user.full_name}" role to staff`,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    res.json({
      Status: true,
      Message: "User updated to staff",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
  }
});

router.put("/staff/toggle-status/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    // Get current status
    const [[user]] = await connection.query(
      "SELECT full_name, is_active FROM users WHERE id = ?",
      [id],
    );

    if (!user) {
      return res.json({ Status: false, Error: "User not found" });
    }

    const newStatus = user.is_active ? 0 : 1;

    // Update
    await connection.query("UPDATE users SET is_active = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    /* ================= AUDIT LOG ================= */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";

    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    await connection.query(
      `INSERT INTO audit_logs
       (user_id, session_id, action, entity_type, entity_id, description,
        ip_address, user_agent_raw, browser, os, device, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        newStatus ? "ACTIVATE USER" : "DEACTIVATE USER",
        "USER",
        id,
        `${newStatus ? "Activated" : "Deactivated"} user "${user.full_name}" account`,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: `Staff ${newStatus ? "activated" : "deactivated"} successfully`,
    });
  } catch (err) {
    console.error(err);
    return res.json({ Status: false, Error: "Failed to update status" });
  }
});

router.post("/users/create-staff", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const {
      title,
      full_name,
      gender,
      designation,
      division_unit_state,
      file_number,
      email,
      phone_number,
      username,
      password,
      department_id,
    } = req.body;

    if (!full_name || !email || !username || !password) {
      return res.json({
        Status: false,
        Error: "Required fields missing",
      });
    }

    // 🔍 CHECK EXISTING USER
    const [[existing]] = await connection.query(
      "SELECT id FROM users WHERE email = ? OR username = ? OR phone_number = ?",
      [email, username, phone_number],
    );

    if (existing) {
      return res.json({
        Status: false,
        Error: "User already exists",
      });
    }

    // 🔐 HASH PASSWORD
    const hash = await bcrypt.hash(password, 10);

    // 🧠 GET ADMIN ROLE ID
    const [[role]] = await connection.query(
      "SELECT id FROM roles WHERE name = 'STAFF'",
    );

    if (!role) {
      return res.json({
        Status: false,
        Error: "Admin role not found",
      });
    }

    // 🆕 INSERT USER
    const [insertResult] = await connection.query(
      `INSERT INTO users
      (title, full_name, gender, designation, division_unit_state,
       file_number, email, phone_number, username, password_hash,
       department_id, role_id, is_active, is_locked, is_removed, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
      [
        title,
        full_name,
        gender,
        designation,
        division_unit_state,
        file_number,
        email,
        phone_number,
        username,
        hash,
        department_id || null,
        role.id,
        1, // active
        0, // not locked
        0, // not removed
      ],
    );

    const newUserId = insertResult.insertId;

    /* -------------------------
       AUDIT LOG
    ------------------------- */

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
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "CREATE USER ACCOUNT",
        "USER",
        newUserId,
        `Create new user account for "${full_name}"`,
        null,
        null,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: "Staff created successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({
      Status: false,
      Error: "Server error",
    });
  }
});

router.put("/staff/reset-password/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const defaultPassword = "123456789@"; // ✅ change if needed
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Get existing user
    const [[existingUser]] = await connection.query(
      "SELECT * FROM users WHERE id=?",
      [id],
    );

    if (!existingUser) {
      return res.json({ Status: false, Error: "User not found" });
    }

    await connection.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      hashedPassword,
      id,
    ]);

    /* ===========================
       DEVICE INFO
    =========================== */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";
    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    /* ===========================
       AUDIT LOG
    =========================== */
    await connection.query(
      `INSERT INTO audit_logs
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values, ip_address, user_agent_raw,
       browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "RESET USER PASSWORD",
        "AUTH",
        id,
        `Reset ${existingUser.full_name} password to default`,
        null,
        null,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: "Password reset to default (123456789@)",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Reset failed" });
  }
});

router.put("/staff/update/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const {
      title,
      full_name,
      gender,
      designation,
      division_unit_state,
      file_number,
      email,
      phone_number,
      username,
      department_id,
    } = req.body;

    // Get existing user
    const [[existingUser]] = await connection.query(
      "SELECT * FROM users WHERE id=?",
      [id],
    );

    if (!existingUser) {
      return res.json({ Status: false, Error: "User not found" });
    }

    /* -------------------------
       DETECT CHANGES
    ------------------------- */

    const detectChanges = (oldObj, newObj) => {
      let changes = [];
      let oldValues = {};
      let newValues = {};

      Object.keys(newObj).forEach((key) => {
        if (oldObj[key] !== newObj[key]) {
          changes.push(key);
          oldValues[key] = oldObj[key];
          newValues[key] = newObj[key];
        }
      });

      return { changes, oldValues, newValues };
    };

    const { changes, oldValues, newValues } = detectChanges(existingUser, {
      title,
      full_name,
      gender,
      designation,
      division_unit_state,
      file_number,
      email,
      phone_number,
      username,
      department_id,
    });

    if (changes.length === 0) {
      return res.json({
        Status: false,
        Error: "No changes detected",
      });
    }

    await connection.query(
      `
      UPDATE users SET
        title = ?,
        full_name = ?,
        gender = ?,
        designation = ?,
        division_unit_state = ?,
        file_number = ?,
        email = ?,
        phone_number = ?,
        username = ?,
        department_id = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        title,
        full_name,
        gender,
        designation,
        division_unit_state,
        file_number,
        email,
        phone_number,
        username,
        department_id,
        id,
      ],
    );

    /* -------------------------
       AUDIT LOG
    ------------------------- */

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
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "UPDATE USER ACCOUNT",
        "USER",
        id,
        `Update "${existingUser.full_name}" profile fields: ${changes.join(", ")}`,
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    res.json({
      Status: true,
      Message: "staff updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Update failed" });
  }
});

/* ===========================
   PARTNER
=========================== */
router.get("/partners", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.execute(
      `SELECT 
          u.id,
          u.title,
          u.full_name,
          u.file_number,
          u.designation,
          u.division_unit_state,
          u.gender,
          u.department_id,
          u.username,
          u.email,
          u.phone_number,
          u.created_at,
          u.updated_at,
          u.is_active,
          u.last_login,
          r.name AS role,
          d.name AS department
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE r.name = ? ORDER BY created_at DESC `,
      ["PARTNER"],
    );

    res.json({ Status: true, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch admins" });
  }
});

router.put("/partner/toggle-status/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    // Get current status
    const [[user]] = await connection.query(
      "SELECT full_name, is_active FROM users WHERE id = ?",
      [id],
    );

    if (!user) {
      return res.json({ Status: false, Error: "User not found" });
    }

    const newStatus = user.is_active ? 0 : 1;

    // Update
    await connection.query("UPDATE users SET is_active = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    /* ================= AUDIT LOG ================= */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";

    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    await connection.query(
      `INSERT INTO audit_logs
       (user_id, session_id, action, entity_type, entity_id, description,
        ip_address, user_agent_raw, browser, os, device, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        newStatus ? "ACTIVATE PARTNER" : "DEACTIVATE PARTNER",
        "USER",
        id,
        `${newStatus ? "Activated" : "Deactivated"} partner "${user.full_name}" account`,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: `Staff ${newStatus ? "activated" : "deactivated"} successfully`,
    });
  } catch (err) {
    console.error(err);
    return res.json({ Status: false, Error: "Failed to update status" });
  }
});

router.post("/users/create-partner", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const { full_name, division_unit_state, email, phone_number } = req.body;

    if (!full_name || !email || !division_unit_state || !phone_number) {
      return res.json({
        Status: false,
        Error: "Required fields missing",
      });
    }

    // 🔍 CHECK EXISTING USER
    const [[existing]] = await connection.query(
      "SELECT id FROM users WHERE email = ? OR phone_number = ?",
      [email, phone_number],
    );

    if (existing) {
      return res.json({
        Status: false,
        Error: "User already exists",
      });
    }

    // 🔐 HASH PASSWORD
    const password = "Partner@123";
    const hash = await bcrypt.hash(password, 10);

    // 🧠 GET ADMIN ROLE ID
    const [[role]] = await connection.query(
      "SELECT id FROM roles WHERE name = 'PARTNER'",
    );

    if (!role) {
      return res.json({
        Status: false,
        Error: "partner role not found",
      });
    }

    // 🆕 INSERT USER
    const [insertResult] = await connection.query(
      `INSERT INTO users
      (title, full_name, gender, designation, division_unit_state,
       file_number, email, phone_number, username, password_hash,
       department_id, role_id, is_active, is_locked, is_removed, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
      [
        "Partner",
        full_name,
        "None",
        "Partner",
        division_unit_state,
        null,
        email,
        phone_number,
        email,
        hash,
        7,
        role.id,
        1, // active
        0, // not locked
        0, // not removed
      ],
    );

    const newUserId = insertResult.insertId;

    /* -------------------------
       AUDIT LOG
    ------------------------- */

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
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "CREATE PARTNER ACCOUNT",
        "USER",
        newUserId,
        `Create new partner account for "${full_name}"`,
        null,
        JSON.stringify({
          full_name: full_name,
          email,
          division_unit_state: division_unit_state,
          phone_number: phone_number,
        }),
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: "Partner account created successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({
      Status: false,
      Error: "Server error",
    });
  }
});

router.put("/partner/reset-password/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const defaultPassword = "Partner@123"; // ✅ change if needed
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Get existing user
    const [[existingUser]] = await connection.query(
      "SELECT * FROM users WHERE id=?",
      [id],
    );

    if (!existingUser) {
      return res.json({ Status: false, Error: "User not found" });
    }

    await connection.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      hashedPassword,
      id,
    ]);

    /* ===========================
       DEVICE INFO
    =========================== */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";
    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    /* ===========================
       AUDIT LOG
    =========================== */
    await connection.query(
      `INSERT INTO audit_logs
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values, ip_address, user_agent_raw,
       browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "RESET PARTNER PASSWORD",
        "AUTH",
        id,
        `Reset ${existingUser.full_name} password to default`,
        null,
        null,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    return res.json({
      Status: true,
      Message: "Password reset to default (Partner@123)",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Reset failed" });
  }
});

router.put("/partner/update/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const { full_name, division_unit_state, email, phone_number } = req.body;

    // Get existing user
    const [[existingUser]] = await connection.query(
      "SELECT * FROM users WHERE id=?",
      [id],
    );

    if (!existingUser) {
      return res.json({ Status: false, Error: "User not found" });
    }

    /* -------------------------
       DETECT CHANGES
    ------------------------- */

    const detectChanges = (oldObj, newObj) => {
      let changes = [];
      let oldValues = {};
      let newValues = {};

      Object.keys(newObj).forEach((key) => {
        if (oldObj[key] !== newObj[key]) {
          changes.push(key);
          oldValues[key] = oldObj[key];
          newValues[key] = newObj[key];
        }
      });

      return { changes, oldValues, newValues };
    };

    const { changes, oldValues, newValues } = detectChanges(existingUser, {
      full_name,
      division_unit_state,
      email,
      phone_number,
    });

    if (changes.length === 0) {
      return res.json({
        Status: false,
        Error: "No changes detected",
      });
    }

    await connection.query(
      `
      UPDATE users SET
        full_name = ?,
        division_unit_state = ?,
        email = ?,
        phone_number = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [full_name, division_unit_state, email, phone_number, id],
    );

    /* -------------------------
       AUDIT LOG
    ------------------------- */

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
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "UPDATE PARTNER ACCOUNT",
        "USER",
        id,
        `Update "${existingUser.full_name}" profile fields: ${changes.join(", ")}`,
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    res.json({
      Status: true,
      Message: "Partner updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Update failed" });
  }
});

/* ===========================
   DEPARTMENT
=========================== */

/* ================= CREATE ================= */
router.post("/departments/create", verifyToken, async (req, res) => {
  const { name, name_abbreviation } = req.body;
  const adminId = req.user.id;
  const sessionId = req.user.session_id;

  if (!name) {
    return res.json({ Status: false, Error: "Department name required" });
  }

  try {
    const connection = await connectToDatabase();

    // check duplicate
    const [exist] = await connection.query(
      "SELECT id FROM departments WHERE name = ?",
      [name],
    );

    if (exist.length > 0) {
      return res.json({ Status: false, Error: "Department already exists" });
    }

    const [insertResult] = await connection.query(
      `INSERT INTO departments (name, name_abbreviation, created_at)
       VALUES (?, ?, NOW())`,
      [name, name_abbreviation],
    );

    const newDeptId = insertResult.insertId;

    /* -------------------------
       AUDIT LOG
    ------------------------- */

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
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "ADD DEPARTMENT",
        "DEPARTMENT",
        newDeptId,
        `Add new department to the system "${name}"`,
        null,
        JSON.stringify({
          Department: name,
          Abbreviation: name_abbreviation,
        }),
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    res.json({ Status: true, Message: "Department created successfully" });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to create department" });
  }
});

/* ================= UPDATE ================= */
router.put("/departments/update/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, name_abbreviation } = req.body;
  const adminId = req.user.id;
  const sessionId = req.user.session_id;

  try {
    const connection = await connectToDatabase();

    // Get existing department
    const [[existingDept]] = await connection.query(
      "SELECT * FROM departments WHERE id=?",
      [id],
    );

    if (!existingDept) {
      return res.json({ Status: false, Error: "Department not found" });
    }

    /* -------------------------
       DETECT CHANGES
    ------------------------- */

    const detectChanges = (oldObj, newObj) => {
      let changes = [];
      let oldValues = {};
      let newValues = {};

      Object.keys(newObj).forEach((key) => {
        if (oldObj[key] !== newObj[key]) {
          changes.push(key);
          oldValues[key] = oldObj[key];
          newValues[key] = newObj[key];
        }
      });

      return { changes, oldValues, newValues };
    };

    const { changes, oldValues, newValues } = detectChanges(existingDept, {
      name,
      name_abbreviation,
    });

    if (changes.length === 0) {
      return res.json({
        Status: false,
        Error: "No changes detected",
      });
    }

    await connection.query(
      `UPDATE departments
       SET name = ?, name_abbreviation = ?
       WHERE id = ?`,
      [name, name_abbreviation, id],
    );

    /* -------------------------
       AUDIT LOG
    ------------------------- */

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
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "UPDATE DEPARTMENT",
        "DEPARTMENT",
        id,
        `Updated department fields: ${changes.join(", ")}`,
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    res.json({ Status: true, Message: "Department updated successfully" });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Update failed" });
  }
});

/* ===========================
   TICKETS
=========================== */
router.get("/tickets", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;

    let where = "";
    let params = [];

    if (status && status !== "All") {
      where = "WHERE t.status = ?";
      params.push(status);
    }

    // total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM support_tickets t ${where}`,
      params,
    );

    const total = countResult[0].total;

    // fetch data
    const [rows] = await connection.query(
      `
      SELECT t.*, u.full_name, u.email, u.phone_number
      FROM support_tickets t
      JOIN users u ON u.id = t.user_id
      ${where}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...params, Number(limit), Number(offset)],
    );

    res.json({
      Status: true,
      Data: rows,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
  }
});

router.put("/tickets/update-status/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const connection = await connectToDatabase();

    // Get existing ticket
    const [[existingTicket]] = await connection.query(
      "SELECT * FROM support_tickets WHERE id=?",
      [id],
    );

    if (!existingTicket) {
      return res.json({ Status: false, Error: "Ticket not found" });
    }

    /* -------------------------
       DETECT CHANGES
    ------------------------- */

    const detectChanges = (oldObj, newObj) => {
      let changes = [];
      let oldValues = {};
      let newValues = {};

      Object.keys(newObj).forEach((key) => {
        if (oldObj[key] !== newObj[key]) {
          changes.push(key);
          oldValues[key] = oldObj[key];
          newValues[key] = newObj[key];
        }
      });

      return { changes, oldValues, newValues };
    };

    const { changes, oldValues, newValues } = detectChanges(existingTicket, {
      status,
    });

    if (changes.length === 0) {
      return res.json({
        Status: false,
        Error: "No changes detected",
      });
    }

    await connection.query(
      `UPDATE support_tickets SET status=?, updated_at=NOW() WHERE id=?`,
      [status, id],
    );

    /* -------------------------
       AUDIT LOG
    ------------------------- */
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
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "UPDATE TICKET STATUS",
        "TICKET",
        id,
        `Update support ticket #${existingTicket.ticket_number}: ${changes.join(", ")}`,
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    res.json({
      Status: true,
      Message: "Ticket updated successfully",
    });
  } catch (err) {
    res.json({ Status: false, Error: "Update failed" });
  }
});

/* ===========================
   SUPPORT CONTACT
=========================== */
router.get("/support-contacts", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.query(
      `SELECT * FROM system_support_contacts ORDER BY id`,
    );

    res.json({ Status: true, Data: rows });
  } catch (err) {
    res.json({ Status: false, Error: err.message });
  }
});

router.put("/support-contacts/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      type,
      title,
      subtitle,
      name,
      email,
      phone,
      extra_info,
      color,
      initials,
    } = req.body;

    const connection = await connectToDatabase();

    /* ================= VALIDATION ================= */
    if (!type || !title) {
      return res.json({
        Status: false,
        Error: "Type and Title are required",
      });
    }

    /* ================= CHECK EXIST ================= */
    const [existing] = await connection.query(
      `SELECT * FROM system_support_contacts WHERE id = ?`,
      [id],
    );

    if (existing.length === 0) {
      return res.json({
        Status: false,
        Error: "Contact not found",
      });
    }

    /* ================= UPDATE ================= */
    await connection.query(
      `
      UPDATE system_support_contacts
      SET
        type = ?,
        title = ?,
        subtitle = ?,
        name = ?,
        email = ?,
        phone = ?,
        extra_info = ?,
        color = ?,
        initials = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        type,
        title,
        subtitle,
        name,
        email,
        phone,
        extra_info,
        color,
        initials,
        id,
      ],
    );

    res.json({
      Status: true,
      Message: "Contact updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({
      Status: false,
      Error: "Update failed",
    });
  }
});

/* ===========================
   DASHBOARD 
=========================== */
router.get("/dashboard-metrics", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    /* ================= DOCUMENT COUNT PER DEPARTMENT ================= */
    const [docCountDept] = await connection.query(`
      SELECT dpt.name_abbreviation, COUNT(doc.id) as total
      FROM departments dpt
      LEFT JOIN documents doc ON doc.department_id = dpt.id
      WHERE dpt.name_abbreviation != 'Partner'
      GROUP BY dpt.id
    `);

    /* ================= UPLOAD ACTIVITY ================= */
    const [uploadActivity] = await connection.query(`
      SELECT dpt.name_abbreviation, COUNT(doc.id) as uploads
      FROM documents doc
      JOIN departments dpt ON doc.department_id = dpt.id
      WHERE doc.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY dpt.id
    `);
    

  
    /* ================= STORAGE USED ================= */
    const [[storage]] = await connection.query(`
      SELECT 
        COALESCE(SUM(file_size), 0) AS totalStorage
      FROM document_versions
    `);

    const usedStorageBytes = Number(storage?.totalStorage || 0);

    /* ================= STORAGE ALLOCATION ================= */
    const [[storageAllocation]] = await connection.query(`
      SELECT allocated_storage_mb
      FROM system_storage_settings
      LIMIT 1
    `);

    const allocatedStorageMB =
      Number(storageAllocation?.allocated_storage_mb || 0);

    const allocatedStorageGB =
      allocatedStorageMB / 1024;

    const allocatedStorageTB =
      allocatedStorageMB / (1024 * 1024);

    /* ================= CONVERSIONS ================= */
    const usedStorageGB =
      usedStorageBytes / (1024 * 1024 * 1024);

    const availableStorageGB =
      allocatedStorageGB - usedStorageGB;

    const utilizationPercentage =
      allocatedStorageGB > 0
        ? (usedStorageGB / allocatedStorageGB) * 100
        : 0;

    /* ================= TOTAL DOCUMENTS ================= */
    const [[totalDocument]] = await connection.query(`
      SELECT COUNT(*) as total FROM documents
    `);

    /* ================= TOTAL DOCUMENTS ARCHIVED AND DELETED ================= */
    const [[totalDocumentArchivedDeleted]] = await connection.query(`
      SELECT COUNT(*) as total FROM documents WHERE document_status IN ('Archived','Deleted')
    `);

    /* ================= STORAGE USED PER DEPARTMENT ================= */
    const [storageByDept] = await connection.query(`
      SELECT dpt.name_abbreviation, SUM(dv.file_size) as size
      FROM document_versions dv
      JOIN documents d ON dv.document_id = d.id
      JOIN departments dpt ON d.department_id = dpt.id
      GROUP BY dpt.id
    `);

    /* ================= ACTIVE USERS ================= 
    const [usersByDept] = await connection.query(`
      SELECT dpt.name_abbreviation, COUNT(u.id) as total
      FROM users u
      JOIN departments dpt ON u.department_id = dpt.id
      WHERE u.is_active = 1
      GROUP BY dpt.id
    `);
    */

    /* ================= ACTIVE USERS ================= */
    const [usersByDept] = await connection.query(`
  SELECT 
    dpt.name_abbreviation,
    COUNT(u.id) AS total
  FROM departments dpt
  LEFT JOIN users u 
    ON u.department_id = dpt.id 
   AND u.is_active = 1
  GROUP BY dpt.id, dpt.name_abbreviation
  ORDER BY dpt.name_abbreviation ASC
`);

    const [[totalUsers]] = await connection.query(`
      SELECT COUNT(*) as total FROM users WHERE is_active = 1
    `);

    const [[totalActivePartners]] = await connection.query(`
      SELECT COUNT(*) as total FROM users WHERE is_active = 1 AND role_id = 5
    `);

    /* ================= TOP DOWNLOADS ================= */
    const [topDocs] = await connection.query(`
      SELECT d.title, COUNT(dl.id) as downloads
      FROM download_logs dl
      JOIN documents d ON d.id = dl.document_id
      GROUP BY d.id
      ORDER BY downloads DESC
      LIMIT 5
    `);

    /* ================= EXPIRING DOCUMENTS (2 WEEKS WINDOW) ================= */
    const [expiringDocs] = await connection.query(`
  SELECT title, retention_expiry_date
  FROM documents
  WHERE retention_expiry_date IS NOT NULL
    AND retention_expiry_date >= CURDATE()               -- ❌ exclude expired
    AND retention_expiry_date <= DATE_ADD(CURDATE(), INTERVAL 14 DAY) -- ✅ next 14 days only
  ORDER BY retention_expiry_date ASC
`);

    /* ================= PENDING REQUESTS ================= */
    const [[pendingRequests]] = await connection.query(`
      SELECT COUNT(*) as total FROM document_access_requests WHERE status = 'Pending_Admin_Approval'
    `);

    /* ================= DOCUMENT BY CLASSIFICATION ================= */
    const [documentByClassification] = await connection.query(`
      SELECT 
        c.classification,
        COUNT(d.id) AS total
      FROM (
        SELECT 'Public' AS classification
        UNION ALL SELECT 'Internal'
        UNION ALL SELECT 'Confidential'
        UNION ALL SELECT 'Restricted'
      ) c
      LEFT JOIN documents d 
        ON d.classification = c.classification
      AND d.is_delete = 0
      AND d.is_archived = 0
      GROUP BY c.classification
    `);

    /* ================= SUPPORT TICKETS ================= */
    const [[ticketSummary]] = await connection.query(`
  SELECT 
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open,
    SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
    SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) AS closed,
    SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inprogress
  FROM support_tickets
`);

    /* ================= TICKET STATUS BREAKDOWN ================= */
    const [ticketStatusBreakdown] = await connection.query(`
  SELECT status, COUNT(*) as total
  FROM support_tickets
  GROUP BY status
`);

    res.json({
      Status: true,
      Data: {
        docCountDept,
        uploadActivity,
        storage,
        storageByDept,
        usersByDept,
        totalUsers,
        totalActivePartners,
        totalDocument,
        totalDocumentArchivedDeleted,
        documentByClassification,
        topDocs,
        expiringDocs,
        pendingRequests,
        ticketSummary,
        ticketStatusBreakdown,
        storageAllocation: {
          allocatedStorageMB,
          allocatedStorageGB,
          allocatedStorageTB,

          usedStorageGB,
          availableStorageGB,

          utilizationPercentage,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
  }
});

/* ===========================
   OPEN SUPPORT TICKET NOTIFICATION
=========================== */
router.get("/ticket-notification/open", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.query(`
        SELECT 
          st.id,
          st.subject,
          st.description,
          st.status,
          st.created_at,
          st.ticket_number,

          u.full_name,
          u.email,
          u.department_id

        FROM support_tickets st
        LEFT JOIN users u ON st.user_id = u.id

        WHERE st.status = 'Open'
        ORDER BY st.created_at DESC
      `);

    res.json({
      Status: true,
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});

/* ===========================
   SYSTEM STORAGE ALLOCATION
=========================== */
router.get("/storage-dashboard", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    /* ================= STORAGE SETTING ================= */

    const [[setting]] = await connection.query(`
        SELECT allocated_storage_mb
        FROM system_storage_settings
        LIMIT 1
      `);

    /* ================= STORAGE USAGE ================= */

    const [[usage]] = await connection.query(`
        SELECT
          COUNT(*) AS total_documents,
          COALESCE(SUM(dv.file_size),0) AS total_bytes,
          COALESCE(AVG(dv.file_size),0) AS avg_file_size
        FROM documents d
        INNER JOIN document_versions dv
          ON dv.id = d.current_version_id
      `);

    /* ================= LARGEST FILE ================= */

    const [[largestFile]] = await connection.query(`
        SELECT
          d.title,
          d.document_code,
          dv.file_name,
          dv.file_size
        FROM documents d
        INNER JOIN document_versions dv
          ON dv.id = d.current_version_id
        ORDER BY dv.file_size DESC
        LIMIT 1
      `);

    /* ================= STORAGE BY DEPARTMENT ================= */

    const [departments] = await connection.query(`
  SELECT
    dep.name AS department_name,

    COUNT(d.id) AS total_documents,

    COALESCE(
      SUM(dv.file_size),
      0
    ) AS storage_used

  FROM departments dep

  LEFT JOIN documents d
    ON d.department_id = dep.id

  LEFT JOIN document_versions dv
    ON dv.id = d.current_version_id

  WHERE dep.name <> 'Partner'

  GROUP BY dep.id, dep.name

  ORDER BY storage_used DESC
`);

    /* ================= DOCUMENT STATUS BREAKDOWN ================= */

    const [statusBreakdown] = await connection.query(`
        SELECT
          document_status,
          COUNT(*) total
        FROM documents
        GROUP BY document_status
      `);

    /* ================= ARCHIVED DOCUMENTS ================= */

    const [[archivedStats]] = await connection.query(`
        SELECT
          COUNT(*) archived_documents
        FROM documents
        WHERE is_archived = 1
      `);

    /* ================= DELETE FLAGGED ================= */

    const [[deleteStats]] = await connection.query(`
        SELECT
          COUNT(*) delete_flagged_documents
        FROM documents
        WHERE is_delete_flagged = 1
      `);

    /* ================= CALCULATIONS ================= */

    const allocatedMB = Number(setting?.allocated_storage_mb || 0);

    const allocatedBytes = allocatedMB * 1024 * 1024;

    const usedBytes = Number(usage.total_bytes || 0);

    const availableBytes = Math.max(allocatedBytes - usedBytes, 0);

    const utilization =
      allocatedBytes > 0 ? ((usedBytes / allocatedBytes) * 100).toFixed(2) : 0;

    /* ================= RESPONSE ================= */

    res.json({
      Status: true,

      Data: {
        allocatedMB,

        usedBytes,

        availableBytes,

        utilization,

        totalDocuments: usage.total_documents,

        avgFileSize: usage.avg_file_size,

        largestFile,

        departments,

        statusBreakdown,

        archivedDocuments: archivedStats.archived_documents,

        deleteFlaggedDocuments: deleteStats.delete_flagged_documents,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      Status: false,
      Error: "Failed to load storage analytics",
    });
  }
});

router.put("/storage-dashboard", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { allocated_storage_mb } = req.body;

    await connection.query(
      `
        UPDATE system_storage_settings
        SET
          allocated_storage_mb=?,
          updated_by=?
        WHERE id=1
        `,
      [allocated_storage_mb, req.user.id],
    );

    res.json({
      Status: true,
    });
  } catch (err) {
    console.error(err);

    res.json({
      Status: false,
    });
  }
});

/* ===========================
   AUDIT TRAIT
=========================== */
router.get("/audit-actions", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [actions] = await connection.query(`
      SELECT DISTINCT action FROM audit_logs ORDER BY action ASC
    `);

    res.json({ Status: true, Data: actions });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
  }
});

router.get("/audit-logs", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { user_id, action, entity_type, document_code, from_date, to_date } =
      req.query;

    let query = `
      SELECT al.*, u.full_name, d.document_code
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.user_id
      LEFT JOIN documents d ON d.id = al.entity_id AND al.entity_type = 'DOCUMENT'
      WHERE 1=1
    `;

    const params = [];

    if (user_id) {
      query += " AND al.user_id = ?";
      params.push(user_id);
    }

    if (action) {
      query += " AND al.action = ?";
      params.push(action);
    }

    if (entity_type) {
      query += " AND al.entity_type = ?";
      params.push(entity_type);
    }

    if (document_code) {
      query += " AND d.document_code LIKE ?";
      params.push(`%${document_code}%`);
    }

    if (from_date && to_date) {
      query += " AND DATE(al.created_at) BETWEEN ? AND ?";
      params.push(from_date, to_date);
    }

    query += " ORDER BY al.created_at DESC LIMIT 200";

    const [logs] = await connection.query(query, params);

    res.json({ Status: true, Data: logs });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
  }
});

router.get("/audit-document-summary", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { document_code, action } = req.query;
    //console.log(document_code)
    //console.log(action)
    
    if (!document_code) {
      return res.json({
        Status: false,
        Error: "Document code required",
      });
    }

    let query = `
      SELECT
        al.id,
        al.action,
        al.description,
        al.created_at,

        u.id AS user_id,
        u.full_name,

        r.name AS role_name,

        d.document_code,
        d.title

      FROM audit_logs al

      INNER JOIN users u
        ON u.id = al.user_id

      LEFT JOIN roles r
        ON r.id = u.role_id

      INNER JOIN documents d
        ON d.id = al.entity_id

      WHERE d.document_code LIKE ?
    `;

    const params = [`%${document_code}%`];

    if (action) {
      query += ` AND al.action = ?`;
      params.push(action);
    }

    query += `
      ORDER BY al.created_at DESC
    `;

    const [logs] = await connection.query(query, params);

    res.json({
      Status: true,
      Data: logs,
    });
  } catch (err) {
    console.error(err);

    res.json({
      Status: false,
      Error: "Server error",
    });
  }
});

router.get("/audit-document-users", verifyToken, async (req, res) => {
  const { document_code } = req.query;

  const [users] = await connection.query(
    `
    SELECT DISTINCT
      u.id,
      u.full_name
    FROM audit_logs al
    JOIN users u
      ON u.id = al.user_id
    JOIN documents d
      ON d.id = al.entity_id
    WHERE d.document_code = ?
    `,
    [document_code]
  );

  res.json({
    Status: true,
    Data: users,
  });
});

router.get("/document-tracker", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { document_code } = req.query;

    if (!document_code) {
      return res.status(400).json({
        Status: false,
        Error: "Document code is required",
      });
    }

    const [logs] = await connection.query(
      `
      SELECT
        al.id,
        al.session_id,
        al.action,
        al.description,
        al.old_values,
        al.new_values,
        al.browser,
        al.os,
        al.ip_address,
        al.created_at,

        u.id AS user_id,
        u.full_name,
        u.email,

        r.name AS role_name,

        d.id AS document_id,
        d.document_code,
        d.title

      FROM audit_logs al

      INNER JOIN users u
        ON u.id = al.user_id

      LEFT JOIN roles r
        ON r.id = u.role_id

      INNER JOIN documents d
        ON d.id = al.entity_id

      WHERE
        al.entity_type = 'DOCUMENT'
        AND d.document_code = ?

      ORDER BY al.created_at DESC
      `,
      [document_code]
    );

    return res.json({
      Status: true,
      Data: logs,
    });
  } catch (err) {
    console.error("Document Tracker Error:", err);

    return res.status(500).json({
      Status: false,
      Error: "Server Error",
    });
  }
});

export { router as SuperAdminRouter };
