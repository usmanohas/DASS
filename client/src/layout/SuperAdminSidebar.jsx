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

  /* ================= MENU STYLE ================= */
  const menuItem = (active) => ({
    background: active ? "#50a16af9" : "transparent",
    borderLeft: active ? "4px solid #fff" : "4px solid transparent",
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

            <small style={{ color: "#badfdf" }}>
              <i className="bi bi-file-earmark-text me-1"></i>
              {user?.file_number}
            </small>
          </>
        )}
      </div>

      {/* ================= MENU ================= */}
      <div className="flex-grow-1 d-flex flex-column gap-1">
        {/* DASHBOARD */}
        <Link to="/" style={menuItem(isActive("/"))} className={navItemClass}>
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

        {/* ================= ACCOUNT ================= */}
        <div>
          <div
            onClick={() => toggleMenu("account")}
            style={menuItem(
              isParentActive([
                "/superadmin/account/admin",
                "/superadmin/account/focal-person",
                "/superadmin/account/staff",
                "/superadmin/account/partner",
              ]),
            )}
            className={dropdownClass}
            role="button"
          >
            <div style={iconStyle}>
              <i className="bi bi-person-plus"></i>
            </div>

            {!collapsed && (
              <>
                <span>Account</span>

                <i
                  className={`bi ms-auto ${
                    openMenu === "account"
                      ? "bi-chevron-down"
                      : "bi-chevron-right"
                  }`}
                />
              </>
            )}
          </div>

          <div
            style={{
              maxHeight: openMenu === "account" && !collapsed ? "200px" : "0",
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
          >
            {!collapsed && (
              <div className="ms-5 mt-2 d-flex flex-column gap-2">
                <Link to="/superadmin/account/admin" className="submenu-link">
                  Admin
                </Link>

                <Link
                  to="/superadmin/account/focal-person"
                  className="submenu-link"
                >
                  Focal Person
                </Link>

                <Link to="/superadmin/account/staff" className="submenu-link">
                  Staff
                </Link>

                <Link to="/superadmin/account/partner" className="submenu-link">
                  Partner
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ================= DEPARTMENT ================= */}
        <Link
          to="/superadmin/department"
          style={menuItem(isActive("/superadmin/department"))}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-building"></i>
          </div>

          {!collapsed && <span>Department</span>}
        </Link>

        {/* ================= TICKETS ================= */}
        <Link
          to="/superadmin/tickets"
          style={menuItem(isActive("/superadmin/tickets"))}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-ticket-detailed"></i>
          </div>

          {!collapsed && <span>Support Ticket</span>}
        </Link>

        {/* ================= SUPPORT CONTACT ================= */}
        <Link
          to="/superadmin/support-contact"
          style={menuItem(isActive("/superadmin/support-contact"))}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-headset"></i>
          </div>

          {!collapsed && <span>Support Contact</span>}
        </Link>

        {/* ================= AUDIT TRAIT ================= */}
        <Link
          to="/superadmin/audit-trait"
          style={menuItem(isActive("/superadmin/audit-trait"))}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-clipboard-data"></i>
          </div>

          {!collapsed && <span>Audit Trait</span>}
        </Link>

        {/* ================= STORAGE ALLOCATION ================= */}
        <Link
          to="/superadmin/system-storage"
          style={menuItem(isActive("/superadmin/system-storage"))}
          className={navItemClass}
        >
          <div style={iconStyle}>
            <i className="bi bi-database-fill-gear"></i>
          </div>

          {!collapsed && <span>Storage</span>} 
        </Link>
      </div>

      {/* ================= SETTINGS ================= */}
      <div className="pt-3 mt-3 border-top border-secondary border-opacity-25">
        <Link
          to="/superadmin/change-password"
          style={menuItem(isActive("/superadmin/change-password"))}
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

export default SuperAdminSidebar;
