import React, { createContext, useContext, useState } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("medicnote_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password, role) => {
    const res = await api.post("/auth/login", { email, password, role });
    persist(res.data);
    return res.data;
  };

  const registerDoctor = async (payload) => {
    const res = await api.post("/auth/register/doctor", payload);
    persist(res.data);
    return res.data;
  };

  const registerPatient = async (payload) => {
    const res = await api.post("/auth/register/patient", payload);
    persist(res.data);
    return res.data;
  };

  const persist = (data) => {
    localStorage.setItem("medicnote_token", data.token);
    const userObj = { id: data.id, name: data.name, email: data.email, role: data.role };
    localStorage.setItem("medicnote_user", JSON.stringify(userObj));
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem("medicnote_token");
    localStorage.removeItem("medicnote_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, registerDoctor, registerPatient, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
