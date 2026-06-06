// Shared progression / rank / XP system used by both the Progress map
// and the Games arena. Single source of truth.

export interface RankData {
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

export const RANKS: RankData[] = [
  { id: 1, name: "Новичок", character: "👨‍🌾", color: "#A0AEC0", glowColor: "rgba(160, 174, 192, 0.35)", description: "Персонаж только начинает свой путь.", minXP: 0, animation: "none", quote: "Начало — вот самый сложный шаг." },
  { id: 2, name: "Рекрут", character: "💂", color: "#8B4513", glowColor: "rgba(139, 69, 19, 0.45)", description: "Входит в ритм тренировок.", minXP: 100, animation: "shadowPulse", quote: "Дисциплина — это выбор каждый день." },
  { id: 3, name: "Ученик", character: "👨‍🎓", color: "#B87333", glowColor: "rgba(184, 115, 51, 0.45)", description: "Начинает понимать основы.", minXP: 250, animation: "copperShimmer", quote: "Знание приходит через практику." },
  { id: 4, name: "Атлет", character: "⚔️", color: "#708090", glowColor: "rgba(112, 128, 144, 0.45)", description: "Стабилизирует прогресс.", minXP: 400, animation: "metallicHighlight", quote: "Сила строится день за днём." },
  { id: 5, name: "Ветеран", character: "🛡️", color: "#2F4F4F", glowColor: "rgba(47, 79, 79, 0.5)", description: "Прошёл через испытания.", minXP: 600, animation: "cornerGradient", quote: "Опыт — лучший учитель." },
  { id: 6, name: "Мастер", character: "🥷", color: "#0066FF", glowColor: "rgba(0, 102, 255, 0.6)", description: "Научился управлять телом.", minXP: 850, animation: "blueNeonGlow", quote: "Мастер — это тот, кто никогда не бросает." },
  { id: 7, name: "Профи", character: "🏇", color: "#FFD700", glowColor: "rgba(255, 215, 0, 0.6)", description: "Форма стабильно высока.", minXP: 1150, animation: "goldenGlow", quote: "Профессионализм видно издалека." },
  { id: 8, name: "Элита", character: "🔱", color: "#00C853", glowColor: "rgba(0, 255, 100, 0.6)", description: "Естественный максимум развития.", minXP: 1500, animation: "greenShimmer", quote: "Элита редко, но неизбежно." },
  { id: 9, name: "Чемпион", character: "🎖️", color: "#FF0040", glowColor: "rgba(255, 0, 64, 0.6)", description: "Достиг и удерживает высоту.", minXP: 1900, animation: "redPulse", quote: "Чемпион — это образ жизни." },
  { id: 10, name: "Титан", character: "👹", color: "#0064FF", glowColor: "rgba(0, 100, 255, 0.7)", description: "Мощь выходит за пределы.", minXP: 2400, animation: "titanLightning", quote: "Титаны не рождаются — они создаются." },
  { id: 11, name: "Легенда", character: "🐉", color: "#FFB000", glowColor: "rgba(255, 176, 0, 0.7)", description: "Путь стал примером для других.", minXP: 3000, animation: "legendStardust", quote: "Легенды никогда не забываются." },
  { id: 12, name: "Миф", character: "🌌", color: "#FF00FF", glowColor: "rgba(255, 0, 255, 0.75)", description: "Предел возможного в естественном развитии.", minXP: 3600, animation: "mythRainbow", quote: "Легенды не рождаются — они выживают." },
];

type Log = { date: string };
type QuizEntry = { date: string; score: number; total: number };
type MinigameEntry = { date: string; game: string; score: number; xp: number };

function readJSON<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

export function computeXP() {
  const logs = readJSON<Log[]>("fit_logs", []);
  const quizzes = readJSON<QuizEntry[]>("fit_quiz_history", []);
  const minigames = readJSON<MinigameEntry[]>("fit_minigame_history", []);
  const bonus = Number(localStorage.getItem("fit_xp_bonus") || "0");

  const workouts = logs.length;
  const quizPasses = quizzes.filter((q) => q.score >= 700).length;
  const minigamesPlayed = minigames.length;
  const minigameXP = minigames.reduce((s, m) => s + m.xp, 0);

  // streak by distinct days
  const days = Array.from(new Set(logs.map((l) => l.date.slice(0, 10)))).sort().reverse();
  let streak = 0;
  const cur = new Date();
  for (const d of days) {
    const dd = new Date(d);
    if (Math.round((cur.getTime() - dd.getTime()) / 86400000) === streak) streak++;
    else break;
  }

  const totalXP = workouts * 50 + quizPasses * 100 + streak * 25 + minigameXP + bonus;
  return { workouts, quizPasses, streak, minigamesPlayed, minigameXP, bonus, totalXP };
}

export function getRank(xp: number) {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].minXP) index = i;
  const cur = RANKS[index];
  const next = index < RANKS.length - 1 ? RANKS[index + 1] : null;
  const pct = next
    ? Math.max(0, Math.min(100, Math.round(((xp - cur.minXP) / (next.minXP - cur.minXP)) * 100)))
    : 100;
  return { cur, next, pct, index };
}