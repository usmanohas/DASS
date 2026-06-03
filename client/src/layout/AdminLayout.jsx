import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  // 🔔 restore alerts
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // 🔐 access request alerts (from Cross-Department)
  const [accessAlerts, setAccessAlerts] = useState([]);
  const [loadingAccessAlerts, setLoadingAccessAlerts] = useState(true);

  // 🔐 delete request alerts
  const [deleteAlerts, setDeleteAlerts] = useState([]);
  const [loadingDeleteAlerts, setLoadingDeleteAlerts] = useState(true);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  /* ==========================
     FETCH USER
  ========================== */
  useEffect(() => {
    axios
      .get("http://localhost:3000/admin/user", {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.Status) {
          setUser(res.data.user);

          // ✅ fetch access alerts AFTER user
          fetchAccessAlerts();
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
      });
  }, []);

  /* ==========================
     FETCH RESTORE ALERTS
  ========================== */
  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);

      const res = await axios.get(
        "http://localhost:3000/admin/restore-alerts",
        { withCredentials: true },
      );

      if (res.data.Status) {
        setAlerts(res.data.alerts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  /* ==========================
     FETCH ACCESS ALERTS (NEW)
  ========================== */
  const fetchAccessAlerts = async () => {
    try {
      setLoadingAccessAlerts(true);

      const res = await axios.get(
        "http://localhost:3000/admin/document-access-notification/pending",
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
     FETCH DELETE REQUEST ALERTS
  ========================== */
  const fetchDeleteAlerts = async () => {
    try {
      setLoadingDeleteAlerts(true);

      const res = await axios.get(
        "http://localhost:3000/admin/delete-notification/pending",
        { withCredentials: true },
      );

      if (res.data.Status) {
        setDeleteAlerts(res.data.alerts || []);
      }
    } catch (err) {
      console.error("Delete alerts error:", err);
    } finally {
      setLoadingDeleteAlerts(false);
    }
  };

  useEffect(() => {
    fetchDeleteAlerts();
  }, []);

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", background: "#f4f6fb" }}
    >
      {/* ================= SIDEBAR ================= */}
      <aside
        className="bg-success"
        style={{
          width: collapsed ? "80px" : "260px",
          transition: "all 0.25s ease",
          color: "#fff",
          minHeight: "100vh",
          position: "sticky",
          top: 0,
          boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
        }}
      >
        <AdminSidebar collapsed={collapsed} user={user} />
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
          
          <AdminTopbar
            toggleSidebar={toggleSidebar}
            user={user}
            alerts={alerts}
            loadingAlerts={loadingAlerts}
            accessAlerts={accessAlerts}
            loadingAccessAlerts={loadingAccessAlerts}
            deleteAlerts={deleteAlerts}
            loadingDeleteAlerts={loadingDeleteAlerts}
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
          <Outlet context={{ user, refreshAlerts: fetchAlerts }} />
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

export default AdminLayout;
