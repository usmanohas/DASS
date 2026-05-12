import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const StaffDirectorySuperAdmin = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");

  const [selectedStaff, setSelectedStaff] = useState(null);

  /* =========================
     FETCH STAFF
  ========================= */
  const fetchStaff = async (pageNum = 1) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/admin/staff-directory?page=${pageNum}&limit=10&search=${search}&department=${department}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setStaff(res.data.Data);
        setTotalPages(res.data.totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      Swal.fire("Error", "Failed to fetch staff", "error");
    }
  };

  /* =========================
     FETCH DEPARTMENTS
  ========================= */
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/staff/departments`, {
        withCredentials: true,
      });

      if (res.data.Status) {
        setDepartments(res.data.Departments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStaff(1);
  }, [search, department]);

  /* =========================
     SHARE FUNCTION (UPDATED)
  ========================= */
  const shareStaff = async (s) => {
    const text = `👤 Staff Details

Name: ${s.title || ""} ${s.full_name}
Gender: ${s.gender || "N/A"}
Email: ${s.email}
Phone: ${s.phone_number || "N/A"}
Designation: ${s.designation || "N/A"}
Division/Unit/State: ${s.division_unit_state || "N/A"}
File No: ${s.file_number}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Staff Profile",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);

        Swal.fire({
          icon: "success",
          title: "Copied!",
          text: "Staff details copied to clipboard",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className="container py-4">
      {/* TITLE */}
      <h3 className="mb-4">
        <i className="bi bi-people me-2"></i>
        Staff Directory
      </h3>

      {/* SUMMARY CARD */}
      <div className="card mb-3 shadow-sm border-0 bg-light">
        <div className="card-body d-flex justify-content-between">
          <span>Total Staff Summary</span>
          <strong className="fs-4">
            <span className="badge" style={{ backgroundColor: "#2cd2d2" }}>
              {staff.length}
            </span>
          </strong>
        </div>
      </div>

      {/* FILTERS */}
      <div className="row mb-3">
        <div className="col-md-2">
          <h6 className="text-muted">
            <i className="bi bi-filter me-2"></i> Filter
          </h6>
        </div>
        <div className="col-md-5">
          <select
            className="form-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              className="form-control"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body table-responsive">
          {staff.length === 0 ? (
            <div className="text-center p-5">
              <i className="bi bi-person-x fs-1 text-muted mb-3"></i>
              <h5 className="text-muted fw-bold">No Staff Found</h5>
              <p className="text-secondary">
                There are currently no registered staff matching your search or
                filter criteria.
              </p>
            </div>
          ) : (
            <>
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>File No.</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>

                <tbody>
                  {staff.map((s) => (
                    <tr
                      key={s.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedStaff(s)}
                      data-bs-toggle="modal"
                      data-bs-target="#staffModal"
                    >
                      <td className="">
                        {s.title} {s.full_name}
                      </td>
                      <td>{s.file_number}</td>
                      <td>{s.department_name}</td>
                      <td>{s.email}</td>
                      <td>
                        <small className="small">
                          {s.role_name
                            ?.replace(/_/g, " ")
                            .toLowerCase()
                            .replace(/\b\w/g, (char) => char.toUpperCase())}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINATION */}
              {staff.length > 0 && (
                <div className="d-flex justify-content-center mt-3 gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={page === 1}
                    onClick={() => fetchStaff(page - 1)}
                  >
                    Prev
                  </button>

                  <span className="align-self-center">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={page === totalPages}
                    onClick={() => fetchStaff(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <div className="modal fade" id="staffModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow rounded-4">
            {/* HEADER */}
            <div className="modal-header bg-light">
              <h5 className="modal-title">
                <i className="bi bi-person-bounding-box me-2 text-success"></i>
                Staff Details
              </h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            {/* BODY */}
            <div className="modal-body">
              {selectedStaff && (
                <>
                  <h5 className="fw-bold">
                    {selectedStaff.title} {selectedStaff.full_name}
                  </h5>
                  <p className="text-muted mb-3">
                    {selectedStaff.designation || "Staff"}
                  </p>

                  <div className="mb-3">
                    <p>
                      <i className="bi bi-person me-2"></i>
                      <strong>Gender:</strong> {selectedStaff.gender}
                    </p>
                    <p>
                      <i className="bi bi-envelope me-2"></i>
                      <strong>Email:</strong> {selectedStaff.email}
                    </p>
                    <p>
                      <i className="bi bi-telephone me-2"></i>
                      <strong>Phone:</strong>{" "}
                      {selectedStaff.phone_number || "N/A"}
                    </p>
                    <p>
                      <i className="bi bi-briefcase me-2"></i>
                      <strong>Designation:</strong>{" "}
                      {selectedStaff.designation || "N/A"}
                    </p>
                    <p>
                      <i className="bi bi-geo me-2"></i>
                      <strong>Division/Unit/State:</strong>{" "}
                      {selectedStaff.division_unit_state || "N/A"}
                    </p>
                    <p>
                      <i className="bi bi-file-earmark-text me-2"></i>
                      <strong>File Number:</strong> {selectedStaff.file_number}
                    </p>
                  </div>

                  <hr />

                  {/* ACTION BUTTONS */}
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
                      onClick={() => shareStaff(selectedStaff)}
                    >
                      <i className="bi bi-share-fill me-2"></i>
                      Share
                    </button>

                    <a
                      href={`mailto:${selectedStaff.email}`}
                      className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                    >
                      <i className="bi bi-envelope-fill me-2"></i>
                      Email
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

export default StaffDirectorySuperAdmin;
