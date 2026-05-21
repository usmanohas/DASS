import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const WorkstreamDocumentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [doc, setDoc] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [showKeywords, setShowKeywords] = useState(false);

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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const docRes = await axios.get(
        `http://localhost:3000/staff/documents/${id}`,
        { withCredentials: true },
      );

      const statusRes = await axios.get(
        `http://localhost:3000/staff/documents/${id}/request-status`,
        { withCredentials: true },
      );

      setDoc(docRes.data.Data);
      setRequestStatus(statusRes.data.request);
    } catch (err) {
      console.error(err);
    }
  };

  if (!doc) return <p className="text-center mt-5">Loading...</p>;

  // SEARCH KEY FORMAT
  const keywords = doc.document_search_keywords
    ? doc.document_search_keywords.split(",").map((k) => k.trim())
    : [];

  // CHECK CLASSIFICATION
  const isConfidential = doc.classification?.toLowerCase() === "confidential";

  // ✅ STATUS LOGIC
  const status = requestStatus?.status?.toLowerCase();
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isDeclined = status === "declined";

  const isExpired =
    isApproved &&
    requestStatus?.expires_at &&
    new Date(requestStatus.expires_at) < new Date();

  const hasAccess = isApproved && !isExpired;

  const getExpiryText = () => {
    if (!requestStatus?.expires_at) return "No expiry";

    const now = new Date();
    const exp = new Date(requestStatus.expires_at);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expiryDate = new Date(
      exp.getFullYear(),
      exp.getMonth(),
      exp.getDate(),
    );

    const diffTime = expiryDate - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return `Expires in ${diffDays} days`;
    if (diffDays === 1) return "Expires tomorrow";
    if (diffDays === 0) return "Expires today";
    if (diffDays === -1) return "Expired yesterday";

    return `Expired ${Math.abs(diffDays)} days ago`;
  };

  // ✅ DOWNLOAD (ONLY FOR NON-CONFIDENTIAL) WITH SPINNER
  const handleDownload = () => {
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
            startDownload();
          }
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    });
  };
  const startDownload = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/staff/documents/download/${doc.current_version_id}`,
        {
          withCredentials: true,
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.title;
      a.click();

      Swal.fire({
        icon: "success",
        title: "Download Started",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Error", "Download failed", "error");
    }
  };

  // ✅ REQUEST ACCESS
  const submitRequest = async () => {
    if (!reason) {
      return Swal.fire("Error", "Enter reason", "error");
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/staff/documents/request-access",
        { document_id: id, reason },
        { withCredentials: true },
      );

      if (res.data.Status) {
        Swal.fire("Success", "Request submitted", "success");
        setShowModal(false);
        setReason("");
        loadData();
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 fw-bold">
        <i className="bi bi-file-earmark-text me-2"></i> Document Details
      </h3>
      <div className="card shadow border-0">
        <div className="card-body">
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="fw-semibold">{doc.title}</h4>
              <small className="text-muted">{doc.document_code}</small>
            </div>

            <span className="badge bg-danger-subtle text-danger border px-3 py-2 rounded-pill">
              {doc.classification}
            </span>
          </div>

          <hr />

          {/* KEYWORDS */}
          <div className="mb-3">
            <div
              className="d-flex justify-content-between"
              style={{ cursor: "pointer" }}
              onClick={() => setShowKeywords(!showKeywords)}
            >
              <strong>
                <i className="bi bi-tags me-2"></i> Search Keywords
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
              <div className="mt-2 d-flex flex-wrap gap-2">
                {keywords.length > 0 ? (
                  keywords.map((k, i) => (
                    <span key={i} className="badge bg-light text-dark">
                      {k}
                    </span>
                  ))
                ) : (
                  <small className="text-muted">No keywords</small>
                )}
              </div>
              <hr />
            </div>
          </div>

          {/* ✅ STATUS (ONLY FOR CONFIDENTIAL) */}
          {isConfidential && requestStatus && (
            <div className="mb-3">
              <span
                className={`badge px-3 py-2 ${
                  hasAccess
                    ? "bg-success"
                    : isPending
                      ? "bg-warning text-dark"
                      : isDeclined
                        ? "bg-danger"
                        : isExpired
                          ? "bg-secondary"
                          : "bg-secondary"
                }`}
              >
                {hasAccess && "APPROVED"}
                {isPending && "PENDING"}
                {isDeclined && "DECLINED"}
                {isExpired && "EXPIRED"}
              </span>

              <div className="mt-2 text-muted small">
                <i class="bi bi-calendar"></i> {isApproved && getExpiryText()}
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          <p>
            <strong>Description: </strong>
            {doc.description}
          </p>

          {/* ===========================
             ACTIONS
          =========================== */}
          <div className="mt-4 d-flex gap-2 flex-wrap">
            {/* Back Button */}
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => navigate("/staff/document/workstream")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </button>
            {/* 🔓 NON-CONFIDENTIAL → DOWNLOAD */}
            {!isConfidential && (
              <button className="btn btn-success" onClick={handleDownload}>
                <i className="bi bi-download me-2"></i>
                Download
              </button>
            )}

            {/* 🔐 CONFIDENTIAL */}
            {isConfidential && (
              <>
                {/* ⏳ PENDING */}
                {isPending && (
                  <button className="btn btn-warning" disabled>
                    <i className="bi bi-hourglass me-2"></i>
                    Pending Approval
                  </button>
                )}

                {/* ❌ DECLINED */}
                {isDeclined && (
                  <button
                    className="btn btn-danger"
                    onClick={() => setShowModal(true)}
                  >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Request Access Again
                  </button>
                )}

                {/* ⌛ EXPIRED */}
                {isExpired && (
                  <button
                    className="btn btn-info"
                    onClick={() => setShowModal(true)}
                  >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Access Expired — Request Again
                  </button>
                )}

                {/* ✅ APPROVED / ACCESS GRANTED */}
                {hasAccess && (
                  <div className="alert alert-success d-flex align-items-center justify-content-between py-2 px-3 mb-0">
                    <div>
                      <i className="bi bi-check-circle-fill me-2"></i>
                      <strong>Access Granted.</strong> You can now download
                      this document.
                    </div>

                    <button
                      className="btn btn-sm btn-success ms-3"
                      onClick={() => navigate("/staff/access-requests")}
                    >
                      <i className="bi bi-download me-1"></i>
                      Go to Downloads
                    </button>
                  </div>
                )}

                {/* 🆕 FIRST TIME */}
                {!requestStatus && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                  >
                    <i className="bi bi-file-earmark-lock me-2"></i>
                    Request Access
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===========================
         MODAL
      =========================== */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" />

          <div className="modal show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Request Access</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <textarea
                    className="form-control"
                    placeholder="Enter reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button className="btn btn-success" onClick={submitRequest}>
                    Submit Request
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

export default WorkstreamDocumentDetail;
