import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import { useOutletContext } from "react-router-dom";

const AdministratorDashboard = () => {
  const { user } = useOutletContext();

  const formattedLastLogin = user?.last_login
    ? new Date(user.last_login).toLocaleString()
    : "First login";

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/admin/dashboard-metrics",
        { withCredentials: true },
      );

      if (res.data.Status) {
        setData(res.data.Data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border"></div>
      </div>
    );
  }

  /* ================= CHART DATA ================= */

  const docDeptChart = {
    labels: data.docCountDept.map((d) => d.name_abbreviation),
    datasets: [
      {
        label: "Documents",
        data: data.docCountDept.map((d) => d.total),
      },
    ],
  };

  const uploadChart = {
    labels: data.uploadActivity.map((d) => d.name_abbreviation),
    datasets: [
      {
        label: "Uploads (Last 90 days)",
        data: data.uploadActivity.map((d) => d.uploads),
      },
    ],
  };

  const storageChart = {
    labels: data.storageByDept.map((d) => d.name_abbreviation),
    datasets: [
      {
        label: "Storage Used",
        data: data.storageByDept.map((d) => d.size / 1024 / 1024), // MB
      },
    ],
  };

  const usersChart = {
    labels: data.usersByDept.map((d) => d.name_abbreviation),
    datasets: [
      {
        label: "Active Users",
        data: data.usersByDept.map((d) => d.total),
      },
    ],
  };
  /*
  const topDocsChart = {
    labels: data.topDocs.map((d) => d.title),
    datasets: [
      {
        label: "Downloads",
        data: data.topDocs.map((d) => d.downloads),
      },
    ],
  };
  */

  const truncate = (text, len = 20) =>
    text.length > len ? text.substring(0, len) + "..." : text;

  /* ================= TOP DOWNLOADS CHART ================= */
  const topDocsChart = {
    labels: data.topDocs.map((d) => truncate(d.title, 20)), // ✅ X-axis truncated only

    datasets: [
      {
        label: "Downloads",
        data: data.topDocs.map((d) => d.downloads),
        backgroundColor: "#5cb874",
        borderRadius: 6,

        // ✅ STORE FULL TITLE HERE (KEY FIX)
        fullTitles: data.topDocs.map((d) => d.title),
      },
    ],
  };

  /* ================= OPTIONS (IMPORTANT FIX) ================= */
  const topDocsOptions = {
    responsive: true,
    maintainAspectRatio: false,

    indexAxis: "y",

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;

            // ✅ FULL TITLE FROM DATASET (SAFE & RELIABLE)
            return context[0].dataset.fullTitles[index];
          },

          label: (context) => {
            return `Downloads: ${context.raw}`;
          },
        },
      },
    },

    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },

      y: {
        ticks: {
          autoSkip: false,
        },
      },
    },
  };

  const totalDocs = data.documentByClassification.reduce(
    (sum, d) => sum + d.total,
    0,
  );

  const classificationChart = {
    labels: data.documentByClassification.map((d) => {
      const percent =
        totalDocs > 0 ? ((d.total / totalDocs) * 100).toFixed(1) : 0;

      return `${d.classification} (${percent}%)`;
    }),

    datasets: [
      {
        label: "Documents",
        data: data.documentByClassification.map((d) => d.total),
        backgroundColor: [
          "#198754", // Public
          "#0dcaf0", // Internal
          "#ffc107", // Confidential
          "#dc3545", // Restricted
        ],
        borderWidth: 1,
      },
    ],
  };

  const classificationOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);

            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

            return `${context.label}: ${value} docs (${percent}%)`;
          },
        },
      },
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="container">
      {/* HEADER */}
      <div className="mb-3">
        <div className="card-body d-flex justify-content-between flex-wrap">
          <div>
            <h3>
              <i className="bi bi-speedometer2 me-2"></i>
              Administrator Dashboard{" "}
            </h3>
            <small className="text-muted">
              Last Login: {formattedLastLogin}
            </small>
          </div>
        </div>
      </div>
      {/* SUMMARY CARDS */}
      <div className="row g-4 mb-4">
        {/* TOTAL USERS */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-person fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Active Users</small>
                <h4 className="text-muted mb-0">{data.totalUsers.total}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE PARTNERS */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-people fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Active Partners</small>
                <h4 className="text-muted mb-0">
                  {data.totalActivePartners.total}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* STORAGE ALLOCATION */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-hdd-stack fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Storage Allocation</small>
                <h4 className="text-muted mb-0">1 TB</h4>
              </div>
            </div>
          </div>
        </div>

        {/* STORAGE USED */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-hdd fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Storage Used</small>
                <h4 className="text-muted mb-0">
                  {(data.storage.totalStorage / 1024 / 1024).toFixed(2)} MB
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* TOTAL DOCUMENTS */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-file-earmark-text fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Total Documents</small>
                <h4 className="text-muted mb-0">{data.totalDocument.total}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* ARCHIVED */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-archive fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Archived / Deleted</small>
                <h4 className="text-muted mb-0">
                  {data.totalDocumentArchivedDeleted.total}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* PENDING REQUESTS */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-hourglass-split fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Pending Requests</small>
                <h4 className="text-muted mb-0">
                  {data.pendingRequests.total}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* EXPIRING DOCS */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-exclamation-triangle fs-4"></i>
              </div>

              <div>
                <small className="text-muted">Expiring Documents</small>
                <h4 className="text-muted mb-0">{data.expiringDocs.length}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="row g-4">
        <div className="col-md-12">
          <div className="card p-3 shadow-sm">
            <h6>Documents per Department</h6>
            <Bar data={docDeptChart} />
          </div>
        </div>

        <div className="col-md-8">
          <div className="card p-3 shadow-sm">
            <h6 className="mb-3">Top 5 Downloaded Documents</h6>

            {/* ✅ chart wrapper controls spacing */}
            <div style={{ height: "350px" }}>
              <Bar data={topDocsChart} options={topDocsOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6>Ducument by classification</h6>
            <Doughnut
              data={classificationChart}
              options={classificationOptions}
            />
          </div>
        </div>

        <div className="col-md-8">
          <div className="card p-3 shadow-sm">
            <h6>Upload Activity</h6>
            <Line data={uploadChart} />
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6>Storage by Department (MB)</h6>
            <Doughnut data={storageChart} />
          </div>
        </div>

        <div className="col-md-12">
          <div className="card p-3 shadow-sm">
            <h6>Active Users by Department/Partners</h6>
            <Bar data={usersChart} />
          </div>
        </div>
        
      </div>

      {/* EXPIRING DOCUMENTS */}
      <div className="card mt-4 shadow-sm">
        <div className="card-body">
          <h6>Documents Nearing Expiry</h6>

          {data.expiringDocs.length === 0 ? (
            <p className="text-muted">No documents expiring soon</p>
          ) : (
            <ul className="list-group">
              {data.expiringDocs.map((d, i) => (
                <li
                  key={i}
                  className="list-group-item d-flex justify-content-between"
                >
                  <span>{d.title}</span>
                  <span className="text-danger">
                    {new Date(d.retention_expiry_date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdministratorDashboard;
