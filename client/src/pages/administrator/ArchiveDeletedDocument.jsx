import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/baseUrl";
import { ClipLoader } from "react-spinners";
import { PulseLoader } from "react-spinners";

const ArchiveDeletePageAdmin = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // ✅ FILTER STATES
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [departments, setDepartments] = useState([]);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/admin/document/archive-delete?page=${page}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        const docs = res.data.data;

        setDocuments(docs);
        setFilteredDocs(docs);
        setTotalPages(res.data.totalPages);

        // ✅ EXTRACT UNIQUE DEPARTMENTS
        const uniqueDepartments = [
          ...new Set(docs.map((d) => d.department_name)),
        ];
        setDepartments(uniqueDepartments);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [page]);

  // ✅ FILTER LOGIC
  useEffect(() => {
    let filtered = [...documents];

    // STATUS FILTER
    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) =>
        statusFilter === "deleted" ? doc.is_delete : !doc.is_delete,
      );
    }

    // DEPARTMENT FILTER
    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (doc) => doc.department_name === departmentFilter,
      );
    }

    setFilteredDocs(filtered);
  }, [statusFilter, departmentFilter, documents]);

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0 fw-bold">
            <i className="bi bi-archive me-2 text-muted"></i>
            Archived & Deleted Documents
          </h3>
        </div>
      </div>

      {/* 🔥 FILTER BAR */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body d-flex flex-wrap gap-3 align-items-center">
          {/* STATUS FILTER */}
          <div>
            <label className="small text-muted d-block">Status</label>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="archived">Archived</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {/* DEPARTMENT FILTER */}
          <div>
            <label className="small text-muted d-block">Workstream</label>
            <select
              className="form-select form-select-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All</option>
              {departments.map((dep, i) => (
                <option key={i} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          {/* RESET BUTTON */}
          <div className="ms-auto">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setStatusFilter("all");
                setDepartmentFilter("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* CARD */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          {/* LOADING */}
          {loading ? (
            <div className="text-center py-5">
              <PulseLoader color="#198754" size={12} margin={4} />
              <p className="mt-3 text-muted">Loading documents...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-folder-x fs-1"></i>
              <div className="mt-2">No documents found</div>
            </div>
          ) : (
            <>
              {/* TABLE */}
              <div className="table-responsive">
                <table className="table align-middle table-hover">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">#</th>
                      <th className="">Workstream</th>
                      <th>Document Title</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDocs.map((doc, index) => (
                      <tr key={doc.id}>
                        <td className="text-center text-muted">{index + 1}</td>
                        <td className="text-muted">{doc.department_name}</td>

                        <td className="text-muted">{doc.title}</td>

                        <td className="text-center">
                          {doc.is_delete ? (
                            <span className="badge border px-3 py-2 rounded-pill bg-danger-subtle text-danger">
                              Deleted
                            </span>
                          ) : (
                            <span className="badge border px-3 py-2 rounded-pill bg-dark-subtle text-white">
                              Archived
                            </span>
                          )}
                        </td>

                        <td className="text-muted text-center">
                          {doc.is_delete
                            ? new Date(doc.delete_at).toLocaleDateString(
                                "en-GB",
                              )
                            : new Date(doc.archived_at).toLocaleDateString(
                                "en-GB",
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

export default ArchiveDeletePageAdmin;
