import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../../config/baseUrl";

const ProgramReportsPage = () => {
  const { id } = useParams();

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
    percent: 0,
  });

  // Inject spinner CSS globally (FIXED)
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

  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchReports = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/department/programs/${id}/reports`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        const data = res.data.data;

        setReports(data);

        const total = data.length;
        const submitted = data.filter(
          (r) => r.submission_status === "submitted",
        ).length;
        const pending = total - submitted;
        const percent = total ? Math.round((submitted / total) * 100) : 0;

        setStats({ total, submitted, pending, percent });
      }
    } catch {
      Swal.fire("Error", "Failed to load reports", "error");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  //  UPDATED DOWNLOAD WITH 5-SEC SPINNER
  const downloadReport = (reportId) => {
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
            startDownload(reportId);
          }
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    });
  };

  // Actual download function
  const startDownload = async (reportId) => {
    if (!reportId) {
      Swal.fire("Error", "Invalid report selected", "error");
      return;
    }

    try {
      const res = await axios.get(
        `${API_BASE_URL}/department/report/download/${reportId}`,
        {
          withCredentials: true,
          responseType: "blob",
        },
      );

      const disposition = res.headers["content-disposition"];
      let filename = "report-file";

      if (disposition?.includes("filename=")) {
        filename = decodeURIComponent(
          disposition.split("filename=")[1].replace(/"/g, ""),
        );
      }

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire(
        "Download Failed",
        err.response?.data?.Message || "Unable to download file",
        "error",
      );
    }
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold">Programs/Campaigns Reports Overview</h3>
        <small className="text-muted">State submissions and analytics</small>
      </div>

      {/* ================= STATS ================= */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm p-3 text-center">
            <div className="text-muted small">Total States</div>
            <div className="fs-4 fw-bold">{stats.total}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm p-3 text-center">
            <div className="text-muted small">Submitted</div>
            <div className="fs-4 fw-bold text-success">{stats.submitted}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm p-3 text-center">
            <div className="text-muted small">Pending</div>
            <div className="fs-4 fw-bold text-warning">{stats.pending}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm p-3 text-center">
            <div className="text-muted small">Completion</div>
            <div className="fs-4 fw-bold ">{stats.percent}%</div>
          </div>
        </div>
      </div>

      {/* ================= PROGRESS BAR ================= */}
      <div className="mb-4">
        <div className="progress" style={{ height: "7px" }}>
          <div
            className="progress-bar bg-success"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card shadow-sm border">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border"></div>
            </div>
          ) : (
            <div className="card border-0">
              {/* HEADER */}
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>State</th>
                        <th>Team Lead</th>
                        <th>Status</th>
                        <th>File Type</th>
                        <th>Report</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports.map((r, i) => (
                        <tr key={r.id}>
                          <td>{i + 1}</td>

                          <td className="text-muted">{r.state}</td>

                          <td className="text-muted">{r.name}</td>

                          <td>
                            <span
                              className={`badge ${
                                r.submission_status === "submitted"
                                  ? "bg-success"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              {r.submission_status}
                            </span>
                          </td>

                          <td>
                            <span className="text-muted">
                              {(r.file_extension || "")
                                .replace(".", "")
                                .toUpperCase()}
                            </span>
                          </td>

                          <td>
                            {r.report_id ? (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => downloadReport(r.report_id)}
                              >
                                <i className="bi bi-download me-1"></i>
                                Download
                              </button>
                            ) : (
                              <span className="text-muted small">
                                No file uploaded
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramReportsPage;
