import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AdminReviewDepartmentDocRequests = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = async (pageNum = 1) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/admin/document/cross-department-requests?page=${pageNum}&status=${status}&search=${search}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setRequests(res.data.Data);
        setTotalPages(res.data.totalPages);
        setPage(pageNum);
      }
    } catch {
      Swal.fire("Error", "Failed to load requests", "error");
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, [status, search]);

  /* ================= REVIEW ================= */
  const handleReview = async (id, action) => {
    const isApprove = action === "approve";

    const { value: comment } = await Swal.fire({
      title: isApprove ? "Approve Access Request" : "Reject Access Request",
      input: "textarea",
      inputLabel: "Review Comment",
      inputPlaceholder: "Enter your comment...",
      inputAttributes: {
        "aria-label": "Enter your comment",
      },
      showCancelButton: true,
      confirmButtonText: isApprove ? "Approve Request" : "Reject Request",
      confirmButtonColor: isApprove ? "#198754" : "#dc3545", // green / red
      cancelButtonText: "Cancel",

      /* ✅ VALIDATION */
      inputValidator: (value) => {
        if (!value || value.trim() === "") {
          return "Comment is required before submitting.";
        }
      },
    });

    // if user cancels, comment will be undefined
    if (!comment) return;

    try {
      await axios.post(
        "http://localhost:3000/admin/admin-review",
        {
          request_id: id,
          action,
          comment,
        },
        { withCredentials: true },
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: isApprove
          ? "Request approved and forwarded for admin review"
          : "Request has been rejected",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchRequests(page);
    } catch {
      Swal.fire("Error", "Failed to update request", "error");
    }
  };

  const getBadge = (status) => {
    switch (status) {
      case "Pending_Department_Review":
        return (
          <span className="badge bg-warning text-white">
            <i className="bi bi-hourglass-split me-1"></i>
            Awaiting Department Review
          </span>
        );

      case "Pending_Admin_Approval":
        return (
          <span className="badge bg-warning text-white">
            Pending
          </span>
        );

      case "Approved":
        return <span className="badge bg-success">Approved</span>;

      case "Rejected":
        return <span className="badge bg-danger">Declined</span>;

      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">
        <i className="bi bi-shield-check me-2"></i>
        Review Cross Department Access Requests
      </h3>

      {/* FILTERS */}
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
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending_Admin_Approval">
              Pending
            </option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Requested By</th>
                <th>Document</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1"></i>
                      <div className="mt-2">No Access Requests Found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <React.Fragment key={r.id}>
                    {/* MAIN ROW */}
                    <tr
                      className="align-middle"
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleExpand(r.id)}
                    >
                      {/* REQUESTER */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className=" text-success d-flex justify-content-center align-items-center"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              fontWeight: "600",
                              backgroundColor:"#d1e7dd",
                            }}
                          >
                            {r.staff_name?.charAt(0)?.toUpperCase()}
                          </div>

                          <div>
                            <div className="fw-semibold small">
                              {r.staff_name}
                            </div>
                            <small className="text-muted">
                              {r.requester_department_name}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* DOCUMENT */}
                      <td>
                        <div className="text-muted">{r.document_title}</div>
                      </td>

                      {/* STATUS */}
                      <td>{getBadge(r.status)}</td>

                      {/* DATE */}
                      <td className="text-muted small">
                        {new Date(r.created_at).toLocaleDateString("en-GB")}
                      </td>

                      {/* CARET */}
                      <td className="text-end">
                        <i
                          className={`bi ${
                            expandedId === r.id
                              ? "bi-chevron-up"
                              : "bi-chevron-down"
                          }`}
                        ></i>
                      </td>
                    </tr>

                    {/* EXPANDED ROW */}
                    <tr>
                      <td colSpan="5" style={{ padding: 0, border: "none" }}>
                        <div
                          style={{
                            maxHeight: expandedId === r.id ? "500px" : "0px",
                            overflow: "hidden",
                            transition: "all 0.3s ease",
                            background: "#f8f9fa",
                          }}
                        >
                          <div className="p-3 border-top">
                            {/* DETAILS GRID */}
                            <div className="row">
                              {/* REASON */}
                              <div className="col-md-6 mb-3">
                                <small className="fw-semibold"><i className="bi bi-chat-text me-1"></i>
                                  Request Justification
                                </small>
                                <div className="text-muted small">
                                  {r.reason || "N/A"}
                                </div>
                              </div>

                              {/* DFP COMMENT */}
                              <div className="col-md-6 mb-3">
                                <small className="fw-semibold"><i className="bi bi-chat-right-text me-1"></i>
                                  DFP Comment
                                </small>
                                <div className="text-muted small">
                                  {r.dfp_comment || "No comment"}
                                </div>
                              </div>

                              {/* CLASSIFICATION */}
                              <div className="col-md-6 mb-3">
                                <small className="fw-semibold"><i className="bi bi-bookmarks me-1"></i>
                                  Document Classification
                                </small>
                                <div className="text-muted small">
                                  {r.document_classification}
                                </div>
                              </div>

                              {/* REVIEW DATE */}
                              <div className="col-md-6 mb-3">
                                <small className="fw-semibold"><i className="bi bi-clock-history me-1"></i>
                                  DFP Reviewed At
                                </small>
                                <div className="text-muted small">
                                  {r.department_reviewed_at
                                    ? new Date(
                                        r.department_reviewed_at,
                                      ).toLocaleString("en-GB")
                                    : "Not reviewed"}
                                </div>
                              </div>
                            </div>

                            {/* ACTION */}
                            {r.status === "Pending_Admin_Approval" && (
                              <div className="d-flex gap-2 mt-2">
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReview(r.id, "approve");
                                  }}
                                >
                                  <i className="bi bi-check-circle me-1"></i>
                                  Approve
                                </button>

                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReview(r.id, "reject");
                                  }}
                                >
                                  <i className="bi bi-x-circle me-1"></i>
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {requests.length > 0 && (
            <div className="d-flex justify-content-center mt-3 gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page === 1}
                onClick={() => fetchRequests(page - 1)}
              >
                Prev
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page === totalPages}
                onClick={() => fetchRequests(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewDepartmentDocRequests;
