import { useEffect, useState } from "react";
import { User, Trophy, Activity } from "lucide-react";
import { useAuth } from "@/lib/auth";

type ScoreEntry = { date: string; score: number; total: number };

export function Profile() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("epi_sim_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const initials = (user?.name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const best = history.reduce((m, h) => Math.max(m, h.score), 0);
  const sessions = history.length;
  const avg = sessions > 0 ? Math.round(history.reduce((s, h) => s + h.score, 0) / sessions) : 0;

  return (
    <div className="mx-auto" style={{ maxWidth: 880, padding: "100px 24px 80px" }}>
      <div className="glass-strong animate-fade-up flex items-center gap-5" style={{ padding: 32 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 84, height: 84, borderRadius: "50%",
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            fontSize: 28, fontWeight: 800, color: "#fff",
            boxShadow: "0 10px 30px rgba(37,99,235,0.4)",
          }}
        >
          {initials}
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>{user?.name || "Гость"}</h1>
          <p className="text-soft mt-1" style={{ fontSize: 14 }}>{user?.email}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mt-6">
        {[
          { icon: Trophy, label: "Лучший результат", value: `${best}` },
          { icon: Activity, label: "Сессий пройдено", value: `${sessions}` },
          { icon: User, label: "Средний балл", value: `${avg}` },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-card" style={{ padding: 24 }}>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(37,99,235,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color="#93C5FD" />
                </div>
                <span className="text-soft" style={{ fontSize: 13 }}>{s.label}</span>
              </div>
              <p style={{ fontSize: 32, fontWeight: 800 }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 14 }}>История сессий</h2>
      {history.length === 0 ? (
        <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
          <p className="text-soft">Пока нет завершённых симуляций.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((h, i) => (
            <div key={i} className="glass-card flex items-center justify-between" style={{ padding: 18 }}>
              <span className="text-soft" style={{ fontSize: 14 }}>
                {new Date(h.date).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" })}
              </span>
              <span style={{ fontWeight: 700, fontSize: 16, color: h.score >= 700 ? "#86EFAC" : "#FCA5A5" }}>
                {h.score} / {h.total}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
