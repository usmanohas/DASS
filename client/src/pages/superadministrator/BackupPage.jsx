import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const BackupPage = () => {
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    let url = "";

    if (type === "db") {
      url = `${API_BASE_URL}/superadmin/backup/database`;
    }  else {
      url = `${API_BASE_URL}/superadmin/backup/documents`;
    }

    try {
      setLoading(true);

      Swal.fire({
        title: "Preparing Backup...",
        text: "Please wait while system generates backup",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.get(url, {
        withCredentials: true,
        responseType: "blob",
      });

      // =========================
      // GET FILENAME FROM HEADER
      // =========================
      const disposition = res.headers["content-disposition"];

      let filename = "";

      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);

        if (match && match[1]) {
          filename = match[1];
        }
      }

      // fallback filenames (important)
      if (!filename) {
        if (type === "db") {
          filename = "database_backup.sql";
        } else if (type === "docs") {
          filename = "documents_backup.zip";
        } else {
          filename = "full_backup.zip";
        }
      }

      // =========================
      // CREATE DOWNLOAD
      // =========================
      const blob = new Blob([res.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

      Swal.close();
      Swal.fire("Success", "Backup downloaded successfully", "success");
    } catch (err) {
      console.error("Backup error:", err);
      Swal.fire("Error", "Backup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h3 className="fw-bold">
          <i className="bi bi-database-fill-gear me-2"></i>
          System Backup
        </h3>
        <small className="text-muted">
          Export database or document files for safety and recovery
        </small>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {/* SELECT TYPE */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Select Backup Type</label>

            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option>...Select Type...</option>
              <option value="db">Database (.sql)</option>
              <option value="docs">Documents (.zip)</option>
            </select>
          </div>

          {/* INFO */}
          <div className="alert alert-info small">
            <strong>Note:</strong>
            <ul className="mb-0 mt-2">
              <li>Database backup exports all tables</li>
              <li>Documents backup includes uploaded files</li>
              <li>Full backup combines both</li>
            </ul>
            <small>
              Backup will be generated and downloaded directly to your system.
            </small>
          </div>

          {/* BUTTON */}
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-secondary px-3 py-2"
              onClick={handleBackup}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Generating Backup...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  Download Backup
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
