import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import FocalPersonSidebar from "./FocalPersonSidebar";
import FocalPersonTopbar from "./FocalPersonTopbar";

const FocalPersonLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  const [accessAlerts, setAccessAlerts] = useState([]);
  const [loadingAccessAlerts, setLoadingAccessAlerts] = useState(true);

  const [internalAccessAlerts, setInternalAccessAlerts] = useState([]);
  const [loadingInternalAccessAlerts, setLoadingInternalAccessAlerts] =
    useState(true);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  /* ================= USER ================= */
  useEffect(() => {
    axios
      .get("http://localhost:3000/department/user", {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.Status) {
          setUser(res.data.user);
          fetchAccessAlerts();
        }
      });
  }, []);

  /* ================= ALERTS ================= */
  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await axios.get(
        "http://localhost:3000/department/retention-alerts",
        { withCredentials: true },
      );
      if (res.data.Status) setAlerts(res.data.alerts || []);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAccessAlerts = async () => {
    setLoadingAccessAlerts(true);
    try {
      const res = await axios.get(
        "http://localhost:3000/department/document-access-notification/pending",
        { withCredentials: true },
      );
      if (res.data.Status) setAccessAlerts(res.data.data || []);
    } finally {
      setLoadingAccessAlerts(false);
    }
  };

  const fetchInternalAccessAlerts = async () => {
    setLoadingInternalAccessAlerts(true);
    try {
      const res = await axios.get(
        "http://localhost:3000/department/document-internal-access-notification/pending",
        { withCredentials: true },
      );
      if (res.data.Status) setInternalAccessAlerts(res.data.data || []);
    } finally {
      setLoadingInternalAccessAlerts(false);
    }
  };

  useEffect(() => {
    fetchAccessAlerts();
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
          background: "#0b8585",
          color: "#fff",
          minHeight: "100vh",
          position: "sticky",
          top: 0,
          boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
        }}
      >
        <FocalPersonSidebar collapsed={collapsed} user={user} />
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
          <FocalPersonTopbar
            toggleSidebar={toggleSidebar}
            user={user}
            alerts={alerts}
            loadingAlerts={loadingAlerts}
            accessAlerts={accessAlerts}
            loadingAccessAlerts={loadingAccessAlerts}
            accessInternalAlerts={internalAccessAlerts}
            loadingInternalAccessAlerts={loadingInternalAccessAlerts}
          />
        </div>

        {/* PAGE CONTENT */}
        <main className="overflow-auto bg-light"
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

export default FocalPersonLayout;
