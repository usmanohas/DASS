import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const StaffManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [searched, setSearched] = useState(false);
  const [departments, setDepartments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    full_name: "",
    gender: "",
    designation: "",
    division_unit_state: "",
    file_number: "",
    email: "",
    phone_number: "",
    username: "",
    password: "",
    department_id: "",
  });

  const generateFileNumber = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

/*
  useEffect(() => {
    if (showModal && !isEdit) {
      setForm((prev) => ({
        ...prev,
        file_number: generateFileNumber(),
      }));
    }
  }, [showModal, isEdit]);

  */

  /*================== FETCH DEPARTMENT ==================== */
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/superadmin/departments`,
        {
          withCredentials: true,
        },
      );

      if (res.data.Status) {
        setDepartments(res.data.Departments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchDepartments(); // ✅ add this
  }, []);

  /* ================= FETCH FOCAL PERSON ================= */
  const fetchStaff = async () => {
    const res = await axios.get(`${API_BASE_URL}/superadmin/staff`, {
      withCredentials: true,
    });

    if (res.data.Status) setAdmins(res.data.data);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  /* ================= SEARCH USER ================= */
  const handleSearch = async () => {
    if (!search) return;

    setSearched(true);

    const res = await axios.get(
      `${API_BASE_URL}/superadmin/users/search?q=${search}`,
      { withCredentials: true },
    );

    if (res.data.Status) {
      setFoundUser(res.data.user);
    }
  };

  /* ================= MAKE FOCAL PERSON ================= */
  const makeStaff = async (id) => {
    const confirm = await Swal.fire({
      title: "Make this user staff?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#198754",
    });

    if (!confirm.isConfirmed) return;

    const res = await axios.put(
      `${API_BASE_URL}/superadmin/users/make-staff/${id}`,
      {},
      { withCredentials: true },
    );

    if (res.data.Status) {
      Swal.fire("Success", res.data.Message, "success");
      fetchStaff();
      setFoundUser(null);
      setSearch("");
      setSearched(false);
    }
  };

  const handleEdit = (admin) => {
    setForm({
      title: admin.title || "",
      full_name: admin.full_name || "",
      gender: admin.gender || "",
      designation: admin.designation || "",
      division_unit_state: admin.division_unit_state || "",
      file_number: admin.file_number || "",
      email: admin.email || "",
      phone_number: admin.phone_number || "",
      username: admin.username || "",
      password: "",
      department_id: admin.department_id ? String(admin.department_id) : "",
    });

    setEditId(admin.id);
    setIsEdit(true);
    setShowModal(true);
  };

  const updateStaff = async () => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/superadmin/staff/update/${editId}`,
        form,
        { withCredentials: true },
      );

      if (res.data.Status) {
        Swal.fire("Success", res.data.Message, "success");
        fetchStaff();
        closeModal(); // ✅ important
      }
    } catch (err) {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  const resetPassword = async (id) => {
    const confirm = await Swal.fire({
      title: "Reset Password?",
      text: "Password will be reset to default (123456789@)",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.put(
        `${API_BASE_URL}/superadmin/staff/reset-password/${id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.Status) {
        Swal.fire("Success", res.data.Message, "success");
      }
    } catch (err) {
      Swal.fire("Error", "Reset failed", "error");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const confirm = await Swal.fire({
      title: currentStatus ? "Deactivate Staff?" : "Activate Staff?",
      text: "This will change the user's access",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: currentStatus ? "#dc3545" : "#198754",
      confirmButtonText: currentStatus ? "Deactivate" : "Activate",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.put(
        `${API_BASE_URL}/superadmin/staff/toggle-status/${id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.Status) {
        Swal.fire("Success", res.data.Message, "success");

        // ✅ refresh instantly
        fetchStaff();
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  /* ================= CREATE ADMIN ================= */
  const createStaff = async () => {
    const res = await axios.post(
      `${API_BASE_URL}/superadmin/users/create-staff`,
      form,
      { withCredentials: true },
    );

    if (res.data.Status) {
      Swal.fire("Success", res.data.Message, "success");
      fetchStaff();
      closeModal();
    } else {
      Swal.fire("Error", res.data.Error, "error");
    }
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showModal]);

  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setEditId(null);
    setForm({
      title: "",
      full_name: "",
      gender: "",
      designation: "",
      division_unit_state: "",
      file_number: "",
      email: "",
      phone_number: "",
      username: "",
      password: "",
      department_id: "",
    });
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-semibold mb-0">
            <i className="bi bi-person-workspace me-2"></i>
            Staff Management
          </h3>
          <small className="text-muted">Manage staff</small>
        </div>

        <button
          className="btn btn-success"
          onClick={() => {
            setIsEdit(false);
            setForm({
              title: "",
              full_name: "",
              gender: "",
              designation: "",
              division_unit_state: "",
              file_number: "",
              email: "",
              phone_number: "",
              username: "",
              password: "",
              department_id: "",
            });
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle" title="Create Account"></i>
        </button>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group">
            <input
              className="form-control"
              placeholder="Search by file number, email or phone number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={handleSearch}>
              <i className="bi bi-search"></i>
            </button>
          </div>

          {/* RESULT */}
          {searched && (
            <div className="mt-4">
              {!foundUser ? (
                <div className="text-center text-muted py-3">
                  <i className="bi bi-search fs-3"></i>
                  <div>No user found</div>
                </div>
              ) : (
                <div className="border rounded p-3 d-flex justify-content-between align-items-center">
                  {/* LEFT */}
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="bg-info text-white d-flex align-items-center justify-content-center"
                      style={{
                        width: 45,
                        height: 45,
                        borderRadius: "50%",
                        fontWeight: "bold",
                      }}
                    >
                      {foundUser.full_name?.charAt(0)}
                    </div>

                    <div>
                      <div className="fw-semibold">{foundUser.full_name}{" - ("}<span className="text-muted small">{foundUser.role}</span>{")"}</div>
                      <small className="text-muted">{foundUser.email}</small>
                      <p className="text-muted"><span className="bi bi-building me-2 text-muted"></span>{foundUser.department}</p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div>
                    {foundUser.role === "STAFF" ? (
                      <span className="text-danger px-3 py-2">
                       <i className="bi bi-info-circle me-2"></i>Already staff
                      </span>
                    ) : (
                      <button
                        className="btn btn-danger btn-sm px-3"
                        onClick={() => makeStaff(foundUser.id)}
                      >
                        <i className="bi bi-person-check me-1"></i>
                        Make Staff
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ADMIN LIST */}
      <div className="card shadow-sm border-0">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Department</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Created</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>

            <tbody>
              {admins.map((a, i) => (
                <tr key={a.id} className={!a.is_active ? "opacity-50" : ""}>
                  <td>{i + 1}</td>

                  <td className="">{a.full_name}</td>
                  <td className="fw-normal">{a.department}</td>

                  <td>{a.email}</td>

                  <td>{a.phone_number}</td>

                  <td>{new Date(a.created_at).toLocaleDateString("en-GB")}</td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`badge ${
                        a.is_active ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {a.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      {/* EDIT */}
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(a)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>

                      {/* RESET PASSWORD */}
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => resetPassword(a.id)}
                      >
                        <i className="bi bi-key"></i>
                      </button>

                      {/* TOGGLE */}
                      <button
                        className={`btn btn-sm ${
                          a.is_active
                            ? "btn-outline-danger"
                            : "btn-outline-success"
                        }`}
                        onClick={() => toggleStatus(a.id, a.is_active)}
                      >
                        <i
                          className={`bi ${
                            a.is_active ? "bi-person-x" : "bi-person-check"
                          }`}
                        ></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {admins.length === 0 && (
            <div className="text-center p-5">
              <i className="bi bi-person-x fs-1 text-muted mb-3"></i>
              <p className="text-muted">No staff found</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <>
          {/* MODAL */}
          <div
            className="modal fade show d-block"
            style={{ zIndex: 1055 }} // ✅ ABOVE backdrop
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h6 className="modal-title">Create Staff Account</h6>
                  <button className="btn-close" onClick={closeModal}></button>
                </div>

                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-3 mb-2">
                      <select
                        className="form-select"
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                      >
                        <option value="">Title</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs</option>
                        <option value="Miss.">Miss.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Engr.">Engr.</option>
                        <option value="Pharm.">Pharm.</option>
                        <option value="Prof.">Prof.</option>
                        <option value="Barr.">Barr.</option>
                      </select>
                    </div>

                    <div className="col-md-9 mb-2">
                      <input
                        className="form-control"
                        placeholder="Full Name"
                        value={form.full_name}
                        onChange={(e) =>
                          setForm({ ...form, full_name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12 mb-2">
                      <select
                        className="form-select"
                        value={form.gender}
                        onChange={(e) =>
                          setForm({ ...form, gender: e.target.value })
                        }
                      >
                        <option value="">Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>

                    <div className="mb-2">
                      <select
                        className="form-select"
                        value={form.department_id}
                        onChange={
                          (e) =>
                            setForm({
                              ...form,
                              department_id: String(e.target.value),
                            }) // ✅ ensure string
                        }
                      >
                        <option value="">Select Department</option>

                        {departments.map((dept) => (
                          <option key={dept.id} value={String(dept.id)}>
                            {dept.name} ({dept.name_abbreviation})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-2">
                      <input
                        className="form-control"
                        placeholder="Designation"
                        value={form.designation}
                        onChange={(e) =>
                          setForm({ ...form, designation: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <input
                        className="form-control mb-2"
                        placeholder="Division / Unit / State"
                        value={form.division_unit_state}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            division_unit_state: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <input
                        className="form-control"
                        placeholder="File Number"
                        value={form.file_number}
                        onChange={(e) =>
                          setForm({ ...form, file_number: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-6 mb-2">
                      <input
                        className="form-control"
                        placeholder="Phone Number"
                        value={form.phone_number}
                        onChange={(e) =>
                          setForm({ ...form, phone_number: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <input
                    className="form-control mb-2"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />

                  {!isEdit && (
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn btn-light" onClick={closeModal}>
                    Cancel
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={isEdit ? updateStaff : createStaff}
                  >
                    {isEdit ? "Update" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BACKDROP */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1050 }} // ✅ BELOW modal
          ></div>
        </>
      )}
    </div>
  );
};

export default StaffManagement;
