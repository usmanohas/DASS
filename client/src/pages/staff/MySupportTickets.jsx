import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";

const StaffSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async (pageNum = 1) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/staff/support/my-tickets?page=${pageNum}&limit=10`,
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
      ? "badge bg-success-subtle text-success border border-success-subtle"
      : status === "In Progress"
      ? "badge bg-warning-subtle text-warning border border-warning-subtle"
      : "badge bg-secondary-subtle text-secondary border border-secondary-subtle";
  };

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center">
            <i className="bi bi-ticket-detailed me-2"></i>
            My Support Tickets
          </h3>

          <p className="text-muted mb-0">
            View and track all submitted support requests.
          </p>
        </div>

        <div className="shadow-sm rounded-4 px-4 py-3 border" style={{backgroundColor:"#ef6c00"}}>
          <h5 className="mb-0 fw-bold text-light">{tickets.length}</h5>
          <small className="text-light">Tickets</small>
        </div>
      </div>

      {/* TICKETS */}
      <div className="row g-4">
        {tickets.length === 0 && (
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
              <i
                className="bi bi-inbox text-secondary mb-3"
                style={{ fontSize: "3rem" }}
              ></i>

              <h5 className="fw-bold">No Support Tickets</h5>

              <p className="text-muted mb-0">
                You have not created any support ticket yet.
              </p>
            </div>
          </div>
        )}

        {tickets.map((t) => (
          <div className="col-lg-6" key={t.id}>
            <div
              className="card border-0 shadow-sm rounded-4 h-100"
              style={{
                transition: "all 0.25s ease",
              }}
            >
              <div className="card-body p-4">
                {/* TOP */}
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div style={{ flex: 1 }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div
                        className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "42px",
                          height: "42px",
                        }}
                      >
                        <i className="bi bi-tools"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-0">
                          #{t.ticket_number}
                        </h6>

                        <small className="text-muted">
                          Support Request
                        </small>
                      </div>
                    </div>

                    <h5 className="fw-semibold mb-2 mt-3">
                      {t.subject}
                    </h5>
                  </div>

                  <span
                    className={getStatusBadge(t.status)}
                    style={{
                      whiteSpace: "nowrap",
                      padding: "8px 12px",
                      borderRadius: "30px",
                      fontWeight: 600,
                    }}
                  >
                    {t.status}
                  </span>
                </div>

                {/* DESCRIPTION */}
                <p
                  className="text-muted mt-3"
                  style={{
                    minHeight: "60px",
                  }}
                >
                  {t.description?.slice(0, 120)}
                  {t.description?.length > 120 && "..."}
                </p>

                {/* FOOTER */}
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <div>
                    <small className="text-muted d-block">
                      Created
                    </small>

                    <small className="fw-semibold">
                      {new Date(t.created_at).toLocaleString()}
                    </small>
                  </div>

                  <button
                    className="btn bg-success-subtle text-success rounded-pill px-4"
                    onClick={() => openDetails(t)}
                    data-bs-toggle="modal"
                    data-bs-target="#ticketModal"
                  >
                    <i className="bi bi-eye me-2"></i>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {tickets.length !== 0 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-5 flex-wrap">
          <button
            className="btn btn-outline-secondary rounded-pill px-4"
            disabled={page === 1}
            onClick={() => fetchTickets(page - 1)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Previous
          </button>

          <div className="bg-white shadow-sm rounded-pill px-4 py-2 border">
            <span className="fw-semibold">
              Page {page} of {totalPages}
            </span>
          </div>

          <button
            className="btn btn-outline-secondary rounded-pill px-4"
            disabled={page === totalPages}
            onClick={() => fetchTickets(page + 1)}
          >
            Next
            <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </div>
      )}

      {/* DETAILS MODAL */}
      <div
        className="modal fade"
        id="ticketModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            {/* HEADER */}
            <div className="modal-header bg-light border-0 px-4 py-3">
              <div>
                <h5 className="modal-title fw-bold mb-1">
                  Ticket #{selectedTicket?.ticket_number}
                </h5>

                <small className="text-muted">
                  Support ticket information
                </small>
              </div>

              <button
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            {/* BODY */}
            <div className="modal-body p-4">
              {selectedTicket && (
                <>
                  {/* TITLE + STATUS */}
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                      <h4 className="fw-bold mb-2">
                        {selectedTicket.subject}
                      </h4>

                      <p className="text-muted mb-0">
                        Submitted on{" "}
                        {new Date(
                          selectedTicket.created_at
                        ).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={getStatusBadge(selectedTicket.status)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "30px",
                        fontWeight: 600,
                      }}
                    >
                      {selectedTicket.status}
                    </span>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="card border-0 bg-light rounded-4 p-4 mb-4">
                    <h6 className="fw-bold mb-3 d-flex align-items-center">
                      <i className="bi bi-chat-left-text me-2 text-primary"></i>
                      Description
                    </h6>

                    <p className="mb-0 text-dark">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* SCREENSHOT */}
                  {selectedTicket.screenshot && (
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                      <div className="card-header bg-white border-0 py-3 px-4">
                        <h6 className="fw-bold mb-0 d-flex align-items-center">
                          <i className="bi bi-image-fill text-primary me-2"></i>
                          Screenshot Attachment
                        </h6>
                      </div>

                      <div
                        className="bg-light d-flex justify-content-center align-items-center p-4"
                        style={{
                          minHeight: "450px",
                        }}
                      >
                        <img
                          src={`${API_BASE_URL}${selectedTicket.screenshot}`}
                          alt="screenshot"
                          className="img-fluid rounded-4 shadow"
                          style={{
                            maxHeight: "600px",
                            maxWidth: "100%",
                            width: "auto",
                            objectFit: "contain",
                            display: "block",
                            border: "1px solid #dee2e6",
                            background: "#fff",
                            padding: "10px",
                          }}
                        />
                      </div>

                      <div className="card-footer bg-white border-0 text-center py-3">
                        <small className="text-muted">
                          Attached screenshot preview
                        </small>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="modal-footer border-0 bg-light">
              <button
                className="btn btn-secondary rounded-pill px-4"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSupportTickets;