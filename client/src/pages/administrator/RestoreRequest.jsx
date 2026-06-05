import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const AdminRestoreRequests = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (p = 1) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/admin/restore-requests?page=${p}&status=${status}`,
        { withCredentials: true }
      );

      if (res.data.Status) {
        setRequests(res.data.Data);
        setTotalPages(res.data.totalPages);
        setPage(p);
      }
    } catch {
      Swal.fire("Error", "Failed to load data", "error");
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [status]);

  /* ================= ACTION ================= */
  const handleAction = async (id, action) => {
    const isApprove = action === "approve";

    const result = await Swal.fire({
      title: isApprove
        ? "Approve Restore Request?"
        : "Decline Restore Request?",
      text: isApprove
        ? "Document will be restored and retention extended."
        : "This request will be decline.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isApprove ? "#198754" : "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: isApprove ? "Approve" : "Decline",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.post(
        `${API_BASE_URL}/admin/restore-action`,
        { request_id: id, action },
        { withCredentials: true }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: isApprove
          ? "Document restored successfully"
          : "Request rejected successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchData(page);
    } catch {
      Swal.fire("Error", "Failed action", "error");
    }
  };

  /* ================= BADGES ================= */
  const getDocumentStatusBadge = (status) => {
    switch (status) {
      case "Deleted":
        return (
          <span className="badge bg-danger-subtle text-danger border px-3 py-2 rounded-pill">
            Deleted Document
          </span>
        );
      case "Archived":
        return (
          <span className="badge bg-secondary-subtle text-secondary border px-3 py-2 rounded-pill">
            Archived Document
          </span>
        );
      default:
        return (
          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
            Active Document
          </span>
        );
    }
  };

  const getActionStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="badge bg-warning text-dark border px-3 py-2 rounded-pill">
            Pending Review
          </span>
        );
      case "Approved":
        return <span className="badge bg-success border px-3 py-2 rounded-pill">Approved</span>;
      case "Rejected":
        return <span className="badge bg-danger border px-3 py-2 rounded-pill">Rejected</span>;
      default:
        return <span className="badge bg-secondary border px-3 py-2 rounded-pill">{status}</span>;
    }
  };

  return (
    <div className="container py-4">

      {/* ================= HEADER ================= */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <i className="bi bi-arrow-counterclockwise fs-3"></i>
              <h3 className="fw-bold mb-0">Restore Requests</h3>
            </div>
            <p className="text-muted mb-0">
              Manage document restoration workflow and approvals
            </p>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body rounded-2 py-2 px-3 text-center bg-success">
              <div className="small text-white">Total Requests</div>
              <div className="fw-bold text-white ">{requests.length}</div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= FILTER ================= */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">

          <h6 className="mb-0">
            <i className="bi bi-funnel me-2"></i> Filter
          </h6>

          <select
            className="form-select"
            style={{ width: 220 }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

        </div>
      </div>

      {/* ================= EMPTY ================= */}
      {requests.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-inbox fs-1 text-muted"></i>
            <h5 className="mt-3">No Restore Requests</h5>
            <p className="text-muted mb-0">
              No restoration requests available at this time.
            </p>
          </div>
        </div>
      ) : (
        requests.map((r) => (
          <div
            key={r.id}
            className="card border-0 shadow-sm mb-3"
            style={{
              borderLeft:
                r.status === "Pending"
                  ? "5px solid #ffc107"
                  : r.status === "Approved"
                  ? "5px solid #198754"
                  : "5px solid #dc3545",
            }}
          >

            <div className="card-body">

              {/* ================= HEADER ================= */}
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">

                <div>
                  <h5 className="fw-bold mb-1">{r.title}</h5>

                  {/* 🔥 CLEAR SEPARATION OF STATUS TYPES */}
                  <div className="mb-2">
                    <div className="small text-muted mb-1">
                      Document Status
                    </div>
                    {getDocumentStatusBadge(r.document_status)}
                  </div>

                  <div className="mb-2">
                    <div className="small text-muted mb-1">
                      Request Status
                    </div>
                    {getActionStatusBadge(r.status)}
                  </div>

                  <div className="small text-muted mt-2">
                    <div>
                      <i className="bi bi-building me-2"></i>
                      {r.department_name}
                    </div>

                    <div>
                      <i className="bi bi-person me-2"></i>
                      {r.requested_by}
                    </div>
                  </div>
                </div>

              </div>

              {/* ================= DETAILS ================= */}
              <details className="mt-3">
                <summary className="fw-semibold text-secondary" style={{ cursor: "pointer" }}>
                  View Details
                </summary>

                <div className="mt-3 bg-light p-3 rounded">

                  <div className="row g-3">

                    <div className="col-md-4">
                      <small className="text-muted">Retention Expiry</small>
                      <div className="fw-semibold">
                        {r.retention_expiry_date
                          ? new Date(r.retention_expiry_date).toLocaleDateString("en-GB")
                          : "N/A"}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <small className="text-muted">Request Date</small>
                      <div className="fw-semibold">
                        {new Date(r.created_at).toLocaleDateString("en-GB")}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <small className="text-muted">Requested By</small>
                      <div className="fw-semibold">{r.requested_by}</div>
                    </div>

                    <div className="col-12">
                      <small className="text-muted">Reason</small>
                      <div>{r.reason}</div>
                    </div>

                  </div>

                </div>
              </details>

              {/* ================= ACTION ================= */}
              {r.status === "Pending" && (
                <div className="mt-4 d-flex gap-2 flex-wrap">

                  <button
                    className="btn btn-success"
                    onClick={() => handleAction(r.id, "approve")}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Approve
                  </button>

                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleAction(r.id, "reject")}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Decline
                  </button>

                </div>
              )}

            </div>
          </div>
        ))
      )}

      {/* ================= PAGINATION ================= */}
      {requests.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">

          <small className="text-muted">
            Page {page} of {totalPages}
          </small>

          <div className="btn-group">
            <button
              className="btn btn-outline-secondary"
              disabled={page === 1}
              onClick={() => fetchData(page - 1)}
            >
              Prev
            </button>

            <button
              className="btn btn-outline-secondary"
              disabled={page === totalPages}
              onClick={() => fetchData(page + 1)}
            >
              Next
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default AdminRestoreRequests;