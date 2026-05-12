import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchTickets = async (pageNum = 1) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/superadmin/tickets?page=${pageNum}&limit=10&status=${statusFilter}`,
        { withCredentials: true },
      );

      if (res.data.Status) {
        setTickets(res.data.Data);
        setTotalPages(res.data.totalPages);
        setPage(pageNum);
      }
    } catch {
      Swal.fire("Error", "Failed to fetch tickets", "error");
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, [statusFilter]);

  const updateStatus = async () => {
    try {
      const res = await axios.put(
        `http://localhost:3000/superadmin/tickets/update-status/${selectedTicket.id}`,
        { status: selectedTicket.status },
        { withCredentials: true },
      );

      if (res.data.Status) {
        Swal.fire("Success", res.data.Message, "success");
        fetchTickets(page); // ✅ refresh
      }
    } catch {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  const openDetails = (ticket) => {
    setSelectedTicket(ticket);
  };

  const getStatusBadge = (status) => {
    return status === "Resolved"
      ? "badge bg-success"
      : status === "In Progress"
        ? "badge bg-warning text-dark"
      : status === "Closed"
      ? "badge bg-danger text-white"
        : "badge bg-secondary";
  };

  return (
    <div className="container py-3">
      {/* HEADER */}
      <div className="mb-4">
        <h3 className="">
          <i className="bi bi-ticket-perforated me-2"></i>
          Support Tickets
        </h3>
        <small className="text-muted">Review and resolve user issues</small>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <label className="me-2 fw-semibold">Filter:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            {tickets.length === 0 && (
              <div className="text-muted text-center">No tickets found</div>
            )}

            {tickets.map((t) => (
              <div className="col-md-6 col-lg-6" key={t.id}>
                <div className="card border shadow-sm h-100 ticket-card">
                  <div className="card-body d-flex flex-column">
                    {/* HEADER */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="me-2">
                        <h6 className="fw-bold mb-1 text-dark">
                          #{t.ticket_number}
                        </h6>
                        <div
                          className="text-muted small text-truncate"
                          style={{ maxWidth: 180 }}
                        >
                          {t.subject}
                        </div>
                      </div>

                      <span className={getStatusBadge(t.status)}>
                        {t.status}
                      </span>
                    </div>

                    {/* DESCRIPTION */}
                    <p
                      className="text-muted small mb-3"
                      style={{ minHeight: 50 }}
                    >
                      {t.description?.length > 100
                        ? t.description.slice(0, 100) + "..."
                        : t.description}
                    </p>

                    {/* USER INFO */}
                    <div className="bg-light rounded p-2 small mb-3">
                      <div className="d-flex align-items-center mb-1">
                        <i className="bi bi-person text-primary me-2"></i>
                        <span className="fw-semibold">{t.full_name}</span>
                      </div>

                      <div className="d-flex align-items-center mb-1">
                        <i className="bi bi-telephone text-muted me-2"></i>
                        <span>{t.phone_number || "N/A"}</span>
                      </div>

                      <div className="d-flex align-items-center">
                        <i className="bi bi-envelope text-muted me-2"></i>
                        <span>{t.email}</span>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        {new Date(t.created_at).toLocaleString()}
                      </small>

                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => openDetails(t)}
                        data-bs-toggle="modal"
                        data-bs-target="#ticketModal"
                      >
                        <i className="bi bi-eye me-1"></i>
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {tickets.length !== 0 && (
              <>
                {/* PAGINATION */}
                <hr />
                <div className="d-flex justify-content-center mt-2 gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={page === 1}
                    onClick={() => fetchTickets(page - 1)}
                  >
                    Previous
                  </button>

                  <span className="align-self-center">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={page === totalPages}
                    onClick={() => fetchTickets(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* DETAILS MODAL */}
      <div
        className="modal fade"
        id="ticketModal"
        tabIndex="-1"
        onHidden={() => setSelectedTicket(null)}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Ticket #{selectedTicket?.ticket_number}
              </h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              {selectedTicket && (
                <>
                  <h6 className="fw-bold mb-2">{selectedTicket.subject}</h6>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className={getStatusBadge(selectedTicket.status)}>
                      {selectedTicket.status}
                    </span>

                    {/* STATUS DROPDOWN */}
                    <select
                      className="form-select w-auto"
                      value={selectedTicket.status}
                      onChange={(e) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          status: e.target.value,
                        })
                      }
                    >
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                      <option>Closed</option>
                    </select>
                  </div>

                  <hr />

                  <p>{selectedTicket.description}</p>

                  {/* SCREENSHOT */}
                  {selectedTicket.screenshot && (
                    <div className="mt-3">
                      <h6>Screenshot</h6>

                      <img
                        src={`http://localhost:3000${selectedTicket.screenshot}`}
                        alt="screenshot"
                        className="img-fluid rounded border"
                        style={{
                          maxHeight: "400px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  )}

                  <div className="mt-3 text-muted small">
                    Created:{" "}
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" data-bs-dismiss="modal">
                Close
              </button>

              <button className="btn btn-success" onClick={updateStatus}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketManagement;
