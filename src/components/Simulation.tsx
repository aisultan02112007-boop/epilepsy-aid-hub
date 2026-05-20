import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2, XCircle, RefreshCw, Lightbulb, Trophy, Loader2, MapPin, Medal,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getWeeklyLeaderboard } from "@/lib/leaderboard";

type Option = { text: string; correct: boolean; explanation: string };
type Question = { question: string; hint: string; scenario: string; options: Option[] };
type Quiz = { questions: Question[] };

type ScoreEntry = { date: string; score: number; total: number };
const HISTORY_KEY = "epi_sim_history";

function readHistory(): ScoreEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function pushHistory(e: ScoreEntry) {
  const next = [e, ...readHistory()].slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

const MAX_POINTS = 1000;
const PASS = 700;

export function Simulation() {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef<number>(Date.now());

  const fetchQuiz = async () => {
    setLoading(true); setError(null); setQuiz(null);
    setIdx(0); setSelected(null); setHintShown(false); setScore(0); setFinished(false);
    startedAt.current = Date.now();
    try {
      const res = await fetch("/api/public/simulation", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      setQuiz((await res.json()) as Quiz);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить вопросы.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQuiz(); }, []);

  const q = quiz?.questions[idx];
  const total = quiz?.questions.length || 10;
  const isLast = idx === total - 1;
  const progress = Math.round(((idx + (selected !== null ? 1 : 0)) / total) * 100);

  const pick = (i: number) => {
    if (selected !== null || !q) return;
    setSelected(i);
    if (q.options[i].correct) {
      setScore((s) => s + (hintShown ? 50 : 100));
    }
  };

  const next = () => {
    if (!q) return;
    if (isLast) {
      pushHistory({ date: new Date().toISOString(), score, total: MAX_POINTS });
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setHintShown(false);
  };

  const leaderboard = useMemo(
    () => getWeeklyLeaderboard(user?.name || "Вы", finished ? score : 0),
    [finished, score, user?.name],
  );

  if (loading) {
    return (
      <div className="mx-auto" style={{ maxWidth: 700, padding: "120px 24px 80px" }}>
        <div className="glass-strong flex flex-col items-center justify-center" style={{ padding: 60 }}>
          <Loader2 size={42} color="#60A5FA" className="spin-slow" />
          <p className="text-soft mt-4">Генерация вопросов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto" style={{ maxWidth: 700, padding: "120px 24px 80px" }}>
        <div className="glass-strong" style={{ padding: 32 }}>
          <p style={{ color: "#FCA5A5", fontWeight: 700 }}>Ошибка</p>
          <p className="text-soft mt-2" style={{ fontSize: 14 }}>{error}</p>
          <button onClick={fetchQuiz} className="btn-primary mt-5"><RefreshCw size={18} /> Повторить</button>
        </div>
      </div>
    );
  }

  if (finished) {
    const passed = score >= PASS;
    return (
      <div className="mx-auto" style={{ maxWidth: 880, padding: "120px 24px 80px" }}>
        <div className="glass-strong animate-fade-up text-center" style={{ padding: 40 }}>
          <div
            className="pulse-glow mx-auto mb-5 flex items-center justify-center"
            style={{
              width: 96, height: 96, borderRadius: 28,
              background: passed
                ? "linear-gradient(135deg, #16A34A, #22D3EE)"
                : "linear-gradient(135deg, #EF4444, #F59E0B)",
            }}
          >
            <Trophy size={44} color="#fff" />
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {passed ? "Passed ✅" : "Try again ❌"}
          </h2>
          <p className="text-soft mt-2" style={{ fontSize: 16 }}>
            Заработано:{" "}
            <strong style={{ color: "#fff", fontSize: 22 }}>{score}</strong>
            <span className="text-soft"> / {MAX_POINTS}</span>
          </p>
          <p className="text-soft mt-1" style={{ fontSize: 13 }}>
            Минимум для прохождения: {PASS}
          </p>
          <button onClick={fetchQuiz} className="btn-primary mt-6"><RefreshCw size={18} /> Новая сессия</button>
        </div>

        <div className="glass mt-6" style={{ padding: 28 }}>
          <div className="flex items-center gap-2 mb-2">
            <Medal size={20} color="#FBBF24" />
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>Глобальный рейтинг</h3>
          </div>
          <p className="text-soft" style={{ fontSize: 12 }}>Рейтинг обновляется каждую неделю</p>
          <div className="flex flex-col gap-2 mt-4">
            {leaderboard.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between"
                style={{
                  padding: "12px 16px",
                  borderRadius: 14,
                  background: p.me ? "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(124,58,237,0.35))" : "rgba(255,255,255,0.05)",
                  border: "1px solid " + (p.me ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.08)"),
                }}
              >
                <div className="flex items-center gap-3">
                  <span style={{
                    width: 28, textAlign: "center", fontWeight: 800,
                    color: i === 0 ? "#FBBF24" : i === 1 ? "#E5E7EB" : i === 2 ? "#FB923C" : "rgba(255,255,255,0.6)",
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 18 }}>{p.flag}</span>
                  <span style={{ fontWeight: p.me ? 700 : 500 }}>{p.name}{p.me && " (вы)"}</span>
                </div>
                <span style={{ fontWeight: 700, color: "#93C5FD" }}>{p.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="mx-auto" style={{ maxWidth: 760, padding: "100px 24px 80px" }}>
      {/* Progress */}
      <div className="glass animate-fade-up mb-5" style={{ padding: 18 }}>
        <div className="flex items-center justify-between mb-2.5">
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            Вопрос {idx + 1} из {total}
          </span>
          <span className="text-soft" style={{ fontSize: 13 }}>
            Очки: <strong style={{ color: "#93C5FD" }}>{score}</strong> / {MAX_POINTS}
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%", width: `${progress}%`,
              background: "linear-gradient(90deg, #2563EB, #7C3AED)",
              transition: "width 0.4s ease",
              boxShadow: "0 0 12px rgba(37,99,235,0.6)",
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="glass-strong animate-fade-up" style={{ padding: 28 }} key={idx}>
        <span
          className="inline-flex items-center gap-1.5"
          style={{
            background: "rgba(37,99,235,0.25)",
            color: "#93C5FD",
            fontSize: 12, fontWeight: 700,
            padding: "6px 12px", borderRadius: 999,
            border: "1px solid rgba(96,165,250,0.3)",
          }}
        >
          <MapPin size={13} /> {q.scenario}
        </span>
        <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginTop: 14 }}>
          {q.question}
        </h2>

        {selected === null && (
          <button
            onClick={() => setHintShown(true)}
            disabled={hintShown}
            style={{
              marginTop: 14,
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 14px", borderRadius: 12,
              background: hintShown ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.08)",
              color: hintShown ? "#FCD34D" : "rgba(255,255,255,0.8)",
              border: "1px solid " + (hintShown ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.18)"),
              fontSize: 13, fontWeight: 600, cursor: hintShown ? "default" : "pointer",
            }}
          >
            <Lightbulb size={14} /> {hintShown ? q.hint : "Показать подсказку (−50 очков)"}
          </button>
        )}

        <div className="flex flex-col gap-2.5 mt-5">
          {q.options.map((opt, i) => {
            const isSel = selected === i;
            const reveal = selected !== null;
            let bg = "rgba(255,255,255,0.06)";
            let border = "rgba(255,255,255,0.15)";
            let color = "#1E293B";
            if (reveal) {
              if (opt.correct) { bg = "rgba(22,163,74,0.18)"; border = "rgba(34,197,94,0.7)"; color = "#15803D"; }
              else if (isSel) { bg = "rgba(239,68,68,0.15)"; border = "rgba(239,68,68,0.7)"; color = "#B91C1C"; }
              else { color = "#94A3B8"; }
            } else {
              bg = "rgba(255,255,255,0.85)";
              border = "rgba(148,163,184,0.35)";
            }
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={reveal}
                style={{
                  textAlign: "left",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: `1.5px solid ${border}`,
                  background: bg,
                  color, fontSize: 15, fontWeight: 500,
                  cursor: reveal ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "flex-start", gap: 10,
                  backdropFilter: "blur(8px)",
                }}
              >
                {reveal && opt.correct && <CheckCircle2 size={18} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />}
                {reveal && isSel && !opt.correct && <XCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />}
                <span style={{ flex: 1 }}>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div
            className="mt-5"
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: q.options[selected].correct ? "rgba(22,163,74,0.15)" : "rgba(239,68,68,0.15)",
              border: "1px solid " + (q.options[selected].correct ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"),
              color: q.options[selected].correct ? "#86EFAC" : "#FCA5A5",
              fontSize: 14, lineHeight: 1.5,
            }}
          >
            <strong style={{ display: "block", marginBottom: 4 }}>
              {q.options[selected].correct
                ? `Правильно! +${hintShown ? 50 : 100} очков`
                : "Неправильно. 0 очков"}
            </strong>
            {q.options[selected].explanation}
          </div>
        )}

        {selected !== null && (
          <button onClick={next} className="btn-primary w-full mt-5">
            {isLast ? "Завершить" : "Следующий вопрос"}
          </button>
        )}
      </div>
    </div>
  );
}
