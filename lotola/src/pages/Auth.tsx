import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Auth: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Connexion Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Récupération du rôle depuis Firestore
      const userRef = doc(db, "utilisateurs", user.uid);
      const userDoc = await getDoc(userRef);
      const role = userDoc.exists() ? userDoc.data().role?.toLowerCase() : null;

      // Mise à jour du lastLogin
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString(),
      });

      // Redirection selon le rôle
      if (role) {
        switch (role) {
          case "admin":
            navigate("/admin");
            break;
          case "agent":
            navigate("/agent");
            break;
          case "analyst":
            navigate("/analyst");
            break;
          case "decision":
            navigate("/decision");
            break;
          default:
            navigate("/dashboard");
            break;
        }
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Erreur Firebase:", err);

      if (err.code === "auth/user-not-found") {
        setError("Utilisateur introuvable. Veuillez créer un compte.");
      } else if (err.code === "auth/wrong-password") {
        setError("Mot de passe incorrect.");
      } else if (err.code === "auth/invalid-email") {
        setError("Format d'email invalide.");
      } else {
        setError("Échec de connexion. Vérifiez vos identifiants.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Botongi Engumba</h1>
        <p className="auth-subtitle">Connexion</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="auth-footer">
          Pas de compte ? <a href="/register">Créer un compte</a>
        </div>
      </div>
    </div>
  );
};

export default Auth;
