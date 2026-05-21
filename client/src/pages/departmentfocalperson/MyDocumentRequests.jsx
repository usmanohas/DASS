import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const MyDocumentRequests = () => {
  const [requests, setRequests] = useState([]);

  // ✅ NEW STATES
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

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
        "http://localhost:3000/department/document/my-access-requests",
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
        `http://localhost:3000/department/documents/download/access/approved/${versionId}`,
        {
          responseType: "blob",
          withCredentials: true,
        },
      );

      /* =========================
       HANDLE ERROR BLOBS
    ========================= */
      const contentType = res.headers["content-type"];

      // backend returned json error instead of file
      if (contentType?.includes("application/json")) {
        const text = await res.data.text();
        const errorData = JSON.parse(text);

        Swal.fire(
          "Download Failed",
          errorData.Error || "Unable to download document",
          "error",
        );

        return;
      }

      /* =========================
       EXTRACT FILENAME
    ========================= */
      let filename = "document";

      const disposition = res.headers["content-disposition"];

      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replace(/"/g, "").trim();
      }

      /* =========================
       DOWNLOAD FILE
    ========================= */
      const blob = new Blob([res.data], {
        type: contentType || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Download Started",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);

      let errorMessage = "Download failed";

      // axios blob error handling
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);

          errorMessage =
            json.Error || json.Message || "Unable to download document";
        } catch {
          errorMessage = "Unable to download document";
        }
      }

      Swal.fire("Download Failed", errorMessage, "error");
    }
  };

  /* =========================
     STATUS BADGE
  ========================= */
  const getBadge = (status) => {
    switch (status) {
      case "Pending_Department_Review":
        return (
          <span className="badge bg-warning text-white border px-3 py-2 rounded-pill">
            <i className="bi bi-hourglass-bottom me-1"></i>
            Awaiting Department Review
          </span>
        );

      case "Pending_Admin_Approval":
        return (
          <span className="badge bg-info text-white border px-3 py-2 rounded-pill">
            <i className="bi bi-hourglass-top me-1"></i>
            Awaiting Admin Approval
          </span>
        );

      case "Approved":
        return (
          <span className="badge bg-success border px-3 py-2 rounded-pill">
            <i className="bi bi-check-circle me-1"></i>
            Approved
          </span>
        );

      case "Rejected":
        return (
          <span className="badge bg-danger border px-3 py-2 rounded-pill">
            <i className="bi bi-x-circle me-1"></i>
            Denied
          </span>
        );

      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-bold">
        <span className="bi bi-building me-2 text-success"></span>
        My Inter-Departmental Requests
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
                <th>Reason</th>
                <th>Request Status</th>
                <th>Requested At</th>
                <th>Expires At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No matching requests
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((r, i) => {
                  const expired = isExpired(r.expires_at);

                  return (
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

                      <td className="text-muted">{truncate(r.reason, 45)}</td>

                      <td>{getBadge(r.status)}</td>

                      <td>
                        <small className="text-muted">
                          {new Date(r.created_at).toLocaleDateString("en-GB")}
                        </small>
                      </td>

                      <td>
                        {r.expires_at ? (
                          <div>
                            <small
                              className={`fw-semibold ${
                                expired ? "text-danger" : "text-success"
                              }`}
                            >
                              <i className="bi bi-calendar-event me-1"></i>

                              {expired ? "Expired: " : "Expires: "}

                              {new Date(r.expires_at).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </small>

                            <div>
                              <small className="text-muted">
                                {new Date(r.expires_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </small>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">No expiry</span>
                        )}
                      </td>

                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center align-items-center">
                          {/* VIEW BUTTON */}
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => viewDetails(r)}
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>

                          {/* DOWNLOAD BUTTON */}
                          {r.status === "Approved" ? (
                            expired ? (
                              <span className="badge bg-danger-subtle text-danger border">
                                <i className="bi bi-clock-history me-1"></i>
                                Access Expired
                              </span>
                            ) : (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  handleDownload(r.current_version_id)
                                }
                                title="Download Document"
                              >
                                <i className="bi bi-download me-1"></i>
                                Download
                              </button>
                            )
                          ) : (
                            <span className="text-muted small">
                              Not Available
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
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

export default MyDocumentRequests;
