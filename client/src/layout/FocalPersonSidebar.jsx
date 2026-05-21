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

  /* ================= MENU STYLE ================= */
  const menuItem = (active) => ({
    background: active ? "rgba(44,210,210,0.15)" : "transparent",
    borderLeft: active ? "4px solid #2cd2d2" : "4px solid transparent",
    borderRadius: "12px",
    transition: "all 0.25s ease",
  });

  const iconStyle = {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    flexShrink: 0,
  };

  const navItemClass =
    "d-flex align-items-center text-white text-decoration-none px-2 py-2 sidebar-link";

  const dropdownClass =
    "d-flex align-items-center text-white px-2 py-2 sidebar-link";

  return (
    <div
      className="d-flex flex-column text-white"
      style={{
        width: collapsed ? "82px" : "265px",
        transition: "all 0.3s ease",
        minHeight: "100vh",
        padding: "14px",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ================= BRAND ================= */}
      <div className="text-center  pb-3 border-bottom border-secondary border-opacity-25">
        <img
          src="/assets/images/logo.png"
          alt="logo"
          width={collapsed ? 38 : 54}
          className="mb-2"
        />

        {!collapsed && (
          <>
            <h5 className="fw-bold mt-2 mb-1 text-white">NPHCDA-DASS</h5>

            <small style={{color:"#badfdf" }}>
              <i className="bi bi-file-earmark-text me-1"></i>
              {user?.file_number}
            </small>
          </>
        )}
      </div>

      {/* ================= MENU ================= */}
      <div className="flex-grow-1 d-flex flex-column gap-1">
        {/* DASHBOARD */}
        <Link
          to="/"
          style={menuItem(isActive("/"))}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-speedometer2"></i>
          </div>

          {!collapsed && (
            <>
              <span>Dashboard</span>

              {isActive("/") && (
                <span className="ms-auto badge rounded-pill bg-info">
                  Active
                </span>
              )}
            </>
          )}
        </Link>

        {/* ================= DOCUMENT ================= */}
        <div>
          <div
            onClick={() => toggleMenu("document")}
            style={menuItem(
              isParentActive([
                "/department/document/upload",
                "/department/document/manage",
                "/department/document/archived-deleted",
              ]),
            )}
            className={dropdownClass}
            role="button"
          >
            <div style={iconStyle}>
              <i className="bi bi-files"></i>
            </div>

            {!collapsed && (
              <>
                <span>Document</span>

                <i
                  className={`bi ms-auto ${
                    openMenu === "document"
                      ? "bi-chevron-down"
                      : "bi-chevron-right"
                  }`}
                />
              </>
            )}
          </div>

          <div
            style={{
              maxHeight: openMenu === "document" && !collapsed ? "250px" : "0",
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
          >
            {!collapsed && (
              <div className="ms-5 mt-2 d-flex flex-column gap-2">
                <Link
                  to="/department/document/upload"
                  className="submenu-link"
                >
                  Upload
                </Link>

                <Link
                  to="/department/document/manage"
                  className="submenu-link"
                >
                  Manage
                </Link>

                <Link
                  to="/department/document/archived-deleted"
                  className="submenu-link"
                >
                  Archived / Deleted
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ================= WORKSTREAM ================= */}
        <Link
          to="/department/document/section"
          style={menuItem(isActive("/department/document/section"))}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-building"></i>
          </div>

          {!collapsed && <span>Inter-Departmental</span>}
        </Link>

        {/* ================= REQUESTS ================= */}
        <div>
          <div
            onClick={() => toggleMenu("request")}
            style={menuItem(
              isParentActive([
                "/department/access-requests",
                "/department/document/staff/department-access-requests",
                "/department/document/request",
              ]),
            )}
            className={dropdownClass}
            role="button"
          >
            <div style={iconStyle}>
              <i className="bi bi-shield-lock"></i>
            </div>

            {!collapsed && (
              <>
                <span>Requests</span>

                <i
                  className={`bi ms-auto ${
                    openMenu === "request"
                      ? "bi-chevron-down"
                      : "bi-chevron-right"
                  }`}
                />
              </>
            )}
          </div>

          <div
            style={{
              maxHeight: openMenu === "request" && !collapsed ? "250px" : "0",
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
          >
            {!collapsed && (
              <div className="ms-5 mt-2 d-flex flex-column gap-2">
                <Link
                  to="/department/access-requests"
                  className="submenu-link"
                >
                  Internal
                </Link>

                <Link
                  to="/department/document/staff/department-access-requests"
                  className="submenu-link"
                >
                  Cross Department
                </Link>

                <Link
                  to="/department/document/request"
                  className="submenu-link"
                >
                  My Requests
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ================= STAFF ================= */}
        <div>
          <div
            onClick={() => toggleMenu("staff")}
            style={menuItem(
              isParentActive([
                "/department/staff",
                "/department/staff-directory",
              ]),
            )}
            className={dropdownClass}
            role="button"
          >
            <div style={iconStyle}>
              <i className="bi bi-people"></i>
            </div>

            {!collapsed && (
              <>
                <span>Staff</span>

                <i
                  className={`bi ms-auto ${
                    openMenu === "staff"
                      ? "bi-chevron-down"
                      : "bi-chevron-right"
                  }`}
                />
              </>
            )}
          </div>

          <div
            style={{
              maxHeight: openMenu === "staff" && !collapsed ? "200px" : "0",
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
          >
            {!collapsed && (
              <div className="ms-5 mt-2 d-flex flex-column gap-2">
                <Link to="/department/staff" className="submenu-link">
                  Department Only
                </Link>

                <Link
                  to="/department/staff-directory"
                  className="submenu-link"
                >
                  All Department
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ================= TICKETS ================= */}
        <Link
          to="/department/my-support-tickets"
          style={menuItem(isActive("/department/my-support-tickets"))}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-ticket-detailed"></i>
          </div>

          {!collapsed && <span>Support Ticket</span>}
        </Link>

        {/* ================= PROGRAMS ================= */}
        <div>
          <div
            onClick={() => toggleMenu("program")}
            style={menuItem(isParentActive(["/department/programs"]))}
            className={dropdownClass}
            role="button"
          >
            <div style={iconStyle}>
              <i className="bi bi-droplet"></i>
            </div>

            {!collapsed && (
              <>
                <span>Programs</span>

                <i
                  className={`bi ms-auto ${
                    openMenu === "program"
                      ? "bi-chevron-down"
                      : "bi-chevron-right"
                  }`}
                />
              </>
            )}
          </div>

          <div
            style={{
              maxHeight: openMenu === "program" && !collapsed ? "200px" : "0",
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
          >
            {!collapsed && (
              <div className="ms-5 mt-2 d-flex flex-column gap-2">
                <Link to="/department/programs" className="submenu-link">
                  Manage Programs
                </Link>

                <Link
                  to="/department/programs/assigned"
                  className="submenu-link"
                >
                  Team Lead
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= SETTINGS ================= */}
      <div className="pt-3 mt-3 border-top border-secondary border-opacity-25">
        <Link
          to="/department/user/change-password"
          style={menuItem(
            isActive("/department/user/change-password"),
          )}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-gear"></i>
          </div>

          {!collapsed && <span>Settings</span>}
        </Link>
      </div>

      {/* ================= CUSTOM CSS ================= */}
      <style>
        {`
          .sidebar-link {
            transition: all 0.25s ease;
            border-radius: 12px;
            cursor: pointer;
          }

          .sidebar-link:hover {
            background: rgba(255,255,255,0.06);
            transform: translateX(2px);
          }

          .submenu-link {
            color: rgba(255,255,255,0.75);
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.2s ease;
            padding: 6px 10px;
            border-radius: 8px;
          }

          .submenu-link:hover {
            color: #ffffff;
            padding-left: 14px;
          }
        `}
      </style>
    </div>
  );
};

export default FocalPersonSidebar;