import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const InternalAccessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selected, setSelected] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // ✅ PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ FETCH
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/department/staff/access-requests`,
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

  // ✅ FILTER
  useEffect(() => {
    let data = [...requests];

    if (statusFilter !== "all") {
      data = data.filter(
        (r) =>
          (r.status || "pending").toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    if (search) {
      data = data.filter(
        (r) =>
          (r.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (r.title || "").toLowerCase().includes(search.toLowerCase()),
      );
    }

    setFiltered(data);
    setCurrentPage(1); // ✅ reset page when filtering
  }, [search, statusFilter, requests]);

  // ✅ PAGINATION LOGIC
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ✅ APPROVE
  const handleApprove = async (req) => {
    const { value: expiry } = await Swal.fire({
      title: "Approve Request",
      input: "datetime-local",
      inputLabel: "Select Expiry Date",
      inputAttributes: { required: true },
      showCancelButton: true,
      confirmButtonText: "Approve",
      confirmButtonColor: "#198754",
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage("Expiry required");
        }
        return value;
      },
    });

    if (!expiry) return;

    try {
      Swal.fire({ title: "Processing...", didOpen: () => Swal.showLoading() });

      const res = await axios.post(
        `${API_BASE_URL}/department/staff/access-requests/${req.id}/approve`,
        { expires_at: expiry },
        { withCredentials: true },
      );

      Swal.close();

      if (res.data.Status) {
        Swal.fire("Approved!", "", "success");
        fetchRequests();
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    } catch {
      Swal.fire("Error", "Server error", "error");
    }
  };

  // ✅ REJECT
  const handleReject = async (req) => {
    const { value: reason } = await Swal.fire({
      title: "Decline Request",
      input: "textarea",
      inputLabel: "Reason for Declined",
      inputAttributes: { required: true },
      inputPlaceholder: "Enter reason...",
      showCancelButton: true,
      confirmButtonText: "Decline",
      confirmButtonColor: "#dc3545",
    });

    if (reason === undefined) return;

    try {
      Swal.fire({ title: "Processing...", didOpen: () => Swal.showLoading() });

      const res = await axios.post(
        `${API_BASE_URL}/department/staff/access-requests/${req.id}/reject`,
        { reason },
        { withCredentials: true },
      );

      Swal.close();

      if (res.data.Status) {
        Swal.fire("Declined!", "", "success");
        fetchRequests();
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    } catch {
      Swal.fire("Error", "Server error", "error");
    }
  };

  return (
    <div className="container mt-3">
      <h3 className="mb-3 fw-bold">
        <i className="bi bi-folder-check me-2"></i>
        Internal Document Requests
      </h3>

      {/* FILTER */}
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Search..."
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

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">#</th>
                  <th>Staff</th>
                  <th>Division / Unit / State</th>
                  <th>Document Title</th>
                  <th>Classification</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-center pe-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <i
                        className="bi bi-inbox text-muted"
                        style={{ fontSize: "3rem" }}
                      ></i>

                      <h6 className="mt-3 fw-semibold">
                        No Access Requests Submitted
                      </h6>

                      <p className="text-muted mb-0">
                        Department staff have not submitted any document access
                        requests yet.
                      </p>

                      <small className="text-muted">
                        New requests will appear here.
                      </small>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((r, index) => (
                    <tr key={r.id}>
                      <td className="ps-4 fw-semibold text-muted">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td>
                        <div className="text-muted">
                          {r.full_name}
                        </div>
                      </td>

                      <td>
                        <span className="text-muted">
                          {r.division_unit_state}
                        </span>
                      </td>

                      <td>
                        <div className="text-dark">{r.title}</div>
                      </td>

                      <td>
                        <span
                          className="badge rounded-pill px-3 py-2"
                          style={{
                            backgroundColor: "#eef6ff",
                            color: "#0d6efd",
                            fontWeight: 600,
                          }}
                        >
                          {r.classification}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${
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
                        <small className="text-muted">
                          {new Date(r.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </small>
                      </td>

                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-light border rounded-circle action-btn"
                            title="View Details"
                            onClick={() => {
                              setSelected(r);
                              setShowDetails(true);
                            }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>

                          {r.status === "pending" && (
                            <>
                              <button
                                className="btn btn-success rounded-circle action-btn"
                                title="Approve Request"
                                onClick={() => handleApprove(r)}
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>

                              <button
                                className="btn btn-danger rounded-circle action-btn"
                                title="Decline Request"
                                onClick={() => handleReject(r)}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {requests.length > 0 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <small className="text-muted">
                Showing page {currentPage} of {totalPages}
              </small>

              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>

                  {[...Array(totalPages)].map((_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* DETAILS MODAL */}
      {showDetails && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Request Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowDetails(false)}
                ></button>
              </div>

              <div className="modal-body">
                <p>
                  <b>Staff:</b> {selected.full_name}
                </p>
                <p>
                  <b>Email:</b> {selected.email}
                </p>
                <p>
                  <b>Document:</b> {selected.title}
                </p>
                <p>
                  <b>Reason:</b> {selected.reason}
                </p>
                <hr />
                <p>
                  <b>
                    <i className="bi bi-card-text me-2 text-info"></i>
                    Approve/Decline Note:
                  </b>
                  <br /> <small>{selected.review_note}</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalAccessRequests;
