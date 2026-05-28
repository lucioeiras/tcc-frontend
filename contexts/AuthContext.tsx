import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getItemAsync, deleteItemAsync } from 'expo-secure-store';
import { useRouter, useSegments, useNavigationContainerRef } from 'expo-router';

type AuthContextType = {
  signed: boolean;
  setSigned: (value: boolean) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function useProtectedRoute(signed: boolean | null) {
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (!navigationRef.isReady() || signed === null) return;

    const inAuthGroup =
      segments[0] === 'auth' || segments[0] === 'index' || segments[0] === undefined;

    if (!signed && !inAuthGroup) {
      router.replace('/');
    } else if (signed && inAuthGroup) {
      router.replace('/(tabs)/resume');
    }
  }, [signed, segments, navigationRef.isReady()]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [signed, setSigned] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getItemAsync('jwt');
      setSigned(!!token);
    };

    checkAuth();
  }, []);

  const signOut = async () => {
    await deleteItemAsync('jwt');
    await deleteItemAsync('usuario');
    setSigned(false);
  };

  useProtectedRoute(signed);

  if (signed === null) return null;

  return (
    <AuthContext.Provider value={{ signed, setSigned, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error('O contexto AuthProvider é necessário para usar useAuth');

  return context;
}
