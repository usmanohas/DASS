import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const DocumentDetail = () => {
  const navigate = useNavigate();
  const [showKeywords, setShowKeywords] = useState(false);

  const PREVIEWABLE_TYPES = ["pdf", "png", "jpg", "jpeg", "gif"];
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  //format the document search key
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
    Public: "bg-dark",
    Internal: "bg-info",
    Confidential: "bg-warning text-dark",
    Restricted: "bg-danger",
  };

  const [editData, setEditData] = useState({
    title: "",
    doc_category_id: "",
    doc_sub_category_id: "",
    description: "",
    doc_keywords: "",
    classification: "",
    active_version_id: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  //Get Categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/department/categories",
        { withCredentials: true },
      );
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  //Get Sub-categories
  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/department/categories/${categoryId}/subcategories`,
        { withCredentials: true },
      );
      setSubcategories(res.data);
    } catch (err) {
      console.error("Failed to fetch subcategories");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1️⃣ Fetch document
        const docRes = await axios.get(
          `http://localhost:3000/department/documents/${id}`,
          { withCredentials: true },
        );

        // 2️⃣ Fetch versions
        const verRes = await axios.get(
          `http://localhost:3000/department/documents/${id}/versions`,
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

  //to load the sub category immediately the edit icon is click
  useEffect(() => {
    if (showEdit && editData.doc_category_id) {
      fetchSubcategories(editData.doc_category_id);
    }
  }, [showEdit, editData.doc_category_id]);

  const handleEditSubmit = async () => {
    setSaving(true);

    try {
      const payload = {
        title: editData.title,
        doc_category_id: editData.doc_category_id,
        doc_sub_category_id: editData.doc_sub_category_id,
        description: editData.description,
        doc_keywords: formatKeywords(editData.doc_keywords), //enforce keywords format
        classification: editData.classification,
        active_version_id: editData.active_version_id,
      };

      const res = await axios.put(
        `http://localhost:3000/department/documents/${id}`,
        payload,
        { withCredentials: true },
      );

      if (res.data?.Status) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Document metadata have been updated successfully.",
          confirmButtonColor: "#198754",
        });

        setShowEdit(false);
        window.location.reload();
      } else {
        Swal.fire("Error", res.data?.Error || "Update failed", "error");
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.Error || "Server error while updating document",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const blockedTypes = [
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/gzip",
    "application/x-tar",
  ];

  const blockedExtensions = [".zip", ".rar", ".7z", ".tar", ".gz"];

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const validateFile = (file) => {
    if (!file) return false;

    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    // Block compressed types
    if (
      blockedTypes.includes(file.type) ||
      blockedExtensions.includes(fileExtension)
    ) {
      Swal.fire(
        "Invalid File",
        "Compressed files (.zip, .rar, .7z, .tar, .gz) are not allowed.",
        "error",
      );
      return false;
    }

    // File size check
    if (file.size > MAX_FILE_SIZE) {
      Swal.fire(
        "File Too Large",
        "Maximum file size allowed is 50MB.",
        "error",
      );
      return false;
    }

    return true;
  };

  const handleUploadNewVersion = async () => {
    if (!newVersionFile) {
      return Swal.fire(
        "Missing File",
        "Please select a valid file.",
        "warning",
      );
    }
    if (!versionNote.trim()) {
      return Swal.fire(
        "Missing Version Note",
        "Please enter the version change note.",
        "warning",
      );
    }

    if (!verifiedBy.trim()) {
      return Swal.fire(
        "Verification Required",
        "Please enter the name of the staff who verified this document.",
        "warning",
      );
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", newVersionFile);
      formData.append("version_notes", versionNote);
      formData.append("verified_by", verifiedBy);

      const res = await axios.post(
        `http://localhost:3000/department/documents/${id}/upload-version`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },

          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percent);
          },
        },
      );

      if (res.data.Status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "New version uploaded successfully",
          confirmButtonColor: "#198754",
        }).then(() => window.location.reload());
      } else {
        Swal.fire("Upload Failed", res.data.Error, "error");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.Error || "Upload failed";

      Swal.fire("Upload Failed", errorMessage, "error");
    } finally {
      setUploading(false);
    }
  };

  // DOWNLOAD WITH 5-SEC SPINNER
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
        `http://localhost:3000/department/documents/${id}/delete-not-expired`,
        { reason },
        { withCredentials: true },
      );

      if (res.data.Status) {
        await Swal.fire({
          icon: "success",
          title: "Document Deleted",
          text: "The document has been successfully deleted.",
          confirmButtonColor: "#2cd2d2 ",
        });
        navigate("/department/document/archived-deleted");
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

  const isChanged =
    originalData &&
    (editData.title !== originalData.title ||
      editData.description !== originalData.description ||
      editData.doc_keywords !== originalData.document_search_keywords ||
      editData.classification !== originalData.classification ||
      (allowChangeVersion &&
        editData.active_version_id !== originalData.active_version_id));

  if (!doc) return <p className="text-center">Loading...</p>;

  // SEARCH KEY FORMAT
  const keywords = doc.document_search_keywords
    ? doc.document_search_keywords.split(",").map((k) => k.trim())
    : [];

  return (
    <div className="container py-4">
      {/* ================= PAGE HEADER ================= */}
      <div className="mb-3">
        <h3 className="fw-bold mb-1 d-flex align-items-center">
          <i className="bi bi-file-earmark-richtext me-2"></i>
          Document Details
        </h3>

        <small className="text-muted">
          Manage document metadata, versions and downloads
        </small>
      </div>

      {/* ================= DOCUMENT HEADER CARD ================= */}
      <div
        className="card border-0 mb-4"
        style={{
          borderRadius: "12px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <div className="card-body p-4 position-relative">
          {/* TOP HEADER */}
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

              {/* ACTION TOOLBAR */}
              <div
                className="d-flex align-items-center gap-2 p-2"
                style={{
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Edit */}
                <button
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3"
                  onClick={() => {
                    setAllowChangeVersion(false);

                    setEditData((prev) => ({
                      ...prev,
                      doc_keywords: formatKeywords(
                        doc?.document_search_keywords || "",
                      ),
                    }));

                    setShowEdit(true);
                  }}
                >
                  <i className="bi bi-pencil-square"></i>
                  Edit
                </button>

                {/* Add Version */}
                <button
                  className="btn btn-sm d-flex align-items-center gap-2 px-3"
                  onClick={() => setShowUploadVersion(true)}
                  style={{backgroundColor: "#0b8585", color: "#badfdf"}}
                >
                  <i className="bi bi-cloud-upload"></i>
                  Add Version
                </button>
              </div>
            </div>
          </div>

          <hr />

          {/* ================= BODY ================= */}
          <div className="row g-4 mt-1">
            {/* LEFT SECTION */}
            <div className="col-lg-8">
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

              {/* DESCRIPTION */}
              <div className="mb-4">
                <div className="text-muted small mb-2 fw-semibold">
                  Description
                </div>

                <div
                  className="p-3 rounded-2 border bg-light"
                  style={{
                    lineHeight: "1.7",
                  }}
                >
                  {doc.description || (
                    <span className="text-muted">No description available</span>
                  )}
                </div>
              </div>

              {/* EXPIRY */}
              <div
                className="p-3 rounded-2 border bg-light mb-4"
                style={{
                  boxShadow: "0 5px 15px rgba(0,0,0,0.03)",
                }}
              >
                <div className="text-muted small mb-2 fw-semibold">
                  Retention Expiry Date
                </div>

                {doc.retention_expiry_date ? (
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-calendar-x text-danger"></i>

                    <span className="fw-semibold">
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
            </div>

            {/* ================= RIGHT SECTION ================= */}
            <div className="col-lg-4">
              <div
                className="p-4 rounded-2 border bg-light h-100"
                style={{
                  boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
                }}
              >
                {/* TITLE */}
                <div className="fw-semibold text-danger mb-3 d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Document Deletion
                </div>

                {/* NOTE */}
                <div
                  className="small text-muted mb-4"
                  style={{
                    lineHeight: "1.7",
                  }}
                >
                  Documents are usually deleted only after expiration. However,
                  early deletion may be requested in exceptional circumstances
                  with a valid reason.
                </div>

                {/* BUTTON */}
                <button
                  className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
                  disabled={saving}
                  onClick={handleDeleteDocument}
                  style={{
                    borderRadius: "12px",
                    fontWeight: "600",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete Document
                </button>
              </div>
            </div>
          </div>
          {/* ================= STATS ================= */}
          <div className="row g-3 mb-4 mt-3">
            <div className="col-md-4">
              <div className="card border shadow-sm h-100">
                <div className="card-body d-flex align-items-center gap-3">
                  <div
                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 55, height: 55 }}
                  >
                    <i className="bi bi-file-earmark-pdf fs-4"></i>
                  </div>

                  <div>
                    <small className="text-muted">Total Versions</small>
                    <h4 className="text-muted mb-0">{versions.length}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border shadow-sm h-100">
                <div className="card-body d-flex align-items-center gap-3">
                  <div
                    className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 55, height: 55 }}
                  >
                    <i className="bi bi-file-earmark-check fs-4"></i>
                  </div>

                  <div>
                    <small className="text-muted">Active Version</small>
                    <h4 className="text-muted mb-0">
                      {versions.find((v) => v.is_active === 1)
                        ?.version_number || "—"}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border shadow-sm h-100">
                <div className="card-body d-flex align-items-center gap-3">
                  <div
                    className="bg-dark bg-opacity-10 text-dark rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 55, height: 55 }}
                  >
                    <i className="bi bi-download fs-4"></i>
                  </div>

                  <div>
                    <small className="text-muted">Total Downloads</small>
                    <h4 className="text-muted mb-0">
                      {versions.reduce(
                        (sum, v) => sum + (v.download_count || 0),
                        0,
                      )}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ================= VERSION HEADER ================= */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-1">Version History</h5>

              <small className="text-muted">
                Track document revisions, downloads and activity
              </small>
            </div>
          </div>
          {/* ================= VERSION TABLE ================= */}
          <div
            className="card border-0"
            style={{
              borderRadius: "10px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            }}
          >
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead
                    style={{
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <tr>
                      <th className="text-center">#</th>
                      <th className="text-center">Version</th>
                      <th className="text-center">Type</th>
                      <th className="text-center">Size</th>
                      <th className="text-center">Version Notes</th>
                      <th className="text-center">Downloads</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Uploaded</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {versions.map((v, index) => (
                      <tr key={v.id}>
                        <td className="text-center fw-semibold">{index + 1}</td>

                        <td className="text-center fw-semibold">
                          {v.version_number}
                        </td>

                        <td className="text-center">
                          <span className="badge bg-light text-dark border">
                            {v.type.toUpperCase()}
                          </span>
                        </td>

                        <td className="text-center">
                          {(v.file_size / (1024 * 1024)).toFixed(2)} MB
                        </td>

                        <td className="text-center">
                          {v.version_notes ? (
                            <button
                              className="btn btn-outline-secondary btn-sm rounded-pill"
                              onClick={() => {
                                setSelectedNote({
                                  version: v.version_number,
                                  note: v.version_notes,
                                  verifiedBy: v.version_verified_by,
                                });

                                setShowNoteModal(true);
                              }}
                            >
                              <i className="bi bi-eye me-1"></i>
                              View
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
                            <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3">
                              Archived
                            </span>
                          )}
                        </td>

                        <td className="text-center small text-muted">
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
                          <button
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                            onClick={() => handleDownload(v.id)}
                          >
                            <i className="bi bi-download me-1"></i>
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}

                    {versions.length === 0 && (
                      <tr>
                        <td colSpan="9" className="text-center text-muted py-5">
                          No versions available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== EDIT MODAL (UNCHANGED LOGIC) ===== */}
      {showEdit && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowEdit(false)}
          />

          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-pencil-square text-warning"></i> Edit
                    Document
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEdit(false)}
                  />
                </div>

                <div className="modal-body">
                  {/* Title */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Document Title
                    </label>
                    <input
                      className="form-control"
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Category */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Category</label>
                    <select
                      className="form-select mb-3"
                      value={editData.doc_category_id}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setEditData({
                          ...editData,
                          doc_category_id: selectedId,
                          doc_sub_category_id: "",
                        });

                        if (selectedId) {
                          fetchSubcategories(selectedId);
                        } else {
                          setSubcategories([]);
                        }
                      }}
                    >
                      <option value="">...Select Category...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-Category */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Sub-Category
                    </label>
                    <select
                      className="form-select mb-3"
                      disabled={!editData.doc_category_id}
                      value={editData.doc_sub_category_id}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          doc_sub_category_id: e.target.value,
                        })
                      }
                    >
                      <option value="">...Select Subcategory...</option>
                      {subcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Keywords */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Keywords</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Strategy, Budget, Audit"
                      value={editData.doc_keywords}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          doc_keywords: e.target.value, // allow free typing
                        })
                      }
                      onBlur={(e) =>
                        setEditData({
                          ...editData,
                          doc_keywords: formatKeywords(e.target.value), // format after typing
                        })
                      }
                    />
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-2 text-info"></i>
                      Keywords must be separated by comma and single space. Each
                      word must start with capital letter (e.g. Strategy,
                      Budget)
                    </small>
                  </div>

                  {/* Classification */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Classification
                    </label>
                    <select
                      className="form-select"
                      value={editData.classification}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          classification: e.target.value,
                        })
                      }
                    >
                      <option>Public</option>
                      <option>Internal</option>
                      <option>Confidential</option>
                      <option>Restricted</option>
                    </select>
                  </div>

                  {/* Active Version */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Active Version
                    </label>

                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={allowChangeVersion}
                        onChange={(e) =>
                          setAllowChangeVersion(e.target.checked)
                        }
                      />
                      <label className="form-check-label">
                        Change active version
                      </label>
                    </div>

                    <select
                      className="form-select"
                      disabled={!allowChangeVersion}
                      value={editData.active_version_id}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          active_version_id: e.target.value,
                        })
                      }
                    >
                      {versions.map((v) => (
                        <option key={v.id} value={v.id}>
                          Version {v.version_number}
                          {v.is_active === 1 ? " (Current)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowEdit(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-success"
                    disabled={!isChanged || saving}
                    onClick={handleEditSubmit}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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

      {showUploadVersion && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowUploadVersion(false)}
          />

          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    <i class="bi bi-plus-circle"></i> Upload New Version
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowUploadVersion(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Select File <span className="text-danger">*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="*/*"
                      onChange={(e) => {
                        const selected = e.target.files[0];
                        if (validateFile(selected)) {
                          setNewVersionFile(selected);
                        } else {
                          e.target.value = null; // clear file input
                          setNewVersionFile(null);
                        }
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Change / Version Note{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={versionNote}
                      onChange={(e) => setVersionNote(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Reviewed and Verified By{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      placeholder="e.g Mr. Usman Ohagenyi"
                      value={verifiedBy}
                      onChange={(e) => setVerifiedBy(e.target.value)}
                    />
                    <small className="text-muted">
                      Please enter the name of the staff member who reviewed and
                      confirmed the accuracy of this document before upload.
                    </small>
                  </div>
                </div>

                {uploading && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>

                    <div className="progress" style={{ height: "8px" }}>
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowUploadVersion(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={handleUploadNewVersion}
                    disabled={
                      uploading ||
                      !newVersionFile ||
                      !versionNote.trim() ||
                      !verifiedBy.trim()
                    }
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Uploading...
                      </>
                    ) : (
                      "Upload Version"
                    )}
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

export default DocumentDetail;
