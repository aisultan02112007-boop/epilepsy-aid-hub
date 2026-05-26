import { useEffect, useState, useMemo } from "react";
import { Scale, Ruler, Activity } from "lucide-react";

type Log = {
  date: string;
  weight: number;
  waist: number;
  steps: number;
  water: number;
  calories: number;
  workout: boolean;
  mood: number;
};

const KEY = "fit_logs";
const PROFILE_KEY = "fit_profile";

function read(): Log[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function bmiInfo(w: number, hCm: number) {
  if (!w || !hCm) return { v: 0, label: "—", color: "#94A3B8" };
  const h = hCm / 100;
  const v = +(w / (h * h)).toFixed(1);
  if (v < 18.5) return { v, label: "Недостаточный вес", color: "#60A5FA" };
  if (v < 25) return { v, label: "Норма", color: "#16A34A" };
  if (v < 30) return { v, label: "Избыточный вес", color: "#F59E0B" };
  return { v, label: "Ожирение", color: "#DC2626" };
}

interface RankData {
  id: number;
  name: string;
  character: string;
  color: string;
  glowColor: string;
  description: string;
  minXP: number;
  icon: string;
}

const RANKS: RankData[] = [
  {
    id: 1,
    name: "Beginner",
    character: "👨‍🌾",
    color: "#A0AEC0",
    glowColor: "rgba(160, 174, 192, 0.3)",
    description: "Персонаж только начинает свой путь. Тело быстро устаёт, техника ещё не выстроена.",
    minXP: 0,
    icon: "🏠",
  },
  {
    id: 2,
    name: "Recruit",
    character: "💂",
    color: "#8B4513",
    glowColor: "rgba(139, 69, 19, 0.4)",
    description: "Персонаж входит в ритм тренировок. Появляется привычка к нагрузке.",
    minXP: 100,
    icon: "⚔️",
  },
  {
    id: 3,
    name: "Apprentice",
    character: "👨‍🎓",
    color: "#B87333",
    glowColor: "rgba(184, 115, 51, 0.4)",
    description: "Персонаж начинает понимать основы. Тренировки становятся осознанными.",
    minXP: 250,
    icon: "📚",
  },
  {
    id: 4,
    name: "Athlete",
    character: "⚔️",
    color: "#708090",
    glowColor: "rgba(112, 128, 144, 0.3)",
    description: "Персонаж стабилизирует прогресс. Тело становится сильнее и выносливее.",
    minXP: 400,
    icon: "💪",
  },
  {
    id: 5,
    name: "Veteran",
    character: "🛡️",
    color: "#2F4F4F",
    glowColor: "rgba(47, 79, 79, 0.4)",
    description: "Ветеран — тот, кто прошёл через периоды лени и застоя.",
    minXP: 600,
    icon: "🏆",
  },
  {
    id: 6,
    name: "Master",
    character: "🥷",
    color: "#C0C0C0",
    glowColor: "rgba(0, 102, 255, 0.5)",
    description: "Мастер — тот, кто научился управлять телом и контролировать нагрузку.",
    minXP: 850,
    icon: "🎯",
  },
  {
    id: 7,
    name: "Pro",
    character: "🏇",
    color: "#FFD700",
    glowColor: "rgba(255, 215, 0, 0.5)",
    description: "Профи — чья форма стабильно высока. Подход системный и выверенный.",
    minXP: 1150,
    icon: "👑",
  },
  {
    id: 8,
    name: "Elite",
    character: "🔱",
    color: "#E5E4E2",
    glowColor: "rgba(0, 255, 100, 0.5)",
    description: "Элита — тот, кто довёл своё тело до максимума естественного развития.",
    minXP: 1500,
    icon: "💎",
  },
  {
    id: 9,
    name: "Champion",
    character: "🎖️",
    color: "#8B0000",
    glowColor: "rgba(255, 0, 0, 0.5)",
    description: "Чемпион — тот, кто достиг высокой формы и научился её удерживать.",
    minXP: 1900,
    icon: "🌟",
  },
  {
    id: 10,
    name: "Titan",
    character: "👹",
    color: "#1a1a3a",
    glowColor: "rgba(0, 100, 255, 0.6)",
    description: "Титан — чья физическая мощь выходит за рамки обычного зала.",
    minXP: 2400,
    icon: "⚡",
  },
  {
    id: 11,
    name: "Legend",
    character: "🐉",
    color: "#2d1b4e",
    glowColor: "rgba(255, 215, 0, 0.6)",
    description: "Легендарный уровень — тот, чей путь стал примером для других.",
    minXP: 3000,
    icon: "🔥",
  },
  {
    id: 12,
    name: "Myth",
    character: "🌌",
    color: "conic-gradient(from 0deg, #ff0080, #00ffff, #ff0080)",
    glowColor: "rgba(255, 0, 255, 0.6)",
    description: "Мифический уровень — тот, кто достиг предела возможного.",
    minXP: 3600,
    icon: "✨",
  },
];

export function Progress() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [height, setHeight] = useState(170);
  const [userXP, setUserXP] = useState(450);
  const [currentRankIndex, setCurrentRankIndex] = useState(3);

  useEffect(() => {
    setLogs(read());
    try {
      const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
      if (p?.height) setHeight(p.height);
    } catch {}
  }, []);

  const last = logs[0];
  const bmi = useMemo(() => bmiInfo(last?.weight || 0, height), [last, height]);

  const currentRank = RANKS[currentRankIndex];
  const nextRank = currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;
  const progressPercent = nextRank
    ? ((userXP - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100
    : 100;

  return (
    <div style={{ minHeight: "100vh", padding: "100px 0 80px", background: "linear-gradient(180deg, #EEF4FF 0%, #F5ECFF 100%)" }}>
      {/* ============ COMPACT DASHBOARD HEADER ============ */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", marginBottom: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {/* Weight Card */}
          <div
            className="glass-card"
            style={{
              padding: 24,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.85)",
              borderRadius: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <Scale size={20} color="#2563EB" style={{ marginRight: 8 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>Вес</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 900, color: "#0F172A" }}>
              {last?.weight || "—"} <span style={{ fontSize: 14, color: "#94A3B8" }}>кг</span>
            </p>
          </div>

          {/* Height Card */}
          <div
            className="glass-card"
            style={{
              padding: 24,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.85)",
              borderRadius: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <Ruler size={20} color="#7C3AED" style={{ marginRight: 8 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>Рост</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 900, color: "#0F172A" }}>
              {height} <span style={{ fontSize: 14, color: "#94A3B8" }}>см</span>
            </p>
            <input
              type="number"
              value={height}
              onChange={(e) => {
                const v = +e.target.value;
                setHeight(v);
                localStorage.setItem(PROFILE_KEY, JSON.stringify({ height: v }));
              }}
              style={{
                width: 80,
                marginTop: 8,
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid rgba(148, 163, 184, 0.4)",
                background: "#fff",
                fontSize: 12,
              }}
            />
          </div>

          {/* BMI Card */}
          <div
            className="glass-card"
            style={{
              padding: 24,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.85)",
              borderRadius: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <Activity size={20} color={bmi.color} style={{ marginRight: 8 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>BMI</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 900, color: bmi.color }}>{bmi.v || "—"}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: bmi.color, marginTop: 4 }}>{bmi.label}</p>
          </div>
        </div>
      </div>

      {/* ============ RPG PROGRESSION MAP ============ */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#0F172A", marginBottom: 8 }}>Progression Journey</h1>
          <p style={{ color: "#475569", fontSize: 14 }}>Advance through 12 ranks and become a fitness legend</p>
        </div>

        {/* Progression Map Container */}
        <div
          style={{
            position: "relative",
            minHeight: "1400px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(220,200,255,0.2) 100%)",
            borderRadius: 24,
            border: "2px solid rgba(255,255,255,0.6)",
            padding: 40,
            overflow: "hidden",
          }}
        >
          {/* Winding Road Path */}
          <svg
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            viewBox="0 0 400 1400"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(37, 99, 235, 0.15)" />
                <stop offset="100%" stopColor="rgba(124, 58, 237, 0.15)" />
              </linearGradient>
            </defs>
            {/* Curved winding road */}
            <path
              d="M 100 50 Q 150 120 100 200 Q 50 280 100 360 Q 150 440 100 520 Q 50 600 100 680 Q 150 760 100 840 Q 50 920 100 1000 Q 150 1080 100 1160"
              fill="none"
              stroke="url(#roadGradient)"
              strokeWidth="60"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Road line separators */}
            <path
              d="M 100 50 Q 150 120 100 200 Q 50 280 100 360 Q 150 440 100 520 Q 50 600 100 680 Q 150 760 100 840 Q 50 920 100 1000 Q 150 1080 100 1160"
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="2"
              strokeDasharray="20,10"
              strokeLinecap="round"
            />
          </svg>

          {/* Rank Nodes */}
          <div style={{ position: "relative", zIndex: 10 }}>
            {RANKS.map((rank, idx) => {
              const isCurrentRank = idx === currentRankIndex;
              const isUnlocked = idx <= currentRankIndex;
              const yOffset = idx * 110;

              return (
                <div
                  key={rank.id}
                  style={{
                    position: "absolute",
                    top: `${50 + yOffset}px`,
                    left: idx % 2 === 0 ? "20%" : "60%",
                    transition: "all 0.3s ease",
                    opacity: 1,
                  }}
                >
                  {/* Rank Card */}
                  <div
                    style={{
                      width: 220,
                      padding: 16,
                      borderRadius: 14,
                      background: isUnlocked ? `rgba(255, 255, 255, 0.8)` : `rgba(200, 200, 200, 0.3)`,
                      backdropFilter: "blur(12px)",
                      border: `2px solid ${isUnlocked ? rank.glowColor : "rgba(148, 163, 184, 0.2)"}`,
                      boxShadow: isCurrentRank
                        ? `0 0 30px ${rank.glowColor}, inset 0 0 20px ${rank.glowColor}`
                        : isUnlocked
                        ? `0 4px 15px ${rank.glowColor}`
                        : "0 2px 8px rgba(0,0,0,0.1)",
                      textAlign: "center",
                      cursor: isUnlocked ? "pointer" : "default",
                      transform: isCurrentRank ? "scale(1.08)" : "scale(1)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {/* Lock Icon */}
                    {!isUnlocked && (
                      <div
                        style={{
                          fontSize: 24,
                          marginBottom: 8,
                          filter: "drop-shadow(0 0 4px rgba(100,100,100,0.5))",
                        }}
                      >
                        🔒
                      </div>
                    )}

                    {/* Character */}
                    <div
                      style={{
                        fontSize: 40,
                        marginBottom: 8,
                        filter: isUnlocked ? `drop-shadow(0 0 8px ${rank.glowColor})` : "grayscale(100%)",
                      }}
                    >
                      {rank.character}
                    </div>

                    {/* Rank Name */}
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: isUnlocked ? rank.color : "#94A3B8",
                        marginBottom: 4,
                      }}
                    >
                      {rank.name}
                    </h3>

                    {/* XP Progress */}
                    <div style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 3,
                          background: "rgba(148, 163, 184, 0.2)",
                          overflow: "hidden",
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            background: `linear-gradient(90deg, ${rank.color}, ${rank.glowColor})`,
                            width: isCurrentRank ? `${progressPercent}%` : isUnlocked ? "100%" : "0%",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                      <p style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>
                        {isCurrentRank ? `${userXP} / ${nextRank?.minXP || 9999} XP` : isUnlocked ? "✓ Complete" : "Locked"}
                      </p>
                    </div>

                    {/* Current Rank Button */}
                    {isCurrentRank && (
                      <button
                        onClick={() => alert(`Continue with ${rank.name}!`)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: `linear-gradient(135deg, ${rank.color}, ${rank.glowColor})`,
                          border: "none",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 11,
                          cursor: "pointer",
                          boxShadow: `0 0 12px ${rank.glowColor}`,
                        }}
                      >
                        Continue →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Rank Details */}
        {currentRank && (
          <div
            className="glass-strong"
            style={{
              marginTop: 40,
              padding: 32,
              borderRadius: 20,
              background: "rgba(255, 255, 255, 0.75)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 24, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 60, marginBottom: 8, filter: `drop-shadow(0 0 12px ${currentRank.glowColor})` }}>
                  {currentRank.character}
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: currentRank.color }}>{currentRank.name}</p>
              </div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>
                  {currentRank.name} Journey
                </h2>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>
                  {currentRank.description}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", marginBottom: 12 }}>
                  Current XP: {userXP} {nextRank && `/ ${nextRank.minXP}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
