// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";

const App: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/*"
        element={
          currentUser ? (
            <Layout
              role={currentUser.role}
              userName={currentUser.displayName || currentUser.email || "Utilisateur"}
            />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
