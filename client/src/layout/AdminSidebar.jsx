import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = ({ collapsed, user }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const isActive = (path) => location.pathname === path;

  const isParentActive = (paths) =>
    paths.some((path) => location.pathname.startsWith(path));

  const activeParentStyle = {
    background: "#1e7239f9",
    color: "#ffffff",
    borderRadius: "8px",
  };

  return (
    <div
      className={` bg-success text-white d-flex flex-column p-3 ${
        collapsed ? "d-none d-md-flex" : ""
      }`}
      style={{ width: "250px", minHeight: "100vh" }}
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
        <li className="nav-item mb-2">
          <div
            onClick={() => toggleMenu("document")}
            className="nav-link d-flex justify-content-between align-items-center text-white position-relative"
            style={{
              cursor: "pointer",
              ...(isParentActive([
                "/admin/documents",
                "/admin/documents/shared",
                "/admin/documents/archived-deleted",
              ])
                ? activeParentStyle
                : {}),
            }}
          >
            <span>
              <i className="bi bi-files me-2"></i> Document
            </span>
            <i
              className={`bi ${
                openMenu === "document"
                  ? "bi-caret-down-fill text-white"
                  : "bi-caret-right-fill"
              }`}
            ></i>
          </div>

          <div
            style={{
              maxHeight: openMenu === "document" ? "300px" : "0px",
              overflow: "hidden",
              transition: "max-height 0.3s ease",
            }}
          >
            <ul className="nav flex-column ms-3 mt-1">
              <li className="nav-item mb-2 position-relative">
                {isActive("/department/document/upload") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/admin/documents"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Active Documents
                  {isActive("/admin/documents") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>

              <li className="nav-item mb-2 position-relative">
                {isActive("/admin/documents/archived-deleted") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/admin/documents/archived-deleted"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Archived/Deleted
                  {isActive("/admin/documents/archived-deleted") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>

              <li className="nav-item mb-2 position-relative">
                {isActive("/admin/documents/shared") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/admin/documents/shared"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Shared
                  {isActive("/admin/documents/shared") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Staff */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/admin/staff") && (
            <span className="active-indicator"></span>
          )}

          <Link
            to="/admin/staff"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-people me-2"></i>Staff
            {isActive("/admin/staff") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>

        {/* Partners */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/admin/staff") && (
            <span className="active-indicator"></span>
          )}

          <Link
            to="/admin/partners"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-link-45deg me-2"></i>Partners
            {isActive("/admin/partners") && (
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
                "/admin/document/cross-department-access",
                "/admin/document/delete",
                "/admin/document/restore",
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
                {isActive("/admin/document/cross-department-access") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/admin/document/cross-department-access"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Cross-Department Requests
                  {isActive("/admin/document/cross-department-access") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>

              <li className="nav-item mb-2 position-relative">
                {isActive("/admin/document/delete") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/admin/document/delete"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Delete Request
                  {isActive("/admin/document/delete") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>
              <li className="nav-item mb-2 position-relative">
                {isActive("/admin/document/restore") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/admin/document/restore"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Restore Request
                  {isActive("/admin/document/restore") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Support */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/admin/my-support-tickets") && (
            <span className="active-indicator"></span>
          )}
          <Link
            to="/admin/my-support-tickets"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-ticket-detailed me-2"></i>Tickets
            {isActive("/admin/my-support-tickets") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>

        {/* Program Team Lead */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/admin/program/team-lead") && (
            <span className="active-indicator"></span>
          )}
          <Link
            to="/admin/program/team-lead"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-people-fill me-2"></i>Team Lead
            {isActive("/admin/program/team-lead") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>

        {/* Audit Trait */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/admin/audit-trait") && (
            <span className="active-indicator"></span>
          )}
          <Link
            to="/admin/audit-trait"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-clipboard-data me-2"></i>Audit Trait
            {isActive("/admin/audit-trait") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>
      </ul>

      {/* Bottom */}
      <div className="mt-auto position-relative">
        {isActive("/admin/change-password") && (
          <span className="active-indicator"></span>
        )}

        <Link
          to="/admin/change-password"
          className="nav-link text-white d-flex align-items-center"
        >
          <i className="bi bi-gear-fill me-2"></i> Settings
          {isActive("/admin/change-password") && (
            <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
          )}
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
