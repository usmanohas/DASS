import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const PartnerDashboardAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/admin/partner/dashboard/${id}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setPartner(res.data.partner);
        setDocuments(res.data.documents);
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
      text: `Are you sure you want to ${action.toLowerCase()} this partner?`,
      icon: "warning",
      showCancelButton: true,

      // 🎨 CUSTOM BUTTON COLORS
      confirmButtonColor: partner.is_active ? "#dc3545" : "#198754", // red / green
      cancelButtonColor: "#6c757d",

      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.put(
        `http://localhost:3000/admin/partner/toggle/${partner.id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.Status) {
        await Swal.fire({
          title: "Success",
          text: res.data.Message,
          icon: "success",

          // 🎨 SUCCESS BUTTON COLOR
          confirmButtonColor: "#198754",
        });

        // 🔁 REDIRECT AFTER SUCCESS
        navigate("/admin/partners");
      } else {
        Swal.fire({
          title: "Error",
          text: res.data.Error,
          icon: "error",
          confirmButtonColor: "#dc3545",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Something went wrong",
        icon: "error",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (!partner) return <p>User not found</p>;

  return (
    <div className="container py-4">
      {/* HEADER */}

      {/* ================= PARTNER INFO ================= */}
      <div className="mb-4">
        <div className="card-body text-center">
          {/* NAME */}
          <h3 className="fw-bold mb-1">{partner.full_name}</h3>

          {/* CONTACT INFO */}
          <div className="px-3 d-flex flex-wrap justify-content-center gap-4 small text-muted mb-3">
            <div>
              <i className="bi bi-envelope me-1 text-primary"></i>
              {partner.email}
            </div>

            <div>
              <i className="bi bi-geo-alt me-1 text-danger"></i>
              {partner.division_unit_state || "N/A"}
            </div>

            <div>
              <i className="bi bi-telephone me-1 text-success"></i>
              {partner.phone_number || "N/A"}
            </div>

            <div>
              <i className="bi bi-calendar me-1 text-secondary"></i>
              {new Date(partner.created_at).toLocaleDateString("en-GB")}
            </div>
          </div>

          {/* ACTION BUTTON */}
          <button
            className={`btn ${
              partner.is_active ? "btn-outline-danger" : "btn-outline-success"
            } btn-sm`}
            onClick={() => handleToggleStatus()}
          >
            {partner.is_active ? (
              <>
                <i className="bi bi-person-x me-1"></i> Deactivate Account
              </>
            ) : (
              <>
                <i className="bi bi-person-check me-1"></i> Activate Account
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================= DOCUMENT LIST ================= */}
      <div className="card shadow-sm border-1">
        <div className="card-body">
          <h5 className="fw-semibold mb-3"><span className="bi bi-share me-2 text-danger"></span>Shared Documents</h5>

          {documents.length === 0 ? (
            <div className="text-muted text-center py-4">
              No shared documents
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Document</th>
                    <th>Owner Department</th>
                    <th>Shared Date</th>
                    <th>Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, i) => (
                    <tr key={doc.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td className="text-muted">{doc.title}</td>
                      <td className="text-muted">{doc.department_name}</td>
                      <td className="text-muted">{new Date(doc.created_at).toLocaleDateString("en-GB")}</td>
                      <td className="text-muted">
                        {doc.expiry_date
                          ? new Date(doc.expiry_date).toLocaleDateString("en-GB")
                          : "No expiry"}
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

export default PartnerDashboardAdmin;
