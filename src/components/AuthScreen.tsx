import { useState } from "react";
import { HeartPulse } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = mode === "login" ? login(email, password) : register(name, email, password);
    if (!res.ok) setError(res.error || "Something went wrong.");
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: "#F0F4FF" }}
    >
      <div className="app-card w-full" style={{ maxWidth: 400, padding: 40 }}>
        <div className="flex flex-col items-center text-center mb-7">
          <div
            className="flex items-center justify-center mb-4"
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "rgba(37, 99, 235, 0.10)",
              color: "#2563EB",
            }}
          >
            <HeartPulse size={32} strokeWidth={2.4} />
          </div>
          <h1 className="app-logo">MedCare</h1>
          <p className="app-muted mt-2" style={{ fontSize: 15 }}>
            Научись помогать. Спаси жизнь.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === "register" && (
            <div>
              <label className="app-label" htmlFor="name">Имя</label>
              <input
                id="name"
                className="app-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
              />
            </div>
          )}
          <div>
            <label className="app-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="app-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="app-label" htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              className="app-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <p style={{ color: "#EF4444", fontSize: 14, fontWeight: 500 }}>
              {error}
            </p>
          )}

          <button type="submit" className="app-btn app-btn-primary w-full mt-2">
            {mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>

          <p
            className="text-center mt-2"
            style={{ fontSize: 14, color: "#64748B" }}
          >
            {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              style={{
                color: "#2563EB",
                fontWeight: 600,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              {mode === "login" ? "Создать аккаунт" : "Войти"}
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}