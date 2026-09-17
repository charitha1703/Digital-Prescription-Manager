import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { downloadPrescriptionPdf } from "../api/downloadPdf";
import { useAuth } from "../context/AuthContext";
import PrescriptionCard from "../components/PrescriptionCard";

export default function PatientDashboard() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/prescriptions/patient");
        setPrescriptions(res.data);
      } catch (err) {
        setError("Could not load your prescriptions.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const uniqueDoctors = new Set(prescriptions.map((p) => p.doctorId)).size;

  if (loading) return <div className="loading-screen">Loading your prescriptions...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <div className="eyebrow">Patient dashboard</div>
          <h1>Hello, {user.name}</h1>
          <p>View and download prescriptions shared with you by your doctors.</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="num">{prescriptions.length}</div>
          <div className="label">Total prescriptions</div>
        </div>
        <div className="stat-card">
          <div className="num">{uniqueDoctors}</div>
          <div className="label">Doctors consulted</div>
        </div>
        <div className="stat-card">
          <div className="num">
            {prescriptions.length > 0 ? new Date(prescriptions[0].createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short" }) : "—"}
          </div>
          <div className="label">Most recent visit</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {prescriptions.length === 0 ? (
        <div className="empty-state">
          <h3>No prescriptions yet</h3>
          <p>Prescriptions shared by your doctor will appear here.</p>
        </div>
      ) : (
        <div className="rx-grid">
          {prescriptions.map((p) => (
            <PrescriptionCard
              key={p.id}
              prescription={p}
              role="PATIENT"
              onDownload={downloadPrescriptionPdf}
            />
          ))}
        </div>
      )}
    </div>
  );
}
