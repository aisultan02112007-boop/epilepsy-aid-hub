import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Background } from "./Background";

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
    if (!res.ok) setError(res.error || "Что-то пошло не так.");
  };

  return (
    <>
      <Background />
      <main className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="glass-strong w-full animate-fade-up" style={{ maxWidth: 420, padding: 40 }}>
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="pulse-glow flex items-center justify-center mb-5"
              style={{
                width: 76, height: 76, borderRadius: 22,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              }}
            >
              <Dumbbell size={36} color="#fff" strokeWidth={2.4} />
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "#1E293B" }}>FitKer</h1>
            <p className="text-soft mt-2" style={{ fontSize: 15 }}>
              Твой персональный фитнес-помощник
            </p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div>
                <label className="label-muted block mb-1.5">Имя</label>
                <input className="glass-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
              </div>
            )}
            <div>
              <label className="label-muted block mb-1.5">Email</label>
              <input type="email" className="glass-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div>
              <label className="label-muted block mb-1.5">Пароль</label>
              <input type="password" className="glass-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />
            </div>

            {error && (
              <p style={{ color: "#DC2626", fontSize: 14, fontWeight: 500 }}>{error}</p>
            )}

            <button type="submit" className="btn-primary w-full mt-2">
              {mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </form>

          <p className="text-center mt-6" style={{ fontSize: 14, color: "#475569" }}>
            {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
              style={{ background: "none", border: "none", color: "#2563EB", fontWeight: 700, cursor: "pointer", padding: 0 }}
            >
              {mode === "login" ? "Создать аккаунт" : "Войти"}
            </button>
          </p>
        </div>
      </main>
    </>
  );
}
