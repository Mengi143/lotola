// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { getDocs } from "firebase/firestore";
import { communesCol, raisonsCol, mouvementsCol, utilisateursCol } from "../services/collections";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";
import "./Dashboard.css";

interface Commune {
  id: string;
  nom_commune: string;
}

interface Mouvement {
  id: string;
  origine_commune: string;
  destination_commune: string;
  raison: string;
  date: string;
}

interface Utilisateur {
  id: string;
  email: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [raisons, setRaisons] = useState<any[]>([]);
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const communesSnap = await getDocs(communesCol);
        setCommunes(communesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Commune)));

        const raisonsSnap = await getDocs(raisonsCol);
        setRaisons(raisonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const mouvementsSnap = await getDocs(mouvementsCol);
        setMouvements(mouvementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mouvement)));

        const utilisateursSnap = await getDocs(utilisateursCol);
        setUtilisateurs(utilisateursSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Utilisateur)));

        setError("");
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données. Vérifiez vos permissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Préparer données pour graphique global (par commune)
  const dataCommune = communes.map(c => ({
    name: c.nom_commune,
    value: mouvements.filter(m => m.destination_commune === c.nom_commune).length
  }));

  // Préparer données temporelles (par date)
  const parDate = mouvements.reduce((acc: Record<string, number>, m) => {
    const date = m.date || "Inconnue";
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const dataDate = Object.entries(parDate).map(([date, value]) => ({ date, value }));

  if (loading) {
    return (
      <div className="dashboard-container">
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Observatoire des Flux RDC</h1>
      <p className="dashboard-subtitle">Vue d’ensemble des données</p>

      {error && <p className="error-message">{error}</p>}

      {/* Cartes synthétiques */}
      <div className="dashboard-cards">
        <div className="card blue">
          <h3>Communes</h3>
          <p>{communes.length}</p>
        </div>
        <div className="card yellow">
          <h3>Raisons</h3>
          <p>{raisons.length}</p>
        </div>
        <div className="card red">
          <h3>Mouvements</h3>
          <p>{mouvements.length}</p>
        </div>
        <div className="card green">
          <h3>Utilisateurs</h3>
          <p>{utilisateurs.length}</p>
        </div>
      </div>

      {/* Graphique global */}
      <div className="dashboard-chart">
        <h2>Flux par commune</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataCommune}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#1a73e8" name="Nombre de mouvements" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique temporel */}
      <div className="dashboard-chart">
        <h2>Évolution des mouvements</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#e74c3c" name="Mouvements par date" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
