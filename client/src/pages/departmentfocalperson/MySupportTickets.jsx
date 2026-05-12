import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const MySupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async (pageNum = 1) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/department/support/my-tickets?page=${pageNum}&limit=10`,
        { withCredentials: true }
      );

      if (res.data.Status) {
        setTickets(res.data.Data);
        setTotalPages(res.data.totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      Swal.fire("Error", "Failed to fetch tickets", "error");
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, []);

  const openDetails = (ticket) => {
    setSelectedTicket(ticket);
  };

  const getStatusBadge = (status) => {
    return status === "Resolved"
      ? "badge bg-success"
      : status === "In Progress"
      ? "badge bg-warning text-dark"
      : "badge bg-secondary";
  };

  return (
     <div className="container py-3">
      <h3 className="mb-4">
        <i className="bi bi-ticket-detailed me-2"></i>My Support Tickets
      </h3>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            {tickets.length === 0 && (
              <div className="text-muted text-center">No tickets found</div>
            )}

            {tickets.map((t) => (
              <div className="col-md-6" key={t.id}>
                <div className="card shadow-sm border-1 h-100" style={{ backgroundColor: "#f8f9fa" }}>
                  <div className="card-body">
                    {/* HEADER */}
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div style={{ flex: 1 }}>
                        <h6 className="fw-bold mb-1">
                          #{t.ticket_number} - {t.subject}
                        </h6>
                      </div>

                      {/* FIXED BADGE */}
                      <span
                        className={getStatusBadge(t.status)}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {t.status}
                      </span>
                    </div>

                    <p className="text-muted small mt-2">
                      {t.description?.slice(0, 100)}...
                    </p>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <small className="text-muted">
                        {new Date(t.created_at).toLocaleString()}
                      </small>

                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => openDetails(t)}
                        data-bs-toggle="modal"
                        data-bs-target="#ticketModal"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {tickets.length !== 0 && (
              <>
                {/* PAGINATION */}
                <hr/>
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

                  <span
                    className={getStatusBadge(selectedTicket.status)}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {selectedTicket.status}
                  </span>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySupportTickets;