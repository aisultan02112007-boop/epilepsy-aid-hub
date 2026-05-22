import { useEffect, useMemo, useRef, useState } from "react";
import {
  Flame, Dumbbell, Scale, MapPin, Loader2, Sparkles, Save, Play, RefreshCw,
  CheckCircle2, XCircle, Lightbulb, Trophy, Medal,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getWeeklyLeaderboard } from "@/lib/leaderboard";

type Exercise = { name: string; sets: number; reps: string; rest: string; tip: string };
type Day = { day: string; focus: string; exercises: Exercise[]; cardio: string; duration_minutes: number };
type Program = { program_name: string; goal: string; split: string; weekly_calories_deficit_or_surplus: string; days: Day[]; nutrition_tip: string; motivation: string };

const GOALS = [
  { id: "Похудение", icon: Flame, gradient: "linear-gradient(135deg, #F97316, #EF4444)" },
  { id: "Набор массы", icon: Dumbbell, gradient: "linear-gradient(135deg, #2563EB, #7C3AED)" },
  { id: "Рекомпозиция тела", icon: Scale, gradient: "linear-gradient(135deg, #14B8A6, #06B6D4)" },
];
const LOCATIONS = ["Домашние тренировки", "Зал"];
const LEVELS = ["Новичок", "Средний", "Продвинутый"];
const DAYS = [3, 4, 5];

const SAVED_KEY = "fit_saved_program";

export function Workouts() {
  const [tab, setTab] = useState<"program" | "quiz">("program");
  return (
    <div className="mx-auto" style={{ maxWidth: 960, padding: "100px 24px 80px" }}>
      <div className="flex gap-2 mb-6 animate-fade-up">
        {[
          { k: "program", label: "Генератор программ" },
          { k: "quiz", label: "Проверь знания" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as "program" | "quiz")}
            style={{
              padding: "10px 18px", borderRadius: 12, fontWeight: 700, fontSize: 14,
              cursor: "pointer", border: "1px solid " + (tab === t.k ? "transparent" : "rgba(148,163,184,0.4)"),
              background: tab === t.k ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "rgba(255,255,255,0.7)",
              color: tab === t.k ? "#fff" : "#475569",
              boxShadow: tab === t.k ? "0 6px 18px rgba(37,99,235,0.35)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "program" ? <ProgramGenerator /> : <Quiz />}
    </div>
  );
}

/* ============== PROGRAM GENERATOR ============== */

function ProgramGenerator() {
  const [goal, setGoal] = useState<string>("");
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [experience, setExperience] = useState<string>(LEVELS[0]);
  const [days, setDays] = useState<number>(3);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    if (timer === null) return;
    const id = setInterval(() => setTimer((t) => (t === null ? null : t + 1)), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const generate = async () => {
    if (!goal) { setError("Выберите цель"); return; }
    setLoading(true); setError(null); setProgram(null);
    try {
      const res = await fetch("/api/public/workout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, location, experience, days }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error || `Request failed (${res.status})`);
      }
      setProgram(await res.json());
      setActiveDay(0);
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка"); }
    finally { setLoading(false); }
  };

  const save = () => { if (program) { localStorage.setItem(SAVED_KEY, JSON.stringify(program)); alert("Программа сохранена!"); } };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="glass-strong flex flex-col items-center justify-center animate-fade-up" style={{ padding: 60 }}>
        <Loader2 size={42} color="#2563EB" className="spin-slow" />
        <p className="text-soft mt-4" style={{ fontWeight: 600 }}>FitCare AI создаёт твою программу...</p>
      </div>
    );
  }

  if (program) {
    const d = program.days[activeDay];
    return (
      <div className="animate-fade-up">
        <div className="glass-strong" style={{ padding: 32, marginBottom: 20 }}>
          <p style={{ color: "#2563EB", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {program.split}
          </p>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em", marginTop: 6 }}>
            {program.program_name}
          </h2>
          <p className="text-soft mt-2">Цель: <strong style={{ color: "#1E293B" }}>{program.goal}</strong> · {program.weekly_calories_deficit_or_surplus}</p>
          <div className="flex flex-wrap gap-2 mt-5">
            <button onClick={save} className="btn-outline"><Save size={16} /> Сохранить программу</button>
            <button onClick={() => setTimer(0)} className="btn-primary"><Play size={16} /> Начать тренировку</button>
            <button onClick={() => { setProgram(null); setTimer(null); }} className="btn-outline"><RefreshCw size={16} /> Новая программа</button>
            {timer !== null && (
              <div style={{ padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg, #16A34A, #22C55E)", color: "#fff", fontWeight: 800, fontSize: 16 }}>
                ⏱ {fmt(timer)}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {program.days.map((day, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              style={{
                padding: "10px 16px", borderRadius: 12, fontWeight: 700, fontSize: 13,
                background: activeDay === i ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "rgba(255,255,255,0.7)",
                color: activeDay === i ? "#fff" : "#475569",
                border: "1px solid " + (activeDay === i ? "transparent" : "rgba(148,163,184,0.4)"),
                cursor: "pointer",
              }}
            >
              {day.day.slice(0, 2)}
            </button>
          ))}
        </div>

        <div className="glass-strong" style={{ padding: 28 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>{d.day} — {d.focus}</h3>
              <p className="text-soft" style={{ fontSize: 13 }}>{d.duration_minutes} минут</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {d.exercises.map((ex, i) => (
              <div key={i} className="glass-card" style={{ padding: 18 }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>{i + 1}. {ex.name}</p>
                    <p className="text-soft mt-1" style={{ fontSize: 13 }}>💡 {ex.tip}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Pill>{ex.sets} × {ex.reps}</Pill>
                    <Pill>Отдых {ex.rest}</Pill>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5" style={{ padding: 16, borderRadius: 14, background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(239,68,68,0.1))", border: "1px solid rgba(249,115,22,0.3)" }}>
            <p style={{ fontWeight: 700, color: "#9A3412" }}>🏃 Кардио: {d.cardio}</p>
          </div>
        </div>

        <div className="glass mt-5" style={{ padding: 24 }}>
          <p style={{ fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>🍎 Совет по питанию</p>
          <p className="text-soft" style={{ fontSize: 14, lineHeight: 1.6 }}>{program.nutrition_tip}</p>
        </div>
        <div className="glass mt-4" style={{ padding: 24 }}>
          <p style={{ fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>✨ Мотивация</p>
          <p className="text-soft" style={{ fontSize: 14, lineHeight: 1.6 }}>{program.motivation}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <section className="mb-6">
        <p style={{ color: "#2563EB", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Шаг 1 — Цель
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-3">
          {GOALS.map((g) => {
            const Icon = g.icon;
            const active = goal === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className="glass-card text-left"
                style={{
                  padding: 24, cursor: "pointer",
                  borderColor: active ? "#2563EB" : undefined,
                  boxShadow: active ? "0 12px 30px rgba(37,99,235,0.3)" : undefined,
                }}
              >
                <div className="flex items-center justify-center mb-3" style={{ width: 56, height: 56, borderRadius: 16, background: g.gradient, boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}>
                  <Icon size={26} color="#fff" />
                </div>
                <p style={{ fontWeight: 800, fontSize: 17, color: "#0F172A" }}>{g.id}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="glass-strong" style={{ padding: 28 }}>
        <p style={{ color: "#2563EB", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Шаг 2 — Параметры
        </p>
        <div className="grid md:grid-cols-3 gap-5 mt-4">
          <SelectField label="Где" icon={<MapPin size={14} />} value={location} setValue={setLocation} options={LOCATIONS} />
          <SelectField label="Опыт" icon={<Dumbbell size={14} />} value={experience} setValue={setExperience} options={LEVELS} />
          <SelectField label="Дней в неделю" icon={<Sparkles size={14} />} value={String(days)} setValue={(v) => setDays(+v)} options={DAYS.map(String)} />
        </div>

        {error && <p style={{ color: "#DC2626", fontSize: 14, fontWeight: 600, marginTop: 16 }}>{error}</p>}

        <button onClick={generate} className="btn-primary mt-6 w-full">
          <Sparkles size={18} /> Сгенерировать программу
        </button>
      </section>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(37,99,235,0.15)", color: "#1E40AF", fontSize: 12, fontWeight: 700, border: "1px solid rgba(37,99,235,0.3)" }}>
      {children}
    </span>
  );
}

function SelectField({ label, icon, value, setValue, options }: { label: string; icon: React.ReactNode; value: string; setValue: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="label-muted block mb-1.5 flex items-center gap-1.5">{icon} {label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => setValue(o)}
            style={{
              padding: "10px 14px", borderRadius: 10, fontWeight: 600, fontSize: 13,
              background: value === o ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "rgba(255,255,255,0.85)",
              color: value === o ? "#fff" : "#1E293B",
              border: "1px solid " + (value === o ? "transparent" : "rgba(148,163,184,0.4)"),
              cursor: "pointer",
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============== QUIZ ============== */

type QOption = { text: string; correct: boolean; explanation: string };
type Question = { question: string; hint: string; scenario: string; options: QOption[] };
type Quiz = { questions: Question[] };

const HISTORY_KEY = "fit_quiz_history";
const MAX = 1000;
const PASS = 700;

function readHistory(): { date: string; score: number; total: number }[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function pushHistory(e: { date: string; score: number; total: number }) {
  const next = [e, ...readHistory()].slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function Quiz() {
  const { user } = useAuth();
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
    if (isLast) { pushHistory({ date: new Date().toISOString(), score, total: MAX }); setFinished(true); return; }
    setIdx((i) => i + 1); setSelected(null); setHintShown(false);
  };

  const leaderboard = useMemo(() => getWeeklyLeaderboard(user?.name || "Вы", finished ? score : 0), [finished, score, user?.name]);

  if (loading) return (
    <div className="glass-strong flex flex-col items-center justify-center" style={{ padding: 60 }}>
      <Loader2 size={42} color="#2563EB" className="spin-slow" />
      <p className="text-soft mt-4">Генерация вопросов...</p>
    </div>
  );
  if (error) return (
    <div className="glass-strong" style={{ padding: 32 }}>
      <p style={{ color: "#DC2626", fontWeight: 700 }}>Ошибка</p>
      <p className="text-soft mt-2" style={{ fontSize: 14 }}>{error}</p>
      <button onClick={fetchQuiz} className="btn-primary mt-5"><RefreshCw size={18} /> Повторить</button>
    </div>
  );

  if (finished) {
    const passed = score >= PASS;
    return (
      <div className="animate-fade-up">
        <div className="glass-strong text-center" style={{ padding: 40 }}>
          <div
            className="soft-float mx-auto mb-5 flex items-center justify-center"
            style={{ width: 96, height: 96, borderRadius: 28, background: passed ? "linear-gradient(135deg, #16A34A, #22D3EE)" : "linear-gradient(135deg, #EF4444, #F59E0B)" }}
          >
            <Trophy size={44} color="#fff" />
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
            {passed ? "Passed ✅" : "Try again ❌"}
          </h2>
          <p className="text-soft mt-2">
            Заработано: <strong style={{ color: "#0F172A", fontSize: 22 }}>{score}</strong> / {MAX}
          </p>
          <p className="text-soft mt-1" style={{ fontSize: 13 }}>Минимум: {PASS}</p>
          <button onClick={fetchQuiz} className="btn-primary mt-6"><RefreshCw size={18} /> Новый квиз</button>
        </div>

        <div className="glass mt-6" style={{ padding: 28 }}>
          <div className="flex items-center gap-2 mb-3">
            <Medal size={20} color="#FBBF24" />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>Глобальный рейтинг</h3>
          </div>
          <div className="flex flex-col gap-2">
            {leaderboard.map((p, i) => (
              <div key={i} className="flex items-center justify-between" style={{
                padding: "12px 16px", borderRadius: 14,
                background: p.me ? "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(124,58,237,0.25))" : "rgba(255,255,255,0.5)",
                border: "1px solid " + (p.me ? "rgba(37,99,235,0.5)" : "rgba(148,163,184,0.25)"),
              }}>
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

  if (!q) return null;

  return (
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
          <button
            onClick={() => setHintShown(true)}
            disabled={hintShown}
            style={{
              marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 14px", borderRadius: 12,
              background: hintShown ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.7)",
              color: hintShown ? "#92400E" : "#475569",
              border: "1px solid " + (hintShown ? "rgba(251,191,36,0.5)" : "rgba(148,163,184,0.4)"),
              fontSize: 13, fontWeight: 600, cursor: hintShown ? "default" : "pointer",
            }}
          >
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
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={reveal}
                style={{
                  textAlign: "left", padding: "14px 16px", borderRadius: 14,
                  border: `1.5px solid ${border}`, background: bg, color,
                  fontSize: 15, fontWeight: 500, cursor: reveal ? "default" : "pointer",
                  transition: "all 0.2s ease", display: "flex", alignItems: "flex-start", gap: 10,
                }}
              >
                {reveal && opt.correct && <CheckCircle2 size={18} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />}
                {reveal && isSel && !opt.correct && <XCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />}
                <span style={{ flex: 1 }}>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="mt-5" style={{
            padding: "14px 16px", borderRadius: 14,
            background: q.options[selected].correct ? "rgba(22,163,74,0.12)" : "rgba(239,68,68,0.12)",
            border: "1px solid " + (q.options[selected].correct ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"),
            color: q.options[selected].correct ? "#15803D" : "#B91C1C",
            fontSize: 14, lineHeight: 1.5,
          }}>
            <strong style={{ display: "block", marginBottom: 4 }}>
              {q.options[selected].correct ? `Правильно! +${hintShown ? 50 : 100} очков` : "Неправильно. 0 очков"}
            </strong>
            {q.options[selected].explanation}
          </div>
        )}

        {selected !== null && (
          <button onClick={next} className="btn-primary w-full mt-5">
            {isLast ? "Завершить" : "Следующий вопрос"}
          </button>
        )}
      </div>
    </div>
  );
}