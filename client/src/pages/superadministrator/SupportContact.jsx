import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const ManageSupportContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/superadmin/support-contacts",
        { withCredentials: true }
      );

      if (res.data.Status) setContacts(res.data.Data);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch contacts", "error");
    }
  };

  /* ================= UPDATE FIELD ================= */
  const handleChange = (index, field, value) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  /* ================= UPDATE CONTACT ================= */
  const updateContact = async (c) => {
    try {
      setLoadingId(c.id);

      const res = await axios.put(
        `http://localhost:3000/superadmin/support-contacts/${c.id}`,
        c,
        { withCredentials: true }
      );

      if (res.data.Status) {
        Swal.fire("Success", "Contact updated successfully", "success");
        fetchContacts();
      }
    } catch (err) {
      Swal.fire("Error", "Update failed", "error");
    } finally {
      setLoadingId(null);
    }
  };

  /* ================= TYPE BADGE ================= */
  const getTypeBadge = (type) => {
    switch (type) {
      case "LINE_MANAGER":
        return "badge bg-success";
      case "DEVELOPER":
        return "badge bg-primary";
      case "HELP_DESK":
        return "badge bg-warning text-dark";
      default:
        return "badge bg-secondary";
    }
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold">
          <i className="bi bi-headset me-2 text-success"></i>
          Manage Support Contacts
        </h3>
        <small className="text-muted">
          Update system support, developer and help desk contact details
        </small>
      </div>

      <div className="row g-4">
        {contacts.map((c, i) => (
          <div className="col-md-4" key={c.id}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className={getTypeBadge(c.type)}>
                    {c.type.replace("_", " ")}
                  </span>

                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: 45,
                      height: 45,
                      backgroundColor: c.color || "#198754",
                      color: "#fff",
                    }}
                  >
                    {c.initials || "NA"}
                  </div>
                </div>

                {/* FORM */}
                <div className="row g-2">

                  {/* TITLE */}
                  <div className="col-12">
                    <label className="form-label small text-muted">
                      Title / Role
                    </label>
                    <input
                      className="form-control"
                      value={c.title || ""}
                      onChange={(e) =>
                        handleChange(i, "title", e.target.value)
                      }
                    />
                  </div>

                  {/* SUBTITLE */}
                  <div className="col-12">
                    <label className="form-label small text-muted">
                      Department / Description
                    </label>
                    <input
                      className="form-control"
                      value={c.subtitle || ""}
                      onChange={(e) =>
                        handleChange(i, "subtitle", e.target.value)
                      }
                    />
                  </div>

                  {/* NAME */}
                  <div className="col-12">
                    <label className="form-label small text-muted">
                      Contact Name
                    </label>
                    <input
                      className="form-control"
                      value={c.name || ""}
                      onChange={(e) =>
                        handleChange(i, "name", e.target.value)
                      }
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="col-12">
                    <label className="form-label small text-muted">
                      Email Address
                    </label>
                    <input
                      className="form-control"
                      value={c.email || ""}
                      onChange={(e) =>
                        handleChange(i, "email", e.target.value)
                      }
                    />
                  </div>

                  {/* PHONE */}
                  <div className="col-12">
                    <label className="form-label small text-muted">
                      Phone Number
                    </label>
                    <input
                      className="form-control"
                      value={c.phone || ""}
                      onChange={(e) =>
                        handleChange(i, "phone", e.target.value)
                      }
                    />
                  </div>

                  {/* EXTRA INFO */}
                  <div className="col-12">
                    <label className="form-label small text-muted">
                      Extra Info (e.g. Working Hours)
                    </label>
                    <input
                      className="form-control"
                      value={c.extra_info || ""}
                      onChange={(e) =>
                        handleChange(i, "extra_info", e.target.value)
                      }
                    />
                  </div>

                  {/* COLOR + INITIALS */}
                  <div className="col-6">
                    <label className="form-label small text-muted">
                      Card Color
                    </label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={c.color || "#198754"}
                      onChange={(e) =>
                        handleChange(i, "color", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label small text-muted">
                      Initials
                    </label>
                    <input
                      className="form-control"
                      value={c.initials || ""}
                      onChange={(e) =>
                        handleChange(i, "initials", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* SAVE BUTTON */}
                <button
                  className="btn btn-success w-100 mt-3"
                  onClick={() => updateContact(c)}
                  disabled={loadingId === c.id}
                >
                  {loadingId === c.id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-1"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageSupportContacts;