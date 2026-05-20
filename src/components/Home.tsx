import { HeartPulse, Brain, Zap, LifeBuoy, LineChart, BookOpen, User, ArrowRight, ShieldCheck } from "lucide-react";
import type { ViewKey } from "./Navbar";

const FEATURES: { key: ViewKey; icon: typeof HeartPulse; title: string; desc: string }[] = [
  { key: "simulation", icon: LifeBuoy, title: "Симуляция", desc: "Практикуй правильные действия в реальных сценариях" },
  { key: "diary", icon: LineChart, title: "Дневник", desc: "Отслеживай приступы и триггеры" },
  { key: "info", icon: BookOpen, title: "Информация", desc: "Узнай всё об эпилепсии" },
  { key: "profile", icon: User, title: "Профиль", desc: "Твоя история и достижения" },
];

const STATS = [
  { icon: Brain, text: "300 млн человек в мире живут с эпилепсией" },
  { icon: Zap, text: "1 из 100 людей столкнётся с приступом" },
  { icon: ShieldCheck, text: "Правильная помощь снижает риск травм на 80%" },
];

export function Home({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  return (
    <div className="mx-auto" style={{ maxWidth: 1200, padding: "100px 24px 80px" }}>
      {/* HERO */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-fade-up">
        <div
          className="pulse-glow mb-8 flex items-center justify-center"
          style={{
            width: 120, height: 120, borderRadius: 36,
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
          }}
        >
          <HeartPulse size={56} color="#fff" strokeWidth={2.2} />
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            background: "linear-gradient(135deg, #1E293B 0%, #2563EB 60%, #7C3AED 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            maxWidth: 900,
          }}
        >
          MedCare — Знай. Помогай. Спасай.
        </h1>
        <p className="text-soft mt-5" style={{ fontSize: 18, maxWidth: 620, lineHeight: 1.5 }}>
          Интерактивное обучение первой помощи при эпилепсии
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <button onClick={() => onNavigate("simulation")} className="btn-primary">
            Начать симуляцию <ArrowRight size={18} />
          </button>
          <button onClick={() => onNavigate("info")} className="btn-outline">
            Узнать об эпилепсии
          </button>
        </div>
      </section>

      {/* INFO STRIP */}
      <section className="grid md:grid-cols-3 gap-5 mt-12">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="glass-card animate-fade-up"
              style={{ padding: 26, animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="flex items-center justify-center mb-4"
                style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(124,58,237,0.35))",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Icon size={24} color="#93C5FD" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>{s.text}</p>
            </div>
          );
        })}
      </section>

      {/* WHAT IS EPILEPSY */}
      <section className="glass mt-16 grid md:grid-cols-2 gap-8 items-center" style={{ padding: 40 }}>
        <div>
          <p style={{ color: "#93C5FD", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Что такое эпилепсия?
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 8, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            Не страшно. Если знаешь, что делать.
          </h2>
          <p className="text-soft mt-4" style={{ fontSize: 15, lineHeight: 1.6 }}>
            Эпилепсия — неврологическое расстройство, при котором в мозге возникают внезапные электрические разряды.
            Это вызывает приступы — судороги, потерю сознания или необычные ощущения.
            Это <strong style={{ color: "#1E293B" }}>не психическое заболевание</strong>.
            При правильной помощи человек быстро восстанавливается.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <div
            className="flex items-center justify-center"
            style={{
              width: 220, height: 220, borderRadius: "50%",
              background: "radial-gradient(circle at 30% 30%, rgba(96,165,250,0.4), rgba(124,58,237,0.2) 60%, transparent 80%)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <Brain size={110} color="#93C5FD" strokeWidth={1.4} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mt-16">
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 24 }}>
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
                <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 18 }}>{f.title}</h3>
                <p className="text-soft mt-1.5" style={{ fontSize: 14, lineHeight: 1.5 }}>
                  {f.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
