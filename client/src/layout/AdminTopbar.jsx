import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/baseUrl";
import Swal from "sweetalert2";

const AdminTopbar = ({
  toggleSidebar,
  user,
  alerts = [],
  loadingAlerts,
  accessAlerts = [],
  loadingAccessAlerts,
  deleteAlerts = [],
  loadingDeleteAlerts,
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const cleanDate = dateString.split("T")[0];
    const [year, month, day] = cleanDate.split("-");
    return `${day}/${month}/${year}`;
  };

  //const alertCount = alerts.length;
  const totalAlertCount =
    alerts.length + accessAlerts.length + deleteAlerts.length;
  const displayedAlerts = alerts.slice(0, 3);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const firstName = user?.full_name ? user.full_name.split(" ")[0] : "User";

  /* 👤 USER INITIALS */
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.get(`${API_BASE_URL}/auth/logout`, {
        withCredentials: true,
      });

      await Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been logged out successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);

      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: "Unable to logout. Please try again.",
      });
    }
  };

  const textWrapStyle = {
    wordBreak: "break-word",
    whiteSpace: "normal",
    lineHeight: "1.4",
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-warning-subtle text-warning border";
      case "Approved":
        return "bg-success-subtle text-success border";
      case "Rejected":
        return "bg-danger-subtle text-danger border";
      default:
        return "bg-secondary-subtle text-secondary border";
    }
  };

  return (
    <nav className="navbar navbar-light bg-white shadow-sm px-4 py-2">
      {/* LEFT SECTION */}
      <div className="d-flex align-items-center">
        <button
          className="btn btn-outline-secondary me-3"
          onClick={toggleSidebar}
        >
          <i className="bi bi-list"></i>
        </button>

        <div>
          <div className="fw-semibold">{greeting}</div>
          <small className="text-muted">Welcome back, {firstName}</small>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="d-flex align-items-center ms-auto">
        {/* 🔔 ALERTS */}
        <div className="dropdown me-4">
          <div
            role="button"
            data-bs-toggle="dropdown"
            className="position-relative"
            style={{ cursor: "pointer" }}
          >
            <i className="bi bi-bell fs-5"></i>

            {totalAlertCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {totalAlertCount}
              </span>
            )}
          </div>
          <ul
            className="dropdown-menu dropdown-menu-end shadow border-0"
            style={{
              width: "380px",
              maxWidth: "95vw", // ✅ mobile responsive
              maxHeight: "500px",
              overflowY: "auto",
              paddingTop: "10px", // ✅ better scroll spacing
              paddingBottom: "10px",
              borderRadius: "12px",
            }}
          >
            {/* 🔐 DELETE REQUESTS */}
            {(loadingDeleteAlerts || deleteAlerts.length > 0) && (
              <>
                <li className="dropdown-header fw-semibold">
                  <i className="bi bi-trash me-2 text-dark fw-bold"></i>
                  Delete Document Notifications ({deleteAlerts.length})
                </li>

                {loadingDeleteAlerts ? (
                  <li>
                    <span className="dropdown-item-text text-muted">
                      Loading...
                    </span>
                  </li>
                ) : (
                  <>
                    {deleteAlerts.slice(0, 3).map((req, index) => (
                      <React.Fragment key={req.id}>
                        <li className="px-3 py-3">
                          <div
                            className="small p-3 rounded"
                            style={{
                              borderLeft: "4px solid #ff1522",
                              background: "#f9fafb",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#f1f5f9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "#f9fafb")
                            }
                          >
                            {/* DESCRIPTION */}
                            <div style={textWrapStyle}>
                              <span className="fw-semibold">
                                {req.requested_by}
                              </span>{" "}
                              <span className="text-muted">
                                ({req.department_name}-FP)
                              </span>{" "}
                              requested to delete{" "}
                              <strong>
                                <i className="bi bi-file-earmark-text me-1 text-secondary"></i>
                                {req.title}
                              </strong>
                            </div>

                            {/* META */}
                            <div className="text-muted mt-2 small d-flex align-items-center gap-2 flex-wrap">
                              <span>
                                <i className="bi bi-calendar me-1"></i>
                                {new Date(req.updated_at).toLocaleString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>

                              <span className="badge bg-warning-subtle text-warning border">
                                Pending
                              </span>
                            </div>
                          </div>
                        </li>
                      </React.Fragment>
                    ))}

                    <li className="text-center py-2">
                      <Link
                        to="/admin/document/delete"
                        className="btn btn-outline-dark btn-sm"
                      >
                        Review Requests <i className="bi bi-arrow-right"></i>
                      </Link>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                  </>
                )}
              </>
            )}

            {/* 🔐 EXTERNAL ACCESS REQUESTS */}
            {(loadingAccessAlerts || accessAlerts.length > 0) && (
              <>
                <li className="dropdown-header fw-semibold">
                  <i className="bi bi-diagram-3-fill me-2 text-dark fw-bold"></i>
                  Access Request Notifications ({accessAlerts.length})
                </li>

                {loadingAccessAlerts ? (
                  <li>
                    <span className="dropdown-item-text text-muted">
                      Loading...
                    </span>
                  </li>
                ) : (
                  <>
                    {accessAlerts.slice(0, 3).map((req, index) => (
                      <React.Fragment key={req.id}>
                        <li className="px-3 py-3">
                          <div
                            className="small p-3 rounded"
                            style={{
                              borderLeft: "4px solid #5cb874",
                              background: "#f9fafb",
                            }}
                          >
                            {/* DESCRIPTION */}
                            <div style={textWrapStyle}>
                              <span>{req.requested_by_name}</span> from{" "}
                              <span className="fw-semibold text-dark">
                                {req.requester_department}
                              </span>{" "}
                              has requested access to{" "}
                              <strong>{req.title}</strong>
                            </div>

                            {/* META */}
                            <div className="text-muted mt-2 small d-flex align-items-center gap-2 flex-wrap">
                              <span>
                                <i className="bi bi-calendar me-1"></i>
                                {new Date(req.created_at).toLocaleString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>

                              <span className="badge bg-warning-subtle text-warning border">
                                Pending
                              </span>
                            </div>
                          </div>
                        </li>

                        {index !== accessAlerts.length - 1 && (
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                        )}
                      </React.Fragment>
                    ))}

                    <li className="text-center py-2">
                      <Link
                        to="/admin/document/cross-department-access"
                        className="btn btn-outline-dark btn-sm"
                      >
                        Review Requests <i className="bi bi-arrow-right"></i>
                      </Link>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                  </>
                )}
              </>
            )}

            {/* 📁 RESTORE DOCUMMENT NOTIFICATIONS */}
            {(loadingAlerts || alerts.length > 0) && (
              <>
                <li className="dropdown-header fw-semibold">
                  <i className="bi bi-arrow-repeat me-2 text-dark fw-bold"></i>
                  Restore Notifications ({alerts.length})
                </li>

                {loadingAlerts ? (
                  <li>
                    <span className="dropdown-item-text text-muted">
                      Loading...
                    </span>
                  </li>
                ) : (
                  <>
                    {displayedAlerts.map((doc, index) => {
                      return (
                        <React.Fragment key={doc.id}>
                          <li className="px-3 py-3">
                            <div
                              className="small p-3 rounded"
                              style={{
                                borderLeft: "4px solid #2cd2d2",
                                background: "#f9fafb",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#f1f5f9")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "#f9fafb")
                              }
                            >
                              {/* DESCRIPTION */}
                              <div style={textWrapStyle}>
                                <span className="fw-semibold">
                                  {doc.requested_by}
                                </span>{" "}
                                <span className="text-muted">
                                  ({doc.department_name}-FP)
                                </span>{" "}
                                requested to restore{" "}
                                <strong>
                                  <i className="bi bi-file-earmark-text me-1 text-secondary"></i>
                                  {doc.title}
                                </strong>
                              </div>

                              {/* META */}
                              <div className="text-muted mt-2 small d-flex align-items-center gap-2 flex-wrap">
                                <span>
                                  <i className="bi bi-calendar me-1"></i>
                                  {new Date(doc.created_at).toLocaleString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>

                                <span
                                  className={`badge ${getStatusBadge(doc.status)}`}
                                >
                                  {doc.status}
                                </span>
                              </div>
                            </div>
                          </li>
                        </React.Fragment>
                      );
                    })}

                    <li className="text-center py-2">
                      <Link
                        to="/admin/document/restore"
                        className="btn btn-outline-dark btn-sm"
                      >
                        View More <i className="bi bi-arrow-right"></i>
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}

            {/* ❌ EMPTY STATE */}
            {!loadingAlerts &&
              !loadingAccessAlerts &&
              !loadingDeleteAlerts &&
              accessAlerts.length === 0 &&
              deleteAlerts.length === 0 &&
              alerts.length === 0 && (
                <li>
                  <span className="dropdown-item-text text-muted text-center">
                    No notifications available
                  </span>
                </li>
              )}
          </ul>
        </div>

        {/* 👤 USER AVATAR + LOGOUT */}
        <div className="d-flex align-items-center gap-3">
          {/* Avatar */}
          <div className="dropdown">
            <div
              role="button"
              data-bs-toggle="dropdown"
              title={user?.full_name}
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "38px",
                height: "38px",
                backgroundColor: "#25d366",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {initials}
            </div>

            <ul className="dropdown-menu dropdown-menu-end shadow">
              <li>
                <Link to="/admin/profile" className="dropdown-item">
                  <i className="bi bi-person me-2"></i>
                  Profile
                </Link>
              </li>

              <li>
                <Link to="/admin/change-password" className="dropdown-item">
                  <i className="bi bi-lock me-2"></i>
                  Security
                </Link>
              </li>
              <li>
                <Link to="/admin/line-manager" className="dropdown-item">
                  <i className="bi bi-headset me-2"></i>
                  Line Manager / Support
                </Link>
              </li>
              <li>
                <Link to="/admin/security-setting" className="dropdown-item">
                  <i className="bi bi-gear me-2"></i>
                  Security Setting
                </Link>
              </li>
            </ul>
          </div>

          {/* Logout */}
          <button className="btn" onClick={handleLogout}>
            <i className="bi bi-power fs-4" style={{ color: "#ff1522" }}></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminTopbar;
