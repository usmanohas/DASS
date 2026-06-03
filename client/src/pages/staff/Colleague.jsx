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
        <h3 className="mb-0 fw-bold">
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
      <div className="modal fade" id="staffModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
            {/* HEADER */}
            <div
              className="p-4 text-white"
              style={{
                background:
                  "linear-gradient(135deg, #ef6c00 0%, #ff8f00 100%)",
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h4 className="fw-bold mb-1">
                    <i className="bi bi-person-badge me-2"></i>
                    Staff Profile
                  </h4>

                  <p className="mb-0 opacity-75">Detailed staff information</p>
                </div>

                <button
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                ></button>
              </div>
            </div>
            <div className="modal-body">
              {selected && (
                <>
                {/* PROFILE */}
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{
                        width: "75px",
                        height: "75px",
                        backgroundColor: "#ef6c00",
                        fontSize: "1.5rem",
                      }}
                    >
                      {selected.full_name?.charAt(0)}
                    </div>

                    <div>
                      <h4 className="fw-bold mb-1">
                        {selected.title} {selected.full_name}
                      </h4>
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          background: "rgba(239, 166, 9, 0.15)",
                          color: "#ef6c00",
                        }}
                      >
                        {selected.designation}
                      </span>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="border rounded-4 p-3 h-100 bg-light">
                        <small className="text-muted d-block mb-1">
                          Gender
                        </small>

                        <div className="fw-semibold">
                          <i className="bi bi-person me-2 text-success"></i>
                          {selected.gender || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="border rounded-4 p-3 h-100 bg-light">
                        <small className="text-muted d-block mb-1">
                          Email Address
                        </small>

                        <div className="fw-semibold text-break">
                          <i className="bi bi-envelope me-2 text-success"></i>
                          {selected.email}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="border rounded-4 p-3 h-100 bg-light">
                        <small className="text-muted d-block mb-1">
                          Phone Number
                        </small>

                        <div className="fw-semibold">
                          <i className="bi bi-telephone me-2 text-success"></i>
                          {selected.phone_number || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="border rounded-4 p-3 h-100 bg-light">
                        <small className="text-muted d-block mb-1">
                          File Number
                        </small>

                        <div className="fw-semibold">
                          <i className="bi bi-file-earmark-text me-2 text-success"></i>
                          ****
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="border rounded-4 p-3 bg-light">
                        <small className="text-muted d-block mb-1">
                          Division / Unit / State
                        </small>

                        <div className="fw-semibold">
                          <i className="bi bi-geo-alt me-2 text-success"></i>
                          {selected.division_unit_state || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ACTIONS */}
                  <div className="d-flex gap-3 mt-4">
                    <button
                      className="btn text-white flex-fill"
                      style={{
                        backgroundColor: "#ef6c00",
                        borderRadius: "14px",
                        height: "50px",
                      }}
                      onClick={() => shareStaff(selected)}
                    >
                      <i className="bi bi-share-fill me-2"></i>
                      Share Profile
                    </button>

                    <a
                      href={`mailto:${selected.email}`}
                      className="btn btn-light border flex-fill d-flex align-items-center justify-content-center"
                      style={{
                        borderRadius: "14px",
                        height: "50px",
                      }}
                    >
                      <i className="bi bi-envelope-fill me-2"></i>
                      Send Email
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
