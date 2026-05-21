import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";

const states = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const ProgramDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [teamLeads, setTeamLeads] = useState([]);
  const [program, setProgram] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [fileNumber, setFileNumber] = useState("");
  const [user, setUser] = useState(null);
  const [state, setState] = useState("");

  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSubmit = user && state;

  /* FETCH DATA */
  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/department/programs/${id}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setProgram(res.data.program);
        setTeamLeads(res.data.teamLeads);
      }
    } catch (err) {
      Swal.fire("Error", "Failed to load program data", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* LOCK BACKGROUND SCROLL */
  useEffect(() => {
    if (showModal) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
  }, [showModal]);

  /* SEARCH USER */
  const searchUser = async () => {
    if (!fileNumber) {
      Swal.fire("Warning", "Enter file number", "warning");
      return;
    }

    setSearching(true);

    try {
      const res = await axios.get(
        `http://localhost:3000/department/users/by-file-number/${fileNumber}`,
      );

      setUser(res.data);

      Swal.fire({
        icon: "success",
        title: "User Found",
        text: `${res.data.title || ""} ${res.data.full_name}`,
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      setUser(null);

      Swal.fire({
        icon: "error",
        title: "Not Found",
        text: "User does not exist or account not active",
      });
    }

    setSearching(false);
  };

  /* ADD TEAM LEAD */
  const addTeamLead = async () => {
    if (!canSubmit) {
      Swal.fire("Incomplete", "Select user and state", "warning");
      return;
    }

    setSaving(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/department/programs/add-team-lead",
        {
          program_id: id,
          user_id: user.id,
          state,
        },
      );

      if (res.data.Status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Team lead added successfully",
          timer: 1200,
          showConfirmButton: false,
        });

        setShowModal(false);
        setUser(null);
        setFileNumber("");
        setState("");
        fetchData();
      } else {
        Swal.fire("Error", res.data.Message || "Failed", "error");
      }
    } catch {
      Swal.fire("Error", "Server error", "error");
    }

    setSaving(false);
  };

  /* CLOSE MODAL RESET */
  const closeModal = () => {
    setShowModal(false);
    setUser(null);
    setFileNumber("");
    setState("");
  };

  return (
    <div className="container py-4">
      {/* HEADER */}

      <div className="mb-4">
        {/* TOP ROW */}
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          {/* LEFT */}
          <div style={{ maxWidth: "750px" }}>
            <h4 className="fw-bold mb-2" style={{ wordBreak: "break-word" }}>
              {program.name}
            </h4>

            <small className="text-muted d-block">{program.description}</small>
          </div>

          {/* RIGHT BUTTON */}
          <div>
            <button
              className="btn bg-success-subtle text-success rounded-pill px-4"
              style={{ backgroundColor: "#0b8585" }}
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-person-plus me-2"></i>
              Add Team Lead
            </button>
          </div>
        </div>

        {/* SECOND ROW (REPORT FORMAT CARD STYLE) */}
        <div className="mt-3 p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <div className="fw-semibold small text-muted">
              <i className="bi bi-file-earmark-text me-1"></i>
              Report Naming Format
            </div>

            <div
              className="small text-dark"
              style={{ wordBreak: "break-word" }}
            >
              {program.reportNameFormat}
            </div>
          </div>

          <button
            className="btn btn-outline-primary btn-sm rounded-pill"
            onClick={() => navigate(`/department/programs/${id}/reports`)}
          >
            <i className="bi bi-bar-chart me-1"></i>
            View Reports
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border">
        <div className="card-body">
          {teamLeads.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people fs-1"></i>
              <div className="mt-2 fw-semibold">No Team Leads Yet</div>
              <small>Add team leads to begin state reporting</small>
            </div>
          ) : (
            <div className="card  border-0">
              {/* HEADER */}
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 fw-bold">Team Leads</h6>
                  <small className="text-muted">
                    List of state team leads for this program
                  </small>
                </div>

                {/* Optional count badge */}
                <span className="badge bg-danger-subtle text-danger">
                  {teamLeads.length} States
                </span>
              </div>

              {/* TABLE */}
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Program Designation</th>
                        <th>State</th>
                        <th>Report Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {teamLeads.map((tl, i) => (
                        <tr key={tl.id}>
                          <td>{i + 1}</td>
                          <td>{tl.name}</td>
                          <td>Team lead</td>
                          <td>
                            <span className="text-dark">{tl.state}</span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                tl.submission_status === "pending"
                                  ? "bg-warning"
                                  : tl.submission_status === "submitted"
                                    ? "bg-success"
                                    : "bg-warning text-dark"
                              }`}
                            >
                              {tl.submission_status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
            onClick={closeModal}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content rounded-4 shadow">
                {/* HEADER */}
                <div className="modal-header border-0">
                  <h5 className="fw-bold">Add Team Lead</h5>
                  <button className="btn-close" onClick={closeModal} />
                </div>

                {/* BODY */}
                <div className="modal-body">
                  {/* FILE NUMBER */}
                  <div className="">
                    <label className="form-label">File Number</label>

                    <div className="d-flex gap-2">
                      <input
                        className="form-control"
                        value={fileNumber}
                        onChange={(e) => setFileNumber(e.target.value)}
                      />

                      <button
                        className="btn btn-secondary"
                        onClick={searchUser}
                        disabled={searching}
                      >
                        {searching ? "..." : "Search"}
                      </button>
                    </div>
                  </div>

                  {/* USER DISPLAY */}
                  {user && (
                    <div className="p-3 border rounded bg-light mb-3 mt-3">
                      <div className="fw-bold">
                        {user.title} {user.full_name}
                      </div>
                      <small className="text-muted">{user.designation}</small>
                    </div>
                  )}

                  {/* STATE */}
                  {user && (
                    <div>
                      <label className="form-label">Select State</label>

                      <select
                        className="form-select"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      >
                        <option value="">Select state</option>
                        {states.map((s, i) => (
                          <option key={i} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {!canSubmit && (
                  <div className="text-muted text-center">
                    <small>Search user and select state to continue</small>
                  </div>
                )}

                {/* FOOTER */}
                <div className="modal-footer border-0">
                  {/* CANCEL (ONLY WHEN USER FOUND) */}
                  {user && (
                    <button className="btn btn-light" onClick={closeModal}>
                      Cancel
                    </button>
                  )}

                  {/* ADD BUTTON (ONLY WHEN READY - FULLY HIDDEN OTHERWISE) */}
                  {canSubmit && (
                    <button
                      className="btn btn-info text-white"
                      onClick={addTeamLead}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Team Lead"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BACKDROP */}
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
        </>
      )}
    </div>
  );
};

export default ProgramDetails;
