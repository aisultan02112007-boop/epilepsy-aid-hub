import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MapPin,
  Timer,
  Lightbulb,
  Trophy,
  Loader2,
} from "lucide-react";

type Option = { text: string; correct: boolean; explanation: string };
type Step = { question: string; hint: string; options: Option[] };
type Scenario = {
  location: string;
  situation: string;
  steps: Step[];
  timer_seconds: number;
};

type ScoreEntry = { date: string; score: number; total: number };
type Mode = "learn" | "test";

const HISTORY_KEY = "epi_sim_history";

function readHistory(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ScoreEntry[]) : [];
  } catch {
    return [];
  }
}

function pushHistory(entry: ScoreEntry) {
  const next = [entry, ...readHistory()].slice(0, 5);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function Simulation({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<Mode>("learn");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState<ScoreEntry[]>([]);

  // timer for final step
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchScenario = async () => {
    setLoading(true);
    setError(null);
    setScenario(null);
    setStepIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setTimeLeft(null);
    try {
      const res = await fetch("/api/public/simulation", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as Scenario;
      setScenario(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить сценарий.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHistory(readHistory());
    fetchScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start countdown when reaching the last step
  useEffect(() => {
    if (!scenario) return;
    const isLast = stepIndex === scenario.steps.length - 1;
    if (isLast && selected === null && !finished) {
      setTimeLeft(scenario.timer_seconds);
      timerRef.current && clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t === null) return t;
          if (t <= 1) {
            timerRef.current && clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scenario, stepIndex, selected, finished]);

  const step = scenario?.steps[stepIndex];
  const isLast = scenario ? stepIndex === scenario.steps.length - 1 : false;

  const pick = (i: number) => {
    if (selected !== null || !step) return;
    setSelected(i);
    if (step.options[i].correct) setScore((s) => s + 1);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const next = () => {
    if (!scenario) return;
    if (isLast) {
      const entry: ScoreEntry = {
        date: new Date().toISOString(),
        score: score,
        total: scenario.steps.length,
      };
      setHistory(pushHistory(entry));
      setFinished(true);
      return;
    }
    setStepIndex((i) => i + 1);
    setSelected(null);
  };

  const progressPct = useMemo(() => {
    if (!scenario) return 0;
    return Math.round(((stepIndex + (selected !== null ? 1 : 0)) / scenario.steps.length) * 100);
  }, [scenario, stepIndex, selected]);

  return (
    <main
      className="min-h-screen px-5 py-6 mx-auto"
      style={{ maxWidth: 480, backgroundColor: "#F0F4FF" }}
    >
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-5"
        style={{ color: "#2563EB", fontWeight: 600, fontSize: 15 }}
      >
        <ArrowLeft size={18} /> Назад
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="app-heading">Симуляция первой помощи</h1>
      </div>

      {/* Mode toggle */}
      <div
        className="flex p-1 mb-5"
        style={{ backgroundColor: "#E2E8F0", borderRadius: 12 }}
        role="tablist"
      >
        {(
          [
            { id: "learn", label: "Обучение" },
            { id: "test", label: "Проверка" },
          ] as { id: Mode; label: string }[]
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            data-active={mode === m.id}
            style={{
              flex: 1,
              minHeight: 40,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "background-color 150ms ease, color 150ms ease",
              backgroundColor: mode === m.id ? "#ffffff" : "transparent",
              color: mode === m.id ? "#2563EB" : "#64748B",
              boxShadow: mode === m.id ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="app-card flex flex-col items-center justify-center" style={{ padding: 48 }}>
          <Loader2 size={36} color="#2563EB" className="animate-spin" />
          <p className="app-muted mt-4">Генерация сценария...</p>
        </div>
      )}

      {error && !loading && (
        <div className="app-card" style={{ padding: 24 }}>
          <p style={{ color: "#EF4444", fontWeight: 600 }}>Ошибка</p>
          <p className="app-muted mt-2" style={{ fontSize: 14 }}>{error}</p>
          <button onClick={fetchScenario} className="app-btn app-btn-primary w-full mt-5">
            <RefreshCw size={18} style={{ marginRight: 8 }} /> Повторить
          </button>
        </div>
      )}

      {scenario && !loading && !finished && step && (
        <>
          {/* Scenario card */}
          <div className="app-card mb-4" style={{ padding: 20 }}>
            <div className="flex items-center justify-between mb-3">
              <span
                className="inline-flex items-center gap-1.5"
                style={{
                  backgroundColor: "rgba(37,99,235,0.10)",
                  color: "#2563EB",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 10px",
                  borderRadius: 999,
                }}
              >
                <MapPin size={13} /> {scenario.location}
              </span>
              <span className="app-muted" style={{ fontSize: 12 }}>
                Шаг {stepIndex + 1} / {scenario.steps.length}
              </span>
            </div>
            <p style={{ fontSize: 15, color: "#1E293B", lineHeight: 1.5 }}>{scenario.situation}</p>

            {/* progress bar */}
            <div
              style={{ marginTop: 14, height: 6, borderRadius: 999, backgroundColor: "#E2E8F0", overflow: "hidden" }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  backgroundColor: "#2563EB",
                  transition: "width 300ms ease",
                }}
              />
            </div>
          </div>

          {/* Timer on last step */}
          {isLast && timeLeft !== null && (
            <div
              className="app-card mb-4 flex items-center justify-between"
              style={{
                padding: "14px 18px",
                borderLeft: `4px solid ${timeLeft <= 10 ? "#EF4444" : "#2563EB"}`,
              }}
            >
              <div className="flex items-center gap-2">
                <Timer size={18} color={timeLeft <= 10 ? "#EF4444" : "#2563EB"} />
                <span style={{ fontWeight: 600, color: "#1E293B" }}>Осталось времени</span>
              </div>
              <span
                style={{
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 700,
                  fontSize: 20,
                  color: timeLeft <= 10 ? "#EF4444" : "#1E293B",
                  transition: "color 200ms ease",
                }}
              >
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Question card */}
          <div className="app-card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1E293B", lineHeight: 1.35 }}>
              {step.question}
            </h2>

            {mode === "learn" && selected === null && (
              <div
                className="flex items-start gap-2 mt-3"
                style={{
                  padding: "10px 12px",
                  backgroundColor: "rgba(37,99,235,0.06)",
                  borderRadius: 10,
                  color: "#2563EB",
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                <Lightbulb size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{step.hint}</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5 mt-4">
              {step.options.map((opt, i) => {
                const isSel = selected === i;
                const reveal = selected !== null;
                let bg = "#ffffff";
                let border = "#E2E8F0";
                let color = "#1E293B";
                if (reveal) {
                  if (opt.correct) {
                    bg = "rgba(22,163,74,0.08)";
                    border = "#16A34A";
                    color = "#166534";
                  } else if (isSel) {
                    bg = "rgba(239,68,68,0.08)";
                    border = "#EF4444";
                    color = "#991B1B";
                  } else {
                    color = "#64748B";
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={reveal}
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: `1.5px solid ${border}`,
                      backgroundColor: bg,
                      color,
                      fontSize: 15,
                      fontWeight: 500,
                      cursor: reveal ? "default" : "pointer",
                      transition: "all 150ms ease",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    {reveal && opt.correct && (
                      <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
                    )}
                    {reveal && isSel && !opt.correct && (
                      <XCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                    )}
                    <span style={{ flex: 1 }}>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div
                className="mt-4"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  backgroundColor: step.options[selected].correct
                    ? "rgba(22,163,74,0.08)"
                    : "rgba(239,68,68,0.08)",
                  color: step.options[selected].correct ? "#166534" : "#991B1B",
                  fontSize: 14,
                  lineHeight: 1.45,
                }}
              >
                <strong style={{ display: "block", marginBottom: 4 }}>
                  {step.options[selected].correct ? "Правильно" : "Неправильно"}
                </strong>
                {step.options[selected].explanation}
              </div>
            )}

            {selected !== null && (
              <button onClick={next} className="app-btn app-btn-primary w-full mt-5">
                {isLast ? "Завершить" : "Следующий шаг"}
              </button>
            )}
          </div>
        </>
      )}

      {finished && scenario && (
        <div className="app-card" style={{ padding: 28, textAlign: "center" }}>
          <div
            className="flex items-center justify-center mx-auto mb-4"
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "rgba(22,163,74,0.10)",
              color: "#16A34A",
            }}
          >
            <Trophy size={32} />
          </div>
          <h2 className="app-heading">Сценарий завершён</h2>
          <p className="app-muted mt-2">
            Ваш результат:{" "}
            <strong style={{ color: "#1E293B" }}>
              {score} из {scenario.steps.length}
            </strong>
          </p>

          <button onClick={fetchScenario} className="app-btn app-btn-primary w-full mt-6">
            <RefreshCw size={18} style={{ marginRight: 8 }} /> Новый сценарий
          </button>

          {history.length > 0 && (
            <div className="mt-6" style={{ textAlign: "left" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1E293B", marginBottom: 10 }}>
                История (последние {history.length})
              </h3>
              <ul className="flex flex-col gap-2">
                {history.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between"
                    style={{
                      padding: "10px 14px",
                      backgroundColor: "#F8FAFC",
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                  >
                    <span className="app-muted">
                      {new Date(h.date).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span style={{ fontWeight: 600, color: "#1E293B" }}>
                      {h.score} / {h.total}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}