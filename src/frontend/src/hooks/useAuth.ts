import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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

const STORAGE_KEY = "infinexy_users";
const SESSION_KEY = "infinexy_session";
const ADMIN_USERNAMES_KEY = "infinexy_admins";

interface StoredUser {
  username: string;
  passwordHash: string;
}

function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getAdmins(): string[] {
  try {
    const stored = JSON.parse(
      localStorage.getItem(ADMIN_USERNAMES_KEY) || "[]",
    );
    // Seed first user as admin if admins list is empty
    return stored;
  } catch {
    return [];
  }
}

function isUserAdmin(username: string): boolean {
  const admins = getAdmins();
  const users = getUsers();
  // First registered user is always admin
  if (users.length > 0 && users[0].username === username) return true;
  return admins.includes(username);
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthState(): AuthContextType {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session) as AuthUser;
        const users = getUsers();
        const exists = users.find((u) => u.username === parsed.username);
        if (exists) {
          setUser({
            username: parsed.username,
            isAdmin: isUserAdmin(parsed.username),
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      const users = getUsers();
      const hash = simpleHash(password);
      const found = users.find(
        (u) => u.username === username && u.passwordHash === hash,
      );
      if (!found) return false;
      const authUser: AuthUser = { username, isAdmin: isUserAdmin(username) };
      setUser(authUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      return true;
    },
    [],
  );

  const register = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      const users = getUsers();
      if (users.find((u) => u.username === username)) return false;
      const newUser: StoredUser = {
        username,
        passwordHash: simpleHash(password),
      };
      users.push(newUser);
      saveUsers(users);
      const authUser: AuthUser = { username, isAdmin: isUserAdmin(username) };
      setUser(authUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      return true;
    },
    [],
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
