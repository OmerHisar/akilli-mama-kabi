'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

// TS2339 hatasını çözen tip tanımı ('role' eklendi)
interface AuthContextType {
  user: User | null;
  role: string;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'anonymous',
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('anonymous');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        try {
          const userCred = await signInAnonymously(auth);
          setUser(userCred.user);
          setRole('anonymous');
        } catch (error) {
          console.error("Anonim giriş hatası:", error);
        }
      } else {
        setUser(currentUser);
        setRole(currentUser.isAnonymous ? 'anonymous' : 'admin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);