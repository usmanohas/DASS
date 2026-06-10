import React from "react";

const PartnerUserGuide = () => {
  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold d-flex align-items-center gap-2">
          <i className="bi bi-book"></i>
          User Guide & Help Center
        </h3>
        <small className="text-muted">
          Learn how to use the system effectively
        </small>
      </div>

      {/* USER GUIDE */}
      <div className="card shadow-sm border-1 mb-4">
        <div className="card-body">

          <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-info-circle"></i>
            User Guide
          </h5>

          {/* GRID SECTIONS */}
          <div className="row g-4">

            {/* LOGIN */}
            <div className="col-md-6">
              <div className="p-3 border rounded-3 h-100">
                <h6 className="fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-box-arrow-in-right text-primary"></i>
                  Login
                </h6>
                <p className="text-muted small mb-0">
                  Use your registered email and password to access your account.
                </p>
              </div>
            </div>

            {/* DOWNLOAD */}
            <div className="col-md-6">
              <div className="p-3 border rounded-3 h-100">
                <h6 className="fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-download text-success"></i>
                  Download Documents
                </h6>
                <p className="text-muted small mb-1">
                  Access documents from <strong>My Documents</strong>.
                </p>
                <ul className="text-muted small mb-0">
                  <li>Click download button</li>
                  <li>Expired files cannot be downloaded</li>
                </ul>
              </div>
            </div>

            {/* EXPIRY */}
            <div className="col-md-6">
              <div className="p-3 border rounded-3 h-100">
                <h6 className="fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-danger"></i>
                  Expired Documents
                </h6>
                <p className="text-muted small mb-0">
                  Contact the administrator(Director PRS) to re-share expired documents.
                </p>
              </div>
            </div>

            {/* PASSWORD */}
            <div className="col-md-6">
              <div className="p-3 border rounded-3 h-100">
                <h6 className="fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-shield-lock text-warning"></i>
                  Password Rules
                </h6>
                <ul className="text-muted small mb-0">
                  <li>Minimum of 8 characters</li>
                  <li>Uppercase letter required</li>
                  <li>Include a number</li>
                  <li>Include special character</li>
                </ul>
              </div>
            </div>

            {/* TICKETS */}
            <div className="col-md-6">
              <div className="p-3 border rounded-3 h-100">
                <h6 className="fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-ticket-perforated text-info"></i>
                  Support Tickets
                </h6>
                <p className="text-muted small mb-0">
                  Submit and track issues through the ticket system.
                </p>
              </div>
            </div>

            {/* RESTRICTION */}
            <div className="col-md-6">
              <div className="p-3 border rounded-3 bg-light h-100">
                <h6 className="fw-semibold d-flex align-items-center gap-2 text-danger">
                  <i className="bi bi-exclamation-triangle"></i>
                  Important Notice
                </h6>
                <p className="text-muted small mb-0">
                  Partners cannot request documents. Only administrators can share documents.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-question-circle"></i>
            Frequently Asked Questions
          </h5>

          <div className="accordion" id="faqAccordion">

            {/* Q1 */}
            <div className="accordion-item border-0 mb-2">
              <h2 className="accordion-header">
                <button className="accordion-button rounded" data-bs-toggle="collapse" data-bs-target="#faq1">
                  <i className="bi bi-download me-2"></i>
                  Why i can't download a document?
                </button>
              </h2>
              <div id="faq1" className="accordion-collapse collapse show">
                <div className="accordion-body text-muted small">
                  The document may have expired. Contact the administrator to re-share.
                </div>
              </div>
            </div>

            {/* Q2 */}
            <div className="accordion-item border-0 mb-2">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed rounded" data-bs-toggle="collapse" data-bs-target="#faq2">
                  <i className="bi bi-x-circle me-2"></i>
                  Can I request documents?
                </button>
              </h2>
              <div id="faq2" className="accordion-collapse collapse">
                <div className="accordion-body text-muted small">
                  Yes, but not through the portal. Contact system administrator (DPRS).
                </div>
              </div>
            </div>

            {/* Q3 */}
            <div className="accordion-item border-0 mb-2">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed rounded" data-bs-toggle="collapse" data-bs-target="#faq3">
                  <i className="bi bi-shield-lock me-2"></i>
                  What are the password requirements?
                </button>
              </h2>
              <div id="faq3" className="accordion-collapse collapse">
                <div className="accordion-body text-muted small">
                  Minimum of 8 characters including uppercase letter, number, and special character.
                </div>
              </div>
            </div>

            {/* Q4 */}
            <div className="accordion-item border-0 mb-2">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed rounded" data-bs-toggle="collapse" data-bs-target="#faq4">
                  <i className="bi bi-headset me-2"></i>
                  How do I contact helpdesk?
                </button>
              </h2>
              <div id="faq4" className="accordion-collapse collapse">
                <div className="accordion-body text-muted small">
                  Submit a support ticket from the portal or call the number located in the footer.
                </div>
              </div>
            </div>

            {/* Q5 */}
            <div className="accordion-item border-0">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed rounded" data-bs-toggle="collapse" data-bs-target="#faq5">
                  <i className="bi bi-bar-chart me-2"></i>
                  Can I see download history?
                </button>
              </h2>
              <div id="faq5" className="accordion-collapse collapse">
                <div className="accordion-body text-muted small">
                  Yes, download count is shown in the documents table.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default PartnerUserGuide;