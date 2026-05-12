import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const FocalPersonSidebar = ({ collapsed, user }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const isActive = (path) => location.pathname === path;

  const isParentActive = (paths) =>
    paths.some((path) => location.pathname.startsWith(path));

  const activeParentStyle = {
    background: "#2cd2d2",
    color: "#ffffff",
    borderRadius: "8px",
  };

  return (
    <div
      className={`text-white d-flex flex-column p-3 ${
        collapsed ? "d-none d-md-flex" : ""
      }`}
      style={{ width: "250px", minHeight: "100vh", backgroundColor: "#00c2c1" }}
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
                "/department/document/upload",
                "/department/document/manage",
                "/department/document/archived-deleted",
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
                  to="/department/document/upload"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Upload
                  {isActive("/department/document/upload") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>
              <li className="nav-item mb-2 position-relative">
                {isActive("/department/document/manage") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/department/document/manage"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Manage Document
                  {isActive("/department/document/manage") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>
              <li className="nav-item mb-2 position-relative">
                {isActive("/department/document/archived-deleted") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/department/document/archived-deleted"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Archived/Deleted
                  {isActive("/department/document/archived-deleted") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Other Workstream */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/department/document/section") && (
            <span className="active-indicator"></span>
          )}

          <Link
            to="/department/document/section"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-diagram-3 me-2"></i>Workstream
            {isActive("/department/document/section") && (
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
                "/department/document/staff/department-access-requests",
                "/department/access-requests",
                "/department/my-requests",
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
                {isActive("/department/access-requests") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/department/access-requests"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Internal Requests
                  {isActive("/department/access-requests") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>

              <li className="nav-item mb-2 position-relative">
                {isActive(
                  "/department/document/staff/department-access-requests",
                ) && <span className="active-indicator"></span>}

                <Link
                  to="/department/document/staff/department-access-requests"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Cross-Department Requests
                  {isActive(
                    "/department/document/staff/department-access-requests",
                  ) && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>

              <li className="nav-item mb-2 position-relative">
                {isActive("/department/document/request") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/department/document/request"
                  className="nav-link text-white d-flex align-items-center"
                >
                  My Request
                  {isActive("/department/document/request") && (
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
                "/department/staff",
                "/department/staff-directory",
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
                {isActive("/department/staff") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/department/staff"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Department Staff
                  {isActive("/department/staff") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>

              <li className="nav-item mb-2 position-relative">
                {isActive("/department/staff-directory") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/department/staff-directory"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Staff Directory
                  {isActive("/department/staff-directory") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Support */}
        <li className="nav-item mb-2 position-relative">
          {isActive("/department/my-support-tickets") && (
            <span className="active-indicator"></span>
          )}
          <Link
            to="/department/my-support-tickets"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-ticket-detailed me-2"></i>Tickets
            {isActive("/department/my-support-tickets") && (
              <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
            )}
          </Link>
        </li>

        {/* Programs / Campaigns */}
        <li className="nav-item mb-2">
          <div
            onClick={() => toggleMenu("program")}
            className="nav-link d-flex justify-content-between align-items-center text-white"
            style={{
              cursor: "pointer",
              ...(isParentActive([
                "/department/programs",
                "/department/programs/assigned",
              ])
                ? activeParentStyle
                : {}),
            }}
          >
            <span>
              <i className="bi bi-droplet  me-2"></i> Programs
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
              maxHeight: openMenu === "program" ? "300px" : "0px",
              overflow: "hidden",
              transition: "max-height 0.3s ease",
            }}
          >
            <ul className="nav flex-column ms-3 mt-1">
              <li className="nav-item mb-2 position-relative">
                {isActive("/department/programs") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/department/programs"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Manage Programs
                  {isActive("/department/programs") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>

              <li className="nav-item mb-2 position-relative">
                {isActive("/department/programs/assigned") && (
                  <span className="active-indicator"></span>
                )}

                <Link
                  to="/department/programs/assigned"
                  className="nav-link text-white d-flex align-items-center"
                >
                  Team Lead
                  {isActive("/department/programs/assigned") && (
                    <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </li>
      </ul>

      {/* Bottom */}
      <div className="mt-auto position-relative">
        {isActive("/department/change-password") && (
          <span className="active-indicator"></span>
        )}

        <Link
          to="/department/change-password"
          className="nav-link text-white d-flex align-items-center"
        >
          <i className="bi bi-gear-fill me-2"></i> Settings
          {isActive("/department/change-password") && (
            <i className="bi bi-check-circle-fill ms-auto text-warning"></i>
          )}
        </Link>
      </div>
    </div>
  );
};

export default FocalPersonSidebar;
