import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const ArchiveDeletePage = () => {
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/department/document/archive-delete?page=${page}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setDocuments(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [page]);

  /* ✅ SWEET ALERT RESTORE */
  const requestRestore = async (id) => {
    const { value: reason } = await Swal.fire({
      title: "Request Document Restore",
      input: "textarea",
      inputLabel: "Reason for restore",
      inputPlaceholder: "Enter detailed reason...",
      inputAttributes: {
        "aria-label": "Type your reason here",
      },
      showCancelButton: true,
      confirmButtonText: "Submit Request",
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
      inputValidator: (value) => {
        if (!value) {
          return "Reason is required!";
        }
      },
    });

    if (!reason) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/department/document/${id}/request-restore`,
        { reason },
        { withCredentials: true },
      );

      if (!res.data.Status) {
        Swal.fire("Info", res.data.Message, "info");
        return;
      }

      if (res.data.Status) {
        Swal.fire({
          icon: "success",
          title: "Request Sent",
          text: "Restore request submitted successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      // 🔥 REFRESH DATA IMMEDIATELY
      fetchDocs();
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0 fw-bold">
            <i className="bi bi-archive me-2 text-muted"></i>
            Archived & Deleted Documents
          </h3>
          <small className="text-muted">
            Manage and request restoration of documents
          </small>
        </div>
      </div>

      {/* CARD */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          {/* LOADING */}
          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border text-primary mb-2"></div>
              <div>Loading documents...</div>
            </div>
          ) : documents.length === 0 ? (
            /* EMPTY STATE */
            <div className="text-center py-5 text-muted">
              <i className="bi bi-folder-x fs-1"></i>
              <div className="mt-2">No archived or deleted documents</div>
            </div>
          ) : (
            <>
              {/* TABLE */}
              <div className="table-responsive">
                <table className="table align-middle table-hover">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">#</th>
                      <th>Document</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Date</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {documents.map((doc, index) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="text-center">{index + 1}</div>
                        </td>
                        {/* DOCUMENT */}
                        <td>
                          <div className="">{doc.title}</div>
                        </td>

                        {/* STATUS */}
                        <td className="text-center">
                          {doc.is_delete ? (
                            <span className="badge rounded-pill bg-danger-subtle text-danger">
                              Deleted
                            </span>
                          ) : (
                            <span className="badge rounded-pill bg-dark-subtle text-white">
                              Archived
                            </span>
                          )}
                        </td>

                        {/* DATE */}
                        <td className="text-muted text-center">
                          {doc.is_delete
                            ? new Date(doc.delete_at).toLocaleDateString()
                            : new Date(doc.archived_at).toLocaleDateString()}
                        </td>

                        {/* ACTION */}
                        <td className="text-center">
                          {doc.restore_status === "Pending" ? (
                            <button
                              className="btn btn-sm btn-secondary rounded-pill px-3"
                              disabled
                            >
                              <i className="bi bi-hourglass-split me-1"></i>
                              Request Sent
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-primary rounded-pill px-3"
                              onClick={() => requestRestore(doc.id)}
                            >
                              <i className="bi bi-arrow-clockwise me-1"></i>
                              Restore
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ← Previous
                </button>

                <span className="small text-muted">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>

                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveDeletePage;
