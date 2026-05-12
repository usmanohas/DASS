import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import StaffSidebar from "./StaffSidebar";
import StaffTopbar from "./StaffTopbar";

const StaffLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  // 🔐 access request alerts (from Cross-Department) 
  const [accessAlerts, setAccessAlerts] = useState([]);
  const [loadingAccessAlerts, setLoadingAccessAlerts] = useState(true);

    // 🔐 access request alerts (from Internal staff)
  const [internalAccessAlerts, setInternalAccessAlerts] = useState([]);
  const [loadingInternalAccessAlerts, setLoadingInternalAccessAlerts] = useState(true);

  const toggleSidebar = () => setCollapsed(!collapsed);

  /* ==========================
     FETCH USER
  ========================== */
  useEffect(() => {
    axios
      .get("http://localhost:3000/staff/user", {
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
        "http://localhost:3000/staff/document-access-notification/pending",
        { withCredentials: true }
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
        "http://localhost:3000/staff/document-internal-access-notification/pending",
        { withCredentials: true }
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
    <div className="d-flex vh-100">
      <StaffSidebar collapsed={collapsed} user={user} />
      <div className="flex-grow-1 d-flex flex-column">
        <StaffTopbar
          toggleSidebar={toggleSidebar}
          user={user}
          accessAlerts={accessAlerts}               
          loadingAccessAlerts={loadingAccessAlerts}
          accessInternalAlerts={internalAccessAlerts}               
          loadingInternalAccessAlerts={loadingInternalAccessAlerts} 
        />

        <div className="flex-grow-1 overflow-auto bg-light p-4">
          <Outlet context={{ user }} />
        </div>

        <footer className="bg-white text-center py-2 shadow-sm">
          <span className="text-muted">
           © {new Date().getFullYear()} NPHCDA Archive Document & Sharing System.
        All Rights Reserved.
          </span>
        </footer>
      </div>
    </div>
  );
};

export default StaffLayout;
