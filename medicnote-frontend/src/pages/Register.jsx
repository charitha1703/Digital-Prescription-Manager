import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [role, setRole] = useState("DOCTOR");
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", specialization: "", age: "", gender: "Male",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { registerDoctor, registerPatient } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let data;
      if (role === "DOCTOR") {
        data = await registerDoctor({
          name: form.name, email: form.email, password: form.password,
          specialization: form.specialization, phone: form.phone,
        });
      } else {
        data = await registerPatient({
          name: form.name, email: form.email, password: form.password,
          phone: form.phone, age: form.age ? Number(form.age) : null, gender: form.gender,
        });
      }
      navigate(data.role === "DOCTOR" ? "/doctor" : "/patient");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="brand-mark">Rx</div>
          <span className="brand-name">MedicNote</span>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join MedicNote as a doctor or a patient.</p>

        <div className="role-toggle">
          <button type="button" className={role === "DOCTOR" ? "active" : ""} onClick={() => setRole("DOCTOR")}>
            I'm a Doctor
          </button>
          <button type="button" className={role === "PATIENT" ? "active" : ""} onClick={() => setRole("PATIENT")}>
            I'm a Patient
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input value={form.name} onChange={update("name")} required placeholder="Dr. Anita Sharma" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update("email")} required placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={update("password")} required minLength={6} placeholder="At least 6 characters" />
          </div>

          {role === "DOCTOR" ? (
            <div className="field-row">
              <div className="field">
                <label>Specialization</label>
                <input value={form.specialization} onChange={update("specialization")} placeholder="General Physician" />
              </div>
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={update("phone")} placeholder="Optional" />
              </div>
            </div>
          ) : (
            <div className="field-row">
              <div className="field">
                <label>Age</label>
                <input type="number" value={form.age} onChange={update("age")} placeholder="Optional" />
              </div>
              <div className="field">
                <label>Gender</label>
                <select value={form.gender} onChange={update("gender")}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
