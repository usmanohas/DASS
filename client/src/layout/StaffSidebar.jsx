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

  /* ================= MENU STYLE ================= */
  const menuItem = (active) => ({
  background: active ? "#f17713" : "transparent",
  borderLeft: active ? "4px solid #f7ac3c" : "4px solid transparent",
  borderRadius: "12px",
  transition: "all 0.25s ease",
  boxShadow: active
    ? "0 4px 12px rgba(239,108,0,0.35)"
    : "none",
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
      <div className="text-center  pb-3">
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
          to="/staff"
          style={menuItem(isActive("/staff"))}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-speedometer2"></i>
          </div>

          {!collapsed && (
            <>
              <span>Dashboard</span>

              {isActive("/staff") && (
                <span className="ms-auto badge text-success fw-normal rounded-pill bg-white">
                  Active
                </span>
              )}
            </>
          )}
        </Link>

        {/* ================= DOCUMENT ================= */}
        <Link
          to="/staff/document/workstream"
          style={menuItem(isActive("/staff/document/workstream"))}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-files"></i>
          </div>

          {!collapsed && <span>Document</span>}
        </Link>

        {/* ================= WORKSTREAM ================= */}
        <Link
          to="/staff/document/other_workstreams"
          style={menuItem(isActive("/staff/document/other_workstreams"))}
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
                "/staff/other-workstream/document/request",
                "/staff/access-requests",
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
                  to="/staff/access-requests"
                  className="submenu-link"
                >
                  Internal
                </Link>

                <Link
                  to="/staff/other-workstream/document/request"
                  className="submenu-link"
                >
                  Cross Department
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
                "/staff/staff-list",
                "/staff/staff-directory",
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
                <Link to="/staff/staff-list" className="submenu-link">
                  Department Only
                </Link>

                <Link
                  to="/staff/staff-directory"
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
          to="/staff/my-support-tickets"
          style={menuItem(isActive("/staff/my-support-tickets"))}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-ticket-detailed"></i>
          </div>

          {!collapsed && <span>Support Ticket</span>}
        </Link>

        {/* ================= PROGRAMS TEAM LEAD ================= */}
        <Link
          to="/staff/program/team-lead"
          style={menuItem(isActive("/staff/program/team-lead"))}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-people-fill"></i>
          </div>

          {!collapsed && <span>Program Team Lead</span>}
        </Link>
      </div>

      {/* ================= SETTINGS ================= */}
      <div className="pt-3 mt-3 border-top border-secondary border-opacity-25">
        <Link
          to="/staff/change-password"
          style={menuItem(
            isActive("/staff/change-password"),
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
            background: rgba(155, 12, 12, 0.06);
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

export default StaffSidebar;