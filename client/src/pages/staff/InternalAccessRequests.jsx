import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const StaffDocumentAccess = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch only requests for logged-in user
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/staff/my-access-requests",
        { withCredentials: true },
      );
      setRequests(res.data.Data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch requests", "error");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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
        `http://localhost:3000/staff/documents/download/${versionId}`,
        {
          withCredentials: true,
          responseType: "blob",
        },
      );

      // Extract filename
      const disposition = res.headers["content-disposition"];
      let filename = "downloaded-file";

      if (disposition && disposition.includes("filename=")) {
        filename = decodeURIComponent(
          disposition.split("filename=")[1].replace(/"/g, ""),
        );
      }

      // Create download
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      // ✅ Update UI
      setRequests((prev) =>
        prev.map((v) =>
          v.current_version_id === versionId
            ? { ...v, download_count: (v.download_count || 0) + 1 }
            : v,
        ),
      );

      // ✅ Success feedback
      Swal.fire({
        icon: "success",
        title: "Download Started",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire(
        "Download Failed",
        err.response?.data?.Error || "Unable to download file",
        "error",
      );
    }
  };

  // Filter requests
  useEffect(() => {
    let data = [...requests];

    if (statusFilter !== "all") {
      data = data.filter(
        (r) => (r.status || "pending").toLowerCase() === statusFilter,
      );
    }

    if (search) {
      data = data.filter((r) =>
        (r.title || "").toLowerCase().includes(search.toLowerCase()),
      );
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [search, statusFilter, requests]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Check if approved and not expired
  const canDownload = (r) => {
    if (r.status !== "approved") return false;
    if (!r.expires_at) return true;
    return new Date(r.expires_at) > new Date();
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">
        <i className="bi bi-shield-lock me-2"></i>
        My Requested Document Access
      </h3>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Search document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Document</th>
                  <th>Classification</th>
                  <th>Status</th>
                  <th>Expires At</th>
                  <th>Date Requested</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-3">
                      <div className="text-center py-5">
                        <i
                          className="bi bi-inbox text-muted"
                          style={{ fontSize: "40px" }}
                        ></i>

                        <h6 className="mt-3 fw-semibold">
                          No Access Requests Submitted
                        </h6>

                        <p className="text-muted mb-0">
                          You have not submitted any document access requests
                          yet.
                        </p>

                        <small className="text-muted">
                          New requests will appear here.
                        </small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((r, index) => (
                    <tr key={r.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{r.title}</td>
                      <td>{r.classification}</td>
                      <td>
                        <span
                          className={`badge ${
                            r.status === "approved"
                              ? "bg-success"
                              : r.status === "declined"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                          }`}
                        >
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {r.expires_at
                          ? new Date(r.expires_at).toLocaleString()
                          : "-"}
                      </td>
                      <td>{new Date(r.created_at).toLocaleString()}</td>
                      <td className="text-end text-center">
                        {canDownload(r) ? (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDownload(r.current_version_id)}
                          >
                            <i className="bi bi-download" title="Download"></i>
                          </button>
                        ) : r.status === "approved" ? (
                          <span className="text-danger">Expired</span>
                        ) : (
                          <span className="text-secondary">No Access</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {requests.length > 0 && (
            <div className="card-footer d-flex justify-content-between align-items-center">
              <span>
                Page {currentPage} of {totalPages || 1}
              </span>
              <div>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm me-1 ${
                      currentPage === i + 1
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="btn btn-sm btn-outline-secondary ms-2"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDocumentAccess;
