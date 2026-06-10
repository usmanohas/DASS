import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";
import { ClipLoader } from "react-spinners";
import { PulseLoader } from "react-spinners";

const PartnerDashboardAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/admin/partner/dashboard/${id}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setPartner(res.data.partner);
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async () => {
    const action = partner.is_active ? "Deactivate" : "Activate";

    const confirm = await Swal.fire({
      title: `${action} Partner?`,
      text: `Are you sure you want to ${action.toLowerCase()} this partner account?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: partner.is_active ? "#dc3545" : "#198754",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Yes, ${action}`,
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.put(
        `${API_BASE_URL}/admin/partner/toggle/${partner.id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.Status) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: res.data.Message,
          confirmButtonColor: "#198754",
        });

        navigate("/admin/partners");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.Error,
          confirmButtonColor: "#dc3545",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <PulseLoader color="#198754" size={12} margin={4} />
        <p className="mt-3 text-muted">Loading data...</p>
      </div>
    );
  }

  if (!partner) {
    return <div className="alert alert-danger">Partner record not found.</div>;
  }

  const daysRegistered = Math.floor(
    (new Date() - new Date(partner.created_at)) / (1000 * 60 * 60 * 24),
  );

  const activeDocuments = documents.filter(
    (d) => !d.expiry_date || new Date(d.expiry_date) >= new Date(),
  ).length;

  const expiredDocuments = documents.filter(
    (d) => d.expiry_date && new Date(d.expiry_date) < new Date(),
  ).length;

  return (
    <div className="container-fluid py-4">
      {/* ================= HEADER ================= */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-dark">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center me-4"
                  style={{
                    width: "85px",
                    height: "85px",
                  }}
                >
                  <i
                    className="bi bi-building fs-1"
                    style={{ color: "#226e06" }}
                  ></i>
                </div>

                <div>
                  <h2 className="fw-bold text-white mb-1">
                    {partner.full_name}
                  </h2>

                  <p className="text-white-50 mb-2">External Partner Account</p>

                  <div className="d-flex flex-wrap gap-3 text-white small">
                    <span>
                      <i className="bi bi-envelope me-2"></i>
                      {partner.email}
                    </span>

                    <span>
                      <i className="bi bi-telephone me-2"></i>
                      {partner.phone_number || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
              <span
                className={`badge px-4 py-2 fs-6 ${
                  partner.is_active ? "bg-success" : "bg-danger"
                }`}
              >
                {partner.is_active ? "Active Partner" : "Inactive Partner"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STATISTICS ================= */}
      <div className="row g-3 mb-4">
        <StatCard
          title="Shared Documents"
          value={documents.length}
          icon="files"
          color="primary"
        />

        <StatCard
          title="Active Documents"
          value={activeDocuments}
          icon="check-circle"
          color="success"
        />

        <StatCard
          title="Expired Access"
          value={expiredDocuments}
          icon="clock-history"
          color="danger"
        />

        <StatCard
          title="Days Registered"
          value={daysRegistered}
          icon="calendar-event"
          color="warning"
        />
      </div>

      {/* ================= INFO CARD ================= */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-4">Partner Information</h5>

          <div className="row g-4">
            <InfoItem
              icon="geo-alt"
              label="State / Location"
              value={partner.division_unit_state || "N/A"}
            />

            <InfoItem
              icon="calendar"
              label="Account Created"
              value={new Date(partner.created_at).toLocaleDateString("en-GB")}
            />

            <InfoItem
              icon="telephone"
              label="Phone Number"
              value={partner.phone_number || "N/A"}
            />

            <InfoItem
              icon="envelope"
              label="Email Address"
              value={partner.email}
            />
          </div>

          <hr />

          <button
            className={`btn ${
              partner.is_active ? "btn-outline-danger" : "btn-outline-success"
            }`}
            onClick={handleToggleStatus}
          >
            <i
              className={`bi ${
                partner.is_active ? "bi-person-x" : "bi-person-check"
              } me-2`}
            ></i>

            {partner.is_active ? "Deactivate Account" : "Activate Account"}
          </button>
        </div>
      </div>

      {/* ================= DOCUMENTS ================= */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-0 p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1">
                <i className="bi bi-share me-2 text-danger"></i>
                Shared Documents
              </h5>

              <small className="text-muted">
                Documents currently shared with this partner
              </small>
            </div>

            <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill">
              {documents.length} Documents
            </span>
          </div>
        </div>

        <div className="card-body">
          {documents.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-folder-x fs-1 text-muted"></i>

              <h6 className="mt-3 text-muted">No shared documents found</h6>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Document Title</th>
                    <th>Department</th>
                    <th>Shared Date</th>
                    <th>Expiry Date</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((doc, index) => (
                    <tr key={doc.id}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="fw-semibold">{doc.title}</div>
                      </td>

                      <td>{doc.department_name}</td>

                      <td>
                        {new Date(doc.created_at).toLocaleDateString("en-GB")}
                      </td>

                      <td>
                        {doc.expiry_date ? (
                          <span
                            className={`badge border px-3 py-2 rounded-pill ${
                              new Date(doc.expiry_date) < new Date()
                                ? "bg-danger"
                                : "bg-success"
                            }`}
                          >
                            {new Date(doc.expiry_date).toLocaleDateString(
                              "en-GB",
                            )}
                          </span>
                        ) : (
                          <span className="badge bg-secondary">No Expiry</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="col-md-6 col-xl-3">
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted">{title}</small>
            <h3 className="fw-bold mt-2 mb-0">{value}</h3>
          </div>

          <div
            className={`bg-${color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
            style={{
              width: "55px",
              height: "55px",
            }}
          >
            <i className={`bi bi-${icon} text-${color} fs-4`}></i>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="col-md-6">
    <div className="d-flex align-items-start">
      <i className={`bi bi-${icon} fs-5 text-primary me-3`}></i>

      <div>
        <small className="text-muted d-block">{label}</small>

        <div className="fw-semibold">{value}</div>
      </div>
    </div>
  </div>
);

export default PartnerDashboardAdmin;
