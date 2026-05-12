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
   Storage and Multer config upload report
=========================== */

const reportsDir = path.join(__dirname, "..", "Public", "Reports");

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const reportStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, reportsDir),

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const base = sanitizeFilename(path.basename(file.originalname, ext));

    const timestamp = generateTimestamp();

    const finalName = `${base}_${timestamp}${ext}`;

    cb(null, finalName);
  },
});

const reportFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const uploadReport = multer({
  storage: reportStorage,
  fileFilter: reportFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/* ===========================
   Multer config for Staff Registration import
=========================== */

const importStorage = multer.memoryStorage();

const importUpload = multer({
  storage: importStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
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
  SELECT id, name, name_abbreviation 
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
   SUPPORT TICKETS
=========================== */
const generateTicketNumber = async (connection) => {
  let ticketNo;
  let exists = true;

  while (exists) {
    ticketNo = Math.floor(100000 + Math.random() * 900000).toString();

    const [rows] = await connection.query(
      "SELECT id FROM support_tickets WHERE ticket_number = ?",
      [ticketNo],
    );

    if (rows.length === 0) {
      exists = false;
    }
  }

  return ticketNo;
};
router.post(
  "/ticket",
  uploadSupport.single("screenshot"),
  verifyToken,
  async (req, res) => {
    const filePath = req.file ? req.file.path : null;

    try {
      const { subject, description } = req.body;

      if (!subject || !description) {
        deleteFile(filePath);

        return res.json({
          Status: false,
          Error: "Subject and description are required",
        });
      }

      const screenshot = req.file ? `/Supports/${req.file.filename}` : null;

      const connection = await connectToDatabase();
      const userId = req.user.id;
      const sessionId = req.user.session_id;

      // ✅ Generate ticket number
      const ticketNo = await generateTicketNumber(connection);

      // ✅ Insert ticket
      const [result] = await connection.query(
        `
        INSERT INTO support_tickets
        (ticket_number, user_id, subject, description, screenshot)
        VALUES (?, ?, ?, ?, ?)
        `,
        [ticketNo, userId, subject, description, screenshot],
      );

      const ticketId = result.insertId;

      /* ===========================
         DEVICE INFORMATION
      =========================== */
      const parser = new UAParser(req.headers["user-agent"]);
      const ua = parser.getResult();

      const browser =
        `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`.trim();

      const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`.trim();

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
         old_values, new_values,
         ip_address, user_agent_raw, browser, os, device, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          sessionId,
          "CREATE TICKET",
          "SUPPORT",
          ticketId,
          `Created support ticket #${ticketNo}`,
          null,
          JSON.stringify({
            ticket_number: ticketNo,
            subject,
            description,
          }),

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
        Message: "Issue reported successfully",
        ticketNo,
      });
    } catch (err) {
      console.error(err);

      deleteFile(filePath);

      res.status(500).json({ Status: false });
    }
  },
);

router.get("/ticket", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    // 🔹 Get tickets
    const [tickets] = await connection.query(
      `
      SELECT * FROM support_tickets
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
      `,
      [userId, limit, offset],
    );

    // 🔹 Get total count
    const [[countResult]] = await connection.query(
      `
      SELECT COUNT(*) as total FROM support_tickets
      WHERE user_id = ?
      `,
      [userId],
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      Status: true,
      Data: tickets,
      total,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error(err);

    res.json({
      Status: false,
      Error: "Failed to fetch tickets",
    });
  }
});

/* ===========================
   GET ALL STAFF (WITH FILTER)
=========================== */
router.get("/staff-directory", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        Status: false,
        Error: "Unauthorized",
      });
    }

    const { search = "", page = 1, limit = 10, department = "all" } = req.query;

    const limitNum = parseInt(limit) || 10;
    const offsetNum = (parseInt(page) - 1) * limitNum;

    // =========================
    // BASE QUERY
    // =========================
    let baseQuery = `
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN roles r ON u.role_id = r.id

      WHERE 
        u.is_active = 1
        AND u.is_locked = 0
        AND r.name IN ('Super_Admin', 'Admin', 'Staff', 'Focal_Person')
        AND (u.full_name LIKE ? OR u.email LIKE ?)
    `;

    let params = [`%${search}%`, `%${search}%`];

    // =========================
    // FILTER BY DEPARTMENT
    // =========================
    if (department !== "all") {
      baseQuery += " AND u.department_id = ?";
      params.push(department);
    }

    // =========================
    // GET DATA
    // =========================
    const [rows] = await connection.query(
      `
      SELECT 
        u.id,
        u.title,
        u.full_name,
        u.gender,
        u.division_unit_state,
        u.file_number,
        u.email,
        u.phone_number,
        u.designation,
        d.name AS department_name,
        r.name AS role_name   
      ${baseQuery}
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limitNum, offsetNum],
    );

    // =========================
    // COUNT
    // =========================
    const [count] = await connection.query(
      `SELECT COUNT(*) AS total ${baseQuery}`,
      params,
    );

    res.json({
      Status: true,
      Data: rows,
      totalPages: Math.ceil(count[0].total / limitNum),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

/* ===========================
   PARTNERS
=========================== */
// Add
router.post("/partners", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const { full_name, email, phone_number, address, password } = req.body;

    const adminId = req.user.id;

    // get department of logged in user
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [adminId],
    );

    if (!user) {
      return res.json({
        Status: false,
        Error: "User department not found",
      });
    }

    const departmentId = user.department_id;

    // check duplicate user
    const [exists] = await connection.query(
      `SELECT id FROM users WHERE email=? OR phone_number=?`,
      [email, phone_number],
    );

    if (exists.length > 0) {
      return res.json({
        Status: false,
        Error: "Record with same email or phone number already exists",
      });
    }

    // hash password
    const password_hash = await bcrypt.hash(password, 10);

    const [insertResult] = await connection.query(
      `
      INSERT INTO users
      (title, full_name, gender, designation, division_unit_state, file_number, email, phone_number,
       username, password_hash, department_id, role_id, is_active)
      VALUES ('Partners', ?, 'None', 'Partner', ?, null, ?, ?, ?, ?, 7, 5, 1)
      `,
      [full_name, address, email, phone_number, email, password_hash],
    );

    const newUserId = insertResult.insertId;

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
          division_unit_state: address,
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

    res.json({
      Status: true,
      Message: "Partner account created successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

//fetch all (both active and inactive)
router.get("/partners", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        Status: false,
        Error: "Unauthorized",
      });
    }

    // =========================
    // GET ALL PARTNERS (NO FILTERS)
    // =========================
    const [rows] = await connection.query(
      `
      SELECT 
        u.id,
        u.full_name,
        u.division_unit_state,
        u.email,
        u.phone_number,
        u.is_active,
        d.name AS department_name,
        r.name AS role_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('Partner')
      ORDER BY u.id DESC
      `,
    );

    res.json({
      Status: true,
      Data: rows,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

//fetch only active
router.get("/partners-active", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        Status: false,
        Error: "Unauthorized",
      });
    }

    // =========================
    // GET ALL PARTNERS (NO FILTERS)
    // =========================
    const [rows] = await connection.query(
      `
      SELECT 
        u.id,
        u.full_name,
        u.division_unit_state,
        u.email,
        u.phone_number,
        u.is_active,
        d.name AS department_name,
        r.name AS role_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('Partner') AND is_active = 1
      ORDER BY u.id DESC
      `,
    );

    res.json({
      Status: true,
      Data: rows,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

//Update
router.put("/partners/:id", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const partnerId = req.params.id;
    const adminId = req.user.id;

    const { full_name, email, phone_number, address } = req.body;

    // Validation
    if (!full_name || !email || !address || !phone_number) {
      return res.json({
        Status: false,
        Error:
          "Partner organization name, email, phone number and address are required",
      });
    }

    /* -------------------------
       GET EXISTING DATA
    ------------------------- */

    const [[existingPartner]] = await connection.query(
      `SELECT full_name, email, phone_number, division_unit_state
       FROM users
       WHERE id = ?`,
      [partnerId], //
    );

    if (!existingPartner) {
      return res.json({
        Status: false,
        Error: "Partner not found",
      });
    }

    /* -------------------------
       CHECK DUPLICATES
    ------------------------- */

    const [duplicate] = await connection.query(
      `
      SELECT id FROM users
      WHERE (email = ? OR phone_number = ?)
      AND id != ?
      LIMIT 1
      `,
      [email, phone_number, partnerId],
    );

    if (duplicate.length > 0) {
      return res.json({
        Status: false,
        Error: "Email or phone number already exists",
      });
    }

    /* -------------------------
       UPDATE
    ------------------------- */

    await connection.query(
      `
      UPDATE users
      SET
        full_name = ?,
        division_unit_state = ?,
        email = ?,
        phone_number = ?
      WHERE id = ?
      `,
      [full_name, address, email, phone_number, partnerId],
    );

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

    const { changes, oldValues, newValues } = detectChanges(existingPartner, {
      full_name,
      division_unit_state: address,
      email,
      phone_number,
    });

    /* -------------------------
       AUDIT LOG
    ------------------------- */

    if (changes.length > 0) {
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
          adminId,
          sessionId,
          "UPDATE PARTNER ACCOUNT",
          "USER",
          partnerId,
          `Updated "${existingPartner.full_name}" profile fields: ${changes.join(", ")}`,
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
    }

    res.json({
      Status: true,
      Message: "Partner updated successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      Status: false,
      Error: "Server error occurred",
    });
  }
});

//reset password
router.put("/partners/:id/reset-password", verifyToken, async (req, res) => {
  const partnerId = req.params.id;

  try {
    const connection = await connectToDatabase();
    const defaultPassword = "Partner@123";
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    const [userResult] = await connection.query(
      "SELECT * FROM users WHERE id = ?",
      [partnerId],
    );

    if (userResult.length === 0) {
      return res.json({ Status: false, Error: "User not found" });
    }

    const user = userResult[0];
    const partnerOrg = user.full_name;

    const hashedNewPassword = await bcrypt.hash(defaultPassword, 10);

    // Update password
    await connection.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      hashedNewPassword,
      partnerId,
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
        partnerId,
        `Reset ${partnerOrg} password to default`,
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
      Message: "Password reset to default",
    });
  } catch (err) {
    console.error(err);
    return res.json({
      Status: false,
      Error: "Server error",
    });
  }
});

//Dashboard
router.get("/partner/dashboard/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await connectToDatabase();

    // 1. PARTNER DETAILS (from users table)
    const [user] = await connection.query(
      `
      SELECT 
        id,
        full_name,
        email,
        is_active,
        is_locked,
        division_unit_state,
        phone_number,
        created_at
      FROM users
      WHERE id = ?
      `,
      [id],
    );

    if (user.length === 0) {
      return res.json({ Status: false, Error: "User not found" });
    }

    //  2. SHARED DOCUMENTS
    const [docs] = await connection.query(
      `
      SELECT 
        d.id,
        d.title,
        dep.name AS department_name,
        ds.created_at,
        ds.expiry_date
      FROM document_shares ds
      JOIN documents d ON d.id = ds.document_id
      LEFT JOIN departments dep ON dep.id = d.department_id
      WHERE ds.partner_id = ?
      ORDER BY ds.created_at DESC
      `,
      [id],
    );

    return res.json({
      Status: true,
      partner: user[0],
      documents: docs,
    });
  } catch (err) {
    console.error(err);
    return res.json({
      Status: false,
      Error: "Failed to load dashboard",
    });
  }
});

//update status activeate/deactivate
router.put("/partner/toggle/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  //console.log(id);
  const adminId = req.user.id;
  const sessionId = req.user.session_id;

  try {
    const connection = await connectToDatabase();

    // GET CURRENT STATUS
    const [user] = await connection.query(
      "SELECT is_active, full_name FROM users WHERE id = ?",
      [id],
    );

    if (user.length === 0) {
      return res.json({ Status: false, Error: "User not found" });
    }

    const newStatus = user[0].is_active ? 0 : 1;
    //console.log(newStatus);
    const orgName = user[0].full_name;

    // If active → deactivate → lock account
    // If inactive → activate → unlock account
    const isLocked = newStatus ? 0 : 1;
    //console.log(isLocked);

    await connection.query(
      "UPDATE users SET is_active = ?, is_locked = ? WHERE id = ?",
      [newStatus, isLocked, id],
    );

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

    //const actionType = newStatus ? "Activate Partner Account" : "Deactivate Partner Account";

    await connection.query(
      `INSERT INTO audit_logs
  (user_id, session_id, action, entity_type, entity_id, description, ip_address, user_agent_raw,
   browser, os, device, status)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        newStatus ? "ACTIVATE PARTNER" : "DEACTIVATE PARTNER",
        "USER",
        id,
        `${newStatus ? "Activated" : "Deactivated"} partner "${user[0].full_name}" account`,
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
      Message: `Partner ${newStatus ? "activated" : "deactivated"} successfully`,
    });
  } catch (err) {
    console.error(err);
    return res.json({
      Status: false,
      Error: "Failed to update status",
    });
  }
});

/* ===========================
   DOCUMENTS
=========================== */
//Fetch all active documents
router.get("/documents", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const category = req.query.category || "";
    const classification = req.query.classification || "";
    const year = req.query.year || "";
    const department = req.query.department || "";

    const offset = (page - 1) * limit;
    const userId = req.user.id;
    /*
    // Get logged-in user department
    const [userResult] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    if (!userResult.length) {
      return res.status(404).json({ Status: false });
    }

    const userDepartmentId = userResult[0].department_id;
    */

    // WHERE clause, RESTRICTED DOCUMENT NOT ALLOWED
    let where = `
      WHERE is_flagged = 0
      AND is_archived = 0
      AND is_delete = 0
      AND is_delete_flagged = 0
      AND document_status = 'Active'
      AND d.classification IN ('Public','Internal','Confidential')
      AND (d.title LIKE ? OR d.document_search_keywords LIKE ?)
    `;

    //let params = [userDepartmen, `%${search}%`, `%${search}%`];
    let params = [`%${search}%`, `%${search}%`];

    if (category) {
      where += " AND d.category_id = ?";
      params.push(parseInt(category));
    }

    if (classification) {
      where += " AND d.classification = ?";
      params.push(classification);
    }

    if (year) {
      where += " AND YEAR(d.created_at) = ?";
      params.push(year);
    }

    // Department filter
    if (department) {
      where += " AND d.department_id = ?";
      params.push(parseInt(department));
    }

    // Count query
    const [countResult] = await connection.query(
      `
      SELECT COUNT(*) as total
      FROM documents d
      LEFT JOIN departments dept ON d.department_id = dept.id
      ${where}
      `,
      params,
    );

    const total = countResult[0].total;

    // Fetch documents
    const [docs] = await connection.query(
      `
      SELECT 
        d.id,
        d.title,
        d.description,
        d.document_code,
        d.document_version,
        d.classification,
        d.document_status,
        d.created_at,
        dept.name AS department_name,
        dept.name_abbreviation AS dept_abbreviation,
        c.name AS category_name,
        s.name AS subcategory_name
      FROM documents d
      LEFT JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN document_categories c ON d.category_id = c.id
      LEFT JOIN document_subcategories s ON d.subcategory_id = s.id
      ${where}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    res.json({
      Status: true,
      Data: docs,
      Total: total,
      Page: page,
      Pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false, Error: "Failed to fetch documents" });
  }
});
router.get("/documents/:id", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    if (!user) {
      return res.status(404).json({ Status: false, Error: "User not found" });
    }

    const [rows] = await connection.query(
      `
      SELECT 
        d.id,
        d.title,
        d.description,
        d.category_id,
        d.subcategory_id,
        d.document_search_keywords,
        d.classification,
        d.document_status,
        d.document_code,
        d.retention_expiry_date,
        d.current_version_id,
        dv.version_number,
        dv.file_path
      FROM documents d
      JOIN document_versions dv ON dv.id = d.current_version_id
      WHERE d.id = ?
      AND d.document_status = ?
      `,
      [id, 1],
    );

    if (!rows.length) {
      return res.status(403).json({
        Status: false,
        Message: "Access denied",
      });
    }

    res.json({ Status: true, Data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false, Error: "Failed to load document" });
  }
});

router.get("/documents/:id/versions", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // 1️⃣ Get user's department
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    if (!user) {
      return res.status(404).json({ Status: false, Error: "User not found" });
    }

    // 2️⃣ Join with documents to enforce department restriction
    const [rows] = await connection.query(
      `SELECT 
      dv.version_number,
      dv.id,
      dv.file_name,
      dv.file_path,
      dv.type,
      dv.file_size,
      dv.version_notes,
      dv.version_verified_by,
      dv.created_at,
      dv.is_active,
      COUNT(dl.id) AS download_count
    FROM document_versions dv
    JOIN documents d ON d.id = dv.document_id
    LEFT JOIN download_logs dl 
          ON dl.version_id = dv.id
    WHERE dv.document_id = ?
    AND d.document_status = ?
    GROUP BY dv.id
    ORDER BY dv.created_at DESC
    `,
      [id, 1],
    );

    if (!rows.length) {
      return res.status(403).json({
        Status: false,
        Message: "Access denied or document not found",
      });
    }

    res.json({ Status: true, Data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false, Error: "Failed to load versions" });
  }
});

router.get("/documents/:id/share-summary", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const { id } = req.params;

    // PARTNER SHARES
    const [partnerShares] = await connection.query(
      `
      SELECT 
        ds.partner_id,
        u.full_name,
        ds.created_at,
        ds.expiry_date
      FROM document_shares ds
      JOIN users u ON u.id = ds.partner_id
      WHERE ds.document_id = ?
      `,
      [id],
    );

    // PUBLIC LINKS
    const [[publicCount]] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM document_public_links
      WHERE document_id = ?
      `,
      [id],
    );

    const partnerCount = partnerShares.length;
    const publicLinkCount = publicCount.total;

    res.json({
      Status: true,
      Data: {
        totalShares: partnerCount + publicLinkCount,
        partnerCount,
        publicLinkCount,
        partnerShares,
      },
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Server error" });
  }
});

/* ===========================
   SECURE DOWNLOAD
=========================== */
const formatDownloadFilename = (originalName, versionNumber) => {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .slice(0, 13) // YYYYMMDDTHHMM
    .replace("T", "_");

  return `${base}_${timestamp}_v${versionNumber}${ext}`;
};
router.get("/documents/download/:versionId", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const userId = req.user.id;
    const sessionId = req.user.session_id;
    const { versionId } = req.params;

    const [[user]] = await connection.query(
      "SELECT department_id, username FROM users WHERE id = ?",
      [userId],
    );

    if (!user) {
      return res.status(404).json({ Error: "User not found" });
    }

    const [[version]] = await connection.query(
      `SELECT dv.*, d.department_id, d.title
       FROM document_versions dv
       JOIN documents d ON d.id = dv.document_id
       WHERE dv.id = ?`,
      [versionId],
    );

    if (!version) {
      return res.status(404).json({ Error: "Document not found" });
    }
    /*
      if (version.department_id !== user.department_id) {
        return res.status(403).json({ Error: "Unauthorized" });
      }
    */

    const documentId = version.document_id;

    const filePath = path.join(__dirname, "..", "Public", version.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ Error: "File not found" });
    }

    const mimeType =
      version.mime_type || mime.lookup(filePath) || "application/octet-stream";

    const downloadName = formatDownloadFilename(
      version.original_file_name,
      version.version_number,
    );

    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(downloadName)}"`,
    );
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Insert audit log
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
        ip_address, user_agent_raw, browser, os, device, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        userId,
        sessionId,
        "DOWNLOAD",
        "DOCUMENT",
        documentId,
        `Downloaded document "${version.title}" version_${version.version_number}`,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    // insert download log

    await connection.query(
      `INSERT INTO download_logs
       (document_id, version_id, category, ip_address, user_agent, browser, os, device)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        documentId,
        versionId,
        "USER",
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
      ],
    );

    return res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ Error: "Download failed" });
  }
});
router.get("/public/documents/download/:versionId", async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { versionId } = req.params;

    const [[version]] = await connection.query(
      `SELECT dv.*, d.department_id, d.title
       FROM document_versions dv
       JOIN documents d ON d.id = dv.document_id
       WHERE dv.id = ?`,
      [versionId],
    );

    if (!version) {
      return res.status(404).json({ Error: "Document not found" });
    }

    const documentId = version.document_id;

    const filePath = path.join(__dirname, "..", "Public", version.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ Error: "File not found" });
    }

    const mimeType =
      version.mime_type || mime.lookup(filePath) || "application/octet-stream";

    const downloadName = formatDownloadFilename(
      version.original_file_name,
      version.version_number,
    );

    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(downloadName)}"`,
    );
    res.setHeader("X-Content-Type-Options", "nosniff");

    // insert download log
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
      `INSERT INTO download_logs
       (document_id, version_id, category, ip_address, user_agent, browser, os, device)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        documentId,
        versionId,
        "GUEST",
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
      ],
    );

    return res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ Error: "Download failed" });
  }
});

/* ===========================
   SHARE DOCUMENT WITH PARTNERS
=========================== */
router.post("/documents/share", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const { document_id, partner_ids, expiry_date } = req.body;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    if (!document_id || !partner_ids?.length || !expiry_date) {
      return res.json({
        Status: false,
        Error: "All fields are required",
      });
    }

    /* ================= GET DOCUMENT ================= */
    const [[doc]] = await connection.query(
      "SELECT title FROM documents WHERE id = ?",
      [document_id],
    );

    /* ================= GET PARTNER NAMES ================= */
    const [partners] = await connection.query(
      `SELECT id, full_name FROM users WHERE id IN (?)`,
      [partner_ids],
    );

    const partnerMap = {};
    partners.forEach((p) => {
      partnerMap[p.id] = p.full_name;
    });

    let skippedPartners = [];
    let sharedPartners = [];

    /* ================= SHARE LOOP ================= */
    for (let partnerId of partner_ids) {
      const [[existing]] = await connection.query(
        `
        SELECT id, expiry_date 
        FROM document_shares
        WHERE document_id = ? AND partner_id = ?
        `,
        [document_id, partnerId],
      );

      // Skip if still active
      if (existing && new Date(existing.expiry_date) > new Date()) {
        skippedPartners.push(partnerId);
        continue;
      }

      await connection.query(
        `
        INSERT INTO document_shares (document_id, partner_id, expiry_date, shared_by)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          expiry_date = VALUES(expiry_date),
          shared_by = VALUES(shared_by)
        `,
        [document_id, partnerId, expiry_date, adminId],
      );

      sharedPartners.push(partnerId);
    }

    /* ================= MAP NAMES ================= */
    const sharedNames = sharedPartners.map((id) => partnerMap[id]);
    const skippedNames = skippedPartners.map((id) => partnerMap[id]);

    /* ================= DEVICE INFO ================= */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";
    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    /* ================= AUDIT LOG ================= */
    await connection.query(
      `INSERT INTO audit_logs
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values, ip_address, user_agent_raw,
       browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "SHARE DOCUMENT",
        "DOCUMENT",
        document_id,

        // Description
        `Shared "${doc?.title}" with ${sharedNames.length} partner(s) via portal`,
        null,

        // Detailed JSON
        JSON.stringify({
          document_title: doc?.title,
          shared_with: sharedNames,
          expiry_date,
        }),

        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    /* ================= RESPONSE ================= */
    return res.json({
      Status: true,
      Message: "Sharing completed",
      shared: sharedPartners,
      skipped: skippedPartners,
      Info:
        skippedPartners.length > 0
          ? "Some partners already have active access and were skipped"
          : null,
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Server error" });
  }
});

/* ===========================
   SHARE DOCUMENT PUBLIC LINK
=========================== */
router.post("/documents/generate-link", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const { document_id, expiry_date } = req.body;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    if (!document_id || !expiry_date) {
      return res.json({
        Status: false,
        Error: "Document and expiry date required",
      });
    }

    /* ================= GET DOCUMENT ================= */
    const [[doc]] = await connection.query(
      "SELECT title FROM documents WHERE id = ?",
      [document_id],
    );

    /* ================= GENERATE TOKEN ================= */
    const token = crypto.randomBytes(32).toString("hex");

    await connection.query(
      `
      INSERT INTO document_public_links
      (document_id, token, expiry_date, generated_by)
      VALUES (?, ?, ?, ?)
      `,
      [document_id, token, expiry_date, adminId],
    );

    const link = `http://localhost:5173/public/document/${token}`;

    /* ================= DEVICE INFO ================= */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";
    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    /* ================= AUDIT LOG ================= */
    await connection.query(
      `INSERT INTO audit_logs
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values, ip_address, user_agent_raw,
       browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "GENERATE PUBLIC LINK",
        "DOCUMENT",
        document_id,

        // CLEAN PROFESSIONAL DESCRIPTION
        `Generated public access link for "${doc?.title}"`,

        null,

        // 🔥 IMPORTANT DATA
        JSON.stringify({
          document_title: doc?.title,
          link,
          expiry_date,
        }),

        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    /* ================= RESPONSE ================= */
    res.json({
      Status: true,
      link,
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Server error" });
  }
});

router.get(
  "/documents/latest-link/:document_id",
  verifyToken,
  async (req, res) => {
    const connection = await connectToDatabase();

    try {
      const { document_id } = req.params;

      const [[link]] = await connection.query(
        `
      SELECT token, expiry_date
      FROM document_public_links
      WHERE document_id = ?
      AND expiry_date > NOW()
      ORDER BY id DESC
      LIMIT 1
      `,
        [document_id],
      );

      if (!link) {
        return res.json({
          Status: true,
          Data: null,
        });
      }

      const fullLink = `http://localhost:5173/public/document/${link.token}`;

      res.json({
        Status: true,
        Data: {
          link: fullLink,
          expiry_date: link.expiry_date,
        },
      });
    } catch (err) {
      console.error(err);
      res.json({ Status: false, Error: "Server error" });
    }
  },
);

/* ===========================
   ACHIEVED AND DELETED DOCUMENTS
=========================== */
//fetch
router.get("/document/archive-delete", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const userId = req.user.id;

  try {
    /* GET USER DEPARTMENT */
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id=?",
      [userId],
    );

    const dept = user.department_id;

    /* FETCH ARCHIEVED/DELEE DOCUMENTS (ALL DEPARTMENT) */
    const [docs] = await connection.query(
      `
  SELECT 
    d.*,
    dept.name_abbreviation AS department_name
  FROM documents d
  LEFT JOIN departments dept 
    ON d.department_id = dept.id
  WHERE (d.is_archived = 1 OR d.is_delete = 1)
    AND (d.document_status = 'Deleted' OR d.document_status = 'Archived')

  ORDER BY COALESCE(d.archived_at, d.delete_at) DESC

  LIMIT ? OFFSET ?
  `,
      [limit, offset],
    );

    /* COUNT (MATCH SAME FILTER!) */
    const [[count]] = await connection.query(
      `
      SELECT COUNT(*) total
      FROM documents
      WHERE (is_archived = 1 OR is_delete = 1)
        AND (document_status = 'Deleted' OR document_status = 'Archived')
      `,
    );

    res.json({
      Status: true,
      data: docs,
      totalPages: Math.ceil(count.total / limit),
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
  }
});

/* ===========================
   SHARED DOCUMENTS
=========================== */
router.get("/document/shared", async (req, res) => {
  const limit = 5;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  try {
    const connection = await connectToDatabase();

    //  1. GET TOTAL DOCUMENT COUNT
    const [countResult] = await connection.query(`
      SELECT COUNT(DISTINCT d.id) AS total
      FROM documents d
      JOIN document_shares ds ON ds.document_id = d.id
    `);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // 2. GET PAGINATED DOCUMENTS ONLY
    const [docs] = await connection.query(
      `
      SELECT DISTINCT 
        d.id AS document_id,
        d.title,
        dep.name AS department_name
      FROM documents d
      LEFT JOIN departments dep ON dep.id = d.department_id
      JOIN document_shares ds ON ds.document_id = d.id
      ORDER BY d.id DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset],
    );

    // 👉 If no docs
    if (docs.length === 0) {
      return res.json({
        Status: true,
        data: [],
        totalPages,
      });
    }

    // 3. GET PARTNERS FOR ONLY THESE DOCS
    const docIds = docs.map((d) => d.document_id);

    const [shares] = await connection.query(
      `
      SELECT 
        ds.document_id,
        u.full_name,
        ds.created_at,
        ds.expiry_date
      FROM document_shares ds
      LEFT JOIN users u ON u.id = ds.partner_id
      WHERE ds.document_id IN (?)
      `,
      [docIds],
    );

    //  4. GROUP DATA
    const grouped = {};

    docs.forEach((doc) => {
      grouped[doc.document_id] = {
        document_id: doc.document_id,
        title: doc.title,
        department_name: doc.department_name,
        partners: [],
      };
    });

    shares.forEach((s) => {
      if (grouped[s.document_id]) {
        grouped[s.document_id].partners.push({
          full_name: s.full_name,
          created_at: s.created_at,
          expiry_date: s.expiry_date,
        });
      }
    });

    const result = Object.values(grouped);

    return res.json({
      Status: true,
      data: result,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    return res.json({
      Status: false,
      Error: "Failed to fetch shared documents",
    });
  }
});

/* ===========================
   ACCESS REQUEST
=========================== */
//fetch request for Admin Review
router.get(
  "/document/cross-department-requests",
  verifyToken,
  async (req, res) => {
    try {
      const connection = await connectToDatabase();

      const { page = 1, limit = 10, status = "", search = "" } = req.query;

      const limitNum = parseInt(limit);
      const offset = (parseInt(page) - 1) * limitNum;

      /* =========================
         FILTERS (ADMIN - NO DEPT)
      ========================= */
      let filters = `WHERE dar.status NOT IN ('Pending_Department_Review')`;
      let params = [];

      if (status) {
        filters += " AND dar.status = ?";
        params.push(status);
      }

      if (search) {
        filters += `
    AND (
      u.full_name LIKE ? 
      OR d.title LIKE ?
    )
  `;
        params.push(`%${search}%`, `%${search}%`);
      }

      /* =========================
         MAIN QUERY
      ========================= */
      const [rows] = await connection.query(
        `
        SELECT 
          dar.id,
          dar.status,
          dar.reason,
          dar.created_at,
          dar.department_comment AS dfp_comment,
          dar.department_reviewed_at,
          dar.owner_department_id,

          u.full_name AS staff_name,
          dept.name AS requester_department_name,

          d.title AS document_title,
          d.classification AS document_classification

        FROM document_access_requests dar
        JOIN users u ON dar.requested_by = u.id
        JOIN departments dept ON u.department_id = dept.id
        JOIN documents d ON dar.document_id = d.id

        ${filters}

        ORDER BY dar.created_at DESC
        LIMIT ? OFFSET ?
      `,
        [...params, limitNum, offset],
      );

      /* =========================
         COUNT QUERY
      ========================= */
      const [count] = await connection.query(
        `
        SELECT COUNT(*) AS total
        FROM document_access_requests dar
        JOIN users u ON dar.requested_by = u.id
        JOIN departments dept ON u.department_id = dept.id
        JOIN documents d ON dar.document_id = d.id

        ${filters}
      `,
        params,
      );

      res.json({
        Status: true,
        Data: rows,
        totalPages: Math.ceil(count[0].total / limitNum),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ Status: false });
    }
  },
);

router.post("/admin-review", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { request_id, action, comment } = req.body;

    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    let status = "";

    if (action === "approve") {
      status = "Approved";
    } else if (action === "reject") {
      status = "Rejected";
    } else {
      return res.status(400).json({
        Status: false,
        Message: "Invalid action",
      });
    }

    /* =========================
       GET REQUEST DETAILS
    ========================= */
    const [[reqData]] = await connection.query(
      `
      SELECT 
        dar.id,
        dar.reason,
        dar.document_id,
        dar.requested_by,

        u.full_name AS requester_name,
        d.title AS document_title

      FROM document_access_requests dar

      JOIN users u 
        ON dar.requested_by = u.id

      JOIN documents d 
        ON dar.document_id = d.id

      WHERE dar.id = ?
      `,
      [request_id],
    );

    if (!reqData) {
      return res.status(404).json({
        Status: false,
        Message: "Request not found",
      });
    }

    /* =========================
       UPDATE REQUEST STATUS
    ========================= */
    await connection.query(
      `
      UPDATE document_access_requests
      SET 
        status = ?,
        admin_reviewer_id = ?,
        admin_comment = ?,
        admin_reviewed_at = NOW()
      WHERE id = ?
      `,
      [status, adminId, comment, request_id],
    );

    /* =========================
       INSERT ACCESS PERMISSION
       ONLY WHEN APPROVED
    ========================= */
    if (action === "approve") {
      // check existing permission
      const [[existingPermission]] = await connection.query(
        `
        SELECT id
        FROM document_access_permissions
        WHERE request_id = ?
        `,
        [request_id],
      );

      // insert only if not already existing
      if (!existingPermission) {
        await connection.query(
          `
          INSERT INTO document_access_permissions
          (
            document_id,
            user_id,
            granted_by,
            request_id,
            expires_at
          )
          VALUES
          (
            ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 MONTH)
          )
          `,
          [
            reqData.document_id,
            reqData.requested_by,
            adminId,
            request_id,
          ],
        );
      }
    }

    /* =========================
       DEVICE INFO
    ========================= */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser =
      `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`.trim();

    const os =
      `${ua.os.name || "Unknown"} ${ua.os.version || ""}`.trim();

    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";

    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    /* =========================
       AUDIT LOG
    ========================= */
    await connection.query(
      `
      INSERT INTO audit_logs
      (
        user_id,
        session_id,
        action,
        entity_type,
        entity_id,
        description,
        old_values,
        new_values,
        ip_address,
        user_agent_raw,
        browser,
        os,
        device,
        status
      )
      VALUES
      (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      [
        adminId,
        sessionId,

        action === "approve"
          ? "APPROVE ACCESS REQUEST"
          : "REJECT ACCESS REQUEST",

        "DOCUMENT",

        reqData.document_id,

        `${
          action === "approve" ? "Approved" : "Rejected"
        } access request for "${reqData.document_title}"`,

        JSON.stringify({
          previous_status: "Pending_Admin_Approval",
        }),

        JSON.stringify({
          new_status: status,
          document_title: reqData.document_title,
          comment,
        }),

        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    /* =========================
       RESPONSE
    ========================= */
    return res.json({
      Status: true,
      Message:
        action === "approve"
          ? "Request approved successfully"
          : "Request rejected successfully",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      Status: false,
      Message: "Server error",
    });
  }
});

/* ===========================
   DELETE REQUEST
=========================== */
//fetch
router.get("/delete-requests", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { page = 1, limit = 10, department = "", search = "" } = req.query;

    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    /* =========================
       FILTERS
    ========================= */
    let filters = `
      WHERE d.is_delete_flagged = 1
      AND d.document_status = 'Pending Deletion'
    `;

    let params = [];

    if (department) {
      filters += " AND d.department_id = ?";
      params.push(department);
    }

    if (search) {
      filters += `
        AND (
          d.title LIKE ?
          OR d.document_code LIKE ?
        )
      `;
      params.push(`%${search}%`, `%${search}%`);
    }

    /* =========================
       MAIN QUERY
    ========================= */
    const [rows] = await connection.query(
      `
      SELECT 
        d.id,
        d.title,
        d.document_code,
        d.deletion_reason,
        d.created_at,

        dep.name AS department_name,
        u.full_name AS requested_by

      FROM documents d
      LEFT JOIN departments dep ON dep.id = d.department_id
      LEFT JOIN users u ON u.id = d.uploaded_by

      ${filters}

      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limitNum, offset],
    );

    /* =========================
       COUNT
    ========================= */
    const [count] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM documents d
      ${filters}
      `,
      params,
    );
    //console.log(rows);
    res.json({
      Status: true,
      Data: rows,
      totalPages: Math.ceil(count[0].total / limitNum),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false, Error: "Server error" });
  }
});

//Delete document
router.delete("/delete-document/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { id } = req.params;

    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    /* ================= GET DOCUMENT BEFORE DELETE ================= */
    const [[doc]] = await connection.query(
      `
      SELECT 
        title,
        document_status,
        is_delete
      FROM documents
      WHERE id = ?
      `,
      [id],
    );

    if (!doc) {
      return res.json({ Status: false, Error: "Document not found" });
    }

    /* ================= UPDATE DOCUMENT ================= */
    await connection.query(
      `
      UPDATE documents 
      SET 
        is_delete = 1,
        delete_at = NOW(),
        document_status = 'Deleted'
      WHERE id = ?
      `,
      [id],
    );

    /* ================= DEVICE INFO ================= */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";
    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    /* ================= AUDIT LOG ================= */
    await connection.query(
      `INSERT INTO audit_logs
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values, ip_address, user_agent_raw,
       browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "DELETE DOCUMENT",
        "DOCUMENT",
        id,

        // ✅ Clean description
        `Deleted document "${doc.title}"`,

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

    /* ================= RESPONSE ================= */
    res.json({
      Status: true,
      Message: "Document deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Delete failed" });
  }
});

/* ===========================
   RESTORE REQUEST
=========================== */
// GET RESTORE REQUESTS
router.get("/restore-requests", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { page = 1, limit = 5, status = "", department = "" } = req.query;

    const limitNum = parseInt(limit);
    const offset = (page - 1) * limitNum;

    let filters = "WHERE 1=1";
    let params = [];

    if (status) {
      filters += " AND rr.status = ?";
      params.push(status);
    }

    if (department) {
      filters += " AND rr.department_id = ?";
      params.push(department);
    }

    const [rows] = await connection.query(
      `
      SELECT 
        rr.id,
        rr.status,
        rr.reason,
        rr.created_at,

        d.id AS document_id,
        d.title,
        d.document_status,
        d.retention_expiry_date,

        u.full_name AS requested_by,
        dept.name AS department_name

      FROM restore_requests rr
      JOIN documents d ON rr.document_id = d.id
      JOIN users u ON rr.requested_by = u.id
      JOIN departments dept ON rr.department_id = dept.id

      ${filters}

      ORDER BY rr.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limitNum, offset],
    );

    const [count] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM restore_requests rr
      JOIN documents d ON rr.document_id = d.id
      ${filters}
      `,
      params,
    );

    res.json({
      Status: true,
      Data: rows,
      totalPages: Math.ceil(count[0].total / limitNum),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});

// Approve/Reject Action
router.post("/restore-action", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { request_id, action } = req.body;
    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    /* ================= GET REQUEST ================= */
    const [[request]] = await connection.query(
      "SELECT * FROM restore_requests WHERE id = ?",
      [request_id],
    );

    if (!request) {
      return res.json({ Status: false, Error: "Request not found" });
    }

    if (request.status !== "Pending") {
      return res.json({ Status: false, Error: "Already processed" });
    }

    /* ================= GET DOCUMENT (FOR AUDIT) ================= */
    const [[doc]] = await connection.query(
      `
      SELECT 
        id,
        title,
        document_status,
        is_archived,
        is_delete,
        retention_expiry_date
      FROM documents
      WHERE id = ?
      `,
      [request.document_id],
    );

    /* ================= RESTORE LOGIC ================= */
    if (action === "approve") {
      await connection.query(
        `
        UPDATE documents
        SET 
          is_flagged = 0,
          is_archived = 0,
          archived_at = NULL,
          is_delete = 0,
          delete_at = NULL,
          deletion_reason = NULL,
          is_delete_flagged = 0,
          document_status = 'Active',

          retention_expiry_date = DATE_ADD(
            IFNULL(retention_expiry_date, NOW()),
            INTERVAL 5 YEAR
          )
        WHERE id = ?
        `,
        [request.document_id],
      );
    }

    /* ================= UPDATE REQUEST ================= */
    await connection.query(
      `
      UPDATE restore_requests
      SET 
        status = ?,
        action_taken_by = ?,
        action_date = NOW()
      WHERE id = ?
      `,
      [action === "approve" ? "Approved" : "Rejected", adminId, request_id],
    );

    /* ================= DEVICE INFO ================= */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`;
    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`;
    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";
    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    /* ================= AUDIT LOG ================= */
    await connection.query(
      `INSERT INTO audit_logs
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values, ip_address, user_agent_raw,
       browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,

        action === "approve"
          ? "APPROVED RESTORE DOCUMENT"
          : "REJECT RESTORE DOCUMENT",

        "DOCUMENT",
        request.document_id,

        action === "approve"
          ? `Approved restore document request for "${doc?.title}"`
          : `Rejected restore document request for "${doc?.title}"`,

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

    /* ================= RESPONSE ================= */
    res.json({
      Status: true,
      Message:
        action === "approve"
          ? "Document restored successfully"
          : "Request rejected",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});

/* ===========================
   RESTORE NOTIFICATION
=========================== */
router.get("/restore-alerts", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();
  try {
    // UPDATE EXPIRED DOCUMENTS (SYSTEM-WIDE)
    await connection.query(`
      UPDATE documents
      SET 
        is_flagged = 1,
        document_status = 'Expired'
      WHERE retention_expiry_date < CURDATE()
      AND is_flagged = 0
      AND is_delete_flagged = 0
    `);

    /* FETCH ALERTS FOR LOGGED USER
    const userId = req.user.id;
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );
    const department_id = user.department_id;
    */

    const [rows] = await connection.query(
      `
      SELECT 
        rr.id,
        rr.status,
        rr.reason,
        rr.created_at,

        d.id AS document_id,
        d.title,
        d.document_status,
        d.retention_expiry_date,

        u.full_name AS requested_by,
        dept.name_abbreviation AS department_name

      FROM restore_requests rr
      JOIN documents d ON rr.document_id = d.id
      JOIN users u ON rr.requested_by = u.id
      JOIN departments dept ON rr.department_id = dept.id
      WHERE rr.status = ?
      `,
      ["Pending"],
    );
    //console.log(rows);
    res.json({
      Status: true,
      alerts: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error(error);
    res.json({ Status: false });
  }
});

/* ===========================
   CROSS-DEPARTMENT CONFIDENCIAL DOCUMENT REQUEST ACCESS NOTIFICATION
=========================== */
router.get(
  "/document-access-notification/pending",
  verifyToken,
  async (req, res) => {
    try {
      const connection = await connectToDatabase();
      const userId = req.user.id;

      // ✅ Get user department
      const [[user]] = await connection.query(
        "SELECT department_id FROM users WHERE id = ?",
        [userId],
      );

      if (!user) {
        return res
          .status(404)
          .json({ Status: false, Message: "User not found" });
      }

      const [rows] = await connection.query(
        `
          SELECT 
            r.id,
            r.document_id,
            r.reason,
            r.status,
            r.created_at,
            r.owner_department_id,

            d.title,

            u.full_name AS requested_by_name,
            req_dept.name_abbreviation AS requester_department,
            owner_dept.name_abbreviation AS owner_department

          FROM document_access_requests r

          JOIN documents d 
            ON r.document_id = d.id

          JOIN users u 
            ON r.requested_by = u.id

          -- requester department
          JOIN departments req_dept 
            ON u.department_id = req_dept.id

          -- owner department
          JOIN departments owner_dept 
            ON r.owner_department_id = owner_dept.id

          WHERE 
            r.status = 'Pending_Admin_Approval'

          ORDER BY r.created_at DESC
          `,
      );

      res.json({
        Status: true,
        data: rows,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ Status: false });
    }
  },
);

/* ===========================
   DELETE NOTIFICATION
=========================== */
router.get("/delete-notification/pending", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();
  try {
    const [rows] = await connection.query(
      `
      SELECT 
        d.id,
        d.title,
        d.document_code,
        d.deletion_reason,
        d.created_at,
        d.updated_at,
        d.document_status,

        dep.name_abbreviation AS department_name,
        u.full_name AS requested_by

      FROM documents d
      LEFT JOIN departments dep ON dep.id = d.department_id
      LEFT JOIN users u ON u.id = d.uploaded_by
      WHERE  d.document_status = ? AND is_delete_flagged = 1
      `,
      ["Pending Deletion"],
    );
    //console.log(rows);
    res.json({
      Status: true,
      alerts: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error(error);
    res.json({ Status: false });
  }
});

/* ===========================
   PUBLIC LINK DOCUMENT VALIDATION
=========================== */
router.get("/public/document/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const connection = await connectToDatabase();

    /* ================= VALIDATE TOKEN ================= */
    const [[link]] = await connection.query(
      `SELECT * FROM document_public_links WHERE token = ?`,
      [token],
    );

    if (!link) {
      return res.json({
        Status: false,
        Error: "Invalid link",
      });
    }

    const isExpired =
      link.expiry_date && new Date(link.expiry_date) < new Date();

    /* ================= GET DOCUMENT ================= */
    const [[doc]] = await connection.query(
      `SELECT * FROM documents WHERE id = ?`,
      [link.document_id],
    );

    if (!doc) {
      return res.json({
        Status: false,
        Error: "Document not found",
      });
    }

    /* ================= GET VERSION ================= */
    const [[version]] = await connection.query(
      `SELECT * FROM document_versions WHERE id = ?`,
      [doc.current_version_id],
    );

    res.json({
      Status: true,
      expired: isExpired,
      expiry_date: link.expiry_date, // ✅ RETURNED
      document: doc,
      version: version,
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
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
        SUM(dv.file_size) as totalStorage
      FROM document_versions dv
    `);

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

    /* ================= EXPIRING DOCUMENTS ================= */
    const [expiringDocs] = await connection.query(`
      SELECT title, retention_expiry_date
      FROM documents
      WHERE retention_expiry_date <= DATE_ADD(NOW(), INTERVAL 30 DAY)
      AND retention_expiry_date IS NOT NULL
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
      },
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
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

/* ===========================
   SUPPORT CONTACT
=========================== */
router.get("/support-contacts", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.query(
      `SELECT * FROM system_support_contacts ORDER BY id`
    );

    res.json({ Status: true, Data: rows });
  } catch (err) {
    res.json({ Status: false, Error: err.message });
  }
});

/* ===========================
   PROGRAM TEAM LEAD
=========================== */
router.get("/team-lead/programs", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const connection = await connectToDatabase();

  try {
    const [rows] = await connection.query(
      `
      SELECT 
        ptl.id,
        ptl.program_id,
        ptl.state,
        ptl.submission_status,
        ptl.created_at,

        p.name,
        p.description,

        d.name AS department_name,

        pr.id AS report_id,
        pr.file_url,
        pr.file_name,
        pr.file_size,
        pr.file_type,
        pr.report_title,
        pr.submitted_at

      FROM program_team_leads ptl

      JOIN programs p 
        ON p.id = ptl.program_id

      JOIN departments d 
        ON d.id = p.department_id

      LEFT JOIN program_reports pr 
        ON pr.program_id = ptl.program_id
        AND pr.state = ptl.state
        AND pr.uploaded_by = ptl.user_id

      WHERE ptl.user_id = ?
      ORDER BY ptl.id DESC
      `,
      [userId],
    );

    return res.json({
      Status: true,
      data: rows,
    });
  } catch (err) {
    console.error(err);
    return res.json({ Status: false });
  }
});

router.get("/team-lead/programs/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const connection = await connectToDatabase();

  try {
    const [[data]] = await connection.query(
      `
    SELECT 
    ptl.id,
    ptl.program_id,
    ptl.state,
    ptl.submission_status,

    p.name,
    p.description,
    p.reportNameFormat,

    d.name AS department_name,

    pr.id AS report_id,
    pr.file_url,
    pr.file_name,
    pr.file_size,
    pr.file_type,
    pr.report_title,
    pr.submitted_at

  FROM program_team_leads ptl

  JOIN programs p 
    ON p.id = ptl.program_id

  JOIN departments d 
    ON d.id = p.department_id

  LEFT JOIN program_reports pr 
    ON pr.program_id = ptl.program_id
    AND pr.state = ptl.state
    AND pr.uploaded_by = ptl.user_id

  WHERE ptl.id = ? 
    AND ptl.user_id = ?
`,
      [id, userId],
    );

    if (!data) {
      return res.json({ Status: false, Message: "Not found" });
    }

    res.json({ Status: true, data });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
  }
});

router.post(
  "/team-lead/upload-report/:id",
  verifyToken,
  uploadReport.single("file"),
  async (req, res) => {
    const programId = req.params.id;
    const userId = req.user.id;
    const sessionId = req.user.session_id;
    const { title } = req.body;

    const file = req.file;

    if (!file || !title) {
      if (file) deleteFile(file.path);

      return res.json({
        Status: false,
        Message: "Title and file are required",
      });
    }

    const connection = await connectToDatabase();

    try {
      /* ===============================
         GET TEAM LEAD + PROGRAM INFO
      =============================== */
      const [[lead]] = await connection.query(
        `SELECT ptl.state, ptl.program_id, p.name AS program_name
         FROM program_team_leads ptl
         JOIN programs p ON p.id = ptl.program_id
         WHERE ptl.id = ? AND ptl.user_id = ?`,
        [programId, userId],
      );

      if (!lead) {
        deleteFile(file.path);

        return res.json({
          Status: false,
          Message: "Unauthorized",
        });
      }

      const state = lead.state;
      const main_program_id = lead.program_id;
      const programName = lead.program_name;

      const fileUrl = `/Reports/${file.filename}`;

      /* ===============================
         INSERT REPORT
      =============================== */
      

      const extension = path.extname(file.originalname).toLowerCase();

const [insertResult] = await connection.query(
  `INSERT INTO program_reports
  (program_id, state, uploaded_by, file_url, file_name, file_size, file_type, file_extension, report_title, submitted_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
  [
    main_program_id,
    state,
    userId,
    fileUrl,
    file.originalname,
    file.size,
    file.mimetype,   // keep MIME
    extension,       // add extension
    title,
  ],
);

      const reportId = insertResult.insertId;

      /* ===============================
         UPDATE STATUS
      =============================== */
      await connection.query(
        `UPDATE program_team_leads 
         SET submission_status = 'submitted'
         WHERE id = ? AND user_id = ?`,
        [programId, userId],
      );

      /* ===============================
         AUDIT LOG
      =============================== */
      const parser = new UAParser(req.headers["user-agent"]);
      const ua = parser.getResult();

      const browser =
        `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`.trim();

      const os =
        `${ua.os.name || "Unknown"} ${ua.os.version || ""}`.trim();

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
          userId,
          sessionId,
          "UPLOAD PROGRAM REPORT",
          "PROGRAM",
          reportId,
          `Uploaded report "${title}" for program "${programName}" (${state})`,
          ip,
          req.headers["user-agent"],
          browser,
          os,
          device,
          "SUCCESS",
        ],
      );

      /* ===============================
         RESPONSE
      =============================== */
      return res.json({
        Status: true,
        Message: "Report uploaded successfully",
      });

    } catch (err) {
      console.error(err);

      // 🔥 DELETE FILE IF FAILURE
      deleteFile(file.path);

      return res.json({
        Status: false,
        Message: "Upload failed",
      });
    }
  },
);

export { router as AdminRouter };
