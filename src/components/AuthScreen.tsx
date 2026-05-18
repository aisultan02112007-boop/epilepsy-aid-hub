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
            Learn to help. Save a life.
          </p>
        </div>

        <div
          className="flex mb-6"
          style={{ borderBottom: "1px solid #E2E8F0" }}
          role="tablist"
        >
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              data-active={mode === m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className="app-tab"
            >
              {m === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === "register" && (
            <div>
              <label className="app-label" htmlFor="name">Name</label>
              <input
                id="name"
                className="app-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
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
            <label className="app-label" htmlFor="password">Password</label>
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
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p
          className="text-center mt-6"
          style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}
        >
          Educational content only. In an emergency, call your local emergency number.
        </p>
      </div>
    </main>
  );
}