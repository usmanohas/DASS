import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Colleague = () => {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStaff = async (pageNum = 1, searchTerm = "") => {
    try {
      const res = await axios.get(
        `http://localhost:3000/staff/list?page=${pageNum}&limit=10&search=${searchTerm}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setStaff(res.data.Data);
        setTotalPages(res.data.totalPages);
        setPage(pageNum);
      }
    } catch {
      Swal.fire("Error", "Failed to fetch staff", "error");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchStaff(1, val);
  };

  const shareStaff = (s) => {
    const text = `Staff Info:\nName: ${s.title} ${s.full_name}\nGender: ${s.gender}\nEmail: ${s.email}\nPhone: ${s.phone_number}\nDesignation: ${s.designation}\nDivision/Unit/State: ${s.division_unit_state}`;

    if (navigator.share) {
      navigator.share({ title: "Staff Details", text });
    } else {
      navigator.clipboard.writeText(text);
      Swal.fire("Copied", "Staff details copied", "success");
    }
  };

  return (
    <div className="container py-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h3 className="mb-0">
          <i className="bi bi-people me-2"></i> Department Staff
        </h3>

        <input
          type="text"
          placeholder="Search staff..."
          className="form-control w-auto"
          style={{ minWidth: "250px" }}
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Designation</th>
                  <th>Division/Unit/State</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {staff.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-3">
                      No staff found
                    </td>
                  </tr>
                )}

                {staff.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td className="fw-semibold">
                      {s.title} {s.full_name}
                    </td>
                    <td>{s.gender}</td>
                    <td>{s.designation}</td>
                    <td>{s.division_unit_state}</td>

                    {/* ACTIONS */}
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        {/* VIEW */}
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          data-bs-toggle="modal"
                          data-bs-target="#staffModal"
                          onClick={() => setSelected(s)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* PAGINATION */}
          <div className="d-flex justify-content-center mt-4 gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={page === 1}
              onClick={() => fetchStaff(page - 1, search)}
            >
              Previous
            </button>

            <span className="align-self-center">
              Page {page} of {totalPages}
            </span>

            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={page === totalPages}
              onClick={() => fetchStaff(page + 1, search)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <div className="modal fade" id="staffModal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title">Staff Details</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              {selected && (
                <>
                  <h5 className="fw-bold">
                    {selected.title} {selected.full_name}
                  </h5>

                  <div className="mt-3">
                    <p>
                      <strong>Gender:</strong> {selected.gender}
                    </p>
                    <p>
                      <strong>Email:</strong> {selected.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selected.phone_number}
                    </p>
                    <p>
                      <strong>Designation:</strong> {selected.designation}
                    </p>
                    <p>
                      <strong>Division/Unit/State:</strong>{" "}
                      {selected.division_unit_state}
                    </p>
                    <p>
                      <strong>File Number:</strong>{" "}
                      <span className="badge bg-success">
                        {selected.file_number}
                      </span>
                    </p>
                  </div>

                  <hr />

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success w-100"
                      onClick={() => shareStaff(selected)}
                    >
                      <i className="bi bi-share me-1"></i> Share
                    </button>

                    <a
                      href={`mailto:${selected.email}`}
                      className="btn btn-danger w-100"
                    >
                      <i className="bi bi-envelope me-1"></i> Email
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Colleague;
