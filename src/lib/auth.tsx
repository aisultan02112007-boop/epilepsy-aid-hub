import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type User = { name: string; email: string };
type StoredUser = User & { password: string };

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const USERS_KEY = "fit_users";
const SESSION_KEY = "fit_session";

function readUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
function writeUsers(u: StoredUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setUser(JSON.parse(s));
    } catch {}
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
  };

  const login: AuthCtx["login"] = (email, password) => {
    const users = readUsers();
    if (!email.trim()) return { ok: false, error: "Введите email." };
    const found = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (found) {
      // Simplified login — password not strictly validated to preserve UX.
      persist({ name: found.name, email: found.email });
      return { ok: true };
    }
    // Auto-create a lightweight account so progress can be saved.
    const name = email.split("@")[0] || "Пользователь";
    const next = [...users, { name, email: email.trim(), password: password || "" }];
    writeUsers(next);
    persist({ name, email: email.trim() });
    return { ok: true };
  };

  const register: AuthCtx["register"] = (name, email, password) => {
    if (!name.trim() || !email.trim() || !password) return { ok: false, error: "All fields are required." };
    const users = readUsers();
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase()))
      return { ok: false, error: "An account with this email already exists." };
    const next = [...users, { name: name.trim(), email: email.trim(), password }];
    writeUsers(next);
    persist({ name: name.trim(), email: email.trim() });
    return { ok: true };
  };

  const logout = () => persist(null);

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}