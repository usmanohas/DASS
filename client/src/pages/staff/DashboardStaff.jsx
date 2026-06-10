import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import { useOutletContext } from "react-router-dom";
import RecentActivities from "./RecentActivities";
import API_BASE_URL from "../../config/baseUrl";

const MainStaffDashboard = () => {
  const { user } = useOutletContext();

  const formattedLastLogin = user?.last_login
    ? new Date(user.last_login).toLocaleString()
    : "First login";

  const [summary, setSummary] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [downloadData, setDownloadData] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const toNum = (val) => Number(val || 0);

  /* =========================================
     FETCH DATA
  ========================================= */
  useEffect(() => {
    fetchSummary();
    fetchDeptChart();
    fetchDownloadStats();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/staff/dashboard-summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSummary(res.data.Data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDeptChart = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/staff/requests-by-department`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setDeptData(res.data.Data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDownloadStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/staff/download-stats`, {
        params: dateRange,

        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setDownloadData(res.data.Data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================================
     CHART DATA
  ========================================= */

  const deptChart = {
    labels: deptData.map((d) => d.department),

    datasets: [
      {
        label: "Approved",
        data: deptData.map((d) => toNum(d.approved)),
        backgroundColor: "#198754",
        borderRadius: 8,
      },

      {
        label: "Pending",
        data: deptData.map((d) => toNum(d.pending)),
        backgroundColor: "#ef6c00",
        borderRadius: 8,
      },

      {
        label: "Rejected",
        data: deptData.map((d) => toNum(d.rejected)),
        backgroundColor: "#dc3545",
        borderRadius: 8,
      },
    ],
  };

  const deptChartOptions = {
    responsive: true,

    plugins: {
      legend: {
        position: "top",
      },
    },

    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },

      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const downloadChart = {
    labels: downloadData.map((d) => d.date),
    datasets: [
      {
        label: "Downloads",
        data: downloadData.map((d) => toNum(d.total)),
        borderColor: "#0d6efd",
        borderWidth: 2,
        tension: 0.3,
        fill: false, // ✅ REMOVE background shading
      },
    ],
  };

  return (
    <div className="container-fluid py-4">
      {/* =========================================
          HEADER
      ========================================= */}
      <div className="card border rounded-4 shadow-sm mb-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="row align-items-center">
            {/* LEFT */}
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-3 mb-4">
                {/* AVATAR */}
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center border"
                  style={{
                    width: "70px",
                    height: "70px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <i
                    className="bi bi-person text-secondary"
                    style={{ fontSize: "2rem" }}
                  ></i>
                </div>

                {/* TEXT */}
                <div>
                  <div className="text-muted small mb-1">Welcome back,</div>

                  <h4 className="fw-bold mb-0 text-dark">{user?.full_name}</h4>
                </div>
              </div>

              {/* INFO ROW */}
              <div className="d-flex flex-wrap gap-5">
                <div>
                  <small className="text-muted d-block">Department</small>
                  <div className="fw-semibold text-dark">
                    {user?.department}
                  </div>
                </div>

                <div>
                  <small className="text-muted d-block">Last Login</small>
                  <div className="fw-semibold text-dark">
                    {formattedLastLogin}
                  </div>
                </div>
                
              </div>
            </div>

            {/* RIGHT */}
            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <div className="border rounded-3 p-3 d-inline-block bg-light">
                <small className="text-muted d-block mb-1">
                  System Access Level
                </small>

                <h6 className="fw-bold mb-0 text-dark">Staff Dashboard</h6>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          KPI CARDS
      ========================================= */}
      {summary && (
        <div className="row g-4 mb-4">
          <StatCard
            title="Active Staff"
            value={summary.activeStaff}
            icon="people-fill"
            color="primary"
          />

          <StatCard
            title="Documents"
            value={summary.documents}
            icon="file-earmark-text"
            color="success"
          />

          <StatCard
            title="Total Requests"
            value={
              toNum(summary.internal.total) + toNum(summary.external.total)
            }
            icon="shield-lock-fill"
            color="warning"
          />

          <StatCard
            title="Approved"
            value={
              toNum(summary.internal.approved) +
              toNum(summary.external.approved)
            }
            icon="check-circle-fill"
            color="success"
          />

          <StatCard
            title="Pending"
            value={
              toNum(summary.internal.pending) + toNum(summary.external.pending)
            }
            icon="clock-history"
            color="warning"
          />

          <StatCard
            title="Rejected"
            value={
              toNum(summary.internal.rejected) +
              toNum(summary.external.rejected)
            }
            icon="x-circle-fill"
            color="danger"
          />

          <StatCard
            title="Downloads"
            value={summary.downloads}
            icon="download"
            color="info"
          />

          <StatCard
            title="Support Tickets"
            value={summary.tickets}
            icon="ticket-detailed-fill"
            color="dark"
          />
        </div>
      )}

      {/* =========================================
          CHARTS
      ========================================= */}
      <div className="row g-4">
        {/* REQUESTS CHART */}
        <div className="col-xl-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="mb-4">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-bar-chart-line me-2 text-primary"></i>
                  Document Requests
                </h5>

                <small className="text-muted">
                  Document Access requests grouped by department
                </small>
              </div>

              {deptData.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-bar-chart fs-1 d-block mb-3"></i>
                  No department analytics available
                </div>
              ) : (
                <Bar data={deptChart} options={deptChartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* DOWNLOAD CHART */}
        <div className="col-xl-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between flex-wrap gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1">
                    <i className="bi bi-graph-up-arrow me-2 text-success"></i>
                    Download Analytics
                  </h5>

                  <small className="text-muted">
                    Monitor document download activity
                  </small>
                </div>

                <div className="d-flex gap-3 flex-wrap align-items-end">
                  {/* START DATE */}
                  <div className="d-flex flex-column">
                    <label className="form-label small text-muted mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({
                          ...dateRange,
                          start: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* END DATE */}
                  <div className="d-flex flex-column">
                    <label className="form-label small text-muted mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({
                          ...dateRange,
                          end: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* BUTTON */}
                  <div>
                    <button
                      className="btn btn-sm text-white px-3"
                      style={{
                        background: "#ef6c00",
                        height: "38px",
                      }}
                      onClick={fetchDownloadStats}
                    >
                      Load
                    </button>
                  </div>
                </div>
              </div>

              {downloadData.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-download fs-1 d-block mb-3"></i>
                  No download statistics available
                </div>
              ) : (
                <Line
                  data={downloadChart}
                  options={{
                    responsive: true,

                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },

                    scales: {
                      x: {
                        grid: {
                          display: false,
                        },
                      },

                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0,
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          RECENT ACTIVITIES
      ========================================= */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="mb-3">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-clock-history me-2 text-dark"></i>
                  Recent Activities
                </h5>

                <small className="text-muted">
                  Latest system and access activities
                </small>
              </div>

              <RecentActivities />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================
   KPI CARD COMPONENT
========================================= */

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="col-6 col-md-4 col-xl-3">
      <div
        className="card border-0 shadow-sm rounded-4 h-100"
        style={{
          transition: "0.25s ease",
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <small className="text-muted d-block mb-2">{title}</small>

              <h3 className="fw-bold mb-0">{Number(value) || 0}</h3>
            </div>

            <div
              className={`bg-${color} bg-opacity-10 text-${color} rounded-4 d-flex align-items-center justify-content-center`}
              style={{
                width: "56px",
                height: "56px",
              }}
            >
              <i className={`bi bi-${icon} fs-4`}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainStaffDashboard;
