import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const DocumentDetailAdmin = () => {
  const truncate = (text, length = 50) =>
    text.length > length ? text.substring(0, length) + "…" : text;

  const navigate = useNavigate();
  const [showKeywords, setShowKeywords] = useState(false);

  const PREVIEWABLE_TYPES = ["pdf", "png", "jpg", "jpeg", "gif"];

  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [versions, setVersions] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [shareSummary, setShareSummary] = useState(null);

  // Inject spinner CSS globally (FIXED)
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

  //format keywords
  const formatKeywords = (value) => {
    return value
      .split(",")
      .map((word) =>
        word
          .trim()
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      )
      .filter((word) => word !== "")
      .join(", ");
  };

  const classificationColors = {
    Public: "bg-success",
    Internal: "bg-info",
    Confidential: "bg-warning text-dark",
    Restricted: "bg-danger",
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const docRes = await axios.get(
          `http://localhost:3000/admin/documents/${id}`,
          { withCredentials: true },
        );

        const verRes = await axios.get(
          `http://localhost:3000/admin/documents/${id}/versions`,
          { withCredentials: true },
        );

        const shareRes = await axios.get(
          `http://localhost:3000/admin/documents/${id}/share-summary`,
          { withCredentials: true },
        );

        if (shareRes.data.Status) {
          setShareSummary(shareRes.data.Data);
        }

        if (docRes.data.Status && verRes.data.Status) {
          setDoc(docRes.data.Data);
          setVersions(verRes.data.Data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [id]);

  //  UPDATED DOWNLOAD WITH 5-SEC SPINNER
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

  // Actual download function
  const startDownload = async (versionId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/admin/documents/download/${versionId}`,
        {
          withCredentials: true,
          responseType: "blob",
        },
      );

      const disposition = res.headers["content-disposition"];
      let filename = "downloaded-file";

      if (disposition && disposition.includes("filename=")) {
        filename = decodeURIComponent(
          disposition.split("filename=")[1].replace(/"/g, ""),
        );
      }

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setVersions((prev) =>
        prev.map((v) =>
          v.id === versionId
            ? { ...v, download_count: (v.download_count || 0) + 1 }
            : v,
        ),
      );
    } catch (err) {
      Swal.fire(
        "Download Failed",
        err.response?.data?.Error || "Unable to download file",
        "error",
      );
    }
  };

  if (!doc) return <p className="text-center">Loading...</p>;

  const keywords = doc.document_search_keywords
    ? doc.document_search_keywords.split(",").map((k) => k.trim())
    : [];

  return (
    <div className="container py-4">
      <h3 className="mb-4 fw-bold ">
        <i className="bi bi-file-earmark-text me-2"></i> Document Details
      </h3>

      {/* HEADER */}
      {/* ===== DOCUMENT HEADER ===== */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body position-relative">
          <div className="d-flex justify-content-between align-items-start gap-4 mb-4">
            {/* LEFT */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <h4
                className="mb-2 text-dark"
                style={{
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  lineHeight: "1.4",
                }}
              >
                {doc.title}
              </h4>

              <div className="text-muted small d-flex align-items-center">
                <i className="bi bi-upc-scan me-2"></i>

                <span
                  style={{
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {doc.document_code}
                </span>
              </div>
            </div>

            {/* RIGHT */}
            <div
              className="d-flex flex-column align-items-end gap-3"
              style={{
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {/* Classification */}
              <span
                className={`badge px-4 py-2 rounded-pill fw-semibold ${
                  classificationColors[doc.classification] || "bg-secondary"
                }`}
                style={{
                  fontSize: "0.85rem",
                  letterSpacing: "0.3px",
                }}
              >
                {doc.classification}
              </span>
            </div>
          </div>

          <hr />

          <div className="row g-4">
            <div className="col-md-8">
              {/* KEYWORDS */}
              <div className="mb-4">
                <div
                  className="d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowKeywords(!showKeywords)}
                >
                  <strong className="d-flex align-items-center">
                    <i className="bi bi-tags me-2"></i>
                    Search Keywords
                  </strong>

                  <i
                    className={`bi ${
                      showKeywords ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  ></i>
                </div>

                <div
                  style={{
                    maxHeight: showKeywords ? "200px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    {keywords.length > 0 ? (
                      keywords.map((k, i) => (
                        <span
                          key={i}
                          className="badge rounded-pill bg-light text-dark border px-3 py-2"
                        >
                          {k}
                        </span>
                      ))
                    ) : (
                      <small className="text-muted">No keywords</small>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-muted small mb-1">Description</div>
              <div>
                {doc.description || <span className="text-muted">—</span>}
              </div>
              <div className="mb-3 mt-4 p-3 rounded border bg-light">
                <div className="text-muted small mb-1">Expiry Date</div>

                {doc.retention_expiry_date ? (
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-calendar-x text-danger"></i>

                    <span className="fw-semibold small">
                      {new Date(doc.retention_expiry_date).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted">No expiry set</span>
                )}
              </div>
              {/* ===== VERSION STATS ===== */}
              <div className="row g-3 mb-4 mt-4">
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm text-center p-3">
                    <div className="fs-4 fw-semibold text-muted">
                      {versions.length}
                    </div>
                    <small className="text-muted">Total Versions</small>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-sm text-center p-3">
                    <div className="fs-4 fw-semibold text-muted">
                      {versions.find((v) => v.is_active === 1)
                        ?.version_number || "—"}
                    </div>
                    <small className="text-muted">Active Version</small>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-sm text-center p-3">
                    <div className="fs-4 fw-semibold text-muted">
                      {versions.reduce(
                        (sum, v) => sum + (v.download_count || 0),
                        0,
                      )}
                    </div>
                    <small className="text-muted">Total Downloads</small>
                  </div>
                </div>
              </div>

              {/* ===== SHARE SUMMARY ===== */}
              {shareSummary && (
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm text-center p-3">
                      <div className="fs-4 fw-semibold text-muted">
                        {shareSummary.totalShares}
                      </div>
                      <small className="text-muted">Total Shares</small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm text-center p-3">
                      <div className="fs-4 fw-semibold text-muted">
                        {shareSummary.partnerCount}
                      </div>
                      <small className="text-muted">Shared with Partners</small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm text-center p-3">
                      <div className="fs-4 fw-semibold text-muted">
                        {shareSummary.publicLinkCount}
                      </div>
                      <small className="text-muted">Public Links</small>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="col-md-4">
              <div className="mb-4 mt-4 p-3 rounded border bg-light">
                {/* Header */}
                <div className="fw-semibold text-danger mb-2 d-flex align-items-center">
                  <i className="bi bi-share-fill me-2"></i>
                  Document Sharing
                </div>

                {/* Policy Note */}
                <div
                  className="small text-muted mb-3"
                  style={{ lineHeight: "1.5" }}
                >
                  This document can be shared with registered partners. Selected
                  partners will be granted access to view and download the
                  document through the portal until the specified expiration
                  date. After the expiration date, access will be automatically
                  revoked.
                </div>

                {/* Action Button */}
                <button
                  className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
                  onClick={() => navigate(`/admin/document/share/${doc.id}`)}
                  style={{
                    borderRadius: "8px",
                    fontWeight: "500",
                  }}
                >
                  <i className="bi bi-box-arrow-up-right me-2"></i>
                  Share Document
                </button>
              </div>
              {/* ===== PARTNER SHARE DETAILS ===== */}
              {shareSummary?.partnerCount > 0 && (
                <div className="card shadow-sm mb-4 rounded border">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                      <i className="bi bi-people-fill text-success"></i>
                      Shared with Partners
                    </h6>

                    <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                      {shareSummary.partnerShares.map((p, index) => (
                        <div
                          key={index}
                          className="d-flex justify-content-between align-items-center border rounded p-2 mb-2"
                        >
                          {/* NAME */}
                          <div>
                            <div className="fw-semibold">{p.full_name}</div>
                            <small className="text-muted">
                              Shared:{" "}
                              {new Date(p.created_at).toLocaleDateString(
                                "en-GB",
                              )}
                            </small>
                          </div>

                          {/* EXPIRY */}
                          <div className="text-end">
                            <small className="text-muted d-block">
                              Expires
                            </small>
                            <small className="fw-normal text-danger">
                              {new Date(p.expiry_date).toLocaleDateString(
                                "en-GB",
                              )}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== VERSION HISTORY TABLE ===== */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="">
                <tr>
                  <th className="text-center">#</th>
                  <th className="text-center">Version</th>
                  <th className="text-center">Type</th>
                  <th className="text-center">Size</th>
                  <th className="text-center">Version Notes</th>
                  <th className="text-center">Download Count</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Uploaded</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {versions.map((v, index) => {
                  const canPreview = PREVIEWABLE_TYPES.includes(
                    v.type.toLowerCase(),
                  );

                  return (
                    <tr key={v.id}>
                      <td className=" text-center">
                        <small className="text-muted">{index + 1}</small>
                      </td>
                      <td className="fw-semibold text-center">
                        <small className="text-muted">
                          v{v.version_number}
                        </small>
                      </td>

                      <td className="text-center">
                        <small className="text-muted">
                          {v.type.toUpperCase()}
                        </small>
                      </td>

                      <td className="text-center">
                        <small className="text-muted">
                          {(v.file_size / (1024 * 1024)).toFixed(2)} MB
                        </small>
                      </td>

                      <td className="text-center">
                        {v.version_notes ? (
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <small className="text-muted">
                              {truncate(v.version_notes, 25)}
                            </small>

                            <i
                              className="bi bi-journal-text text-primary"
                              role="button"
                              title="View version note"
                              style={{ cursor: "pointer", fontSize: "1.1rem" }}
                              onClick={() => {
                                setSelectedNote({
                                  version: v.version_number,
                                  note: v.version_notes,
                                  verifiedBy: v.version_verified_by,
                                });
                                setShowNoteModal(true);
                              }}
                            ></i>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      <td className="text-center">{v.download_count}</td>

                      <td className="text-center">
                        {v.is_active === 1 ? (
                          <span className="badge bg-success rounded-pill px-3">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary px-3">
                            Archived
                          </span>
                        )}
                      </td>

                      <td className="text-muted small text-center">
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }).format(new Date(v.created_at))}
                      </td>

                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-danger"
                            title="Download"
                            onClick={() => handleDownload(v.id)}
                          >
                            <i className="bi bi-download "></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {versions.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No versions available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showNoteModal && selectedNote && (
        <>
          {/* Overlay */}
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowNoteModal(false)}
          />

          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-journal-text text-secondary me-1"></i>
                    Version Detail
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowNoteModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <p>
                      <small>Version: {selectedNote.version}</small>
                    </p>
                    <label className="fw-semibold mb-1">
                      Change Description:
                    </label>
                    <div className="border rounded p-2 bg-light">
                      <small className="text-dark">
                        {selectedNote.note || "No description provided."}
                      </small>
                    </div>
                  </div>

                  {/* VERIFIED BY */}
                  <div>
                    <label className="fw-semibold mb-2 d-flex align-items-center gap-2">
                      <i className="bi bi-patch-check-fill text-success"></i>
                      Verified By
                    </label>

                    <div className="border rounded p-2 bg-light">
                      <small className="text-muted">
                        {selectedNote.verifiedBy || "Not specified"}
                      </small>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowNoteModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentDetailAdmin;
