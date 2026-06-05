import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const PartnerSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  /* ================= FETCH ================= */
  const fetchTickets = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/partner/tickets?page=${pageNum}&limit=${LIMIT}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setTickets(res.data.Data);
        setPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets(1);
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!subject || !description) {
      return Swal.fire("Error", "Subject and description required", "warning");
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("description", description);
    if (file) formData.append("screenshot", file);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/partner/tickets`,
        formData,
        {
          withCredentials: true,
        },
      );

      if (res.data.Status) {
        Swal.fire("Success", "Ticket submitted successfully", "success");

        // reset
        setSubject("");
        setDescription("");
        setFile(null);

        fetchTickets();

        // close modal
        document.getElementById("closeModalBtn").click();
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to submit ticket", "error");
    }
  };

  /* ================= STATUS BADGE ================= */
  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return "bg-secondary";
      case "In Progress":
        return "bg-warning text-dark";
      case "Resolved":
        return "bg-success";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold d-flex align-items-center gap-2">
            <i className="bi bi-ticket-perforated"></i>
            Support Tickets
          </h3>
          <small className="text-muted">
            Submit and track your support requests
          </small>
        </div>

        {/* BUTTON */}
        <button
          className="btn btn-outline-secondary"
          data-bs-toggle="modal"
          data-bs-target="#ticketModal"
        >
          <i className="bi bi-plus-circle me-1"></i>
          Submit Ticket
        </button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-1">
        <div className="card-body table-responsive">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center text-muted py-5">
              No tickets submitted
            </div>
          ) : (
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Ticket No</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((t, i) => (
                  <tr key={t.id}>
                    <td>{(page - 1) * LIMIT + i + 1}</td>

                    <td className="fw-semibold">{t.ticket_number}</td>

                    <td>{t.subject}</td>

                    <td>
                      <span className={`badge ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>

                    <td>{new Date(t.created_at).toLocaleString("en-GB")}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        data-bs-toggle="modal"
                        data-bs-target="#viewTicketModal"
                        onClick={() => setSelectedTicket(t)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tickets.length > 0 && (
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page === 1}
                onClick={() => fetchTickets(page - 1)}
              >
                ← Prev
              </button>

              <span>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page === totalPages}
                onClick={() => fetchTickets(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <div className="modal fade" id="ticketModal">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-plus-circle me-2"></i>
                Submit Ticket
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                id="closeModalBtn"
              ></button>
            </div>

            <div className="modal-body">
              {/* SUBJECT */}
              <div className="mb-3">
                <label className="form-label">Subject</label>
                <input
                  className="form-control"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* FILE */}
              <div className="mb-3">
                <label className="form-label">Screenshot (optional)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>

              <button className="btn btn-primary" onClick={handleSubmit}>
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="viewTicketModal">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            {/* HEADER */}
            <div className="modal-header bg-light border-0">
              <h5 className="modal-title d-flex align-items-center gap-2">
                <i className="bi bi-ticket-detailed"></i>
                Ticket Details
              </h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              {selectedTicket ? (
                <div className="d-flex flex-column gap-4">
                  {/* TOP INFO CARDS */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 border rounded-3 h-100">
                        <small className="fw-bold">Ticket No</small>
                        <div className="fs-6 text-muted">
                          {selectedTicket.ticket_number}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 border rounded-3 h-100">
                        <small className="fw-bold">Status</small>
                        <div>
                          <span
                            className={`badge ${getStatusBadge(selectedTicket.status)} px-3 py-2`}
                          >
                            {selectedTicket.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUBJECT */}
                  <div>
                    <small className="fw-bold">Subject</small>
                    <p className="fs-6">
                      {selectedTicket.subject}
                    </p>
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <small className="fw-bold">Description</small>
                    <p className="mt-1">
                      {selectedTicket.description} 
                    </p>
                  </div>

                  {/* SCREENSHOT FULL WIDTH */}
                  {selectedTicket.screenshot && (
                    <div>
                      <small className="text-muted">Screenshot</small>

                      <div className="mt-2 border rounded-3 overflow-hidden">
                        <img
                          src={`${API_BASE_URL}${selectedTicket.screenshot}`}
                          alt="Screenshot"
                          className="w-100"
                          style={{
                            maxHeight: "400px",
                            objectFit: "contain",
                            background: "#000",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* DATE */}
                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <small className="text-muted">Submitted At</small>
                    <span className="fw-semibold">
                      {new Date(selectedTicket.created_at).toLocaleString(
                        "en-GB",
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  No ticket selected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerSupportTickets;
