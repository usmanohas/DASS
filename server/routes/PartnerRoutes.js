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

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const partnerId = req.user.id;

    const [[partner]] = await connection.query(
      `
      SELECT 
        full_name,
        email,
        phone_number,
        division_unit_state AS address,
        created_at
      FROM users
      WHERE id = ?
      `,
      [partnerId],
    );

    res.json({
      Status: true,
      data: partner,
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch profile" });
  }
});

router.get("/summary", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const partnerId = req.user.id;

    // TOTAL SHARED + EXPIRED
    const [[stats]] = await connection.query(
      `
      SELECT 
        COUNT(*) AS totalShared,
        SUM(CASE WHEN expiry_date < NOW() THEN 1 ELSE 0 END) AS totalExpired
      FROM document_shares
      WHERE partner_id = ?
      `,
      [partnerId],
    );

    // TOTAL DOWNLOADS

    const [[downloads]] = await connection.query(
      `
  SELECT COUNT(*) AS totalDownloads
  FROM partner_document_downloads
  WHERE partner_id = ?
  `,
      [partnerId],
    );

    res.json({
      Status: true,
      data: {
        totalShared: stats.totalShared || 0,
        totalExpired: stats.totalExpired || 0,
        totalDownloads: downloads.totalDownloads || 0,
      },
    });
    console.log(data);
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch summary" });
  }
});

router.get("/recent-documents", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const partnerId = req.user.id;

    const [rows] = await connection.query(
      `
      SELECT 
        d.id,
        d.title,
        ds.created_at AS shared_at,
        ds.expiry_date
      FROM document_shares ds
      JOIN documents d ON d.id = ds.document_id
      WHERE ds.partner_id = ?
      ORDER BY ds.created_at DESC
      LIMIT 5
      `,
      [partnerId],
    );

    res.json({
      Status: true,
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch recent documents" });
  }
});

router.get("/documents", verifyToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const partnerId = req.user.id;

    const { page = 1, limit = 10, search = "" } = req.query;

    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    let filters = `WHERE ds.partner_id = ?`;
    let params = [partnerId];

    if (search) {
      filters += ` AND d.title LIKE ?`;
      params.push(`%${search}%`);
    }

    /* ================= GET DATA ================= */
    const [rows] = await connection.query(
      `
      SELECT 
        d.id,
        d.title,
        d.document_code,
        d.current_version_id,
        d.document_version,
        ds.created_at AS shared_at,
        ds.expiry_date,

        (
          SELECT COUNT(*) 
          FROM partner_document_downloads dd 
          WHERE dd.document_id = d.id 
          AND dd.partner_id = ?
        ) AS download_count

      FROM document_shares ds
      JOIN documents d ON d.id = ds.document_id

      ${filters}

      ORDER BY ds.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [partnerId, ...params, limitNum, offset],
    );

    /* ================= COUNT ================= */
    const [count] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM document_shares ds
      JOIN documents d ON d.id = ds.document_id
      ${filters}
      `,
      params,
    );

    res.json({
      Status: true,
      data: rows,
      totalPages: Math.ceil(count[0].total / limitNum),
    });
  } catch (err) {
    console.error(err);
    res.json({ Status: false });
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

    /* ================= TRACK PARTNER DOWNLOAD ================= */
    await connection.query(
      `
      INSERT INTO partner_document_downloads (document_id, partner_id)
      VALUES (?, ?)
      `,
      [documentId, userId],
    );

    return res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ Error: "Download failed" });
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

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.json({
        Status: false,
        Error: "Current password is incorrect",
      });
    }

    // Prevent reuse (check last 5 passwords)
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
        "User(Partner) changed password",
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
  "/tickets",
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

router.get("/tickets", verifyToken, async (req, res) => {
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

export { router as PartnerRouter };
