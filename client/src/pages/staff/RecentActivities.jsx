import React, { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import API_BASE_URL from "../../config/baseUrl";

const RecentActivities = () => {
  const { user } = useOutletContext();
  const [activities, setActivities] = useState([]);

  const [openRow, setOpenRow] = useState(null);

  const toggleRow = (index) => {
    setOpenRow(openRow === index ? null : index);
  };

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/staff/recent-activities`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setActivities(res.data.Data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card shadow-sm p-3">
      <h5><i class="bi bi-activity  me-2" style={{color:"#ef6c00"}}></i>5 Most Recent Activities</h5>
      {activities.length === 0 ? (
        <div className="text-muted text-center py-3">No recent activity</div>
      ) : (
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: "180px" }}>Date & Time</th>
              <th style={{ width: "180px" }}>Action</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((act, index) => {
              let oldValue = null;
              let newValue = null;

              try {
                oldValue = act.old_values ? JSON.parse(act.old_values) : null;
                newValue = act.new_values ? JSON.parse(act.new_values) : null;
              } catch (e) {}

              const isUpdate = act.action?.toUpperCase().includes("UPDATE");
              const hasChanges = isUpdate && (oldValue || newValue);

              return (
                <>
                  {/* MAIN ROW */}
                  <tr
                    key={index}
                    style={{ cursor: hasChanges ? "pointer" : "default" }}
                    onClick={() => hasChanges && toggleRow(index)}
                  >
                    <td className="text-muted">{act.date}</td>

                    <td className="text-capitalize text-muted">
                      <small>{act.action.replace("_", " ")}</small>
                    </td>

                    <td>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">{act.description}</span>

                        {/* Expand icon */}
                        {hasChanges && (
                          <i
                            className={`bi ${
                              openRow === index
                                ? "bi-chevron-up"
                                : "bi-chevron-down"
                            }`}
                          ></i>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* COLLAPSIBLE ROW */}
                  {hasChanges && openRow === index && (
                    <tr>
                      <td colSpan="3" className="bg-light">
                        <div className="p-3">
                          <div className="row">
                            {/* OLD VALUES */}
                            <div className="col-md-6">
                              <div className="fw-semibold text-danger mb-2">
                                Old Values
                              </div>

                              {oldValue ? (
                                Object.entries(oldValue).map(([key, val]) => (
                                  <div key={key} className="small mb-1">
                                    <span className="fw-semibold">{key}:</span>{" "}
                                    <span className="text-muted">
                                      {String(val)}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-muted small">No data</div>
                              )}
                            </div>

                            {/* NEW VALUES */}
                            <div className="col-md-6">
                              <div className="fw-semibold text-success mb-2">
                                New Values
                              </div>

                              {newValue ? (
                                Object.entries(newValue).map(([key, val]) => (
                                  <div key={key} className="small mb-1">
                                    <span className="fw-semibold">{key}:</span>{" "}
                                    <span className="text-muted">
                                      {String(val)}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-muted small">No data</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RecentActivities;
