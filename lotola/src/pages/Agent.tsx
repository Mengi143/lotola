// src/pages/Agent.tsx
import React, { useState, useEffect } from "react";
import { addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { mouvementsCol, communesCol, raisonsCol } from "../services/collections";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import "./Agent.css";

const Agent: React.FC = () => {
  const [communes, setCommunes] = useState<any[]>([]);
  const [raisons, setRaisons] = useState<any[]>([]);
  const [origine, setOrigine] = useState("");
  const [destination, setDestination] = useState("");
  const [raison, setRaison] = useState("");
  const [raisonAutre, setRaisonAutre] = useState(""); // champ libre si "Autre"
  const [date, setDate] = useState("");
  const [mouvements, setMouvements] = useState<any[]>([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const communesSnap = await getDocs(communesCol);
      setCommunes(communesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const raisonsSnap = await getDocs(raisonsCol);
      setRaisons(raisonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const mouvementsSnap = await getDocs(mouvementsCol);
      setMouvements(mouvementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setError("");
    } catch (err: any) {
      setError("Impossible de charger les listes de données.");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddMouvement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origine || !destination || !date) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    try {
      let finalRaison = raison;

      // Gestion du cas "Autre"
      if (raison === "__autre__") {
        const propre = raisonAutre.trim();
        if (!propre) {
          setError("Veuillez saisir la raison personnalisée.");
          return;
        }
        // Vérifier si la raison existe déjà (case-insensitive)
        const existe = raisons.some(r => (r.type || "").toLowerCase() === propre.toLowerCase());
        if (!existe) {
          await addDoc(raisonsCol, { type: propre });
          // rafraîchir les raisons pour intégrer la nouvelle
          const raisonsSnap = await getDocs(raisonsCol);
          setRaisons(raisonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
        finalRaison = propre;
      }

      await addDoc(mouvementsCol, {
        origine_commune: origine,
        destination_commune: destination,
        raison: finalRaison,
        date,
        timestamp: new Date().toISOString(),
      });

      // reset
      setOrigine("");
      setDestination("");
      setRaison("");
      setRaisonAutre("");
      setDate("");

      await fetchData();
      setError("");
    } catch {
      setError("Erreur lors de l'enregistrement du mouvement.");
    }
  };

  const handleDeleteMouvement = async (id: string) => {
    try {
      const mouvementDoc = doc(mouvementsCol, id);
      await deleteDoc(mouvementDoc);
      await fetchData();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  const countStats = (key: 'destination_commune' | 'raison') => {
    const counts = mouvements.reduce((acc, m) => {
      const value = m[key] || "Non spécifié";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const statsCommune = countStats('destination_commune');
  const statsRaison = countStats('raison');

  return (
    <div className="agent-container">
      <h1>Interface Agent</h1>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleAddMouvement}>
        <select value={origine} onChange={(e) => setOrigine(e.target.value)} required>
          <option value="">Origine</option>
          {communes.map(c => <option key={c.id} value={c.nom_commune}>{c.nom_commune}</option>)}
        </select>

        <select value={destination} onChange={(e) => setDestination(e.target.value)} required>
          <option value="">Destination</option>
          {communes.map(c => <option key={c.id} value={c.nom_commune}>{c.nom_commune}</option>)}
        </select>

        <select
          value={raison}
          onChange={(e) => {
            setRaison(e.target.value);
            if (e.target.value !== "__autre__") setRaisonAutre("");
          }}
          required
        >
          <option value="">Raison</option>
          {raisons.map(r => <option key={r.id} value={r.type}>{r.type}</option>)}
          <option value="__autre__">Autre...</option>
        </select>

        {raison === "__autre__" && (
          <input
            type="text"
            placeholder="Précisez la raison"
            value={raisonAutre}
            onChange={(e) => setRaisonAutre(e.target.value)}
            required
          />
        )}

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <button type="submit">Enregistrer</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Origine</th>
            <th>Destination</th>
            <th>Raison</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {mouvements.map(m => (
            <tr key={m.id}>
              <td>{m.origine_commune}</td>
              <td>{m.destination_commune}</td>
              <td>{m.raison}</td>
              <td>{m.date}</td>
              <td><button onClick={() => handleDeleteMouvement(m.id)}>Supprimer</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={statsCommune}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#1A73E8" />
        </BarChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={statsRaison} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {statsRaison.map((_, i) => (
              <Cell key={i} fill={["#1A73E8","#FFC107","#DC3545","#2ECC71"][i%4]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Agent;
