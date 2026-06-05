import React, {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const StorageDashboard = () => {
  const [data, setData] =
    useState(null);

  const [allocatedMB, setAllocatedMB] =
    useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const res = await axios.get(
      `${API_BASE_URL}/superadmin/storage-dashboard`,
      {
        withCredentials: true,
      }
    );

    if (res.data.Status) {
      setData(res.data.Data);

      setAllocatedMB(
        res.data.Data.allocatedMB
      );
    }
  };

  const saveStorage = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/superadmin/storage-dashboard`,
        {
          allocated_storage_mb:
            allocatedMB,
        },
        {
          withCredentials: true,
        }
      );

      Swal.fire(
        "Success",
        "Storage updated",
        "success"
      );

      fetchDashboard();
    } catch {
      Swal.fire(
        "Error",
        "Failed to update",
        "error"
      );
    }
  };

  const bytesToGB = (bytes) =>
    (
      bytes /
      1024 /
      1024 /
      1024
    ).toFixed(2);

  const bytesToMB = (bytes) =>
    (
      bytes /
      1024 /
      1024
    ).toFixed(2);

  if (!data)
    return (
      <div className="text-center py-5">
        <div className="spinner-border" />
      </div>
    );

  return (
    <div className="container py-4">

      <div className="mb-4">
        <h3 className="fw-bold">
          <i className="bi bi-hdd-stack me-2"></i>
          Storage Dashboard
        </h3>

        <small className="text-muted">
          Manage storage allocation
          and monitor usage
        </small>
      </div>

      {Number(data.utilization) >=
        80 && (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>

          Storage utilization has
          exceeded 80%.
        </div>
      )}

      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">
                Allocated Storage
              </small>

              <h4>
                {(
                  data.allocatedMB /
                  1024
                ).toFixed(2)}
                GB
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">
                Used Storage
              </small>

              <h4>
                {bytesToGB(
                  data.usedBytes
                )}
                GB
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">
                Available
              </small>

              <h4>
                {bytesToGB(
                  data.availableBytes
                )}
                GB
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">
                Utilization
              </small>

              <h4>
                {data.utilization}%
              </h4>
            </div>
          </div>
        </div>

      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <label className="form-label fw-semibold">
            Storage Allocation (MB)
          </label>

          <div className="input-group">
            <input
              type="number"
              className="form-control"
              value={allocatedMB}
              onChange={(e) =>
                setAllocatedMB(
                  e.target.value
                )
              }
            />

            <button
              className="btn btn-danger"
              onClick={saveStorage}
            >
              Update
            </button>
          </div>

        </div>
      </div>

      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">

              <small className="text-muted">
                Total Documents
              </small>

              <h3>
                {data.totalDocuments}
              </h3>

            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">

              <small className="text-muted">
                Average File Size
              </small>

              <h3>
                {bytesToMB(
                  data.avgFileSize
                )}
                MB
              </h3>

            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">

              <small className="text-muted">
                Largest File
              </small>

              <div className="fw-semibold">
                {
                  data.largestFile
                    ?.title
                }
              </div>

            </div>
          </div>
        </div>

      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <h6 className="mb-0">
            Storage By Department
          </h6>
        </div>

        <div className="table-responsive">
          <table className="table table-hover mb-0">

            <thead>
              <tr>
                <th>Department</th>
                <th className="text-center">Documents</th>
                <th>Storage Used</th>
              </tr>
            </thead>

            <tbody>
              {data.departments.map(
                (dept) => (
                  <tr
                    key={
                      dept.department_name
                    }
                  >
                    <td>
                      {
                        dept.department_name
                      }
                    </td>

                    <td className="text-center">
                      {
                        dept.total_documents
                      }
                    </td>

                    <td>
                      {bytesToGB(
                        dept.storage_used
                      )}
                      GB
                    </td>
                  </tr>
                )
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};

export default StorageDashboard;