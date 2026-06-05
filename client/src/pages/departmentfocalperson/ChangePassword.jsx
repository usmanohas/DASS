import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const ChangePasswordDFP = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [validation, setValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const [strength, setStrength] = useState(0);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/department/user`, { withCredentials: true })
      .then((res) => {
        if (res.data.Status) {
          setUsername(res.data.user.username);
        }
      });
  }, []);

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };

    setValidation(checks);

    const passed = Object.values(checks).filter(Boolean).length;
    setStrength(passed);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (name === "newPassword") {
      validatePassword(value);
    }
  };

  const toggle = (field) => {
    setShow({ ...show, [field]: !show[field] });
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 1:
        return "bg-danger";
      case 2:
        return "bg-warning";
      case 3:
        return "bg-info";
      case 4:
        return "bg-success";
      default:
        return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (strength < 4) {
      return Swal.fire(
        "Weak Password",
        "Please meet all password requirements",
        "warning",
      );
    }

    if (form.newPassword !== form.confirmPassword) {
      return Swal.fire("Error", "Passwords do not match", "error");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE_URL}/department/change-password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        { withCredentials: true },
      );

      if (res.data.Status) {
        await Swal.fire({
          icon: "success",
          title: "Password Updated",
          text: "Please login again",
        });

        await axios.get(`${API_BASE_URL}/auth/logout`, {
          withCredentials: true,
        });

        window.location.href = "/login";
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.Error || "Something went wrong",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4">
          <h3 className="mb-4">
            <i className="bi bi-shield-lock me-2"></i>
            Change Password
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input className="form-control" value={username} disabled />
            </div>

            {/* CURRENT PASSWORD */}
            <div className="mb-3">
              <label className="form-label">Current Password</label>

              <div className="input-group">
                <input
                  type={show.current ? "text" : "password"}
                  name="currentPassword"
                  className="form-control"
                  value={form.currentPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => toggle("current")}
                >
                  <i
                    className={`bi ${show.current ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>
            </div>

            {/* NEW PASSWORD */}
            <div className="mb-3">
              <label className="form-label">New Password</label>

              <div className="input-group">
                <input
                  type={show.new ? "text" : "password"}
                  name="newPassword"
                  className="form-control"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => toggle("new")}
                >
                  <i
                    className={`bi ${show.new ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>

              {/* Modern Progress Bar */}
              <div className="progress mt-2" style={{ height: "6px" }}>
                <div
                  className={`progress-bar ${getStrengthColor()} transition`}
                  style={{
                    width: `${(strength / 4) * 100}%`,
                    transition: "width 0.4s ease",
                  }}
                ></div>
              </div>

              {/* ✅ Password Criteria */}
              <ul className="list-unstyled small mt-2">
                <li style={{ color: validation.length ? "green" : "red" }}>
                  {validation.length ? "✔" : "✖"} At least 8 characters
                </li>
                <li style={{ color: validation.uppercase ? "green" : "red" }}>
                  {validation.uppercase ? "✔" : "✖"} Uppercase letter
                </li>
                <li style={{ color: validation.number ? "green" : "red" }}>
                  {validation.number ? "✔" : "✖"} Number
                </li>
                <li style={{ color: validation.special ? "green" : "red" }}>
                  {validation.special ? "✔" : "✖"} Special character (@$!%*?&)
                </li>
              </ul>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="mb-3">
              <label className="form-label">Confirm Password</label>

              <div className="input-group">
                <input
                  type={show.confirm ? "text" : "password"}
                  name="confirmPassword"
                  className={`form-control ${
                    form.confirmPassword &&
                    (form.confirmPassword === form.newPassword
                      ? "is-valid"
                      : "is-invalid")
                  }`}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => toggle("confirm")}
                >
                  <i
                    className={`bi ${show.confirm ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>

              {form.confirmPassword &&
                form.confirmPassword !== form.newPassword && (
                  <div className="invalid-feedback d-block">
                    Passwords do not match
                  </div>
                )}
            </div>

            <div className="d-flex justify-content-center mt-3">
              <button className="btn btn-success btn-md" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordDFP;
