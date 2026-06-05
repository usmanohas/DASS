import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const AdminLineManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/admin/support-contacts`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setContacts(res.data.Data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitIssue = async () => {
    try {
      const subject = document.getElementById("issueSubject").value;
      const description = document.getElementById("issueDescription").value;
      const screenshot = document.getElementById("issueScreenshot").files[0];

      // 🔹 Frontend validation
      if (!subject || !description) {
        return Swal.fire({
          icon: "warning",
          title: "Missing Fields",
          text: "Subject and description are required",
          timer: 2500,
          showConfirmButton: false,
        });
      }

      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("description", description);

      if (screenshot) {
        formData.append("screenshot", screenshot);
      }

      // 🔹 Show loading
      Swal.fire({
        title: "Submitting...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${API_BASE_URL}/admin/ticket`,
        formData,
        { withCredentials: true },
      );

      Swal.close(); // stop loading

      // ✅ SUCCESS
      if (res.data.Status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: res.data.Message || "Issue reported successfully",
          timer: 2500,
          showConfirmButton: false,
        });

        // reset form
        document.getElementById("issueSubject").value = "";
        document.getElementById("issueDescription").value = "";
        document.getElementById("issueScreenshot").value = "";
      }
      //BACKEND ERROR RESPONSE
      else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.Error || "Something went wrong",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);

      //NETWORK / SERVER ERROR
      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text:
          err.response?.data?.Error ||
          "Server not responding. Please try again.",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };
  return (
    <div className="container py-4">
      {/* HEADER */}
      <h3 className="mb-4">
        <i className="bi bi-headset me-2"></i>
        System Support & Line Manager
      </h3>

      {/* LOADING */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-muted text-center">
          No support contacts configured
        </div>
      ) : (
        <div className="row g-4">
          {contacts.map((c) => (
            <div className="col-md-4" key={c.id}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body text-center">
                  {/* AVATAR */}
                  <div
                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "70px",
                      height: "70px",
                      backgroundColor: c.color || "#198754",
                      color: "#fff",
                      fontSize: "22px",
                      fontWeight: "bold",
                    }}
                  >
                    {c.initials || "NA"}
                  </div>

                  {/* TITLE */}
                  <h6 className="fw-bold">{c.title}</h6>
                  <p className="text-muted small">{c.subtitle}</p>

                  <div className="small text-center mt-3">
                    {/* NAME */}
                    {c.name && (
                      <div className="mb-2 d-flex justify-content-center align-items-center">
                        <i className="bi bi-person me-2 text-muted"></i>
                        <span>{c.name}</span>
                      </div>
                    )}

                    {/* EMAIL */}
                    {c.email && (
                      <div className="mb-2 d-flex justify-content-center align-items-center">
                        <i className="bi bi-envelope me-2 text-muted"></i>
                        <span>{c.email}</span>
                      </div>
                    )}

                    {/* PHONE */}
                    {c.phone && (
                      <div className="mb-2 d-flex justify-content-center align-items-center">
                        <i className="bi bi-telephone me-2 text-muted"></i>
                        <span>{c.phone}</span>
                      </div>
                    )}

                    {/* EXTRA INFO */}
                    {c.extra_info && (
                      <div className="mb-2 d-flex justify-content-center align-items-center">
                        <i className="bi bi-clock me-2 text-muted"></i>
                        <span>{c.extra_info}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SYSTEM INFO */}

      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <h6 className="fw-semibold mb-3">
            <i className="bi bi-info-circle me-2"></i>
            System Information
          </h6>

          <div className="row small">
            <div className="col-md-3">
              <strong>System Name</strong>
              <div>Document Archiving and Sharing System</div>
            </div>

            <div className="col-md-3">
              <strong>Version</strong>
              <div>v1.0.0</div>
            </div>

            <div className="col-md-3">
              <strong>Maintained By</strong>
              <div>ICT Unit</div>
            </div>

            <div className="col-md-3">
              <strong>Agency</strong>
              <div>NPHCDA</div>
            </div>
          </div>
        </div>
      </div>

      {/* SUPPORT ACTIONS */}

      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <h6 className="fw-semibold mb-3">
            <i className="bi bi-life-preserver me-2"></i>
            Need Help?
          </h6>

          <p className="text-muted small mb-3">
            If you encounter any issue while using the system, you can report it
            to the ICT support team. Our team will review and resolve it as soon
            as possible.
          </p>

          <div className="d-flex gap-3">
            <button
              className="btn btn-danger"
              data-bs-toggle="modal"
              data-bs-target="#reportIssueModal"
            >
              <i className="bi bi-bug me-2"></i>
              Report System Issue
            </button>

            <a
              href="/admin/my-support-tickets"
              className="btn btn-outline-primary"
            >
              <i className="bi bi-ticket-detailed me-2"></i>
              My Support Tickets
            </a>
          </div>
        </div>
      </div>

      <div className="modal fade" id="reportIssueModal">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-light">
              <h5 className="modal-title">
                <i className="bi bi-bug me-2"></i>
                Report System Issue
              </h5>

              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Subject</label>
                <input type="text" className="form-control" id="issueSubject" />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  id="issueDescription"
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Upload Screenshot</label>
                <input
                  type="file"
                  className="form-control"
                  id="issueScreenshot"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>

              <button className="btn btn-danger" onClick={submitIssue}>
                Submit Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLineManager;
