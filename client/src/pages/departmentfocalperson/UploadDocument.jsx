import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Upload = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  //format search keywords
  const formatKeywords = (value) => {
    return value
      .split(",")
      .map((word) =>
        word
          .trim()
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      )
      .filter((word) => word !== "")
      .join(", ");
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/department/categories",
        { withCredentials: true },
      );
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/department/categories/${categoryId}/subcategories`,
        { withCredentials: true },
      );
      setSubcategories(res.data);
    } catch (err) {
      console.error("Failed to fetch subcategories");
    }
  };

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    document_date: "2026-2-19",
    visibility: "",
    retention: "",
    keywords: "",
    verified_by: "",
    duplicate_checked: false,
  });

  const isStep1Complete =
    file &&
    form.title &&
    form.description &&
    form.category &&
    form.subcategory &&
    form.retention &&
    form.visibility;

  const isStep2Complete =
    form.duplicate_checked && form.keywords && form.verified_by;

  /* ===================== FILE VALIDATION ===================== */
  const blockedTypes = [
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/gzip",
    "application/x-tar",
  ];

  const blockedExtensions = [".zip", ".rar", ".7z", ".tar", ".gz"];

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (change if needed)

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const fileExtension = selected.name
      .substring(selected.name.lastIndexOf("."))
      .toLowerCase();

    // Block compressed file types
    if (
      blockedTypes.includes(selected.type) ||
      blockedExtensions.includes(fileExtension)
    ) {
      Swal.fire(
        "Invalid File",
        "Compressed files (.zip, .rar, .7z, .tar, .gz) are not allowed.",
        "error",
      );
      return;
    }

    // File size check
    if (selected.size > MAX_FILE_SIZE) {
      Swal.fire(
        "File Too Large",
        "Maximum file size allowed is 50MB.",
        "error",
      );
      return;
    }

    setFile(selected);
  };

  /* ===================== STEP VALIDATION ===================== */
  const validateStep1 = () => {
    const errs = {};
    if (!file) errs.file = "File is required";
    if (!form.title) errs.title = "Title is required";
    if (!form.category) errs.category = "Category required";
    if (!form.subcategory) errs.subcategory = "Subcategory required";
    if (!form.visibility) errs.visibility = "Visibility required";
    if (!form.retention) errs.retention = "Retention perion required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.duplicate_checked) errs.duplicate = "Duplicate check required";
    if (!form.keywords) errs.keywords = "Keywords required";
    if (!form.verified_by) errs.verified_by = "Verified by is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ===================== STEP HANDLERS ===================== */
  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const calculateFileHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const handleDuplicateCheck = async () => {
    if (!file || !form.title  || !form.description ) {
      return Swal.fire("Missing", "File, title and description required", "warning");
    }

    try {
      const fileHash = await calculateFileHash(file);

      const res = await axios.post(
        "http://localhost:3000/department/documents/check-duplicate",
        {
          title: form.title,
          fileHash,
        },
        { withCredentials: true },
      );

      if (res.data.Duplicate) {
        Swal.fire("Duplicate Found", res.data.Message, "error");
      } else {
        setForm({ ...form, duplicate_checked: true });
        Swal.fire(
          "Verification Completed",
          "No existing document found",
          "success",
        );
      }
    } catch (err) {
      Swal.fire("Error", "Duplicate check failed", "error");
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "duplicate_checked") {
          formData.append(key, value);
        }
      });

      const res = await axios.post(
        "http://localhost:3000/department/documents/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      if (res.data.Status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Document uploaded successfully",
          confirmButtonText: "Go to Documents",
        }).then(() => {
          navigate("/department/document/manage"); // document list route
        });
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Upload failed", "error");
    }
  };

  /* ================= DRAG DROP ================= */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    if (!validateFile(dropped)) return;

    setFile(dropped);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type !== "dragleave");
  };

  /* ===================== STEPPER ===================== */
  const StepIndicator = () => (
    <div className="d-flex justify-content-between mb-4">
      {["Upload", "Validation", "Preview"].map((label, i) => {
        const num = i + 1;
        return (
          <div key={num} className="text-center flex-fill">
            <div
              className={`rounded-circle mx-auto mb-1 ${
                step >= num ? "bg-danger text-white" : "bg-secondary text-white"
              }`}
              style={{
                width: 35,
                height: 35,
                color: "#fff",
                lineHeight: "35px",
              }}
            >
              {num}
            </div>
            <small className={step === num ? "fw-bold" : ""}>{label}</small>
          </div>
        );
      })}
    </div>
  );

  /* ===================== UI ===================== */
  return (
    <div className="container-fluid py-4">
      <div className="mb-2">
        <h3 className="fw-bold">
          <i className="bi bi-cloud-upload me-2"></i>
          Upload Document
        </h3>
        <div className="text-muted">Secure document upload workflow</div>
      </div>
      <StepIndicator />
      <div className="card shadow rounded-4 p-4 mx-auto">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="row g-4">
            <h4 className="mb-3">
              <i class="bi bi-cloud-upload me-2"></i> STEP 1:{" "}
              <span className="text-muted">Metadata</span>
            </h4>
            {/* LEFT: FORM */}
            <div className="col-md-8">
              <div className="card border-0 shadow-sm p-4">
                <label className="form-label">
                  Document Title <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control mb-3"
                  placeholder=""
                  rows="2"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />

                <label className="form-label">Short Description <span className="text-danger">*</span></label>
                <textarea
                  className="form-control mb-3"
                  placeholder=""
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select mb-3"
                      value={form.category}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setForm({
                          ...form,
                          category: selectedId,
                          subcategory: "",
                        });

                        if (selectedId) {
                          fetchSubcategories(selectedId);
                        } else {
                          setSubcategories([]);
                        }
                      }}
                    >
                      <option value="">...Select Category...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      Sub-category <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select mb-3"
                      disabled={!form.category}
                      value={form.subcategory}
                      onChange={(e) =>
                        setForm({ ...form, subcategory: e.target.value })
                      }
                    >
                      <option value="">...Select Subcategory...</option>
                      {subcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Document Retention Period (Year)
                      <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select mb-2"
                      value={form.retention}
                      onChange={(e) =>
                        setForm({ ...form, retention: e.target.value })
                      }
                    >
                      <option value="">Select year</option>
                      <option value="5">5 Years</option>
                      <option value="6">6 Years</option>
                      <option value="7">7 Years</option>
                      <option value="8">8 Years</option>
                      <option value="9">9 Years</option>
                      <option value="10">10 Years</option>
                    </select>
                    <small className="text-danger mb-3 d-block">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Documents must be retained for a minimum of 5 years before
                      archival or disposal.
                    </small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      Document Classification{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select mb-3"
                      value={form.visibility}
                      onChange={(e) =>
                        setForm({ ...form, visibility: e.target.value })
                      }
                    >
                      <option value="">...Select visibility...</option>
                      <option>Public</option>
                      <option>Internal</option>
                      <option>Confidential</option>
                      <option>Restricted</option>
                    </select>
                  </div>
                </div>

                
                {/* DRAG DROP */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDrag}
                  className={`border rounded-4 p-4 text-center ${
                    dragActive ? "bg-light border-primary" : ""
                  }`}
                  style={{ borderStyle: "dashed", cursor: "pointer" }}
                >
                  <i className="bi bi-cloud-upload display-6"></i>
                  <div className="fw-semibold">Drag & Drop File</div>
                  <div className="text-muted small">or click to select</div>

                  <input
                    type="file"
                    className="form-control mt-2"
                    onChange={handleFileChange}
                  />

                  {file && (
                    <div className="alert alert-success mt-3 py-2">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: GUIDELINES */}
            <div className="col-md-4">
              <div className="p-3 rounded-3" style={{backgroundColor: "#0b8585"}}>
                <h5 style={{color: "#badfdf"}}>Rules</h5>
                <ul className="small text-white mb-0">
                  <li>No zip/rar files</li>
                  <li>Max 50MB</li>
                  <li>Clear titles required</li>
                </ul>
              </div>
            </div>

            {/* PROCEED */}
            {isStep1Complete && (
              <div className="col-12 text-end">
                <button className="btn text-white px-4" onClick={nextStep} style={{backgroundColor: "#0b8585"}}>
                  Proceed to Validation →
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="row g-4">
            <h4 className="mb-3">
              <i class="bi bi-database me-2 "></i> STEP 2: <span className="text-muted">Validation</span>
            </h4>
            {/* LEFT: DUPLICATE CHECK */}
            <div className="col-md-4">
              <div className="card shadow-sm border-0 p-4 h-100">
                <h5>Duplicate Check</h5>
                <p className="small text-muted">
                  Ensure this document does not already exist.
                </p>

                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={handleDuplicateCheck}
                >
                  <i class="bi bi-search me-2"></i> Run Verification
                </button>
                {/* 
                  {form.duplicate_checked && (
                    <div className="alert alert-success mt-3 py-2">
                      🔍 No duplicate found
                    </div>
                  )}
                */}
              </div>
            </div>

            {/* RIGHT: KEYWORDS & VERIFY */}
            <div className="col-md-8">
              <div className="card shadow-sm border-0 p-4">
                <label className="form-label fw-bold">
                  Enter document search keywords{" "}
                  <span className="text-danger">*</span>
                </label>

                <textarea
                  className="form-control mb-2"
                  rows="3"
                  placeholder="e.g. Strategy, Budget, Audit"
                  value={form.keywords}
                  onChange={(e) =>
                    setForm({ ...form, keywords: e.target.value })
                  }
                  onBlur={(e) =>
                    setForm({
                      ...form,
                      keywords: formatKeywords(e.target.value),
                    })
                  }
                />

                <small className="text-danger mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Keywords must be separated by comma and single space. Each
                  word must start with capital letter (e.g. Strategy, Budget)
                </small>
                <h5 className="mt-3">For Quality Assurance</h5>

                <label className="form-label mt-2">
                  Document Reviewed and Verified By{" "}
                  <span className="text-danger">*</span>
                </label>

                <input
                  className="form-control mb-2"
                  placeholder="Enter full name of reviewing officer/staff"
                  value={form.verified_by}
                  onChange={(e) =>
                    setForm({ ...form, verified_by: e.target.value })
                  }
                />

                <small className="text-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Please enter the name of the staff member who reviewed and
                  confirmed the accuracy of this document before upload.
                </small>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="col-12 d-flex justify-content-between">
              <button className="btn btn-outline-secondary" onClick={prevStep}>
                ← Back
              </button>

              {isStep2Complete && (
                <button className="btn text-white px-4" onClick={nextStep} style={{backgroundColor: "#0b8585"}}>
                  Proceed to Preview →
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="card shadow-sm border-0 p-4">
            <h4 className="mb-4">
              <i class="bi  bi-journal-medical me-2"></i> STEP 3: <span className="text-muted">Preview Detail</span>
            </h4>
            <hr />

            <div className="row g-3">
              <div className="col-md-6">
                <strong>Title</strong>
                <p>{form.title}</p>
              </div>

              <div className="col-md-6">
                <strong>File Name</strong>
                <p>{file?.name}</p>
              </div>

              <div className="col-md-4">
                <strong>Category</strong>
                <p>{categories.find((c) => c.id == form.category)?.name}</p>
              </div>

              <div className="col-md-4">
                <strong>Subcategory</strong>
                <p>
                  {subcategories.find((s) => s.id == form.subcategory)?.name}
                </p>
              </div>

              <div className="col-md-4">
                <strong>Retention Period</strong>
                <p>{form.retention}</p>
              </div>

              <div className="col-md-4">
                <strong>Classification</strong>
                <p>{form.visibility}</p>
              </div>

              <div className="col-md-4">
                <strong>File Type</strong>
                <p>{file?.type}</p>
              </div>

              <div className="col-md-4">
                <strong>File Size</strong>
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>

              <div className="col-md-4">
                <strong>Search Keywords</strong>
                <p>{form.keywords}</p>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-secondary" onClick={prevStep}>
                ← Back
              </button>
              <button className="btn btn-success px-4" onClick={handleSubmit}>
                <i class="bi bi-floppy2-fill me-2"></i>Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
