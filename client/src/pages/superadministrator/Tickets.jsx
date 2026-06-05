import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchTickets = async (pageNum = 1) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/superadmin/tickets?page=${pageNum}&limit=10&status=${statusFilter}`,
        { withCredentials: true }
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
        `${API_BASE_URL}/superadmin/tickets/update-status/${selectedTicket.id}`,
        { status: selectedTicket.status },
        { withCredentials: true }
      );

      if (res.data.Status) {
        Swal.fire("Success", res.data.Message, "success");
        fetchTickets(page);
      }
    } catch {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  const openDetails = (ticket) => {
    setSelectedTicket(ticket);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-success";
      case "In Progress":
        return "bg-warning text-dark";
      case "Closed":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">
          <i className="bi bi-ticket-perforated me-2"></i>
          Support Tickets
        </h3>
        <small className="text-muted">
          Manage, track and resolve user-reported issues
        </small>
      </div>

      {/* FILTER BAR */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">

          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold">Filter:</span>

            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 180 }}
            >
              <option>All</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </div>

          <span className="text-muted small">
            Showing page {page} of {totalPages}
          </span>
        </div>
      </div>

      {/* TICKETS GRID */}
      <div className="row g-3">
        {tickets.length === 0 && (
          <div className="text-center text-muted py-5">
            No tickets found
          </div>
        )}

        {tickets.map((t) => (
          <div className="col-md-6 col-lg-6" key={t.id}>
            <div className="card border-0 shadow-sm h-100 ticket-card">

              <div className="card-body d-flex flex-column">

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-bold text-dark">
                      #{t.ticket_number}
                    </div>
                    <div
                      className="text-muted small"
                      style={{
                        maxWidth: 220,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {t.subject}
                    </div>
                  </div>

                  <span className={`badge ${getStatusBadge(t.status)}`}>
                    {t.status}
                  </span>
                </div>

                {/* DESCRIPTION */}
                <p className="text-muted small mb-3">
                  {t.description?.length > 120
                    ? t.description.slice(0, 120) + "..."
                    : t.description}
                </p>

                {/* USER INFO */}
                <div className="bg-light rounded p-2 small mb-3">
                  <div className="d-flex align-items-center mb-1">
                    <i className="bi bi-person text-primary me-2"></i>
                    <strong>{t.full_name}</strong>
                  </div>

                  <div className="text-muted">
                    <i className="bi bi-envelope me-2"></i>
                    {t.email}
                  </div>
                </div>

                {/* FOOTER */}
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    {new Date(t.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>

                  <button
                    className="btn btn-sm btn-outline-primary"
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
      </div>

      {/* PAGINATION */}
      {tickets.length > 0 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">

          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page === 1}
            onClick={() => fetchTickets(page - 1)}
          >
            Prev
          </button>

          <span className="small text-muted">
            Page <strong>{page}</strong> of {totalPages}
          </span>

          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page === totalPages}
            onClick={() => fetchTickets(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* MODAL */}
      <div className="modal fade" id="ticketModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">

          <div className="modal-content border-0 shadow">

            {/* HEADER */}
            <div className="modal-header">
              <div>
                <h5 className="modal-title mb-0">
                  Ticket #{selectedTicket?.ticket_number}
                </h5>
                <small className="text-muted">
                  {selectedTicket?.subject}
                </small>
              </div>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            {/* BODY */}
            <div className="modal-body">

              {selectedTicket && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <span className={`badge ${getStatusBadge(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>

                    <select
                      className="form-select form-select-sm"
                      style={{ width: 160 }}
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

                  <p className="text-muted">{selectedTicket.description}</p>

                  {selectedTicket.screenshot && (
                    <div className="mt-3">
                      <h6 className="mb-2">Screenshot</h6>
                      <img
                        src={`${API_BASE_URL}${selectedTicket.screenshot}`}
                        className="img-fluid rounded border"
                        alt="screenshot"
                        style={{ maxHeight: 400 }}
                      />
                    </div>
                  )}

                  <div className="text-muted small mt-3">
                    Created:{" "}
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </div>
                </>
              )}

            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button className="btn btn-light" data-bs-dismiss="modal">
                Close
              </button>

              <button className="btn btn-primary" onClick={updateStatus}>
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