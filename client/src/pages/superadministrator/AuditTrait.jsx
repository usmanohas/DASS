import React, { useEffect, useState } from "react";
import axios from "axios";

const SuperAdminAuditTrail = () => {
  const [groupedLogs, setGroupedLogs] = useState({});
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [expandedSessions, setExpandedSessions] = useState({});

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
    const res = await axios.get("http://localhost:3000/admin/staff-directory", {
      withCredentials: true,
    });
    if (res.data.Status) setUsers(res.data.Data);
  };

  /* ================= FETCH ACTIONS ================= */
  const fetchActions = async () => {
    const res = await axios.get("http://localhost:3000/admin/audit-actions", {
      withCredentials: true,
    });
    if (res.data.Status) setActions(res.data.Data);
  };

  /* ================= FETCH LOGS ================= */
  const fetchLogs = async () => {
    setLoading(true);

    try {
      const res = await axios.get("http://localhost:3000/admin/audit-logs", {
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
      <div className="mb-4">
        <h3 className="">
          <i className="bi bi-shield-check me-2"></i>
          Audit Trail
        </h3>
        <small className="text-muted">Monitor system activities and logs</small>
      </div>

      {/* ================= FILTER ================= */}
      <div className="card border shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">User</label>
              <select
                className="form-select"
                onChange={(e) =>
                  setFilters({ ...filters, user_id: e.target.value })
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

            <div className="col-md-2">
              <label className="form-label small fw-semibold">Action</label>
              <select
                className="form-select"
                onChange={(e) =>
                  setFilters({ ...filters, action: e.target.value })
                }
              >
                <option value="">All</option>
                {actions.map((a, i) => (
                  <option key={i}>{a.action}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold">Document</label>
              <input
                className="form-control"
                placeholder="DOC-001"
                onChange={(e) =>
                  setFilters({ ...filters, document_code: e.target.value })
                }
              />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold">From</label>
              <input
                type="date"
                className="form-control"
                onChange={(e) =>
                  setFilters({ ...filters, from_date: e.target.value })
                }
              />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold">To</label>
              <input
                type="date"
                className="form-control"
                onChange={(e) =>
                  setFilters({ ...filters, to_date: e.target.value })
                }
              />
            </div>

            <div className="col-md-1 d-grid">
              <button className="btn btn-danger" onClick={fetchLogs}>
                <i className="bi bi-search"></i>
              </button>
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
                          {new Date(log.created_at).toLocaleString()}
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
    </div>
  );
};

export default SuperAdminAuditTrail;
