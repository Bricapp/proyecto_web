"use client";

import { useRouter } from "next/navigation";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  LoginPayload,
  TokenResponse,
  UserProfile,
  fetchProfile,
  login as loginRequest
} from "@/lib/api";

type AuthContextValue = {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: (options?: { redirect?: boolean }) => void;
  refreshProfile: (token?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const persistTokens = useCallback((tokens: TokenResponse | null) => {
    if (typeof window === "undefined") return;
    if (tokens) {
      localStorage.setItem("accessToken", tokens.access);
      localStorage.setItem("refreshToken", tokens.refresh);
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }, []);

  const clearSession = useCallback(
    ({ redirect = true }: { redirect?: boolean } = {}) => {
      persistTokens(null);
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      if (redirect) {
        router.push("/login");
      }
    },
    [persistTokens, router]
  );

  const refreshProfile = useCallback(
    async (token?: string) => {
      const effectiveToken = token ?? accessToken;
      if (!effectiveToken) {
        setUser(null);
        return;
      }

      try {
        const profile = await fetchProfile(effectiveToken);
        setUser(profile);
      } catch (error) {
        console.error("No se pudo actualizar el perfil", error);
        clearSession();
        throw error;
      }
    },
    [accessToken, clearSession]
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);
      try {
        const tokens = await loginRequest(payload);
        setAccessToken(tokens.access);
        setRefreshToken(tokens.refresh);
        persistTokens(tokens);
        await refreshProfile(tokens.access);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    },
    [persistTokens, refreshProfile, router]
  );

  const logout = useCallback(
    ({ redirect = true }: { redirect?: boolean } = {}) => {
      clearSession({ redirect });
    },
    [clearSession]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");

    if (storedAccess) {
      setAccessToken(storedAccess);
      if (storedRefresh) {
        setRefreshToken(storedRefresh);
      }
      refreshProfile(storedAccess)
        .catch(() => {
          // refreshProfile ya maneja el cierre de sesión
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, accessToken, refreshToken, isLoading, login, logout, refreshProfile }),
    [user, accessToken, refreshToken, isLoading, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
