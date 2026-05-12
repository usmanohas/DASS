import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const TeamLead = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:3000/staff/team-lead/programs",
        { withCredentials: true },
      );

      if (res.data.Status) {
        setPrograms(res.data.data);
      }
    } catch {
      Swal.fire("Error", "Failed to load programs", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return (
    <div className="container py-4">
      {/* HEADER */}

      <div className="mb-4">
        <h3 className=""><span className="bi bi-people me-1"></span>Team Lead</h3>
        <small className="text-muted">
          You have been assigned as a team lead for the following programs
        </small>
      </div>

      {/* CARD */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border"></div>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center text-muted py-5">
              No assigned programs
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Program</th>
                    <th>Department</th>
                    <th>State</th>
                    <th>Status</th>
                    <th>Date Assigned</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {programs.map((p, i) => (
                    <tr
                      key={p.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/staff/program/team-lead/${p.id}`)}
                    >
                      <td>{i + 1}</td>

                      <td className="fw-semibold">{p.name}</td>

                      <td className="text-muted small">{p.department_name || "—"}</td>

                      <td>
                        <small className="">
                          {p.state}
                        </small>
                      </td>

                      <td>
                        {p.submission_status === "submitted" ? (
                          <span className="badge bg-success">Submitted</span>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="text-muted small">
                        {new Date(p.created_at).toLocaleDateString("en-GB")}
                      </td>

                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent row click
                            navigate(`/staff/program/team-lead/${p.id}`);
                          }}
                        >
                          <span className="bi bi-eye"></span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamLead;
