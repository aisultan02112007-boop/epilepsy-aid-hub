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
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-10 bg-app-bg">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-app-primary text-white flex items-center justify-center shadow-md mb-4">
            <HeartPulse size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold text-app-text">EpiCare</h1>
          <p className="text-app-text/70 mt-1">Learn to help. Save a life.</p>
        </div>

        <div className="app-card">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-5">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className={`min-h-10 rounded-lg text-sm font-semibold transition-colors ${
                  mode === m ? "bg-white text-app-primary shadow-sm" : "text-app-text/60"
                }`}
              >
                {m === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="app-label" htmlFor="name">Name</label>
                <input id="name" className="app-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
            )}
            <div>
              <label className="app-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="app-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div>
              <label className="app-label" htmlFor="password">Password</label>
              <input id="password" type="password" className="app-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />
            </div>

            {error && (
              <p className="text-sm text-app-error font-medium">{error}</p>
            )}

            <button type="submit" className="app-btn-primary w-full">
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-xs text-center text-app-text/50 mt-6 px-4">
          Educational content only. In an emergency, call your local emergency number.
        </p>
      </div>
    </main>
  );
}