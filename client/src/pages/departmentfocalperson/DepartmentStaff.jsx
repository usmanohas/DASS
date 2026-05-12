import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const DepartmentStaff = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState(null);

  const [uploadFile, setUploadFile] = useState(null);

  const [form, setForm] = useState({
    title: "",
    full_name: "",
    gender: "",
    designation: "",
    fileNumber: "",
    email: "",
    phone_number: "",
  });

  const fetchStaff = async () => {
    const res = await axios.get(
      `http://localhost:3000/department/staff?page=${page}&limit=10&search=${search}`,
      { withCredentials: true },
    );

    if (res.data.Status) {
      setStaff(res.data.Data);
      setTotalPages(res.data.Pages);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page, search]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openEditModal = (staff) => {
    setSelectedStaff(staff);

    setForm({
      title: staff.title || "",
      full_name: staff.full_name || "",
      gender: staff.gender || "",
      designation: staff.designation || "",
      fileNumber: staff.file_number || "",
      email: staff.email || "",
      phone_number: staff.phone_number || "",
    });

    setShowAddModal(true);
  };

  const saveStaff = async () => {
    try {
      let res;

      if (selectedStaff) {
        res = await axios.put(
          `http://localhost:3000/department/staff/${selectedStaff.id}`,
          form,
          { withCredentials: true },
        );
      } else {
        res = await axios.post("http://localhost:3000/department/staff", form, {
          withCredentials: true,
        });
      }

      if (res.data.Status) {
        Swal.fire(
          "Success",
          selectedStaff
            ? "Staff updated successfully"
            : "Staff added successfully",
          "success",
        );

        setShowAddModal(false);
        setSelectedStaff(null);
        fetchStaff();
      } else {
        Swal.fire("Error", res.data.Error || "Operation failed", "error");
      }
    } catch (err) {
      console.error(err);

      Swal.fire("Error", "Server error occurred", "error");
    }
  };

  const resetPassword = async (id) => {
    const { value: password } = await Swal.fire({
      title: "Reset Password",
      input: "password",
      inputPlaceholder: "Enter new password",
      showCancelButton: true,
    });

    if (!password) return;

    await axios.put(
      `http://localhost:3000/department/staff/${id}/reset-password`,
      { password },
      { withCredentials: true },
    );

    Swal.fire("Success", "Password reset successfully", "success");
  };

  const toggleActive = async (staff) => {
    const action = staff.is_active ? "Deactivate" : "Activate";

    const confirm = await Swal.fire({
      title: `${action} User?`,
      text: `Are you sure you want to ${action.toLowerCase()} this staff account?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.put(
        `http://localhost:3000/department/staff/${staff.id}/active`,
        { active: !staff.is_active },
        { withCredentials: true },
      );

      Swal.fire(
        "Updated",
        `User ${action.toLowerCase()}d successfully`,
        "success",
      );

      fetchStaff();
    } catch (err) {
      Swal.fire("Error", "Unable to update status", "error");
    }
  };

  const toggleLock = async (staff) => {
    await axios.put(
      `http://localhost:3000/department/staff/${staff.id}/lock`,
      { lock: !staff.is_locked },
      { withCredentials: true },
    );

    Swal.fire("Updated", "User status updated", "success");

    fetchStaff();
  };

  const uploadExcel = async () => {
    if (!uploadFile) {
      return Swal.fire("Error", "Select add staff file to upload", "error");
    }

    const formData = new FormData();
    formData.append("file", uploadFile);

    const res = await axios.post(
      "http://localhost:3000/department/staff/import",
      formData,
      { withCredentials: true },
    );

    if (res.data.Status) {
      Swal.fire(
        "Import Complete",
        `${res.data.Inserted} added, ${res.data.Skipped} skipped`,
        "success",
      );

      setShowImportModal(false);
      fetchStaff();
    }
  };

  const removeStaf = async (staff) => {
    const { value: reason } = await Swal.fire({
      title: "Remove Staff",
      input: "select",
      inputOptions: {
        TRANSFER: "Transfer to another department",
        RETIRED: "Retired",
        RESIGNED: "Resigned",
        TERMINATED: "Terminated",
      },
      inputPlaceholder: "Select reason",
      showCancelButton: true,
    });

    if (!reason) return;

    const res = await axios.put(
      `http://localhost:3000/department/staff/${staff.id}/remove`,
      { reason },
      { withCredentials: true },
    );

    if (res.data.Status) {
      Swal.fire("Success", "Staff removed successfully", "success");

      fetchStaff();
    }
  };

  const removeStaff = async (staff) => {
    const { value: reason } = await Swal.fire({
      title: `Remove ${staff.full_name}?`,
      text: "Select the reason for removing this staff",
      icon: "warning",

      input: "select",

      inputOptions: {
        TRANSFER: "Transfer to another department",
        RETIRED: "Retired",
        RESIGNED: "Resigned",
        TERMINATED: "Terminated",
      },

      inputPlaceholder: "Select removal reason",

      showCancelButton: true,

      confirmButtonText: "Remove Staff",
      cancelButtonText: "Cancel",

      confirmButtonColor: "#dc3545", // red danger
      cancelButtonColor: "#6c757d",

      inputValidator: (value) => {
        if (!value) {
          return "Please select a removal reason";
        }
      },
    });

    if (!reason) return;

    const res = await axios.put(
      `http://localhost:3000/department/staff/${staff.id}/remove`,
      { reason },
      { withCredentials: true },
    );

    if (res.data.Status) {
      Swal.fire({
        icon: "success",
        title: "Staff Removed",
        text: "Staff removed successfully",
        confirmButtonColor: "#198754",
      });

      fetchStaff();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res.data.Error || "Failed to remove staff",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  const lookupStaff = async () => {
    const { value: fileNumber } = await Swal.fire({
      title: "Lookup Staff Transfer",
      input: "text",
      inputLabel: "Enter Staff File Number",
      inputPlaceholder: "e.g 1739",

      showCancelButton: true,

      confirmButtonText: "Lookup Staff",
      cancelButtonText: "Cancel",

      confirmButtonColor: "#198754", // Bootstrap success color
      cancelButtonColor: "#6c757d",

      icon: "info",
    });

    if (!fileNumber) return;

    const res = await axios.post(
      "http://localhost:3000/department/staff/lookup",
      { file_number: fileNumber },
      { withCredentials: true },
    );

    if (res.data.Status) {
      Swal.fire({
        icon: "success",
        title: "Transfer Complete",
        text: "Staff transferred to your department",
        confirmButtonColor: "#198754",
      });

      fetchStaff();
    } else {
      Swal.fire({
        icon: "error",
        title: "Lookup Failed",
        text: res.data.Error,
        confirmButtonColor: "#dc3545",
      });
    }
  };

  return (
    <div className="container py-4">
      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="">
          <i className="bi bi-people me-2"></i>Department Staff
        </h3>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-dark btn-sm" onClick={lookupStaff}>
            <i className="bi bi-search"></i> Lookup Staff
          </button>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowImportModal(true)}
          >
            <i className="bi bi-upload"></i> Import xlsx
          </button>

          <button
            className="btn btn-sm text-white"
            onClick={() => {
              setSelectedStaff(null);
              setForm({});
              setShowAddModal(true);
            }}
            style={{ backgroundColor: "#00c2c1" }}
          >
            <i className="bi bi-plus-circle me-1"></i>Add Staff
          </button>
        </div>
      </div>

      {/* SEARCH + FILTER */}

      {/* TABLE TOOLBAR */}

      <div className="card shadow-sm mb-3 border-0">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-light border"
              onClick={() => setShowSearch(!showSearch)}
            >
              <i className="bi bi-search"></i>
            </button>

            {showSearch && (
              <input
                className="form-control"
                style={{ width: "250px" }}
                placeholder="Search staff..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            )}
          </div>

          <div className="text-muted small">Showing {staff.length} staff</div>
        </div>
      </div>

      {/* TABLE */}

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {staff.map((s, index) => (
                  <tr key={s.id}>
                    <td>{((page - 1) * 10) + (index + 1)}</td>

                    <td>{s.title}{" "}{s.full_name}</td>

                    <td>{s.designation}</td>

                    <td>{s.email}</td>

                    <td>{s.phone_number}</td>

                    <td>
                      {s.is_active === 1 && (
                        <span className="badge bg-success">
                          <i className="bi bi-check-circle me-1"></i> Active
                        </span>
                      )}

                      {s.is_active === 0 && (
                        <span className="badge bg-secondary">
                          <i className="bi bi-slash-circle me-1"></i> Inactive
                        </span>
                      )}

                      {s.is_locked === 1 && (
                        <span className="badge bg-danger ms-2">
                          <i className="bi bi-lock-fill me-1"></i> Locked
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-light dropdown-toggle"
                          data-bs-toggle="dropdown"
                        >
                          Action
                        </button>

                        <ul className="dropdown-menu">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                navigate(`/department/staff/${s.id}/dashboard`)
                              }
                            >
                              <i className="bi bi-speedometer2 me-2"></i>
                              Dashboard
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => openEditModal(s)}
                            >
                              Edit Record
                            </button>
                          </li>

                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => resetPassword(s.id)}
                            >
                              Reset Password
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => toggleActive(s)}
                            >
                              {s.is_active
                                ? "Deactivate User"
                                : "Activate User"}
                            </button>
                          </li>

                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => toggleLock(s)}
                            >
                              {s.is_locked ? "Unlock User" : "Lock User"}
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => removeStaff(s)}
                            >
                              <i className="bi bi-trash3 me-2"></i>
                              Remove
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-outline-secondary me-2"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            <span className="align-self-center">
              Page {page} of {totalPages}
            </span>

            <button
              className="btn btn-outline-secondary ms-2"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}

      {showAddModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow border-0 rounded-4">
              {/* Header */}
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title">
                  <i className="bi bi-person-badge me-2"></i>
                  {selectedStaff ? "Edit Staff Member" : "Add New Staff"}
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                />
              </div>

              {/* Body */}
              <div className="modal-body px-4 py-3">
                {/* Personal Information */}
                <h6 className="text-muted mb-3 fw-semibold">
                  Personal Information
                </h6>

                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Title</label>
                    <select
                      name="title"
                      className="form-select"
                      value={form.title || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
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

                  <div className="col-md-9">
                    <label className="form-label">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      name="full_name"
                      className="form-control"
                      placeholder="Enter full name"
                      value={form.full_name || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      className="form-select"
                      value={form.gender || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">♂ Male</option>
                      <option value="Female">♀ Female</option>
                    </select>
                  </div>
                </div>

                {/* Job Information */}
                <h6 className="text-muted mt-4 mb-3 fw-semibold">
                  Job Information
                </h6>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Designation <span className="text-danger">*</span>
                    </label>
                    <input
                      name="designation"
                      className="form-control"
                      placeholder="e.g Program Officer"
                      value={form.designation || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      File Number <span className="text-danger">*</span>
                    </label>
                    <input
                      name="fileNumber"
                      className="form-control"
                      placeholder="e.g 1739"
                      value={form.fileNumber || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <h6 className="text-muted mt-4 mb-3 fw-semibold">
                  Contact Information
                </h6>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="staff@nphcda.gov.ng"
                      value={form.email || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input
                      name="phone_number"
                      className="form-control"
                      placeholder="080xxxxxxxx"
                      value={form.phone_number || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer bg-light">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>

                <button className="btn btn-success px-4" onClick={saveStaff}>
                  <i className="bi bi-check-circle me-2"></i>
                  {selectedStaff ? "Update Staff" : "Save Staff"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}

      {showImportModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0 rounded-4">
              <div className="modal-header bg-light">
                <h5 className="fw-semibold">
                  <i className="bi bi-file-earmark-arrow-up me-2 text-success"></i>
                  Import Staff from Excel
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setShowImportModal(false)}
                />
              </div>

              <div className="modal-body">
                <label className="form-label fw-semibold">
                  Select Excel File
                </label>

                <input
                  type="file"
                  className="form-control"
                  accept=".xlsx"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />

                <div className="mt-3 small text-muted">
                  Only <b>.xlsx</b> files are supported.
                </div>

                <a
                  href="/templates/staff_import_template.xlsx"
                  className="btn btn-link p-0 mt-3"
                >
                  <i className="bi bi-download me-1"></i>
                  Download Import Template
                </a>
              </div>

              <div className="modal-footer bg-light">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowImportModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-success"
                  disabled={!uploadFile}
                  onClick={uploadExcel}
                >
                  <i className="bi bi-cloud-upload me-2"></i>
                  Upload Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentStaff;
