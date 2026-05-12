import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

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
        `http://localhost:3000/admin/delete-requests?page=${pageNum}&department=${department}&search=${search}`,
        { withCredentials: true },
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

  /* ================= DELETE ================= */
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
        `http://localhost:3000/admin/delete-document/${id}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        Swal.fire("Deleted", res.data.Message, "success");
        fetchData(page);
      }
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">
        <i className="bi bi-trash me-2"></i>
        Delete Document Requests
      </h3>

      {/* FILTERS */}
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Search document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* FILTERS department
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Department ID"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        */}
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Document</th>
                <th>Department</th>
                <th>Upload Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1"></i>
                      <div className="mt-2">No Delete Requests Found</div>
                    </div>
                  </td>
                </tr>
              ) : (
              data.map((d, i) => (
                <React.Fragment key={d.id}>
                  {/* MAIN */}
                  <tr
                    onClick={() => toggleExpand(d.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{i + 1}</td>
                    <td>
                      <div className="fw-semibold">{d.title}</div>
                      <small className="text-muted">{d.document_code}</small>
                    </td>

                    <td>{d.department_name}</td>

                    <td className="text-muted small">
                      {new Date(d.created_at).toLocaleDateString("en-GB")}
                    </td>

                    <td className="text-end">
                      <i
                        className={`bi ${expandedId === d.id ? "bi-chevron-up" : "bi-chevron-down"}`}
                      ></i>
                    </td>
                  </tr>

                  {/* EXPAND */}
                  <tr>
                    <td colSpan="5" style={{ padding: 0 }}>
                      <div
                        style={{
                          maxHeight: expandedId === d.id ? "400px" : "0",
                          overflow: "hidden",
                          transition: "0.3s",
                          background: "#f8f9fa",
                        }}
                      >
                        <div className="p-3 border-top">
                          <div className="row">
                            {/* REASON */}
                            <div className="col-md-6 mb-3">
                              <small className="fw-semibold">
                                <i className="bi bi-trash me-1"></i>
                                Delete Reason
                              </small>
                              <div className="text-muted small">
                                {d.deletion_reason || "No reason provided"}
                              </div>
                            </div>
                            {/* DFP */}
                            <div className="col-md-6 mb-3">
                              <small className="fw-semibold">
                                <i className="bi bi-person me-1"></i>
                                DFP
                              </small>
                              <div className="text-muted small">
                                {d.requested_by || "No name found"}
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <button
                              className="btn btn-danger btn-sm"
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
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {data.length > 0 && (
          <div className="d-flex justify-content-center gap-2 mt-3">
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
      </div>
    </div>
  );
};

export default DeleteDocumentRequests;
