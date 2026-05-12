import React, { useEffect, useState } from "react";
import axios from "axios";

const DocumentSharedList = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSharedDocs = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:3000/admin/document/shared?page=${page}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setDocs(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSharedDocs();
  }, [page]);

  const toggleExpand = (id) => {
    setExpandedDoc(expandedDoc === id ? null : id);
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="mb-4">
        <h4 className="">
          <i className="bi bi-share me-2"></i>
          Shared Documents
        </h4>
        <small className="text-muted">
          View documents shared with partners
        </small>
      </div>

      {/* CONTENT */}
      <div className="card shadow-sm border">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border text-primary mb-2"></div>
              <div>Loading shared documents...</div>
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-folder-x fs-1"></i>
              <div>No shared documents found</div>
            </div>
          ) : (
            <div className="accordion" id="sharedDocsAccordion">
              <p className="text-muted small">Showing 5 records per page</p>
              {docs.map((doc) => (
                <div
                  key={doc.document_id}
                  className="border rounded mb-3"
                  style={{ overflow: "hidden" }}
                >
                  {/* HEADER ROW */}
                  <div
                    className="d-flex justify-content-between align-items-center p-3"
                    style={{ cursor: "pointer", background: "#f8f9fa" }}
                    onClick={() => toggleExpand(doc.document_id)}
                  >
                    <div>
                      <div className="fw-semibold">{doc.title}</div>
                      <small className="text-muted">
                        <span className="me-2 fw-semibold bi bi-building"></span>
                        {doc.department_name}
                      </small>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <span className="badge bg-success-subtle text-success">
                        <span className="badge bg-white text-success">
                          {doc.partners.length}
                        </span>{" "}
                        Partner(s)
                      </span>

                      <i
                        className={`bi ${
                          expandedDoc === doc.document_id
                            ? "bi-chevron-up"
                            : "bi-chevron-down"
                        }`}
                      ></i>
                    </div>
                  </div>

                  {/* EXPAND CONTENT */}
                  <div
                    style={{
                      maxHeight:
                        expandedDoc === doc.document_id ? "500px" : "0px",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div className="p-3 border-top">
                      {doc.partners.map((p, i) => (
                        <div
                          key={i}
                          className="d-flex align-items-center border rounded p-2 mb-2"
                        >
                          {/* LEFT NUMBER */}
                          <div
                            className="me-3 d-flex align-items-center justify-content-center bg-success text-white rounded"
                            style={{
                              width: "35px",
                              height: "35px",
                              fontSize: "14px",
                              fontWeight: "600",
                            }}
                          >
                            {i + 1}
                          </div>

                          {/* MIDDLE CONTENT */}
                          <div className="flex-grow-1">
                            <div className="fw-semibold small">
                              {p.full_name}
                            </div>
                            <small className="text-muted">
                              Shared:{" "}
                              {new Date(p.created_at).toLocaleDateString("en-GB")}
                            </small>
                          </div>

                          {/* RIGHT SIDE */}
                          <div className="text-end">
                            <small className="text-muted d-block">Expiry</small>
                            <span className="badge bg-light text-dark">
                              {p.expiry_date
                                ? new Date(p.expiry_date).toLocaleDateString("en-GB")
                                : "No expiry"}
                            </span>
                          </div>
                        </div>
                      ))}

                      {doc.partners.length === 0 && (
                        <div className="text-muted small">
                          No partners found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* PAGINATION */}
              <div className="d-flex justify-content-between align-items-center mt-4">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentSharedList;
