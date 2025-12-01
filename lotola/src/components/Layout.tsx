// src/components/Layout.tsx
import React, { useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Agent from "../pages/Agent";
import Analyst from "../pages/Analyst";
import Decision from "../pages/Decision";
import Admin from "../pages/Admin";
import Dashboard from "../pages/Dashboard";
import "./Layout.css";

type Role = "admin" | "analyst" | "decision" | "agent" | "utilisateur";

interface PageConfig {
  name: string;
  icon: string;
  component: React.FC;
}

const pageConfigs: Record<string, PageConfig> = {
  Dashboard: { name: "Tableau de Bord", icon: "fas fa-chart-line", component: Dashboard },
  Agent: { name: "Agent Communal", icon: "fas fa-user-tag", component: Agent },
  Analyst: { name: "Analyse des Flux", icon: "fas fa-chart-bar", component: Analyst },
  Decision: { name: "Rapports Décideur", icon: "fas fa-cogs", component: Decision },
  Admin: { name: "Administration", icon: "fas fa-shield-alt", component: Admin },
};

const Layout: React.FC<{ role: Role; userName?: string }> = ({ role, userName }) => {
  const navigate = useNavigate();

  const pagesByRole: Record<Role, string[]> = {
    admin: ["Dashboard", "Agent", "Analyst", "Decision", "Admin"],
    analyst: ["Dashboard", "Analyst", "Decision"], // pas Admin ni Agent
    decision: ["Dashboard", "Analyst", "Decision"], // pas Admin ni Agent
    agent: ["Dashboard", "Agent"], // pas Admin, Decision, Analyst
    utilisateur: ["Dashboard"],
  };

  const accessiblePageKeys = useMemo(() => pagesByRole[role] || ["Dashboard"], [role]);
  const [selectedPageKey, setSelectedPageKey] = useState(accessiblePageKeys[0]);

  const renderPage = () => {
    const config = pageConfigs[selectedPageKey];
    return config ? <config.component /> : <div>Bienvenue</div>;
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth", { replace: true });
  };

  return (
    <div className="layout-container">
      <header className="layout-header">
        <h1 className="app-title">Observatoire des Flux RDC</h1>
        <div className="profile">
          <div className="avatar">{(userName || "U").charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <span>{userName || "Utilisateur"}</span>
            <span>{role.toUpperCase()}</span>
          </div>
          <button onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Déconnexion</button>
        </div>
      </header>
      <div className="layout-body">
        <aside className="sidebar">
          <ul>
            {accessiblePageKeys.map((key) => {
              const config = pageConfigs[key];
              return (
                <li key={key} className={selectedPageKey === key ? "active" : ""} onClick={() => setSelectedPageKey(key)}>
                  <i className={config.icon}></i> {config.name}
                </li>
              );
            })}
          </ul>
        </aside>
        <main className="content">{renderPage()}</main>
      </div>
    </div>
  );
};

export default Layout;
