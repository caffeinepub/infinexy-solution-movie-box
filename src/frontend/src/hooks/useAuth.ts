import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useActor } from "./useActor";

export interface AuthUser {
  username: string;
  isAdmin: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isInitializing: boolean;
}

const SESSION_KEY = "infinexy_session";

function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthState(): AuthContextType {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { actor } = useActor();

  // Re-validate stored session against the canister on load
  useEffect(() => {
    if (!actor) return;
    let cancelled = false;
    const validate = async () => {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as AuthUser;
          const exists = await actor.userExists(parsed.username);
          if (cancelled) return;
          if (exists) {
            const isAdmin = await actor.isAdminUser(parsed.username);
            if (!cancelled) setUser({ username: parsed.username, isAdmin });
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch {
        // ignore parse/network errors
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };
    validate();
    return () => {
      cancelled = true;
    };
  }, [actor]);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      if (!actor) return false;
      const result = await actor.loginUser(username, simpleHash(password));
      if (!result) return false;
      const authUser: AuthUser = { username, isAdmin: result.isAdmin };
      setUser(authUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      return true;
    },
    [actor],
  );

  const register = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      if (!actor) return false;
      const success = await actor.registerUser(username, simpleHash(password));
      if (!success) return false;
      const isAdmin = await actor.isAdminUser(username);
      const authUser: AuthUser = { username, isAdmin };
      setUser(authUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      return true;
    },
    [actor],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isInitializing,
  };
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not found");
  return ctx;
}
