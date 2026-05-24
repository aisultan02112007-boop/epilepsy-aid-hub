import { useEffect, useRef, useState } from "react";
import { Dumbbell, ArrowRight, Activity, BookOpen, Star, Users, MessageCircle, Sparkles, Cpu, Brain, Zap } from "lucide-react";
import type { ViewKey } from "./Navbar";

type Metric = {
  icon: typeof Users;
  target: number;
  suffix?: string;
  decimals?: number;
  label: string;
  display?: (n: number) => string;
  stars?: boolean;
};

const METRICS: Metric[] = [
  { icon: Users, target: 350000, suffix: "+", label: "Активных пользователей по миру" },
  { icon: MessageCircle, target: 120000, suffix: "+", label: "Участников сообщества" },
  { icon: Sparkles, target: 10000, suffix: "+", label: "AI-программ тренировок" },
  { icon: Star, target: 4.8, decimals: 1, label: "Рейтинг в App Store", stars: true },
  { icon: Activity, target: 95, suffix: "%", label: "Положительных отзывов" },
];

function easeOutQuad(t: number) { return 1 - (1 - t) * (1 - t); }

function useCountUp(target: number, duration = 2500, decimals = 0) {
  const [val, setVal] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutQuad(t);
      setVal(parseFloat((eased * target).toFixed(decimals)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, decimals]);
  return val;
}

function formatNum(n: number, decimals = 0) {
  if (decimals > 0) return n.toFixed(decimals).replace(".", ",");
  if (n >= 1000) return Math.floor(n).toLocaleString("ru-RU");
  return Math.floor(n).toString();
}

function MetricCard({ m, delay }: { m: Metric; delay: number }) {
  const Icon = m.icon;
  const val = useCountUp(m.target, 2500, m.decimals ?? 0);
  return (
    <div className="glass-card animate-fade-up" style={{ padding: 26, animationDelay: `${delay}s`, position: "relative", overflow: "hidden" }}>
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: 52, height: 52, borderRadius: 14,
          background: "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(124,58,237,0.35))",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        <Icon size={24} color="#2563EB" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="count-shine" style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {formatNum(val, m.decimals ?? 0)}
        </span>
        {m.suffix && (
          <span style={{ fontSize: 22, fontWeight: 800, color: "#2563EB" }}>{m.suffix}</span>
        )}
      </div>
      {m.stars && (
        <div className="flex gap-0.5 mt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={14} fill="#FBBF24" color="#FBBF24"
              style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.6))" }} />
          ))}
        </div>
      )}
      <p className="text-soft mt-2" style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{m.label}</p>
    </div>
  );
}

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
          FitCare — Твой персональный фитнес-помощник
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

      <section className="mt-12">
        <div className="flex items-end justify-between flex-wrap gap-2 mb-5">
          <div>
            <p style={{ color: "#2563EB", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              FitCare в цифрах
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginTop: 4 }}>
              Сообщество, которому доверяют
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {METRICS.map((m, i) => (
            <MetricCard key={i} m={m} delay={i * 0.08} />
          ))}
        </div>
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
          <button
            onClick={() => onNavigate("guide")}
            className="btn-primary mt-6"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <BookOpen size={18} /> Узнать больше
          </button>
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

      {/* FIND YOUR PROGRAM — atmospheric, motivational */}
      <section className="mt-16 animate-fade-up">
        <div className="text-center mb-8">
          <p style={{ color: "#7C3AED", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            AI Fitness Assistant
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginTop: 6, lineHeight: 1.1 }}>
            Найди свою программу
          </h2>
          <p className="text-soft mt-3" style={{ fontSize: 15, maxWidth: 560, margin: "12px auto 0" }}>
            Твой код эволюции уже на 75% написан — осталось активировать персональный алгоритм.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Card 1 — tall */}
          <div className="glass-card col-span-12 md:col-span-5 row-span-2" style={{ padding: 28, minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(160deg, rgba(167,243,208,0.35), rgba(219,234,254,0.3) 60%, rgba(252,231,243,0.3))" }}>
            <div>
              <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #2563EB, #7C3AED)", boxShadow: "0 8px 20px rgba(37,99,235,0.35)" }}>
                <Brain size={24} color="#fff" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginTop: 18, letterSpacing: "-0.02em" }}>
                Твой персональный алгоритм
              </h3>
              <p className="text-soft mt-2" style={{ fontSize: 14, lineHeight: 1.55 }}>
                AI анализирует цель, опыт и расписание — и собирает программу, в которой каждое движение работает на результат.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(148,163,184,0.25)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "75%", background: "linear-gradient(90deg, #2563EB, #7C3AED)", boxShadow: "0 0 14px rgba(37,99,235,0.55)" }} />
              </div>
              <span style={{ fontWeight: 800, color: "#2563EB", fontSize: 14 }}>75%</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card col-span-12 md:col-span-7" style={{ padding: 26 }}>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #14B8A6, #06B6D4)", boxShadow: "0 8px 20px rgba(20,184,166,0.35)", flexShrink: 0 }}>
                <Zap size={24} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
                  Энергия, превращённая в форму
                </h3>
                <p className="text-soft mt-1.5" style={{ fontSize: 14, lineHeight: 1.55 }}>
                  Каждая тренировка — заряд для тела и мозга. Меньше выгорания, больше прогресса.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card col-span-6 md:col-span-3" style={{ padding: 22, background: "linear-gradient(160deg, rgba(252,231,243,0.5), rgba(255,255,255,0.5))" }}>
            <Cpu size={26} color="#7C3AED" />
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginTop: 12 }}>
              Адаптивные нагрузки
            </p>
            <p className="text-soft mt-1" style={{ fontSize: 12, lineHeight: 1.5 }}>
              Программа подстраивается под твой темп.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card col-span-6 md:col-span-4" style={{ padding: 22 }}>
            <Sparkles size={26} color="#2563EB" />
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginTop: 12 }}>
              Геймификация прогресса
            </p>
            <p className="text-soft mt-1" style={{ fontSize: 12, lineHeight: 1.5 }}>
              XP, стрики, ачивки и глобальный рейтинг.
            </p>
          </div>
        </div>

        {/* Big pulsing CTA */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => onNavigate("workouts")}
            className="inner-glow"
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              padding: "20px 40px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.6)",
              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              color: "#fff",
              fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em",
              cursor: "pointer",
            }}
          >
            <Sparkles size={20} /> Активировать мой алгоритм <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}