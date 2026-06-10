import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const HelpDesk = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/department/support-contacts`,
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
        `${API_BASE_URL}/department/support/report`,
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
        <i className="bi bi-headset me-2"></i>Help Desk Support
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

    </div>
  );
};

export default HelpDesk;
