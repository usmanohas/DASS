import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, } from "react-router-dom";

const RetentionNotifications = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/department/retention-alerts", {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.Status) {
          setAlerts(res.data.alerts);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  /* ==========================
     SAFE LOCAL DATE PARSER
  ========================== */
  const getLocalDate = (dateString) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return new Date(year, month - 1, day); // LOCAL date (no timezone shift)
  };

  /* ==========================
     FORMAT DATE FOR DISPLAY
  ========================== */
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  /* ==========================
     SMART TIME DIFFERENCE
  ========================== */
  const getTimeDifferenceText = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = getLocalDate(dateString);

    const diffTime = expiry - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const absDays = Math.abs(diffDays);

    const formatUnit = (value, unit) =>
      `${value} ${unit}${value > 1 ? "s" : ""}`;

    let value;
    let unit;

    if (absDays < 7) {
      value = absDays;
      unit = "day";
    } else if (absDays < 30) {
      value = Math.floor(absDays / 7);
      unit = "week";
    } else if (absDays < 365) {
      value = Math.floor(absDays / 30);
      unit = "month";
    } else {
      value = Math.floor(absDays / 365);
      unit = "year";
    }

    if (diffDays < 0) {
      return `Expired ${formatUnit(value, unit)} ago`;
    } else if (diffDays === 0) {
      return `Expires today`;
    } else {
      return `${formatUnit(value, unit)} remaining`;
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h3 className="fw-bold">
          <i className="bi bi-bell me-2"></i> Retention Notifications
        </h3>
      </div>
      {/* Document Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-center">#</th>
                  <th>Document Title</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Period</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((doc, index) => {
                  const expiry = getLocalDate(doc.retention_expiry_date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const isExpired = expiry < today;

                  return (
                    <tr key={doc.id}>
                      <td className="text-center">{index + 1}</td>
                      <td>{doc.title}</td>

                      <td>
                        <i className="bi bi-calendar-event me-1"></i>
                        {formatDate(doc.retention_expiry_date)}
                      </td>

                      <td>
                        <span
                          className={
                            isExpired
                              ? "badge bg-danger border px-3 py-2 rounded-pill"
                              : "badge bg-warning text-dark border px-3 py-2 rounded-pill"
                          }
                        >
                          {isExpired ? "Expired" : "Expiring"}
                        </span>
                      </td>

                      <td className={isExpired ? "text-muted" : "text-muted"}>
                        <small>
                          {getTimeDifferenceText(doc.retention_expiry_date)}
                        </small>
                      </td>

                      <td className="text-center">
                        {isExpired ? (
                          <Link
                            to={`/department/document/expired/${doc.id}`}
                            className="btn btn-sm btn-success"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-dark disabled"
                            disabled
                          >
                            <i className="bi bi-eye-slash"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {alerts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No retention notifications available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="text-center mt-4">
        <button
          className="btn btn-outline-secondary px-4"
          onClick={() => navigate("/department/document/manage")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Documents
        </button>
      </div>
    </div>
  );
};

export default RetentionNotifications;
