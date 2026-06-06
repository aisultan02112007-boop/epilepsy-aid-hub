import { useEffect, useMemo, useState, useRef } from "react";
import { RANKS, computeXP } from "@/lib/progression";
import type { ViewKey } from "./Navbar";

// ===== Crisp RPG-style SVG icons (anti-aliased, no pixelation) =====
function RPGDumbbell({ color = "#475569", accent = "#0F172A" }: { color?: string; accent?: string }) {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="dbMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
      </defs>
      <rect x="4" y="22" width="6" height="20" rx="2" fill="url(#dbMetal)" />
      <rect x="10" y="16" width="8" height="32" rx="3" fill="url(#dbMetal)" />
      <rect x="18" y="28" width="28" height="8" rx="2" fill="url(#dbMetal)" />
      <rect x="46" y="16" width="8" height="32" rx="3" fill="url(#dbMetal)" />
      <rect x="54" y="22" width="6" height="20" rx="2" fill="url(#dbMetal)" />
      <rect x="18" y="30" width="28" height="2" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}
function RPGKettlebell({ color = "#1E293B", accent = "#0F172A" }: { color?: string; accent?: string }) {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <radialGradient id="kbBody" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="60%" stopColor={color} />
          <stop offset="100%" stopColor={accent} />
        </radialGradient>
      </defs>
      <path d="M22 14 Q22 8 32 8 Q42 8 42 14 L42 22 L22 22 Z" fill="none" stroke="#334155" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="32" cy="40" r="18" fill="url(#kbBody)" />
      <ellipse cx="26" cy="34" rx="4" ry="2" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}
function RPGBarbell({ color = "#334155" }: { color?: string }) {
  return (
    <svg width="60" height="56" viewBox="0 0 72 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="bbBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
      <rect x="2" y="28" width="68" height="6" rx="2" fill="url(#bbBar)" />
      <rect x="8" y="18" width="8" height="26" rx="2" fill={color} />
      <rect x="16" y="22" width="4" height="18" rx="1" fill={color} />
      <rect x="52" y="22" width="4" height="18" rx="1" fill={color} />
      <rect x="56" y="18" width="8" height="26" rx="2" fill={color} />
    </svg>
  );
}
function RPGTrophy({ color = "#FFB000", accent = "#FF6F00" }: { color?: string; accent?: string }) {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="trGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFEB99" />
          <stop offset="60%" stopColor={color} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
      </defs>
      <path d="M18 10 H46 V24 Q46 36 32 36 Q18 36 18 24 Z" fill="url(#trGold)" stroke="#B45309" strokeWidth="1.5" />
      <path d="M18 14 Q8 14 8 22 Q8 28 18 30" fill="none" stroke="url(#trGold)" strokeWidth="4" strokeLinecap="round" />
      <path d="M46 14 Q56 14 56 22 Q56 28 46 30" fill="none" stroke="url(#trGold)" strokeWidth="4" strokeLinecap="round" />
      <rect x="26" y="36" width="12" height="8" fill="url(#trGold)" />
      <rect x="20" y="44" width="24" height="6" rx="2" fill="url(#trGold)" stroke="#B45309" strokeWidth="1" />
      <path d="M26 16 Q30 22 32 20" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function RankIcon({ idx, color, accent }: { idx: number; color: string; accent: string }) {
  const mod = idx % 4;
  if (mod === 0) return <RPGDumbbell color={color} accent={accent} />;
  if (mod === 1) return <RPGKettlebell color={color} accent={accent} />;
  if (mod === 2) return <RPGBarbell color={color} />;
  return <RPGTrophy color={color} accent={accent} />;
}

interface ProgressProps {
  onNavigate?: (view: ViewKey) => void;
}

export function Progress({ onNavigate }: ProgressProps = {}) {
  const [stats, setStats] = useState(() => computeXP());

  useEffect(() => {
    setStats(computeXP());
    const onFocus = () => setStats(computeXP());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const { workouts, quizPasses, streak, totalXP: userXP } = stats;

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
        style={{
          marginTop: 116,
          height: "calc(100vh - 116px)",
          overflow: "auto",
          position: "relative",
          scrollBehavior: "smooth",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(167,243,208,0.35) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 50% 100%, rgba(196,181,253,0.3) 0%, transparent 60%), linear-gradient(180deg, #F0F7FF 0%, #F5ECFF 100%)",
        }}
      >
        {/* Main Map Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            padding: "80px 40px 200px",
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

                    {/* RPG icon */}
                    <div
                      style={{
                        height: 72,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                        filter: isUnlocked ? `drop-shadow(0 6px 10px ${rank.glowColor})` : undefined,
                        animation: isCurrentRank ? "iconBob 2.4s ease-in-out infinite" : undefined,
                      }}
                    >
                      <RankIcon idx={idx} color={rank.color} accent={rank.color} />
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
