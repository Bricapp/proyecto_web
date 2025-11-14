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
  RegisterPayload,
  TokenResponse,
  UserProfile,
  confirmPasswordReset,
  fetchProfile,
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  register as registerRequest,
  requestPasswordReset,
  updateProfile as updateProfileRequest
} from "@/lib/api";

type AuthContextValue = {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: (options?: { redirect?: boolean }) => void;
  refreshProfile: (token?: string) => Promise<void>;
  updateProfile: (
    payload: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      photo?: File | null;
      remove_photo?: boolean;
    }
  ) => Promise<UserProfile>;
  requestPasswordReset: (email: string) => Promise<{ detail: string }>;
  confirmPasswordReset: (payload: { uid: string; token: string; password: string }) => Promise<{ detail: string }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const persistTokens = useCallback((tokens: Pick<TokenResponse, "access" | "refresh"> | null) => {
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
        setUser(tokens.user);
        persistTokens(tokens);
        router.replace("/dashboard");
      } finally {
        setIsLoading(false);
      }
    },
    [persistTokens, router]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setIsLoading(true);
      try {
        const tokens = await registerRequest(payload);
        setAccessToken(tokens.access);
        setRefreshToken(tokens.refresh);
        setUser(tokens.user);
        persistTokens(tokens);
        router.replace("/dashboard");
      } finally {
        setIsLoading(false);
      }
    },
    [persistTokens, router]
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      setIsLoading(true);
      try {
        const tokens = await loginWithGoogleRequest(idToken);
        setAccessToken(tokens.access);
        setRefreshToken(tokens.refresh);
        setUser(tokens.user);
        persistTokens(tokens);
        router.replace("/dashboard");
      } finally {
        setIsLoading(false);
      }
    },
    [persistTokens, router]
  );

  const logout = useCallback(
    ({ redirect = true }: { redirect?: boolean } = {}) => {
      clearSession({ redirect });
    },
    [clearSession]
  );

  const updateProfile = useCallback(
    async (payload: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      photo?: File | null;
      remove_photo?: boolean;
    }) => {
      if (!accessToken) {
        throw new Error("No hay una sesión activa");
      }
      const updated = await updateProfileRequest(accessToken, payload);
      setUser(updated);
      return updated;
    },
    [accessToken]
  );

  const requestPasswordResetHandler = useCallback(async (email: string) => {
    return requestPasswordReset(email);
  }, []);

  const confirmPasswordResetHandler = useCallback(
    async (payload: { uid: string; token: string; password: string }) => {
      return confirmPasswordReset(payload);
    },
    []
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
    () => ({
      user,
      accessToken,
      refreshToken,
      isLoading,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshProfile,
      updateProfile,
      requestPasswordReset: requestPasswordResetHandler,
      confirmPasswordReset: confirmPasswordResetHandler
    }),
    [
      user,
      accessToken,
      refreshToken,
      isLoading,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshProfile,
      updateProfile,
      requestPasswordResetHandler,
      confirmPasswordResetHandler
    ]
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
