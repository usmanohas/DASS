import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

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
        "http://localhost:3000/department/staff/access-requests",
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
        `http://localhost:3000/department/staff/access-requests/${req.id}/approve`,
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
        `http://localhost:3000/department/staff/access-requests/${req.id}/reject`,
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
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Staff</th>
                  <th>Division/Unit/State</th>
                  <th>Document</th>
                  <th>Classification</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-3">
                      <div className="text-center py-5">
                        <i
                          className="bi bi-inbox text-muted"
                          style={{ fontSize: "40px" }}
                        ></i>

                        <h6 className="mt-3 fw-semibold">
                          No Access Requests Submitted
                        </h6>

                        <p className="text-muted mb-0">
                          Department staff have not submitted any document
                          access requests yet.
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
                      {/* ✅ ROW NUMBER */}
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>

                      <td>{r.full_name}</td>
                      <td>{r.division_unit_state}</td>
                      <td>{r.title}</td>
                      <td className="fw-bold">
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                          {r.classification}
                        </span>
                      </td>
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

                      <td>{new Date(r.created_at).toLocaleString()}</td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
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
                                className="btn btn-sm btn-success"
                                onClick={() => handleApprove(r)}
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>

                              <button
                                className="btn btn-sm btn-danger"
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

          {/* ✅ PAGINATION UI */}
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
