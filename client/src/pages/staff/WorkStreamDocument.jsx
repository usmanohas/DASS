import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const truncate = (text, length = 50) =>
  text.length > length ? text.substring(0, length) + "…" : text;

const WorkStreamDocument = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    finalize_date: "",
    file: null,
  });

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

  const fetchYears = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/staff/documents/years",
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
      const res = await axios.get("http://localhost:3000/staff/categories", {
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
        "http://localhost:3000/staff/documents/list",
        {
          params: {
            page,
            limit: 10,
            search,
            category,
            classification,
            year,
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
  }, [page, search, category, classification, year]);

  useEffect(() => {
    fetchYears();
    fetchCategories();
  }, []);

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <h3 className="mb-4">
        <i className="bi bi-files me-2"></i> Department Documents 
      </h3>
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h6 className="text-muted">
          <i className="bi bi-filter me-2"></i> Filter
        </h6>
        <div className="d-flex gap-2 flex-wrap align-items-center">
          {/* Category */}
          <select
            className="form-select"
            style={{ width: "160px" }}
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Classification */}
          <select
            className="form-select"
            style={{ width: "160px" }}
            value={classification}
            onChange={(e) => {
              setPage(1);
              setClassification(e.target.value);
            }}
          >
            <option value="">All Classification</option>
            <option>Public</option>
            <option>Internal</option>
            <option>Confidential</option>
            <option>Restricted</option>
          </select>

          {/* Dynamic Year */}
          <select
            className="form-select"
            style={{ width: "140px" }}
            value={year}
            onChange={(e) => {
              setPage(1);
              setYear(e.target.value);
            }}
          >
            <option value="">All Years</option>
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {/* Search Modal Button */}
          <button
            className="btn btn-outline-secondary"
            data-bs-toggle="modal"
            data-bs-target="#keywordModal"
          >
            <i className="bi bi-search"></i>
          </button>

          {/* 🔥 Clear Button */}
          <button
          title="Reset"
            className="btn btn-outline-secondary"
            onClick={() => {
              setCategory("");
              setClassification("");
              setYear("");
              setSearch("");
              setPage(1);
            }}
          >
            <i className="bi bi-arrow-repeat"></i>
          </button>
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
              <p className="mt-2">No document available</p>
            </div>
          )}

          {/* Table */}
          {!loading && documents.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Sub-category</th>
                    <th className="text-center">Classification</th>
                    <th>Uploaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      role="button"
                      className="cursor-pointer"
                      onClick={() => navigate(`/staff/document/${doc.id}`)}
                    >
                      <td>
                        <div className="fw-semibold" title={doc.title}>
                          {truncate(doc.title, 45)}
                        </div>
                        <small className="text-muted">
                          {truncate(doc.description || "No description", 60)}
                        </small>
                      </td>

                      <td>
                        <span className="">{doc.category_name}</span>
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
                      <td>
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

export default WorkStreamDocument;
