import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    name_abbreviation: "",
  });

  /* ================= FETCH ================= */
  const fetchDepartments = async () => {
    const res = await axios.get(
      "http://localhost:3000/superadmin/departments",
      { withCredentials: true }
    );

    if (res.data.Status) setDepartments(res.data.Departments);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  /* ================= MODAL ================= */
  const openCreate = () => {
    setIsEdit(false);
    setForm({ name: "", name_abbreviation: "" });
    setShowModal(true);
  };

  const handleEdit = (dept) => {
    setIsEdit(true);
    setEditId(dept.id);
    setForm({
      name: dept.name,
      name_abbreviation: dept.name_abbreviation || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setEditId(null);
  };

  /* ================= CREATE ================= */
  const createDepartment = async () => {
    const res = await axios.post(
      "http://localhost:3000/superadmin/departments/create",
      form,
      { withCredentials: true }
    );

    if (res.data.Status) {
      Swal.fire("Success", res.data.Message, "success");
      fetchDepartments();
      closeModal();
    } else {
      Swal.fire("Error", res.data.Error, "error");
    }
  };

  /* ================= UPDATE ================= */
  const updateDepartment = async () => {
    const res = await axios.put(
      `http://localhost:3000/superadmin/departments/update/${editId}`,
      form,
      { withCredentials: true }
    );

    if (res.data.Status) {
      Swal.fire("Success", res.data.Message, "success");
      fetchDepartments();
      closeModal();
    } else {
      Swal.fire("Error", res.data.Error, "error");
    }
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <h3 className="">
          <i className="bi bi-building me-2"></i>
          Department Management
        </h3>

        <button className="btn btn-success" title="Add department" onClick={openCreate}>
          <i className="bi bi-plus-circle"></i>
        </button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Abbreviation</th>
                <th>Created</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {departments.map((d, i) => (
                <tr key={d.id}>
                  <td>{i + 1}</td>
                  <td className="text-muted">{d.name}</td>
                  <td className="text-muted">{d.name_abbreviation || "-"}</td>
                  <td className="text-muted small">
                    {new Date(d.created_at).toLocaleDateString("en-GB")}
                  </td>

                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => handleEdit(d)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {departments.length === 0 && (
            <div className="text-center text-muted py-4">
              No departments found
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <>
          <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h6 className="modal-title">
                    {isEdit ? "Edit Department" : "Create Department"}
                  </h6>
                  <button className="btn-close" onClick={closeModal}></button>
                </div>

                <div className="modal-body">
                  <input
                    className="form-control mb-4"
                    placeholder="Department Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />

                  <input
                    className="form-control"
                    placeholder="Abbreviation"
                    value={form.name_abbreviation}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name_abbreviation: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="modal-footer">
                  <button className="btn btn-light" onClick={closeModal}>
                    Cancel
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={isEdit ? updateDepartment : createDepartment}
                  >
                    {isEdit ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1050 }}
          ></div>
        </>
      )}
    </div>
  );
};

export default DepartmentManagement;