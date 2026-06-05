import React from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/baseUrl";

const PartnerLayout = () => {
  const navigate = useNavigate();

  // 👉 Replace with real user from context/localStorage/API
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
    role: "partner", // or "admin"
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${API_BASE_URL}/auth/logout`, {
        withCredentials: true,
      });
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isAdmin = user.role === "admin";

  return (
    <>
      <style>{`
        body {
          background: #f4f6f9;
        }

        .navbar-custom {
          background: linear-gradient(135deg, #0f766e, #0d9488);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .nav-link {
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link:hover {
          opacity: 0.85;
        }

        .active-link {
          color: #fff !important;
        }

        .active-icon {
          color: #ffd700 !important;
        }

        @media (max-width: 991px) {
          .navbar-collapse {
            background: rgba(0,0,0,0.15);
            padding: 15px;
            border-radius: 10px;
            margin-top: 10px;
          }
        }
      `}</style>

      <div className="d-flex flex-column min-vh-100">
        {/* ================= NAVBAR ================= */}
        <nav className="navbar navbar-expand-lg navbar-dark navbar-custom px-3">
          <div className="container-fluid">
            {/* BRAND */}
            <NavLink
              className="navbar-brand fw-bold d-flex align-items-center"
              to="/partner"
            >
              <img
                src="/assets/images/logo.png"
                alt="Logo"
                style={{ height: "38px", marginRight: "10px" }}
              />
              <span className="text-uppercase">NPHCDA-DASS</span>
            </NavLink>

            {/* MOBILE TOGGLER */}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarContent"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarContent">
              {/* LEFT MENU */}
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <NavLink
                    to="/partner"
                    end
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active-link" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <i
                          className={`bi bi-speedometer2 ${isActive ? "active-icon" : ""}`}
                        ></i>
                        Dashboard
                      </>
                    )}
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/partner/documents"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active-link" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <i
                          className={`bi bi-files ${isActive ? "active-icon" : ""}`}
                        ></i>
                        My Documents
                      </>
                    )}
                  </NavLink>
                </li>
                                <li className="nav-item">
                  <NavLink
                    to="/partner/support-ticket"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active-link" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <i
                          className={`bi bi-ticket ${isActive ? "active-icon" : ""}`}
                        ></i>
                        Support Ticket
                      </>
                    )}
                  </NavLink>
                </li>
              </ul>

              {/* RIGHT SIDE */}
              <ul className="navbar-nav align-items-center gap-2">
                {/* PROFILE */}
                <li className="nav-item dropdown">
                  <button
                    className="btn btn-light rounded-pill px-3 d-flex align-items-center gap-2"
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-person-circle"></i>
                    <span className="fw-semibold">Partner</span>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3">
                    <li>
                      <Link className="dropdown-item" to="/partner/change-password">
                        <i className="bi bi-gear me-2"></i> Security
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/partner/user-guide">
                        <i className="bi bi-journal-text me-2"></i> User Guide
                      </Link>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* ================= MAIN ================= */}
        <main className="flex-grow-1 py-4">
          <div className="container-fluid px-4">
            <Outlet />
          </div>
        </main>

        {/* ================= FOOTER ================= */}
        
        <footer className="footer py-3 mt-auto bg-white border-top">
          <div className="container-fluid px-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
            <div className="small text-muted">
              © {new Date().getFullYear()} NPHCDA-DASS. All rights reserved.
            </div>

            <div className="small text-muted d-flex gap-3 mt-2 mt-md-0">
              <span>
                <i className="bi bi-envelope me-1"></i> helpdesk@nphcda.gov.ng
              </span>
              <span>
                <i className="bi bi-telephone me-1"></i> +234 905 152 3522
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PartnerLayout;
