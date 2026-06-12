import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { getItemAsync, deleteItemAsync } from 'expo-secure-store';
import { useRouter, useSegments, useNavigationContainerRef } from 'expo-router';

import { api, setOnSessionExpired } from '@/services/api';

type User = {
  id: number | string;
  name: string;
  email?: string;
  [key: string]: any;
};

type AuthContextType = {
  signed: boolean;
  setSigned: (value: boolean) => void | Promise<void>;
  signOut: () => Promise<void>;
  jwt: string | null;
  user: User | null;
  usuario: User | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

function useProtectedRoute(signed: boolean | null) {
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (!navigationRef.isReady() || signed === null) return;

    const inAuthGroup = segments[0] === 'auth' || segments[0] === undefined;

    if (!signed && !inAuthGroup) {
      router.replace('/');
    } else if (signed && inAuthGroup) {
      router.replace('/(tabs)/resume');
    }
  }, [signed, segments, navigationRef.isReady()]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [signed, setSignedState] = useState<boolean | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getItemAsync('jwt');
      const userStr = await getItemAsync('usuario');

      if (token) {
        setJwt(token);
        setUser(userStr ? JSON.parse(userStr) : null);
        setSignedState(true);
      } else {
        setJwt(null);
        setUser(null);
        setSignedState(false);
      }
    };

    checkAuth();
  }, []);

  const setSigned = async (value: boolean) => {
    if (value) {
      const token = await getItemAsync('jwt');
      const userStr = await getItemAsync('usuario');

      setJwt(token);
      setUser(userStr ? JSON.parse(userStr) : null);
      setSignedState(true);
    } else {
      setJwt(null);
      setUser(null);
      setSignedState(false);
    }
  };

  const signOut = async () => {
    const refreshToken = await getItemAsync('refreshToken');

    // Best-effort: invalida o refresh token no servidor
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // mesmo se falhar, limpa a sessão local
      }
    }

    await deleteItemAsync('jwt');
    await deleteItemAsync('refreshToken');
    await deleteItemAsync('usuario');

    setJwt(null);
    setUser(null);
    setSignedState(false);
  };

  // Quando o refresh falhar no interceptor, derruba a sessão no app
  useEffect(() => {
    setOnSessionExpired(() => {
      setJwt(null);
      setUser(null);
      setSignedState(false);
    });

    return () => setOnSessionExpired(null);
  }, []);

  useProtectedRoute(signed);

  if (signed === null) return null;

  return (
    <AuthContext.Provider
      value={{ signed, setSigned, signOut, jwt, user, usuario: user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error('O contexto AuthProvider é necessário para usar useAuth');

  return context;
}
