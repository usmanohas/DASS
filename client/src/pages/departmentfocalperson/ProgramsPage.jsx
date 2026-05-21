import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ProgramsPage = () => {
  const [programs, setPrograms] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    reportNameFormat: "",
  });
  const [saving, setSaving] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const navigate = useNavigate();

  const truncate = (text, length = 50) =>
    text.length > length ? text.substring(0, length) + "…" : text;

  /* ================= FETCH ================= */
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/department/programs?page=${page}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setPrograms(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      Swal.fire("Error", "Failed to load programs", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrograms();
  }, [page]);

  /* ================= MODAL CONTROL ================= */
  const closeModal = () => {
    setShowModal(false);
    setForm({ name: "", description: "", reportNameFormat: "" });
    setEditMode(false);
    setSelectedId(null);
    setSaving(false);
  };

  /* ================= OPEN EDIT ================= */
  const openEdit = (program) => {
    setEditMode(true);
    setSelectedId(program.id);
    setForm({
      name: program.name,
      description: program.description,
      reportNameFormat: program.reportNameFormat,
    });
    setShowModal(true);
  };

  useEffect(() => {
    if (showModal) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
  }, [showModal]);

  /* ================= SAVE ================= */
  const saveProgram = async () => {
    if (!form.name || !form.description) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Program name and description are required",
      });
      return;
    }

    setSaving(true);

    try {
      const url = editMode
        ? `http://localhost:3000/department/programs/${selectedId}`
        : `http://localhost:3000/department/programs`;

      const method = editMode ? "put" : "post";

      const res = await axios[method](url, form, {
        withCredentials: true,
      });

      if (res.data.Status) {
        await Swal.fire({
          icon: "success",
          title: editMode ? "Updated" : "Created",
          text: editMode
            ? "Program updated successfully"
            : "Program created successfully",
          timer: 1200,
          showConfirmButton: false,
        });

        closeModal();
        fetchPrograms();
      } else {
        Swal.fire("Error", res.data.Message || "Failed", "error");
      }
    } catch {
      Swal.fire("Error", "Server error", "error");
    }

    setSaving(false);
  };

  /* ================= UI ================= */
  return (
    <div className="container-fluid py-4 px-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            <i className="bi bi-droplet fs-1 me-2"></i>Programs & Campaigns
          </h3>
          <small className="text-muted">
            Manage national and state-level campaigns
          </small>
        </div>

        <button
          className="btn bg-success-subtle text-success rounded-pill px-4"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          New Program
        </button>
      </div>

      {/* CARD */}
      <div className="card border shadow-sm rounded-2 mb-4">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <div className="mt-2 text-muted">Loading programs...</div>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-droplet fs-1"></i>
              <div className="mt-2">No programs created yet</div>
            </div>
          ) : (
            <>
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Program</th>
                          <th>Created By</th>
                          <th>Date Created</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {programs.map((p, i) => (
                          <tr key={p.id}>
                            <td>{i + 1}</td>

                            <td className="fw-semibold">
                              {truncate(p.name || "—", 25)}
                            </td>

                            <td>
                              <div className="text-muted small">
                                {p.created_by_name}
                              </div>
                            </td>

                            <td className="text-muted">
                              {new Date(p.created_at).toLocaleDateString(
                                "en-GB",
                              )}
                            </td>

                            {/* ACTION BUTTONS */}
                            <td>
                              <div className="d-flex justify-content-center gap-2 flex-nowrap">
                                <button
                                  className="btn btn-sm btn-secondary rounded-pill px-3"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/department/programs/${p.id}`);
                                  }}
                                >
                                  <i className="bi bi-eye me-1"></i> View
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-warning"
                                  onClick={() => openEdit(p)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION */}
                  <div className="d-flex justify-content-between align-items-center p-3">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      ← Previous
                    </button>

                    <span className="small text-muted">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={closeModal}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content rounded-4">
                <div className="modal-header border-0">
                  <h5>{editMode ? "Edit Program" : "Create Program"}</h5>
                  <button className="btn-close" onClick={closeModal} />
                </div>

                <div className="modal-body">
                  {/* PROGRAM NAME */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Program Name *
                    </label>
                    <input
                      className="form-control"
                      placeholder="e.g. IEV 2026"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Description *
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Program description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>

                  {/* REPORT NAMING FORMAT */}
                  <div className="mb-2">
                    <label className="form-label fw-semibold">
                      Report Naming Format
                    </label>

                    <input
                      className="form-control"
                      placeholder="STATE_MR_2026_REPORT"
                      value={form.reportNameFormat}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          reportNameFormat: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* SAMPLE PREVIEW */}
                  <div className="p-2 rounded bg-light border small">
                    <div className="text-muted mb-1">Example:</div>

                    <div className="fw-semibold text-dark">
                      <p className="p-0 m-0">Kwara_state_MR_2026_REPORT.pdf</p>
                      <p className="p-0 m-0">
                        Kano_state_IEV_2026_PHASE1_REPORT.pdf
                      </p>
                    </div>
                  </div>

                  {/* HELP TEXT */}
                  <small className="text-muted d-block mt-2">
                    Team leads must follow this format when uploading reports.
                    Timestamp will be added automatically.
                  </small>
                </div>

                <div className="modal-footer border-0">
                  <button className="btn btn-light" onClick={closeModal}>
                    Cancel
                  </button>

                  <button
                    className="btn btn-info text-white"
                    onClick={saveProgram}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : editMode ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default ProgramsPage;
