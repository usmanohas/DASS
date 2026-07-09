import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const WorkstreamDocumentRequests = () => {
  const [requests, setRequests] = useState([]);

  // ✅ NEW STATES
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);

  const itemsPerPage = 10;

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
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/staff/document/my-access-requests`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setRequests(res.data.Data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     FILTER + SEARCH
  ========================= */
  const filteredRequests = requests
    .filter((r) => {
      if (activeTab === "All") return true;
      if (activeTab === "Approved") return r.status === "Approved";
      if (activeTab === "Pending") return r.status.includes("Pending");
      if (activeTab === "Rejected") return r.status === "Rejected";
      return true;
    })
    .filter((r) =>
      (r.title + r.reason).toLowerCase().includes(search.toLowerCase()),
    );

  /* =========================
     PAGINATION
  ========================= */
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const changePage = (page) => {
    setCurrentPage(page);
  };

  /* =========================
     HELPERS
  ========================= */
  const truncate = (text, max = 40) =>
    text?.length > max ? text.substring(0, max) + "..." : text;

  const isExpired = (date) => date && new Date(date).getTime() < Date.now();

  /* =========================
     VIEW MODAL (NEW)
  ========================= */

  const viewDetails = (r) => {
    Swal.fire({
      title: `<div class="fs-4 fw-bold"><span class="bi bi-file-earmark-pdf-fill text-danger me-2"></span>${r.title}</div>`,
      html: `
        <div class="text-start small">
  
          <div class="mb-2">
            <div class="text-muted fw-bold mb-1">Ownership</div>
            <div><span class="bi bi-building me-2"></span>${r.owner_department_name}</div>
          </div>
  
          <div class="mb-2">
            <div class="text-muted fw-bold mb-1">Request Justification</div>
            <div class="text-break">${r.reason}</div>
          </div>
  
          <div class="mb-2">
            <div class="text-muted fw-bold mb-2">Status</div>
            <span class="badge bg-warning text-dark border px-3 py-2 rounded-pill">${r.status}</span>
          </div>
  
          <div class="mb-2">
            <div class="text-muted fw-bold">Requested At</div>
            <div><small><span class="bi bi-clock-history me-2"></span>${new Date(r.created_at).toLocaleString()}</small></div>
          </div>
  
          ${
            r.expires_at
              ? `
          <div class="mb-2">
            <div class="text-muted fw-bold">Expires At</div>
            <div><small><span class="bi bi-calendar4-event me-2"></span>${new Date(r.expires_at).toLocaleString()}</small></div>
          </div>`
              : ""
          }
  
        </div>
      `,
      width: 600,
      confirmButtonText: "Close",
      confirmButtonColor: "#ef6c00",
    });
  };

  /* =========================
     DOWNLOAD (UNCHANGED)
  ========================= */
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
            // ✅ CALL ACTUAL DOWNLOAD
            startDownload(versionId);
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
        `${API_BASE_URL}/staff/documents/download/access/approved/${versionId}`,
        { responseType: "blob", withCredentials: true },
      );

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document";
      a.click();
    } catch {
      Swal.fire("Error", "Download failed", "error");
    }
  };

  /* =========================
     STATUS BADGE
  ========================= */
  const getBadge = (status) => {
    switch (status) {
      case "Pending_Department_Review":
        return (
          <span className="badge bg-warning fw-normal text-white px-3 py-2 rounded-pill">
            <i className="bi bi-hourglass-bottom me-1"></i>
            Pending Department Review
          </span>
        );

      case "Pending_Admin_Approval":
        return (
          <span className="badge bg-info text-white fw-normal px-3 py-2 rounded-pill">
            <i className="bi bi-hourglass-top me-1"></i>
            Pending Admin Approval
          </span>
        );

      case "Approved":
        return (
          <span className="badge bg-success text-white fw-normal px-3 py-2 rounded-pill">
            <i className="bi bi-check-circle me-1"></i>
            Approved
          </span>
        );

      case "Rejected":
        return (
          <span className="badge bg-danger text-white px-3 py-2 rounded-pill">
            <i className="bi bi-x-circle me-1"></i>
            Declined
          </span>
        );

      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 fw-bold">
        <span className="bi bi-building me-2"></span>Inter-Departmental Requests
        bbbb
      </h3>

      {/* 🔍 SEARCH */}
      <div className="d-flex justify-content-between mb-3">
        <input
          className="form-control w-100"
          placeholder="Search requests..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* 🧭 TABS */}
      <div className="mb-3">
        {["All", "Approved", "Pending", "Rejected"].map((tab) => (
          <button
            key={tab}
            className={`btn me-2 ${
              activeTab === tab ? "btn-dark" : "btn-outline-secondary"
            }`}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card shadow-sm">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Document</th>
                <th>Request Status</th>
                <th>Requested At</th>
                <th>Expires At</th>
                <th>Action</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No matching requests
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((r, i) => {
                  const expired = isExpired(r.expires_at);

                  return (
                    <React.Fragment key={r.id}>
                      {/* MAIN ROW */}
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="fw-semibold">
                            {truncate(r.title, 35)}
                          </div>

                          <small className="text-muted">
                            <i className="bi bi-building me-2"></i>
                            {r.owner_department_name}
                          </small>
                        </td>

                        <td>{getBadge(r.status)}</td>

                        <td>
                          <small className="text-muted">
                            {new Date(r.created_at).toLocaleDateString("en-GB")}
                          </small>
                        </td>

                        <td>
                          {r.expires_at ? (
                            <small
                              className={expired ? "text-danger" : "text-muted"}
                            >
                              {new Date(r.expires_at).toLocaleDateString(
                                "en-GB",
                              )}
                            </small>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            {/* VIEW */}
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => viewDetails(r)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>

                            {/* DOWNLOAD */}
                            {r.status === "Approved" &&
                            r.expires_at &&
                            !expired ? (
                              <button
                                className="btn btn-light border border-1 btn-sm"
                                onClick={() =>
                                  handleDownload(r.current_version_id)
                                }
                              >
                                <i className="bi bi-download me-2"></i>Download
                              </button>
                            ) : expired ? (
                              <span className="text-danger small">Expired</span>
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm rounded-circle border-0 shadow-sm"
                            style={{
                              width: "36px",
                              height: "36px",
                              background:
                                expandedRow === r.id ? "#df792b" : "#f8f9fa",
                              color: expandedRow === r.id ? "#fff" : "#495057",
                            }}
                            onClick={() =>
                              setExpandedRow(expandedRow === r.id ? null : r.id)
                            }
                          >
                            <i
                              className={`bi ${
                                expandedRow === r.id
                                  ? "bi-chevron-up"
                                  : "bi-chevron-down"
                              }`}
                            ></i>
                          </button>
                        </td>
                      </tr>

                      {/* EXPANDED ROW */}
                      {expandedRow === r.id && (
                        <tr>
                          <td colSpan="7" className="border-0 bg-light">
                            <div
                              className="rounded-4 border bg-white p-4 shadow-sm"
                              style={{
                                animation: "fadeIn 0.25s ease-in-out",
                              }}
                            >
                              <div className="row g-4">
                                {/* ACCESS JUSTIFICATION */}
                                <div className="col-md-6">
                                  <div className="h-100 rounded-4 border p-4 bg-light">
                                    <div className="d-flex align-items-center mb-3">
                                      <div
                                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                        style={{
                                          width: "45px",
                                          height: "45px",
                                          background: "#e8f4ff",
                                        }}
                                      >
                                        <i className="bi bi-shield-check text-primary"></i>
                                      </div>

                                      <div>
                                        <h6 className="fw-bold mb-0">
                                          Request Justification
                                        </h6>

                                        <small className="text-muted">
                                          Purpose for requesting access
                                        </small>
                                      </div>
                                    </div>
                                    <div
                                      className="rounded-3 p-3"
                                      style={{
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #f8d7da",
                                        minHeight: "120px",
                                      }}
                                    >
                                      <div className="text-secondary">
                                        {r.reason || (
                                          <span className="text-muted">
                                            No justification provided.
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* REVIEW FEEDBACK */}
                                {r.status?.toLowerCase() === "rejected" && (
                                  <div className="col-md-6">
                                    <div
                                      className="h-100 rounded-4 border p-4"
                                      style={{
                                        background: "#fff5f5",
                                        borderColor: "#f8d7da",
                                      }}
                                    >
                                      <div className="d-flex align-items-center mb-3">
                                        <div
                                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                          style={{
                                            width: "45px",
                                            height: "45px",
                                            background: "#ffe5e5",
                                          }}
                                        >
                                          <i className="bi bi-exclamation-octagon text-danger"></i>
                                        </div>

                                        <div>
                                          <h6 className="fw-bold mb-0 text-danger">
                                            Why was this request declined?
                                          </h6>

                                          <small className="text-muted">
                                            Feedback provided by the reviewer
                                          </small>
                                        </div>
                                      </div>

                                      <div
                                        className="rounded-3 p-3"
                                        style={{
                                          backgroundColor: "#ffffff",
                                          border: "1px solid #f8d7da",
                                          minHeight: "120px",
                                        }}
                                      >
                                        <div className="text-secondary">
                                          {r.admin_comment || (
                                            <span className="text-muted">
                                              No review comments were provided.
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>

          {/* 📄 PAGINATION */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-end mt-3">
              <nav>
                <ul className="pagination mb-0">
                  {[...Array(totalPages)].map((_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => changePage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkstreamDocumentRequests;
