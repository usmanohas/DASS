import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import { useOutletContext } from "react-router-dom";

/* ================= REUSABLE CHART CARD ================= */
const ChartCard = ({ title, data, options = {}, defaultType = "bar" }) => {
  const [type, setType] = useState(defaultType);
  const [showModal, setShowModal] = useState(false);

  const chartRef = useRef(null);

  const renderChart = () => {
    const props = {
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...options,
      },
      ref: chartRef,
    };

    switch (type) {
      case "line":
        return <Line {...props} />;
      case "pie":
        return <Pie {...props} />;
      case "doughnut":
        return <Doughnut {...props} />;
      default:
        return <Bar {...props} />;
    }
  };

  const downloadChart = () => {
    if (!chartRef.current) return;
    const url = chartRef.current.toBase64Image();
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.png`;
    link.click();
  };

  return (
    <>
      <div className="card border-0 shadow-sm h-100">
        {/* HEADER */}
        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
          <h6 className="fw-semibold mb-0">{title}</h6>

          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: 110 }}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="pie">Pie</option>
              <option value="doughnut">Doughnut</option>
            </select>

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-arrows-fullscreen"></i>
            </button>

            <button
              className="btn btn-sm btn-outline-success"
              onClick={downloadChart}
            >
              <i className="bi bi-download"></i>
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="card-body">
          <div style={{ height: "300px" }}>{renderChart()}</div>
        </div>
      </div>

      {/* FULLSCREEN MODAL */}
      {showModal && (
        <>
          <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-fullscreen">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{title}</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div style={{ height: "85vh", width: "100%" }}>
                    {renderChart()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

const SuperAdministratorDashboard = () => {
  const { user } = useOutletContext();
  const [data, setData] = useState(null);

  const formattedLastLogin = user?.last_login
    ? new Date(user.last_login).toLocaleString()
    : "First login";

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/superadmin/dashboard-metrics",
        { withCredentials: true },
      );

      if (res.data.Status) setData(res.data.Data);
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

  /* ================= HELPERS ================= */
  const truncate = (text, len = 20) =>
    text?.length > len ? text.substring(0, len) + "..." : text;

  /* ================= CHART DATA ================= */

  const docDeptChart = {
    labels: data.docCountDept.map((d) => d.name_abbreviation),
    datasets: [
      { label: "Documents", data: data.docCountDept.map((d) => d.total) },
    ],
  };

  const uploadChart = {
    labels: data.uploadActivity.map((d) => d.name_abbreviation),
    datasets: [
      { label: "Uploads", data: data.uploadActivity.map((d) => d.uploads) },
    ],
  };

  const storageChart = {
    labels: data.storageByDept.map((d) => d.name_abbreviation),
    datasets: [
      {
        label: "Storage (MB)",
        data: data.storageByDept.map((d) => d.size / 1024 / 1024),
      },
    ],
  };

  const usersChart = {
    labels: data.usersByDept.map((d) => d.name_abbreviation),
    datasets: [{ label: "Users", data: data.usersByDept.map((d) => d.total) }],
  };

  const classificationChart = {
    labels: data.documentByClassification.map((d) => d.classification),
    datasets: [
      {
        data: data.documentByClassification.map((d) => d.total),
        backgroundColor: ["#198754", "#0dcaf0", "#ffc107", "#dc3545"],
      },
    ],
  };

  /* ================= TOP DOWNLOADS (RESTORED) ================= */
  const topDocsChart = {
    labels: data.topDocs.map((d) => truncate(d.title, 20)),
    datasets: [
      {
        label: "Downloads",
        data: data.topDocs.map((d) => d.downloads),
        backgroundColor: "#9ad0f5",
        borderRadius: 6,
        fullTitles: data.topDocs.map((d) => d.title),
      },
    ],
  };

  const topDocsOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (ctx) => {
            const i = ctx[0].dataIndex;
            return ctx[0].dataset.fullTitles[i];
          },
          label: (ctx) => `Downloads: ${ctx.raw}`,
        },
      },
    },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } },
      y: { ticks: { autoSkip: false } },
    },
  };

  const ticketChart = {
    labels: ["Open","In progress", "Resolved", "Closed"],
    datasets: [
      {
        label: "Tickets",
        data: [
          data.ticketSummary.open,
          data.ticketSummary.inprogress,
          data.ticketSummary.resolved,
          data.ticketSummary.closed
        ],
        backgroundColor: ["#36a2eb", "#ffc107", "#198754", "#6c757d"],
      },
    ],
  };

  const ticketOptions = {
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
        text: `Total Tickets: ${data.ticketSummary.total}`,
        font: { size: 12 },
      },
    },
  };

  /* ================= UI ================= */
  return (
    <div className="container py-3">
      {/* HEADER */}
      <div className="mb-3">
        <div className="card-body d-flex justify-content-between flex-wrap">
          <div>
            <h3>
              <i className="bi bi-speedometer2 me-2"></i>
              Super Administrator Dashboard{" "}
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
                <small className="text-muted">Allocated Storage</small>
                <h4 className="text-muted mb-0">{data.storageAllocation.allocatedStorageGB} GB</h4>
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
        <div className="col-md-8">
          <ChartCard title="Documents per Department" data={docDeptChart} />
        </div>

        <div className="col-md-4">
          <ChartCard
            title="Document Classification"
            data={classificationChart}
            defaultType="doughnut"
          />
        </div>

        <div className="col-md-12">
          <ChartCard title="Users by Department" data={usersChart} />
        </div>

        <div className="col-md-8">
          <ChartCard
            title="Top 5 Downloaded Documents"
            data={topDocsChart}
            options={topDocsOptions}
          />
        </div>
        <div className="col-md-4">
          <ChartCard
            title="Support Ticket Status"
            data={ticketChart}
            options={ticketOptions}
          />
        </div>

        <div className="col-md-8">
          <ChartCard
            title="Upload Activity"
            data={uploadChart}
            defaultType="line"
          />
        </div>

        <div className="col-md-4">
          <ChartCard
            title="Storage Usage"
            data={storageChart}
            defaultType="doughnut"
          />
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

export default SuperAdministratorDashboard;
