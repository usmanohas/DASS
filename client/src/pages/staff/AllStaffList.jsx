import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AllStaffList = () => {
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
        `http://localhost:3000/staff/staff-directory?page=${pageNum}&limit=10&search=${search}&department=${department}`,
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
      const res = await axios.get(
        `http://localhost:3000/staff/departments`,
        {
          withCredentials: true,
        },
      );

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
Division/Unit/State: ${s.division_unit_state || "N/A"}`;

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
    <div className="container-fluid py-4">
      {/* ================= HEADER ================= */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div
          className="p-4"
          style={{
            background: "linear-gradient(135deg, #ef6c00 0%, #ff8f00 100%)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            {/* LEFT */}
            <div className="text-white">
              <h3 className="fw-bold mb-1">
                <i className="bi bi-people-fill me-2"></i>
                Staff Directory
              </h3>

              <p className="mb-0 opacity-75">
                Browse and search staff across departments
              </p>
            </div>

            {/* RIGHT */}
            <div className="bg-white rounded-4 px-4 py-3 shadow-sm text-center">
              <div
                className="fw-bold"
                style={{
                  fontSize: "2rem",
                  color: "#ef6c00",
                  lineHeight: "1",
                }}
              >
                {staff.length}
              </div>

              <small className="text-muted fw-semibold">Staff Displayed</small>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FILTER CARD ================= */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center mb-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: "45px",
                height: "45px",
                background: "rgba(241, 125, 9, 0.15)",
                color: "#ef6c00",
              }}
            >
              <i className="bi bi-funnel-fill"></i>
            </div>

            <div>
              <h6 className="fw-bold mb-0">Filter Staff</h6>
              <small className="text-muted">
                Search and filter staff records
              </small>
            </div>
          </div>

          <div className="row g-3">
            {/* DEPARTMENT */}
            <div className="col-lg-4">
              <label className="form-label small fw-semibold text-muted">
                Department
              </label>

              <select
                className="form-select shadow-sm border-0 bg-light"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  height: "50px",
                  borderRadius: "14px",
                }}
              >
                <option value="all">All Departments</option>

                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SEARCH */}
            <div className="col-lg-5">
              <label className="form-label small fw-semibold text-muted">
                Search Staff
              </label>

              <div
                className="input-group shadow-sm"
                style={{
                  borderRadius: "14px",
                  overflow: "hidden",
                }}
              >
                <span className="input-group-text border-0 bg-light px-3">
                  <i className="bi bi-search text-muted"></i>
                </span>

                <input
                  className="form-control border-0 bg-light"
                  placeholder="Search by name, email, file number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    height: "50px",
                  }}
                />
              </div>
            </div>

            {/* CLEAR */}
            <div className="col-lg-3 d-flex align-items-end">
              <button
                className="btn w-100 text-white fw-semibold shadow-sm"
                style={{
                  backgroundColor: "#ef6c00",
                  height: "50px",
                  borderRadius: "14px",
                }}
                onClick={() => {
                  setSearch("");
                  setDepartment("all");
                }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STAFF TABLE ================= */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          {/* EMPTY */}
          {staff.length === 0 ? (
            <div className="text-center py-5">
              <div
                className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "90px",
                  height: "90px",
                  background: "rgba(247, 141, 11, 0.12)",
                }}
              >
                <i className="bi bi-person-x fs-1 text-muted"></i>
              </div>

              <h5 className="fw-bold text-muted">No Staff Found</h5>

              <p className="text-secondary mb-0">
                No staff records match your current search criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead
                    style={{
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <tr>
                      <th className="px-4 py-3 text-muted small fw-bold">
                        STAFF
                      </th>

                      <th className="py-3 text-muted small fw-bold">
                        FILE NUMBER
                      </th>

                      <th className="py-3 text-muted small fw-bold">
                        DEPARTMENT
                      </th>

                      <th className="py-3 text-muted small fw-bold">EMAIL</th>

                      <th className="py-3 text-muted small fw-bold">ROLE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {staff.map((s) => (
                      <tr
                        key={s.id}
                        role="button"
                        data-bs-toggle="modal"
                        data-bs-target="#staffModal"
                        onClick={() => setSelectedStaff(s)}
                        style={{
                          transition: "all 0.2s ease",
                        }}
                        className="border-top"
                      >
                        {/* STAFF */}
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                              style={{
                                width: "48px",
                                height: "48px",
                                backgroundColor: "#ef6c00",
                                fontSize: "0.95rem",
                              }}
                            >
                              {s.full_name?.charAt(0)}
                            </div>

                            <div>
                              <div className="fw-semibold">
                                {s.title} {s.full_name}
                              </div>

                              <small className="text-muted">
                                {s.designation || "Staff"}
                              </small>
                            </div>
                          </div>
                        </td>

                        {/* FILE */}
                        <td>
                          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                            ****
                          </span>
                        </td>

                        {/* DEPARTMENT */}
                        <td>
                          <span className="fw-medium">{s.department_name}</span>
                        </td>

                        {/* EMAIL */}
                        <td>
                          <small className="text-muted">{s.email}</small>
                        </td>

                        {/* ROLE */}
                        <td>
                          <span
                            className="badge rounded-pill px-3 py-2"
                            style={{
                              background: "rgba(241, 131, 13, 0.15)",
                              color: "#ef6c00",
                            }}
                          >
                            {s.role_name
                              ?.replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (char) => char.toUpperCase())}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ================= PAGINATION ================= */}
              <div className="d-flex justify-content-between align-items-center p-4 border-top flex-wrap gap-3">
                <div className="text-muted small">
                  Showing page <strong>{page}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-light border px-4"
                    disabled={page === 1}
                    onClick={() => fetchStaff(page - 1)}
                    style={{
                      borderRadius: "12px",
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Previous
                  </button>

                  <button
                    className="btn text-white px-4"
                    disabled={page === totalPages}
                    onClick={() => fetchStaff(page + 1)}
                    style={{
                      backgroundColor: "#ef6c00",
                      borderRadius: "12px",
                    }}
                  >
                    Next
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= STAFF MODAL ================= */}
      <div className="modal fade" id="staffModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
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

            {/* BODY */}
            <div className="modal-body p-4">
              {selectedStaff && (
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
                      {selectedStaff.full_name?.charAt(0)}
                    </div>

                    <div>
                      <h4 className="fw-bold mb-1">
                        {selectedStaff.title} {selectedStaff.full_name}
                      </h4>

                      <p className="text-muted mb-1">
                        {selectedStaff.designation || "Staff"}
                      </p>

                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          background: "rgba(239, 166, 9, 0.15)",
                          color: "#ef6c00",
                        }}
                      >
                        {selectedStaff.department_name}
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
                          {selectedStaff.gender || "N/A"}
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
                          {selectedStaff.email}
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
                          {selectedStaff.phone_number || "N/A"}
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
                          {selectedStaff.division_unit_state || "N/A"}
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
                      onClick={() => shareStaff(selectedStaff)}
                    >
                      <i className="bi bi-share-fill me-2"></i>
                      Share Profile
                    </button>

                    <a
                      href={`mailto:${selectedStaff.email}`}
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

export default AllStaffList;
