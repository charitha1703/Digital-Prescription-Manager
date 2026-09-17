import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const homeLink = user?.role === "DOCTOR" ? "/doctor" : "/patient";

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to={user ? homeLink : "/login"} className="brand">
          <div className="brand-mark">Rx</div>
          <span className="brand-name">MedicNote</span>
        </Link>
       <Link to="/change-password" className="btn-logout" style={{ marginRight: 4 }}>
  Change Password
</Link>

        {user && (
          <div className="nav-user">
            <span className="nav-badge">{user.role}</span>
            <span style={{ fontSize: 14, color: "var(--muted)" }}>{user.name}</span>
            <button className="btn-logout" onClick={handleLogout}>Log out</button>
          </div>
        )}
      </div>
    </header>
  );
}
