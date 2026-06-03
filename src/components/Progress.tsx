import { useEffect, useMemo, useState, useRef } from "react";

type Log = { date: string; weight: number; water: number; workout: boolean };
type QuizEntry = { date: string; score: number; total: number };

function readLogs(): Log[] {
  try { return JSON.parse(localStorage.getItem("fit_logs") || "[]"); } catch { return []; }
}
function readQuiz(): QuizEntry[] {
  try { return JSON.parse(localStorage.getItem("fit_quiz_history") || "[]"); } catch { return []; }
}
function calcStreak(logs: Log[]) {
  const set = new Set(logs.map((l) => l.date));
  let s = 0; const d = new Date();
  while (set.has(d.toISOString().slice(0, 10))) { s++; d.setDate(d.getDate() - 1); }
  return s;
}

interface RankData {
  id: number;
  name: string;
  character: string;
  color: string;
  glowColor: string;
  description: string;
  minXP: number;
  animation: string;
  quote: string;
}

const RANKS: RankData[] = [
  {
    id: 1,
    name: "Beginner",
    character: "👨‍🌾",
    color: "#A0AEC0",
    glowColor: "rgba(160, 174, 192, 0.2)",
    description: "Персонаж только начинает свой путь.",
    minXP: 0,
    animation: "none",
    quote: "Начало — вот самый сложный шаг.",
  },
  {
    id: 2,
    name: "Recruit",
    character: "💂",
    color: "#8B4513",
    glowColor: "rgba(139, 69, 19, 0.4)",
    description: "Входит в ритм тренировок.",
    minXP: 100,
    animation: "shadowPulse",
    quote: "Дисциплина — это выбор каждый день.",
  },
  {
    id: 3,
    name: "Apprentice",
    character: "👨‍🎓",
    color: "#B87333",
    glowColor: "rgba(184, 115, 51, 0.4)",
    description: "Начинает понимать основы.",
    minXP: 250,
    animation: "copperShimmer",
    quote: "Знание приходит через практику.",
  },
  {
    id: 4,
    name: "Athlete",
    character: "⚔️",
    color: "#708090",
    glowColor: "rgba(112, 128, 144, 0.3)",
    description: "Стабилизирует прогресс.",
    minXP: 400,
    animation: "metallicHighlight",
    quote: "Сила строится день за днём.",
  },
  {
    id: 5,
    name: "Veteran",
    character: "🛡️",
    color: "#2F4F4F",
    glowColor: "rgba(47, 79, 79, 0.4)",
    description: "Прошёл через испытания.",
    minXP: 600,
    animation: "cornerGradient",
    quote: "Опыт — лучший учитель.",
  },
  {
    id: 6,
    name: "Master",
    character: "🥷",
    color: "#0066FF",
    glowColor: "rgba(0, 102, 255, 0.6)",
    description: "Научился управлять телом.",
    minXP: 850,
    animation: "blueNeonGlow",
    quote: "Мастер — это тот, кто никогда не бросает.",
  },
  {
    id: 7,
    name: "Pro",
    character: "🏇",
    color: "#FFD700",
    glowColor: "rgba(255, 215, 0, 0.6)",
    description: "Форма стабильно высока.",
    minXP: 1150,
    animation: "goldenGlow",
    quote: "Профессионализм видно издалека.",
  },
  {
    id: 8,
    name: "Elite",
    character: "🔱",
    color: "#00FF64",
    glowColor: "rgba(0, 255, 100, 0.6)",
    description: "Естественный максимум развития.",
    minXP: 1500,
    animation: "greenShimmer",
    quote: "Элита редко, но неизбежно.",
  },
  {
    id: 9,
    name: "Champion",
    character: "🎖️",
    color: "#FF0040",
    glowColor: "rgba(255, 0, 64, 0.6)",
    description: "Достиг и удерживает высоту.",
    minXP: 1900,
    animation: "redPulse",
    quote: "Чемпион — это образ жизни.",
  },
  {
    id: 10,
    name: "Titan",
    character: "👹",
    color: "#0064FF",
    glowColor: "rgba(0, 100, 255, 0.8)",
    description: "Мощь выходит за пределы.",
    minXP: 2400,
    animation: "titanLightning",
    quote: "Титаны не рождаются — они создаются.",
  },
  {
    id: 11,
    name: "Legend",
    character: "🐉",
    color: "#FFB000",
    glowColor: "rgba(255, 176, 0, 0.7)",
    description: "Путь стал примером для других.",
    minXP: 3000,
    animation: "legendStardust",
    quote: "Легенды никогда не забываются.",
  },
  {
    id: 12,
    name: "Myth",
    character: "🌌",
    color: "#FF00FF",
    glowColor: "rgba(255, 0, 255, 0.8)",
    description: "Предел возможного в естественном развитии.",
    minXP: 3600,
    animation: "mythRainbow",
    quote: "Легенды не рождаются — они выживают.",
  },
];

// Pixel art fitness objects
function PixelDumbbell() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ imageRendering: "pixelated" }}>
      <rect x="6" y="14" width="4" height="12" fill="#C0A080" />
      <rect x="10" y="10" width="4" height="20" fill="#8B7355" />
      <rect x="14" y="8" width="12" height="24" fill="#654321" />
      <rect x="26" y="10" width="4" height="20" fill="#8B7355" />
      <rect x="30" y="14" width="4" height="12" fill="#C0A080" />
    </svg>
  );
}

function PixelKettlebell() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ imageRendering: "pixelated" }}>
      <circle cx="20" cy="24" r="8" fill="#2F2F2F" />
      <rect x="18" y="6" width="4" height="16" fill="#654321" />
      <rect x="14" y="8" width="4" height="4" fill="#8B7355" />
      <rect x="22" y="8" width="4" height="4" fill="#8B7355" />
    </svg>
  );
}

function PixelTrophy() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ imageRendering: "pixelated" }}>
      <rect x="8" y="22" width="24" height="4" fill="#FFD700" />
      <rect x="6" y="6" width="8" height="16" fill="#FFD700" />
      <rect x="26" y="6" width="8" height="16" fill="#FFD700" />
      <rect x="14" y="8" width="12" height="14" fill="#FFA500" />
      <rect x="16" y="4" width="8" height="4" fill="#FFD700" />
    </svg>
  );
}

export function Progress() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [quiz, setQuiz] = useState<QuizEntry[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs(readLogs());
    setQuiz(readQuiz());
  }, []);

  const workouts = logs.filter((l) => l.workout).length;
  const streak = useMemo(() => calcStreak(logs), [logs]);
  const quizPasses = quiz.filter((q) => q.score >= 700).length;
  const userXP = workouts * 50 + quizPasses * 100 + streak * 25;

  const currentRankIndex = useMemo(() => {
    let i = 0;
    for (let k = 0; k < RANKS.length; k++) if (userXP >= RANKS[k].minXP) i = k;
    return i;
  }, [userXP]);

  // Smooth scroll to current rank on mount
  const currentNodeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      currentNodeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    return () => clearTimeout(t);
  }, [currentRankIndex]);

  useEffect(() => {
    const handleScroll = () => {
      if (mapRef.current) {
        setScrollY(mapRef.current.scrollTop);
      }
    };
    const el = mapRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const currentRank = RANKS[currentRankIndex];
  const nextRank = currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;
  const progressPercent = nextRank
    ? ((userXP - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100
    : 100;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #EEF4FF 0%, #F5ECFF 100%)", overflow: "hidden" }}>
      {/* ============ STICKY XP BAR ============ */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: `2px solid ${currentRank.glowColor}`,
          zIndex: 1000,
          padding: "12px 24px",
          boxShadow: `0 0 20px ${currentRank.glowColor}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, height: "100%" }}>
            <div style={{ fontSize: 28 }}>{currentRank.character}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>
                {currentRank.name} {nextRank && `→ ${nextRank.name}`}
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(148, 163, 184, 0.2)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${currentRank.color}, ${currentRank.glowColor})`,
                    width: `${progressPercent}%`,
                    transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: `0 0 10px ${currentRank.glowColor}`,
                  }}
                />
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: currentRank.color, minWidth: 100, textAlign: "right" }}>
              {userXP} / {nextRank?.minXP || 9999} XP
            </div>
          </div>
        </div>
      </div>

      {/* ============ COMPACT STATS STRIP (linked to XP) ============ */}
      <div
        style={{
          position: "fixed",
          top: 60,
          left: 0,
          right: 0,
          height: 56,
          zIndex: 999,
          padding: "8px 24px",
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(148,163,184,0.18)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
          {[
            { label: "Тренировки", value: workouts, unit: "×50", icon: "💪", accent: "#2563EB" },
            { label: "Квизы", value: quizPasses, unit: "×100", icon: "🧠", accent: "#7C3AED" },
            { label: "Серия", value: streak, unit: "×25", icon: "🔥", accent: "#F59E0B" },
            { label: "Ранг", value: currentRank.name, unit: "", icon: currentRank.character, accent: currentRank.color },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.7)",
                border: `1px solid ${m.accent}30`,
              }}
            >
              <div style={{ fontSize: 18 }}>{m.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.4 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: m.accent, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {m.value}
                  {m.unit && <span style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", marginLeft: 4 }}>{m.unit} XP</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============ FULLSCREEN PROGRESSION MAP ============ */}
      <div
        ref={mapRef}
        style={{
          marginTop: 116,
          height: "calc(100vh - 116px)",
          overflow: "auto",
          position: "relative",
          perspective: "1400px",
          perspectiveOrigin: "50% 0%",
          scrollBehavior: "smooth",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(167,243,208,0.35) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 50% 100%, rgba(196,181,253,0.3) 0%, transparent 60%), linear-gradient(180deg, #F0F7FF 0%, #F5ECFF 100%)",
        }}
      >
        {/* Background parallax effect */}
        <div
          style={{
            position: "fixed",
            top: 116,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 50% 40%, rgba(37, 99, 235, 0.05) 0%, transparent 60%)",
            pointerEvents: "none",
            transform: `translateY(${scrollY * 0.5}px)`,
            zIndex: 0,
          }}
        />

        {/* Floating particles */}
        <div style={{ position: "fixed", top: 60, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 1 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: `${60 + Math.random() * window.innerHeight}px`,
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: `rgba(37, 99, 235, ${0.1 + Math.random() * 0.2})`,
                animation: `float ${6 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Main Map Content — isometric tilt */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            padding: "80px 40px 200px",
            transform: "rotateX(8deg)",
            transformOrigin: "50% 0%",
            transformStyle: "preserve-3d",
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
            {/* Animated SVG Road */}
            <svg
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                width: 240,
                height: `${120 * RANKS.length}px`,
                transform: "translateX(-50%)",
                pointerEvents: "none",
                zIndex: 2,
              }}
              viewBox="0 0 200 2000"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="roadShimmer" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <linearGradient id="roadEdge" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C7D2FE" />
                  <stop offset="50%" stopColor="#A5B4FC" />
                  <stop offset="100%" stopColor="#DDD6FE" />
                </linearGradient>
                <linearGradient id="roadAsphalt" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#EEF2FF" />
                  <stop offset="50%" stopColor="#F8FAFF" />
                  <stop offset="100%" stopColor="#F5F3FF" />
                </linearGradient>
                <filter id="roadShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1E293B" floodOpacity="0.10"/>
                </filter>
              </defs>
              {/* Road edge (outer) */}
              <path
                d="M 100 50 Q 150 120 100 200 Q 50 280 100 360 Q 150 440 100 520 Q 50 600 100 680 Q 150 760 100 840 Q 50 920 100 1000 Q 150 1080 100 1160 Q 50 1240 100 1320 Q 150 1400 100 1480 Q 50 1560 100 1640 Q 150 1720 100 1800"
                fill="none"
                stroke="url(#roadEdge)"
                strokeWidth="64"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#roadShadow)"
              />
              {/* Asphalt surface */}
              <path
                d="M 100 50 Q 150 120 100 200 Q 50 280 100 360 Q 150 440 100 520 Q 50 600 100 680 Q 150 760 100 840 Q 50 920 100 1000 Q 150 1080 100 1160 Q 50 1240 100 1320 Q 150 1400 100 1480 Q 50 1560 100 1640 Q 150 1720 100 1800"
                fill="none"
                stroke="url(#roadAsphalt)"
                strokeWidth="50"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Center dashed lane */}
              <path
                d="M 100 50 Q 150 120 100 200 Q 50 280 100 360 Q 150 440 100 520 Q 50 600 100 680 Q 150 760 100 840 Q 50 920 100 1000 Q 150 1080 100 1160 Q 50 1240 100 1320 Q 150 1400 100 1480 Q 50 1560 100 1640 Q 150 1720 100 1800"
                fill="none"
                stroke={currentRank.color}
                strokeOpacity="0.5"
                strokeWidth="3"
                strokeDasharray="14,18"
                strokeLinecap="round"
              />
              {/* Animated shimmer overlay */}
              <path
                d="M 100 50 Q 150 120 100 200 Q 50 280 100 360 Q 150 440 100 520 Q 50 600 100 680 Q 150 760 100 840 Q 50 920 100 1000 Q 150 1080 100 1160 Q 50 1240 100 1320 Q 150 1400 100 1480 Q 50 1560 100 1640 Q 150 1720 100 1800"
                fill="none"
                stroke="url(#roadShimmer)"
                strokeWidth="50"
                strokeDasharray="120,1880"
                strokeDashoffset="100"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: "roadShimmer 6s linear infinite",
                  mixBlendMode: "overlay",
                }}
              />
            </svg>

            {/* Rank Nodes */}
            {RANKS.map((rank, idx) => {
              const isCurrentRank = idx === currentRankIndex;
              const isUnlocked = idx <= currentRankIndex;
              const isLeft = idx % 2 === 0;

              return (
                <div
                  key={rank.id}
                  ref={isCurrentRank ? currentNodeRef : undefined}
                  style={{
                    position: "relative",
                    marginBottom: 80,
                    display: "flex",
                    justifyContent: isLeft ? "flex-start" : "flex-end",
                    paddingLeft: isLeft ? 0 : 120,
                    paddingRight: isLeft ? 120 : 0,
                    opacity: 1,
                  }}
                >
                  {/* Node Card */}
                  <div
                    className={`rank-card rank-${rank.id} ${isCurrentRank ? "current" : ""} ${isUnlocked ? "unlocked" : "locked"}`}
                    style={{
                      width: 200,
                      textAlign: "center",
                      position: "relative",
                      animation: isCurrentRank ? "nodeBob 3s ease-in-out infinite" : undefined,
                      filter: !isUnlocked ? "grayscale(100%) blur(2px)" : undefined,
                      opacity: !isUnlocked ? 0.5 : 1,
                    }}
                  >
                    {/* Isometric ground platform */}
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: -22,
                        transform: "translateX(-50%) rotateX(70deg)",
                        width: 170,
                        height: 50,
                        borderRadius: "50%",
                        background: isUnlocked
                          ? `radial-gradient(ellipse at center, ${rank.glowColor} 0%, transparent 70%)`
                          : "radial-gradient(ellipse at center, rgba(148,163,184,0.25) 0%, transparent 70%)",
                        filter: "blur(2px)",
                        pointerEvents: "none",
                        zIndex: 0,
                      }}
                    />

                    {/* Pulsing aura ring on current */}
                    {isCurrentRank && (
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 230,
                          height: 230,
                          borderRadius: "50%",
                          border: `2px solid ${rank.color}`,
                          opacity: 0.35,
                          animation: "auraPulse 2.4s ease-in-out infinite",
                          pointerEvents: "none",
                          zIndex: 0,
                        }}
                      />
                    )}

                    {/* Lock Icon */}
                    {!isUnlocked && (
                      <div style={{ position: "absolute", top: 10, right: 10, fontSize: 20, opacity: 0.7, zIndex: 20 }}>
                        🔒
                      </div>
                    )}

                    {/* Pixel art object */}
                    <div
                      style={{
                        height: 72,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                        transform: "scale(1.4)",
                        filter: isUnlocked ? `drop-shadow(0 4px 6px ${rank.glowColor})` : undefined,
                        animation:
                          idx % 3 === 0
                            ? "dumbbell-rock 2s ease-in-out infinite"
                            : idx % 3 === 1
                            ? "kettlebell-bounce 2s ease-in-out infinite"
                            : "trophy-shimmer 3s ease-in-out infinite",
                      }}
                    >
                      {idx % 3 === 0 && <PixelDumbbell />}
                      {idx % 3 === 1 && <PixelKettlebell />}
                      {idx % 3 === 2 && <PixelTrophy />}
                    </div>

                    {/* Rank Card */}
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        background: isUnlocked ? "rgba(255, 255, 255, 0.85)" : "rgba(200, 200, 200, 0.3)",
                        backdropFilter: "blur(12px)",
                        border: `2px solid ${rank.glowColor}`,
                        boxShadow: isCurrentRank
                          ? `0 0 30px ${rank.glowColor}, inset 0 0 20px ${rank.glowColor}`
                          : isUnlocked
                          ? `0 4px 15px ${rank.glowColor}`
                          : "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Character emoji with idle animation */}
                      <div
                        style={{
                          fontSize: 40,
                          marginBottom: 8,
                          filter: isUnlocked ? `drop-shadow(0 0 8px ${rank.glowColor})` : "grayscale(100%)",
                          animation: "character-idle 3s ease-in-out infinite",
                        }}
                      >
                        {rank.character}
                      </div>

                      {/* Rank name */}
                      <h3
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: isUnlocked ? rank.color : "#94A3B8",
                          marginBottom: 8,
                        }}
                      >
                        {rank.name}
                      </h3>

                      {/* Progress bar with animation */}
                      <div
                        style={{
                          height: 4,
                          borderRadius: 2,
                          background: "rgba(148, 163, 184, 0.2)",
                          overflow: "hidden",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            background: `linear-gradient(90deg, ${rank.color}, ${rank.glowColor})`,
                            width: isCurrentRank ? `${progressPercent}%` : isUnlocked ? "100%" : "0%",
                            transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                      </div>

                      {/* Quote with fade-in */}
                      <p
                        style={{
                          fontSize: 11,
                          fontStyle: "italic",
                          color: "#475569",
                          marginBottom: 12,
                          animation: "fadeInDelay 1s ease-out 0.3s both",
                          lineHeight: 1.4,
                        }}
                      >
                        "{rank.quote}"
                      </p>

                      {/* Continue button for current rank */}
                      {isCurrentRank && (
                        <button
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 8,
                            background: `linear-gradient(135deg, ${rank.color}, ${rank.glowColor})`,
                            border: "none",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: "pointer",
                            boxShadow: `0 0 12px ${rank.glowColor}`,
                            animation: "shimmerSweep 3s ease-in-out infinite",
                          }}
                        >
                          Continue →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============ GLOBAL ANIMATIONS ============ */}
      <style>{`
        @keyframes nodeBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes auraPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.15; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.45; }
        }

        @keyframes dumbbell-rock {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        @keyframes kettlebell-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes trophy-shimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }

        @keyframes character-idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes roadShimmer {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: -1900; }
        }

        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-200px) translateX(20px); opacity: 0; }
        }

        @keyframes shimmerSweep {
          0%, 100% { background-position: -200% 0; }
          50% { background-position: 200% 0; }
        }

        @keyframes fadeInDelay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .rank-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .rank-card:hover {
          transform: translateY(-8px);
        }

        svg {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  );
}
