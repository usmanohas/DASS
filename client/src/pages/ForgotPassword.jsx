import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/baseUrl";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState("");

  const [identity, setIdentity] = useState({
    email: "",
    file_number: "",
  });

  const [questions, setQuestions] = useState([]);

  const [answers, setAnswers] = useState(["", "", ""]);

  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  /* ==============================
      STEP 1
  ============================== */

  const verifyIdentity = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/forgot-password/verify-user`,
        identity,
      );

      if (res.data.Status) {
        setQuestions(res.data.Questions);
        setToken(res.data.Token);

        setStep(2);
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Unable to verify account", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
      STEP 2
  ============================== */

  const verifyAnswers = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/forgot-password/verify-answers`,
        {
          token,
          answers,
        },
      );

      if (res.data.Status) {
        setStep(3);
      } else {
        Swal.fire("Verification Failed", res.data.Error, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
    STEP 3
============================== */

  // PASSWORD VALIDATION
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;

    return regex.test(password);
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (passwords.password !== passwords.confirmPassword) {
      return Swal.fire("Validation", "Passwords do not match", "warning");
    }

    // Validate password strength
    if (!validatePassword(passwords.password)) {
      return Swal.fire({
        icon: "warning",
        title: "Weak Password",
        html: `
        <div style="text-align:left">
          Password must contain:
          <ul>
            <li>Minimum 8 characters</li>
            <li>At least one uppercase letter</li>
            <li>At least one lowercase letter</li>
            <li>At least one number</li>
            <li>At least one special character</li>
          </ul>
        </div>
      `,
      });
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/forgot-password/reset`,
        {
          token,
          password: passwords.password,
        },
      );

      if (res.data.Status) {
        Swal.fire({
          icon: "success",
          title: "Password Updated",
          text: "You can now login with your new password",
        });

        navigate("/");
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Unable to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT PANEL */}

      <div className="left-panel d-none d-md-flex">
        <div className="text-center text-white">
          <img
            src="/assets/images/federal_ministry_of_health.png"
            width="230"
            alt=""
          />

          <h2 className="fw-bold mt-4">
            National Primary Health Care Development Agency
          </h2>

          <p className="mt-3 fs-5">
            Document Archiving & Sharing System (DASS)
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}

      <div className="right-panel">
        <div className="login-card">
          {/* HEADER */}

          <div className="text-center mb-4">
            <img src="/assets/images/logo.png" width="80" alt="" />

            <h2 className="fw-bold mt-3">Recover Account</h2>

            <small className="text-muted">
              Complete the steps below to reset your password
            </small>
          </div>

          {/* STEPS */}

          <div className="steps mb-5">
            <div className={`step-circle ${step >= 1 && "active"}`}>1</div>

            <div className="step-line"></div>

            <div className={`step-circle ${step >= 2 && "active"}`}>2</div>

            <div className="step-line"></div>

            <div className={`step-circle ${step >= 3 && "active"}`}>3</div>
          </div>

          {/* STEP 1 */}

          {step === 1 && (
            <form onSubmit={verifyIdentity}>
              <h5 className="mb-4">Verify Identity</h5>

              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  required
                  value={identity.email}
                  onChange={(e) =>
                    setIdentity({
                      ...identity,
                      email: e.target.value,
                    })
                  }
                />

                <label>Email Address</label>
              </div>

              <div className="form-floating mb-4">
                <input
                  className="form-control"
                  placeholder="File Number"
                  required
                  value={identity.file_number}
                  onChange={(e) =>
                    setIdentity({
                      ...identity,
                      file_number: e.target.value,
                    })
                  }
                />

                <label>File Number</label>
              </div>

              <button
                className="btn btn-success btn-lg w-100"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
            </form>
          )}

          {/* STEP 2 */}

          {step === 2 && (
            <>
              <h5 className="mb-4">Security Questions</h5>

              {questions.length === 0 ? (
                <div className="alert alert-warning border-0 shadow-sm rounded-4 p-4">
                  <div className="d-flex">
                    <div className="me-3">
                      <i
                        className="bi bi-shield-exclamation text-warning"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>

                    <div>
                      <h5 className="fw-bold text-warning mb-3">
                        Security Questions Not Configured
                      </h5>

                      <p className="mb-3 text-muted">
                        Your account does not have security recovery questions
                        configured. For security reasons, you cannot continue
                        with self-service password recovery at this time.
                      </p>

                      <div className="bg-light rounded-3 p-3 border">
                        <strong>Next Step</strong>

                        <div className="mt-2 text-secondary">
                          Kindly contact or visit your Department Focal Person
                          for assistance with resetting your password.
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link
                          to="/"
                          className="btn btn-outline-success rounded-pill"
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Back to Login
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={verifyAnswers}>
                  {questions.map((q, index) => (
                    <div key={index} className="mb-4">
                      <label className="fw-semibold mb-2">{q.question}</label>

                      <input
                        className="form-control"
                        placeholder="Your Answer"
                        required
                        value={answers[index]}
                        onChange={(e) => {
                          const updated = [...answers];
                          updated[index] = e.target.value;
                          setAnswers(updated);
                        }}
                      />
                    </div>
                  ))}

                  <button
                    className="btn btn-success btn-lg w-100"
                    disabled={loading}
                  >
                    {loading ? "Checking..." : "Verify Answers"}
                  </button>
                </form>
              )}
            </>
          )}

          {/* STEP 3 */}

          {step === 3 && (
            <form onSubmit={resetPassword}>
              <h5 className="mb-4">Create New Password</h5>

              <div className="form-floating mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  required
                  placeholder="Password"
                  value={passwords.password}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      password: e.target.value,
                    })
                  }
                />

                <label>New Password</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  required
                  placeholder="Confirm Password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                />

                <label>Confirm Password</label>
              </div>

              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  onChange={() => setShowPassword(!showPassword)}
                />

                <label className="form-check-label">Show Password</label>
              </div>

              <div className="alert alert-info">
                Password must contain:
                <ul className="mb-0 mt-2">
                  <li>Minimum 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>
              </div>

              <button
                className="btn btn-success btn-lg w-100"
                disabled={loading}
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="text-center mt-4">
            {!(step === 2 && questions.length === 0) && (
              <Link
                to="/"
                className="text-success fw-semibold text-decoration-none"
              >
                ← Back to Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* CSS */}

      <style>{`

      .login-container{
        display:flex;
        min-height:100vh;
        background:linear-gradient(135deg,#0f5132,#198754);
      }

      .left-panel{
        flex:1;
        justify-content:center;
        align-items:center;
        background:rgba(0,0,0,.15);
      }

      .right-panel{
        flex:1;
        display:flex;
        justify-content:center;
        align-items:center;
        background:#f8f9fa;
      }

      .login-card{
        width:100%;
        max-width:550px;
        background:white;
        padding:40px;
        border-radius:24px;
        box-shadow:0 20px 40px rgba(0,0,0,.08);
        animation:fadeIn .5s ease;
      }

      .steps{
        display:flex;
        align-items:center;
        justify-content:center;
      }

      .step-circle{
        width:50px;
        height:50px;
        border-radius:50%;
        background:#dee2e6;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:700;
      }

      .step-circle.active{
        background:#198754;
        color:#fff;
      }

      .step-line{
        width:70px;
        height:3px;
        background:#dee2e6;
      }

      @keyframes fadeIn{
        from{
          opacity:0;
          transform:translateY(20px);
        }

        to{
          opacity:1;
          transform:translateY(0);
        }
      }

      @media(max-width:768px){

        .login-container{
          background:#f8f9fa;
        }

        .login-card{
          width:92%;
          padding:30px;
          box-shadow:none;
        }

      }

      `}</style>
    </div>
  );
};

export default ForgotPassword;
