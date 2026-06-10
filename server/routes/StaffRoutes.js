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
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("File delete error:", err);
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
/*
router.get("/departments", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.query(
      "SELECT id, name, name_abbreviation FROM departments ORDER BY name ASC",
    );

    res.json({
      Status: true,
      Departments: rows,
    });
  } catch (err) {
    res.json({ Status: false });
  }
});
*/
router.get("/departments", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.query(
      `
      SELECT 
        id, 
        name, 
        name_abbreviation 
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
    console.error(err);

    res.json({
      Status: false,
      Error: "Failed to fetch departments",
    });
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

//GET Login user
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

// update user profile
router.put("/user/update", verifyToken, async (req, res) => {
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

//Change password
router.post("/change-password", verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

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
      (user_id, action, entity_type, entity_id, description,
       old_values, new_values, ip_address, user_agent_raw,
       browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        userId,
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

//for ticketting
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
  "/support/report",
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

router.get("/support/my-tickets", verifyToken, async (req, res) => {
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

//GET department staff
router.get("/list", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        Status: false,
        Error: "Unauthorized",
      });
    }

    const { search = "", page = 1, limit = 10 } = req.query;

    const limitNum = parseInt(limit) || 10;
    const offsetNum = (parseInt(page) - 1) * limitNum;

    const [me] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    if (!me.length) {
      return res.status(404).json({
        Status: false,
        Error: "User department not found",
      });
    }

    const departmentId = me[0].department_id;

    const [rows] = await connection.query(
      `SELECT id, title, full_name, gender, division_unit_state, file_number, email, phone_number, designation
       FROM users
       WHERE department_id = ?
       AND id != ?
       AND is_active=1
       AND is_locked=0
       AND (full_name LIKE ? OR email LIKE ?)
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [departmentId, userId, `%${search}%`, `%${search}%`, limitNum, offsetNum],
    );

    const [count] = await connection.query(
      `SELECT COUNT(*) AS total
       FROM users
       WHERE department_id = ?
       AND id != ?
       AND is_active=1
       AND is_locked=0
       AND (full_name LIKE ? OR email LIKE ?)`,
      [departmentId, userId, `%${search}%`, `%${search}%`],
    );

    res.json({
      Status: true,
      Data: rows,
      totalPages: Math.ceil(count[0].total / limitNum),
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

// Get distinct year from departments (Active documents only)
router.get("/documents/years", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const userId = req.user.id;

    // Get user's department
    const [userResult] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    if (!userResult.length) {
      return res.status(404).json({ Status: false });
    }

    const departmentId = userResult[0].department_id;

    // Fetch years
    const [years] = await connection.query(
      `
      SELECT DISTINCT YEAR(created_at) AS year
      FROM documents
      WHERE department_id = ?
      AND is_flagged = 0
      AND is_delete_flagged = 0
      AND document_status = 'Active'
      ORDER BY year DESC
      `,
      [departmentId],
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
// Get distinct year from other departments (Active documents only)
router.get("/documents/section_years", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const userId = req.user.id;

    // Get user's department
    const [userResult] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    if (!userResult.length) {
      return res.status(404).json({ Status: false });
    }

    const departmentId = userResult[0].department_id;

    // Fetch years
    const [years] = await connection.query(
      `
      SELECT DISTINCT YEAR(created_at) AS year
      FROM documents
      WHERE department_id != ?
      AND is_flagged = 0
      AND is_delete_flagged = 0
      AND document_status = 'Active'
      ORDER BY year DESC
      `,
      [departmentId],
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

//Staff department only
router.get("/documents/list", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const category = req.query.category || "";
    const classification = req.query.classification || "";
    const year = req.query.year || "";

    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // Get department
    const [userResult] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    if (!userResult.length) {
      return res.status(404).json({ Status: false });
    }

    const departmentId = userResult[0].department_id;

    // Dynamic WHERE clause
    let where = `
      WHERE d.department_id = ?
      AND d.is_flagged = 0
      AND d.is_delete_flagged = 0
      AND d.document_status = 'Active'
      AND (d.title LIKE ? OR d.document_search_keywords LIKE ?)
    `;

    let params = [departmentId, `%${search}%`, `%${search}%`];

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

    // Count query (with JOIN for safety)
    const [countResult] = await connection.query(
      `
      SELECT COUNT(*) as total
      FROM documents d
      LEFT JOIN document_categories c ON d.category_id = c.id
      LEFT JOIN document_subcategories s ON d.subcategory_id = s.id
      ${where}
      `,
      params,
    );

    const total = countResult[0].total;

    // Fetch documents with category & subcategory names
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
        c.name AS category_name,
        s.name AS subcategory_name
      FROM documents d
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

/* ===========================
   DOCUMENT FROM OTHER DEPARTMENT LIST DETAIL PAGE AND REQUEST DOWNLOAD ACCESS 
=========================== */
// Documents from OTHER departments
router.get("/documents/section/list", verifyToken, async (req, res) => {
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

    // Get logged-in user department
    const [userResult] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    if (!userResult.length) {
      return res.status(404).json({ Status: false });
    }

    const userDepartmentId = userResult[0].department_id;

    // WHERE clause
    let where = `
      WHERE d.department_id != ?
      AND d.is_flagged = 0
      AND d.is_delete_flagged = 0
      AND d.document_status = 'Active'
      AND d.classification IN ('Public','Internal','Confidential')
      AND (d.title LIKE ? OR d.document_search_keywords LIKE ?)
    `;

    let params = [userDepartmentId, `%${search}%`, `%${search}%`];

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
router.get("/documents/section/:id", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const documentId = req.params.id;
    const userId = req.user.id;

    const [user] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    if (!user.length) {
      return res.json({ Status: false, Error: "User not found" });
    }

    const departmentId = user[0].department_id;

    const [docs] = await connection.query(
      `
      SELECT 
        d.*,
        dv.id AS version_id,              
        dv.version_number,               
        dv.file_path,                    
        dept.name AS department_name,
        c.name AS category_name,
        s.name AS subcategory_name
      FROM documents d
      JOIN document_versions dv 
        ON dv.id = d.current_version_id
      LEFT JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN document_categories c ON d.category_id = c.id
      LEFT JOIN document_subcategories s ON d.subcategory_id = s.id
      WHERE d.id = ?
      AND d.department_id != ?
      AND d.document_status = 'Active'
      AND d.classification IN ('Public', 'Internal','Confidential')
      `,
      [documentId, departmentId],
    );

    if (!docs.length) {
      return res.json({
        Status: false,
        Error: "Document not accessible",
      });
    }

    res.json({
      Status: true,
      Data: docs[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false, Error: "Server error" });
  }
});

router.post(
  "/otherworkstramdocuments/request-access",
  verifyToken,
  async (req, res) => {
    try {
      const connection = await connectToDatabase();

      const { document_id, owner_department_id, reason } = req.body;

      const requested_by = req.user.id;

      // prevent duplicate pending request
      const [existing] = await connection.query(
        `SELECT id FROM document_access_requests
       WHERE document_id = ?
       AND requested_by = ?
       AND status IN ('Pending_Department_Review','Pending_Admin_Approval')`,
        [document_id, requested_by],
      );

      if (existing.length > 0) {
        return res.json({
          Status: false,
          Error: "You already have a pending request for this document",
        });
      }

      await connection.query(
        `INSERT INTO document_access_requests
       (document_id, requested_by, owner_department_id, reason)
       VALUES (?, ?, ?, ?)`,
        [document_id, requested_by, owner_department_id, reason],
      );

      /* audit log start */
      const sessionId = req.user.session_id;
      //get document title
      const [[docTitle]] = await connection.query(
        "SELECT * FROM documents WHERE id = ?",
        [document_id],
      );
      const title = docTitle.title;

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
          requested_by,
          sessionId,
          "ACCESS REQUEST",
          "DOCUMENT",
          document_id,
          `Request submitted for document "${title}". Reason: "${reason}"`,
          ip,
          req.headers["user-agent"],
          browser,
          os,
          device,
          "SUCCESS",
        ],
      );
      /*audit log end */

      res.json({
        Status: true,
        Message: "Request submitted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ Status: false });
    }
  },
);

router.get("/document/my-access-requests", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const userId = req.user.id;

    const [rows] = await connection.query(
      `
      SELECT 
        r.id,
        r.document_id,
        r.status,
        r.reason,
        r.created_at,
        r.department_comment,
        r.admin_comment,

        d.title,
        d.current_version_id,  

        dv.file_path,           
        dv.version_number,

        r.owner_department_id,
        dept.name AS owner_department_name,

        p.expires_at

      FROM document_access_requests r

      JOIN documents d 
        ON r.document_id = d.id

      LEFT JOIN document_versions dv
        ON dv.id = d.current_version_id

      LEFT JOIN departments dept 
        ON dept.id = r.owner_department_id

      LEFT JOIN document_access_permissions p
        ON p.request_id = r.id
        AND p.user_id = r.requested_by

      WHERE r.requested_by = ?
      ORDER BY r.created_at DESC
      `,
      [userId],
    );

    res.json({
      Status: true,
      Data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});

/* ===========================
   DEPARTMENT DOCUMENT DETAIL PAGE 
=========================== */
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
        d.document_code,
        d.current_version_id,
        dv.version_number,
        dv.file_path
      FROM documents d
      JOIN document_versions dv ON dv.id = d.current_version_id
      WHERE d.id = ?
      AND d.department_id = ?
      `,
      [id, user.department_id],
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

router.get("/documents/:id/request-status", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const [[data]] = await connection.query(
      `
      SELECT 
        ar.status,
        g.expires_at
      FROM department_document_access_requests ar
      LEFT JOIN department_document_access_grants g
        ON g.request_id = ar.id
      WHERE ar.document_id = ?
      AND ar.requested_by = ?
      ORDER BY ar.id DESC
      LIMIT 1
      `,
      [id, userId],
    );

    res.json({
      Status: true,
      request: data || null,
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
  }
});

router.post("/documents/request-access", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();
  const userId = req.user.id;

  try {
    const { document_id, reason } = req.body;

    if (!document_id || !reason) {
      return res.json({
        Status: false,
        Error: "Document and reason are required",
      });
    }
    // user department id
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    const departmentId = user.department_id;

    /* ===========================
       1️⃣ CHECK ACTIVE APPROVED ACCESS
    =========================== */
    const [[activeAccess]] = await connection.query(
      `
      SELECT g.*
      FROM department_document_access_grants g
      WHERE g.document_id = ?
      AND g.user_id = ?
      AND (g.expires_at IS NULL OR g.expires_at > NOW())
      ORDER BY g.id DESC
      LIMIT 1
      `,
      [document_id, userId],
    );

    if (activeAccess) {
      return res.json({
        Status: false,
        Error: "You already have active access to this document",
      });
    }

    /* ===========================
       2️⃣ CHECK LATEST REQUEST
    =========================== */
    const [[latestRequest]] = await connection.query(
      `
      SELECT id, status
      FROM department_document_access_requests
      WHERE document_id = ? AND requested_by = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [document_id, userId],
    );

    if (latestRequest) {
      const status = (latestRequest.status || "").toLowerCase();

      //BLOCK if pending
      if (status === "pending") {
        return res.json({
          Status: false,
          Error: "You already have a pending request",
        });
      }

      //HANDLE APPROVED CASE PROPERLY
      if (status === "approved") {
        const [[grant]] = await connection.query(
          `
          SELECT expires_at
          FROM department_document_access_grants
          WHERE request_id = ?
          ORDER BY id DESC
          LIMIT 1
          `,
          [latestRequest.id],
        );

        // If grant exists AND still active → block
        if (
          grant &&
          (!grant.expires_at || new Date(grant.expires_at) > new Date())
        ) {
          return res.json({
            Status: false,
            Error: "You already have active access",
          });
        }

        // If expired → allow new request
      }

      // DECLINED → allow automatically
    }

    /* ===========================
       3️⃣ INSERT NEW REQUEST
    =========================== */
    await connection.query(
      `
      INSERT INTO department_document_access_requests
      (requested_by, department_id, document_id, reason, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', NOW())
      `,
      [userId, departmentId, document_id, reason],
    );

    /* audit log start */
    const sessionId = req.user.session_id;
    //get document title
    const [[docTitle]] = await connection.query(
      "SELECT * FROM documents WHERE id = ?",
      [document_id],
    );
    const title = docTitle.title;

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
        "ACCESS REQUEST",
        "DOCUMENT",
        document_id,
        `Access request submitted for document "${title}". Reason: "${reason}"`,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );
    /*audit log end */

    res.json({
      Status: true,
      Message: "Request submitted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
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
    AND d.department_id = ?
    GROUP BY dv.id
    ORDER BY dv.created_at DESC
    `,
      [id, user.department_id],
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

router.get("/my-access-requests", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.query(
      `
  SELECT 
    ar.id,
    ar.document_id,
    ar.status,
    ar.reason,
    ar.created_at,
    g.expires_at,
    d.title,
    d.classification,
    d.current_version_id
  FROM department_document_access_requests ar
  JOIN documents d ON ar.document_id = d.id
  LEFT JOIN department_document_access_grants g 
    ON g.request_id = ar.id
  WHERE ar.requested_by = ?
  ORDER BY ar.created_at DESC
`,
      [req.user.id],
    );

    const cleanRows = rows.map((r) => ({
      ...r,
      status: (r.status || "pending").toLowerCase(),
    }));

    res.json({ Data: cleanRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
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
  //console.log("hint")
  try {
    const connection = await connectToDatabase();
    const userId = req.user.id;
    const sessionId = req.user.session_id;
    const { versionId } = req.params;

    const [[user]] = await connection.query(
      "SELECT department_id, username FROM users WHERE id = ?",
      [userId],
    );
    if (!user) return res.status(404).json({ Error: "User not found" });

    const [[version]] = await connection.query(
      `SELECT dv.*, d.department_id, d.title
       FROM document_versions dv
       JOIN documents d ON d.id = dv.document_id
       WHERE dv.id = ?`,
      [versionId],
    );
    if (!version) return res.status(404).json({ Error: "Document not found" });
    if (version.department_id !== user.department_id)
      return res.status(403).json({ Error: "Unauthorized" });

    const filePath = path.join(__dirname, "..", "Public", version.file_path);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ Error: "File not found" });

    const downloadName = formatDownloadFilename(
      version.original_file_name,
      version.version_number,
    );

    // ✅ Send file using res.download
    res.download(filePath, downloadName, async (err) => {
      if (err) {
        console.error("Download failed:", err);
        return;
      }

      // ✅ Log audit AFTER successful download
      const parser = new UAParser(req.headers["user-agent"]);
      const ua = parser.getResult();
      const browser =
        `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`.trim();
      const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`.trim();
      const device = ua.device.vendor
        ? `${ua.device.vendor} ${ua.device.model}`
        : "Desktop";
      const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

      const documentId = version.document_id;

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
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Error: "Download failed" });
  }
});
// download public/internal documents (cross-department)
router.get(
  "/documents/download/shared/:versionId",
  verifyToken,
  async (req, res) => {
    try {
      const connection = await connectToDatabase();
      const userId = req.user.id;
      const sessionId = req.user.session_id;
      const { versionId } = req.params;

      const [[user]] = await connection.query(
        "SELECT department_id, username FROM users WHERE id = ?",
        [userId],
      );

      if (!user) return res.status(404).json({ Error: "User not found" });

      const [[version]] = await connection.query(
        `SELECT dv.*, d.department_id, d.title, d.classification, dv.original_file_name, dv.version_number, dv.file_path
       FROM document_versions dv
       JOIN documents d ON d.id = dv.document_id
       WHERE dv.id = ?`,
        [versionId],
      );

      if (!version)
        return res.status(404).json({ Error: "Document not found" });

      const documentId = version.document_id;

      // Only allow cross-department download for Public or Internal
      const classification = version.classification?.toLowerCase();
      const isPublicOrInternal = ["public", "internal"].includes(
        classification,
      );

      if (!isPublicOrInternal) {
        return res.status(403).json({ Error: "Access denied" });
      }

      const filePath = path.join(__dirname, "..", "Public", version.file_path);

      if (!fs.existsSync(filePath))
        return res.status(404).json({ Error: "File not found" });

      const mimeType =
        version.mime_type ||
        mime.lookup(filePath) ||
        "application/octet-stream";

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
  },
);
//download for Confidential document (cross-department)
router.get(
  "/documents/download/access/approved/:versionId",
  verifyToken,
  async (req, res) => {
    try {
      const connection = await connectToDatabase();
      const userId = req.user.id;
      const sessionId = req.user.session_id;
      const { versionId } = req.params;

      /* =========================
       1. GET USER
    ========================= */
      const [[user]] = await connection.query(
        "SELECT id, username FROM users WHERE id = ?",
        [userId],
      );

      if (!user) {
        return res.status(404).json({ Error: "User not found" });
      }

      /* =========================
       2. GET DOCUMENT VERSION
    ========================= */
      const [[version]] = await connection.query(
        `
      SELECT 
        dv.id,
        dv.document_id,
        dv.file_path,
        dv.original_file_name,
        dv.version_number,
        d.title
      FROM document_versions dv
      JOIN documents d ON d.id = dv.document_id
      WHERE dv.id = ?
      `,
        [versionId],
      );

      if (!version) {
        return res.status(404).json({ Error: "Document not found" });
      }

      /* =========================
       3. CHECK PERMISSION + EXPIRY
    ========================= */
      const [[permission]] = await connection.query(
        `
      SELECT *
      FROM document_access_permissions
      WHERE user_id = ?
      AND document_id = ?
      AND expires_at > NOW()
      `,
        [userId, version.document_id],
      );

      if (!permission) {
        return res.status(403).json({
          Error: "Access denied or expired",
        });
      }

      /* =========================
       4. FILE PATH CHECK
    ========================= */
      const filePath = path.join(__dirname, "..", "Public", version.file_path);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ Error: "File not found" });
      }

      /* =========================
       5. FORMAT DOWNLOAD NAME
    ========================= */
      const downloadName = formatDownloadFilename(
        version.original_file_name,
        version.version_number,
      );

      /* =========================
       6. DOWNLOAD FILE
    ========================= */
      res.download(filePath, downloadName, async (err) => {
        if (err) {
          console.error("Download error:", err);
          return;
        }

        /* =========================
         7. LOGGING (OPTIONAL)
      ========================= */
        try {
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
              version.document_id,
              `Downloaded document "${version.title}" v${version.version_number}`,
              ip,
              req.headers["user-agent"],
              browser,
              os,
              device,
              "SUCCESS",
            ],
          );

          await connection.query(
            `INSERT INTO download_logs
           (document_id, version_id, category, ip_address, user_agent, browser, os, device)
           VALUES (?,?,?,?,?,?,?,?)`,
            [
              version.document_id,
              versionId,
              "ACCESS_GRANTED",
              ip,
              req.headers["user-agent"],
              browser,
              os,
              device,
            ],
          );
        } catch (logErr) {
          console.error("Logging failed:", logErr);
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ Error: "Download failed" });
    }
  },
);

// DOWNLOAD PROGRAM REPORT
router.get("/report/download/:id", verifyToken, async (req, res) => {
  const reportId = req.params.id;
  const userId = req.user.id;
  const sessionId = req.user.session_id;

  const connection = await connectToDatabase();

  try {
    /* ===============================
       GET REPORT + VALIDATE ACCESS
    =============================== */
    const [[report]] = await connection.query(
      `
      SELECT 
        pr.*,
        ptl.user_id AS team_lead_user_id
      FROM program_reports pr
      JOIN program_team_leads ptl
        ON ptl.program_id = pr.program_id
        AND ptl.state = pr.state
        AND ptl.user_id = pr.uploaded_by
      WHERE pr.id = ?
      `,
      [reportId],
    );

    if (!report) {
      return res
        .status(404)
        .json({ Status: false, Message: "Report not found" });
    }

    // Allow ONLY the team lead who uploaded OR extend later for admin
    if (report.uploaded_by !== userId) {
      return res.status(403).json({ Status: false, Message: "Unauthorized" });
    }

    /* ===============================
       RESOLVE FILE PATH
    =============================== */
    const filePath = path.join(
      __dirname,
      "..",
      "Public",
      report.file_url, // already includes /Reports/filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ Status: false, Message: "File not found" });
    }

    /* ===============================
       HEADERS
    =============================== */
    const mimeType =
      report.file_type || mime.lookup(filePath) || "application/octet-stream";

    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    res.setHeader("Content-Type", mimeType);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(report.file_name)}"`,
    );

    res.setHeader("X-Content-Type-Options", "nosniff");

    /* ===============================
       OPTIONAL AUDIT LOG (simplified)
    =============================== */
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
        "PROGRAM REPORT",
        reportId,
        `Downloaded report "${report.report_title}"`,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );

    /* ===============================
       SEND FILE
    =============================== */
    return res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ Status: false, Message: "Download failed" });
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
   DASHBOARD
=========================== */
router.get("/dashboard-summary", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await connectToDatabase();

    // user department id
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    const departmentId = user.department_id;

    // INTERNAL REQUESTS
    const [internal] = await connection.query(
      `
      SELECT 
        COUNT(*) AS total,
        COALESCE(SUM(status = 'APPROVED'), 0) AS approved,
        COALESCE(SUM(status = 'DECLINED'), 0) AS rejected,
        COALESCE(SUM(status = 'PENDING'), 0) AS pending
      FROM department_document_access_requests
      WHERE requested_by = ?
      `,
      [userId],
    );

    // EXTERNAL REQUESTS
    const [external] = await connection.query(
      `
      SELECT 
        COUNT(*) AS total,
        COALESCE(SUM(status = 'Approved'), 0) AS approved,
        COALESCE(SUM(status = 'Rejected'), 0) AS rejected,
        COALESCE(
          SUM(status IN ('Pending_Department_Review', 'Pending_Admin_Approval')),
          0
        ) AS pending
      FROM document_access_requests
      WHERE requested_by = ?
      `,
      [userId],
    );

    // TOTAL DOWNLOADS
    const [downloads] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM audit_logs
      WHERE user_id = ? AND action = 'DOWNLOAD'
      `,
      [userId],
    );

    // TOTAL DOCUMENTS IN DEPARTMENT
    const [documents] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM documents
      WHERE department_id = ?
      `,
      [departmentId],
    );

    // TOTAL SUPPORT TICKETS SUBMITTED
    const [tickets] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM support_tickets
      WHERE user_id = ?
      `,
      [userId],
    );

    // TOTAL ACTIVE STAFF IN DEPARTMENT
    const [activeStaff] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM users
      WHERE department_id = ? AND is_active = 1 AND is_locked = 0 
      `,
      [departmentId],
    );

    res.json({
      Status: true,
      Data: {
        internal: internal[0],
        external: external[0],
        downloads: downloads[0].total,
        documents: documents[0].total,
        tickets: tickets[0].total,
        activeStaff: activeStaff[0].total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});

router.get("/requests-by-department", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const userId = req.user.id;

    const [rows] = await connection.query(
      `
      SELECT 
        d.name_abbreviation AS department,

        COUNT(*) AS total,

        SUM(status = 'Approved') AS approved,
        SUM(status = 'Declined') AS rejected,

        SUM(
          status IN (
            'Pending_Department_Review',
            'Pending_Admin_Approval',
            'Pending'
          )
        ) AS pending

      FROM (
        -- 🔐 EXTERNAL REQUESTS
        SELECT 
          owner_department_id AS dept_id,
          status
        FROM document_access_requests
        WHERE requested_by = ?

        UNION ALL

        -- 🔐 INTERNAL REQUESTS
        SELECT 
          department_id AS dept_id,
          status
        FROM department_document_access_requests
        WHERE requested_by = ?

      ) combined

      JOIN departments d ON combined.dept_id = d.id

      GROUP BY combined.dept_id
      ORDER BY total DESC
      `,
      [userId, userId],
    );

    res.json({ Status: true, Data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});

router.get("/download-stats", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const userId = req.user.id;
    let { start, end } = req.query;

    // Default: last 3 months
    if (!start || !end) {
      const today = new Date();

      const endDate = today.toISOString().split("T")[0];

      const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);

      start = startDate.toISOString().split("T")[0];
      end = endDate;
    }

    const [rows] = await connection.query(
      `
      SELECT DATE(created_at) AS date, COUNT(*) AS total
      FROM audit_logs
      WHERE user_id = ?
        AND action = 'DOWNLOAD'
        AND created_at >= ?
        AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      `,
      [userId, start, end],
    );

    res.json({ Status: true, Data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});
// GET /staff/recent-activities
router.get("/recent-activities", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await connectToDatabase();

    const [rows] = await connection.query(
      `
      SELECT action, description,	old_values, new_values, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS date
      FROM audit_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
      `,
      [userId],
    );

    res.json({ Status: true, Data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
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
          dept.name_abbreviation AS department,

          u.full_name AS requested_by_name

        FROM document_access_requests r

        JOIN documents d 
          ON r.document_id = d.id

        JOIN users u 
          ON r.requested_by = u.id

        JOIN departments dept 
          ON r.owner_department_id = dept.id

        WHERE r.requested_by = ?
          AND r.status IN (
            'Pending_Admin_Approval',
            'Pending_Department_Review'
          )

        ORDER BY r.created_at DESC
        `,
        [userId],
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
   DEPARTMENT STAFF CONFIDENCIAL DOCUMENT REQUEST ACCESS NOTIFICATION
=========================== */
router.get(
  "/document-internal-access-notification/pending",
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
          r.department_id,

          d.title,

          u.full_name AS requested_by_name

        FROM department_document_access_requests r

        JOIN documents d ON r.document_id = d.id
        JOIN users u ON r.requested_by = u.id

        WHERE 
          r.status = 'PENDING'
          AND r.requested_by = ?

        ORDER BY r.created_at DESC
        `,
        [userId],
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

export { router as StaffRouter };
