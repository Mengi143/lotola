// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export type UserRole = "admin" | "analyst" | "decision" | "agent" | "utilisateur";

export interface ExtendedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

interface AuthContextType {
  currentUser: ExtendedUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = useCallback(async (user: User) => {
    if (!db || !user.uid) {
      setCurrentUser(null);
      return;
    }

    try {
      const userDocRef = doc(db, "utilisateurs", user.uid);
      const docSnap = await getDoc(userDocRef);

      let fetchedRole: UserRole = "utilisateur";

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.role && ["admin", "analyst", "decision", "agent", "utilisateur"].includes(data.role)) {
          fetchedRole = data.role as UserRole;
        }
      } else {
        await setDoc(userDocRef, {
          email: user.email,
          role: fetchedRole,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      }

      await updateDoc(userDocRef, { lastLogin: serverTimestamp() });

      setCurrentUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName ?? user.email,
        role: fetchedRole,
      });
    } catch (error) {
      console.error("Erreur rôle utilisateur:", error);
      setCurrentUser(null);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        await fetchUserRole(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserRole]);

  const value: AuthContextType = useMemo(() => ({ currentUser, loading, logout }), [currentUser, loading, logout]);

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: "10px" }}></i> Chargement...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
