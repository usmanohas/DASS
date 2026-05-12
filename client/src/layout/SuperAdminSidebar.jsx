import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SuperAdminSidebar = ({ collapsed, user }) => {
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

        {/* Account */}
        <li className="nav-item mb-2">
          <div
            onClick={() => toggleMenu("document")}
            className="nav-link d-flex justify-content-between align-items-center text-white position-relative"
            style={{
              cursor: "pointer",
              ...(isParentActive([
                "/superadmin/account/admin",
                "/superadmin/account/focal-person",
                "/superadmin/account/staff",
                "/superadmin/account/partner",
              ])
                ? activeParentStyle
                : {}),
            }}
          >
            <span>
              <i className="bi bi-person-plus me-2"></i> Account
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
                {isActive("/superadmin/account/admin") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/superadmin/account/admin"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Admin
                  {isActive("/superadmin/account/admin") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>

              <li className="nav-item mb-2 position-relative">
                {isActive("/superadmin/account/focal-person") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/superadmin/account/focal-person"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Focal Person
                  {isActive("/superadmin/account/focal-person") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>

              <li className="nav-item mb-2 position-relative">
                {isActive("/superadmin/account/staff") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/superadmin/account/staff"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Staff
                  {isActive("/superadmin/account/staff") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>
              <li className="nav-item mb-2 position-relative">
                {isActive("/superadmin/account/partner") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/superadmin/account/partner"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Partner
                  {isActive("/superadmin/account/partner") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Department */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/superadmin/department") && (
            <span className="active-indicator"></span>
          )}

          <Link
            to="/superadmin/department"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-diagram-3 me-2"></i>Department
            {isActive("/superadmin/department") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>

        {/* Support */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/superadmin/tickets") && (
            <span className="active-indicator"></span>
          )}
          <Link
            to="/superadmin/tickets"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-ticket-detailed me-2"></i>Tickets
            {isActive("/superadmin/tickets") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>

        {/* Support Contact */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/superadmin/support-contact") && (
            <span className="active-indicator"></span>
          )}
          <Link
            to="/superadmin/support-contact"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-headset me-2"></i>Support Contact
            {isActive("/superadmin/support-contact") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>

        {/* Audit Trait */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/superadmin/audit-trait") && (
            <span className="active-indicator"></span>
          )}
          <Link
            to="/superadmin/audit-trait"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-clipboard-data me-2"></i>Audit Trait
            {isActive("/superadmin/audit-trait") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>
      </ul>

      {/* Bottom */}
      <div className="mt-auto position-relative">
        {isActive("/superadmin/change-password") && (
          <span className="active-indicator"></span>
        )}

        <Link
          to="/superadmin/change-password"
          className="nav-link text-white d-flex align-items-center"
        >
          <i className="bi bi-gear-fill me-2"></i> Settings
          {isActive("/superadmin/change-password") && (
            <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
          )}
        </Link>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;
