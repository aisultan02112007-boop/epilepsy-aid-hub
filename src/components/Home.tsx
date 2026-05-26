import { useEffect, useRef, useState } from "react";
import { Dumbbell, ArrowRight, Activity, BookOpen, Star, Users, MessageCircle, Sparkles } from "lucide-react";
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
];

function easeOutQuad(t: number) { return 1 - (1 - t) * (1 - t); }

function useCountUp(target: number, duration = 2500, decimals = 0, active = true) {
  const [val, setVal] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (!active) return;
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
  }, [target, duration, decimals, active]);
  return val;
}

function formatNum(n: number, decimals = 0) {
  if (decimals > 0) return n.toFixed(decimals).replace(".", ",");
  if (n >= 1000) return Math.floor(n).toLocaleString("ru-RU");
  return Math.floor(n).toString();
}

function MetricCard({ m }: { m: Metric }) {
  const Icon = m.icon;
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      });
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const val = useCountUp(m.target, 2200, m.decimals ?? 0, visible);
  return (
    <div ref={ref} style={{ padding: "4px 6px" }}>
      <div
        className="flex items-center justify-center mb-3"
        style={{
          width: 40, height: 40, borderRadius: 11,
          background: "linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.3))",
          border: "1px solid rgba(255,255,255,0.55)",
        }}
      >
        <Icon size={18} color="#2563EB" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="count-shine" style={{ fontSize: "clamp(24px, 3vw, 30px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {formatNum(val, m.decimals ?? 0)}
        </span>
        {m.suffix && (
          <span style={{ fontSize: 18, fontWeight: 800, color: "#2563EB" }}>{m.suffix}</span>
        )}
      </div>
      {m.stars && (
        <div className="flex gap-0.5 mt-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={11} fill="#FBBF24" color="#FBBF24"
              style={{ filter: "drop-shadow(0 0 4px rgba(251,191,36,0.55))" }} />
          ))}
        </div>
      )}
      <p className="text-soft mt-1.5" style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{m.label}</p>
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
        <div className="glass-card" style={{ padding: "22px 24px" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {METRICS.map((m, i) => (
              <MetricCard key={i} m={m} />
            ))}
          </div>
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

      <section className="mt-16 animate-fade-up">
        <div className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            ИИ Ассистент FitCare
          </h2>
          <p className="text-soft mt-3" style={{ fontSize: 15, lineHeight: 1.6, maxWidth: 640 }}>
            AI поможет тебе создать подходящую программу тренировок под твою цель, уровень и расписание.
            Каждое упражнение будет подобрано так, чтобы реально давать результат.
          </p>

          <div className="flex items-center justify-between mt-6" style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
            <span style={{ color: "#475569" }}>Прогресс</span>
            <span style={{ color: "#2563EB", fontWeight: 800 }}>75%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(148,163,184,0.24)", overflow: "hidden", marginTop: 8 }}>
            <div style={{ height: "100%", width: "75%", background: "linear-gradient(90deg, #2563EB, #7C3AED)", boxShadow: "0 0 14px rgba(37,99,235,0.5)", borderRadius: 999 }} />
          </div>

          <div className="mt-7">
            <button
              onClick={() => onNavigate("workouts")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "14px 26px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.6)",
                background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                color: "#fff",
                fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em",
                cursor: "pointer",
                boxShadow: "0 10px 24px -8px rgba(37,99,235,0.55)",
              }}
            >
              <Sparkles size={18} /> Создать свою программу <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}