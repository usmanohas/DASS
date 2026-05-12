import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const PartnerDocuments = () => {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  // ✅ Inject spinner CSS globally (FIXED)
  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
        .swal2-html-container .custom-spinner {
          position: relative;
          width: 70px;
          height: 70px;
          border: 5px solid rgba(0, 0, 0, 0.1);
          border-top: 5px solid #198754;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: auto;
        }
      
        .swal2-html-container .spinner-logo {
          position: absolute;
          width: 30px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      
        /* REMOVE SCROLLBAR */
        .swal2-html-container {
          overflow: hidden !important;
        }
      
        .swal2-popup {
          overflow: hidden !important;
        }
      
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchDocs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/partner/documents?page=${pageNum}&search=${search}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setDocs(res.data.data);
        setTotalPages(res.data.totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs(1);
  }, [search]);

  /* ================= DOWNLOAD ================= */
  // ✅ UPDATED DOWNLOAD WITH 5-SEC SPINNER
  const handleDownload = (versionId) => {
    let timerInterval;

    Swal.fire({
      title: "Preparing Download...",
      html: `
        <p class="mb-2">Your download will start in <b>5</b> seconds.</p>
        <small class="text-muted">Securing your file...</small>
  
        <div class="d-flex justify-content-center mt-3">
          <div class="custom-spinner">
            <img src="/assets/images/logo.png" class="spinner-logo" />
          </div>
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        const content = Swal.getHtmlContainer();
        const b = content.querySelector("b");

        let timeLeft = 5;

        timerInterval = setInterval(() => {
          timeLeft--;
          b.textContent = timeLeft;

          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            Swal.close();
            startDownload(versionId); // ✅ pass versionId
          }
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    });
  };

  const startDownload = async (versionId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/partner/documents/download/${versionId}`,
        {
          withCredentials: true,
          responseType: "blob",
          validateStatus: (status) => status < 500,
        },
      );

      if (res.headers["content-type"]?.includes("application/json")) {
        const text = await res.data.text();
        const error = JSON.parse(text);

        return Swal.fire(
          "Download Failed",
          error.Error || "Unable to download file",
          "error",
        );
      }

      // ✅ filename
      const disposition = res.headers["content-disposition"];
      let filename = "downloaded-file";

      if (disposition && disposition.includes("filename=")) {
        filename = decodeURIComponent(
          disposition.split("filename=")[1].replace(/"/g, ""),
        );
      }

      // ✅ trigger download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // ✅ success toast
      Swal.fire({
        icon: "success",
        title: "Download Started",
        timer: 1200,
        showConfirmButton: false,
      });

      // 🔥 REFRESH DATA (THIS IS WHAT YOU NEED)
      fetchDocs(page);
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Download Failed",
        "Something went wrong while downloading",
        "error",
      );
    }
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold">
          <i className="bi bi-files me-2"></i>
          My Documents
        </h3>
        <small className="text-muted">
          View and download documents shared with you
        </small>
      </div>
      <div className="card card-modern p-4 mb-4">
        {/* SEARCH */}
        <div className=" mb-3">
            <input
              className="form-control"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        {/* TABLE */}
        <div className="card shadow-sm border-1 mb-4">
          <div className="card-body table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : docs.length === 0 ? (
              <div className="text-center text-muted py-5">
                No documents found
              </div>
            ) : (
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Document</th>
                    <th>Shared Date</th>
                    <th>Expire At</th>
                    <th className="text-center">Downloads</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {docs.map((doc, i) => {
                    const isExpired =
                      doc.expiry_date && new Date(doc.expiry_date) < new Date();

                    return (
                      <tr key={doc.id}>
                        <td className="text-muted">
                          {(page - 1) * 10 + i + 1}
                        </td>

                        <td className="text-muted">{doc.title}</td>

                        <td className="text-muted">
                          {new Date(doc.shared_at).toLocaleString("en-GB")}
                        </td>

                        <td>
                          <span
                            className={`badge ${isExpired ? "bg-danger" : "bg-success"}`}
                          >
                            {doc.expiry_date
                              ? new Date(doc.expiry_date).toLocaleString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : "No Expiry"}
                          </span>
                        </td>

                        <td className="text-center">
                          <span className="text-muted">
                            {doc.download_count}
                          </span>
                        </td>

                        {/* ✅ SINGLE action column */}
                        <td>
                          {isExpired ? (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              disabled
                            >
                              <i className="bi bi-lock me-1"></i>
                              Expired Link
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                handleDownload(doc.current_version_id)
                              }
                            >
                              <i className="bi bi-download me-1"></i>
                              Download
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* PAGINATION */}
            {docs.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => fetchDocs(page - 1)}
                >
                  ← Prev
                </button>

                <span>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>

                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={page === totalPages}
                  onClick={() => fetchDocs(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDocuments;
