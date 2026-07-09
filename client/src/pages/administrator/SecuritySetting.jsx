import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config/baseUrl";
import { ClipLoader } from "react-spinners";
import { PulseLoader } from "react-spinners";

const SecuritySettingsAdmin = () => {
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState([
    { question_id: "", answer: "" },
    { question_id: "", answer: "" },
    { question_id: "", answer: "" },
  ]);

  const fetchExistingSettings = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE_URL}/admin/security-settings`, {
        withCredentials: true,
      });

      if (res.data.Status) {
        setExistingQuestions(res.data.Questions);

        // if already configured hide form
        if (res.data.Questions.length > 0) {
          setShowForm(false);
        } else {
          setShowForm(true);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/security-questions`, {
      withCredentials: true,
    });

    if (res.data.Status) {
      setAvailableQuestions(res.data.Questions);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchExistingSettings();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...form];

    updated[index][field] = value;

    setForm(updated);
  };

  const saveSettings = async () => {
    for (const item of form) {
      if (!item.question_id || !item.answer) {
        return Swal.fire("Validation", "Complete all questions", "warning");
      }
    }

    const res = await axios.post(
      `${API_BASE_URL}/admin/security-settings`,
      { questions: form },
      { withCredentials: true },
    );

    if (res.data.Status) {
      Swal.fire("Saved", "Recovery questions updated successfully", "success");

      fetchExistingSettings();
    } else {
      Swal.fire("Error", res.data.Error, "error");
    }
  };

  const deleteSettings = async () => {
    const confirm = await Swal.fire({
      title: "Remove security questions?",
      text: "You will need to set them up again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Remove",
      confirmButtonColor: "#dc3545",
    });

    if (!confirm.isConfirmed) return;

    const res = await axios.delete(`${API_BASE_URL}/admin/security-settings`, {
      withCredentials: true,
    });

    if (res.data.Status) {
      Swal.fire("Deleted", "Security questions removed", "success");

      setExistingQuestions([]);
      setShowForm(true);
    }
  };

  return (
    <div className="container py-4">
      <div className="card border-0 shadow rounded-4">
        <div className="card-header bg-white p-4 border-0">
          <h3 className="fw-bold mb-1">
            <i className="bi bi-shield-lock me-2 text-success"></i>
            Security Settings
          </h3>

          <p className="text-muted mb-0">
            Configure recovery questions to help recover your account if you
            forget your password.
          </p>
        </div>

        <div className="card-body p-4">
          {loading ? (
            <div className="text-center py-5">
              <PulseLoader color="#198754" size={12} margin={4} />
              <p className="mt-3 text-muted">Fetching data...</p>
            </div>
          ) : existingQuestions.length > 0 && !showForm ? (
            <>
              <div className="alert alert-success rounded-4">
                <div className="d-flex align-items-center">
                  <i className="bi bi-shield-check fs-3 me-3"></i>

                  <div>
                    <h6 className="fw-bold mb-1">
                      Security Questions Configured
                    </h6>

                    <small>
                      Your account recovery questions are already set up.
                    </small>
                  </div>
                </div>
              </div>

              {existingQuestions.map((q, index) => (
                <div key={q.id} className="border rounded-4 p-4 mb-3 bg-light">
                  <h6 className="fw-bold">Question {index + 1}</h6>

                  <div className="mb-2">{q.question}</div>

                  <small className="text-muted">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Answer saved securely
                  </small>
                </div>
              ))}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  className="btn btn-outline-secondary rounded-pill"
                  onClick={() => setShowForm(true)}
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Replace Questions
                </button>

                <button
                  className="btn btn-outline-danger rounded-pill"
                  onClick={deleteSettings}
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Existing form goes here exactly as you already have it */}

              {form.map((item, index) => (
                <div key={index} className="border rounded-4 p-4 mb-4 bg-light">
                  <h6 className="fw-bold mb-3">Question {index + 1}</h6>

                  <div className="row">
                    <div className="col-md-5 mb-3">
                      <label className="form-label">Select Question</label>

                      <select
                        className="form-select"
                        value={item.question_id}
                        onChange={(e) =>
                          handleChange(index, "question_id", e.target.value)
                        }
                      >
                        <option value="">Choose Question</option>

                        {availableQuestions.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.question}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-7">
                      <label className="form-label">Your Answer</label>

                      <input
                        className="form-control"
                        placeholder="Enter answer"
                        value={item.answer}
                        onChange={(e) =>
                          handleChange(index, "answer", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="d-flex justify-content-end gap-2">
                {existingQuestions.length > 0 && (
                  <button
                    className="btn btn-outline-secondary rounded-pill"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                )}

                <button
                  className="btn px-5 rounded-pill text-white"
                  style={{ backgroundColor: "#198754" }}
                  onClick={saveSettings}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Save Security Settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettingsAdmin;
