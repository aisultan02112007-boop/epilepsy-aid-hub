import { useEffect, useMemo, useState } from "react";
import { Trophy, Zap, Flame, Calendar, Award, Brain, Scale, Droplets, Dumbbell } from "lucide-react";
import { useAuth } from "@/lib/auth";

type Log = { date: string; weight: number; water: number; workout: boolean };
type QuizEntry = { date: string; score: number; total: number };
type ProfileData = { age?: number; height?: number; goalWeight?: number };

function readLogs(): Log[] { try { return JSON.parse(localStorage.getItem("fit_logs") || "[]"); } catch { return []; } }
function readQuiz(): QuizEntry[] { try { return JSON.parse(localStorage.getItem("fit_quiz_history") || "[]"); } catch { return []; } }
function readProfile(): ProfileData { try { return JSON.parse(localStorage.getItem("fit_profile") || "{}"); } catch { return {}; } }
function writeProfile(p: ProfileData) { localStorage.setItem("fit_profile", JSON.stringify(p)); }

function calcStreak(logs: Log[]) {
  const set = new Set(logs.map((l) => l.date));
  let s = 0; const d = new Date();
  while (set.has(d.toISOString().slice(0, 10))) { s++; d.setDate(d.getDate() - 1); }
  return s;
}

const LEVELS = [
  { min: 0, name: "Новичок", icon: "🌱" },
  { min: 200, name: "Любитель", icon: "⚡" },
  { min: 500, name: "Атлет", icon: "🏃" },
  { min: 1000, name: "Профи", icon: "💪" },
  { min: 2000, name: "Легенда", icon: "🏆" },
];

function levelFor(xp: number) {
  let i = 0;
  for (let k = 0; k < LEVELS.length; k++) if (xp >= LEVELS[k].min) i = k;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  const progress = next ? ((xp - cur.min) / (next.min - cur.min)) * 100 : 100;
  return { cur, next, progress };
}

export function Profile() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [quiz, setQuiz] = useState<QuizEntry[]>([]);
  const [profile, setProfile] = useState<ProfileData>({});

  useEffect(() => { setLogs(readLogs()); setQuiz(readQuiz()); setProfile(readProfile()); }, []);

  const workouts = logs.filter((l) => l.workout).length;
  const streak = useMemo(() => calcStreak(logs), [logs]);
  const bestQuiz = quiz.reduce((m, q) => Math.max(m, q.score), 0);
  const quizPasses = quiz.filter((q) => q.score >= 700).length;
  const xp = workouts * 50 + quizPasses * 100 + streak * 25;
  const lvl = levelFor(xp);

  // water streak: 7 consecutive days with water >= 8
  const waterStreak = useMemo(() => {
    let s = 0; const d = new Date();
    for (let i = 0; i < 7; i++) {
      const key = d.toISOString().slice(0, 10);
      const l = logs.find((x) => x.date === key);
      if (l && l.water >= 8) s++; else break;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [logs]);

  const initialWeight = logs[logs.length - 1]?.weight || 0;
  const currentWeight = logs[0]?.weight || 0;
  const lostKg = initialWeight && currentWeight ? initialWeight - currentWeight : 0;

  const achievements = [
    { icon: "🔥", title: "Первая тренировка", unlocked: workouts >= 1 },
    { icon: "📅", title: "7 дней подряд", unlocked: streak >= 7 },
    { icon: "⚖️", title: "Минус 5 кг", unlocked: lostKg >= 5 },
    { icon: "💧", title: "Водный мастер", unlocked: waterStreak >= 7 },
    { icon: "🧠", title: "Знаток", unlocked: bestQuiz >= 1000 },
    { icon: "🏆", title: "Легенда", unlocked: xp >= 2000 },
  ];

  const initials = (user?.name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mx-auto" style={{ maxWidth: 960, padding: "100px 24px 80px" }}>
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
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "#0F172A" }}>{user?.name || "Гость"}</h1>
          <p className="text-soft mt-1" style={{ fontSize: 14 }}>{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span style={{ fontSize: 18 }}>{lvl.cur.icon}</span>
            <span style={{ fontWeight: 700, color: "#1E293B" }}>{lvl.cur.name}</span>
            <span className="text-soft" style={{ fontSize: 12 }}>· {xp} XP</span>
          </div>
        </div>
      </div>

      {/* XP bar */}
      <div className="glass-card mt-5" style={{ padding: 24 }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontWeight: 700, color: "#0F172A" }}>Уровень: {lvl.cur.name}</span>
          <span className="text-soft" style={{ fontSize: 13 }}>
            {lvl.next ? `${xp} / ${lvl.next.min} XP` : "Максимум достигнут"}
          </span>
        </div>
        <div style={{ height: 12, borderRadius: 999, background: "rgba(148,163,184,0.25)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%", width: `${Math.min(100, lvl.progress)}%`,
              background: "linear-gradient(90deg, #2563EB, #7C3AED)",
              transition: "width 0.6s ease", boxShadow: "0 0 14px rgba(37,99,235,0.6)",
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mt-5">
        {[
          { icon: Dumbbell, label: "Тренировок", value: workouts },
          { icon: Zap, label: "Всего XP", value: xp },
          { icon: Flame, label: "Стрик", value: `${streak} дн.` },
          { icon: Brain, label: "Лучший квиз", value: bestQuiz },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-card" style={{ padding: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon size={20} color="#2563EB" />
              </div>
              <p className="text-soft" style={{ fontSize: 12 }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Achievements */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 14, color: "#0F172A" }}>Достижения</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((a, i) => (
          <div
            key={i}
            className="glass-card flex items-center gap-3"
            style={{
              padding: 18,
              opacity: a.unlocked ? 1 : 0.55,
              borderColor: a.unlocked ? "rgba(251,191,36,0.6)" : undefined,
              boxShadow: a.unlocked ? "0 8px 28px rgba(251,191,36,0.25)" : undefined,
            }}
          >
            <div
              style={{
                width: 48, height: 48, borderRadius: 14,
                background: a.unlocked
                  ? "linear-gradient(135deg, #FBBF24, #F59E0B)"
                  : "rgba(148,163,184,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}
            >
              {a.icon}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: "#0F172A", fontSize: 14 }}>{a.title}</p>
              <p className="text-soft" style={{ fontSize: 11 }}>{a.unlocked ? "Открыто" : "Заблокировано"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Personal info */}
      <div className="glass-strong mt-8" style={{ padding: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#0F172A" }}>Личные данные</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label-muted block mb-1.5">Возраст</label>
            <input className="glass-input" type="number" value={profile.age ?? ""} onChange={(e) => { const p = { ...profile, age: +e.target.value || undefined }; setProfile(p); writeProfile(p); }} />
          </div>
          <div>
            <label className="label-muted block mb-1.5">Рост (см)</label>
            <input className="glass-input" type="number" value={profile.height ?? ""} onChange={(e) => { const p = { ...profile, height: +e.target.value || undefined }; setProfile(p); writeProfile(p); }} />
          </div>
          <div>
            <label className="label-muted block mb-1.5">Цель веса (кг)</label>
            <input className="glass-input" type="number" value={profile.goalWeight ?? ""} onChange={(e) => { const p = { ...profile, goalWeight: +e.target.value || undefined }; setProfile(p); writeProfile(p); }} />
          </div>
        </div>
      </div>
    </div>
  );
}