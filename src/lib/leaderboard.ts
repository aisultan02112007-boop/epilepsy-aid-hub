// Fake weekly global leaderboard. Seeded by ISO week number.
const POOL = [
  { name: "Аружан Strong", flag: "🇰🇿" },
  { name: "Дмитрий Iron", flag: "🇷🇺" },
  { name: "Aigerim Fit", flag: "🇰🇿" },
  { name: "Sofia Lift", flag: "🇩🇪" },
  { name: "Lucas Beast", flag: "🇧🇷" },
  { name: "Айдар Muscle", flag: "🇰🇿" },
  { name: "Олег Power", flag: "🇷🇺" },
  { name: "Emma Cardio", flag: "🇺🇸" },
  { name: "Yuki Squat", flag: "🇯🇵" },
  { name: "Hiroshi Press", flag: "🇯🇵" },
  { name: "Madina Flex", flag: "🇰🇿" },
  { name: "Алина Run", flag: "🇷🇺" },
  { name: "Carlos Gains", flag: "🇪🇸" },
  { name: "Chloé Pulse", flag: "🇫🇷" },
  { name: "Erlan Athlete", flag: "🇰🇿" },
  { name: "Liam Shred", flag: "🇮🇪" },
  { name: "Сергей Pump", flag: "🇷🇺" },
  { name: "Динара Cut", flag: "🇰🇿" },
];

function getWeek(d: Date) {
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = (d.getTime() - start.getTime()) / 86400000;
  return Math.floor((diff + start.getDay() + 1) / 7);
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function getWeeklyLeaderboard(userName: string, userScore: number) {
  const now = new Date();
  const week = getWeek(now) + now.getFullYear() * 100;
  const rand = seeded(week);
  const picked = [...POOL].sort(() => rand() - 0.5).slice(0, 10);
  const board = picked.map((p) => ({
    name: p.name,
    flag: p.flag,
    score: 700 + Math.floor(rand() * 300),
    me: false,
  }));
  // insert user if any score
  if (userScore > 0) {
    board.push({ name: userName || "Вы", flag: "👤", score: userScore, me: true });
  }
  board.sort((a, b) => b.score - a.score);
  return board.slice(0, 11);
}
