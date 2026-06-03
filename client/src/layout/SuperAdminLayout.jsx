import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminTopbar from "./SuperAdminTopbar";

const SuperAdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  // 🔐 support ticket alerts
  const [ticketAlerts, setTicketAlerts] = useState([]);
  const [loadingTicketAlerts, setLoadingTicketAlerts] = useState(true);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  /* ==========================
     FETCH USER
  ========================== */
  useEffect(() => {
    axios
      .get("http://localhost:3000/superadmin/user", {
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
       FETCH open Ticket ALERTS
    ========================== */
  const fetchTicketAlerts = async () => {
    try {
      setLoadingTicketAlerts(true);

      const res = await axios.get(
        "http://localhost:3000/superadmin/ticket-notification/open",
        { withCredentials: true },
      );

      if (res.data.Status) {
        setTicketAlerts(res.data.data || []);
      }
    } catch (err) {
      console.error("Support ticket alerts error:", err);
    } finally {
      setLoadingTicketAlerts(false);
    }
  };

  useEffect(() => {
    fetchTicketAlerts();
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
        <SuperAdminSidebar collapsed={collapsed} user={user} />
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
          <SuperAdminTopbar
            toggleSidebar={toggleSidebar}
            user={user}
            ticketAlerts={ticketAlerts}
            loadingTicketAlerts={loadingTicketAlerts}
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

export default SuperAdminLayout;
