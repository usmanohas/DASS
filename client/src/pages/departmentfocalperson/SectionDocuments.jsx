import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const truncate = (text, length = 50) =>
  text.length > length ? text.substring(0, length) + "…" : text;

const SectionDocumentDFP = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [classification, setClassification] = useState("");
  const [year, setYear] = useState("");
  const [years, setYears] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const classificationColors = {
    Public: "bg-success",
    Internal: "bg-info",
    Confidential: "bg-warning text-dark",
    Restricted: "bg-danger",
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (department) count++;
    if (category) count++;
    if (classification) count++;
    if (year) count++;
    if (search) count++;
    return count;
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:3000/department/departments", {
        withCredentials: true,
      });

      if (res.data.Status) {
        setDepartments(res.data.Departments);
      }
    } catch (err) {
      console.error("Failed to fetch departments");
    }
  };

  const fetchYears = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/department/documents/section_years",
        { withCredentials: true },
      );

      if (res.data.Status) {
        setYears(res.data.Years);
      }
    } catch (err) {
      console.error("Failed to fetch years");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3000/department/categories", {
        withCredentials: true,
      });

      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:3000/department/documents/section/list",
        {
          params: {
            page,
            limit: 10,
            search,
            category,
            classification,
            year,
            department,
          },
          withCredentials: true,
        },
      );
      if (res.data.Status) {
        setDocuments(res.data.Data);
        setTotalPages(res.data.Pages);
      } else {
        Swal.fire("Error", "Failed to load documents", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server error while fetching documents", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, search, category, classification, year, department]);

  useEffect(() => {
    fetchYears();
    fetchCategories();
    fetchDepartments();
  }, []);

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <h3 className="">
        <i className="bi bi-diagram-3"></i> Documents from Other Departments
      </h3>
      {/* ================= FILTER BAR ================= */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
            <h6 className="mb-0 text-muted">
              <i className="bi bi-filter me-2"></i>
              Filters
            </h6>

            {/* Active Filter Badge */}
            {getActiveFilterCount() > 0 && (
              <span className="badge bg-success">
                {getActiveFilterCount()} Active
              </span>
            )}
          </div>

          <div className="row g-2 align-items-center">
            {/* Keyword */}
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>

            {/* Department */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={department}
                onChange={(e) => {
                  setPage(1);
                  setDepartment(e.target.value);
                }}
              >
                <option value="">Department</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={category}
                onChange={(e) => {
                  setPage(1);
                  setCategory(e.target.value);
                }}
              >
                <option value="">Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Classification */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={classification}
                onChange={(e) => {
                  setPage(1);
                  setClassification(e.target.value);
                }}
              >
                <option value="">Classification</option>
                <option value="Public">Public</option>
                <option value="Internal">Internal</option>
              </select>
            </div>

            {/* Year */}
            <div className="col-md-1">
              <select
                className="form-select"
                value={year}
                onChange={(e) => {
                  setPage(1);
                  setYear(e.target.value);
                }}
              >
                <option value="">Year</option>
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="col-md-2 d-grid">
              <button
              title="Reset"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setDepartment("");
                  setCategory("");
                  setClassification("");
                  setYear("");
                  setSearch("");
                  setPage(1);
                }}
              >
                <i className="bi bi-repeat me-1"></i> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-success"></div>
              <p className="mt-2">Loading documents...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && documents.length === 0 && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-folder-x fs-1"></i>
              <p className="mt-2">No documents found</p>
            </div>
          )}

          {/* Table */}
          {!loading && documents.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">#</th>
                    <th>Department</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Sub category</th>
                    <th className="text-center">Classification</th>
                    <th className="text-center">Uploaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, index) => (
                    <tr
                      key={doc.id}
                      role="button"
                      className="cursor-pointer"
                      onClick={() => navigate(`/department/document/section/${doc.id}`)}
                    >
                      <td className="text-center">{index + 1}</td>
                      <td>
                        <small className="fw-semibold">
                          {doc.department_name}
                        </small>
                      </td>
                      <td>
                        <div className="" title={doc.title}>
                          {truncate(doc.title, 45)}
                        </div>
                      </td>

                      <td>
                        <span className="text-muted">{doc.category_name}</span>
                      </td>

                      <td>
                        <small className="text-muted">
                          {doc.subcategory_name}
                        </small>
                      </td>

                      <td className="text-center">
                        <span
                          className={`badge ${
                            classificationColors[doc.classification] ||
                            "bg-secondary"
                          }`}
                        >
                          {doc.classification}
                        </span>
                      </td>

                      <td className="text-center">
                        <small className="text-muted">
                          {new Intl.DateTimeFormat("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(doc.created_at))}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted">
                  Showing {documents.length} document(s)
                </small>

                {getActiveFilterCount() > 0 && (
                  <small className="text-success">
                    {getActiveFilterCount()} filter(s) applied
                  </small>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && documents.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                className="btn btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>

              <span className="fw-semibold">
                Page {page} of {totalPages}
              </span>

              <button
                className="btn btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="modal fade" id="keywordModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-search me-2"></i> Search by Keyword
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <input
                type="text"
                className="form-control"
                placeholder="Enter keywords..."
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-success"
                data-bs-dismiss="modal"
                onClick={() => {
                  setPage(1);
                  fetchDocuments();
                }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionDocumentDFP;
