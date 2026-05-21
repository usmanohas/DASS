import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const StaffDashboard = () => {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [staff, setStaff] = useState({});
  const [stats, setStats] = useState({});
  const [monthlyActivity, setMonthlyActivity] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [logins, setLogins] = useState([]);

  const etchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/department/staff/${id}/dashboard`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setStaff(res.data.staff);
        setStats(res.data.stats);
        setMonthlyActivity(res.data.monthlyActivity);
        setRecentActivities(res.data.recentActivities);
        setLogins(res.data.logins);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
  try {
    const res = await axios.get(
      `http://localhost:3000/department/staff/${id}/dashboard`,
      { withCredentials: true },
    );

    if (!res.data.Status) {
      setError(res.data.Error || "Failed to load dashboard");
      return;
    }

    setStaff(res.data.staff);
    setStats(res.data.stats);

    setMonthlyActivity(res.data.monthlyActivity);

    setRecentActivities(res.data.recentActivities);

    setLogins(res.data.logins);
  } catch (err) {
    setError("Unable to load dashboard");
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  /* =========================
      AI INSIGHT
  ========================= */
  const getStaffInsight = () => {
    if (stats.downloads > 50)
      return {
        text: "Highly Active Staff",
        color: "success",
        icon: "graph-up-arrow",
      };

    if (stats.downloads > 10)
      return {
        text: "Moderately Active",
        color: "warning",
        icon: "activity",
      };

    return {
      text: "Low System Usage",
      color: "danger",
      icon: "exclamation-triangle",
    };
  };

  const insight = getStaffInsight();

  /* =========================
      CHART OPTIONS
  ========================= */
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    borderRadius: 8,
  };

  if (error) {
  return (
    <div className="container py-5">
      <div
        className="card border-0 shadow-sm rounded-4 mx-auto text-center p-5"
        style={{ maxWidth: "600px" }}
      >
        <div
          className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
          style={{
            width: "90px",
            height: "90px",
            background: "rgba(220,53,69,0.1)",
          }}
        >
          <i
            className="bi bi-shield-lock-fill text-danger"
            style={{ fontSize: "2.5rem" }}
          ></i>
        </div>

        <h3 className="fw-bold text-dark mb-3">
          Access Restricted
        </h3>

        <p className="text-muted mb-4">
          {error}
        </p>

        <div
          className="alert alert-light border rounded-3 small text-muted"
        >
          You can only view staff analytics within your assigned department.
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="container-fluid py-4">
      {/* ================= HEADER ================= */}
      <div
        className="rounded-4 p-4 mb-4 shadow-sm position-relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgb(11, 133, 133) 0%, rgb(44, 210, 210) 100%)",
        }}
      >
        <div className="row align-items-center">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-3">
              <div
                className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "75px",
                  height: "75px",
                  fontSize: "28px",
                  color: "#fff",
                }}
              >
                <i className="bi bi-person-workspace"></i>
              </div>

              <div className="text-white">
                <h3 className="fw-bold mb-1">
                  {staff.full_name || "Staff"} Dashboard
                </h3>

                <p className="mb-0 opacity-75">
                  Staff activity analytics and monitoring overview
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <span
              className={`badge bg-${insight.color} px-4 py-3 rounded-pill fs-6`}
            >
              <i className={`bi bi-${insight.icon} me-2`}></i>
              {insight.text}
            </span>
          </div>
        </div>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="row g-4 mb-4">
        <StatCard
          title="Downloads"
          value={stats.downloads}
          icon="download"
          color="primary"
        />

        <StatCard
          title="Approved Requests"
          value={stats.approved}
          icon="check-circle"
          color="success"
        />

        <StatCard
          title="Pending Requests"
          value={stats.pending}
          icon="clock-history"
          color="warning"
        />

        <StatCard
          title="Rejected Requests"
          value={stats.rejected}
          icon="x-circle"
          color="danger"
        />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="row g-4 mb-4">
        {/* ACCESS CHART */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="icon-circle fs-4 text-success me-3">
                  <i className="bi bi-bar-chart"></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-0">Access Request Analysis</h5>

                  <small className="text-muted">
                    Request approval performance
                  </small>
                </div>
              </div>

              <Bar
                options={chartOptions}
                data={{
                  labels: ["Approved", "Pending", "Rejected"],
                  datasets: [
                    {
                      label: "Requests",
                      data: [
                        stats.approved || 0,
                        stats.pending || 0,
                        stats.rejected || 0,
                      ],
                      backgroundColor: ["#198754", "#ffc107", "#dc3545"],
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          {/* MONTHLY ACTIVITY */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-bar-chart-line me-2 text-primary"></i>
                  Monthly Activities
                </h5>

                <small className="text-muted">
                  Current year system activity overview
                </small>
              </div>
            </div>

            <Bar
              data={{
                labels: monthlyActivity.map((d) => d.month),

                datasets: [
                  {
                    label: "Activities",

                    data: monthlyActivity.map((d) => d.total),

                    backgroundColor: [
                      "#0d6efd",
                      "#20c997",
                      "#ffc107",
                      "#dc3545",
                      "#6610f2",
                      "#fd7e14",
                      "#198754",
                      "#6f42c1",
                      "#0dcaf0",
                      "#d63384",
                      "#198754",
                      "#adb5bd",
                    ],

                    borderRadius: 10,
                    borderSkipped: false,
                  },
                ],
              }}
              options={{
                responsive: true,

                plugins: {
                  legend: {
                    display: false,
                  },
                },

                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* ================= RISK + ACTIVITIES ================= */}
      <div className="row g-4 mb-4">
        {/* RISK MONITORING */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="icon-circle fs-4 text-danger me-3">
                  <i className="bi bi-shield-exclamation"></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-0">Risk Monitoring</h5>

                  <small className="text-muted">Security activity status</small>
                </div>
              </div>

              <div className="border rounded-4 p-3 mb-3 bg-light">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Current month downloads</span>

                  <strong>{stats.monthly_downloads || 0}</strong>
                </div>
              </div>

              <div className="border rounded-4 p-3 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Multiple IP Detection</span>

                  <span
                    className={`badge ${
                      stats.multiple_ips
                        ? "bg-danger-subtle text-danger"
                        : "bg-success-subtle text-success"
                    }`}
                  >
                    {stats.multiple_ips ? "Detected" : "Normal"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITIES */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="icon-circle fs-4 text-info me-3">
                  <i className="bi bi-clock-history"></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-0">Recent Activities</h5>

                  <small className="text-muted">
                    Latest staff interactions
                  </small>
                </div>
              </div>

              {recentActivities.length === 0 ? (
                <div className="text-center text-muted py-5">
                  No recent activity found
                </div>
              ) : (
                recentActivities.map((a, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-start justify-content-between border-bottom py-3"
                  >
                    <div className="d-flex gap-3">
                      <div
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                        style={{
                          width: "45px",
                          height: "45px",
                        }}
                      >
                        <i className="bi bi-activity text-primary"></i>
                      </div>

                      <div>
                        <h6 className="fw-semibold mb-1">{a.action}</h6>

                        <p className="text-muted small mb-0">{a.description}</p>
                      </div>
                    </div>

                    <small className="text-muted text-nowrap ms-3">
                      {new Date(a.created_at).toLocaleString()}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= LOGIN MONITORING ================= */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center mb-4">
            <div className="icon-circle bg-dark-subtle text-dark me-3">
              <i className="bi bi-laptop"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">Login Monitoring</h5>

              <small className="text-muted">
                Device and login activity tracking
              </small>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>IP Address</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {logins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No login records found
                    </td>
                  </tr>
                ) : (
                  logins.map((l, i) => (
                    <tr key={i}>
                      <td className="fw-semibold">{l.ip_address}</td>

                      <td>{l.device}</td>

                      <td>{l.browser}</td>

                      <td>{new Date(l.created_at).toLocaleString()}</td>

                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${
                            l.ip_count > 3
                              ? "bg-danger-subtle text-danger"
                              : "bg-success-subtle text-success"
                          }`}
                        >
                          {l.ip_count > 3 ? "Suspicious" : "Normal"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================
    KPI CARD COMPONENT
========================= */
const StatCard = ({ title, value, icon, color }) => (
  <div className="col-md-6 col-xl-3">
    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
      <div className="card-body p-4 position-relative">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <small className="text-muted fw-semibold">{title}</small>

            <h2 className="fw-bold mt-2 mb-0">{value || 0}</h2>
          </div>

          <div
            className={`bg-${color}-subtle text-${color} rounded-circle d-flex align-items-center justify-content-center`}
            style={{
              width: "55px",
              height: "55px",
              fontSize: "22px",
            }}
          >
            <i className={`bi bi-${icon}`}></i>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default StaffDashboard;
