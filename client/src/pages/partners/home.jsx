import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/baseUrl";

const PartnerHome = () => {
  const [partner, setPartner] = useState(null);
  const [stats, setStats] = useState({
    totalShared: 0,
    totalDownloads: 0,
    totalExpired: 0,
  });
  const [recentDocs, setRecentDocs] = useState([]);

  const fetchDashboard = async () => {
    try {
      const [profileRes, summaryRes, recentRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/partner/profile`, {
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/partner/summary`, {
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/partner/recent-documents`, {
          withCredentials: true,
        }),
      ]);

      if (profileRes.data.Status) setPartner(profileRes.data.data);
      if (summaryRes.data.Status) setStats(summaryRes.data.data);
      if (recentRes.data.Status) setRecentDocs(recentRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!partner) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="px-3 px-md-4">
      {/* ================= HEADER ================= */}
      <div className="text-center py-4">
        <h3 className="fw-bold mb-1">{partner.full_name}</h3>

        <div className="text-muted small mb-2 fs-6">
          <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
          {partner.address || "No address provided"}
        </div>

        <div className="d-flex justify-content-center flex-wrap gap-3 small text-muted">
          <span>
            <i className="bi bi-envelope me-1"></i> {partner.email}
          </span>
          <span>
            <i className="bi bi-telephone me-1"></i>{" "}
            {partner.phone_number || "N/A"}
          </span>
        </div>
      </div>

      {/* DASHBOARD CARD */}
      <div className="card card-modern p-4 mb-4">
        <h6 className="fw-semibold mb-3">Quick Overview</h6>
        {/* ================= STATS ================= */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm border-1 text-center p-3">
              <i className="bi bi-share-fill text-muted fs-5"></i>
              <div className="fs-4 fw-bold">{stats.totalShared}</div>
              <small className="text-muted">Documents Shared</small>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-1 text-center p-3">
              <i className="bi bi-download text-muted fs-5"></i>
              <div className="fs-4 fw-bold">{stats.totalDownloads}</div>
              <small className="text-muted">Documents Download</small>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-1 text-center p-3">
              <i className="bi bi-clock-history text-muted fs-5"></i>
              <div className="fs-4 fw-bold">{stats.totalExpired}</div>
              <small className="text-muted">Expired Download Link</small>
            </div>
          </div>
        </div>

        {/* ================= RECENT DOCUMENTS ================= */}
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className=" mb-1"><i class="bi bi-files me-2"></i>Recent Documents</h5>
              <small className="text-muted">
                Showing the 5 most recently shared documents
              </small>
            </div>

            {recentDocs.length === 0 ? (
              <div className="text-center text-muted py-4">
                No documents shared yet
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Document</th>
                      <th>Shared Date</th>
                      <th className="text-center">Access Expiry Date</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentDocs.map((doc, i) => {
                      const isExpired =
                        doc.expiry_date &&
                        new Date(doc.expiry_date) < new Date();

                      return (
                        <tr key={doc.id}>
                          {/* INDEX */}
                          <td className="text-muted">
                              {i + 1}
                          </td>

                          {/* TITLE */}
                          <td>
                            <div className="text-muted">{doc.title}</div>
                          </td>

                          {/* SHARED DATE */}
                          <td className="text-muted">
                            {new Date(doc.shared_at).toLocaleString(
                              "en-GB",
                            )}
                          </td>

                          {/* EXPIRY */}
                          <td className="text-center text-muted">
                              {doc.expiry_date
                                ? new Date(doc.expiry_date).toLocaleString(
                                    "en-GB",
                                  )
                                : "No Expiry"}
                          </td>

                          {/* STATUS */}
                          <td className="text-center">
                            {isExpired ? (
                              <span className="badge bg-danger-subtle text-danger">
                                Expired
                              </span>
                            ) : (
                              <span className="badge bg-success-subtle text-success">
                                Active
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerHome;
