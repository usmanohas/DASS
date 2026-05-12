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

  const [staff, setStaff] = useState({});
  const [stats, setStats] = useState({});
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [logins, setLogins] = useState([]);

  const fetchData = async () => {
    const res = await axios.get(
      `http://localhost:3000/department/staff/${id}/dashboard`,
      { withCredentials: true },
    );

    if (res.data.Status) {
      setStaff(res.data.staff);
      setStats(res.data.stats);
      setWeeklyActivity(res.data.weeklyActivity);
      setRecentActivities(res.data.recentActivities);
      setLogins(res.data.logins);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* AI INSIGHT */
  const getStaffInsight = () => {
    if (stats.downloads > 50)
      return { text: "Highly active staff", color: "success" };

    if (stats.downloads > 10)
      return { text: "Moderately active", color: "warning" };

    return { text: "Low system usage", color: "danger" };
  };

  const getBarColor = (value) => {
    if (value > 20) return "#198754"; // High activity → Green
    if (value > 10) return "#ffc107"; // Medium → Yellow
    return "#dc3545"; // Low → Red
  };

  return (
    <div className="container py-2">
      {/* HEADER */}
      <div className="mb-4">
        <div className=" d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1">
              <i className="bi bi-speedometer2 me-2"></i>{" "}
              {staff.full_name || "Staff"} Analytics Dashboard
            </h4>
          </div>

          <span className={`badge bg-${getStaffInsight().color}`}>
            {getStaffInsight().text}
          </span>
        </div>
      </div>

      {/* KPI */}
      <div className="row g-3 mb-4">
        <Card title="Downloads" value={stats.downloads} icon="download" />
        <Card
          title="Request Approved"
          value={stats.approved}
          icon="check-circle"
        />
        <Card title="Request Pending " value={stats.pending} icon="clock" />
        <Card title="Request Rejected" value={stats.rejected} icon="x-circle" />
      </div>

      {/* ACCESS REQUEST CHART */}
      <div className="card shadow-sm mb-4 p-3">
        <h6>Access Request Analysis</h6>

        <Bar
          data={{
            labels: ["Approved", "Pending", "Rejected"],
            datasets: [
              {
                label: "Requests",
                data: [stats.approved, stats.pending, stats.rejected],
                backgroundColor: ["#198754", "#ffc107", "#dc3545"],
              },
            ],
          }}
        />
      </div>

      {/* WEEKLY ACTIVITY */}
      <div className="card shadow-sm mb-4 p-3">
        <h6>Weekly Activity</h6>

        <Bar
          data={{
            labels: weeklyActivity.map((d) => d.day),
            datasets: [
              {
                label: "Actions",
                data: weeklyActivity.map((d) => d.total),

                backgroundColor: [
                  "#0d6efd", // Monday - Blue
                  "#20c997", // Tuesday - Teal
                  "#ffc107", // Wednesday - Yellow
                  "#dc3545", // Thursday - Red
                  "#6f42c1", // Friday - Purple
                  "#fd7e14", // Saturday - Orange
                  "#198754", // Sunday - Green
                ],
              },
            ],
          }}
        />
      </div>

      {/* RISK */}
      <div className="card shadow-sm mb-4 p-3">
        <h6>Risk Monitoring</h6>

        <ul className="small">
          <li>Downloads today: {stats.today_downloads}</li>
          <li>
            Multiple IPs:{" "}
            <strong
              className={stats.multiple_ips ? "text-danger" : "text-success"}
            >
              {stats.multiple_ips ? "Yes" : "No"}
            </strong>
          </li>
        </ul>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="card shadow-sm mb-4 p-3">
        <h6>Recent Activities</h6>

        {recentActivities.map((a, i) => (
          <div key={i} className="border-bottom py-2 small">
            <strong>{a.action}</strong> - {a.description}
            <span className="float-end text-muted">
              <i className="bi bi-calendar me-2"></i>
              {new Date(a.created_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* LOGIN */}
      <div className="card shadow-sm p-3">
        <h6>Login Monitoring</h6>

        <table className="table table-sm">
          <thead>
            <tr>
              <th>IP</th>
              <th>Device</th>
              <th>Browser</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {logins.map((l, i) => (
              <tr key={i}>
                <td>{l.ip_address}</td>
                <td>{l.device}</td>
                <td>{l.browser}</td>
                <td>{new Date(l.created_at).toLocaleString()}</td>
                <td>
                  <span
                    className={`badge ${
                      l.ip_count > 3 ? "bg-danger" : "bg-success"
                    }`}
                  >
                    {l.ip_count > 3 ? "Suspicious" : "Normal"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon }) => (
  <div className="col-md-3">
    <div className="card shadow-sm text-center p-3 h-100">
      <i className={`bi bi-${icon} fs-4`}></i>
      <h5>{value || 0}</h5>
      <small>{title}</small>
    </div>
  </div>
);

export default StaffDashboard;
