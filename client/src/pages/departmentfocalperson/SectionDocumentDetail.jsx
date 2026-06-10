import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/baseUrl";

const SectionDocumentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [doc, setDoc] = useState(null);

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

  const fetchDocument = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/department/documents/section/${id}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setDoc(res.data.Data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  /* =========================
     📥 DOWNLOAD DOCUMENT
  ========================= */
  const andleDownloadShared = async (versionId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/department/documents/download/shared/${versionId}`,
        { withCredentials: true, responseType: "blob" },
      );

      const disposition = res.headers["content-disposition"];
      let filename = "downloaded-file";

      if (disposition && disposition.includes("filename=")) {
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
        err.response?.data?.Error || "Unable to download file",
        "error",
      );
    }
  };

  //  UPDATED DOWNLOAD WITH 5-SEC SPINNER
  const handleDownloadShared = (versionId) => {
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

  // Actual download function
  const startDownload = async (versionId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/department/documents/download/shared/${versionId}`,
        { withCredentials: true, responseType: "blob" },
      );

      const disposition = res.headers["content-disposition"];
      let filename = "downloaded-file";

      if (disposition && disposition.includes("filename=")) {
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
        err.response?.data?.Error || "Unable to download file",
        "error",
      );
    }
  };

  /* =========================
     🔐 REQUEST ACCESS
  ========================= */
  const requestAccess = async () => {
    const result = await Swal.fire({
      title: "Request Document",
      input: "textarea",
      inputLabel: "Why requesting this document?",
      inputValue:
        "I am requesting access to this document to support official duties, review relevant information, and facilitate departmental operations. Access will be used strictly for authorized work purposes in accordance with NPHCDA-DASS policies.",
      inputPlaceholder: "Explain why you need access...",
      confirmButtonText: "Submit Request",
      confirmButtonColor: "#0b8585",
      cancelButtonColor: "#ff1522",
      showCancelButton: true,
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),

      inputValidator: (value) => {
        if (!value?.trim()) {
          return "Please provide a reason";
        }
      },

      preConfirm: async (reason) => {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/department/documents/request-access`,
            {
              document_id: doc.id,
              owner_department_id: doc.department_id,
              reason,
            },
            { withCredentials: true },
          );

          if (!res.data.Status) {
            throw new Error(res.data.Error);
          }

          return res.data;
        } catch (error) {
          Swal.showValidationMessage(`Request failed: ${error.message}`);
        }
      },
    });

    if (result.isConfirmed) {
      await Swal.fire({
        icon: "success",
        title: "Request Sent",
        text: result.value.Message,
        confirmButtonColor: "#0b8585",
      });

      setTimeout(() => {
        navigate("/department/document/section");
      }, 500);
    }
  };

  if (!doc) return <p className="text-center mt-5">Loading document...</p>;

  /* =========================
     🎯 CLASSIFICATION LOGIC
  ========================= */
  const isConfidential = doc.classification?.toLowerCase() === "confidential";

  const isDownloadable = ["public", "internal"].includes(
    doc.classification?.toLowerCase(),
  );

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="">
          <i className="bi bi-file-earmark-text me-2"></i>
          Document Details
        </h3>

        <span
          className={`badge rounded-pill px-4 py-3 bg-dark-subtle border text-dark`}
        >
          {doc.classification}
        </span>
      </div>

      {/* CARD */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h4 className="fw-bold">{doc.title}</h4>

          <p className="text-muted">{doc.description}</p>

          <hr />

          <div className="row g-4">
            <div className="col-md-6">
              <h6 className="text-muted">Document Information</h6>

              <p>
                <strong>Owner Department:</strong> {doc.department_name}
              </p>
              <p>
                <strong>Category:</strong> {doc.category_name}
              </p>
              <p>
                <strong>Subcategory:</strong> {doc.subcategory_name}
              </p>
            </div>

            <div className="col-md-6">
              <h6 className="text-muted">Metadata</h6>

              <p>
                <strong>Status:</strong> {doc.document_status}
              </p>
              <p>
                <strong>Uploaded:</strong>{" "}
                {new Date(doc.created_at).toLocaleDateString()}
              </p>
              <p>
                <strong>Classification:</strong> {doc.classification}
              </p>
            </div>
          </div>

          <hr />

          {/* ACTIONS */}
          <div className="d-flex gap-2">
            {/* BACK */}
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/department/document/section")}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Back
            </button>

            {/* DOWNLOAD */}
            {isDownloadable && (
              <button
                className="btn btn-success"
                onClick={() => handleDownloadShared(doc.version_id)}
              >
                <i className="bi bi-download me-1"></i>
                Download
              </button>
            )}

            {/* REQUEST ACCESS */}
            {isConfidential && (
              <button
                className="btn text-white"
                style={{backgroundColor:"#0b8585"}}
                onClick={requestAccess}
              >
                <i className="bi bi-shield-lock me-1"></i>
                Request Document
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionDocumentDetail;
