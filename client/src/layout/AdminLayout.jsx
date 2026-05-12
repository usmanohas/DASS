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
  const [loadingDeleteAlerts, setLoadingDeleteAlerts] =
    useState(true);

  const toggleSidebar = () => setCollapsed(!collapsed);

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
    <div className="d-flex vh-100">
      <AdminSidebar collapsed={collapsed} user={user} />

      <div className="flex-grow-1 d-flex flex-column">
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

        <div className="flex-grow-1 overflow-auto bg-light p-4">
          <Outlet context={{ user, refreshAlerts: fetchAlerts }} />
        </div>

        <footer className="bg-white text-center py-2 shadow-sm">
          <span className="text-muted">
            © {new Date().getFullYear()} NPHCDA Archive Document & Sharing
            System.
          </span>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
