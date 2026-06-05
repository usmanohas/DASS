import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../../config/baseUrl";

const SuperAdminDocumentTracker = () => {
  const { documentCode } = useParams();
  const [showUsers, setShowUsers] = useState(true);
  const [selectedAction, setSelectedAction] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchTracker();
  }, []);

  const fetchTracker = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/superadmin/document-tracker`,
        {
          params: {
            document_code: documentCode,
          },
          withCredentials: true,
        },
      );

      if (res.data.Status) {
        setLogs(res.data.Data);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const uniqueUsers = [...new Map(logs.map((x) => [x.user_id, x])).values()];

  const availableActions = ["ALL", ...new Set(logs.map((x) => x.action))];

  const filteredLogs =
    selectedAction === "ALL"
      ? logs
      : logs.filter((x) => x.action === selectedAction);

  const actionBadge = (action) => {
    switch (action) {
      case "CREATE":
        return "bg-success";

      case "UPDATE":
        return "bg-warning text-dark";

      case "DELETE":
        return "bg-danger";

      case "DOWNLOAD":
        return "bg-primary";

      case "RESTORE":
        return "bg-info text-dark";

      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h3 className="fw-bold mb-1">
              <i className="bi bi-file-earmark-bar-graph me-2"></i>
              Document Tracker
            </h3>

            <div className="text-muted">
              Complete activity history for a document
            </div>
          </div>
        </div>

        <hr />

        <div className="row g-3">
          <div className="col-md-7">
            <small className="text-muted d-block">DOCUMENT TITLE</small>

            <div className=" fs-5">{logs[0]?.title}</div>
          </div>

          <div className="col-md-5">
            <small className="text-muted d-block">DOCUMENT CODE</small>

            <div className="">{logs[0]?.document_code}</div>
          </div>
        </div>
      </div>

      {!loading && logs.length > 0 && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <small className="text-muted">Total Activities</small>

                  <h3 className="mb-0">{filteredLogs.length}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <small className="text-muted">Users Involved</small>

                  <h3 className="mb-0">{uniqueUsers.length}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <small className="text-muted">Latest Activity</small>

                  <h5 className="mb-0">{logs[0]?.action}</h5>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div
              className="card-header bg-white d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => setShowUsers(!showUsers)}
            >
              <div>
                <i className="bi bi-people me-2"></i>
                Users Who Interacted
              </div>

              <i
                className={`bi ${
                  showUsers ? "bi-chevron-up" : "bi-chevron-down"
                }`}
              />
            </div>

            {showUsers && (
              <div className="card-body">
                {uniqueUsers.map((user) => (
                  <span
                    key={user.user_id}
                    className="badge bg-light border text-secondary me-2 mb-2 px-3 py-2"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user.full_name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {availableActions.map((action) => (
                  <button
                    key={action}
                    className={`btn btn-sm ${
                      selectedAction === action
                        ? "btn-dark"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setSelectedAction(action)}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-4"><i className="bi bi-activity me-2"></i>Activity Timeline</h6>

              {filteredLogs.map((log) => (
                <div key={log.id} className="position-relative ps-4 mb-4">
                  <div
                    className="position-absolute top-0 start-0 bg-success-subtle rounded-circle"
                    style={{
                      width: "12px",
                      height: "12px",
                      marginTop: "8px",
                    }}
                  />

                  <div className="card border shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="badge bg-dark-subtle text-dark py-2 px-2">
                            {log.action}
                          </span>

                          <div className="fw-semibold mt-2">
                            {log.full_name}
                          </div>

                          <small className="text-muted">{log.role_name}</small>
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

                      <div className="mt-3">{log.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminDocumentTracker;
