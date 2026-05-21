import React, { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
);

const DfpDashboard = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  // Format Last Login
  const formattedLastLogin = user?.last_login
    ? new Date(user.last_login).toLocaleString()
    : "First login";
  const [summary, setSummary] = useState({
    total_staff: 0,
    active_staff: 0,
    total_documents: 0,
    archived_documents: 0,
    deleted_documents: 0,
    uploads_this_month: 0,
    downloads_this_month: 0,
    total_storage: 0,
  });

  const [activity, setActivity] = useState([]);
  const [topDocs, setTopDocs] = useState([]);
  const [fileTypes, setFileTypes] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [days, setDays] = useState(30);
  const [mode, setMode] = useState("count"); // count | size
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);

    try {
      const [s, a, t, f, r] = await Promise.all([
        axios.get("http://localhost:3000/department/dashboard/summary", {
          withCredentials: true,
        }),
        axios.get(
          `http://localhost:3000/department/dashboard/activity?days=${days}`,
          { withCredentials: true },
        ),
        axios.get("http://localhost:3000/department/dashboard/top-documents", {
          withCredentials: true,
        }),
        axios.get("http://localhost:3000/department/dashboard/file-types", {
          withCredentials: true,
        }),
        axios.get("http://localhost:3000/department/dashboard/recent-uploads", {
          withCredentials: true,
        }),
      ]);

      if (s.data?.Data) {
        setSummary({
          total_staff: s.data.Data.total_staff || 0,
          active_staff: s.data.Data.active_staff || 0,
          total_documents: s.data.Data.total_documents || 0,
          archived_documents: s.data.Data.archived_documents || 0,
          deleted_documents: s.data.Data.deleted_documents || 0,
          uploads_this_month: s.data.Data.uploads_this_month || 0,
          downloads_this_month: s.data.Data.downloads_this_month || 0,
          total_storage: s.data.Data.total_storage || 0,
        });
      }

      setActivity(a.data?.Data || []);
      setTopDocs(t.data?.Data || []);
      setFileTypes(f.data?.Data || []);
      setRecentUploads(r.data?.Data || []);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, [days]);

  /* CHARTS */

  const lineData = {
    labels: activity.map((d) => d.date),
    datasets: [
      {
        label: "Uploads",
        data: activity.map((d) => d.uploads),
        borderColor: "#198754", // ✅ green
        backgroundColor: "rgba(25,135,84,0.2)",
        tension: 0.4,
      },
      {
        label: "Downloads",
        data: activity.map((d) => d.downloads),
        borderColor: "#0d6efd", // ✅ blue
        backgroundColor: "rgba(13,110,253,0.2)",
        tension: 0.4,
      },
    ],
  };

  const maxDownloads = Math.max(...topDocs.map((d) => d.downloads), 1);

  const getColor = (value) => {
    const ratio = value / maxDownloads;

    if (ratio > 0.7) return "#198754"; // 🟢 High
    if (ratio > 0.4) return "#ffc107"; // 🟡 Medium
    return "#dc3545"; // 🔴 Low
  };

  const topDocsData = {
    labels: topDocs.map((d) => d.title),
    datasets: [
      {
        label: "Downloads",
        data: topDocs.map((d) => d.downloads),
        backgroundColor: topDocs.map((d) => getColor(d.downloads)),
        borderRadius: 6,
      },
    ],
    plugins: {
      legend: { display: false },
    },
  };

  const fileTypeData = {
    labels: fileTypes.map((f) => f.file_type.toUpperCase()),
    datasets: [
      {
        data:
          mode === "count"
            ? fileTypes.map((f) => f.total_files)
            : fileTypes.map((f) => (f.total_size || 0) / 1024 / 1024),
        backgroundColor: [
          "#0d6efd",
          "#198754",
          "#ffc107",
          "#dc3545",
          "#6f42c1",
          "#20c997",
          "#fd7e14",
        ],
      },
    ],
  };

  const generateInsights = () => {
    const insights = [];

    /* TOP DOCUMENT ANALYSIS */
    if (topDocs.length > 0) {
      const top = topDocs[0];
      const least = topDocs[topDocs.length - 1];

      insights.push({
        text: `"${top.title}" is driving the highest engagement (${top.downloads} downloads).`,
        type: "success",
      });

      if (least.downloads < top.downloads * 0.3) {
        insights.push({
          text: `"${least.title}" is underperforming significantly.`,
          type: "danger",
        });
      }
    }

    /* TREND ANALYSIS */
    if (activity.length > 2) {
      const last = activity[activity.length - 1].downloads;
      const first = activity[0].downloads;

      const change = ((last - first) / (first || 1)) * 100;

      if (change > 10) {
        insights.push({
          text: `Downloads increased by ${change.toFixed(1)}% over selected period.`,
          type: "success",
        });
      } else if (change < -10) {
        insights.push({
          text: `Downloads dropped by ${Math.abs(change).toFixed(1)}%. Consider reviewing document relevance.`,
          type: "danger",
        });
      } else {
        insights.push({
          text: "Download activity is stable.",
          type: "warning",
        });
      }
    }

    /* STORAGE ANALYSIS */
    if (fileTypes.length > 0) {
      const sorted = [...fileTypes].sort((a, b) => b.total_size - a.total_size);
      const topType = sorted[0];

      const totalSize = fileTypes.reduce(
        (sum, f) => sum + (f.total_size || 0),
        0,
      );
      const ratio = topType.total_size / (totalSize || 1);

      if (ratio > 0.5) {
        insights.push({
          text: `${topType.file_type.toUpperCase()} files consume over 50% of storage.`,
          type: "warning",
        });
      }

      insights.push({
        text: `${topType.file_type.toUpperCase()} is the dominant file type.`,
        type: "success",
      });
    }

    /* ARCHIVE HEALTH */
    if (summary.total_documents > 0) {
      const ratio = summary.archived_documents / summary.total_documents;

      if (ratio > 0.4) {
        insights.push({
          text: "High archive ratio detected. Consider cleanup or review policy.",
          type: "warning",
        });
      }
    }

    /* ENGAGEMENT SCORE */
    if (summary.total_documents > 0) {
      const score =
        (summary.downloads_this_month / summary.total_documents) * 100;

      insights.push({
        text: `Engagement score: ${score.toFixed(1)}%`,
        type: score > 50 ? "success" : "warning",
      });
    }

    return insights;
  };

  const getFileIcon = (type = "") => {
    const t = type.toLowerCase();

    /* PDF */
    if (t.includes("pdf")) return "bi-file-earmark-pdf text-danger";

    /* WORD */
    if (t.includes("doc") || t.includes("word"))
      return "bi-file-earmark-word text-primary";

    /* EXCEL */
    if (t.includes("xls") || t.includes("excel") || t.includes("csv"))
      return "bi-file-earmark-excel text-success";

    /* POWERPOINT */
    if (t.includes("ppt") || t.includes("powerpoint"))
      return "bi-file-earmark-ppt text-warning";

    /* IMAGES */
    if (
      t.includes("jpg") ||
      t.includes("jpeg") ||
      t.includes("png") ||
      t.includes("gif") ||
      t.includes("webp") ||
      t.includes("image")
    )
      return "bi-file-earmark-image text-info";

    /* TEXT */
    if (t.includes("txt")) return "bi-file-earmark-text text-secondary";

    /* ZIP / ARCHIVE */
    if (t.includes("zip") || t.includes("rar") || t.includes("7z"))
      return "bi-file-earmark-zip text-dark";

    /* VIDEO */
    if (
      t.includes("mp4") ||
      t.includes("avi") ||
      t.includes("mkv") ||
      t.includes("mov")
    )
      return "bi-file-earmark-play text-danger";

    /* AUDIO */
    if (t.includes("mp3") || t.includes("wav") || t.includes("aac"))
      return "bi-file-earmark-music text-success";

    /* DEFAULT */
    return "bi-file-earmark text-muted";
  };

  if (loading) {
    return <div className="text-center py-5">Loading dashboard...</div>;
  }

  return (
    <div className="container">
      {/* Page Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          {/* Left Section */}
          <div>
            <h2 className="mb-2">
              <i className="bi bi-speedometer2 text-muted me-2"></i>
              Department Dashboard
            </h2>

            <div className="text-muted">
              <i className="bi bi-building me-2"></i>
              {user?.department}
            </div>
            <small className="opacity-75 d-block mt-2">
              <i className="bi bi-clock-history me-2"></i>
              Last Login: {formattedLastLogin}
            </small>
          </div>

          {/* Right Section (User Badge) */}
          <div className="d-flex align-items-center mt-3 mt-md-0">
            {/* Role Badge */}
            <div className="text-end"></div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-people fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Total Staff</small>
                <h4 className="text-muted mb-0">
                  {summary.total_staff}
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-person-check fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Active Staff</small>
                <h4 className="text-muted mb-0">
                  {summary.active_staff}
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-file-earmark fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Total Documents</small>
                <h4 className="text-muted mb-0">
                  {summary.total_documents}
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-dark bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-archive fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Archived</small>
                <h4 className="text-muted mb-0">
                  {summary.archived_documents}
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-trash3 fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Deleted</small>
                <h4 className="text-muted mb-0">
                  {summary.deleted_documents}
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-upload fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Upload This Year</small>
                <h4 className="text-muted mb-0">
                  {summary.uploads_this_month}
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-download fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Downloads</small>
                <h4 className="text-muted mb-0">
                  {summary.downloads_this_month}
                </h4>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-hdd fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Storage Consumed</small>
                <h4 className="text-muted mb-0">
                  {(summary.total_storage / 1024 / 1024).toFixed(2)}
                </h4>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CHARTS */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="card shadow-sm p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">
                <span className="bi bi-charts me-2"></span> Activity Trend
              </h6>

              {/* FILTER INSIDE CARD */}
              <select
                className="form-select form-select-sm w-auto"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>

            <Line data={lineData} />
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="mb-3">
              <span className="bi bi-bar-chart me-2"></span>
              Top 5 Most Downloaded Documents
            </h6>

            <Bar data={topDocsData} options={{ indexAxis: "y" }} />

            {/* LEGEND */}
            <div className="mt-3 small d-flex gap-3 align-items-center">
              <div className="d-flex align-items-center gap-1">
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#198754",
                    display: "inline-block",
                  }}
                ></span>
                <span className="text-muted">High</span>
              </div>

              <div className="d-flex align-items-center gap-1">
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#ffc107",
                    display: "inline-block",
                  }}
                ></span>
                <span className="text-muted">Medium</span>
              </div>

              <div className="d-flex align-items-center gap-1">
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#dc3545",
                    display: "inline-block",
                  }}
                ></span>
                <span className="text-muted">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm p-3 mt-2 mb-4">
        <h6 className="mb-3">
          <span className="bi bi-cpu me-2 text-primary"></span>
          AI Insights & Recommendations
        </h6>

        {generateInsights().length === 0 ? (
          <div className="text-muted small">No insights available</div>
        ) : (
          generateInsights().map((insight, i) => (
            <div
              key={i}
              className={`border-start border-3 ps-2 mb-2 small 
        ${
          insight.type === "success"
            ? "border-success text-success"
            : insight.type === "danger"
              ? "border-danger text-danger"
              : "border-warning text-warning"
        }`}
            >
              <div className="fw-semibold">
                {insight.type === "success" && "🟢 Positive"}
                {insight.type === "warning" && "🟡 Attention"}
                {insight.type === "danger" && "🔴 Critical"}
              </div>

              <div className="text-dark">{insight.text}</div>
            </div>
          ))
        )}
      </div>

      {/* FILE TYPES + RECENT */}
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm p-3 h-100">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">
                <span className="bi bi-files me-2"></span>
                File Type Distribution
              </h6>

              {/* SWITCH TOGGLE */}
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="modeSwitch"
                  checked={mode === "size"}
                  onChange={(e) => setMode(e.target.checked ? "size" : "count")}
                />
                <label className="form-check-label small ms-2">
                  {mode === "size" ? "Storage" : "Files"}
                </label>
              </div>
            </div>

            {/* DESCRIPTION */}
            <p className="text-muted small mb-2">
              {mode === "count"
                ? "Shows distribution of documents by file type based on number of files."
                : "Shows how much storage each file type occupies in the system."}
            </p>

            {/* CHART */}
            <div>
              <Doughnut data={fileTypeData} />
            </div>

            {/* INSIGHT */}
            {fileTypes.length > 0 && (
              <div className="mt-2 small text-muted">
                Top type:{" "}
                <strong>{fileTypes[0].file_type.toUpperCase()}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">
                <span className="bi bi-upload me-2"></span>
                Recent Uploads
              </h6>

              <small className="text-muted">{recentUploads.length} items</small>
            </div>

            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Document</th>
                    <th>Date</th>
                    <th className="text-end">Size</th>
                  </tr>
                </thead>

                <tbody>
                  {recentUploads.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-3">
                        No recent uploads
                      </td>
                    </tr>
                  ) : (
                    recentUploads.map((doc, i) => (
                      <tr key={i}>
                        {/* DOCUMENT */}
                        <td>
                          <div className="d-flex align-items-center">
                            <i
                              className={`bi ${getFileIcon(doc.type)} me-2`}
                            ></i>
                            <span className="small fw-semibold">
                              {doc.title}
                            </span>
                          </div>
                        </td>

                        {/* DATE */}
                        <td className="small text-muted">
                          {new Date(doc.created_at).toLocaleDateString()}
                          <div style={{ fontSize: "11px" }}>
                            {new Date(doc.created_at).toLocaleTimeString()}
                          </div>
                        </td>

                        {/* SIZE */}
                        <td className="text-end small text-muted">
                          {(doc.file_size / 1024).toFixed(1)} KB
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
    </div>
  );
};

const Card = ({ title, value, icon }) => (
  <div className="col-md-3 col-lg-3">
    <div className="card shadow-sm h-100 text-center p-3">
      <i className={`bi bi-${icon} fs-4 text-muted`}></i>
      <div className="fw-bold fs-5">{Number(value) || 0}</div>
      <small className="text-muted">{title}</small>
    </div>
  </div>
);

export default DfpDashboard;
