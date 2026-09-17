import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import { downloadPrescriptionPdf } from "../api/downloadPdf";
import { useAuth } from "../context/AuthContext";

export default function PrescriptionDetail() {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/prescriptions/${id}`);
        setPrescription(res.data);
      } catch (err) {
        setError("You don't have access to this prescription, or it doesn't exist.");
      }
    };
    load();
  }, [id]);

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error" style={{ marginTop: 30 }}>{error}</div>
      </div>
    );
  }

  if (!prescription) return <div className="loading-screen">Loading prescription...</div>;

  const date = new Date(prescription.createdAt).toLocaleDateString(undefined, {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div className="page-header">
        <div>
          <div className="eyebrow">Prescription #{prescription.id}</div>
          <h1>{prescription.diagnosis}</h1>
          <p>Issued on {date}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
          <button className="btn btn-accent" onClick={() => downloadPrescriptionPdf(prescription.id)}>
            Download PDF
          </button>
        </div>
      </div>

      <div className="rx-card" style={{ marginBottom: 20 }}>
        <div className="rx-card-body">
          <div className="field-row">
            <div>
              <div className="rx-person" style={{ marginBottom: 4 }}>Doctor</div>
              <strong>{prescription.doctorName}</strong>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                {prescription.doctorSpecialization || "General Physician"}
              </div>
            </div>
            <div>
              <div className="rx-person" style={{ marginBottom: 4 }}>Patient</div>
              <strong>{prescription.patientName}</strong>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{prescription.patientEmail}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3>Prescribed Medicines</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, color: "var(--muted)", textTransform: "uppercase" }}>
              <th style={{ padding: "8px 6px" }}>Medicine</th>
              <th style={{ padding: "8px 6px" }}>Dosage</th>
              <th style={{ padding: "8px 6px" }}>Frequency</th>
              <th style={{ padding: "8px 6px" }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines.map((m, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 6px", fontWeight: 600 }}>{m.name}</td>
                <td style={{ padding: "10px 6px" }}>{m.dosage || "-"}</td>
                <td style={{ padding: "10px 6px" }}>{m.frequency || "-"}</td>
                <td style={{ padding: "10px 6px" }}>{m.duration || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {prescription.notes && (
        <div className="card" style={{ padding: 24 }}>
          <h3>Additional Notes</h3>
          <p style={{ margin: 0, color: "var(--ink)" }}>{prescription.notes}</p>
        </div>
      )}
    </div>
  );
}
