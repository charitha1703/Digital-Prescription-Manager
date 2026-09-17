import React from "react";
import { useNavigate } from "react-router-dom";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function PrescriptionCard({ prescription, role, onDelete, onDownload }) {
  const navigate = useNavigate();

  return (
    <div className="rx-card">
      <div className="rx-card-body">
        <div className="rx-card-top">
          <span className="rx-mark">Rx</span>
          <span className="rx-date">{formatDate(prescription.createdAt)}</span>
        </div>

        <div className="rx-diagnosis">{prescription.diagnosis}</div>

        {role === "DOCTOR" ? (
          <div className="rx-person">Patient: <strong>{prescription.patientName}</strong></div>
        ) : (
          <div className="rx-person">
            Dr. <strong>{prescription.doctorName}</strong>
            {prescription.doctorSpecialization ? ` · ${prescription.doctorSpecialization}` : ""}
          </div>
        )}

        <div className="rx-med-list">
          {prescription.medicines.slice(0, 4).map((m, i) => (
            <span className="med-chip" key={i}>{m.name}</span>
          ))}
          {prescription.medicines.length > 4 && (
            <span className="med-chip">+{prescription.medicines.length - 4} more</span>
          )}
        </div>

        <div className="rx-actions">
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/prescriptions/${prescription.id}`)}>
            View
          </button>
          <button className="btn btn-accent btn-sm" onClick={() => onDownload(prescription.id)}>
            Download PDF
          </button>
          {role === "DOCTOR" && (
            <>
              <button className="btn btn-outline btn-sm" onClick={() => navigate(`/prescriptions/${prescription.id}/edit`)}>
                Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(prescription.id)}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
