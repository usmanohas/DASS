import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const DeleteDocumentRequests = () => {
  const [data, setData] = useState([]);
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [expandedId, setExpandedId] = useState(null);

  const fetchData = async (pageNum = 1) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/admin/delete-requests?page=${pageNum}&department=${department}&search=${search}`,
        { withCredentials: true }
      );

      if (res.data.Status) {
        setData(res.data.Data);
        setTotalPages(res.data.totalPages);
        setPage(pageNum);
      }
    } catch {
      Swal.fire("Error", "Failed to load data", "error");
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [department, search]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Document?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/admin/delete-document/${id}`,
        { withCredentials: true }
      );

      if (res.data.Status) {
        Swal.fire("Deleted", res.data.Message, "success");
        fetchData(page);
      }
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const totalRequests = data.length;

  return (
    <div className="container-fluid py-4">

      {/* ================= HEADER ================= */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">

          <div>
            <h3 className="fw-bold mb-1">
              <i className="bi bi-trash me-2 text-danger"></i>
              Delete Document Requests
            </h3>

            <p className="text-muted mb-0">
              Review and permanently remove document deletion requests
            </p>
          </div>

          {/* STAT CARD */}
          <div
            className="rounded-3 px-4 py-3 text-white text-center shadow-sm"
            style={{ background: "#dc3545", minWidth: 160 }}
          >
            <div className="small">Total Requests</div>
            <div className="fs-3 fw-bold">{totalRequests}</div>
          </div>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">

            <div className="col-md-10">
              <input
                className="form-control"
                placeholder="Search document, code, or title..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>


            <div className="col-md-2 d-grid">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearch("");
                  setDepartment("");
                  setPage(1);
                }}
              >
                <i className="bi bi-arrow-repeat me-1"></i>
                Reset
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">

          {data.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1"></i>
              <div className="mt-2">No Delete Requests Found</div>
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Document Title</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((d, i) => (
                    <React.Fragment key={d.id}>

                      {/* MAIN ROW */}
                      <tr
                        onClick={() => toggleExpand(d.id)}
                        style={{
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                        className="hover-row"
                      >
                        <td className="text-muted">{i + 1}</td>

                        <td>
                          <div className="fw-semibold">{d.title}</div>
                          <small className="text-muted">
                            {d.document_code}
                          </small>
                        </td>

                        <td>{d.department_name}</td>

                        <td className="text-muted small">
                          {new Date(d.created_at).toLocaleDateString("en-GB")}
                        </td>

                        <td className="text-end">
                          <i
                            className={`bi ${
                              expandedId === d.id
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
                              maxHeight: expandedId === d.id ? 300 : 0,
                              overflow: "hidden",
                              transition: "all 0.3s ease",
                              background: "#f8f9fa",
                            }}
                          >
                            <div className="p-3">

                              <div className="row g-3">

                                <div className="col-md-6">
                                  <div className="text-muted small">
                                    <i className="bi bi-chat-left-text me-1"></i>
                                    Delete Reason
                                  </div>
                                  <div className="fw-semibold">
                                    <small>
                                      {d.deletion_reason ||
                                      "No reason provided"}
                                    </small>
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <div className="text-muted small">
                                    <i className="bi bi-person me-1"></i>
                                    DFP
                                  </div>
                                  <div className="fw-semibold">
                                    <small>
                                      {d.requested_by || "Unknown"}
                                    </small>
                                    
                                  </div>
                                </div>

                              </div>

                              <hr />

                              <button
                                className="btn btn-sm btn-danger border px-3 py-2 rounded-pill"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(d.id);
                                }}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Delete Permanently
                              </button>

                            </div>
                          </div>

                        </td>
                      </tr>

                    </React.Fragment>
                  ))}
                </tbody>
              </table>

            </div>
          )}

        </div>

        {/* ================= PAGINATION ================= */}
        {data.length > 0 && (
          <div className="d-flex justify-content-between align-items-center p-3 border-top">

            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={page === 1}
              onClick={() => fetchData(page - 1)}
            >
              ← Prev
            </button>

            <span className="text-muted">
              Page <b>{page}</b> of {totalPages}
            </span>

            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={page === totalPages}
              onClick={() => fetchData(page + 1)}
            >
              Next →
            </button>

          </div>
        )}

      </div>

      {/* HOVER STYLE */}
      <style>
        {`
          .hover-row:hover {
            background-color: #f8f9fa;
          }
        `}
      </style>

    </div>
  );
};

export default DeleteDocumentRequests;