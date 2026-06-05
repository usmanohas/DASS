import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/baseUrl";

const SuperAdminLineManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts(); 
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/superadmin/support-contacts`,
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

  /* ================= UI ================= */
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
                        <i className="bi bi-person me-2 text-primary"></i>
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
    </div>
  );
};

export default SuperAdminLineManager;
