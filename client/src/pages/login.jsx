import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  axios.defaults.withCredentials = true;

  const [values, setValues] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const navigate = useNavigate();

  /* =========================
     LOAD REMEMBERED USER
  ========================= */
  useEffect(() => {
    const savedUser = localStorage.getItem("rememberUser");
    if (savedUser) {
      setValues((prev) => ({ ...prev, username: savedUser }));
      setRememberMe(true);
    }
  }, []);

  /* =========================
     VERIFY LOGIN
  ========================= */
  useEffect(() => {
    axios
      .get("http://localhost:3000/verify")
      .then((res) => {
        if (res.data.Status) {
          const { role } = res.data;
          if (role === "ADMIN") navigate(`/admin`);
          else if (role === "FOCAL_PERSON") navigate(`/department`);
          else if (role === "SUPER_ADMIN") navigate(`/superadmin`);
          else if (role === "STAFF") navigate(`/staff`);
          else if (role === "PARTNER") navigate(`/partner`);
        }
      })
      .catch(() => {});
  }, [navigate]);

  /* =========================
     LOGIN
  ========================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await axios.post(
        "http://localhost:3000/auth/login",
        values
      );

      if (res.data.Status) {
        setSuccessMessage(res.data.Message);

        /* ✅ HANDLE REMEMBER ME */
        if (rememberMe) {
          localStorage.setItem("rememberUser", values.username);
        } else {
          localStorage.removeItem("rememberUser");
        }

        setTimeout(() => {
          const role = res.data.role;
          if (role === "SUPER_ADMIN") navigate("/superadmin");
          else if (role === "ADMIN") navigate("/admin");
          else if (role === "FOCAL_PERSON") navigate("/department");
          else if (role === "STAFF") navigate("/staff");
          else if (role === "PARTNER") navigate("/partner");
        }, 800);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.Error || "Invalid login credentials"
      );
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="login-container">

      {/* LEFT PANEL */}
      <div className="left-panel d-none d-md-flex">
        <div className="text-center text-white">
          <img
            src="/assets/images/federal_ministry_of_health.png"
            width="250"
            alt="coat"
          />
          <h2 className="mt-4 fw-bold">
            National Primary Health Care Development Agency <br />(NPHCDA)
          </h2>
          <p className="mt-4">
            Document Archiving & Sharing System (DASS)
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="login-card">

          <div className="text-center mb-4">
            <img src="/assets/images/logo.png" width="80" alt="logo" />
            <h2 className="fw-bold mt-2">Let's login to your account</h2>
            <small className="text-muted">
              Enter your credentials to continue
            </small>
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2 text-center">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success py-2 text-center">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleLogin}>

            {/* Username */}
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                value={values.username}
                onChange={(e) =>
                  setValues({ ...values, username: e.target.value })
                }
                required
              />
              <label>Username</label>
            </div>

            {/* Password */}
            <div className="form-floating mb-2 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Password"
                value={values.password}
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
                required
              />
              <label>Password</label>

              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </span>
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
              
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  id="rememberMe"
                />
                <label className="form-check-label small" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>

              <Link to="/forgot-password" className="small text-success fw-semibold">
                Forgot password?
              </Link>

            </div>

            {/* Button */}
            <div className="d-grid mt-2">
              <button className="btn btn-success btn-lg" disabled={loggingIn}>
                {loggingIn ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>

          </form>

          <div className="text-center mt-4 small text-muted">
            © {new Date().getFullYear()} NPHCDA
          </div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .login-container {
          display: flex;
          height: 100vh;
          background: linear-gradient(135deg, #0f5132, #198754);
        }

        .left-panel {
          flex: 1;
          justify-content: center;
          align-items: center;
          background: rgba(0,0,0,0.2);
          backdrop-filter: blur(8px);
        }

        .right-panel {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f8f9fa;
        }

        .login-card {
          width: 100%;
          max-width: 450px;
          padding: 30px;
          border-radius: 20px;
          animation: fadeIn 0.6s ease;
        }

        .password-toggle {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
            background: #f8f9fa;
          }

          .left-panel {
            display: none !important;
          }

          .right-panel {
            height: 100%;
          }

          .login-card {
            margin: auto;
            width: 90%;
            padding: 25px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;