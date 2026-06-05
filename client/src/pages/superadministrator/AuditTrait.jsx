import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/baseUrl";

const SuperAdminAuditTrail = () => {
  const [groupedLogs, setGroupedLogs] = useState({});
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [documentSummary, setDocumentSummary] = useState([]);
  const [documentCode, setDocumentCode] = useState("");

  const [filters, setFilters] = useState({
    user_id: "",
    action: "",
    document_code: "",
    from_date: "",
    to_date: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
    fetchActions();
  }, []);

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    const res = await axios.get(`${API_BASE_URL}/superadmin/audit-users`, {
      withCredentials: true,
    });
    if (res.data.Status) setUsers(res.data.Data);
  };

  /* ================= FETCH ACTIONS ================= */
  const fetchActions = async () => {
    const res = await axios.get(`${API_BASE_URL}/superadmin/audit-actions`, {
      withCredentials: true,
    });
    if (res.data.Status) setActions(res.data.Data);
  };

  /* ================= FETCH LOGS ================= */
  const fetchLogs = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/superadmin/audit-logs`, {
        params: filters,
        withCredentials: true,
      });

      if (res.data.Status) {
        groupBySession(res.data.Data);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const fetchDocumentSummary = async () => {
    if (!filters.document_code.trim()) {
      setDocumentSummary([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API_BASE_URL}/superadmin/audit-document-summary`,
        {
          params: {
            document_code: filters.document_code,
            action: filters.action,
          },
          withCredentials: true,
        },
      );

      if (res.data.Status) {
        setDocumentSummary(res.data.Data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= GROUP ================= */
  const groupBySession = (logs) => {
    const grouped = logs.reduce((acc, log) => {
      if (!acc[log.session_id]) acc[log.session_id] = [];
      acc[log.session_id].push(log);
      return acc;
    }, {});
    setGroupedLogs(grouped);
  };

  /* ================= TOGGLE ================= */
  const toggleSession = (sessionId) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  /* ================= ACTION ICON ================= */
  const getActionIcon = (action) => {
    const map = {
      CREATE: "bi-plus-circle text-success",
      UPDATE: "bi-pencil-square text-warning",
      DELETE: "bi-trash text-danger",
      DOWNLOAD: "bi-download text-primary",
    };
    return map[action] || "bi-activity";
  };

  /* ================= FORMAT ROLE ================= */
  const formatRole = (roleName) => {
    const role = roleName?.toLowerCase();

    if (!role || role === "staff") return "";
    if (role === "focal_person") return " (DFP)";
    if (role === "super_admin") return " (Super Administrator)";
    if (role === "admin") return " (System Administrator)";

    return ` (${role.charAt(0).toUpperCase() + role.slice(1)})`;
  };

  /* ================= RENDER CHANGES ================= */
  const renderChanges = (oldValues, newValues) => {
    try {
      const oldData = oldValues ? JSON.parse(oldValues) : {};
      const newData = newValues ? JSON.parse(newValues) : {};

      const keys = Array.from(
        new Set([...Object.keys(oldData), ...Object.keys(newData)]),
      );

      return keys.map((key) => {
        const oldVal = oldData[key] ?? "-";
        const newVal = newData[key] ?? "-";

        if (oldVal === newVal) return null;

        return (
          <div key={key} className="border-bottom py-2">
            <div className="fw-semibold small text-uppercase text-muted mb-1">
              {key.replace(/_/g, " ")}
            </div>

            <div className="d-flex gap-3 small">
              <div className="text-danger">
                <i className="bi bi-arrow-left"></i> {String(oldVal)}
              </div>

              <div className="text-success">
                <i className="bi bi-arrow-right"></i> {String(newVal)}
              </div>
            </div>
          </div>
        );
      });
    } catch {
      return <div className="text-danger small">Invalid change data</div>;
    }
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            <i className="bi bi-shield-check me-2"></i>
            Audit Trail
          </h3>

          <p className="text-muted mb-0">
            Monitor system activities, user actions and operational logs.
          </p>
        </div>

        <button
          className="btn bg-success-subtle text-success border px-3 py-2 rounded-pill"
          data-bs-toggle="modal"
          data-bs-target="#trackDocumentModal"
        >
          <i className="bi bi-file-earmark-search me-2"></i>
          Track Document
        </button>
      </div>

      {/* ================= FILTER ================= */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">User</label>

              <select
                className="form-select"
                value={filters.user_id}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    user_id: e.target.value,
                  })
                }
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name}
                    {formatRole(u.role_name)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold">Action</label>

              <select
                className="form-select"
                value={filters.action}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    action: e.target.value,
                  })
                }
              >
                <option value="">All Actions</option>

                {actions.map((a, i) => (
                  <option key={i} value={a.action}>
                    {a.action}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold">From</label>

              <input
                type="date"
                className="form-control"
                value={filters.from_date}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    from_date: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold">To</label>

              <input
                type="date"
                className="form-control"
                value={filters.to_date}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    to_date: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-2">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-danger flex-fill"
                  onClick={fetchLogs}
                >
                  <i className="bi bi-search"></i>
                </button>

                <button
                  className="btn btn-outline-secondary"
                  title="Reset Filters"
                  onClick={() => {
                    const reset = {
                      user_id: "",
                      action: "",
                      from_date: "",
                      to_date: "",
                    };

                    setFilters(reset);

                    axios
                      .get(`${API_BASE_URL}/admin/audit-logs`, {
                        withCredentials: true,
                      })
                      .then((res) => {
                        if (res.data.Status) {
                          groupBySession(res.data.Data);
                        }
                      });
                  }}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LOGS ================= */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border"></div>
        </div>
      ) : Object.keys(groupedLogs).length === 0 ? (
        <div className="text-center text-muted py-5">No audit logs found</div>
      ) : (
        Object.entries(groupedLogs).map(([sessionId, sessionLogs]) => {
          const firstLog = sessionLogs[0];
          const isOpen = expandedSessions[sessionId];

          return (
            <div key={sessionId} className="card shadow-sm mb-4 border">
              {/* SESSION HEADER */}
              <div
                className="card-header bg-white d-flex justify-content-between align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => toggleSession(sessionId)}
              >
                <div>
                  <div className="fw-semibold">{firstLog.full_name}</div>
                  <small className="text-muted">Session ID: {sessionId}</small>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div
                    title="Activities"
                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                    style={{ width: 32, height: 32, fontSize: 12 }}
                  >
                    {sessionLogs.length}
                  </div>

                  <i
                    className={`bi ${
                      isOpen ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  ></i>
                </div>
              </div>

              {/* SESSION BODY */}
              {isOpen && (
                <div className="card-body">
                  {sessionLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded p-3 mb-3 bg-light"
                    >
                      <div className="d-flex justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <i className={`bi ${getActionIcon(log.action)}`}></i>
                          <span className="fw-semibold">{log.action}</span>
                        </div>

                        <small className="text-muted">
                          {new Date(log.created_at).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>

                      <div className="mt-2 text-dark">{log.description}</div>

                      <div className="mt-2 small text-muted">
                        {`Action performed from a ${
                          log.os?.toLowerCase().includes("windows") ||
                          log.os?.toLowerCase().includes("mac")
                            ? "desktop"
                            : log.os?.toLowerCase().includes("android") ||
                                log.os?.toLowerCase().includes("ios")
                              ? "mobile device"
                              : "device"
                        } using ${log.browser || "an unknown browser"} on ${
                          log.os || "an unknown OS"
                        } (IP: ${log.ip_address || "N/A"})`}
                      </div>

                      {(log.old_values || log.new_values) && (
                        <details className="mt-3">
                          <summary className="text-success">
                            View Changes
                          </summary>
                          <div className="mt-2 bg-white p-3 rounded border">
                            {renderChanges(log.old_values, log.new_values)}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      <div className="modal fade" id="trackDocumentModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-file-earmark-search me-2"></i>
                Track Document Activity
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <label className="form-label fw-semibold">Document Code</label>

              <input
                className="form-control"
                placeholder="DOC-2025-001"
                value={documentCode}
                onChange={(e) => setDocumentCode(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-success"
                onClick={() => {
                  if (!documentCode.trim()) return;

                  window.location.href = `/superadmin/document-tracker/${documentCode}`;
                }}
              >
                <i className="bi bi-search me-1"></i>
                Track Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAuditTrail;
