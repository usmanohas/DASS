import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/baseUrl";

const SuperAdminTopbar = ({
  toggleSidebar,
  user,
  ticketAlerts = [],
  loadingTicketAlerts,
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const cleanDate = dateString.split("T")[0];
    const [year, month, day] = cleanDate.split("-");
    return `${day}/${month}/${year}`;
  };

  const totalAlertCount = ticketAlerts.length;

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
    try {
      await axios.get(`${API_BASE_URL}/auth/logout`, {
        withCredentials: true,
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
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
            {/* Support ticket notification */}
            {(loadingTicketAlerts || ticketAlerts.length > 0) && (
              <>
                <li className="dropdown-header fw-semibold">
                  <i className="bi bi-bell me-2 text-dark fw-bold"></i>
                  Ticket Notification
                </li>

                {loadingTicketAlerts ? (
                  <li>
                    <span className="dropdown-item-text text-muted">
                      Loading...
                    </span>
                  </li>
                ) : (
                  <>
                    {ticketAlerts.slice(0, 3).map((ticket, index) => (
                      <React.Fragment key={ticket.id}>
                        <li className="px-3 py-3">
                          <div
                            className="small p-3 rounded"
                            style={{
                              borderLeft: "4px solid #dc3545",
                              background: "#f9fafb",
                            }}
                          >
                            {/* HEADER */}
                            <div className="fw-semibold mb-2 d-flex align-items-center">
                              <i className="bi bi-ticket-detailed me-2 text-danger"></i>
                              <span style={textWrapStyle}>
                                New Support Ticket
                              </span>
                            </div>

                            {/* SUBJECT */}
                            <div style={textWrapStyle}>
                              <strong>{ticket.subject}</strong>
                            </div>

                            {/* DESCRIPTION */}
                            <div
                              className="text-muted mt-1"
                              style={textWrapStyle}
                            >
                              {ticket.description?.substring(0, 80)}...
                            </div>

                            {/* SENDER */}
                            <div className="mt-2 small">
                              <i className="bi bi-person me-1"></i>
                              {ticket.full_name || "Unknown User"}
                            </div>

                            {/* META */}
                            <div className="text-muted mt-2 small d-flex align-items-center gap-2 flex-wrap">
                              <span>
                                <i className="bi bi-calendar me-1"></i>
                                {formatDate(ticket.created_at)}
                              </span>

                              <span className="badge bg-danger-subtle text-danger border">
                                {ticket.status}
                              </span>
                            </div>
                          </div>
                        </li>

                        {index !== ticketAlerts.length - 1 && (
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                        )}
                      </React.Fragment>
                    ))}

                    <li className="text-center py-2">
                      <Link
                        to="/superadmin/tickets"
                        className="btn btn-outline-dark btn-sm"
                      >
                        View Ticket <i className="bi bi-arrow-right"></i>
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}

            {/* EMPTY STATE */}
            {!loadingTicketAlerts && ticketAlerts.length === 0 && (
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
                <Link to="/superadmin/profile" className="dropdown-item">
                  <i className="bi bi-person me-2"></i>
                  Profile
                </Link>
              </li>

              <li>
                <Link
                  to="/superadmin/change-password"
                  className="dropdown-item"
                >
                  <i className="bi bi-lock me-2"></i>
                  Security
                </Link>
              </li>
              <li>
                <Link to="/superadmin/line-manager" className="dropdown-item">
                  <i className="bi bi-headset me-2"></i>
                  Line Manager / Support
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

export default SuperAdminTopbar;
