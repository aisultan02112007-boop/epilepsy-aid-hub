import { useEffect, useMemo, useState } from "react";
import { Plus, Flame, Droplets, Footprints, Scale } from "lucide-react";

type Log = {
  date: string; // YYYY-MM-DD
  weight: number; waist: number; steps: number; water: number;
  calories: number; workout: boolean; mood: number;
};

const KEY = "fit_logs";
const PROFILE_KEY = "fit_profile";

function read(): Log[] { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
function write(l: Log[]) { localStorage.setItem(KEY, JSON.stringify(l)); }
function today() { return new Date().toISOString().slice(0, 10); }

function bmiInfo(w: number, hCm: number) {
  if (!w || !hCm) return { v: 0, label: "—", color: "#94A3B8" };
  const h = hCm / 100;
  const v = +(w / (h * h)).toFixed(1);
  if (v < 18.5) return { v, label: "Недостаточный вес", color: "#60A5FA" };
  if (v < 25) return { v, label: "Норма", color: "#16A34A" };
  if (v < 30) return { v, label: "Избыточный вес", color: "#F59E0B" };
  return { v, label: "Ожирение", color: "#DC2626" };
}

function calcStreak(logs: Log[]): { current: number; longest: number; active: Set<string> } {
  const set = new Set(logs.map((l) => l.date));
  let current = 0;
  const d = new Date();
  while (set.has(d.toISOString().slice(0, 10))) { current++; d.setDate(d.getDate() - 1); }
  const sorted = [...set].sort();
  let longest = 0, run = 0, prev: Date | null = null;
  for (const k of sorted) {
    const dd = new Date(k);
    if (prev && (dd.getTime() - prev.getTime()) === 86400000) run++;
    else run = 1;
    longest = Math.max(longest, run);
    prev = dd;
  }
  return { current, longest, active: set };
}

export function Progress() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [steps, setSteps] = useState("");
  const [water, setWater] = useState(0);
  const [calories, setCalories] = useState("");
  const [workout, setWorkout] = useState(false);
  const [mood, setMood] = useState(3);
  const [height, setHeight] = useState(170);

  useEffect(() => {
    setLogs(read());
    try {
      const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
      if (p?.height) setHeight(p.height);
    } catch {}
  }, []);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    const entry: Log = {
      date: today(),
      weight: +weight, waist: +waist || 0, steps: +steps || 0,
      water, calories: +calories || 0, workout, mood,
    };
    const all = [entry, ...logs.filter((l) => l.date !== entry.date)];
    all.sort((a, b) => b.date.localeCompare(a.date));
    write(all); setLogs(all);
    setWeight(""); setWaist(""); setSteps(""); setWater(0); setCalories(""); setWorkout(false); setMood(3);
  };

  const last = logs[0];
  const bmi = useMemo(() => bmiInfo(last?.weight || 0, height), [last, height]);
  const streak = useMemo(() => calcStreak(logs), [logs]);

  // 14-day weight series
  const days14 = useMemo(() => {
    const arr: { date: string; w: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const log = logs.find((l) => l.date === key);
      arr.push({ date: key, w: log?.weight || 0 });
    }
    return arr;
  }, [logs]);
  const days7 = useMemo(() => {
    const arr: { date: string; steps: number; cal: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const log = logs.find((l) => l.date === key);
      arr.push({ date: key, steps: log?.steps || 0, cal: log?.calories || 0 });
    }
    return arr;
  }, [logs]);

  return (
    <div className="mx-auto" style={{ maxWidth: 1000, padding: "100px 24px 80px" }}>
      <section className="mb-8 animate-fade-up">
        <p style={{ color: "#2563EB", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Прогресс
        </p>
        <h1 style={{ fontSize: "clamp(32px,5vw,44px)", fontWeight: 900, letterSpacing: "-0.02em", color: "#0F172A" }}>
          Ежедневный лог
        </h1>
        <p className="text-soft mt-2">Веди дневник, чтобы видеть динамику.</p>
      </section>

      <form onSubmit={save} className="glass-strong animate-fade-up" style={{ padding: 28, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, color: "#0F172A" }}>Сегодня</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label-muted block mb-1.5">Вес (кг)</label>
            <input className="glass-input" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="напр. 78.5" />
          </div>
          <div>
            <label className="label-muted block mb-1.5">Талия (см)</label>
            <input className="glass-input" type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="напр. 84" />
          </div>
          <div>
            <label className="label-muted block mb-1.5">Шаги</label>
            <input className="glass-input" type="number" value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="напр. 8500" />
          </div>
          <div>
            <label className="label-muted block mb-1.5">Калории съедено</label>
            <input className="glass-input" type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="напр. 1800" />
          </div>
          <div className="md:col-span-2">
            <label className="label-muted block mb-1.5">Вода (стаканы)</label>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: 10 }).map((_, i) => {
                const filled = i < water;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setWater(filled && i === water - 1 ? 0 : i + 1)}
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: filled ? "linear-gradient(135deg, #2563EB, #06B6D4)" : "rgba(255,255,255,0.7)",
                      color: filled ? "#fff" : "#475569",
                      border: "1px solid " + (filled ? "transparent" : "rgba(148,163,184,0.4)"),
                      fontWeight: 700, fontSize: 13, cursor: "pointer",
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3" style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,0.65)", border: "1px solid rgba(148,163,184,0.35)" }}>
            <span style={{ fontWeight: 600, color: "#1E293B" }}>Тренировка сегодня?</span>
            <button
              type="button"
              onClick={() => setWorkout((w) => !w)}
              style={{
                padding: "6px 14px", borderRadius: 999, fontWeight: 700, fontSize: 13,
                background: workout ? "linear-gradient(135deg, #16A34A, #22C55E)" : "rgba(148,163,184,0.25)",
                color: workout ? "#fff" : "#475569",
                border: "none", cursor: "pointer",
              }}
            >
              {workout ? "Да 💪" : "Нет"}
            </button>
          </div>
          <div className="flex items-center justify-between gap-3" style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,0.65)", border: "1px solid rgba(148,163,184,0.35)" }}>
            <span style={{ fontWeight: 600, color: "#1E293B" }}>Настроение</span>
            <div className="flex gap-1">
              {["😞", "😐", "🙂", "😊", "🤩"].map((e, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMood(i + 1)}
                  style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: mood === i + 1 ? "rgba(37,99,235,0.2)" : "transparent",
                    border: "1px solid " + (mood === i + 1 ? "rgba(37,99,235,0.5)" : "transparent"),
                    fontSize: 18, cursor: "pointer",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button type="submit" className="btn-primary mt-5"><Plus size={18} /> Сохранить запись</button>
      </form>

      {/* Streak + BMI */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="flex items-center gap-2 mb-2"><Flame size={20} color="#F97316" /><span className="text-soft" style={{ fontSize: 13 }}>Текущий стрик</span></div>
          <p style={{ fontSize: 36, fontWeight: 900, color: "#0F172A" }}>{streak.current} <span style={{ fontSize: 14, color: "#64748B", fontWeight: 600 }}>дн.</span></p>
          <p className="text-soft mt-1" style={{ fontSize: 12 }}>Лучший: {streak.longest} дн.</p>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="flex items-center gap-2 mb-2"><Scale size={20} color="#2563EB" /><span className="text-soft" style={{ fontSize: 13 }}>ИМТ</span></div>
          <p style={{ fontSize: 36, fontWeight: 900, color: bmi.color }}>{bmi.v || "—"}</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: bmi.color }}>{bmi.label}</p>
          <p className="text-soft mt-1" style={{ fontSize: 11 }}>Рост:
            <input
              type="number" value={height}
              onChange={(e) => { const v = +e.target.value; setHeight(v); localStorage.setItem(PROFILE_KEY, JSON.stringify({ height: v })); }}
              style={{ width: 60, marginLeft: 6, padding: "2px 6px", borderRadius: 6, border: "1px solid rgba(148,163,184,0.4)", background: "#fff" }}
            /> см
          </p>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="flex items-center gap-2 mb-2"><Droplets size={20} color="#06B6D4" /><span className="text-soft" style={{ fontSize: 13 }}>Вода сегодня</span></div>
          <p style={{ fontSize: 36, fontWeight: 900, color: "#0F172A" }}>{last?.date === today() ? last.water : 0}<span style={{ fontSize: 14, color: "#64748B", fontWeight: 600 }}> / 10</span></p>
        </div>
      </div>

      {/* Weight chart 14d */}
      <div className="glass-strong" style={{ padding: 28, marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 14 }}>Вес — 14 дней</h3>
        <LineChart data={days14.map((d) => d.w)} labels={days14.map((d) => d.date.slice(8))} color="#2563EB" />
      </div>

      {/* Steps & calories 7d */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass-strong" style={{ padding: 24 }}>
          <div className="flex items-center gap-2 mb-3"><Footprints size={18} color="#7C3AED" /><h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Шаги — 7 дней</h3></div>
          <BarChart data={days7.map((d) => d.steps)} labels={days7.map((d) => d.date.slice(8))} color="#7C3AED" />
        </div>
        <div className="glass-strong" style={{ padding: 24 }}>
          <div className="flex items-center gap-2 mb-3"><Flame size={18} color="#F97316" /><h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Калории — 7 дней</h3></div>
          <BarChart data={days7.map((d) => d.cal)} labels={days7.map((d) => d.date.slice(8))} color="#F97316" />
        </div>
      </div>

      {/* Heatmap */}
      <div className="glass-strong mt-6" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>Активные дни (последние 5 недель)</h3>
        <Heatmap active={streak.active} />
      </div>
    </div>
  );
}

function LineChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const w = 600, h = 160, p = 24;
  const vals = data.map((v) => v || 0);
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals.filter((v) => v > 0), max);
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = p + (i * (w - 2 * p)) / Math.max(1, vals.length - 1);
    const y = v === 0 ? h - p : h - p - ((v - min) / range) * (h - 2 * p);
    return [x, y, v] as const;
  });
  const path = pts.filter((p) => p[2] > 0).map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([x, y, v], i) => v > 0 && <circle key={i} cx={x} cy={y} r={3.5} fill={color} />)}
      {labels.map((l, i) => i % 2 === 0 && (
        <text key={i} x={p + (i * (w - 2 * p)) / Math.max(1, labels.length - 1)} y={h - 4} fontSize={10} textAnchor="middle" fill="#64748B">{l}</text>
      ))}
    </svg>
  );
}

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const w = 320, h = 140, p = 18;
  const max = Math.max(...data, 1);
  const bw = (w - 2 * p) / data.length - 6;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      {data.map((v, i) => {
        const bh = ((v || 0) / max) * (h - 2 * p);
        const x = p + i * ((w - 2 * p) / data.length);
        const y = h - p - bh;
        return <rect key={i} x={x} y={y} width={bw} height={bh} rx={4} fill={color} opacity={v ? 0.85 : 0.2} />;
      })}
      {labels.map((l, i) => (
        <text key={i} x={p + i * ((w - 2 * p) / data.length) + bw / 2} y={h - 4} fontSize={9} textAnchor="middle" fill="#64748B">{l}</text>
      ))}
    </svg>
  );
}

function Heatmap({ active }: { active: Set<string> }) {
  const days = 35;
  const arr: { key: string; on: boolean }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    arr.push({ key, on: active.has(key) });
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
      {arr.map((d) => (
        <div key={d.key} title={d.key}
          style={{
            aspectRatio: "1", borderRadius: 6,
            background: d.on ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "rgba(148,163,184,0.2)",
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        />
      ))}
    </div>
  );
}