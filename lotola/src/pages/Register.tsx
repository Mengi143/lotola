import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("utilisateur");
  const [authCode, setAuthCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Vérification du code d’autorisation si rôle sensible
      if (["admin", "analyst", "decision", "agent"].includes(role)) {
        if (!authCode) {
          setError("Un code d'autorisation est requis pour ce rôle.");
          setLoading(false);
          return;
        }

        const adminDoc = await getDoc(doc(db, "utilisateurs", authCode));
        if (!adminDoc.exists() || adminDoc.data().role?.toLowerCase() !== "admin") {
          setError("Code d'autorisation invalide. Veuillez contacter un administrateur.");
          setLoading(false);
          return;
        }
      }

      // Création du compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Enregistrement dans Firestore avec structure complète
      await setDoc(doc(db, "utilisateurs", user.uid), {
        email: user.email,
        fullName,
        role,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        lastRoleUpdate: new Date().toISOString(),
      });

      // Redirection selon rôle
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "analyst":
          navigate("/analyst");
          break;
        case "decision":
          navigate("/decision");
          break;
        case "agent":
          navigate("/agent");
          break;
        default:
          navigate("/dashboard");
          break;
      }
    } catch (err: any) {
      console.error("Erreur inscription:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Cet email est déjà utilisé.");
      } else if (err.code === "auth/weak-password") {
        setError("Mot de passe trop faible (minimum 6 caractères).");
      } else if (err.code === "auth/invalid-email") {
        setError("Format d'email invalide.");
      } else {
        setError("Impossible de créer le compte.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Botongi Engumba</h1>
        <p className="register-subtitle">Créer un compte</p>

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label>Nom complet</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
            />
          </div>
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
          <div className="form-group">
            <label>Rôle</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="utilisateur">Utilisateur</option>
              <option value="agent">Agent</option>
              <option value="analyst">Analyst</option>
              <option value="decision">Decision</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {["admin", "analyst", "decision", "agent"].includes(role) && (
            <div className="form-group">
              <label>Code d'autorisation</label>
              <input 
                type="text" 
                value={authCode} 
                onChange={(e) => setAuthCode(e.target.value)} 
                required 
              />
            </div>
          )}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Création..." : "S'inscrire"}
          </button>
        </form>

        <div className="register-footer">
          Déjà un compte ? <a href="/auth">Se connecter</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
