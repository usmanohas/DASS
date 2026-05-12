import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useNavigate, useOutletContext } from "react-router-dom";

const ExpiredDocumentDetail = () => {
  const { refreshAlerts } = useOutletContext();
  const navigate = useNavigate();
  const PREVIEWABLE_TYPES = ["pdf", "png", "jpg", "jpeg", "gif"];
  const [saving, setSaving] = useState(false);
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [versions, setVersions] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [allowChangeVersion, setAllowChangeVersion] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showUploadVersion, setShowUploadVersion] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState(null);
  const [versionNote, setVersionNote] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const classificationColors = {
    Public: "bg-success",
    Internal: "bg-info",
    Confidential: "bg-warning text-dark",
    Restricted: "bg-danger",
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1️⃣ Fetch document
        const docRes = await axios.get(
          `http://localhost:3000/department/document/expired/${id}`,
          { withCredentials: true },
        );

        // 2️⃣ Fetch versions
        const verRes = await axios.get(
          `http://localhost:3000/department/document/expired/${id}/versions`,
          { withCredentials: true },
        );

        if (docRes.data.Status && verRes.data.Status) {
          const docData = docRes.data.Data;
          const versionsData = verRes.data.Data;

          setDoc(docData);
          setVersions(versionsData);

          const activeVersion = versionsData.find((v) => v.is_active === 1);

          const initialData = {
            title: docData.title,
            doc_category_id: docData.category_id,
            doc_sub_category_id: docData.subcategory_id,
            description: docData.description,
            doc_keywords: docData.document_search_keywords,
            classification: docData.classification,
            active_version_id: activeVersion?.id || "",
          };

          // 🔥 CRITICAL
          setEditData(initialData);
          setOriginalData(initialData);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [id]);

  const handleDownload = async (versionId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/department/documents/download/${versionId}`,
        {
          withCredentials: true,
          responseType: "blob",
        },
      );

      // 👇 extract filename from Content-Disposition
      const disposition = res.headers["content-disposition"];
      let filename = "downloaded-file";

      if (disposition && disposition.includes("filename=")) {
        filename = decodeURIComponent(
          disposition.split("filename=")[1].replace(/"/g, ""),
        );
      }

      // 🔽 trigger browser download
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // ✅ FIXED optimistic update
      setVersions((prevVersions) =>
        prevVersions.map((v) =>
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

  // ================= DELETE DOCUMENT =================

  const handleDeleteDocument = async () => {
    const { value: reason } = await Swal.fire({
      title: "Delete Document",
      input: "textarea",
      inputLabel: "Reason for deletion",
      inputPlaceholder: "Enter reason for deleting this document...",
      inputAttributes: {
        "aria-label": "Deletion reason",
      },
      showCancelButton: true,
      confirmButtonText: "Submit Request",
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "Deletion reason is required!";
        }
      },
    });

    if (!reason) return;

    try {
      setSaving(true);

      const res = await axios.put(
        `http://localhost:3000/department/documents/${id}/delete`,
        { reason },
        { withCredentials: true },
      );

      if (res.data.Status) {
        await Swal.fire(
          "Deletion Request Sent",
          "The document has been marked for deletion and is awaiting administrator approval.",
          "success",
        );

        refreshAlerts();
        navigate("/department/retention-notifications");
      } else {
        Swal.fire("Error", res.data.Error || "Delete failed", "error");
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.Error || "Delete request failed",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= ARCHIVE DOCUMENT =================

  const handleArchiveDocument = async () => {
    const result = await Swal.fire({
      title: "Archive Document",
      text: "This will archive the document. It will no longer appear as active.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Archive",
      confirmButtonColor: "#0d6efd",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);

      const res = await axios.put(
        `http://localhost:3000/department/documents/${id}/archive`,
        {},
        { withCredentials: true },
      );

      if (res.data.Status) {
        await Swal.fire(
          "Archived",
          "Document archived successfully",
          "success",
        );

        refreshAlerts(); // refresh notification count
        navigate("/department/retention-notifications");
      } else {
        Swal.fire("Error", res.data.Error || "Archive failed", "error");
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.Error || "Archive request failed",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!doc) return <p className="text-center">Loading...</p>;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-success mb-2">
          <i className="bi bi-files me-2"></i> Expired Document Details
        </h3>
        <small>
          This document has expired and is no longer active. You can still view
          its details for reference
        </small>
      </div>
      {/* ===== DOCUMENT HEADER ===== */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body position-relative">
          <div className="d-flex justify-content-between align-items-start mb-3">
            {/* LEFT SIDE */}
            <div>
              <h4 className="text-muted mb-1">{doc.title}</h4>
              <div className="text-muted small">
                <i className="bi bi-file-earmark-text me-1"></i>
                {doc.document_code}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="d-flex align-items-center gap-3">
              {/* Classification Badge */}
              <span
                className={`badge px-3 py-2 ${
                  classificationColors[doc.classification] || "bg-secondary"
                }`}
              >
                {doc.classification}
              </span>
            </div>
          </div>

          <hr />

          <div className="row g-4">
            <div className="col-md-9">
              <div className="text-muted small mb-1">Description</div>
              <div>
                {doc.description || <span className="text-muted">—</span>}
              </div>
            </div>

            <div className="col-md-3">
              <div className="d-flex gap-2 flex-wrap align-center">
                {/* ARCHIVE BUTTON */}
                <button
                  className="btn btn-sm btn-dark"
                  disabled={saving}
                  onClick={handleArchiveDocument}
                >
                  <i className="bi bi-archive me-1"></i>
                  Archive
                </button>

                {/* DELETE BUTTON */}
                <button
                  className="btn btn-sm btn-danger"
                  disabled={saving}
                  onClick={handleDeleteDocument}
                >
                  <i className="bi bi-trash me-1"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== VERSION STATS ===== */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-4 fw-bold">{versions.length}</div>
            <small className="text-muted">Total Versions</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-4 fw-bold">
              {versions.find((v) => v.is_active === 1)?.version_number || "—"}
            </div>
            <small className="text-muted">Active Version</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-4 fw-bold">
              {versions.reduce((sum, v) => sum + (v.download_count || 0), 0)}
            </div>
            <small className="text-muted">Total Downloads</small>
          </div>
        </div>
      </div>

      {/* ===== VERSION HISTORY TABLE ===== */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle">
              <thead className="table-light">
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
                      <td className="fw-semibold text-center">{index + 1}</td>
                      <td className="fw-semibold text-center">
                        v{v.version_number}
                      </td>

                      <td className="text-center">{v.type.toUpperCase()}</td>

                      <td className="text-center">
                        {(v.file_size / (1024 * 1024)).toFixed(2)} MB
                      </td>

                      <td className="text-center">
                        {v.version_notes ? (
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            title="View version note"
                            onClick={() => {
                              setSelectedNote({
                                version: v.version_number,
                                note: v.version_notes,
                                verifiedBy: v.version_verified_by,
                              });
                              setShowNoteModal(true);
                            }}
                          >
                            <i className="bi bi-eye-fill "></i>
                          </button>
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

      <div className="text-center mt-4">
        <button
          className="btn btn-secondary px-4"
          onClick={() => navigate("/department/retention-notifications")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Notifications
        </button>
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
                    <i className="bi bi-pencil-square text-warning"></i> Change
                    Note – Version {selectedNote.version}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowNoteModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="fw-semibold mb-1">
                      Change Description:
                    </label>
                    <p className="mb-0">{selectedNote.note}</p>
                  </div>

                  <div>
                    <label className="fw-semibold">
                      <i className="bi bi-person-workspace"></i> Verified By:
                    </label>
                    <p className="mb-0">{selectedNote.verifiedBy || "—"}</p>
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

export default ExpiredDocumentDetail;
