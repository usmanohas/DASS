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
/*
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("File delete error:", err);
    });
  }
};
*/

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

//GET Login dept
router.get("/dept", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await connectToDatabase();

    // Step 1: Get user's department_id
    const [userResult] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    if (userResult.length === 0) {
      return res.status(404).json({ Status: false, Error: "User not found." });
    }

    const department_id = userResult[0].department_id;

    // Step 2: Get department details
    const [departmentResult] = await connection.query(
      "SELECT * FROM departments WHERE id = ?",
      [department_id],
    );

    if (departmentResult.length === 0) {
      return res
        .status(404)
        .json({ Status: false, Error: "Department not found." });
    }

    // Return department data
    res.json({ Status: true, department: departmentResult[0] });
  } catch (err) {
    res
      .status(500)
      .json({ Status: false, Error: "Database error", Details: err });
  }
});

/* ===========================
   CHECK DUPLICATE
=========================== */
router.post("/documents/check-duplicate", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { title, fileHash } = req.body;

    const [rows] = await connection.query(
      `
      SELECT 
        d.id AS document_id,
        d.title,
        dv.checksum
      FROM documents d
      LEFT JOIN document_versions dv 
        ON dv.document_id = d.id
      WHERE d.title = ? 
         OR dv.checksum = ?
      `,
      [title, fileHash],
    );

    if (rows.length > 0) {
      return res.json({
        Status: false,
        Duplicate: true,
        Message: "Document with same title or file already exists",
        Data: rows,
      });
    }

    res.json({
      Status: true,
      Duplicate: false,
      Message: "No duplicate found",
    });
  } catch (err) {
    console.error("Duplicate Check Error:", err);
    res.status(500).json({
      Status: false,
      Error: "Duplicate check failed",
    });
  }
});

/* ===========================
   CHECK VERSION DUPLICATE
=========================== */
router.post(
  "/documents/check-version-duplicate",
  verifyToken,
  async (req, res) => {
    try {
      const connection = await connectToDatabase();
      const { documentId, fileHash } = req.body;

      const [rows] = await connection.query(
        `SELECT file_hash FROM document_version WHERE file_hash= ?`,
        [fileHash],
      );

      if (rows.length > 0) {
        return res.json({
          Status: false,
          Duplicate: true,
          Message: "This file already exists",
          Data: rows,
        });
      }

      res.json({
        Status: true,
        Duplicate: false,
        Message: "No duplicate found",
      });
    } catch (err) {
      console.error("Duplicate Check Error:", err);
      res.status(500).json({
        Status: false,
        Error: "Duplicate check failed",
      });
    }
  },
);
/* ===========================
   FETCH DEPARTMENTS
=========================== */
/*
router.get("/department", verifyToken, async (req, res) => {
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

/* ===========================
   UPLOAD DOCUMENT
=========================== */
router.post(
  "/documents/upload",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    const connection = await connectToDatabase();

    // ✅ store uploaded file path for cleanup
    const uploadedFilePath = req.file?.path;

    try {
      if (!req.file) {
        return res.status(400).json({
          Status: false,
          Error: "No file uploaded",
        });
      }

      const userId = req.user.id;

      const [[user]] = await connection.query(
        "SELECT * FROM users WHERE id = ?",
        [userId],
      );

      if (!user) {
        // ✅ remove uploaded file
        deleteFile(uploadedFilePath);

        return res.status(404).json({
          Status: false,
          Error: "User not found",
        });
      }

      // get user department
      const deptId = user.department_id;

      const [[department]] = await connection.query(
        "SELECT * FROM departments WHERE id = ?",
        [deptId],
      );

      if (!department) {
        deleteFile(uploadedFilePath);

        return res.status(404).json({
          Status: false,
          Error: "Department not found",
        });
      }

      const deptAbbreviation = department.name_abbreviation;

      /* ===============================
         FILE HASH
      =============================== */
      const hash = crypto.createHash("sha256");

      const stream = fs.createReadStream(req.file.path);

      for await (const chunk of stream) {
        hash.update(chunk);
      }

      const fileHash = hash.digest("hex");

      const {
        title,
        description,
        category,
        subcategory,
        document_date,
        visibility,
        retention,
        keywords,
        verified_by,
      } = req.body;

      // Convert IDs to Integer
      const categoryId = parseInt(category);
      const subcategoryId = parseInt(subcategory);

      /* ===============================
         VALIDATE CATEGORY
      =============================== */
      const [[validSub]] = await connection.query(
        `
        SELECT id
        FROM document_subcategories
        WHERE id = ?
        AND category_id = ?
        `,
        [subcategoryId, categoryId],
      );

      if (!validSub) {
        // remove uploaded file
        deleteFile(uploadedFilePath);

        return res.status(400).json({
          Status: false,
          Error: "Invalid category and subcategory combination",
        });
      }

      const file = req.file;

      const extension = path
        .extname(file.originalname)
        .slice(1)
        .toLowerCase();

      const mimeType = file.mimetype;

      // document reference code generation
      const year = new Date().getFullYear();

      const [[count]] = await connection.query(
        "SELECT COUNT(*) as total FROM documents WHERE YEAR(created_at) = ?",
        [year],
      );

      const sequence = String(count.total + 1).padStart(6, "0");

      const referenceCode =
        `DOC-${deptAbbreviation}-${year}-${sequence}-${uuidv4().toUpperCase()}`;

      // upload date
      const uploadDate = new Date();

      // retention calculation
      const retentionYears = parseInt(retention, 10);

      const retention_expiring_date = new Date(uploadDate);

      retention_expiring_date.setFullYear(
        retention_expiring_date.getFullYear() + retentionYears,
      );

      /* ===============================
         DUPLICATE CHECK
      =============================== */
      const [dup] = await connection.query(
        "SELECT id FROM document_versions WHERE checksum = ?",
        [fileHash],
      );

      if (dup.length > 0) {
        // remove duplicate uploaded file
        deleteFile(uploadedFilePath);

        return res.json({
          Status: false,
          Error: "Duplicate document detected",
        });
      }

      await connection.beginTransaction();

      /* ===============================
         INSERT DOCUMENT
      =============================== */
      const [docRes] = await connection.query(
        `
        INSERT INTO documents
        (
          title,
          description,
          category_id,
          subcategory_id,
          document_date,
          classification,
          document_search_keywords,
          department_id,
          document_code,
          document_version,
          retention_period_years,
          retention_expiry_date,
          document_status,
          uploaded_by
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `,
        [
          title,
          description,
          categoryId,
          subcategoryId,
          document_date,
          visibility,
          keywords,
          user.department_id,
          referenceCode,
          1.0,
          retention,
          retention_expiring_date,
          "Active",
          userId,
        ],
      );

      const documentId = docRes.insertId;

      /* ===============================
         INSERT VERSION
      =============================== */
      const [verRes] = await connection.query(
        `
        INSERT INTO document_versions
        (
          document_id,
          version_number,
          file_name,
          original_file_name,
          file_path,
          checksum,
          file_size,
          type,
          mime_type,
          version_verified_by,
          version_notes,
          uploaded_by,
          is_active
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)
        `,
        [
          documentId,
          1.0,
          file.filename,
          file.originalname,
          `/Documents/${file.filename}`,
          fileHash,
          file.size,
          extension,
          mimeType,
          verified_by,
          "Initial upload",
          userId,
        ],
      );

      /* ===============================
         UPDATE CURRENT VERSION
      =============================== */
      await connection.query(
        "UPDATE documents SET current_version_id = ? WHERE id = ?",
        [verRes.insertId, documentId],
      );

      /* ===============================
         AUDIT LOG
      =============================== */
      const sessionId = req.user.session_id;

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
        `
        INSERT INTO audit_logs
        (
          user_id,
          session_id,
          action,
          entity_type,
          entity_id,
          description,
          ip_address,
          user_agent_raw,
          browser,
          os,
          device,
          status
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        `,
        [
          userId,
          sessionId,
          "UPLOAD DOCUMENT",
          "DOCUMENT",
          verRes.insertId,
          `Uploaded document "${title}"`,
          ip,
          req.headers["user-agent"],
          browser,
          os,
          device,
          "SUCCESS",
        ],
      );

      await connection.commit();

      res.json({
        Status: true,
        Message: "Document uploaded successfully",
        document_id: documentId,
      });
    } catch (err) {
      console.error(err);

      // rollback transaction
      await connection.rollback();

      // IMPORTANT: remove uploaded file if anything fails
      deleteFile(uploadedFilePath);

      res.status(500).json({
        Status: false,
        Error: "Upload failed",
      });
    }
  },
);

/* ===========================
   GET DOCUMENT DETAILS PAGE
=========================== */

router.get("/documents/department", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();
  const userId = req.user.id;

  const [[user]] = await connection.query(
    "SELECT department_id FROM users WHERE id = ?",
    [userId],
  );

  const [rows] = await connection.query(
    `
    SELECT d.id, d.title, d.reference_code, d.doc_version AS current_version,
           dv.version_number AS version
    FROM documents d
    JOIN document_version dv ON dv.id = d.current_version_id
    WHERE d.department_id = ?
    `,
    [user.department_id],
  );

  res.json({ Status: true, Data: rows });
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

//DFP department only
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

/* ===========================
   DOCUMENT DETAIL PAGE 
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
        d.retention_expiry_date,
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

/* ===========================
   UPLOAD DOCUMENT VERSION
=========================== */
router.post(
  "/documents/:id/upload-version",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    const connection = await connectToDatabase();
    const documentId = req.params.id;
    const userId = req.user.id;

    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ Status: false, Error: "File is required" });
      }

      const [[user]] = await connection.query(
        "SELECT * FROM users WHERE id = ?",
        [userId],
      );
      if (!user) {
        return res.status(404).json({ Status: false, Error: "User not found" });
      }
      const logUsername = user.username;

      //get user department
      const deptId = user.department_id;
      const [[department]] = await connection.query(
        "SELECT * FROM departments WHERE id = ?",
        [deptId],
      );

      const deptAbbreviation = department.name_abbreviation;

      /* File hash (stream safe) */
      const hash = crypto.createHash("sha256");
      const stream = fs.createReadStream(req.file.path);
      for await (const chunk of stream) hash.update(chunk);
      const fileHash = hash.digest("hex");

      const { version_notes, verified_by } = req.body;
      //console.log(req.body);
      const file = req.file;
      const extension = path.extname(file.originalname).slice(1).toLowerCase();
      const mimeType = file.mimetype;
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

      /* ===============================
        DUPLICATE CHECK
      =============================== */
      const [dup] = await connection.query(
        "SELECT id FROM document_versions WHERE checksum = ?",
        [fileHash],
      );
      if (dup.length) {
        return res.status(409).json({
          Status: false,
          Error: "Duplicate document detected. This file already exists.",
        });
      }

      /* ===============================
         1️⃣ Get current document info
      =============================== */

      const [docRows] = await connection.query(
        "SELECT department_id, document_code, title FROM documents WHERE id = ?",
        [documentId],
      );

      if (docRows.length === 0) {
        return res
          .status(404)
          .json({ Status: false, Error: "Document not found" });
      }

      const document = docRows[0];

      /* ===============================
         2️⃣ Get latest version number
      =============================== */

      const [latestVersion] = await connection.query(
        "SELECT MAX(version_number) as maxVersion FROM document_versions WHERE document_id = ?",
        [documentId],
      );

      const currentVersion = parseFloat(latestVersion[0].maxVersion || 0);

      // Add 0.1 safely and fix precision
      const newVersionNumber = parseFloat((currentVersion + 1.0).toFixed(1));

      /* ===============================
         3️⃣ Insert new version
      =============================== */

      const [insertResult] = await connection.query(
        `INSERT INTO document_versions
         (document_id, version_number, file_name, original_file_name,
          file_path, checksum, file_size, type, mime_type,
          version_verified_by, version_notes, uploaded_by, is_active)

         VALUES (?,?,?,?,?,?,?,?,?,?,?, ?,1)`,
        [
          documentId,
          newVersionNumber,
          file.filename,
          file.originalname,
          `/Documents/${file.filename}`,
          fileHash,
          file.size,
          extension,
          mimeType,
          verified_by,
          version_notes,
          userId,
        ],
      );

      /* ===============================
         Deactivate previous versions
      =============================== */

      await connection.query(
        `UPDATE document_versions 
         SET is_active = 0 
         WHERE document_id = ? AND id != ?`,
        [documentId, insertResult.insertId],
      );

      /* ===============================
         UPDATE DOCUMENTS TABEL CURRENT VERSION AND CURRENT VERSION ID
      =============================== */
      await connection.query(
        `UPDATE documents SET document_version = ?, current_version_id = ? WHERE id = ?`,
        [newVersionNumber, insertResult.insertId, documentId],
      );

      /* ===============================
         ACTIVITY LOG INSERT
      =============================== */

      /* audit log start */
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
    ip_address, user_agent_raw, browser, os, device, status)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId,
          sessionId,
          "DOCUMENT_NEW_VERSION_UPLOADED",
          "DOCUMENT",
          insertResult.insertId,
          `Uploaded version v${newVersionNumber} for document "${document.title}" (${document.document_code})`,
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
        Message: "New version uploaded successfully",
      });
    } catch (err) {
      console.error("Upload version error:", err);
      res.status(500).json({ Status: false, Error: "Upload failed" });
    }
  },
);

/* ===========================
   UPDATE DOCUMENT
=========================== */
router.put("/documents/:id", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();
  const userId = req.user.id;
  const documentId = req.params.id;

  const {
    title,
    doc_category_id,
    doc_sub_category_id,
    description,
    doc_keywords,
    classification,
    active_version_id,
  } = req.body;

  try {
    await connection.beginTransaction();

    // Check document exists
    const [[existingDoc]] = await connection.query(
      "SELECT * FROM documents WHERE id = ?",
      [documentId],
    );

    if (!existingDoc) {
      await connection.rollback();
      return res.status(404).json({
        Status: false,
        Error: "Document not found",
      });
    }

    // Get username
    const [[user]] = await connection.query(
      "SELECT username FROM users WHERE id = ?",
      [userId],
    );

    if (!user) {
      await connection.rollback();
      return res.status(404).json({
        Status: false,
        Error: "User not found",
      });
    }

    const logUsername = user.username;

    // Update document metadata
    await connection.query(
      `UPDATE documents
       SET title = ?, category_id = ?, subcategory_id = ?, 
           description = ?, document_search_keywords = ?, classification = ?
       WHERE id = ?`,
      [
        title,
        doc_category_id,
        doc_sub_category_id,
        description,
        doc_keywords,
        classification,
        documentId,
      ],
    );

    // Handle active version change
    if (active_version_id) {
      await connection.query(
        `UPDATE document_versions
         SET is_active = 0
         WHERE document_id = ?`,
        [documentId],
      );

      await connection.query(
        `UPDATE document_versions
         SET is_active = 1
         WHERE id = ? AND document_id = ?`,
        [active_version_id, documentId],
      );

      await connection.query(
        `UPDATE documents
         SET current_version_id = ?
         WHERE id = ?`,
        [active_version_id, documentId],
      );
    }

    // Detect changed fields and store old/new values
    let changes = [];
    let oldValues = {};
    let newValues = {};

    if (existingDoc.title !== title) {
      changes.push("Title");
      oldValues.title = existingDoc.title;
      newValues.title = title;
    }

    if (existingDoc.category_id !== doc_category_id) {
      changes.push("Category");
      oldValues.category_id = existingDoc.category_id;
      newValues.category_id = doc_category_id;
    }

    if (existingDoc.subcategory_id !== doc_sub_category_id) {
      changes.push("Subcategory");
      oldValues.subcategory_id = existingDoc.subcategory_id;
      newValues.subcategory_id = doc_sub_category_id;
    }

    if (existingDoc.description !== description) {
      changes.push("Description");
      oldValues.description = existingDoc.description;
      newValues.description = description;
    }

    if (existingDoc.document_search_keywords !== doc_keywords) {
      changes.push("Keywords");
      oldValues.document_search_keywords = existingDoc.document_search_keywords;
      newValues.document_search_keywords = doc_keywords;
    }

    if (existingDoc.classification !== classification) {
      changes.push("Classification");
      oldValues.classification = existingDoc.classification;
      newValues.classification = classification;
    }

    if (
      active_version_id &&
      existingDoc.current_version_id !== active_version_id
    ) {
      changes.push("Active Version");
      oldValues.current_version_id = existingDoc.current_version_id;
      newValues.current_version_id = active_version_id;
    }

    const changeDescription =
      changes.length > 0
        ? `Updated: ${changes.join(", ")}`
        : "Document updated (no changes detected)";

    /* audit log start */
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

    // Insert log only when changes is made
    if (changes.length > 0) {
      await connection.query(
        `INSERT INTO audit_logs
   (user_id, session_id, action, entity_type, entity_id, description,
    old_values, new_values,
    ip_address, user_agent_raw, browser, os, device, status)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId,
          sessionId,
          "DOCUMENT_UPDATED",
          "DOCUMENT",
          documentId,
          changeDescription,
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
    /*audit log end */

    await connection.commit();

    res.json({
      Status: true,
      Message: "Document updated successfully",
    });
  } catch (err) {
    await connection.rollback();
    console.error("Edit Document Error:", err);

    res.status(500).json({
      Status: false,
      Error: "Failed to update document",
    });
  } finally {
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

    if (version.department_id !== user.department_id) {
      return res.status(403).json({ Error: "Unauthorized" });
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
      //console.log(versionId)

      /* =========================
         VALIDATE VERSION ID
      ========================= */
      if (!versionId || isNaN(versionId)) {
        return res.status(400).json({
          Error: "Invalid document version",
        });
      }

      /* =========================
         GET USER
      ========================= */
      const [[user]] = await connection.query(
        `SELECT id, username FROM users WHERE id = ?`,
        [userId],
      );

      if (!user) {
        return res.status(404).json({
          Error: "User not found",
        });
      }

      /* =========================
         GET DOCUMENT VERSION
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
        return res.status(404).json({
          Error: "Document version not found",
        });
      }

      /* =========================
         CHECK ACCESS PERMISSION
      ========================= */
      const [[permission]] = await connection.query(
        `
        SELECT id, expires_at
        FROM document_access_permissions
        WHERE user_id = ?
        AND document_id = ?
        AND expires_at > NOW()
        `,
        [userId, version.document_id],
      );

      if (!permission) {
        return res.status(403).json({
          Error: "Your access has expired or was not granted",
        });
      }

      /* =========================
         FILE PATH
      ========================= */
      const cleanedPath = version.file_path.replace(/^\/+/, "");

      const filePath = path.join(
        __dirname,
        "..",
        "Public",
        cleanedPath,
      );

      //console.log("DOWNLOAD PATH:", filePath);

      /* =========================
         FILE EXISTS?
      ========================= */
      if (!fs.existsSync(filePath)) {
        console.log("FILE NOT FOUND:", filePath);

        return res.status(404).json({
          Error: "File not found on server",
        });
      }

      /* =========================
         DOWNLOAD NAME
      ========================= */
      const downloadName = formatDownloadFilename(
        version.original_file_name,
        version.version_number,
      );

      /* =========================
         HEADERS
      ========================= */
      res.setHeader(
        "Access-Control-Expose-Headers",
        "Content-Disposition",
      );

      /* =========================
         AUDIT LOGGING
      ========================= */
      try {
        const parser = new UAParser(req.headers["user-agent"]);
        const ua = parser.getResult();

        const browser =
          `${ua.browser.name || "Unknown"} ${
            ua.browser.version || ""
          }`.trim();

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
        console.error("LOGGING ERROR:", logErr);
      }

      /* =========================
         SEND FILE
      ========================= */
      return res.download(filePath, downloadName);

    } catch (err) {
      console.error("DOWNLOAD ERROR:", err);

      return res.status(500).json({
        Error: "Download failed",
      });
    }
  },
);

// DOWNLOAD PROGRAM REPORT
router.get("/report/download/:id", verifyToken, async (req, res) => {
  const reportId = req.params.id;
  const userId = req.user.id;
  const sessionId = req.user.session_id;

  if (!reportId || isNaN(reportId)) {
    return res.status(400).json({
      Status: false,
      Message: "Invalid report id",
    });
  }

  const connection = await connectToDatabase();

  try {
    /* ===============================
       GET REPORT
    =============================== */
    const [[report]] = await connection.query(
      `SELECT pr.* FROM program_reports pr WHERE pr.id = ?`,
      [reportId]
    );

    if (!report) {
      return res.status(404).json({
        Status: false,
        Message: "Report not found",
      });
    }

    /* ===============================
       FILE PATH
    =============================== */
    const filePath = path.join(
      process.cwd(),
      "Public",
      report.file_url.replace(/^\//, "")
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        Status: false,
        Message: "File not found on server",
      });
    }

    /* ===============================
       HEADERS
    =============================== */
    const mimeType =
      report.file_type ||
      mime.lookup(filePath) ||
      "application/octet-stream";

    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Type", mimeType);

    const safeFileName = encodeURIComponent(report.file_name);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFileName}"`
    );

    res.setHeader("X-Content-Type-Options", "nosniff");

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
      ]
    );

    /* ===============================
       SEND FILE
    =============================== */
    return res.sendFile(filePath);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      Status: false,
      Message: "Download failed",
    });
  }
});

/* ===========================
   RETENTION PERIOD NOTIFICATION
=========================== */
router.get("/retention-alerts", verifyToken, async (req, res) => {
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

    // FETCH ALERTS FOR LOGGED USER
    const userId = req.user.id;
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );
    const department_id = user.department_id;

    const [rows] = await connection.query(
      `
      SELECT 
        id,
        title,
        retention_expiry_date,
        CASE
          WHEN retention_expiry_date < CURDATE() THEN 'expired'
          WHEN retention_expiry_date BETWEEN CURDATE() 
               AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
          THEN 'expiring'
        END AS status
      FROM documents
      WHERE retention_expiry_date IS NOT NULL
      AND department_id = ?
      AND (
        retention_expiry_date < CURDATE()
        OR retention_expiry_date BETWEEN CURDATE() 
           AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      )
      AND is_archived = 0
      AND is_delete_flagged = 0
      ORDER BY retention_expiry_date ASC
      `,
      [department_id],
    );

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
            r.status = 'Pending_Department_Review'
            AND r.owner_department_id = ?

          ORDER BY r.created_at DESC
          `,
        [user.department_id],
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

          u.full_name AS requested_by_name,
          u.division_unit_state AS requester_division

        FROM department_document_access_requests r

        JOIN documents d ON r.document_id = d.id
        JOIN users u ON r.requested_by = u.id

        WHERE 
          r.status = 'PENDING'
          AND r.department_id = ?

        ORDER BY r.created_at DESC
        `,
        [user.department_id],
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
   EXPIRED DOCUMENT DETAIL PAGE 
=========================== */
router.get("/document/expired/:id", verifyToken, async (req, res) => {
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
      AND d.is_flagged = 1
      AND d.is_delete_flagged = 0
      AND d.is_archived = 0
      AND d.document_status = "Expired"
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

router.get("/document/expired/:id/versions", verifyToken, async (req, res) => {
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

// INITIATE EXPIRED DOCUMENT DELETE
router.put("/documents/:id/delete", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();
  const { id } = req.params;
  const { reason } = req.body;
  const actionTime = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    if (!reason) {
      return res.json({
        Status: false,
        Error: "Deletion reason required",
      });
    }

    await connection.query(
      `UPDATE documents
       SET
       is_delete_flagged = 1,
       document_status = 'Pending Deletion',
       deletion_reason = ?
       WHERE id = ?`,
      [reason, id],
    );

    //get document title
    const [[docTitle]] = await connection.query(
      "SELECT * FROM documents WHERE id = ?",
      [id],
    );
    const title = docTitle.title;

    /* audit log start */
    const sessionId = req.user.session_id;
    const userId = req.user.id;

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
        "DOCUMENT DELETION REQUEST",
        "DOCUMENT",
        id,
        `Sent deletion request for document "${title}". Reason: ${reason}. Requested at: ${actionTime}`,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );
    /*audit log end */

    res.json({ Status: true });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Delete failed" });
  }
});

// INITIATE DOCUMENT DELETE WHEN NOT EXPIRED
router.put(
  "/documents/:id/delete-not-expired",
  verifyToken,
  async (req, res) => {
    const connection = await connectToDatabase();
    const { id } = req.params;
    const { reason } = req.body;
    const actionTime = new Date().toISOString().slice(0, 19).replace("T", " ");

    try {
      if (!reason) {
        return res.json({
          Status: false,
          Error: "Deletion reason required",
        });
      }

      await connection.query(
        `UPDATE documents
       SET
       is_flagged = 1,
       is_delete_flagged = 1,
       is_delete = 1,
       delete_at = ?,
       document_status = 'Deleted',
       deletion_reason = ?
       WHERE id = ?`,
        [actionTime, reason, id],
      );

      //get document title
      const [[docTitle]] = await connection.query(
        "SELECT * FROM documents WHERE id = ?",
        [id],
      );
      const title = docTitle.title;

      /* audit log start */
      const sessionId = req.user.session_id;
      const userId = req.user.id;

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
          "DELETE DOCUMENT",
          "DOCUMENT",
          id,
          `Deleted document "${title}". Reason: ${reason}. Requested at: ${actionTime}`,
          ip,
          req.headers["user-agent"],
          browser,
          os,
          device,
          "SUCCESS",
        ],
      );
      /*audit log end */

      res.json({ Status: true });
    } catch (err) {
      console.error(err);
      res.json({ Status: false, Error: "Delete failed" });
    }
  },
);

// ACHIVED EXPIRED DOCUMENT
router.put("/documents/:id/archive", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();
  const { id } = req.params;

  try {
    await connection.query(
      `UPDATE documents
       SET
       document_status = 'Archived',
       is_archived = 1,
       archived_at = NOW()
       WHERE id = ?`,
      [id],
    );

    //get document title
    const [[docTitle]] = await connection.query(
      "SELECT * FROM documents WHERE id = ?",
      [id],
    );
    const title = docTitle.title;

    /* audit log start */
    const sessionId = req.user.session_id;
    const userId = req.user.id;

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
        "DOCUMENT ARCHIVED",
        "DOCUMENT",
        id,
        `Archived document "${title}"`,
        ip,
        req.headers["user-agent"],
        browser,
        os,
        device,
        "SUCCESS",
      ],
    );
    /*audit log end */

    res.json({ Status: true });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Archive failed" });
  }
});

/* ===========================
   DOCUMENT FROM OTHER DEPARTMENT DETAIL PAGE AND REQUEST DOWNLOAD ACCESS 
=========================== */
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

router.post("/documents/request-access", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { document_id, owner_department_id, reason } = req.body;

    const requested_by = req.user.id;

    /* =========================
       CHECK ACTIVE PERMISSION
    ========================= */
    const [[activePermission]] = await connection.query(
      `
      SELECT id, expires_at
      FROM document_access_permissions
      WHERE document_id = ?
      AND user_id = ?
      AND expires_at > NOW()
      `,
      [document_id, requested_by],
    );

    if (activePermission) {
      return res.json({
        Status: false,
        Error:
          "You already have active access to this document",
      });
    }

    /* =========================
       PREVENT DUPLICATE REQUEST
    ========================= */
    const [existing] = await connection.query(
      `
      SELECT id
      FROM document_access_requests
      WHERE document_id = ?
      AND requested_by = ?
      AND status IN (
        'Pending_Department_Review',
        'Pending_Admin_Approval'
      )
      `,
      [document_id, requested_by],
    );

    if (existing.length > 0) {
      return res.json({
        Status: false,
        Error:
          "You already have a pending request for this document",
      });
    }

    /* =========================
       INSERT REQUEST
    ========================= */
    await connection.query(
      `
      INSERT INTO document_access_requests
      (
        document_id,
        requested_by,
        owner_department_id,
        reason
      )
      VALUES (?, ?, ?, ?)
      `,
      [document_id, requested_by, owner_department_id, reason],
    );

    /* =========================
       AUDIT LOG
    ========================= */
    const sessionId = req.user.session_id;

    const [[docTitle]] = await connection.query(
      `
      SELECT title
      FROM documents
      WHERE id = ?
      `,
      [document_id],
    );

    const title = docTitle?.title || "Unknown Document";

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
      `
      INSERT INTO audit_logs
      (
        user_id,
        session_id,
        action,
        entity_type,
        entity_id,
        description,
        ip_address,
        user_agent_raw,
        browser,
        os,
        device,
        status
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      [
        requested_by,
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

    /* =========================
       RESPONSE
    ========================= */
    return res.json({
      Status: true,
      Message: "Access request submitted successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      Status: false,
      Message: "Server error",
    });
  }
});

//fetch request for DFP Review
router.get(
  "/document/cross-department-requests",
  verifyToken,
  async (req, res) => {
    try {
      const connection = await connectToDatabase();

      const userId = req.user.id;
      const { page = 1, limit = 10, status = "", search = "" } = req.query;

      const limitNum = parseInt(limit);
      const offset = (parseInt(page) - 1) * limitNum;

      /* =========================
       GET USER DEPARTMENT
    ========================= */
      const [[user]] = await connection.query(
        "SELECT department_id FROM users WHERE id = ?",
        [userId],
      );

      const departmentId = user.department_id;

      /* =========================
       FILTERS
    ========================= */
      let filters = `WHERE dar.owner_department_id = ?`;

      let params = [departmentId];

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

router.post("/department-review", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { request_id, action, comment } = req.body;
    const reviewerId = req.user.id;

    let status = "";

    if (action === "approve") {
      status = "Pending_Admin_Approval";
    } else if (action === "reject") {
      status = "Rejected";
    }

    await connection.query(
      `
      UPDATE document_access_requests
      SET 
        status = ?,
        department_reviewer_id = ?,
        department_comment = ?,
        department_reviewed_at = NOW()
      WHERE id = ?
    `,
      [status, reviewerId, comment, request_id],
    );

    res.json({
      Status: true,
      Message: "Request reviewed successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});

/* ===========================
   DFP CROSS-DEPARTMENT REQUEST 
=========================== */
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

    dap.expires_at

  FROM document_access_requests r

  JOIN documents d 
    ON d.id = r.document_id

  LEFT JOIN document_versions dv
    ON dv.id = d.current_version_id

  LEFT JOIN departments dept
    ON dept.id = r.owner_department_id

  /* ✅ FIXED JOIN */
  LEFT JOIN document_access_permissions dap
    ON dap.document_id = r.document_id
    AND dap.user_id = r.requested_by

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
   DEPARTMENT STAFF API
=========================== */
router.get("/staff", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const designation = req.query.designation || "";

    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // get user department
    const [user] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    if (!user.length) {
      return res.json({ Status: false, Error: "User not found" });
    }

    const departmentId = user[0].department_id;

    /* -------------------------
       BASE WHERE CONDITION
    ------------------------- */

    let where = `
      WHERE department_id = ?
      AND role_id = 4
      AND id != ?
      AND is_removed = 0
    `;

    let params = [departmentId, userId];

    /* -------------------------
       SEARCH FILTER
    ------------------------- */

    if (search) {
      where += ` AND (full_name LIKE ? OR email LIKE ? OR username LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    /* -------------------------
       DESIGNATION FILTER
    ------------------------- */

    if (designation) {
      where += ` AND designation = ?`;
      params.push(designation);
    }

    /* -------------------------
       TOTAL COUNT
    ------------------------- */

    const [count] = await connection.query(
      `SELECT COUNT(*) as total FROM users ${where}`,
      params,
    );

    /* -------------------------
       FETCH STAFF
    ------------------------- */

    const [rows] = await connection.query(
      `
      SELECT 
        id,
        title,
        file_number,
        gender,
        full_name,
        designation,
        email,
        phone_number,
        username,
        is_active,
        is_locked,
        role_id,
        created_at
      FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    res.json({
      Status: true,
      Data: rows,
      Total: count[0].total,
      Pages: Math.ceil(count[0].total / limit),
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

router.post("/staff", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const {
      title,
      full_name,
      gender,
      designation,
      fileNumber,
      email,
      phone_number,
    } = req.body;

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
      `SELECT id FROM users WHERE email=? OR phone_number=? OR file_number=?`,
      [email, phone_number, fileNumber],
    );

    if (exists.length > 0) {
      return res.json({
        Status: false,
        Error:
          "Staff with same email, file number or phone number already exists",
      });
    }

    // hash password
    const password_hash = await bcrypt.hash(fileNumber, 10);

    const [insertResult] = await connection.query(
      `
      INSERT INTO users
      (title, full_name, gender, designation, file_number, email, phone_number,
       username, password_hash, department_id, role_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4, 1)
      `,
      [
        title,
        full_name,
        gender,
        designation,
        fileNumber,
        email,
        phone_number,
        email,
        password_hash,
        departmentId,
      ],
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
        "CREATE USER",
        "USER",
        newUserId,
        `Created new staff account for ${full_name}`,
        null,
        JSON.stringify({
          full_name,
          gender,
          designation,
          file_number: fileNumber,
          email,
          phone_number,
          department_id: departmentId,
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
      Message: "Staff created successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

router.put("/staff/:id", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const staffId = req.params.id;
    const adminId = req.user.id;

    const {
      title,
      full_name,
      gender,
      designation,
      fileNumber,
      email,
      phone_number,
    } = req.body;

    // Validation
    if (!full_name || !designation || !fileNumber) {
      return res.json({
        Status: false,
        Error: "Full name, designation and file number are required",
      });
    }

    /* -------------------------
       GET EXISTING STAFF DATA
    ------------------------- */

    const [[existingStaff]] = await connection.query(
      `SELECT title, full_name, gender, designation, file_number, email, phone_number
       FROM users
       WHERE id = ?`,
      [staffId],
    );

    if (!existingStaff) {
      return res.json({
        Status: false,
        Error: "Staff not found",
      });
    }

    /* -------------------------
       CHECK DUPLICATES
    ------------------------- */

    const [duplicate] = await connection.query(
      `
      SELECT id FROM users
      WHERE (email = ? OR phone_number = ? OR file_number = ?)
      AND id != ?
      LIMIT 1
      `,
      [email, phone_number, fileNumber, staffId],
    );

    if (duplicate.length > 0) {
      return res.json({
        Status: false,
        Error:
          "Email, phone number, or file number already exists for another staff",
      });
    }

    /* -------------------------
       UPDATE STAFF
    ------------------------- */

    await connection.query(
      `
      UPDATE users
      SET
        title = ?,
        full_name = ?,
        gender = ?,
        designation = ?,
        file_number = ?,
        email = ?,
        phone_number = ?
      WHERE id = ?
      `,
      [
        title,
        full_name,
        gender,
        designation,
        fileNumber,
        email,
        phone_number,
        staffId,
      ],
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

    const { changes, oldValues, newValues } = detectChanges(existingStaff, {
      title,
      full_name,
      gender,
      designation,
      file_number: fileNumber,
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

      const changeDescription = `Updated staff fields: ${changes.join(", ")}`;

      await connection.query(
        `INSERT INTO audit_logs
        (user_id, session_id, action, entity_type, entity_id, description,
         old_values, new_values,
         ip_address, user_agent_raw, browser, os, device, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          adminId,
          sessionId,
          "UPDATE STAFF",
          "USER",
          staffId,
          changeDescription,
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
      Message: "Staff updated successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      Status: false,
      Error: "Server error occurred",
    });
  }
});

router.put("/staff/:id/reset-password", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const staffId = req.params.id;
    const { password } = req.body;

    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    /* -------------------------
       GET STAFF DETAILS
    ------------------------- */

    const [[staff]] = await connection.query(
      "SELECT full_name, email FROM users WHERE id=?",
      [staffId],
    );

    if (!staff) {
      return res.json({
        Status: false,
        Error: "Staff not found",
      });
    }

    /* -------------------------
       HASH PASSWORD
    ------------------------- */

    const password_hash = await bcrypt.hash(password, 10);

    await connection.query(`UPDATE users SET password_hash=? WHERE id=?`, [
      password_hash,
      staffId,
    ]);

    /* -------------------------
       DEVICE INFO
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

    /* -------------------------
       AUDIT LOG
    ------------------------- */

    await connection.query(
      `INSERT INTO audit_logs
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "RESET PASSWORD",
        "USER",
        staffId,
        `Password reset for staff: ${staff.full_name}`,
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

    res.json({
      Status: true,
      Message: "Password reset successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

router.put("/staff/:id/active", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const staffId = req.params.id;
    const { active } = req.body;

    const adminId = req.user.id;

    // Get current staff info
    const [[staff]] = await connection.query(
      "SELECT full_name, is_active FROM users WHERE id = ?",
      [staffId],
    );

    if (!staff) {
      return res.json({
        Status: false,
        Error: "Staff not found",
      });
    }

    // Update status
    await connection.query("UPDATE users SET is_active=? WHERE id=?", [
      active ? 1 : 0,
      staffId,
    ]);

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

    const action = active ? "ACTIVATE USER" : "DEACTIVATE USER";

    await connection.query(
      `INSERT INTO audit_logs
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        action,
        "USER",
        staffId,
        `${action} for ${staff.full_name}`,
        JSON.stringify({ is_active: staff.is_active }),
        JSON.stringify({ is_active: active ? 1 : 0 }),
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
      Message: active ? "User activated" : "User deactivated",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

router.put("/staff/:id/lock", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const staffId = req.params.id;
    const { lock } = req.body;

    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    /* -------------------------
       GET STAFF DETAILS
    ------------------------- */

    const [[staff]] = await connection.query(
      "SELECT full_name, is_locked FROM users WHERE id=?",
      [staffId],
    );

    if (!staff) {
      return res.json({
        Status: false,
        Error: "Staff not found",
      });
    }

    const oldValue = staff.is_locked;
    const newValue = lock ? 1 : 0;

    /* -------------------------
       UPDATE LOCK STATUS
    ------------------------- */

    await connection.query(`UPDATE users SET is_locked=? WHERE id=?`, [
      newValue,
      staffId,
    ]);

    /* -------------------------
       DEVICE INFO
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

    /* -------------------------
       AUDIT ACTION
    ------------------------- */

    const action = lock ? "LOCK USER" : "UNLOCK USER";

    /* -------------------------
       AUDIT LOG
    ------------------------- */

    await connection.query(
      `INSERT INTO audit_logs
      (user_id, session_id, action, entity_type, entity_id, description,
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        action,
        "USER",
        staffId,
        `${action} for staff: ${staff.full_name}`,
        JSON.stringify({ is_locked: oldValue }),
        JSON.stringify({ is_locked: newValue }),
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
      Message: lock ? "User locked successfully" : "User unlocked successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

router.put("/staff/:id/remove", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const staffId = req.params.id;
    const { reason } = req.body;

    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    /* GET STAFF */

    const [[staff]] = await connection.query(
      `SELECT id, title, full_name, file_number, department_id,
              is_removed, is_active, is_locked
       FROM users WHERE id=?`,
      [staffId],
    );

    if (!staff) {
      return res.json({
        Status: false,
        Error: "Staff not found",
      });
    }

    /* SAVE OLD VALUES */

    const oldValues = {
      is_removed: staff.is_removed,
      is_active: staff.is_active,
      is_locked: staff.is_locked,
      department_id: staff.department_id,
    };

    /* UPDATE STAFF STATUS */

    await connection.query(
      `UPDATE users 
       SET is_removed=1, is_active=0, is_locked=1
       WHERE id=?`,
      [staffId],
    );

    /* NEW VALUES */

    const newValues = {
      is_removed: 1,
      is_active: 0,
      is_locked: 1,
      department_id: staff.department_id,
      movement_reason: reason,
    };

    /* INSERT MOVEMENT RECORD */

    await connection.query(
      `INSERT INTO staff_movements
       (user_id,file_number,from_department_id,movement_type,created_by)
       VALUES (?,?,?,?,?)`,
      [staff.id, staff.file_number, staff.department_id, reason, adminId],
    );

    /* DEVICE INFO */

    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser =
      `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`.trim();

    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`.trim();

    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";

    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    /* AUDIT LOG */

    await connection.query(
      `INSERT INTO audit_logs
      (user_id,session_id,action,entity_type,entity_id,description,
       old_values,new_values,
       ip_address,user_agent_raw,browser,os,device,status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "REMOVED STAFF",
        "USER",
        staffId,
        `${staff.title} ${staff.full_name} removed from department (${reason})`,
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
      Message: "Staff removed successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

router.post("/staff/lookup", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const { file_number } = req.body;

    const adminId = req.user.id;
    const sessionId = req.user.session_id;

    /* GET CURRENT DEPARTMENT */

    const [[admin]] = await connection.query(
      "SELECT department_id FROM users WHERE id=?",
      [adminId],
    );

    /* FIND TRANSFER RECORD */

    const [[movement]] = await connection.query(
      `SELECT * FROM staff_movements
       WHERE file_number=? 
       AND movement_type='TRANSFER'
       AND processed=0`,
      [file_number],
    );

    if (!movement) {
      return res.json({
        Status: false,
        Error: "No transfer record found",
      });
    }

    /* GET STAFF DETAILS */

    const [[staff]] = await connection.query(
      `SELECT id,title, full_name, department_id, is_removed, is_active, is_locked
       FROM users WHERE id=?`,
      [movement.user_id],
    );

    if (!staff) {
      return res.json({
        Status: false,
        Error: "Staff not found",
      });
    }

    /* OLD VALUES */

    const oldValues = {
      department_id: staff.department_id,
      is_removed: staff.is_removed,
      is_active: staff.is_active,
      is_locked: staff.is_locked,
    };

    /* UPDATE STAFF DEPARTMENT */

    await connection.query(
      `UPDATE users
       SET department_id=?, is_removed=0, is_active=1, is_locked=0
       WHERE id=?`,
      [admin.department_id, movement.user_id],
    );

    /* NEW VALUES */

    const newValues = {
      department_id: admin.department_id,
      is_removed: 0,
      is_active: 1,
      is_locked: 0,
    };

    /* MARK MOVEMENT PROCESSED */

    await connection.query(
      `UPDATE staff_movements
       SET processed=1, to_department_id=?
       WHERE id=?`,
      [admin.department_id, movement.id],
    );

    /* DEVICE INFORMATION */

    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const browser =
      `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`.trim();

    const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`.trim();

    const device = ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : "Desktop";

    const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

    /* AUDIT LOG */

    await connection.query(
      `INSERT INTO audit_logs
      (user_id,session_id,action,entity_type,entity_id,description,
       old_values,new_values,
       ip_address,user_agent_raw,browser,os,device,status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        adminId,
        sessionId,
        "TRANSFER STAFF",
        "USER",
        staff.id,
        `${staff.title} ${staff.full_name} transferred to department via lookup`,
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
      Message: "Staff transferred successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      Status: false,
      Error: "Server error",
    });
  }
});

//import staff bulk registration
router.post(
  "/staff/import",
  verifyToken,
  importUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.json({
          Status: false,
          Error: "No Excel file uploaded",
        });
      }

      const connection = await connectToDatabase();

      // Read Excel buffer
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

      const sheetName = workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(sheet);
      /*
      console.log("========== EXCEL DATA ==========");
      console.log(rows);
      console.log("Total rows:", rows.length);
      console.log("================================");

      */

      if (rows.length === 0) {
        return res.json({
          Status: false,
          Error: "Excel file is empty",
        });
      }

      const userId = req.user.id;

      // get department of logged-in user
      const [[user]] = await connection.query(
        "SELECT department_id FROM users WHERE id = ?",
        [userId],
      );

      if (!user) {
        return res.json({
          Status: false,
          Error: "User department not found",
        });
      }

      const departmentId = user.department_id;

      let inserted = 0;
      let skipped = 0;

      for (const row of rows) {
        //console.log("Processing row:", row);

        const title = row.title || "";
        const full_name = row.full_name || "";
        const gender = row.gender || "";
        const designation = row.designation || "";
        const file_number = row.file_number || "";
        const email = row.email || "";
        const phone_number = row.phone_number || "";

        if (!full_name || !file_number) {
          // console.log("Skipping row (missing required fields)");
          skipped++;
          continue;
        }

        // Check duplicates
        const [exists] = await connection.query(
          `SELECT id FROM users WHERE email = ? OR phone_number = ? OR file_number = ?`,
          [email, phone_number, file_number],
        );

        if (exists.length > 0) {
          //console.log("Duplicate skipped:", file_number);
          skipped++;
          continue;
        }

        // password = file number
        const password_hash = await bcrypt.hash(file_number.toString(), 10);

        await connection.query(
          `
          INSERT INTO users
          (title, full_name, gender, designation, file_number, email, phone_number, username, password_hash, department_id, role_id, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4, 1)
          `,
          [
            title,
            full_name,
            gender,
            designation,
            file_number,
            email,
            phone_number,
            email,
            password_hash,
            departmentId,
          ],
        );

        inserted++;
      }

      //console.log("Import completed:", { inserted, skipped });

      res.json({
        Status: true,
        Inserted: inserted,
        Skipped: skipped,
        Total: rows.length,
      });
    } catch (err) {
      //console.error("Staff import error:", err);

      res.status(500).json({
        Status: false,
        Error: "Import failed",
      });
    }
  },
);

/* ===========================
   STAFF DASHBOARD
=========================== */
router.get("/staff/:id/dashboard", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  const staffId = req.params.id;

  try {
    /* =========================================
       GET CURRENT LOGGED-IN USER DEPARTMENT
    ========================================= */
    const [[loggedInUser]] = await connection.query(
      `
      SELECT id, department_id
      FROM users
      WHERE id=?
      `,
      [req.user.id],
    );

    if (!loggedInUser) {
      return res.json({
        Status: false,
        Error: "Unauthorized access",
      });
    }

    /* =========================================
       FETCH STAFF ONLY INSIDE SAME DEPARTMENT
    ========================================= */
    const [[staff]] = await connection.query(
      `
      SELECT id, full_name, department_id
      FROM users
      WHERE id=? AND department_id=?
      `,
      [staffId, loggedInUser.department_id],
    );

    if (!staff) {
      return res.json({
        Status: false,
        Error: "Staff record not found in your department",
      });
    }

    /* =========================================
       TOTAL DOWNLOADS
    ========================================= */
    const [[downloads]] = await connection.query(
      `
      SELECT COUNT(*) total
      FROM audit_logs
      WHERE user_id=?
      AND action="DOWNLOAD"
      AND status="SUCCESS"
      `,
      [staffId],
    );

    /* =========================================
       TOTAL LOGINS
    ========================================= */
    const [[logins]] = await connection.query(
      `
      SELECT COUNT(*) total
      FROM audit_logs
      WHERE user_id=?
      AND action="USER_LOGIN"
      `,
      [staffId],
    );

    /* =========================================
       REQUEST STATS
    ========================================= */
    const [[requestStats]] = await connection.query(
      `
      SELECT
        SUM(CASE
          WHEN status='Approved' THEN 1
          ELSE 0
        END) approved,

        SUM(CASE
          WHEN status='Rejected' THEN 1
          ELSE 0
        END) rejected,

        SUM(CASE
          WHEN status IN (
            'Pending_Department_Review',
            'Pending_Admin_Approval'
          )
          THEN 1
          ELSE 0
        END) pending

      FROM document_access_requests
      WHERE requested_by=?
      `,
      [staffId],
    );

    /* =========================================
       CURRENT YEAR MONTHLY ACTIVITIES
    ========================================= */
    const [monthlyActivity] = await connection.query(
      `SELECT
        MONTH(created_at) month_num,
        MONTHNAME(created_at) month,
        COUNT(*) total
      FROM audit_logs
      WHERE user_id=?
      AND YEAR(created_at)=YEAR(CURDATE())
      GROUP BY MONTH(created_at), MONTHNAME(created_at)
      ORDER BY MONTH(created_at)
      `,
      [staffId],
    );

    /* =========================================
       CURRENT MONTH DOWNLOADS
    ========================================= */
    const [[monthlyDownloads]] = await connection.query(
      `
      SELECT COUNT(*) total
      FROM audit_logs
      WHERE user_id=?
      AND action="DOWNLOAD"
      AND MONTH(created_at)=MONTH(CURDATE())
      AND YEAR(created_at)=YEAR(CURDATE())
      `,
      [staffId],
    );

    /* =========================================
       MULTIPLE IP CHECK
    ========================================= */
    const [[ipCheck]] = await connection.query(
      `
      SELECT COUNT(DISTINCT ip_address) total
      FROM audit_logs
      WHERE user_id=?
      AND action="USER_LOGIN"
      `,
      [staffId],
    );

    const multipleIPs = ipCheck.total > 3;

    /* =========================================
       RECENT ACTIVITIES
    ========================================= */
    const [recentActivities] = await connection.query(
      `
      SELECT action, description, created_at
      FROM audit_logs
      WHERE user_id=?
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [staffId],
    );

    /* =========================================
       LOGIN LOGS
    ========================================= */
    const [loginLogs] = await connection.query(
      `
      SELECT
        ip_address,
        device,
        browser,
        created_at,
        COUNT(*) OVER (PARTITION BY ip_address) ip_count

      FROM audit_logs
      WHERE user_id=?
      AND action="LOGIN"

      ORDER BY created_at DESC
      LIMIT 5
      `,
      [staffId],
    );

    /* =========================================
       RESPONSE
    ========================================= */
    res.json({
      Status: true,

      staff,

      stats: {
        downloads: downloads.total,
        logins: logins.total,

        approved: requestStats.approved || 0,
        pending: requestStats.pending || 0,
        rejected: requestStats.rejected || 0,

        monthly_downloads: monthlyDownloads.total,

        multiple_ips: multipleIPs,
      },

      monthlyActivity,

      recentActivities,

      logins: loginLogs,
    });
  } catch (err) {
    console.error(err);

    res.json({
      Status: false,
      Error: "Failed to load dashboard",
    });
  }
});


/* ===========================
   DEPARTMENT DASHBOARD
=========================== */
router.get("/dashboard/summary", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id=?",
      [req.user.id],
    );

    const dept = user.department_id;

    const [[totalStaff]] = await connection.query(
      `SELECT COUNT(*) total 
       FROM users 
       WHERE department_id=? AND is_removed=0`,
      [dept],
    );

    //console.log(totalStaff);

    const [[activeStaff]] = await connection.query(
      "SELECT COUNT(*) total FROM users WHERE department_id=? AND is_active=1 AND is_removed=0 AND is_locked=0",
      [dept],
    );

    //console.log(activeStaff);

    const [[docs]] = await connection.query(
      `SELECT COUNT(*) total 
       FROM documents 
       WHERE department_id=?`,
      [dept],
    );

    //console.log(docs);

    const [[archived]] = await connection.query(
      `SELECT COUNT(*) total 
       FROM documents 
       WHERE department_id=? AND is_archived=1`,
      [dept],
    );

    const [[deleted]] = await connection.query(
      `SELECT COUNT(*) total 
       FROM documents 
       WHERE department_id=? AND is_delete=1`,
      [dept],
    );

    //console.log(archived);

    const [[uploads]] = await connection.query(
      `SELECT COUNT(*) total 
       FROM documents 
       WHERE department_id=? 
       AND YEAR(created_at)=YEAR(NOW())`,
      [dept],
    );

    //console.log(uploads);

    // ✅ FIXED DOWNLOADS (join documents)
    const [[downloads]] = await connection.query(
      `SELECT COUNT(*) total
       FROM download_logs dl
       JOIN documents d ON d.id = dl.document_id
       WHERE d.department_id=?
       AND MONTH(dl.downloaded_at)=MONTH(NOW())`,
      [dept],
    );

    //console.log(downloads);

    // ✅ TOTAL STORAGE
    const [[storage]] = await connection.query(
      `SELECT SUM(dv.file_size) total_size
       FROM document_versions dv
       JOIN documents d ON d.id = dv.document_id
       WHERE d.department_id=?`,
      [dept],
    );

    //console.log(storage);

    res.json({
      Status: true,
      Data: {
        total_staff: totalStaff.total,
        active_staff: activeStaff.total,
        total_documents: docs.total,
        archived_documents: archived.total,
        deleted_documents: deleted.total,
        uploads_this_month: uploads.total,
        downloads_this_month: downloads.total,
        total_storage: storage.total_size || 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});

router.get("/dashboard/activity", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const days = parseInt(req.query.days) || 30;

    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id=?",
      [req.user.id],
    );

    const dept = user.department_id;

    const [rows] = await connection.query(
      `
      SELECT DATE(date) as date,
      SUM(type='upload') as uploads,
      SUM(type='download') as downloads
      FROM (
        SELECT created_at as date, 'upload' as type
        FROM documents
        WHERE department_id=? 
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)

        UNION ALL

        SELECT dl.downloaded_at as date, 'download' as type
        FROM download_logs dl
        JOIN documents d ON d.id = dl.document_id
        WHERE d.department_id=?
        AND dl.downloaded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ) t
      GROUP BY DATE(date)
      ORDER BY date ASC
      `,
      [dept, days, dept, days],
    );

    res.json({ Status: true, Data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});

router.get("/dashboard/top-documents", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id=?",
      [req.user.id],
    );

    const dept = user.department_id;

    const [rows] = await connection.query(
      `
      SELECT d.title, COUNT(dl.id) as downloads
      FROM download_logs dl
      JOIN documents d ON d.id = dl.document_id
      WHERE d.department_id=?
      GROUP BY dl.document_id
      ORDER BY downloads DESC
      LIMIT 5
      `,
      [dept],
    );

    res.json({ Status: true, Data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});

router.get("/dashboard/recent-uploads", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id=?",
      [req.user.id],
    );

    const dept = user.department_id;

    const [rows] = await connection.query(
      `
      SELECT d.title, dv.file_size, dv.type, d.created_at
      FROM documents d
      JOIN document_versions dv ON dv.id = d.current_version_id
      WHERE d.department_id=?
      ORDER BY d.created_at DESC
      LIMIT 5
      `,
      [dept],
    );

    res.json({ Status: true, Data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: false });
  }
});

router.get("/dashboard/file-types", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  try {
    // ✅ Get current user's department
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id=?",
      [req.user.id],
    );

    if (!user) {
      return res.json({ Status: false, Error: "User not found" });
    }

    const dept = user.department_id;

    // ✅ Get file type analysis (CORRECT JOIN)
    const [rows] = await connection.query(
      `
      SELECT 
        dv.type AS file_type,
        COUNT(*) AS total_files,
        SUM(dv.file_size) AS total_size
      FROM document_versions dv
      INNER JOIN documents d ON d.id = dv.document_id
      WHERE d.department_id = ?
      GROUP BY dv.type
      ORDER BY total_files DESC
      `,
      [dept],
    );

    res.json({
      Status: true,
      Data: rows,
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
   DELETE AND ARCHIVE DOCUMENT 
=========================== */

router.get("/document/archive-delete", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const userId = req.user.id;

  try {
    /* ✅ GET USER DEPARTMENT */
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id=?",
      [userId],
    );

    const dept = user.department_id;

    /* ✅ FETCH DOCUMENTS (ONLY THIS DEPARTMENT) */
    const [docs] = await connection.query(
      `
      SELECT 
        d.*,
        rr.status AS restore_status
      FROM documents d
      LEFT JOIN restore_requests rr 
        ON rr.document_id = d.id 
        AND rr.department_id = ?
        AND rr.status = 'Pending'
      WHERE (d.is_archived = 1 OR d.is_delete = 1)
        AND d.department_id = ?
        AND (d.document_status = 'Deleted' OR d.document_status = 'Archived')
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [dept, dept, limit, offset],
    );

    /* ✅ COUNT (MATCH SAME FILTER!) */
    const [[count]] = await connection.query(
      `
      SELECT COUNT(*) total
      FROM documents
      WHERE (is_archived = 1 OR is_delete = 1)
        AND department_id = ?
        AND (document_status = 'Deleted' OR document_status = 'Archived')
      `,
      [dept],
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

router.post("/document/:id/request-restore", verifyToken, async (req, res) => {
  const connection = await connectToDatabase();

  const documentId = req.params.id;
  const userId = req.user.id;
  const { reason } = req.body;

  try {
    /* ✅ GET USER DEPARTMENT */
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id=?",
      [userId],
    );

    const dept = user.department_id;

    // 🔥 CHECK EXISTING PENDING REQUEST
    const [existing] = await connection.query(
      `SELECT * FROM restore_requests 
       WHERE document_id=? AND department_id=? AND status='Pending'`,
      [documentId, dept],
    );

    if (existing.length > 0) {
      return res.json({
        Status: false,
        Message: "Request already pending",
      });
    }

    // ✅ INSERT NEW REQUEST
    await connection.query(
      `INSERT INTO restore_requests (document_id, department_id, requested_by, reason)
       VALUES (?, ?, ?, ?)`,
      [documentId, dept, userId, reason],
    );

    res.json({
      Status: true,
      Message: "Restore request sent",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Message: "Server error" });
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

router.get(
  "/staff/access-requests/pending-count",
  verifyToken,
  async (req, res) => {
    try {
      const connection = await connectToDatabase();
      const userId = req.user.id;

      // get DFP department
      const [[user]] = await connection.query(
        "SELECT department_id FROM users WHERE id = ?",
        [userId],
      );

      const [[count]] = await connection.query(
        `SELECT COUNT(*) as total
       FROM department_document_access_requests r
       JOIN documents d ON d.id = r.document_id
       WHERE d.department_id = ?
       AND r.status = 'PENDING'`,
        [user.department_id],
      );

      res.json({ Status: true, total: count.total });
    } catch (err) {
      console.error(err);
      res.status(500).json({ Status: false });
    }
  },
);

router.get("/staff/access-reqests", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const [rows] = await connection.query(`
      SELECT 
        ar.id,
        ar.status,
        ar.reason,
        ar.department_id,
        ar.review_note,
        ar.created_at,
        u.full_name,
        u.division_unit_state,
        u.email,
        d.title,
        d.classification
      FROM department_document_access_requests ar
      JOIN users u ON ar.requested_by = u.id
      JOIN documents d ON ar.document_id = d.id
      ORDER BY ar.created_at DESC
    `);

    // ✅ Normalize status to lowercase
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

router.get("/staff/access-requests", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const userId = req.user.id;

    /* =========================
       GET USER DEPARTMENT
    ========================= */
    const [[user]] = await connection.query(
      "SELECT department_id FROM users WHERE id = ?",
      [userId],
    );

    const departmentId = user.department_id;

    /* =========================
       FETCH ONLY SAME DEPARTMENT REQUESTS
    ========================= */
    const [rows] = await connection.query(
      `
      SELECT 
        ar.id,
        ar.status,
        ar.reason,
        ar.department_id,
        ar.review_note,
        ar.created_at,

        u.full_name,
        u.division_unit_state,
        u.email,

        d.title,
        d.classification

      FROM department_document_access_requests ar

      JOIN users u ON ar.requested_by = u.id
      JOIN documents d ON ar.document_id = d.id

      WHERE ar.department_id = ?

      ORDER BY ar.created_at DESC
      `,
      [departmentId],
    );

    /* =========================
       NORMALIZE STATUS
    ========================= */
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

router.post(
  "/staff/access-requests/:id/approve",
  verifyToken,
  async (req, res) => {
    try {
      const { expires_at } = req.body;

      if (!expires_at) {
        return res.json({
          Status: false,
          Error: "Expiry date required",
        });
      }

      const connection = await connectToDatabase();

      // ✅ Get request WITH document + user info
      const [[request]] = await connection.query(
        `
        SELECT 
          ar.*,
          d.title AS document_title,
          u.full_name AS requester_name
        FROM department_document_access_requests ar
        JOIN documents d ON ar.document_id = d.id
        JOIN users u ON ar.requested_by = u.id
        WHERE ar.id = ?
        `,
        [req.params.id],
      );

      if (!request) {
        return res.json({
          Status: false,
          Error: "Request not found",
        });
      }

      // ✅ Update request
      await connection.query(
        `UPDATE department_document_access_requests 
         SET 
           status = 'approved',
           reviewed_by = ?,
           reviewed_at = NOW(),
           review_note = NULL
         WHERE id = ?`,
        [req.user.id, req.params.id],
      );

      // ✅ Insert grant
      await connection.query(
        `INSERT INTO department_document_access_grants
        (request_id, user_id, document_id, granted_by, expires_at)
        VALUES (?, ?, ?, ?, ?)`,
        [
          request.id,
          request.requested_by,
          request.document_id,
          req.user.id,
          expires_at,
        ],
      );

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
      const sessionId = req.user.session_id;

      /* ===========================
         AUDIT LOG (ENHANCED)
      =========================== */
      await connection.query(
        `INSERT INTO audit_logs
        (user_id, session_id, action, entity_type, entity_id, description,
         old_values, new_values,
         ip_address, user_agent_raw, browser, os, device, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          sessionId,
          "APPROVE ACCESS",
          "DOCUMENT",
          request.document_id,
          `Approved access to document "${request.document_title}" for ${request.requester_name} expires at: ${expires_at}`,
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

      res.json({ Status: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        Status: false,
        Error: "Server error",
      });
    }
  },
);

router.post(
  "/staff/access-requests/:id/reject",
  verifyToken,
  async (req, res) => {
    try {
      const { reason } = req.body;

      const connection = await connectToDatabase();

      // ✅ Get request WITH document + requester info
      const [[request]] = await connection.query(
        `
        SELECT 
          ar.*,
          d.title AS document_title,
          u.full_name AS requester_name
        FROM department_document_access_requests ar
        JOIN documents d ON ar.document_id = d.id
        JOIN users u ON ar.requested_by = u.id
        WHERE ar.id = ?
        `,
        [req.params.id],
      );

      if (!request) {
        return res.json({
          Status: false,
          Error: "Request not found",
        });
      }

      const rejectReason = reason || "No reason provided";

      // ✅ Update request
      await connection.query(
        `UPDATE department_document_access_requests 
         SET 
           status='declined',
           reviewed_by = ?,
           reviewed_at = NOW(),
           review_note = ?
         WHERE id=?`,
        [req.user.id, rejectReason, req.params.id],
      );

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
      const sessionId = req.user.session_id;

      /* ===========================
         AUDIT LOG (MATCH APPROVE)
      =========================== */
      await connection.query(
        `INSERT INTO audit_logs
        (user_id, session_id, action, entity_type, entity_id, description,
         old_values, new_values,
         ip_address, user_agent_raw, browser, os, device, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          sessionId,
          "DENIED ACCESS",
          "DOCUMENT",
          request.document_id,
          `Denied access to document "${request.document_title}" for ${request.requester_name}`,
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

      res.json({ Status: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        Status: false,
        Error: "Server error",
      });
    }
  },
);

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

/* ===========================
   PROGRAM
=========================== */

router.get("/programs", verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const userId = req.user.id;

  const connection = await connectToDatabase();

  try {
    /* ✅ GET USER DEPARTMENT AND ROLE */
    const [[user]] = await connection.query(
      "SELECT department_id, role_id FROM users WHERE id = ?",
      [userId],
    );

    const dept = user.department_id;
    const role = user.role_id;

    /* ✅ JOIN USERS TABLE */
    const [data] = await connection.query(
      `
      SELECT 
        p.*, 
        u.full_name AS created_by_name,
        u.file_number AS created_by_file_number
      FROM programs p
      LEFT JOIN users u ON u.id = p.created_by
      WHERE p.department_id = ? 
        AND p.role_id = ?
      ORDER BY p.id DESC
      LIMIT ?, ?
      `,
      [dept, role, offset, limit],
    );

    const [count] = await connection.query(
      `
      SELECT COUNT(*) as total 
      FROM programs 
      WHERE department_id = ? AND role_id = ?
      `,
      [dept, role],
    );

    res.json({
      Status: true,
      data,
      totalPages: Math.ceil(count[0].total / limit),
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Message: "Server error" });
  }
});

router.post("/programs", verifyToken, async (req, res) => {
  const { name, description, reportNameFormat } = req.body;
  const connection = await connectToDatabase();
  const userId = req.user.id;
  const sessionId = req.user.session_id;

  if (!name || !description) {
    return res.json({
      Status: false,
      Message: "Name and description required",
    });
  }

  try {
    /* ✅ GET USER DEPARTMENT AND ROLE */
    const [[user]] = await connection.query(
      "SELECT department_id, role_id FROM users WHERE id=?",
      [userId],
    );

    const dept = user.department_id;
    const role = user.role_id;

    /* ✅ CHECK DUPLICATE (CASE-INSENSITIVE) */
    const [existing] = await connection.query(
      `
      SELECT id FROM programs 
      WHERE LOWER(name) = LOWER(?)
      `,
      [name.trim()],
    );

    if (existing.length > 0) {
      return res.json({
        Status: false,
        Message: "Program already exists",
      });
    }

    /* ✅ INSERT */
    const [insertResult] = await connection.query(
      `
      INSERT INTO programs 
      (name, description, reportNameFormat, department_id, role_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        name.trim(),
        description.trim(),
        reportNameFormat.trim(),
        dept,
        role,
        userId,
      ],
    );

    const newProgramId = insertResult.insertId;

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
       old_values, new_values,
       ip_address, user_agent_raw, browser, os, device, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        userId,
        sessionId,
        "CREATE PROGRAM",
        "PROGRAM",
        newProgramId,
        `Created new program: ${name}`,
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

    res.json({
      Status: true,
      Message: "Program created successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Message: "Server error" });
  }
});

router.get("/programs/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const connection = await connectToDatabase();

  try {
    // ✅ MySQL returns [rows]
    const [programRows] = await connection.query(
      "SELECT * FROM programs WHERE id = ?",
      [id],
    );

    const [teamLeadsRows] = await connection.query(
      `SELECT 
          ptl.id,
          ptl.state,
          ptl.submission_status,
          u.full_name AS name,
          u.file_number
       FROM program_team_leads ptl
       JOIN users u ON u.id = ptl.user_id
       WHERE ptl.program_id = ?`,
      [id],
    );

    res.json({
      Status: true,
      program: programRows[0] || null,
      teamLeads: teamLeadsRows,
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Message: "Server error" });
  }
});

router.put("/programs/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const sessionId = req.user.session_id;
  const userId = req.user.id;
  const { name, description, reportNameFormat } = req.body;

  const connection = await connectToDatabase();

  if (!name || !description) {
    return res.json({
      Status: false,
      Message: "Name and description required",
    });
  }

  try {
    // ✅ Prevent duplicate name in same department
    const [[existing]] = await connection.query(
      "SELECT id FROM programs WHERE name = ? AND id != ?",
      [name, id],
    );

    if (existing) {
      return res.json({
        Status: false,
        Message: "Program name already exists",
      });
    }

    /* -------------------------
       GET EXISTING PROGRAM DATA
    ------------------------- */

    const [[existingProgram]] = await connection.query(
      `SELECT name, description, reportNameFormat
       FROM programs
       WHERE id = ?`,
      [id],
    );

    if (!existingProgram) {
      return res.json({
        Status: false,
        Error: "Program not found",
      });
    }

    await connection.query(
      `UPDATE programs 
       SET name = ?, description = ?, reportNameFormat = ? 
       WHERE id = ?`,
      [name, description, reportNameFormat, id],
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

    const { changes, oldValues, newValues } = detectChanges(existingProgram, {
      name,
      description,
      reportNameFormat,
    });

    /* -------------------------
       AUDIT LOG
    ------------------------- */

    if (changes.length > 0) {
      const parser = new UAParser(req.headers["user-agent"]);
      const ua = parser.getResult();

      const browser =
        `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`.trim();

      const os = `${ua.os.name || "Unknown"} ${ua.os.version || ""}`.trim();

      const device = ua.device.vendor
        ? `${ua.device.vendor} ${ua.device.model}`
        : "Desktop";

      const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;

      const changeDescription = `Updated program fields: ${changes.join(", ")}`;

      await connection.query(
        `INSERT INTO audit_logs
        (user_id, session_id, action, entity_type, entity_id, description,
         old_values, new_values,
         ip_address, user_agent_raw, browser, os, device, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId,
          sessionId,
          "UPDATE PROGRAM",
          "PROGRAM",
          id,
          changeDescription,
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
      Message: "Program updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Message: "Server error" });
  }
});

router.get(
  "/users/by-file-number/:fileNumber",
  verifyToken,
  async (req, res) => {
    const { fileNumber } = req.params;
    const connection = await connectToDatabase();

    try {
      const [user] = await connection.query(
        "SELECT id, title, designation, full_name, file_number FROM users WHERE file_number = ? AND is_active = ?",
        [fileNumber, 1],
      );

      if (user.length === 0) {
        return res
          .status(404)
          .json({ Status: false, Message: "User not found" });
      }

      return res.json(user[0]);
    } catch (err) {
      console.error(err);
      return res.json({ Status: false, Message: "Server error" });
    }
  },
);

router.post("/programs/add-team-lead", verifyToken, async (req, res) => {
  const { program_id, user_id, state } = req.body;
  const sessionId = req.user.session_id;
  const userId = req.user.id;
  const connection = await connectToDatabase();

  try {
    // 🔒 Prevent duplicate assignment
    const [existing] = await connection.query(
      "SELECT * FROM program_team_leads WHERE program_id = ? AND state = ?",
      [program_id, state],
    );

    if (existing.length > 0) {
      return res.json({
        Status: false,
        Message: "State already assigned to another lead",
      });
    }

    // 🔒 Prevent same user twice
    const [duplicateUser] = await connection.query(
      "SELECT * FROM program_team_leads WHERE program_id = ? AND user_id = ?",
      [program_id, user_id],
    );

    if (duplicateUser.length > 0) {
      return res.json({
        Status: false,
        Message: "User already assigned",
      });
    }

    // Get program name
    const [[program]] = await connection.query(
      "SELECT name FROM programs WHERE id = ?",
      [program_id],
    );

    // Get assigned user details
    const [[assignedUser]] = await connection.query(
      "SELECT full_name, file_number FROM users WHERE id = ?",
      [user_id],
    );

    // Insert
    const [insertResult] = await connection.query(
      `INSERT INTO program_team_leads (program_id, user_id, state)
         VALUES (?, ?, ?)`,
      [program_id, user_id, state],
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
        userId,
        sessionId,
        "ASSIGN TEAM LEAD",
        "PROGRAM",
        newUserId,
        `Assigned ${assignedUser.full_name} (${assignedUser.file_number}) as Team Lead for "${program.name}" in ${state}`,
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
      Message: "Team lead added successfully",
    });
  } catch (err) {
    console.error(err);
    return res.json({ Status: false, Message: "Server error" });
  }
});

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

router.get("/programs/:id/reports", verifyToken, async (req, res) => {
  const programId = req.params.id;
  const connection = await connectToDatabase();

  try {
    const [rows] = await connection.query(`
      SELECT 
        ptl.id,
        ptl.state,
        ptl.submission_status,
        u.full_name AS name,

        pr.id AS report_id,
        pr.file_url,
        pr.report_title,
        pr.file_extension

      FROM program_team_leads ptl

      JOIN users u ON u.id = ptl.user_id

      LEFT JOIN program_reports pr
        ON pr.program_id = ptl.program_id
        AND pr.state = ptl.state
        AND pr.uploaded_by = ptl.user_id

      WHERE ptl.program_id = ?
      ORDER BY ptl.state ASC
    `, [programId]);

    res.json({ Status: true, data: rows });

  } catch (err) {
    console.error(err);
    res.json({ Status: false });
  }
});



export { router as DepartmentRouter };
