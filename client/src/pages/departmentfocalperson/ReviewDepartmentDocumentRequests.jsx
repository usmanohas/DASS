import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const ReviewDepartmentDocRequests = () => {
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
        `${API_BASE_URL}/department/document/cross-department-requests?page=${pageNum}&status=${status}&search=${search}`,
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

    const defaultApproveComment =
      "I have reviewed this request and confirm it meets the required criteria. I recommend approval and forwarding to the admin for final processing.";

    const defaultRejectComment =
      "I have reviewed this request and it does not meet the required criteria at this time. I recommend rejection with the reasons stated above.";

    const { value: comment } = await Swal.fire({
      title: isApprove ? "Approve Request" : "Decline Request",
      input: "textarea",
      inputLabel: "Review Comment",
      inputValue: isApprove ? defaultApproveComment : defaultRejectComment, // ✅ pre-filled editable text
      inputPlaceholder: "You can edit the comment before submitting...",
      inputAttributes: {
        "aria-label": "Enter your comment",
      },
      showCancelButton: true,
      confirmButtonText: isApprove ? "Approve Request" : "Decline Request",
      confirmButtonColor: isApprove ? "#109090" : "#dc3545",
      cancelButtonText: "Cancel",

      /* validation */
      inputValidator: (value) => {
        if (!value || value.trim() === "") {
          return "Comment is required before submitting.";
        }
      },
    });

    if (!comment) return;

    try {
      await axios.post(
        `${API_BASE_URL}/department/department-review`,
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
          <span className="badge bg-warning text-white fw-normal px-3 py-2 rounded-pill">
            <i className="bi bi-hourglass-split me-1"></i>
            Pending Department Review
          </span>
        );

      case "Pending_Admin_Approval":
        return (
          <span className="badge bg-info fw-normal text-white px-3 py-2 rounded-pill">
            Pending Admin Approval
          </span>
        );

      case "Approved":
        return (
          <span className="badge bg-success fw-normal px-3 py-2 rounded-pill">
            Approved
          </span>
        );

      case "Rejected":
        return (
          <span className="badge bg-danger fw-normal px-3 py-2 rounded-pill">
            Declined
          </span>
        );

      default:
        return (
          <span className="badge bg-secondary fw-normal px-3 py-2 rounded-pill">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-bold">
        <i className="bi bi-building me-2"></i>
        Review Inter-Departmental Document Requests
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
            <option value="Pending_Department_Review">
              Pending DFP Review
            </option>
            <option value="Pending_Admin_Approval">
              Pending Admin Approval
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
                <th>Document Title</th>
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
                      <div className="mt-2 mb-2">
                        <span className="fw-bold">
                          No Access Requests Found
                        </span>
                      </div>
                      <p className="text-muted mb-0">
                        There are currently no document access requests from
                        other departments.
                      </p>

                      <small className="text-muted">
                        New requests will appear here for your review.
                      </small>
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
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{
                              width: "48px",
                              height: "48px",
                              backgroundColor: "#109090",
                              fontSize: "0.95rem",
                            }}
                          >
                            {r.staff_name
                              ?.split(" ")
                              ?.filter(Boolean)
                              ?.slice(0, 2)
                              ?.map((n) => n.charAt(0).toUpperCase())
                              ?.join("")}
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
                        {new Date(r.created_at).toLocaleDateString()}
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
                      <td colSpan="5" className="p-0 border-0">
                        <div
                          style={{
                            maxHeight: expandedId === r.id ? "600px" : "0",
                            overflow: "hidden",
                            transition: "all 0.35s ease",
                          }}
                        >
                          <div
                            className="m-3 p-4 rounded-4 border bg-white shadow-sm"
                            style={{
                              borderLeft: "4px solid #198754",
                            }}
                          >
                            {/* Header */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                              <div>
                                <h6 className="fw-bold mb-1">
                                  <i className="bi bi-file-earmark-text me-2 text-success"></i>
                                  Access Request Details
                                </h6>

                                <small className="text-muted">
                                  Review the request information before taking
                                  action.
                                </small>
                              </div>

                              <span className="badge rounded-pill px-3 py-2 bg-dark-subtle text-dark">
                                {r.created_at
                                  ? new Date(r.created_at).toLocaleString()
                                  : ""}
                              </span>
                            </div>

                            <div className="row g-4">
                              {/* Request Justification */}
                              <div className="col-md-6">
                                <div className="border rounded-3 p-3 h-100">
                                  <div className="fw-semibold mb-2 text-dark">
                                    <i className="bi bi-chat-text me-2 text-primary"></i>
                                    Request Justification
                                  </div>

                                  <div className="text-muted small">
                                    {r.reason || "No justification provided."}
                                  </div>
                                </div>
                              </div>

                              {/* DFP Comment */}
                              <div className="col-md-6">
                                <div className="border rounded-3 p-3 h-100">
                                  <div className="fw-semibold mb-2 text-dark">
                                    <i className="bi bi-chat-right-text me-2 text-info"></i>
                                    DFP Comment
                                  </div>

                                  <div className="text-muted small">
                                    {r.dfp_comment || "No comment provided."}
                                  </div>
                                </div>
                              </div>

                              {/* Classification */}
                              <div className="col-md-6">
                                <div className="border rounded-3 p-3 h-100">
                                  <div className="fw-semibold mb-2 text-dark">
                                    <i className="bi bi-shield-lock me-2 text-warning"></i>
                                    Document Classification
                                  </div>

                                  <span
                                    className="badge rounded-pill px-3 py-2"
                                    style={{
                                      backgroundColor: "#109090",
                                      color: "#fff",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    {r.document_classification}
                                  </span>
                                </div>
                              </div>

                              {/* Review Date */}
                              <div className="col-md-6">
                                <div className="border rounded-3 p-3 h-100">
                                  <div className="fw-semibold mb-2 text-dark">
                                    <i className="bi bi-clock-history me-2 text-secondary"></i>
                                    DFP Reviewed At
                                  </div>

                                  <div className="text-muted small">
                                    {r.department_reviewed_at
                                      ? new Date(
                                          r.department_reviewed_at,
                                        ).toLocaleString()
                                      : "Not reviewed yet"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {r.status === "Pending_Department_Review" && (
                              <div className="border-top mt-4 pt-3">
                                <div className="d-flex justify-content-end gap-2">
                                  <button
                                    className="btn btn-outline-danger px-4"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReview(r.id, "reject");
                                    }}
                                  >
                                    <i className="bi bi-x-circle me-2"></i>
                                    Decline Request
                                  </button>

                                  <button
                                    className="btn btn-success px-4"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReview(r.id, "approve");
                                    }}
                                  >
                                    <i className="bi bi-check-circle me-2"></i>
                                    Approve Request
                                  </button>
                                </div>
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

export default ReviewDepartmentDocRequests;
