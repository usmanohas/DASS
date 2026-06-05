import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import StaffSidebar from "./StaffSidebar";
import StaffTopbar from "./StaffTopbar";
import API_BASE_URL from "../config/baseUrl";

const StaffLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  // 🔐 access request alerts (from Cross-Department)
  const [accessAlerts, setAccessAlerts] = useState([]);
  const [loadingAccessAlerts, setLoadingAccessAlerts] = useState(true);

  // 🔐 access request alerts (from Internal staff)
  const [internalAccessAlerts, setInternalAccessAlerts] = useState([]);
  const [loadingInternalAccessAlerts, setLoadingInternalAccessAlerts] =
    useState(true);

  const toggleSidebar = () => setCollapsed(!collapsed);

  /* ==========================
     FETCH USER
  ========================== */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/staff/user`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.Status) {
          setUser(res.data.user);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
      });
  }, []);

  /* ==========================
     FETCH ACCESS ALERTS (NEW)
  ========================== */
  const fetchAccessAlerts = async () => {
    try {
      setLoadingAccessAlerts(true);

      const res = await axios.get(
        `${API_BASE_URL}/staff/document-access-notification/pending`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setAccessAlerts(res.data.data || []);
      }
    } catch (err) {
      console.error("Access alerts error:", err);
    } finally {
      setLoadingAccessAlerts(false);
    }
  };

  useEffect(() => {
    fetchAccessAlerts();
  }, []);

  /* ==========================
     FETCH INTERNAL ACCESS REQUEST ALERTS
  ========================== */
  const fetchInternalAccessAlerts = async () => {
    try {
      setLoadingInternalAccessAlerts(true);

      const res = await axios.get(
        `${API_BASE_URL}/staff/document-internal-access-notification/pending`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setInternalAccessAlerts(res.data.data || []);
      }
    } catch (err) {
      console.error("Access alerts error:", err);
    } finally {
      setLoadingInternalAccessAlerts(false);
    }
  };

  useEffect(() => {
    fetchInternalAccessAlerts();
  }, []);

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", background: "#f4f6fb" }}
    >
      {/* ================= SIDEBAR ================= */}
      <aside
        style={{
          width: collapsed ? "80px" : "260px",
          transition: "all 0.25s ease",
          background: "#ef6c00",
          color: "#fff",
          minHeight: "100vh",
          position: "sticky",
          top: 0,
          boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
        }}
      >
        <StaffSidebar collapsed={collapsed} user={user} />
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* TOPBAR */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            backdropFilter: "blur(10px)",
            background: "rgba(255,255,255,0.85)",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <StaffTopbar
            toggleSidebar={toggleSidebar}
            user={user}
            accessAlerts={accessAlerts}
            loadingAccessAlerts={loadingAccessAlerts}
            accessInternalAlerts={internalAccessAlerts}
            loadingInternalAccessAlerts={loadingInternalAccessAlerts}
          />
        </div>

        {/* PAGE CONTENT */}
        <main
          className="overflow-auto bg-light"
          style={{
            flexGrow: 1,
            padding: "24px",
          }}
        >
          <Outlet context={{ user }} />
        </main>

        {/* FOOTER */}
        <footer
          style={{
            padding: "12px",
            textAlign: "center",
            borderTop: "1px solid #eee",
            background: "#f8f9fa",
          }}
        >
          <small className="text-secondary">
            © {new Date().getFullYear()} NPHCDA-DASS
          </small>
        </footer>
      </div>
    </div>
  );
};

export default StaffLayout;
