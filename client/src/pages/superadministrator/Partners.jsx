import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const PartnerManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [searched, setSearched] = useState(false);
  const [departments, setDepartments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    division_unit_state: "",
    email: "",
    phone_number: "",
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
    fetchPartner();
    fetchDepartments(); // ✅ add this
  }, []);

  /* ================= FETCH PARTNER ================= */
  const fetchPartner = async () => {
    const res = await axios.get(`${API_BASE_URL}/superadmin/partners`, {
      withCredentials: true,
    });

    if (res.data.Status) setAdmins(res.data.data);
  };

  useEffect(() => {
    fetchPartner();
  }, []);

  const handleEdit = (admin) => {
    setForm({
      full_name: admin.full_name || "",
      division_unit_state: admin.division_unit_state || "",
      email: admin.email || "",
      phone_number: admin.phone_number || "",
    });

    setEditId(admin.id);
    setIsEdit(true);
    setShowModal(true);
  };

  const updatePartner = async () => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/superadmin/partner/update/${editId}`,
        form,
        { withCredentials: true },
      );

      if (res.data.Status) {
        Swal.fire("Success", res.data.Message, "success");
        fetchPartner();
        closeModal(); // ✅ important
      }
    } catch (err) {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  const resetPassword = async (id) => {
    const confirm = await Swal.fire({
      title: "Reset Password?",
      text: "Password will be reset to default (Partner@123)",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.put(
        `${API_BASE_URL}/superadmin/partner/reset-password/${id}`,
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
      title: currentStatus ? "Deactivate Partner?" : "Activate Partner?",
      text: "This will change the user's access",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: currentStatus ? "#dc3545" : "#198754",
      confirmButtonText: currentStatus ? "Deactivate" : "Activate",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.put(
        `${API_BASE_URL}/superadmin/partner/toggle-status/${id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.Status) {
        Swal.fire("Success", res.data.Message, "success");

        // ✅ refresh instantly
        fetchPartner();
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  /* ================= CREATE ADMIN ================= */
  const createPartner = async () => {
    const res = await axios.post(
      `${API_BASE_URL}/superadmin/users/create-partner`,
      form,
      { withCredentials: true },
    );

    if (res.data.Status) {
      Swal.fire("Success", res.data.Message, "success");
      fetchPartner();
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
      full_name: "",
      division_unit_state: "",
      email: "",
      phone_number: "",
    });
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-semibold mb-0">
            <i className="bi bi-link me-2"></i>
            Partners Management
          </h3>
          <small className="text-muted">Manage NPHCDA partners</small>
        </div>

        <button
          className="btn btn-success"
          onClick={() => {
            setIsEdit(false);
            setForm({
              full_name: "",
              division_unit_state: "",
              email: "",
              phone_number: "",
            });
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle" title="Create Account"></i>
        </button>
      </div>

      {/* ADMIN LIST */}
      <div className="card shadow-sm border-0">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Created</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {admins.map((a, i) => (
                <tr key={a.id} className={!a.is_active ? "opacity-50" : ""}>
                  <td>{i + 1}</td>

                  <td className="">
                    {a.full_name}
                    <p className="text-muted small"><small><i className="bi bi-geo-alt-fill me-1 text-danger small"></i>{a.division_unit_state}</small></p>
                </td>

                  <td className="text-muted small">{a.email}</td>

                  <td className="text-muted small">{a.phone_number}</td>

                  <td className="text-muted small">{new Date(a.created_at).toLocaleDateString("en-GB")}</td>

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
                  <td className="text-center">
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
              <p className="text-muted">No partner found</p>
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
            <div className="modal-dialog modal-lg">
              <div className="modal-content shadow-lg">
                <div className="modal-header">
                  <h6 className="modal-title">Create Partner Account</h6>
                  <button className="btn-close" onClick={closeModal}></button>
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-12 mb-2">
                      <label className="form-label">Organization Name</label>
                      <input
                        className="form-control"
                        value={form.full_name}
                        onChange={(e) =>
                          setForm({ ...form, full_name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Phone Number</label>
                      <input
                        className="form-control"
                        value={form.phone_number}
                        onChange={(e) =>
                          setForm({ ...form, phone_number: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Email</label>
                      <input
                        className="form-control mb-2"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-12 mb-2">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="division_unit_state"
                        value={form.division_unit_state}
                        onChange={(e) =>
                          setForm({ ...form, division_unit_state: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-light" onClick={closeModal}>
                    Cancel
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={isEdit ? updatePartner : createPartner}
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

export default PartnerManagement;
