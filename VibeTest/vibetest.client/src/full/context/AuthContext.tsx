import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  authApi,
  configureApiClient,
  setAccessToken,
  type LoginPayload,
  type RegisterPayload,
} from '@/full/api';
import { ApiError } from '@/full/api/errors';
import type { UserDto } from '@/types';
import { clearRefreshToken, getRefreshToken, setRefreshToken } from '@/utils/authStorage';

let refreshInFlight: Promise<string | null> | null = null;

interface AuthState {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applySession(accessToken: string, refreshToken: string, user: UserDto) {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setAccessToken(null);
    clearRefreshToken();
    setUser(null);
  }, []);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    if (!refreshInFlight) {
      refreshInFlight = (async () => {
        const stored = getRefreshToken();
        if (!stored) {
          return null;
        }

        try {
          const tokens = await authApi.refresh(stored);
          setAccessToken(tokens.accessToken);
          setRefreshToken(tokens.refreshToken);
          return tokens.accessToken;
        } catch {
          return null;
        }
      })().finally(() => {
        refreshInFlight = null;
      });
    }

    return refreshInFlight;
  }, []);

  useEffect(() => {
    configureApiClient({
      onRefresh: refreshSession,
      onLogout: logout,
    });
  }, [logout, refreshSession]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const stored = getRefreshToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }

      const accessToken = await refreshSession();
      if (!accessToken) {
        logout();
        setIsLoading(false);
        return;
      }

      try {
        const me = await authApi.me();
        if (!cancelled) {
          setUser(me);
        }
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [logout, refreshSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    setUser(applySession(response.accessToken, response.refreshToken, response.user));
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authApi.register(payload);
    setUser(applySession(response.accessToken, response.refreshToken, response.user));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Неизвестная ошибка';
}
