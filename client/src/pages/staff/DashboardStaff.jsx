import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import { useOutletContext } from "react-router-dom";
import RecentActivities from "./RecentActivities";

const MainStaffDashboard = () => {
  const { user } = useOutletContext();

  const formattedLastLogin = user?.last_login
    ? new Date(user.last_login).toLocaleString()
    : "First login";

  const [summary, setSummary] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [downloadData, setDownloadData] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const toNum = (val) => Number(val || 0);

  // Fetch initial data
  useEffect(() => {
    fetchSummary();
    fetchDeptChart();
    fetchDownloadStats(); // default last 3 months
  }, []);

  // ✅ FETCH SUMMARY
  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/staff/dashboard-summary",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setSummary(res.data.Data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FETCH DEPARTMENT CHART
  const fetchDeptChart = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/staff/requests-by-department",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setDeptData(res.data.Data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FETCH DOWNLOAD STATS
  const fetchDownloadStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/staff/download-stats",
        {
          params: dateRange,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setDownloadData(res.data.Data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ DOUGHNUT CHART - Request Status
  const requestChart = summary && {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        data: [
          toNum(summary.internal.approved) + toNum(summary.external.approved),
          toNum(summary.internal.pending) + toNum(summary.external.pending),
          toNum(summary.internal.rejected) + toNum(summary.external.rejected),
        ],
        backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
      },
    ],
  };

  // ✅ STACKED DEPARTMENT CHART
  const deptChart = {
    labels: deptData.map((d) => d.department),
    datasets: [
      {
        label: "Approved",
        data: deptData.map((d) => toNum(d.approved)),
        backgroundColor: "#28a745",
      },
      {
        label: "Pending",
        data: deptData.map((d) => toNum(d.pending)),
        backgroundColor: "#ffc107",
      },
      {
        label: "Rejected",
        data: deptData.map((d) => toNum(d.rejected)),
        backgroundColor: "#dc3545",
      },
    ],
  };

  const deptChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          footer: (items) =>
            `Total: ${items.reduce((sum, i) => sum + i.raw, 0)}`,
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  // ✅ DOWNLOAD LINE CHART
  const downloadChart = {
    labels: downloadData.map((d) => d.date),
    datasets: [
      {
        label: "Downloads",
        data: downloadData.map((d) => toNum(d.total)),
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.2)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="container">
      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body d-flex justify-content-between flex-wrap">
          <div>
            <h4>
              <i className="bi bi-person me-2"></i>
              Welcome Back,{" "}
              <small className="text-muted">{user?.full_name}</small>
            </h4>
            <div className="text-muted">
              <i className="bi bi-building me-2"></i>
              {user?.department}
            </div>
            <small className="text-muted">
              Last Login: {formattedLastLogin}
            </small>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {summary && (
        <div className="row g-3 mb-4">
          <Card
            title="Active Staff"
            value={toNum(summary.activeStaff)}
            icon="people"
          />
          <Card title="Total Documents" value={toNum(summary.documents)} icon="files" />
          <Card
            title="Total Requests"
            value={
              toNum(summary.internal.total) + toNum(summary.external.total)
            }
            icon="shield-lock"
          />
          <Card
            title="Approved"
            value={
              toNum(summary.internal.approved) +
              toNum(summary.external.approved)
            }
            icon="file-earmark-check"
          />
          <Card
            title="Pending"
            value={
              toNum(summary.internal.pending) + toNum(summary.external.pending)
            }
            icon="file-earmark-arrow-up"
          />
          <Card
            title="Rejected"
            value={
              toNum(summary.internal.rejected) +
              toNum(summary.external.rejected)
            }
            icon="file-earmark-excel"
          />
          <Card title="Total Downloads" value={toNum(summary.downloads)} icon="download" />
          <Card title="Support Tickets" value={toNum(summary.tickets)} icon="ticket" />
        </div>
      )}

      {/* CHARTS */}
      <div className="row g-4">
        {/* Department Stacked Bar */}
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h6 className=""><i className="bi bi-bar-chart-line me-2"></i>Requests by Department</h6>

            {/* Description */}
            <small className="text-muted d-block mb-3">
              Displays the number of document access requests grouped by
              department, categorized into approved, pending, and rejected
              statuses.
            </small>

            {deptData.length === 0 ? (
              <div className="text-muted text-center py-4">
                No department data available
              </div>
            ) : (
              <Bar data={deptChart} options={deptChartOptions} />
            )}
          </div>
        </div>

        {/* Download Line Chart */}
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h6><i className="bi bi-graph-up-arrow me-2"></i>Document Download Statistics</h6>
            <small className="text-muted d-block mb-3">
              Shows the number of documents downloaded by you. Default view is
              the last 3 months including the current month.
            </small>

            {/* Date Range Inputs */}
            <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
              <div className="d-flex flex-column">
                <label className="form-label mb-1">Start Date</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                />
              </div>
              <div className="d-flex flex-column">
                <label className="form-label mb-1">End Date</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>
              <button
                className="btn btn-secondary btn-sm mt-2"
                onClick={fetchDownloadStats}
              >
                Load
              </button>
            </div>

            {downloadData.length === 0 ? (
              <div className="text-muted text-center py-5">
                No download data available
              </div>
            ) : (
              <Line
                data={downloadChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" },
                    tooltip: { mode: "index", intersect: false },
                  },
                  scales: {
                    x: { title: { display: true, text: "Date" } },
                    y: {
                      title: { display: true, text: "Number of Downloads" },
                      beginAtZero: true,
                      ticks: { precision: 0 },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>
      <div className="row g-4 mt-3">
        <div className="col-12">
          <RecentActivities />
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon }) => (
  <div className="col-md-3 col-lg-3">
    <div className="card shadow-sm h-100 text-center p-3">
      <i className={`bi bi-${icon} fs-4 text-muted`}></i>
      <small className="text-muted">{title}</small>
      <div className="fw-bold fs-5">{Number(value) || 0}</div>
    </div>
  </div>
);

export default MainStaffDashboard;
