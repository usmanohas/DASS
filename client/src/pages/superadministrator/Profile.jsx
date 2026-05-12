import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const SuperAdminProfile = () => {
  const [user, setUser] = useState(null);

  const [editData, setEditData] = useState({
    designation: "",
    email: "",
    phone_number: "",
    title: "",
    division_unit_state: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    axios
      .get("http://localhost:3000/superadmin/user", { withCredentials: true })
      .then((res) => {
        if (res.data.Status) {
          setUser(res.data.user);

          setEditData({
            designation: res.data.user.designation,
            email: res.data.user.email,
            phone_number: res.data.user.phone_number || "",
            title: res.data.user.title || "",
            division_unit_state: res.data.user.division_unit_state || "",
          });
        }
      });
  };

const handleUpdate = async () => {
  setSaving(true);

  try {
    const res = await axios.put(
      "http://localhost:3000/superadmin/profile/update",
      editData,
      { withCredentials: true }
    );

    if (res.data.Status) {

      loadProfile();

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: res.data.Message || "Your profile has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {

        const modal = document.getElementById("editProfileModal");

        if (modal) {
          const modalInstance =
            window.bootstrap?.Modal?.getOrCreateInstance(modal);

          modalInstance.hide();
        }

      });

    } else {

      if (res.data.Error === "No changes detected") {
        Swal.fire({
          icon: "info",
          title: "No Changes Made",
          text: "You did not modify any profile fields.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: res.data.Error || "Unable to update profile.",
        });
      }

    }

  } catch (err) {
    console.log(err);

    if (err.response) {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: err.response.data?.Error || "Update failed",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Server not reachable. Please check your connection.",
      });
    }
  }

  setSaving(false);
};

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success"></div>
      </div>
    );
  }

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="container py-4">
      <h3 className="mb-4">
        <i className="bi bi-person-bounding-box me-2"></i>
        My Profile
      </h3>

      <div className="row g-4">
        {/* PROFILE CARD */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body">
              <div
                className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "70px",
                  height: "70px",
                  backgroundColor: "#25d366",
                  color: "#fff",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {initials}
              </div>

              <h6 className="fw-bold">
                {user.title}{" "}{user.full_name}
              </h6>
              <span className="fw-semibold mb-0">Super Administrator</span>

              <hr />

              <div className="small text-start">
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phone_number || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">
                <i className="bi bi-info-circle me-2"></i>
                Account Information
              </h6>

              <div className="row small">
                <div className="col-md-6 mb-3">
                  <strong>Full Name</strong>
                  <div>{user.title}{" "}{user.full_name}</div>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>Gender</strong>
                  <div>{user.gender}</div>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>Department</strong>
                  <div>{user.department}</div>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>Designation</strong>
                  <div>{user.designation}</div>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>File Number</strong>
                  <div>{user.file_number}</div>
                </div>

                <div className="col-md-6 mb-3">
                  <strong className="me-2">Status</strong>
                  {user.is_active ? (
                    <span className="badge text-white" style={{ backgroundColor: "#25d366" }}>Active</span>
                  ) : (
                    <span className="badge bg-danger">Inactive</span>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <strong>Created</strong>
                  <div>{new Date(user.created_at).toLocaleDateString("en-GB")}</div>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>Last Login</strong>
                  <div>{user.last_login || "-"}</div>
                </div>
              </div>

              <hr />

              <button
                className="btn btn-outline-success btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#editProfileModal"
              >
                <i className="bi bi-pencil me-2"></i>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <div className="modal fade" id="editProfileModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"><i className="bi bi-pencil-square me-2"></i>Edit Profile</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Title</label>
                <select
                  className="form-select"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
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

              <div className="mb-3">
                <label className="form-label">Designation</label>
                <input
                  className="form-control"
                  value={editData.designation}
                  onChange={(e) =>
                    setEditData({ ...editData, designation: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Division/Unit/State</label>
                <input
                  className="form-control"
                  value={editData.division_unit_state}
                  onChange={(e) =>
                    setEditData({ ...editData, division_unit_state: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  value={editData.phone_number}
                  onChange={(e) =>
                    setEditData({ ...editData, phone_number: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>

              <button
                className="btn btn-success"
                onClick={handleUpdate}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminProfile;
