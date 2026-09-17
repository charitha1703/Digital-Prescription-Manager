import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import PrescriptionForm from "./pages/PrescriptionForm";
import PrescriptionDetail from "./pages/PrescriptionDetail";
import ChangePassword from "./pages/ChangePassword";

function Shell({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      {children}
    </div>
  );
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "DOCTOR" ? "/doctor" : "/patient"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/doctor"
            element={
              <PrivateRoute allowedRole="DOCTOR">
                <Shell><DoctorDashboard /></Shell>
              </PrivateRoute>
            }
          />
          <Route
            path="/prescriptions/new"
            element={
              <PrivateRoute allowedRole="DOCTOR">
                <Shell><PrescriptionForm /></Shell>
              </PrivateRoute>
            }
          />
          <Route
            path="/prescriptions/:id/edit"
            element={
              <PrivateRoute allowedRole="DOCTOR">
                <Shell><PrescriptionForm /></Shell>
              </PrivateRoute>
            }
          />

          <Route
            path="/patient"
            element={
              <PrivateRoute allowedRole="PATIENT">
                <Shell><PatientDashboard /></Shell>
              </PrivateRoute>
            }
          />
    <Route
  path="/change-password"
  element={
    <PrivateRoute>
      <Shell><ChangePassword /></Shell>
    </PrivateRoute>
  }
/>

          <Route
            path="/prescriptions/:id"
            element={
              <PrivateRoute>
                <Shell><PrescriptionDetail /></Shell>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
