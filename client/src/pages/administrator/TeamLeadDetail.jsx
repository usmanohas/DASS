import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

const TeamLeadDetailsAdmin = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ modal states
  const [showModal, setShowModal] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  /* ================= FETCH ================= */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/admin/team-lead/programs/${id}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setData(res.data.data);
      } else {
        Swal.fire("Error", "Program not found", "error");
      }
    } catch {
      Swal.fire("Error", "Failed to load data", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= MODAL CONTROL ================= */
  const closeModal = () => {
    setShowModal(false);
    setReportTitle("");
    setFile(null);
  };

  useEffect(() => {
    if (showModal) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
  }, [showModal]);

  /* ================= UPLOAD ================= */
  const uploadReport = async () => {
    if (!reportTitle || !file) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Report title and file are required",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", reportTitle);
    formData.append("file", file);

    setUploading(true);

    try {
      const res = await axios.post(
        `http://localhost:3000/admin/team-lead/upload-report/${id}`,
        formData,
        { withCredentials: true },
      );

      if (res.data.Status) {
        await Swal.fire({
          icon: "success",
          title: "Uploaded",
          text: "Report uploaded successfully",
          timer: 1200,
          showConfirmButton: false,
        });

        closeModal();
        fetchData();
      } else {
        Swal.fire("Error", res.data.Message, "error");
      }
    } catch {
      Swal.fire("Error", "Upload failed", "error");
    }

    setUploading(false);
  };

  /* ================= DOWNLOAD =================  */
  const downloadReport = (id) => {
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
            startDownload(id);
          }
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    });
  };

  // Actual download function
  const startDownload = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/staff/report/download/${id}`,
        {
          withCredentials: true,
          responseType: "blob",
        },
      );

      // extract filename
      const disposition = res.headers["content-disposition"];
      let filename = "downloaded-file";

      if (disposition && disposition.includes("filename=")) {
        filename = decodeURIComponent(
          disposition.split("filename=")[1].replace(/"/g, ""),
        );
      }

      // trigger download
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

  if (loading || !data) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border"></div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="mb-4">
        <h4 className="fw-bold">{data.name}</h4>
        <small className="text-muted">{data.description}</small>
      </div>

      <p className="text-muted mt-3" style={{ whiteSpace: "pre-wrap" }}>
        <span className="bi bi-file-pdf me-1 text-danger"></span>
        <strong>Report filename Format:</strong>{" "}
        <small>{data.reportNameFormat}</small>
      </p>

      {/* INFO CARD */}
      <div className="card shadow-sm border-0 mb-4">
        {" "}
        <div className="card-body">
          {" "}
          <div className="row">
            {" "}
            <div className="col-md-4">
              {" "}
              <div className="text-muted small">
                <i class="bi bi-building me-1"></i>Department
              </div>{" "}
              <div className="fw-semibold">{data.department_name}</div>{" "}
            </div>{" "}
            <div className="col-md-4">
              {" "}
              <div className="text-muted small">
                <i className="bi bi-globe-europe-africa me-1"></i>State
              </div>{" "}
              <span className="badge bg-info-subtle text-dark">
                {" "}
                {data.state}{" "}
              </span>{" "}
            </div>{" "}
            <div className="col-md-4">
              {" "}
              <div className="text-muted small">
                <i className="bi bi-cloud-arrow-up me-1"></i>Status
              </div>{" "}
              {data.submission_status === "submitted" ? (
                <span className="badge bg-success">Submitted</span>
              ) : (
                <span className="badge bg-warning text-dark">Pending</span>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>

      {/* ACTION CARD */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold">Report Submission</div>
            <small className="text-muted">Upload or download your report</small>
          </div>

          <div>
            {data.submission_status === "submitted" ? (
              <button
                className="btn btn-outline-success"
                onClick={() => downloadReport(data.report_id)}
              >
                <span className="bi bi-download me-1"></span>Download Report
              </button>
            ) : (
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowModal(true)}
              >
                <span className="bi bi-upload me-1"></span>Upload Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HISTORY */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Submission History</h6>

          {data.submission_status === "submitted" ? (
            <div className="border p-3 rounded">
              <div className="fw-semibold">{data.report_title}</div>
              <small className="text-muted">
                {new Date(data.submitted_at).toLocaleString("en-GB")}
              </small>
            </div>
          ) : (
            <div className="text-muted">No submission yet</div>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
            onClick={closeModal}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content rounded-4 shadow">
                <div className="modal-header border-0">
                  <h5 className="fw-bold">Upload Report</h5>
                  <button className="btn-close" onClick={closeModal} />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Report Title</label>
                    <input
                      className="form-control"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Select File</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button className="btn btn-light" onClick={closeModal}>
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={uploadReport}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Submit Report"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
        </>
      )}
    </div>
  );
};

export default TeamLeadDetailsAdmin;
