import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { downloadPrescriptionPdf } from "../api/downloadPdf";
import { useAuth } from "../context/AuthContext";
import PrescriptionCard from "../components/PrescriptionCard";

export default function DoctorDashboard() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/prescriptions/doctor");
      setPrescriptions(res.data);
    } catch (err) {
      setError("Could not load prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this prescription? This cannot be undone.")) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Could not delete this prescription.");
    }
  };

  const uniquePatients = new Set(prescriptions.map((p) => p.patientId)).size;

  if (loading) return <div className="loading-screen">Loading your prescriptions...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <div className="eyebrow">Doctor dashboard</div>
          <h1>Good to see you, Dr. {user.name.replace(/^Dr\.?\s*/i, "")}</h1>
          <p>Create, manage, and share digital prescriptions with your patients.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/prescriptions/new")}>
          + New Prescription
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="num">{prescriptions.length}</div>
          <div className="label">Total prescriptions</div>
        </div>
        <div className="stat-card">
          <div className="num">{uniquePatients}</div>
          <div className="label">Patients treated</div>
        </div>
        <div className="stat-card">
          <div className="num">
            {prescriptions.filter((p) => {
              const d = new Date(p.createdAt);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </div>
          <div className="label">Issued this month</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {prescriptions.length === 0 ? (
        <div className="empty-state">
          <h3>No prescriptions yet</h3>
          <p>Write your first digital prescription to get started.</p>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => navigate("/prescriptions/new")}>
              + New Prescription
            </button>
          </div>
        </div>
      ) : (
        <div className="rx-grid">
          {prescriptions.map((p) => (
            <PrescriptionCard
              key={p.id}
              prescription={p}
              role="DOCTOR"
              onDelete={handleDelete}
              onDownload={downloadPrescriptionPdf}
            />
          ))}
        </div>
      )}
    </div>
  );
}
