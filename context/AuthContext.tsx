"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { auth } from "../lib/firebase";

// Sistemin kullanacağı verilerin tipleri
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kullanıcının giriş durumunu dinle
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // İleride belirleyeceğimiz admin e-postası (Örn: selin@mail.com)
        // Şimdilik e-posta ile giren herkesi potansiyel admin sayabiliriz, veya anonim değilse admin diyebiliriz.
        setIsAdmin(!currentUser.isAnonymous); 
        setLoading(false);
      } else {
        // Eğer kullanıcı hiç yoksa, otomatik olarak Anonim giriş yap
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Anonim giriş hatası:", error);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
