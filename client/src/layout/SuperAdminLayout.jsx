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

  const toggleSidebar = () => setCollapsed(!collapsed);

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
    <div className="d-flex vh-100">
      <SuperAdminSidebar collapsed={collapsed} user={user} />

      <div className="flex-grow-1 d-flex flex-column">
        <SuperAdminTopbar
          toggleSidebar={toggleSidebar}
          user={user}
          ticketAlerts={ticketAlerts}
          loadingTicketAlerts={loadingTicketAlerts}
        />

        <div className="flex-grow-1 overflow-auto bg-light p-4">
          <Outlet context={{ user }} />
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

export default SuperAdminLayout;
