import { Dumbbell, Flame, Trophy, BarChart3, Gamepad2, Apple, ArrowRight, Activity } from "lucide-react";
import type { ViewKey } from "./Navbar";

const STATS = [
  { icon: Dumbbell, text: "Более 500 упражнений в базе" },
  { icon: Flame, text: "Сжигай жир умнее, не тяжелее" },
  { icon: Trophy, text: "Система уровней и достижений" },
];

const FEATURES: { key: ViewKey; icon: typeof Dumbbell; title: string; desc: string }[] = [
  { key: "workouts", icon: Dumbbell, title: "Генератор программ", desc: "Персональный план под твои цели" },
  { key: "progress", icon: BarChart3, title: "Прогресс", desc: "Графики веса, ИМТ, шагов и калорий" },
  { key: "profile", icon: Gamepad2, title: "Геймификация", desc: "XP, уровни, стрики и ачивки" },
  { key: "nutrition", icon: Apple, title: "Питание", desc: "Калории, вода и AI-советы" },
];

export function Home({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  return (
    <div className="mx-auto" style={{ maxWidth: 1200, padding: "100px 24px 80px" }}>
      <section className="min-h-[78vh] flex flex-col items-center justify-center text-center animate-fade-up">
        <div
          className="soft-float mb-8 flex items-center justify-center"
          style={{ width: 120, height: 120, borderRadius: 36, background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
        >
          <Dumbbell size={56} color="#fff" strokeWidth={2.2} />
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.05,
            background: "linear-gradient(135deg, #1E293B 0%, #2563EB 60%, #7C3AED 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", maxWidth: 900,
          }}
        >
          FitCare — Твой путь к лучшему телу
        </h1>
        <p className="text-soft mt-5" style={{ fontSize: 18, maxWidth: 640, lineHeight: 1.5 }}>
          Персональные тренировки, питание и геймификация в одном месте
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <button onClick={() => onNavigate("workouts")} className="btn-primary">
            Начать программу <ArrowRight size={18} />
          </button>
          <button onClick={() => onNavigate("progress")} className="btn-outline">
            Мой прогресс
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-5 mt-12">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-card animate-fade-up" style={{ padding: 26, animationDelay: `${i * 0.1}s` }}>
              <div
                className="flex items-center justify-center mb-4"
                style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(124,58,237,0.35))",
                  border: "1px solid rgba(255,255,255,0.5)",
                }}
              >
                <Icon size={24} color="#2563EB" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4, color: "#1E293B" }}>{s.text}</p>
            </div>
          );
        })}
      </section>

      <section className="glass mt-16 grid md:grid-cols-2 gap-8 items-center" style={{ padding: 40 }}>
        <div>
          <p style={{ color: "#2563EB", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Что такое ожирение?
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 8, letterSpacing: "-0.02em", lineHeight: 1.15, color: "#0F172A" }}>
            Не приговор. Если знаешь, что делать.
          </h2>
          <p className="text-soft mt-4" style={{ fontSize: 15, lineHeight: 1.6 }}>
            Ожирение — хроническое заболевание, при котором избыток жировой ткани негативно
            влияет на здоровье. ИМТ выше 30 считается ожирением. Правильные тренировки и
            питание — главный инструмент борьбы с ним. <strong style={{ color: "#1E293B" }}>FitCare</strong> поможет тебе
            выстроить систему.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <div
            className="flex items-center justify-center"
            style={{
              width: 220, height: 220, borderRadius: "50%",
              background: "radial-gradient(circle at 30% 30%, rgba(96,165,250,0.5), rgba(124,58,237,0.25) 60%, transparent 80%)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            <Activity size={110} color="#2563EB" strokeWidth={1.4} />
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 24, color: "#0F172A" }}>
          Возможности
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => onNavigate(f.key)}
                className="glass-card text-left animate-fade-up"
                style={{ padding: 28, animationDelay: `${i * 0.08}s`, cursor: "pointer" }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                      boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
                    }}
                  >
                    <Icon size={26} color="#fff" />
                  </div>
                  <ArrowRight size={20} color="#94A3B8" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 18, color: "#0F172A" }}>{f.title}</h3>
                <p className="text-soft mt-1.5" style={{ fontSize: 14, lineHeight: 1.5 }}>{f.desc}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}