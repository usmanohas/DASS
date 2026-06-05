import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../config/baseUrl";
import Swal from "sweetalert2";

const PublicDocumentLink = () => {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [expired, setExpired] = useState(false);
  const [expiredDate, setExpiredDate] = useState(null);
  const [error, setError] = useState("");

  // ✅ Inject spinner CSS globally (FIXED)
  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
          .swal2-html-container .custom-spinner {
            position: relative;
            width: 70px;
            height: 70px;
            border: 5px solid rgba(0, 0, 0, 0.1);
            border-top: 5px solid #198754;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: auto;
          }
        
          .swal2-html-container .spinner-logo {
            position: absolute;
            width: 30px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        
          /* REMOVE SCROLLBAR */
          .swal2-html-container {
            overflow: hidden !important;
          }
        
          .swal2-popup {
            overflow: hidden !important;
          }
        
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/admin/public/document/${token}`,
        );

        if (res.data.Status) {
          setData(res.data);
          setExpired(res.data.expired);
          setExpiredDate(res.data.expiry_date);
        } else {
          setError(res.data.Error || "Invalid link");
        }
      } catch {
        setError("Unable to load document");
      }

      setLoading(false);
    };

    fetchDoc();
  }, [token]);

  /* ================= DOWNLOAD ================= */
  // ✅ UPDATED DOWNLOAD WITH 5-SEC SPINNER
  const handleDownload = (versionId) => {
    let timerInterval;

    Swal.fire({
      title: "Preparing Download...",
      html: `
        <p class="mb-2">Your download will start in <b>5</b> seconds.</p>
        <small class="text-muted">Securing your file...</small>
  
        <div class="d-flex justify-content-center mt-3">
          <div class="custom-spinner">
            <img src="/assets/images/logo.png" class="spinner-logo" />
          </div>
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        const content = Swal.getHtmlContainer();
        const b = content.querySelector("b");

        let timeLeft = 5;

        timerInterval = setInterval(() => {
          timeLeft--;
          b.textContent = timeLeft;

          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            Swal.close();
            startDownload(versionId); // ✅ pass versionId
          }
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    });
  };

  const startDownload = async (versionId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/admin/public/documents/download/${versionId}`,
        {
          responseType: "blob",
          validateStatus: (status) => status < 500,
        },
      );

      const contentType = res.headers["content-type"];

      // handle backend error
      if (contentType && contentType.includes("application/json")) {
        const text = await res.data.text();
        const error = JSON.parse(text);

        return Swal.fire(
          "Download Failed",
          error.Error || "Unable to download file",
          "error",
        );
      }

      // ✅ filename
      const disposition = res.headers["content-disposition"];
      let filename = "downloaded-file";

      if (disposition && disposition.includes("filename=")) {
        filename = decodeURIComponent(
          disposition.split("filename=")[1].replace(/"/g, ""),
        );
      }

      // ✅ download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // ✅ SUCCESS (only if truly success)
      Swal.fire({
        icon: "success",
        title: "Download Started",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Download Failed",
        "Something went wrong while downloading",
        "error",
      );
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3"></div>
          <p className="text-muted">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <i className="bi bi-x-circle text-danger fs-1"></i>
          <h4 className="mt-3">Invalid Link</h4>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  const doc = data.document;
  const version = data.version;

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <div className="container">
        <div
          className="card border-0 shadow-lg mx-auto"
          style={{ maxWidth: "900px", borderRadius: "16px" }}
        >
          <div className="card-body p-4 p-md-5">
            {/* HEADER */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3"
                style={{ width: 70, height: 70 }}
              >
                <i className="bi bi-file-earmark-text fs-2 text-primary"></i>
              </div>

              <h3 className="fw-bold">{doc.title}</h3>
              <p className="text-muted mb-0">{doc.description}</p>
            </div>

            {/* STATUS */}
            <div
              className={`rounded-3 p-3 text-center mb-4 ${
                expired
                  ? "bg-danger bg-opacity-10 text-danger"
                  : "bg-success bg-opacity-10 text-success"
              }`}
            >
              <i
                className={`bi ${
                  expired ? "bi-lock-fill" : "bi-check-circle-fill"
                } me-2`}
              ></i>

              {expired
                ? "This link has expired. Please contact the administrator."
                : "This document is available for download"}
            </div>

            {/* DETAILS GRID */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                  <small className="text-muted">Document Code</small>
                  <div className="fw-semibold mt-1">
                    {doc.document_code || "-"}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                  <small className="text-muted">Version</small>
                  <div className="fw-semibold mt-1">
                    v{version.version_number}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                  <small className="text-muted">File Name</small>
                  <div className="mt-1 text-truncate">
                    {version.original_file_name}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                  <small className="text-muted">File Size</small>
                  <div className="mt-1">
                    {(version.file_size / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="border rounded-3 p-3">
                  <small className="text-muted">Link expiry Date</small>
                  <div className="mt-1">
                    {new Date(expiredDate).toLocaleDateString("en-GB")}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION */}
            <div className="text-center">
              {expired ? (
                <button
                  className="btn btn-outline-secondary px-4 py-2"
                  disabled
                >
                  <i className="bi bi-lock me-2"></i>
                  Link Expired
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={() => handleDownload(doc.current_version_id)}
                >
                  <i className="bi bi-download me-1"></i>
                  Download Document
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-4 text-muted small">
          © {new Date().getFullYear()} NPHCDA-DASS. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default PublicDocumentLink;
