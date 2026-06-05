import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2, RefreshCw, CheckCircle2, XCircle, Lightbulb, Trophy, Medal, MapPin, Gamepad2,
  Flame, Zap, Star, Target, Activity, Brain, Award, ChevronRight, Sparkles, Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getWeeklyLeaderboard } from "@/lib/leaderboard";
import { computeXP as computeProgression, getRank } from "@/lib/progression";

// ============== STORAGE ==============
const HISTORY_KEY = "fit_quiz_history";
const BONUS_KEY = "fit_xp_bonus";
const DAILY_KEY = "fit_daily_challenge";
const MINIGAME_KEY = "fit_minigame_history";

type QuizEntry = { date: string; score: number; total: number };
type MinigameEntry = { date: string; game: string; score: number; xp: number };
type DailyState = { date: string; idx: number; completed: boolean };

function readJSON<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function writeJSON(key: string, v: unknown) { localStorage.setItem(key, JSON.stringify(v)); }
const todayISO = () => new Date().toISOString().slice(0, 10);

function pushQuizHistory(e: QuizEntry) {
  writeJSON(HISTORY_KEY, [e, ...readJSON<QuizEntry[]>(HISTORY_KEY, [])].slice(0, 30));
}
function pushMinigameHistory(e: MinigameEntry) {
  writeJSON(MINIGAME_KEY, [e, ...readJSON<MinigameEntry[]>(MINIGAME_KEY, [])].slice(0, 30));
}
function addXPBonus(amount: number) {
  const cur = Number(localStorage.getItem(BONUS_KEY) || "0");
  localStorage.setItem(BONUS_KEY, String(cur + amount));
}

// XP + ranks come from shared progression module so the Games arena and the
// Progress map share one unified rank system.
const computeXP = computeProgression;

// ============== DAILY CHALLENGES ==============
const DAILIES = [
  { icon: Brain, title: "Пройди фитнес-квиз", desc: "Набери минимум 700 очков", xp: 150, type: "quiz" as const },
  { icon: Zap, title: "Реакция воина", desc: "Сыграй в Reflex Trainer", xp: 100, type: "reflex" as const },
  { icon: Activity, title: "Активность дня", desc: "Запиши тренировку в дневник", xp: 120, type: "workout" as const },
  { icon: Target, title: "Точный удар", desc: "Сыграй в Macro Match без ошибок", xp: 130, type: "macro" as const },
];

function getDailyChallenge(): { state: DailyState; def: typeof DAILIES[number] } {
  const t = todayISO();
  const prev = readJSON<DailyState | null>(DAILY_KEY, null);
  if (prev && prev.date === t) return { state: prev, def: DAILIES[prev.idx] };
  // pick deterministic by date hash
  const seed = t.split("-").reduce((s, p) => s + Number(p), 0);
  const idx = seed % DAILIES.length;
  const state = { date: t, idx, completed: false };
  writeJSON(DAILY_KEY, state);
  return { state, def: DAILIES[idx] };
}
function completeDaily(xp: number) {
  const t = todayISO();
  const prev = readJSON<DailyState | null>(DAILY_KEY, null);
  if (prev && prev.date === t && !prev.completed) {
    writeJSON(DAILY_KEY, { ...prev, completed: true });
    addXPBonus(xp);
    return true;
  }
  return false;
}

// ============== AWARDS ==============
function getAwards(s: ReturnType<typeof computeXP>) {
  return [
    { icon: "🔥", title: "Серия 3 дня", unlocked: s.streak >= 3 },
    { icon: "💪", title: "10 тренировок", unlocked: s.workouts >= 10 },
    { icon: "🧠", title: "Квиз-мастер", unlocked: s.quizPasses >= 3 },
    { icon: "⚡", title: "Игрок", unlocked: s.minigamesPlayed >= 5 },
    { icon: "🏆", title: "1000 XP", unlocked: s.totalXP >= 1000 },
    { icon: "👑", title: "Чемпион", unlocked: s.totalXP >= 2000 },
  ];
}

// ============== MAIN ==============
type Tab = "hub" | "quiz" | "reflex" | "macro";

export function Games() {
  const [tab, setTab] = useState<Tab>("hub");
  const [stats, setStats] = useState(computeXP());
  const refresh = () => setStats(computeXP());

  useEffect(() => { refresh(); }, [tab]);

  return (
    <div className="mx-auto" style={{ maxWidth: 1080, padding: "100px 24px 80px" }}>
      <Header />
      <TabBar tab={tab} setTab={setTab} />
      {tab === "hub" && <Hub stats={stats} setTab={setTab} onRefresh={refresh} />}
      {tab === "quiz" && <QuizGame onComplete={refresh} onBack={() => setTab("hub")} />}
      {tab === "reflex" && <ReflexGame onComplete={refresh} onBack={() => setTab("hub")} />}
      {tab === "macro" && <MacroGame onComplete={refresh} onBack={() => setTab("hub")} />}
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-3 mb-6 animate-fade-up">
      <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #2563EB, #7C3AED)", boxShadow: "0 8px 22px rgba(124,58,237,0.45)" }}>
        <Gamepad2 size={24} color="#fff" />
      </div>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em" }}>FitCare Arena</h1>
        <p className="text-soft" style={{ fontSize: 13 }}>Прокачивай тело и мозг — каждый день</p>
      </div>
    </div>
  );
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "hub", label: "Обзор", icon: Trophy },
    { key: "quiz", label: "Квиз", icon: Brain },
    { key: "reflex", label: "Reflex", icon: Zap },
    { key: "macro", label: "Macro", icon: Target },
  ];
  return (
    <div className="glass mb-6" style={{ padding: 6, display: "flex", gap: 4, overflowX: "auto" }}>
      {items.map((it) => {
        const active = tab === it.key;
        return (
          <button key={it.key} onClick={() => setTab(it.key)} style={{
            flex: "1 1 auto", minWidth: 96, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: active ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "transparent",
            color: active ? "#fff" : "#475569", fontWeight: 700, fontSize: 13,
            boxShadow: active ? "0 6px 18px rgba(37,99,235,0.35)" : "none",
            transition: "all 0.2s ease",
          }}>
            <it.icon size={15} /> {it.label}
          </button>
        );
      })}
    </div>
  );
}

// ============== HUB ==============
function Hub({ stats, setTab, onRefresh }: { stats: ReturnType<typeof computeXP>; setTab: (t: Tab) => void; onRefresh: () => void }) {
  const { user } = useAuth();
  const { cur, next, pct } = getRank(stats.totalXP);
  const { state: daily, def: dailyDef } = getDailyChallenge();
  const awards = getAwards(stats);
  const leaderboard = useMemo(() => getWeeklyLeaderboard(user?.name || "Вы", stats.totalXP), [user?.name, stats.totalXP]);

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      {/* LEVEL CARD */}
      <div className="glass-strong relative overflow-hidden" style={{ padding: 28 }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(600px circle at 90% 0%, ${cur.glowColor}, transparent 60%)`, pointerEvents: "none" }} />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="soft-float flex items-center justify-center" style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${cur.color}, ${cur.color}AA)`, boxShadow: `0 12px 30px ${cur.color}55`, fontSize: 36 }}>
              <span>{cur.character}</span>
            </div>
            <div>
              <span className="inline-block" style={{ background: `${cur.color}22`, color: cur.color, fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 999, letterSpacing: "0.05em", textTransform: "uppercase" }}>Ранг {cur.id}</span>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em", marginTop: 4 }}>{cur.name}</h2>
              <p className="text-soft" style={{ fontSize: 13, marginTop: 2 }}>{stats.totalXP} XP {next ? `• до «${next.name}» ${Math.max(0, next.minXP - stats.totalXP)} XP` : "• максимальный ранг"}</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", lineHeight: 1 }}>{stats.totalXP}</div>
            <div className="text-soft" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Total XP</div>
          </div>
        </div>
        <div className="relative mt-5" style={{ height: 10, borderRadius: 999, background: "rgba(148,163,184,0.22)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${cur.color}, ${next?.color || cur.color})`, boxShadow: `0 0 14px ${cur.color}88`, transition: "width 0.5s ease" }} />
        </div>
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { icon: Activity, label: "Тренировки", value: stats.workouts, c: "#2563EB" },
            { icon: Brain, label: "Квизы", value: stats.quizPasses, c: "#7C3AED" },
            { icon: Flame, label: "Серия", value: `${stats.streak}д`, c: "#F97316" },
            { icon: Gamepad2, label: "Игры", value: stats.minigamesPlayed, c: "#10B981" },
          ].map((m, i) => (
            <div key={i} style={{ padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(148,163,184,0.25)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${m.c}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <m.icon size={17} color={m.c} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{m.value}</div>
                <div className="text-soft" style={{ fontSize: 11, marginTop: 2 }}>{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DAILY + STREAK */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-strong relative overflow-hidden" style={{ padding: 24 }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)" }} />
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} color="#7C3AED" />
            <span style={{ fontSize: 11, fontWeight: 800, color: "#7C3AED", letterSpacing: "0.08em", textTransform: "uppercase" }}>Челлендж дня</span>
          </div>
          <div className="flex items-start gap-3 mt-2">
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #7C3AED, #2563EB)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <dailyDef.icon size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{dailyDef.title}</h3>
              <p className="text-soft" style={{ fontSize: 13, marginTop: 4 }}>{dailyDef.desc}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center gap-1.5" style={{ color: "#F59E0B", fontWeight: 800, fontSize: 14 }}>
              <Star size={15} fill="#F59E0B" /> +{dailyDef.xp} XP
            </div>
            {daily.completed ? (
              <span className="inline-flex items-center gap-1.5" style={{ background: "rgba(34,197,94,0.15)", color: "#15803D", fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(34,197,94,0.4)" }}>
                <CheckCircle2 size={14} /> Выполнено
              </span>
            ) : (
              <button onClick={() => setTab(dailyDef.type === "quiz" ? "quiz" : dailyDef.type === "reflex" ? "reflex" : dailyDef.type === "macro" ? "macro" : "hub")} className="btn-primary" style={{ padding: "8px 14px", fontSize: 13 }}>
                Начать <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="glass-strong relative overflow-hidden" style={{ padding: 24 }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.22), transparent 70%)" }} />
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} color="#F97316" />
            <span style={{ fontSize: 11, fontWeight: 800, color: "#F97316", letterSpacing: "0.08em", textTransform: "uppercase" }}>Streak</span>
          </div>
          <div style={{ fontSize: 56, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.04em", lineHeight: 1, marginTop: 4 }}>
            {stats.streak}<span style={{ fontSize: 20, color: "#94A3B8", marginLeft: 6 }}>дней</span>
          </div>
          <p className="text-soft mt-2" style={{ fontSize: 13 }}>
            {stats.streak === 0 ? "Запиши тренировку сегодня и начни серию" : stats.streak < 3 ? "Так держать — серия только разгорается" : stats.streak < 7 ? "Огонь! Не сбавляй темп" : "Ты в режиме легенды 🔥"}
          </p>
          <div className="flex gap-1.5 mt-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 8, borderRadius: 999, background: i < stats.streak ? "linear-gradient(90deg, #F97316, #EF4444)" : "rgba(148,163,184,0.25)", boxShadow: i < stats.streak ? "0 0 8px rgba(249,115,22,0.5)" : "none" }} />
            ))}
          </div>
        </div>
      </div>

      {/* MINI-GAMES GRID */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Gamepad2 size={18} color="#2563EB" />
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>Мини-игры</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GameCard tab="quiz" icon={Brain} title="Fitness Quiz" desc="Проверь знания о теле и питании" xp="до 1000 XP" gradient="linear-gradient(135deg, #2563EB, #7C3AED)" onClick={setTab} />
          <GameCard tab="reflex" icon={Zap} title="Reflex Trainer" desc="Тренируй скорость реакции" xp="до 150 XP" gradient="linear-gradient(135deg, #06B6D4, #2563EB)" onClick={setTab} />
          <GameCard tab="macro" icon={Target} title="Macro Match" desc="Сортируй продукты по макронутриентам" xp="до 130 XP" gradient="linear-gradient(135deg, #F59E0B, #EF4444)" onClick={setTab} />
        </div>
      </div>

      {/* AWARDS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award size={18} color="#F59E0B" />
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>Достижения</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {awards.map((a, i) => (
            <div key={i} className="glass" style={{ padding: 16, textAlign: "center", opacity: a.unlocked ? 1 : 0.55, border: a.unlocked ? "1.5px solid rgba(245,158,11,0.45)" : "1px solid rgba(148,163,184,0.25)", background: a.unlocked ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(124,58,237,0.08))" : undefined }}>
              <div style={{ fontSize: 32, marginBottom: 6, filter: a.unlocked ? "none" : "grayscale(1)" }}>{a.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{a.title}</div>
              {!a.unlocked && <Lock size={11} style={{ marginTop: 4 }} color="#94A3B8" />}
            </div>
          ))}
        </div>
      </div>

      {/* LEADERBOARD */}
      <div className="glass" style={{ padding: 24 }}>
        <div className="flex items-center gap-2 mb-3">
          <Medal size={20} color="#FBBF24" />
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>Глобальный рейтинг</h3>
        </div>
        <div className="flex flex-col gap-2">
          {leaderboard.map((p, i) => (
            <div key={i} className="flex items-center justify-between" style={{ padding: "12px 16px", borderRadius: 14, background: p.me ? "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(124,58,237,0.22))" : "rgba(255,255,255,0.5)", border: "1px solid " + (p.me ? "rgba(37,99,235,0.5)" : "rgba(148,163,184,0.25)") }}>
              <div className="flex items-center gap-3">
                <span style={{ width: 28, textAlign: "center", fontWeight: 800, color: i === 0 ? "#F59E0B" : i === 1 ? "#64748B" : i === 2 ? "#EA580C" : "#94A3B8" }}>{i + 1}</span>
                <span style={{ fontSize: 18 }}>{p.flag}</span>
                <span style={{ fontWeight: p.me ? 700 : 500, color: "#0F172A" }}>{p.name}{p.me && " (вы)"}</span>
              </div>
              <span style={{ fontWeight: 700, color: "#2563EB" }}>{p.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GameCard({ tab, icon: Icon, title, desc, xp, gradient, onClick }: { tab: Tab; icon: React.ElementType; title: string; desc: string; xp: string; gradient: string; onClick: (t: Tab) => void }) {
  return (
    <button onClick={() => onClick(tab)} className="glass-strong text-left" style={{ padding: 20, border: "none", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, boxShadow: "0 8px 20px rgba(37,99,235,0.3)" }}>
        <Icon size={22} color="#fff" />
      </div>
      <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>{title}</h4>
      <p className="text-soft" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>{desc}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="inline-flex items-center gap-1" style={{ color: "#F59E0B", fontSize: 12, fontWeight: 700 }}><Star size={12} fill="#F59E0B" /> {xp}</span>
        <ChevronRight size={16} color="#2563EB" />
      </div>
    </button>
  );
}

function BackBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <button onClick={onBack} style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(148,163,184,0.35)", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
        ← Назад
      </button>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{title}</span>
    </div>
  );
}

// ============== QUIZ ==============
type QOption = { text: string; correct: boolean; explanation: string };
type Question = { question: string; hint: string; scenario: string; options: QOption[] };
type Quiz = { questions: Question[] };
const MAX = 1000;
const PASS = 700;

function QuizGame({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const started = useRef<number>(Date.now());

  const fetchQuiz = async () => {
    setLoading(true); setError(null); setQuiz(null);
    setIdx(0); setSelected(null); setHintShown(false); setScore(0); setFinished(false);
    started.current = Date.now();
    try {
      const res = await fetch("/api/public/simulation", { method: "POST" });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error || `Request failed (${res.status})`); }
      setQuiz(await res.json());
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuiz(); }, []);

  const q = quiz?.questions[idx];
  const total = quiz?.questions.length || 10;
  const isLast = idx === total - 1;
  const progress = Math.round(((idx + (selected !== null ? 1 : 0)) / total) * 100);

  const pick = (i: number) => {
    if (selected !== null || !q) return;
    setSelected(i);
    if (q.options[i].correct) setScore((s) => s + (hintShown ? 50 : 100));
  };

  const next = () => {
    if (!q) return;
    if (isLast) {
      pushQuizHistory({ date: new Date().toISOString(), score, total: MAX });
      if (score >= PASS) completeDaily(150);
      setFinished(true);
      onComplete();
      return;
    }
    setIdx((i) => i + 1); setSelected(null); setHintShown(false);
  };

  return (
    <div>
      <BackBar onBack={onBack} title="Fitness Quiz" />
      {loading && (
        <div className="glass-strong flex flex-col items-center justify-center" style={{ padding: 60 }}>
          <Loader2 size={42} color="#2563EB" className="spin-slow" />
          <p className="text-soft mt-4">Генерация вопросов...</p>
        </div>
      )}
      {error && (
        <div className="glass-strong" style={{ padding: 32 }}>
          <p style={{ color: "#DC2626", fontWeight: 700 }}>Ошибка</p>
          <p className="text-soft mt-2" style={{ fontSize: 14 }}>{error}</p>
          <button onClick={fetchQuiz} className="btn-primary mt-5"><RefreshCw size={18} /> Повторить</button>
        </div>
      )}
      {!loading && !error && finished && (
        <div className="glass-strong text-center animate-fade-up" style={{ padding: 40 }}>
          <div className="soft-float mx-auto mb-5 flex items-center justify-center" style={{ width: 96, height: 96, borderRadius: 28, background: score >= PASS ? "linear-gradient(135deg, #16A34A, #22D3EE)" : "linear-gradient(135deg, #EF4444, #F59E0B)" }}>
            <Trophy size={44} color="#fff" />
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>{score >= PASS ? "Passed ✅" : "Try again ❌"}</h2>
          <p className="text-soft mt-2">Заработано: <strong style={{ color: "#0F172A", fontSize: 22 }}>{score}</strong> / {MAX}</p>
          <p className="text-soft mt-1" style={{ fontSize: 13 }}>Минимум: {PASS}</p>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={fetchQuiz} className="btn-primary"><RefreshCw size={18} /> Ещё раз</button>
            <button onClick={onBack} style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(148,163,184,0.35)", padding: "12px 20px", borderRadius: 12, fontWeight: 700, color: "#475569", cursor: "pointer" }}>В Hub</button>
          </div>
        </div>
      )}
      {!loading && !error && !finished && q && (
        <div>
          <div className="glass mb-5" style={{ padding: 18 }}>
            <div className="flex items-center justify-between mb-2.5">
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Вопрос {idx + 1} из {total}</span>
              <span className="text-soft" style={{ fontSize: 13 }}>Очки: <strong style={{ color: "#2563EB" }}>{score}</strong> / {MAX}</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(148,163,184,0.25)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #2563EB, #7C3AED)", transition: "width 0.4s ease", boxShadow: "0 0 12px rgba(37,99,235,0.5)" }} />
            </div>
          </div>
          <div className="glass-strong animate-fade-up" style={{ padding: 28 }} key={idx}>
            <span className="inline-flex items-center gap-1.5" style={{ background: "rgba(37,99,235,0.15)", color: "#1E40AF", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(37,99,235,0.3)" }}>
              <MapPin size={13} /> {q.scenario}
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginTop: 14, color: "#0F172A" }}>{q.question}</h2>
            {selected === null && (
              <button onClick={() => setHintShown(true)} disabled={hintShown} style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: hintShown ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.7)", color: hintShown ? "#92400E" : "#475569", border: "1px solid " + (hintShown ? "rgba(251,191,36,0.5)" : "rgba(148,163,184,0.4)"), fontSize: 13, fontWeight: 600, cursor: hintShown ? "default" : "pointer" }}>
                <Lightbulb size={14} /> {hintShown ? q.hint : "Показать подсказку (−50 очков)"}
              </button>
            )}
            <div className="flex flex-col gap-2.5 mt-5">
              {q.options.map((opt, i) => {
                const isSel = selected === i;
                const reveal = selected !== null;
                let bg = "rgba(255,255,255,0.85)", border = "rgba(148,163,184,0.35)", color = "#1E293B";
                if (reveal) {
                  if (opt.correct) { bg = "rgba(22,163,74,0.18)"; border = "rgba(34,197,94,0.7)"; color = "#15803D"; }
                  else if (isSel) { bg = "rgba(239,68,68,0.15)"; border = "rgba(239,68,68,0.7)"; color = "#B91C1C"; }
                  else { color = "#94A3B8"; bg = "rgba(255,255,255,0.4)"; }
                }
                return (
                  <button key={i} onClick={() => pick(i)} disabled={reveal} style={{ textAlign: "left", padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${border}`, background: bg, color, fontSize: 15, fontWeight: 500, cursor: reveal ? "default" : "pointer", transition: "all 0.2s ease", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    {reveal && opt.correct && <CheckCircle2 size={18} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />}
                    {reveal && isSel && !opt.correct && <XCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />}
                    <span style={{ flex: 1 }}>{opt.text}</span>
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="mt-5" style={{ padding: "14px 16px", borderRadius: 14, background: q.options[selected].correct ? "rgba(22,163,74,0.12)" : "rgba(239,68,68,0.12)", border: "1px solid " + (q.options[selected].correct ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"), color: q.options[selected].correct ? "#15803D" : "#B91C1C", fontSize: 14, lineHeight: 1.5 }}>
                <strong style={{ display: "block", marginBottom: 4 }}>{q.options[selected].correct ? `Правильно! +${hintShown ? 50 : 100} очков` : "Неправильно. 0 очков"}</strong>
                {q.options[selected].explanation}
              </div>
            )}
            {selected !== null && (
              <button onClick={next} className="btn-primary w-full mt-5">{isLast ? "Завершить" : "Следующий вопрос"}</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============== REFLEX GAME ==============
function ReflexGame({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [state, setState] = useState<"idle" | "wait" | "go" | "result" | "tooSoon">("idle");
  const [reaction, setReaction] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const start = () => {
    setState("wait"); setReaction(null);
    const delay = 1200 + Math.random() * 2200;
    timerRef.current = setTimeout(() => {
      startRef.current = performance.now();
      setState("go");
    }, delay);
  };

  const click = () => {
    if (state === "wait") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState("tooSoon");
      return;
    }
    if (state === "go") {
      const r = Math.round(performance.now() - startRef.current);
      setReaction(r);
      setScores((s) => [...s, r]);
      setState("result");
    }
  };

  const nextRound = () => {
    if (round >= 4) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const xp = Math.max(20, Math.round(200 - avg / 3));
      pushMinigameHistory({ date: new Date().toISOString(), game: "reflex", score: Math.round(avg), xp });
      completeDaily(100);
      onComplete();
      setState("idle"); setRound(0); setScores([]); setReaction(null);
      return;
    }
    setRound((r) => r + 1); start();
  };

  const bg = state === "wait" ? "linear-gradient(135deg, #EF4444, #F97316)" :
             state === "go" ? "linear-gradient(135deg, #10B981, #22D3EE)" :
             state === "tooSoon" ? "linear-gradient(135deg, #F59E0B, #EF4444)" :
             "linear-gradient(135deg, #2563EB, #7C3AED)";

  const label = state === "idle" ? "Готов?" :
                state === "wait" ? "Жди зелёного..." :
                state === "go" ? "ТАП!" :
                state === "tooSoon" ? "Рано!" :
                `${reaction} мс`;

  return (
    <div>
      <BackBar onBack={onBack} title="Reflex Trainer" />
      <div className="glass-strong" style={{ padding: 28 }}>
        <p className="text-soft mb-2" style={{ fontSize: 13 }}>Раунд {Math.min(round + (state === "idle" ? 1 : 1), 5)} / 5</p>
        <button
          onClick={state === "idle" ? () => { setRound(0); setScores([]); start(); } : state === "result" || state === "tooSoon" ? nextRound : click}
          style={{
            width: "100%", height: 320, borderRadius: 24, border: "none", cursor: "pointer",
            background: bg, color: "#fff", fontSize: 42, fontWeight: 900, letterSpacing: "-0.02em",
            boxShadow: "0 20px 50px rgba(37,99,235,0.35)", transition: "background 0.25s ease",
          }}
        >
          {label}
        </button>
        <div className="grid grid-cols-5 gap-2 mt-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.6)", textAlign: "center", border: "1px solid rgba(148,163,184,0.25)" }}>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700 }}>#{i + 1}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{scores[i] ? `${scores[i]}мс` : "—"}</div>
            </div>
          ))}
        </div>
        <p className="text-soft text-center mt-4" style={{ fontSize: 12 }}>Жди пока зона станет зелёной — затем тапай как можно быстрее</p>
      </div>
    </div>
  );
}

// ============== MACRO MATCH ==============
type Food = { name: string; macro: "Белки" | "Углеводы" | "Жиры" };
const FOODS: Food[] = [
  { name: "Куриная грудка", macro: "Белки" },
  { name: "Овсянка", macro: "Углеводы" },
  { name: "Авокадо", macro: "Жиры" },
  { name: "Лосось", macro: "Белки" },
  { name: "Рис", macro: "Углеводы" },
  { name: "Миндаль", macro: "Жиры" },
  { name: "Творог", macro: "Белки" },
  { name: "Банан", macro: "Углеводы" },
  { name: "Оливковое масло", macro: "Жиры" },
  { name: "Яйца", macro: "Белки" },
  { name: "Гречка", macro: "Углеводы" },
  { name: "Грецкий орех", macro: "Жиры" },
];
const MACROS: { name: Food["macro"]; color: string }[] = [
  { name: "Белки", color: "#2563EB" },
  { name: "Углеводы", color: "#10B981" },
  { name: "Жиры", color: "#F59E0B" },
];

function MacroGame({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [queue, setQueue] = useState<Food[]>(() => [...FOODS].sort(() => Math.random() - 0.5));
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [finished, setFinished] = useState(false);

  const current = queue[idx];

  const pick = (m: Food["macro"]) => {
    if (!current || feedback) return;
    const ok = m === current.macro;
    setFeedback(ok ? "ok" : "bad");
    if (ok) setCorrect((c) => c + 1); else setWrong((w) => w + 1);
    setTimeout(() => {
      setFeedback(null);
      if (idx + 1 >= queue.length) {
        const xp = correct + (ok ? 1 : 0) >= queue.length ? 130 : Math.round(((correct + (ok ? 1 : 0)) / queue.length) * 100);
        pushMinigameHistory({ date: new Date().toISOString(), game: "macro", score: correct + (ok ? 1 : 0), xp });
        if (wrong + (ok ? 0 : 1) === 0) completeDaily(130);
        setFinished(true); onComplete();
      } else {
        setIdx((i) => i + 1);
      }
    }, 450);
  };

  const restart = () => {
    setQueue([...FOODS].sort(() => Math.random() - 0.5));
    setIdx(0); setCorrect(0); setWrong(0); setFinished(false);
  };

  return (
    <div>
      <BackBar onBack={onBack} title="Macro Match" />
      {!finished ? (
        <div className="glass-strong" style={{ padding: 28 }}>
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{idx + 1} / {queue.length}</span>
            <div className="flex gap-3 text-sm">
              <span style={{ color: "#15803D", fontWeight: 700 }}>✓ {correct}</span>
              <span style={{ color: "#B91C1C", fontWeight: 700 }}>✗ {wrong}</span>
            </div>
          </div>
          <div style={{ padding: "40px 20px", borderRadius: 20, textAlign: "center", background: feedback === "ok" ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))" : feedback === "bad" ? "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))" : "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.05))", border: "1px solid rgba(148,163,184,0.3)", transition: "background 0.2s" }}>
            <p className="text-soft" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>К какой группе?</p>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em", marginTop: 8 }}>{current?.name}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {MACROS.map((m) => (
              <button key={m.name} onClick={() => pick(m.name)} disabled={!!feedback} style={{
                padding: "18px 12px", borderRadius: 16, border: "none", cursor: feedback ? "default" : "pointer",
                background: `linear-gradient(135deg, ${m.color}, ${m.color}CC)`, color: "#fff", fontSize: 15, fontWeight: 800,
                boxShadow: `0 8px 22px ${m.color}55`, transition: "transform 0.15s",
              }}>{m.name}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-strong text-center" style={{ padding: 40 }}>
          <div className="soft-float mx-auto mb-5 flex items-center justify-center" style={{ width: 88, height: 88, borderRadius: 24, background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}>
            <Target size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A" }}>{correct} / {queue.length}</h2>
          <p className="text-soft mt-2">Точность: {Math.round((correct / queue.length) * 100)}%</p>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={restart} className="btn-primary"><RefreshCw size={18} /> Ещё раз</button>
            <button onClick={onBack} style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(148,163,184,0.35)", padding: "12px 20px", borderRadius: 12, fontWeight: 700, color: "#475569", cursor: "pointer" }}>В Hub</button>
          </div>
        </div>
      )}
    </div>
  );
}
