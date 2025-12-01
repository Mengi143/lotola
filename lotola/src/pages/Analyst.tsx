import React, { useEffect, useState } from "react";
import { getDocs } from "firebase/firestore";
import { mouvementsCol } from "../services/collections";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import "./Analyst.css";

const Analyst: React.FC = () => {
  const [mouvements, setMouvements] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [filterCommune, setFilterCommune] = useState("");
  const [filterRaison, setFilterRaison] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mouvementsSnap = await getDocs(mouvementsCol);
        setMouvements(mouvementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err: any) {
        console.error("Erreur lors du chargement des mouvements:", err);
        setError("Impossible de charger les mouvements. Vérifiez vos permissions.");
      }
    };
    fetchData();
  }, []);

  const totalMouvements = mouvements.length;

  const mouvementsFiltres = mouvements.filter(m =>
    (!filterCommune || m.destination_commune === filterCommune) &&
    (!filterRaison || m.raison === filterRaison)
  );

  const parCommune = mouvements.reduce((acc: Record<string, number>, m) => {
    const commune = m.destination_commune || "Inconnue";
    acc[commune] = (acc[commune] || 0) + 1;
    return acc;
  }, {});

  const parRaison = mouvements.reduce((acc: Record<string, number>, m) => {
    const raison = m.raison || "Inconnue";
    acc[raison] = (acc[raison] || 0) + 1;
    return acc;
  }, {});

  const parDate = mouvements.reduce((acc: Record<string, number>, m) => {
    const date = m.date || "Inconnue";
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const dataCommune = Object.entries(parCommune).map(([name, value]) => ({ name, value }));
  const dataRaison = Object.entries(parRaison).map(([name, value]) => ({ name, value }));
  const dataDate = Object.entries(parDate).map(([date, value]) => ({ date, value }));

  return (
    <div className="analyst-container">
      <h1 className="analyst-title">Dashboard Analyste</h1>
      <p className="analyst-subtitle">Analyse approfondie des flux de population</p>

      {error && <p className="error-message">{error}</p>}

      <section className="analyst-section">
        <h2>Filtres</h2>
        <div className="analyst-filters">
          <select value={filterCommune} onChange={(e) => setFilterCommune(e.target.value)}>
            <option value="">Toutes les communes</option>
            {Object.keys(parCommune).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select value={filterRaison} onChange={(e) => setFilterRaison(e.target.value)}>
            <option value="">Toutes les raisons</option>
            {Object.keys(parRaison).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="analyst-section">
        <h2>Indicateurs clés</h2>
        <p>Total des mouvements enregistrés : <strong>{totalMouvements}</strong></p>
        <p>Mouvements filtrés : <strong>{mouvementsFiltres.length}</strong></p>
      </section>

      <section className="analyst-section">
        <h2>Visualisations</h2>
        <div className="charts-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataCommune}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#1a73e8" />
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dataRaison} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {dataRaison.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={["#1a73e8", "#f39c12", "#e74c3c", "#2ecc71"][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataDate}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#1a73e8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="analyst-section">
        <h2>Détails des mouvements</h2>
        {mouvementsFiltres.length === 0 ? (
          <p>Aucun mouvement disponible.</p>
        ) : (
          <table className="analyst-table">
            <thead>
              <tr>
                <th>Origine</th>
                <th>Destination</th>
                <th>Raison</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {mouvementsFiltres.map((m) => (
                <tr key={m.id}>
                  <td>{m.origine_commune || "N/A"}</td>
                  <td>{m.destination_commune || "N/A"}</td>
                  <td>{m.raison || "N/A"}</td>
                  <td>{m.date || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Analyst;
