// src/pages/Admin.tsx
import React, { useEffect, useState } from "react";
import { getDocs, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { communesCol, raisonsCol, mouvementsCol, utilisateursCol } from "../services/collections";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import "./Admin.css";

const Admin: React.FC = () => {
  const [communes, setCommunes] = useState<any[]>([]);
  const [raisons, setRaisons] = useState<any[]>([]);
  const [mouvements, setMouvements] = useState<any[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  
  // Champs pour ajout de commune
  const [newCommune, setNewCommune] = useState("");
  const [newLat, setNewLat] = useState("");
  const [newLng, setNewLng] = useState("");

  // Champs pour ajout de raison
  const [newRaison, setNewRaison] = useState("");

  const [error, setError] = useState("");

  // Charger toutes les données Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const communesSnap = await getDocs(communesCol);
        setCommunes(communesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const raisonsSnap = await getDocs(raisonsCol);
        setRaisons(raisonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const mouvementsSnap = await getDocs(mouvementsCol);
        setMouvements(mouvementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const utilisateursSnap = await getDocs(utilisateursCol);
        setUtilisateurs(utilisateursSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données. Vérifiez vos permissions.");
      }
    };
    fetchData();
  }, []);

  // Ajouter une commune avec coordonnées
  const handleAddCommune = async () => {
    if (!newCommune.trim() || !newLat.trim() || !newLng.trim()) {
      setError("Nom, latitude et longitude sont obligatoires.");
      return;
    }
    try {
      await addDoc(communesCol, { 
        nom_commune: newCommune, 
        lat: parseFloat(newLat), 
        lng: parseFloat(newLng), 
        createdAt: new Date().toISOString() 
      });
      setNewCommune(""); setNewLat(""); setNewLng("");
      alert("Commune ajoutée avec coordonnées !");
    } catch (err: any) {
      setError("Permission refusée pour ajouter une commune.");
    }
  };

  // Supprimer une commune
  const handleDeleteCommune = async (id: string) => {
    try {
      await deleteDoc(doc(communesCol, id));
      setCommunes(communes.filter(c => c.id !== id));
    } catch (err: any) {
      setError("Permission refusée pour supprimer une commune.");
    }
  };

  // Ajouter une raison
  const handleAddRaison = async () => {
    if (!newRaison.trim()) return;
    try {
      await addDoc(raisonsCol, { type: newRaison, createdAt: new Date().toISOString() });
      setNewRaison("");
      alert("Raison ajoutée !");
    } catch (err: any) {
      setError("Permission refusée pour ajouter une raison.");
    }
  };

  // Supprimer une raison
  const handleDeleteRaison = async (id: string) => {
    try {
      await deleteDoc(doc(raisonsCol, id));
      setRaisons(raisons.filter(r => r.id !== id));
    } catch (err: any) {
      setError("Permission refusée pour supprimer une raison.");
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(utilisateursCol, id));
      setUtilisateurs(utilisateurs.filter(u => u.id !== id));
    } catch (err: any) {
      setError("Permission refusée pour supprimer un utilisateur.");
    }
  };

  // Modifier rôle utilisateur
  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      await updateDoc(doc(utilisateursCol, id), { role: newRole });
      setUtilisateurs(utilisateurs.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (err: any) {
      setError("Permission refusée pour modifier un utilisateur.");
    }
  };

  // Préparer données pour graphiques
  const communesData = communes.map(c => ({
    name: c.nom_commune,
    value: mouvements.filter(m => m.destination_commune === c.nom_commune).length
  }));

  const raisonsData = raisons.map(r => ({
    name: r.type,
    value: mouvements.filter(m => m.raison === r.type).length
  }));

  return (
    <div className="admin-container">
      <h1 className="admin-title">Tableau Administrateur</h1>
      <p className="admin-subtitle">Gestion complète des données et visualisation</p>

      {error && <p className="error-message">{error}</p>}

      {/* Communes */}
      <section className="admin-section">
        <h2>Communes</h2>
        <div className="admin-form">
          <input value={newCommune} onChange={(e) => setNewCommune(e.target.value)} placeholder="Nom de la commune" />
          <input value={newLat} onChange={(e) => setNewLat(e.target.value)} placeholder="Latitude" type="number" step="any" />
          <input value={newLng} onChange={(e) => setNewLng(e.target.value)} placeholder="Longitude" type="number" step="any" />
          <button onClick={handleAddCommune}>Ajouter</button>
        </div>
        <ul className="admin-list">
          {communes.map((c) => (
            <li key={c.id}>
              {c.nom_commune} (Lat: {c.lat}, Lng: {c.lng})
              <button className="delete-btn" onClick={() => handleDeleteCommune(c.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Raisons */}
      <section className="admin-section">
        <h2>Raisons de déplacement</h2>
        <div className="admin-form">
          <input value={newRaison} onChange={(e) => setNewRaison(e.target.value)} placeholder="Ex: Travail, Études..." />
          <button onClick={handleAddRaison}>Ajouter</button>
        </div>
        <ul className="admin-list">
          {raisons.map((r) => (
            <li key={r.id}>
              {r.type}
              <button className="delete-btn" onClick={() => handleDeleteRaison(r.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Mouvements */}
      <section className="admin-section">
        <h2>Mouvements enregistrés</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Origine</th>
              <th>Destination</th>
              <th>Raison</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {mouvements.map((m) => (
              <tr key={m.id}>
                <td>{m.origine_commune}</td>
                <td>{m.destination_commune}</td>
                <td>{m.raison}</td>
                <td>{m.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Utilisateurs */}
      <section className="admin-section">
        <h2>Utilisateurs</h2>
        <ul className="admin-list">
          {utilisateurs.map((u) => (
            <li key={u.id}>
              {u.email} — rôle :
              <select value={u.role} onChange={(e) => handleUpdateRole(u.id, e.target.value)}>
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
                <option value="analyst">Analyst</option>
                <option value="decision">Decision</option>
                <option value="blocked">Blocked</option>
              </select>
              <button className="delete-btn" onClick={() => handleDeleteUser(u.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

            {/* Graphiques */}
      <section className="admin-section">
        <h2>Visualisation des données</h2>
        <div className="charts-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={communesData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#1a73e8" />
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={raisonsData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100} 
                label
              >
                {raisonsData.map((_entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={["#1a73e8", "#f39c12", "#e74c3c", "#2ecc71"][index % 4]} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default Admin;
