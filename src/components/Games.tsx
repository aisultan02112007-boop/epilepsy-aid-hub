import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2, RefreshCw, CheckCircle2, XCircle, Lightbulb, Trophy, Medal, MapPin, Gamepad2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getWeeklyLeaderboard } from "@/lib/leaderboard";

type QOption = { text: string; correct: boolean; explanation: string };
type Question = { question: string; hint: string; scenario: string; options: QOption[] };
type Quiz = { questions: Question[] };

const HISTORY_KEY = "fit_quiz_history";
const MAX = 1000;
const PASS = 700;

function pushHistory(e: { date: string; score: number; total: number }) {
  let prev: { date: string; score: number; total: number }[] = [];
  try { prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch {}
  localStorage.setItem(HISTORY_KEY, JSON.stringify([e, ...prev].slice(0, 20)));
}

export function Games() {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const started = useRef<number>(Date.now());

  const fetchQuiz = async () => {
    setLoading(true); setError(null); setQuiz(null);
    setIdx(0); setSelected(null); setHintShown(false); setScore(0); setFinished(false);
    started.current = Date.now();
    try {
      const res = await fetch("/api/public/simulation", { method: "POST" });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error || `Request failed (${res.status})`); }
      setQuiz(await res.json());
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuiz(); }, []);

  const q = quiz?.questions[idx];
  const total = quiz?.questions.length || 10;
  const isLast = idx === total - 1;
  const progress = Math.round(((idx + (selected !== null ? 1 : 0)) / total) * 100);

  const pick = (i: number) => {
    if (selected !== null || !q) return;
    setSelected(i);
    if (q.options[i].correct) setScore((s) => s + (hintShown ? 50 : 100));
  };

  const next = () => {
    if (!q) return;
    if (isLast) { pushHistory({ date: new Date().toISOString(), score, total: MAX }); setFinished(true); return; }
    setIdx((i) => i + 1); setSelected(null); setHintShown(false);
  };

  const leaderboard = useMemo(() => getWeeklyLeaderboard(user?.name || "Вы", finished ? score : 0), [finished, score, user?.name]);

  return (
    <div className="mx-auto" style={{ maxWidth: 960, padding: "100px 24px 80px" }}>
      <div className="flex items-center gap-3 mb-6 animate-fade-up">
        <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #2563EB, #7C3AED)", boxShadow: "0 6px 18px rgba(37,99,235,0.4)" }}>
          <Gamepad2 size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em" }}>FitCare Games</h1>
          <p className="text-soft" style={{ fontSize: 13 }}>Проверь свои знания о теле, питании и тренировках</p>
        </div>
      </div>

      {loading && (
        <div className="glass-strong flex flex-col items-center justify-center" style={{ padding: 60 }}>
          <Loader2 size={42} color="#2563EB" className="spin-slow" />
          <p className="text-soft mt-4">Генерация вопросов...</p>
        </div>
      )}

      {error && (
        <div className="glass-strong" style={{ padding: 32 }}>
          <p style={{ color: "#DC2626", fontWeight: 700 }}>Ошибка</p>
          <p className="text-soft mt-2" style={{ fontSize: 14 }}>{error}</p>
          <button onClick={fetchQuiz} className="btn-primary mt-5"><RefreshCw size={18} /> Повторить</button>
        </div>
      )}

      {!loading && !error && finished && (
        <div className="animate-fade-up">
          <div className="glass-strong text-center" style={{ padding: 40 }}>
            <div className="soft-float mx-auto mb-5 flex items-center justify-center" style={{ width: 96, height: 96, borderRadius: 28, background: score >= PASS ? "linear-gradient(135deg, #16A34A, #22D3EE)" : "linear-gradient(135deg, #EF4444, #F59E0B)" }}>
              <Trophy size={44} color="#fff" />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
              {score >= PASS ? "Passed ✅" : "Try again ❌"}
            </h2>
            <p className="text-soft mt-2">Заработано: <strong style={{ color: "#0F172A", fontSize: 22 }}>{score}</strong> / {MAX}</p>
            <p className="text-soft mt-1" style={{ fontSize: 13 }}>Минимум: {PASS}</p>
            <button onClick={fetchQuiz} className="btn-primary mt-6"><RefreshCw size={18} /> Новая игра</button>
          </div>
          <div className="glass mt-6" style={{ padding: 28 }}>
            <div className="flex items-center gap-2 mb-3">
              <Medal size={20} color="#FBBF24" />
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>Глобальный рейтинг</h3>
            </div>
            <div className="flex flex-col gap-2">
              {leaderboard.map((p, i) => (
                <div key={i} className="flex items-center justify-between" style={{ padding: "12px 16px", borderRadius: 14, background: p.me ? "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(124,58,237,0.25))" : "rgba(255,255,255,0.5)", border: "1px solid " + (p.me ? "rgba(37,99,235,0.5)" : "rgba(148,163,184,0.25)") }}>
                  <div className="flex items-center gap-3">
                    <span style={{ width: 28, textAlign: "center", fontWeight: 800, color: i === 0 ? "#F59E0B" : i === 1 ? "#64748B" : i === 2 ? "#EA580C" : "#94A3B8" }}>{i + 1}</span>
                    <span style={{ fontSize: 18 }}>{p.flag}</span>
                    <span style={{ fontWeight: p.me ? 700 : 500, color: "#0F172A" }}>{p.name}{p.me && " (вы)"}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: "#2563EB" }}>{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && !finished && q && (
        <div>
          <div className="glass mb-5" style={{ padding: 18 }}>
            <div className="flex items-center justify-between mb-2.5">
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Вопрос {idx + 1} из {total}</span>
              <span className="text-soft" style={{ fontSize: 13 }}>Очки: <strong style={{ color: "#2563EB" }}>{score}</strong> / {MAX}</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(148,163,184,0.25)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #2563EB, #7C3AED)", transition: "width 0.4s ease", boxShadow: "0 0 12px rgba(37,99,235,0.5)" }} />
            </div>
          </div>
          <div className="glass-strong animate-fade-up" style={{ padding: 28 }} key={idx}>
            <span className="inline-flex items-center gap-1.5" style={{ background: "rgba(37,99,235,0.15)", color: "#1E40AF", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(37,99,235,0.3)" }}>
              <MapPin size={13} /> {q.scenario}
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginTop: 14, color: "#0F172A" }}>{q.question}</h2>
            {selected === null && (
              <button onClick={() => setHintShown(true)} disabled={hintShown} style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: hintShown ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.7)", color: hintShown ? "#92400E" : "#475569", border: "1px solid " + (hintShown ? "rgba(251,191,36,0.5)" : "rgba(148,163,184,0.4)"), fontSize: 13, fontWeight: 600, cursor: hintShown ? "default" : "pointer" }}>
                <Lightbulb size={14} /> {hintShown ? q.hint : "Показать подсказку (−50 очков)"}
              </button>
            )}
            <div className="flex flex-col gap-2.5 mt-5">
              {q.options.map((opt, i) => {
                const isSel = selected === i;
                const reveal = selected !== null;
                let bg = "rgba(255,255,255,0.85)", border = "rgba(148,163,184,0.35)", color = "#1E293B";
                if (reveal) {
                  if (opt.correct) { bg = "rgba(22,163,74,0.18)"; border = "rgba(34,197,94,0.7)"; color = "#15803D"; }
                  else if (isSel) { bg = "rgba(239,68,68,0.15)"; border = "rgba(239,68,68,0.7)"; color = "#B91C1C"; }
                  else { color = "#94A3B8"; bg = "rgba(255,255,255,0.4)"; }
                }
                return (
                  <button key={i} onClick={() => pick(i)} disabled={reveal} style={{ textAlign: "left", padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${border}`, background: bg, color, fontSize: 15, fontWeight: 500, cursor: reveal ? "default" : "pointer", transition: "all 0.2s ease", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    {reveal && opt.correct && <CheckCircle2 size={18} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />}
                    {reveal && isSel && !opt.correct && <XCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />}
                    <span style={{ flex: 1 }}>{opt.text}</span>
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="mt-5" style={{ padding: "14px 16px", borderRadius: 14, background: q.options[selected].correct ? "rgba(22,163,74,0.12)" : "rgba(239,68,68,0.12)", border: "1px solid " + (q.options[selected].correct ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"), color: q.options[selected].correct ? "#15803D" : "#B91C1C", fontSize: 14, lineHeight: 1.5 }}>
                <strong style={{ display: "block", marginBottom: 4 }}>
                  {q.options[selected].correct ? `Правильно! +${hintShown ? 50 : 100} очков` : "Неправильно. 0 очков"}
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
      )}
    </div>
  );
}