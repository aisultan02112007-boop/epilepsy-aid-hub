import { useEffect, useState } from "react";
import {
  Flame, Dumbbell, Scale, Loader2, Sparkles, Save, Play, RefreshCw,
  User, Calendar, Clock, Target, Trophy, ArrowLeft, ArrowRight, Check,
} from "lucide-react";

type Exercise = { name: string; sets: number; reps: string; rest: string; tip: string };
type Day = { day: string; focus: string; exercises: Exercise[]; cardio: string; duration_minutes: number };
type Program = { program_name: string; goal: string; split: string; weekly_calories_deficit_or_surplus: string; days: Day[]; nutrition_tip: string; motivation: string };

const SAVED_KEY = "fit_saved_program";
const PROFILE_KEY = "fit_program_profile";

const GOALS = [
  { id: "Похудение", icon: Flame, gradient: "linear-gradient(135deg, #F97316, #EF4444)", desc: "Снизить % жира и улучшить рельеф" },
  { id: "Набор массы", icon: Dumbbell, gradient: "linear-gradient(135deg, #2563EB, #7C3AED)", desc: "Увеличить силу и мышечный объём" },
  { id: "Рекомпозиция тела", icon: Scale, gradient: "linear-gradient(135deg, #14B8A6, #06B6D4)", desc: "Жир ↓ и мышцы ↑ одновременно" },
];
const GENDERS = [
  { id: "Мужской", emoji: "♂" },
  { id: "Женский", emoji: "♀" },
];
const LEVELS = [
  { id: "Новичок", desc: "Меньше 6 мес. опыта" },
  { id: "Средний", desc: "6 мес. – 2 года" },
  { id: "Продвинутый", desc: "Более 2 лет стажа" },
];
const DAYS_OPTIONS = [3, 4, 5, 6];
const DURATIONS = [30, 45, 60, 90];

type Profile = {
  age: number;
  gender: string;
  goal: string;
  days: number;
  duration: number;
  level: string;
};

const STEPS = ["Возраст", "Пол", "Цель", "Дни", "Длительность", "Уровень"] as const;

export function Workouts() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const s = localStorage.getItem(PROFILE_KEY);
      if (s) return JSON.parse(s);
    } catch {}
    return { age: 25, gender: "", goal: "", days: 3, duration: 60, level: "" };
  });
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

  const canNext =
    (step === 0 && profile.age >= 12 && profile.age <= 90) ||
    (step === 1 && !!profile.gender) ||
    (step === 2 && !!profile.goal) ||
    (step === 3 && !!profile.days) ||
    (step === 4 && !!profile.duration) ||
    (step === 5 && !!profile.level);

  const generate = async () => {
    setLoading(true); setError(null); setProgram(null);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    try {
      const res = await fetch("/api/public/workout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: profile.goal,
          location: "Зал",
          experience: profile.level,
          days: profile.days,
        }),
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
      <div className="mx-auto" style={{ maxWidth: 960, padding: "100px 24px 80px" }}>
        <div className="glass-strong flex flex-col items-center justify-center animate-fade-up" style={{ padding: 60 }}>
          <Loader2 size={42} color="#2563EB" className="spin-slow" />
          <p className="text-soft mt-4" style={{ fontWeight: 600 }}>FitCare AI создаёт твою программу...</p>
        </div>
      </div>
    );
  }

  if (program) {
    const d = program.days[activeDay];
    return (
      <div className="mx-auto animate-fade-up" style={{ maxWidth: 960, padding: "100px 24px 80px" }}>
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
            <button onClick={() => { setProgram(null); setTimer(null); setStep(0); }} className="btn-outline"><RefreshCw size={16} /> Новая программа</button>
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
                    <span style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(37,99,235,0.15)", color: "#1E40AF", fontSize: 12, fontWeight: 700, border: "1px solid rgba(37,99,235,0.3)" }}>{ex.sets} × {ex.reps}</span>
                    <span style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(37,99,235,0.15)", color: "#1E40AF", fontSize: 12, fontWeight: 700, border: "1px solid rgba(37,99,235,0.3)" }}>Отдых {ex.rest}</span>
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

  const progressPct = ((step + (canNext ? 1 : 0)) / STEPS.length) * 100;

  return (
    <div className="mx-auto" style={{ maxWidth: 720, padding: "100px 24px 80px" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-up">
        <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg, #2563EB, #7C3AED)", boxShadow: "0 8px 24px rgba(37,99,235,0.4)" }}>
          <Sparkles size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em" }}>ИИ ассистент FitCare</h1>
          <p className="text-soft" style={{ fontSize: 14, marginTop: 2 }}>Ответь на несколько вопросов — и ИИ составит твою программу</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="glass mb-6 animate-fade-up" style={{ padding: "24px 20px" }}>
        <div className="flex items-center justify-between relative" style={{ marginBottom: 12 }}>
          {STEPS.map((label, i) => {
            const isDone = i < step;
            const isCurrent = i === step;
            return (
              <div key={i} className="flex flex-col items-center" style={{ flex: 1, position: "relative", zIndex: 2 }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: isCurrent ? 40 : 32,
                    height: isCurrent ? 40 : 32,
                    borderRadius: "50%",
                    background: isDone
                      ? "linear-gradient(135deg, #2563EB, #7C3AED)"
                      : isCurrent
                      ? "linear-gradient(135deg, #2563EB, #7C3AED)"
                      : "rgba(255,255,255,0.8)",
                    border: isDone || isCurrent ? "2px solid transparent" : "2px solid rgba(148,163,184,0.4)",
                    color: isDone || isCurrent ? "#fff" : "#64748B",
                    fontWeight: 800,
                    fontSize: isCurrent ? 15 : 13,
                    transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: isCurrent
                      ? "0 0 0 4px rgba(37,99,235,0.15), 0 6px 18px rgba(37,99,235,0.35)"
                      : isDone
                      ? "0 4px 12px rgba(37,99,235,0.25)"
                      : "none",
                  }}
                >
                  {isDone ? <Check size={16} strokeWidth={3} /> : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? "#2563EB" : isDone ? "#1E293B" : "#94A3B8",
                    marginTop: 8,
                    transition: "color 0.3s ease",
                    textAlign: "center",
                    lineHeight: 1.2,
                    maxWidth: 70,
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
          {/* Connector line behind circles */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "8%",
              right: "8%",
              height: 3,
              borderRadius: 3,
              background: "rgba(148,163,184,0.2)",
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "8%",
              width: `${(step / (STEPS.length - 1)) * 84}%`,
              height: 3,
              borderRadius: 3,
              background: "linear-gradient(90deg, #2563EB, #7C3AED)",
              zIndex: 1,
              transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>

        {/* Current step title + progress percent */}
        <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
            {STEPS[step]}
          </span>
          <span className="text-soft" style={{ fontSize: 13, fontWeight: 600 }}>
            {Math.round(progressPct)}%
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: "rgba(148,163,184,0.2)", overflow: "hidden", marginTop: 10 }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #2563EB, #7C3AED)",
              transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 0 12px rgba(37,99,235,0.4)",
            }}
          />
        </div>
      </div>

      {/* Step body */}
      <div className="glass-strong animate-fade-up" key={step} style={{ padding: 28 }}>
        {step === 0 && (
          <StepBlock icon={<User size={22} color="#fff" />} title="Сколько тебе лет?" desc="Возраст помогает подобрать интенсивность.">
            <div className="flex items-center justify-center gap-4 my-4">
              <button
                onClick={() => setProfile({ ...profile, age: Math.max(12, profile.age - 1) })}
                style={roundBtn}
              >−</button>
              <div className="text-center" style={{ minWidth: 140 }}>
                <div className="count-shine" style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em" }}>{profile.age}</div>
                <p className="text-soft mt-1" style={{ fontSize: 13 }}>лет</p>
              </div>
              <button
                onClick={() => setProfile({ ...profile, age: Math.min(90, profile.age + 1) })}
                style={roundBtn}
              >+</button>
            </div>
            <input
              type="range" min={12} max={90} value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
              style={{ width: "100%", accentColor: "#2563EB" }}
            />
          </StepBlock>
        )}

        {step === 1 && (
          <StepBlock icon={<User size={22} color="#fff" />} title="Твой пол" desc="Для корректного расчёта нагрузки.">
            <div className="grid grid-cols-2 gap-3 mt-2">
              {GENDERS.map((g) => (
                <OptionCard
                  key={g.id}
                  active={profile.gender === g.id}
                  onClick={() => setProfile({ ...profile, gender: g.id })}
                  title={g.id}
                  emoji={g.emoji}
                />
              ))}
            </div>
          </StepBlock>
        )}

        {step === 2 && (
          <StepBlock icon={<Target size={22} color="#fff" />} title="Твоя цель" desc="Что ты хочешь получить от программы?">
            <div className="grid gap-3 mt-2">
              {GOALS.map((g) => {
                const Icon = g.icon;
                const active = profile.goal === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setProfile({ ...profile, goal: g.id })}
                    className="glass-card text-left"
                    style={{
                      padding: 18, cursor: "pointer",
                      border: active ? "2px solid #2563EB" : "1px solid rgba(255,255,255,0.85)",
                      boxShadow: active ? "0 14px 34px rgba(37,99,235,0.32)" : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 14, background: g.gradient, boxShadow: "0 8px 20px rgba(37,99,235,0.25)" }}>
                        <Icon size={22} color="#fff" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>{g.id}</p>
                        <p className="text-soft" style={{ fontSize: 13 }}>{g.desc}</p>
                      </div>
                      {active && (
                        <span style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7C3AED)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check size={14} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </StepBlock>
        )}

        {step === 3 && (
          <StepBlock icon={<Calendar size={22} color="#fff" />} title="Сколько дней в неделю?" desc="Реалистичность важнее амбиций.">
            <div className="grid grid-cols-4 gap-3 mt-2">
              {DAYS_OPTIONS.map((d) => (
                <OptionCard
                  key={d}
                  active={profile.days === d}
                  onClick={() => setProfile({ ...profile, days: d })}
                  title={String(d)}
                  subtitle="дней"
                />
              ))}
            </div>
          </StepBlock>
        )}

        {step === 4 && (
          <StepBlock icon={<Clock size={22} color="#fff" />} title="Длительность тренировки" desc="Сколько времени готов уделять?">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {DURATIONS.map((d) => (
                <OptionCard
                  key={d}
                  active={profile.duration === d}
                  onClick={() => setProfile({ ...profile, duration: d })}
                  title={`${d}`}
                  subtitle="минут"
                />
              ))}
            </div>
          </StepBlock>
        )}

        {step === 5 && (
          <StepBlock icon={<Trophy size={22} color="#fff" />} title="Уровень подготовки" desc="Будь честен — это поможет AI.">
            <div className="grid gap-3 mt-2">
              {LEVELS.map((l) => {
                const active = profile.level === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => setProfile({ ...profile, level: l.id })}
                    className="glass-card text-left"
                    style={{
                      padding: 18, cursor: "pointer",
                      border: active ? "2px solid #2563EB" : "1px solid rgba(255,255,255,0.85)",
                      boxShadow: active ? "0 14px 34px rgba(37,99,235,0.32)" : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>{l.id}</p>
                        <p className="text-soft" style={{ fontSize: 13 }}>{l.desc}</p>
                      </div>
                      {active && (
                        <span style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7C3AED)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check size={14} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </StepBlock>
        )}

        {error && <p style={{ color: "#DC2626", fontSize: 14, fontWeight: 600, marginTop: 14 }}>{error}</p>}

        {/* Footer nav */}
        <div className="flex items-center justify-between gap-3 mt-7">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-outline"
            style={{ opacity: step === 0 ? 0.4 : 1 }}
          >
            <ArrowLeft size={16} /> Назад
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => canNext && setStep((s) => s + 1)}
              disabled={!canNext}
              className="btn-primary"
            >
              Далее <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={generate} disabled={!canNext} className="btn-primary">
              <Sparkles size={16} /> Создать программу
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const roundBtn: React.CSSProperties = {
  width: 48, height: 48, borderRadius: 14,
  background: "rgba(255,255,255,0.85)",
  border: "1px solid rgba(148,163,184,0.4)",
  color: "#1E293B", fontSize: 24, fontWeight: 800, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

function StepBlock({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #2563EB, #7C3AED)", boxShadow: "0 6px 18px rgba(37,99,235,0.4)" }}>
          {icon}
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>{title}</h2>
          <p className="text-soft" style={{ fontSize: 13 }}>{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function OptionCard({ active, onClick, title, subtitle, emoji }: { active: boolean; onClick: () => void; title: string; subtitle?: string; emoji?: string }) {
  return (
    <button
      onClick={onClick}
      className="glass-card"
      style={{
        padding: "18px 12px", cursor: "pointer",
        border: active ? "2px solid #2563EB" : "1px solid rgba(255,255,255,0.85)",
        boxShadow: active ? "0 14px 34px rgba(37,99,235,0.32)" : undefined,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}
    >
      {emoji && <span style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</span>}
      <span style={{ fontSize: emoji ? 16 : 24, fontWeight: 800, color: "#0F172A", marginTop: emoji ? 6 : 0 }}>{title}</span>
      {subtitle && <span className="text-soft" style={{ fontSize: 12, marginTop: 2 }}>{subtitle}</span>}
    </button>
  );
}