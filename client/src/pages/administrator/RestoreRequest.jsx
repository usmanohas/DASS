import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AdminRestoreRequests = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (p = 1) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/admin/restore-requests?page=${p}&status=${status}`,
        { withCredentials: true },
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
  const andleAction = async (id, action) => {
    const isApprove = action === "approve";

    const { value: comment } = await Swal.fire({
      title: isApprove ? "Approve Restore?" : "Reject Restore?",
      input: "textarea",
      inputLabel: "Admin Comment",
      showCancelButton: true,
      confirmButtonText: isApprove ? "Approve" : "Reject",
      confirmButtonColor: isApprove ? "#198754" : "#dc3545",
      inputValidator: (v) => (!v ? "Comment required" : null),
    });

    if (!comment) return;

    try {
      await axios.post(
        "http://localhost:3000/admin/restore-action",
        {
          request_id: id,
          action,
          comment,
        },
        { withCredentials: true },
      );

      Swal.fire("Success", "Action completed", "success");
      fetchData(page);
    } catch {
      Swal.fire("Error", "Failed action", "error");
    }
  };

  const handleAction = async (id, action) => {
    const isApprove = action === "approve";

    const result = await Swal.fire({
      title: isApprove ? "Approve Restore Request?" : "Reject Restore Request?",
      text: isApprove
        ? "This will restore the document and extend expiring date by 5 years."
        : "This request will be rejected.",
      icon: "warning",
      showCancelButton: true,
      //confirmButtonText: isApprove ? "Yes, Approve" : "Yes, Reject",
      confirmButtonText: isApprove
        ? '<i class="bi bi-check-circle me-1"></i> Approve'
        : '<i class="bi bi-x-circle me-1"></i> Reject',
      confirmButtonColor: isApprove ? "#198754" : "#dc3545",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.post(
        "http://localhost:3000/admin/restore-action",
        {
          request_id: id,
          action,
        },
        { withCredentials: true },
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

  const badge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="badge bg-warning">Pending</span>;
      case "Approved":
        return <span className="badge bg-success">Approved</span>;
      case "Rejected":
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const DocStatusbadge = (status) => {
    switch (status) {
      case "Deleted":
        return (
          <span className="badge bg-danger-subtle text-danger">Deleted</span>
        );
      default:
        return (
          <span className="badge bg-secondary-subtle text-secondary">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">
        <i className="bi bi-arrow-counterclockwise me-2"></i>
        Restore Document Requests
      </h3>

      {/* FILTER */}
      <div className="mb-3">
        <select
          className="form-select w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      {requests.length === 0 ? (
        <div className="card shadow-sm mb-3 border text-center">
          <div className="card-body">
            <i className="bi bi-inbox fs-1"></i>
            <div className="mt-2">No Requests Found</div>
          </div>
        </div>
      ) : (
        requests.map((r) => (
          <div key={r.id} className="card shadow-sm mb-3 border">
            <div className="card-body">
              {/* HEADER */}
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="fw-semibold mb-1">{r.title}</h6>
                  <div>{DocStatusbadge(r.document_status)}</div>
                  <small className="text-muted">
                    <span className="bi bi-building me-1"></span>
                    {r.department_name}
                  </small>
                  <div>
                    <small>
                      <span className="bi bi-person me-1"></span>
                      {r.requested_by} (DFP)
                    </small>
                  </div>
                </div>
                <div>{badge(r.status)}</div>
              </div>

              {/* COLLAPSIBLE */}
              <details className="mt-3">
                <summary className="cursor-pointer text-secondary">
                  View Details
                </summary>

                <div className="mt-2 small text-muted">
                  <p>
                    <strong>Expired At:</strong>{" "}
                    {r.retention_expiry_date
                      ? new Date(r.retention_expiry_date).toLocaleDateString(
                          "en-GB",
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Reason for Restore:</strong> {r.reason}
                  </p>
                  <p>
                    <strong>Requested At:</strong>{" "}
                    {new Date(r.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </details>

              {/* ACTION */}
              {r.status === "Pending" && (
                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleAction(r.id, "approve")}
                  >
                    Approve Request
                  </button>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleAction(r.id, "reject")}
                  >
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
      {/* PAGINATION */}
      {requests.length > 0 && (
        <div className="d-flex justify-content-center mt-3 gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page === 1}
            onClick={() => fetchData(page - 1)}
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page === totalPages}
            onClick={() => fetchData(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminRestoreRequests;
