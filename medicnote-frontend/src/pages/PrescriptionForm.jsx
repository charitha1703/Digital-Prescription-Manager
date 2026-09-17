import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosConfig";

const emptyMedicine = () => ({ name: "", dosage: "", frequency: "", duration: "" });

export default function PrescriptionForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientId, setPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([emptyMedicine()]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
const [aiLoading, setAiLoading] = useState(false);


const getSuggestion = async () => {
  if (!diagnosis.trim()) return;
  setAiLoading(true);
  try {
    const res = await api.post("/ai/suggest-medicines", { diagnosis });
    setAiSuggestion(res.data.suggestion);
  } catch (err) {
    setAiSuggestion("Could not get a suggestion right now.");
  } finally {
    setAiLoading(false);
  }
};
  useEffect(() => {
    const loadPatients = async () => {
      const res = await api.get("/patients/search", { params: { query: patientSearch } });
      setPatients(res.data);
    };
    loadPatients();
  }, [patientSearch]);

  useEffect(() => {
    if (!isEdit) return;
    const loadPrescription = async () => {
      try {
        const res = await api.get(`/prescriptions/${id}`);
        const p = res.data;
        setPatientId(p.patientId);
        setDiagnosis(p.diagnosis);
        setNotes(p.notes || "");
        setMedicines(p.medicines.length ? p.medicines : [emptyMedicine()]);
      } catch (err) {
        setError("Could not load this prescription.");
      } finally {
        setLoading(false);
      }
    };
    loadPrescription();
  }, [id, isEdit]);

  const updateMedicine = (index, key, value) => {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, [key]: value } : m)));
  };

  const addMedicine = () => setMedicines((prev) => [...prev, emptyMedicine()]);
  const removeMedicine = (index) => setMedicines((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!patientId) { setError("Please select a patient."); return; }
    if (medicines.some((m) => !m.name.trim())) { setError("Every medicine needs a name."); return; }

    setSaving(true);
    const payload = { patientId: Number(patientId), diagnosis, notes, medicines };

    try {
      if (isEdit) {
        await api.put(`/prescriptions/${id}`, payload);
      } else {
        await api.post("/prescriptions", payload);
      }
      navigate("/doctor");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save this prescription.");
    } finally {
      setSaving(false);
    }
  };
  

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <div className="eyebrow">{isEdit ? "Edit prescription" : "New prescription"}</div>
          <h1>{isEdit ? "Update prescription" : "Write a prescription"}</h1>
          <p>Fill in the diagnosis and medicines for your patient.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="card" style={{ padding: 24 }}>
          <h3>Patient</h3>
          <div className="field">
            <label>Search patient by name or email</label>
            <input
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Start typing to search..."
            />
          </div>
          <div className="field">
            <label>Select patient</label>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
              <option value="">-- Choose a patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3>Diagnosis</h3>
          <div className="field">
            <label>Diagnosis / condition</label>
            <textarea
              rows={3}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
              placeholder="e.g. Acute viral fever with mild dehydration"
            />
          </div>
          <div className="field">
            <label>Additional notes (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Follow up after 5 days, drink plenty of fluids"
            />
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Medicines</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={addMedicine}>+ Add medicine</button>
          </div>

          {medicines.map((m, i) => (
            <div className="medicine-row" key={i}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Medicine name</label>
                <input value={m.name} onChange={(e) => updateMedicine(i, "name", e.target.value)} required placeholder="Paracetamol" />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Dosage</label>
                <input value={m.dosage} onChange={(e) => updateMedicine(i, "dosage", e.target.value)} placeholder="500mg" />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Frequency</label>
                <input value={m.frequency} onChange={(e) => updateMedicine(i, "frequency", e.target.value)} placeholder="Twice a day" />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Duration</label>
                <input value={m.duration} onChange={(e) => updateMedicine(i, "duration", e.target.value)} placeholder="5 days" />
              </div>
              <button
                type="button"
                className="remove-med-btn"
                onClick={() => removeMedicine(i)}
                disabled={medicines.length === 1}
                title="Remove medicine"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={getSuggestion} disabled={aiLoading}>
  {aiLoading ? "Thinking..." : "✨ Suggest medicines (AI)"}
</button>

{aiSuggestion && (
  <div className="alert alert-success" style={{ marginTop: 10 }}>
    <strong>AI suggestion (please review before using):</strong>
    <pre style={{ whiteSpace: "pre-wrap", margin: "6px 0 0 0" }}>{aiSuggestion}</pre>
  </div>
)}

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update prescription" : "Save prescription"}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/doctor")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
