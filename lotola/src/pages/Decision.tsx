// src/pages/Decision.tsx
import React, { useEffect, useState } from "react";
import { getDocs } from "firebase/firestore";
import { mouvementsCol, communesCol } from "../services/collections";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import FluxMap from "../components/FluxMap";
import "./Decision.css";

const Decision: React.FC = () => {
  const [mouvements, setMouvements] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mouvementsSnap = await getDocs(mouvementsCol);
        setMouvements(mouvementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const communesSnap = await getDocs(communesCol);
        setCommunes(communesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données. Vérifiez vos permissions.");
      }
    };
    fetchData();
  }, []);

  // Statistiques synthétiques
  const totalMouvements = mouvements.length;

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

  const topDestinations = Object.entries(parCommune)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);

  const topReasons = Object.entries(parRaison)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);

  // Préparation des données pour graphiques
  const dataCommune = Object.entries(parCommune).map(([name, value]) => ({ name, value }));
  const dataRaison = Object.entries(parRaison).map(([name, value]) => ({ name, value }));
  const dataDate = Object.entries(parDate).map(([date, value]) => ({ date, value }));

  // Exemple de prédiction simple
  const prediction = dataDate.length > 2
    ? Math.round((dataDate[dataDate.length - 1].value + dataDate[dataDate.length - 2].value) / 2)
    : 0;

  return (
    <div className="decision-container">
      <h1 className="decision-title">Rapports Décideur</h1>
      <p className="decision-subtitle">
        Vue synthétique et prédictive pour l’orientation des politiques publiques
      </p>

      {error && <p className="error-message">{error}</p>}

      <section className="decision-section">
        <h2>Indicateurs clés</h2>
        <p>Total des mouvements enregistrés : <strong>{totalMouvements}</strong></p>
        <p>Prévision prochaine période : <strong>{prediction}</strong> mouvements estimés</p>
      </section>

      <section className="decision-section">
        <h2>Visualisations stratégiques</h2>
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

      <section className="decision-section">
        <h2>Top 5 communes de destination</h2>
        {topDestinations.length === 0 ? (
          <p>Aucune donnée disponible.</p>
        ) : (
          <ul className="decision-list">
            {topDestinations.map(([commune, count]) => (
              <li key={commune}>{commune} : <strong>{count}</strong></li>
            ))}
          </ul>
        )}
      </section>

      <section className="decision-section">
        <h2>Top 5 raisons de déplacement</h2>
        {topReasons.length === 0 ? (
          <p>Aucune donnée disponible.</p>
        ) : (
          <ul className="decision-list">
            {topReasons.map(([raison, count]) => (
              <li key={raison}>{raison} : <strong>{count}</strong></li>
            ))}
          </ul>
        )}
      </section>

      <section className="decision-section">
        <h2>Carte des flux</h2>
        <div className="decision-map">
          <FluxMap communes={communes} mouvements={mouvements} />
        </div>
      </section>
    </div>
  );
};

export default Decision;
