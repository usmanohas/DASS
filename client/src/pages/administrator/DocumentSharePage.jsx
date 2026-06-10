import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import API_BASE_URL from "../../config/baseUrl";
const ShareDocumentPage = () => {
  const qrRef = useRef(null);
  const truncate = (text, length = 50) =>
    text.length > length ? text.substring(0, length) + "…" : text;

  const navigate = useNavigate();
  const [showKeywords, setShowKeywords] = useState(false);

  const { id } = useParams();

  const [doc, setDoc] = useState(null);

  const [partners, setPartners] = useState([]);
  const [allPartners, setAllPartners] = useState([]);
  const [selectedPartners, setSelectedPartners] = useState([]);

  const [search, setSearch] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [publicLink, setPublicLink] = useState(null);

  const classificationColors = {
    Public: "bg-success",
    Internal: "bg-info",
    Confidential: "bg-warning text-dark",
    Restricted: "bg-danger",
  };

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchDoc();
    fetchPartners();
    fetchLatestLink();
  }, []);

  const fetchDoc = async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/documents/${id}`);
    if (res.data.Status) setDoc(res.data.Data);
  };

  const fetchPartners = async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/partners-active`);

    if (res.data.Status) {
      setPartners(res.data.Data);
      setAllPartners(res.data.Data);
    }
  };

  // ================= SEARCH =================
  useEffect(() => {
    const value = search.toLowerCase();

    const filtered = allPartners.filter(
      (p) =>
        p.full_name.toLowerCase().includes(value) ||
        p.email.toLowerCase().includes(value),
    );

    setPartners(filtered);
  }, [search, allPartners]);

  // ================= TOGGLE =================
  const togglePartner = (partnerId) => {
    setSelectedPartners((prev) =>
      prev.includes(partnerId)
        ? prev.filter((id) => id !== partnerId)
        : [...prev, partnerId],
    );
  };

  // ================= SELECT ALL =================
  const handleSelectAll = () => {
    if (selectedPartners.length === partners.length) {
      setSelectedPartners([]);
    } else {
      setSelectedPartners(partners.map((p) => p.id));
    }
  };

  // ================= INITIALS =================
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ================= SUBMIT ================
  const handleShare = async () => {
    if (!expiryDate || selectedPartners.length === 0) {
      return Swal.fire("Warning", "Select partners and expiry date", "warning");
    }

    try {
      const res = await axios.post(
        `/admin/documents/share`,
        {
          document_id: id,
          partner_ids: selectedPartners,
          expiry_date: expiryDate,
        },
      );

      if (res.data.Status) {
        let message = res.data.Message;

        if (res.data.skipped.length > 0) {
          message += `\n\n${res.data.skipped.length} partner(s) already had active access and were skipped.`;
        }

        await Swal.fire({
          icon: "success",
          title: "Done",
          text: message,
          confirmButtonText: "OK",
        });

        // RESET STATES
        setSelectedPartners([]);
        setExpiryDate("");

        // REDIRECT BACK TO DOCUMENT PAGE
        navigate(`/admin/document/${id}`);
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const fetchLatestLink = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/admin/documents/latest-link/${id}`, 
      );

      if (res.data.Status) {
        setPublicLink(res.data.Data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!doc) return <p className="text-center mt-5">Loading...</p>;

  const keywords = doc.document_search_keywords
    ? doc.document_search_keywords.split(",").map((k) => k.trim())
    : [];

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-share me-2"></i>Share Document
      </h4>

      {/* ===== DOCUMENT HEADER ===== */}
      <div className="card shadow-sm border-1 mb-4">
        <div className="card-body position-relative">
          <div className="d-flex justify-content-between align-items-start gap-4 mb-4">
            {/* LEFT */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <h4
                className="mb-2 text-dark"
                style={{
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  lineHeight: "1.4",
                }}
              >
                {doc.title}
              </h4>

              <div className="text-muted small d-flex align-items-center">
                <i className="bi bi-upc-scan me-2"></i>

                <span
                  style={{
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {doc.document_code}
                </span>
              </div>
            </div>

            {/* RIGHT */}
            <div
              className="d-flex flex-column align-items-end gap-3"
              style={{
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {/* Classification */}
              <span
                className={`badge px-4 py-2 rounded-pill fw-semibold ${
                  classificationColors[doc.classification] || "bg-secondary"
                }`}
                style={{
                  fontSize: "0.85rem",
                  letterSpacing: "0.3px",
                }}
              >
                {doc.classification}
              </span>
            </div>
          </div>

          <hr />

          <div className="row g-4">
            <div className="col-md-8">
              {/* KEYWORDS */}
              <div className="mb-3">
                <div
                  className="d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowKeywords(!showKeywords)}
                >
                  <strong>
                    <i className="bi bi-tags me-2"></i> Search Keywords
                  </strong>

                  <i
                    className={`bi ${
                      showKeywords ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  ></i>
                </div>

                <div
                  style={{
                    maxHeight: showKeywords ? "200px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {keywords.length > 0 ? (
                      keywords.map((k, i) => (
                        <span key={i} className="badge bg-light text-dark">
                          {k}
                        </span>
                      ))
                    ) : (
                      <small className="text-muted">No keywords</small>
                    )}
                  </div>
                  <hr />
                </div>
              </div>
              <div className="card mb-3 mt-4 p-3 rounded border bg-light">
                {/* EXPIRY */}
                <div className="card-body">
                  <label className="fw-semibold mb-2">Expiry Date</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              {/* ================= PARTNERS ================= */}
              <div className="card shadow-sm border-1">
                <div className="card-body">
                  {/* HEADER */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-semibold mb-0 d-flex align-items-center gap-2">
                      <i className="bi bi-people text-secondary"></i>
                      Share with Partners
                    </h6>
                    <span className="badge bg-success-subtle text-success border px-3 py-2 rounded-pill">
                      {selectedPartners.length} Selected
                    </span>
                  </div>

                  {/* SEARCH + SELECT ALL */}
                  <div className="d-flex gap-2 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search partners..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    <button
                      className="btn bg-success-subtle"
                      onClick={handleSelectAll}
                    >
                      {selectedPartners.length === partners.length
                        ? "Unselect"
                        : "Select All"}
                    </button>
                  </div>

                  {/* LIST */}
                  <div
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    {partners.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <i className="bi bi-person-x fs-3 mb-2"></i>
                        <p>No partners found</p>
                      </div>
                    ) : (
                      partners.map((p) => {
                        const isSelected = selectedPartners.includes(p.id);

                        return (
                          <div
                            key={p.id}
                            className={`d-flex align-items-center justify-content-between p-3 mb-2 rounded ${
                              isSelected
                                ? "bg-success-subtle border border-success"
                                : "bg-white border"
                            }`}
                            style={{
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onClick={() => togglePartner(p.id)}
                          >
                            {/* LEFT */}
                            <div className="d-flex align-items-center gap-3">
                              {/* AVATAR */}
                              <div
                                className="rounded-circle bg-success-subtle text-white d-flex align-items-center justify-content-center"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                }}
                              >
                                {getInitials(p.full_name)}
                              </div>

                              {/* DETAILS */}
                              <div>
                                <div className="fw-semibold">{p.full_name}</div>
                                <small className="text-muted">{p.email}</small>
                              </div>
                            </div>

                            {/* CHECKBOX */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePartner(p.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* ACTION */}
                  <div className="d-flex justify-content-center mt-4">
                    <button
                      className="btn btn-success d-flex align-items-center"
                      onClick={handleShare}
                      disabled={selectedPartners.length === 0}
                      style={{
                        borderRadius: "8px",
                        fontWeight: "500",
                        padding: "10px 24px",
                        minWidth: "200px",
                      }}
                    >
                      <i className="bi bi-share me-2"></i>
                      Share Document
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="mt-4 p-3 rounded border bg-light">
                {/* Header */}
                <div className="fw-semibold text-danger mb-2 d-flex align-items-center">
                  <i className="bi bi-link-45deg me-2"></i>
                  Share via Public Link
                </div>

                <button
                  className="btn btn-success w-100 d-flex align-items-center justify-content-center"
                  style={{
                    borderRadius: "8px",
                    fontWeight: "500",
                  }}
                  onClick={async () => {
                    if (!expiryDate) {
                      return Swal.fire(
                        "Warning",
                        "Select expiry date first",
                        "warning",
                      );
                    }

                    try {
                      const res = await axios.post(
                        `${API_BASE_URL}/admin/documents/generate-link`,
                        {
                          document_id: id,
                          expiry_date: expiryDate,
                        },
                      );

                      if (res.data.Status) {
                        await Swal.fire({
                          icon: "success",
                          title: "Link Generated",
                          text: "Public link created successfully",
                        });

                        fetchLatestLink(); // refresh latest link
                      } else {
                        Swal.fire("Error", res.data.Error, "error");
                      }
                    } catch (err) {
                      Swal.fire("Error", "Something went wrong", "error");
                    }
                  }}
                >
                  <i className="bi bi-link me-2"></i>
                  Generate Share Link
                </button>
                {publicLink && (
                  <div className="mt-4 p-3 border rounded bg-white text-center">
                    <div className="mb-2 fw-semibold text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      Active Public Link
                    </div>

                    {/* LINK */}
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={publicLink.link}
                      readOnly
                    />

                    {/* EXPIRY */}
                    <small className="text-muted d-block mb-3">
                      Expires on:{" "}
                      {new Date(publicLink.expiry_date).toLocaleString("en-GB")}
                    </small>

                    {/* COPY BUTTON */}
                    <button
                      className="btn btn-outline-secondary btn-sm mb-3"
                      onClick={() => {
                        navigator.clipboard.writeText(publicLink.link);
                        Swal.fire(
                          "Copied",
                          "Link copied to clipboard",
                          "success",
                        );
                      }}
                    >
                      <i className="bi bi-clipboard me-1"></i>
                      Copy Link
                    </button>
                    {/* QR CODE */}
                    <div className="d-flex flex-column align-items-center">
                      <div
                        ref={qrRef}
                        className="bg-white p-3 rounded shadow-sm"
                        style={{ display: "inline-block" }}
                      >
                        <QRCodeCanvas
                          value={publicLink.link}
                          size={220} // 🔥 bigger for clarity
                          bgColor="#ffffff" // white background
                          fgColor="#000000" // strong contrast
                          level="H" // high error correction
                          includeMargin={true} // ✅ adds white border
                        />
                      </div>

                      <button
                        className="btn btn-outline-success btn-sm mt-3"
                        onClick={() => {
                          const canvas = qrRef.current.querySelector("canvas");

                          if (!canvas) return;

                          const url = canvas.toDataURL("image/png", 1.0); // max quality

                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "document-qr.png";
                          a.click();
                        }}
                      >
                        <i className="bi bi-download me-1"></i>
                        Download QR
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDocumentPage;
