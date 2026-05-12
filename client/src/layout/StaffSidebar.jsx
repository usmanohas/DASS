import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const StaffSidebar = ({ collapsed, user }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const isActive = (path) => location.pathname === path;

  const isParentActive = (paths) =>
    paths.some((path) => location.pathname.startsWith(path));

  const activeParentStyle = {
    background: "#ffd6a5",
    color: "#ffffff",
    borderRadius: "8px",
  };

  return (
    <div
      className={`text-white d-flex flex-column p-3 ${
        collapsed ? "d-none d-md-flex" : ""
      }`}
      style={{ width: "250px", minHeight: "100vh", backgroundColor: "#ef6c00" }}
    >
      {/* Logo */}
      <div className="text-center mb-4">
        <img src="/assets/images/logo.png" alt="logo" width={50} />
        <h5 className="fw-bold">NPHCDA-DASS</h5>
        <small>
          <i className="bi bi-file-earmark-text me-1"></i>
          {user?.file_number}
        </small>
      </div>

      {/* Navigation */}
      <ul className="nav flex-column mb-auto">
        {/* Dashboard */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/") && <span className="active-indicator"></span>}

          <Link
            to="/"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
            {isActive("/") && (
              <i className="bi bi-dot ms-auto text-warning"></i>
            )}
          </Link>
        </li>

        {/* Document */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/staff/document/workstream") && (
            <span className="active-indicator"></span>
          )}
          <Link
            to="/staff/document/workstream"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-files me-2"></i>Documents
            {isActive("/staff/document/workstream") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>

        {/* Other Workstream */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/staff/document/other_workstreams") && (
            <span className="active-indicator"></span>
          )}
          <Link
            to="/staff/document/other_workstreams"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-diagram-3 me-2"></i>Workstream
            {isActive("/staff/document/other_workstreams") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>

        {/* Document Access Request */}
        <li className="nav-item mb-2">
          <div
            onClick={() => toggleMenu("request")}
            className="nav-link d-flex justify-content-between align-items-center text-white"
            style={{
              cursor: "pointer",
              ...(isParentActive([
                "/staff/other-workstream/document/request",
                "/staff/access-requests",
              ])
                ? activeParentStyle
                : {}),
            }}
          >
            <span>
              <i className="bi bi-shield-lock me-2"></i>Requests
            </span>
            <i
              className={`bi ${
                openMenu === "request"
                  ? "bi-caret-down-fill text-white"
                  : "bi-caret-right-fill"
              }`}
            ></i>
          </div>

          <div
            style={{
              maxHeight: openMenu === "request" ? "300px" : "0px",
              overflow: "hidden",
              transition: "max-height 0.3s ease",
            }}
          >
            <ul className="nav flex-column ms-3 mt-1">
              <li className="nav-item mb-2 position-relative">
                {isActive("/staff/access-requests") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/staff/access-requests"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Internal Requests
                  {isActive("/staff/access-requests") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>

              <li className="nav-item mb-2 position-relative">
                {isActive("/staff/other-workstream/document/request") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/staff/other-workstream/document/request"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Cross-Department Requests
                  {isActive("/staff/other-workstream/document/request") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Staff */}
        <li className="nav-item mb-2">
          <div
            onClick={() => toggleMenu("staff")}
            className="nav-link d-flex justify-content-between align-items-center text-white"
            style={{
              cursor: "pointer",
              ...(isParentActive([
                "/staff/staff-list",
                "/staff/staff-directory",
              ])
                ? activeParentStyle
                : {}),
            }}
          >
            <span>
              <i className="bi bi-people me-2"></i> Staff
            </span>
            <i
              className={`bi ${
                openMenu === "staff"
                  ? "bi-caret-down-fill text-white"
                  : "bi-caret-right-fill"
              }`}
            ></i>
          </div>

          <div
            style={{
              maxHeight: openMenu === "staff" ? "300px" : "0px",
              overflow: "hidden",
              transition: "max-height 0.3s ease",
            }}
          >
            <ul className="nav flex-column ms-3 mt-1">
              <li className="nav-item mb-2 position-relative">
                {isActive("/staff/staff-list") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/staff/staff-list"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Department Staff
                  {isActive("/staff/staff-list") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>

              <li className="nav-item mb-2 position-relative">
                {isActive("/staff/staff-directory") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/staff/staff-directory"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Staff Directory
                  {isActive("/staff/staff-directory") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Support */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/staff/my-support-tickets") && (
            <span className="active-indicator"></span>
          )}
          <Link
            to="/staff/my-support-tickets"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-ticket-detailed me-2"></i>Tickets
            {isActive("/staff/my-support-tickets") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>

        {/* Program Team Lead */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/staff/program/team-lead") && (
            <span className="active-indicator"></span>
          )}
          <Link
            to="/staff/program/team-lead"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-people-fill me-2"></i>Team Lead
            {isActive("/staff/program/team-lead") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>
      </ul>

      {/* Bottom */}
      <div className="mt-auto position-relative">
        {isActive("/staff/change-password") && (
          <span className="active-indicator"></span>
        )}

        <Link
          to="/staff/change-password"
          className="nav-link text-white d-flex align-items-center"
        >
          <i className="bi bi-gear-fill me-2"></i> Settings
          {isActive("/staff/change-password") && (
            <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
          )}
        </Link>
      </div>
    </div>
  );
};

export default StaffSidebar;
