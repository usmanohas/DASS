import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/baseUrl";
import { ClipLoader } from "react-spinners";
import { PulseLoader } from "react-spinners";

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
        `${API_BASE_URL}/staff/documents/years`,
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
      const res = await axios.get(`${API_BASE_URL}/staff/categories`, {
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
        `${API_BASE_URL}/staff/documents/list`,
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
      {/* ================= HEADER ================= */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">
          <i className="bi bi-files me-2"></i>
          Department Documents
        </h3>
        <small className="text-muted">
          Browse, filter, and manage workstream documents efficiently
        </small>
      </div>

      {/* ================= FILTER CARD ================= */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h6 className="mb-1 fw-bold">
                <i className="bi bi-funnel me-2 text-secondary"></i>
                Filters
              </h6>
              <small className="text-muted">
                Refine documents by category, classification and year
              </small>
            </div>

            <div className="d-flex gap-2 flex-wrap align-items-center">
              {/* CATEGORY */}
              <select
                className="form-select form-select-sm shadow-sm"
                style={{ width: "170px" }}
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

              {/* CLASSIFICATION */}
              <select
                className="form-select form-select-sm shadow-sm"
                style={{ width: "170px" }}
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

              {/* YEAR */}
              <select
                className="form-select form-select-sm shadow-sm"
                style={{ width: "130px" }}
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

              {/* SEARCH */}
              <button
                className="btn btn-outline-secondary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#keywordModal"
                title="Search"
              >
                <i className="bi bi-search"></i>
              </button>

              {/* RESET */}
              <button
                className="btn btn-danger btn-sm"
                title="Reset filters"
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
        </div>
      </div>

      {/* ================= TABLE CARD ================= */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          {/* LOADING */}
          {loading && (
            <div className="text-center py-5">
          <PulseLoader color="#ef6c00" size={12} margin={4} />
          <p className="mt-3 text-muted">Loading documents...</p>
        </div>
          )}

          {/* EMPTY STATE */}
          {!loading && documents.length === 0 && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-folder2-open fs-1 d-block mb-2"></i>
              No documents found
            </div>
          )}

          {/* TABLE */}
          {!loading && documents.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Document Title</th>
                    <th>Category</th>
                    <th>Sub-category</th>
                    <th className="text-center">Classification</th>
                    <th>Uploaded</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => navigate(`/staff/document/${doc.id}`)}
                      style={{
                        cursor: "pointer",
                        transition: "0.2s",
                      }}
                      className="hover-row"
                    >
                      <td>
                        <div className="fw-semibold">
                          {truncate(doc.title, 45)}
                        </div>
                        <small className="text-muted">
                          {truncate(doc.description || "No description", 60)}
                        </small>
                      </td>

                      <td className="text-muted">{doc.category_name}</td>

                      <td className="text-muted small">
                        {doc.subcategory_name}
                      </td>

                      <td className="text-center">
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                            {doc.classification}
                          </span>
                      </td>

                      <td className="text-muted small">
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(doc.created_at))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {!loading && documents.length > 0 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>

              <span className="fw-semibold text-muted">
                Page {page} of {totalPages}
              </span>

              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <div className="modal fade" id="keywordModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-search me-2"></i> Search Documents
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
                placeholder="Enter keyword..."
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn text-white"
                style={{ background: "#ef6c00" }}
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

export default WorkStreamDocument;
