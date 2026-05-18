// Fake weekly global leaderboard. Seeded by ISO week number.
const POOL = [
  { name: "Аружан Сарсенова", flag: "🇰🇿" },
  { name: "Дмитрий Иванов", flag: "🇷🇺" },
  { name: "Aigerim Bekova", flag: "🇰🇿" },
  { name: "Sofia Müller", flag: "🇩🇪" },
  { name: "Lucas Silva", flag: "🇧🇷" },
  { name: "Айдар Жумабаев", flag: "🇰🇿" },
  { name: "Олег Кузнецов", flag: "🇷🇺" },
  { name: "Emma Johnson", flag: "🇺🇸" },
  { name: "Yuki Tanaka", flag: "🇯🇵" },
  { name: "Hiroshi Sato", flag: "🇯🇵" },
  { name: "Madina Tursunova", flag: "🇰🇿" },
  { name: "Алина Петрова", flag: "🇷🇺" },
  { name: "Carlos Ruiz", flag: "🇪🇸" },
  { name: "Chloé Martin", flag: "🇫🇷" },
  { name: "Erlan Nurlan", flag: "🇰🇿" },
  { name: "Liam O'Connor", flag: "🇮🇪" },
  { name: "Сергей Смирнов", flag: "🇷🇺" },
  { name: "Динара Ауэзова", flag: "🇰🇿" },
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
