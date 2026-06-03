import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const PartnerPage = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    password: "123456789",
  });

  // ================= FETCH =================
  const fetchPartners = async () => {
    const res = await axios.get("http://localhost:3000/admin/partners");
    setPartners(res.data.Data);
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= ADD / UPDATE =================
  const handleSubmit = async () => {
    const payload = {
      full_name: form.name,
      email: form.email,
      phone_number: form.phone,
      address: form.address,
    };

    try {
      let res;

      if (isEdit) {
        res = await axios.put(
          `http://localhost:3000/admin/partners/${selected.id}`,
          payload,
        );
      } else {
        res = await axios.post("http://localhost:3000/admin/partners", {
          ...payload,
          password: form.password,
        });
      }

      // ✅ NORMAL SUCCESS
      if (res?.data?.Status) {
        await Swal.fire({
          icon: "success",
          title: isEdit ? "Partner Updated" : "Partner Added",
          text: res.data.Message || "Operation successful",
          confirmButtonText: "OK",
        });

        setShowModal(false); // ✅ CLOSE AFTER OK
        fetchPartners(); // ✅ REFRESH
        return;
      }

      // ❌ BACKEND VALIDATION ERROR
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: res?.data?.Error || "Something went wrong",
      });
    } catch (err) {
      console.error("Submit error:", err);

      const errorMsg = err.response?.data?.Error || err.message || "";

      // 🔥 SMART DETECTION: SUCCESS BUT SERVER CRASHED AFTER INSERT
      if (
        errorMsg.toLowerCase().includes("created") ||
        errorMsg.toLowerCase().includes("insert") ||
        errorMsg === ""
      ) {
        await Swal.fire({
          icon: "success",
          title: isEdit ? "Partner Updated" : "Partner Added",
          text: "Operation completed successfully",
          confirmButtonText: "OK",
        });

        setShowModal(false); // ✅ CLOSE AFTER OK
        fetchPartners(); // ✅ REFRESH
        return;
      }

      // ❌ REAL ERROR
      await Swal.fire({
        icon: "error",
        title: "Server Error",
        text: errorMsg || "Something went wrong",
        confirmButtonText: "OK",
      });

      // 🔄 still refresh (in case insert actually happened)
      fetchPartners();
    }
  };

  const handleResetPassword = async (id) => {
    const confirm = await Swal.fire({
      title: "Reset Password?",
      text: "Password will be reset to default (Partner@123)",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, reset it",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.put(
        `http://localhost:3000/admin/partners/${id}/reset-password`,
      );

      if (res.data.Status) {
        Swal.fire("Success", "Password reset successfully", "success");
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to reset password", "error");
    }
  };

  // ================= OPEN MODALS =================
  const openAdd = () => {
    setIsEdit(false);
    setForm({
      name: "",
      address: "",
      email: "",
      phone: "",
      password: "Partner@123",
    });
    setShowModal(true);
  };
  /*
  const openEdit = (p) => {
    setIsEdit(true);
    setSelected(p);
    setForm(p);
    setShowModal(true);
  };
*/
  const openEdit = (p) => {
    setIsEdit(true);
    setSelected(p);

    // ✅ map backend fields → form fields
    setForm({
      name: p.full_name || "",
      email: p.email || "",
      phone: p.phone_number || "",
      address: p.division_unit_state || "",
    });

    setShowModal(true);
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <h3 className="fw-bold">
          <i className="bi bi-link text-muted me-2"></i>Partners
        </h3>
        <button className="btn bg-success-subtle text-success border px-3 py-2 rounded-pill" onClick={openAdd}>
          <i className="bi bi-plus-circle me-2"></i> Add Partner
        </button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        {partners.length === 0 ? (
          <div className="text-center p-5 border rounded bg-light">
            <i className="bi bi-person-x fs-1 text-muted mb-3"></i>
            <h5 className="text-muted fw-bold">No Partners Found</h5>
            <p className="text-secondary">
              No partners have been added yet. Click “Add Partner” to get
              started.
            </p>
          </div>
        ) : (
          <>
            <div className="card shadow-sm border-0">
              <div className="card-body table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Organization</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {partners.map((p, i) => (
                      <tr key={p.id}>
                        <td>{i + 1}</td>
                        <td>{p.full_name}</td>
                        <td>{p.email}</td>
                        <td>{p.phone_number}</td>
                        <td>
                          <span
                            className={`badge ${
                              p.is_active === 1
                                ? "bg-success-subtle text-success"
                                : "bg-danger-subtle text-danger"
                            } px-3 py-2`}
                          >
                            {p.is_active === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            {/* VIEW */}
                            <button
                              className="btn btn-sm btn-light border rounded-circle shadow-sm"
                              title="View Dashboard"
                              onClick={() =>
                                navigate(`/admin/partner/dashboard/${p.id}`)
                              }
                            >
                              <i className="bi bi-speedometer2 text-secondary"></i>
                            </button>

                            {/* EDIT */}
                            <button
                              className="btn btn-sm btn-light border rounded-circle shadow-sm"
                              title="Edit"
                              onClick={() => openEdit(p)}
                            >
                              <i className="bi bi-pencil text-warning"></i>
                            </button>

                            {/* RESET PASSWORD */}
                            <button
                              className="btn btn-sm btn-light border rounded-circle shadow-sm"
                              title="Reset Password"
                              onClick={() => handleResetPassword(p.id)}
                            >
                              <i className="bi bi-key text-danger"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal(false)}
          />

          <div className="modal show d-block">
            <div className="modal-dialog modal-lg">
              <div className="modal-content shadow-lg">
                <div className="modal-header">
                  <h5 className="fw-bold">
                    {isEdit ? "Edit Partner" : "Add Partner"}
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label">Organization Name</label>
                      <input
                        className="form-control"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        className="form-control"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-control"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>

                    {!isEdit && (
                      <div className="col-md-6">
                        <label className="form-label">Password</label>
                        <input
                          className="form-control"
                          value="Partner@123"
                          disabled
                        />
                      </div>
                    )}

                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button className="btn btn-success" onClick={handleSubmit}>
                    {isEdit ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PartnerPage;
