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
    if (!file || !form.title) {
      return Swal.fire("Missing", "File and title required", "warning");
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

  /* ===================== STEPPER ===================== */
  const StepIndicator = () => (
    <div className="d-flex justify-content-between mb-4">
      {["Upload", "Validation", "Preview"].map((label, i) => {
        const num = i + 1;
        return (
          <div key={num} className="text-center flex-fill">
            <div
              className={`rounded-circle mx-auto mb-1 ${
                step >= num ? "bg-info" : "bg-secondary"
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
      <div className="row g-12">
        <h3 className="mb-4">
          <i className="bi bi-files me-2"></i> Upload Document
        </h3>
        <StepIndicator />
      </div>
      <div className="card shadow rounded-4 p-4 mx-auto">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="row g-4">
            <h4 className="mb-3">
              <i class="bi bi-upload me-2 text-success "></i> STEP 1: Document
              Information
            </h4>
            {/* LEFT: FORM */}
            <div className="col-md-8">
              <div className="card border-0 shadow-sm p-4">
                <label className="form-label">
                  Document Title <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control mb-3"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <label className="form-label">Short Description</label>
                <textarea
                  className="form-control mb-3"
                  placeholder="Enter document short description"
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />

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

                <small className="text-muted mb-3 d-block">
                  <i className="bi bi-info-circle me-2 text-info"></i>
                  Documents must be retained for a minimum of 5 years before
                  archival or disposal.
                </small>

                <label className="form-label">
                  Document Classification <span className="text-danger">*</span>
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

                <label className="form-label">
                  Upload File <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* RIGHT: GUIDELINES */}
            <div className="col-md-4">
              <div className="card bg-light border-0 p-4 h-100">
                <h4>📌 Upload Guidelines</h4>
                <ul className=" mb-0">
                  <li>
                    All document, image, video and audio formats are allowed
                  </li>
                  <li>
                    Compressed files (.zip, .rar, .7z, .tar, .gz) are NOT
                    allowed
                  </li>
                  <li>Maximum file size: 50MB</li>
                  <li>Use clear and descriptive titles</li>
                </ul>
              </div>
            </div>

            {/* PROCEED */}
            {isStep1Complete && (
              <div className="col-12 text-end">
                <button className="btn btn-success px-4" onClick={nextStep}>
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
              <i class="bi bi-arrow-repeat me-2 text-success "></i> STEP 2:
              Document Validation
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
                <label className="form-label">
                  Enter document search keywords{" "}
                  <span className="text-danger">*</span>
                </label>

                <textarea
                  className="form-control mb-1"
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

                <small className="text-muted">
                  <i className="bi bi-info-circle me-2 text-info"></i>
                  Keywords must be separated by comma and single space. Each
                  word must start with capital letter (e.g. Strategy, Budget)
                </small>
                <h5 className="mt-3">Quality Assurance</h5>

                <label className="form-label mt-2">
                  Reviewed and Verified By{" "}
                  <span className="text-danger">*</span>
                </label>

                <input
                  className="form-control"
                  placeholder="Enter full name of reviewing officer/staff"
                  value={form.verified_by}
                  onChange={(e) =>
                    setForm({ ...form, verified_by: e.target.value })
                  }
                />

                <small className="text-muted">
                  Please enter the name of the staff member who reviewed and
                  confirmed the accuracy of this document before upload.
                </small>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="col-12 d-flex justify-content-between">
              <button className="btn btn-secondary" onClick={prevStep}>
                ← Back
              </button>

              {isStep2Complete && (
                <button className="btn btn-success px-4" onClick={nextStep}>
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
              <i class="bi bi-eye-fill me-2 text-success "></i> STEP 3: Document
              Details
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
              <button className="btn btn-secondary" onClick={prevStep}>
                ← Back
              </button>
              <button className="btn btn-success px-4" onClick={handleSubmit}>
                <i class="bi bi-upload"></i> Final Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
