import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";

type Entry = { id: string; date: string; duration: string; triggers: string; notes: string };
const KEY = "epi_diary";

function read(): Entry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(e: Entry[]) { localStorage.setItem(KEY, JSON.stringify(e)); }

export function Diary() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [duration, setDuration] = useState("");
  const [triggers, setTriggers] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => { setEntries(read()); }, []);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration.trim()) return;
    const next: Entry = {
      id: String(Date.now()),
      date, duration: duration.trim(), triggers: triggers.trim(), notes: notes.trim(),
    };
    const all = [next, ...entries];
    write(all); setEntries(all);
    setDuration(""); setTriggers(""); setNotes("");
  };

  const remove = (id: string) => {
    const all = entries.filter((x) => x.id !== id);
    write(all); setEntries(all);
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 880, padding: "100px 24px 80px" }}>
      <section className="mb-8 animate-fade-up">
        <p style={{ color: "#93C5FD", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Мониторинг
        </p>
        <h1 style={{ fontSize: "clamp(32px,5vw,44px)", fontWeight: 900, letterSpacing: "-0.02em" }}>
          Дневник симптомов
        </h1>
        <p className="text-soft mt-2">Записывай приступы, чтобы видеть закономерности.</p>
      </section>

      <form onSubmit={add} className="glass-strong animate-fade-up" style={{ padding: 28, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Новая запись</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label-muted block mb-1.5">Дата и время</label>
            <input type="datetime-local" className="glass-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label-muted block mb-1.5">Длительность</label>
            <input className="glass-input" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="напр. 2 мин" />
          </div>
          <div className="md:col-span-2">
            <label className="label-muted block mb-1.5">Триггеры</label>
            <input className="glass-input" value={triggers} onChange={(e) => setTriggers(e.target.value)} placeholder="стресс, недосып, мигание света…" />
          </div>
          <div className="md:col-span-2">
            <label className="label-muted block mb-1.5">Заметки</label>
            <textarea className="glass-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Состояние, окружение, действия…" rows={3} style={{ resize: "vertical", minHeight: 80 }} />
          </div>
        </div>
        <button type="submit" className="btn-primary mt-5">
          <Plus size={18} /> Добавить запись
        </button>
      </form>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>История ({entries.length})</h2>
      {entries.length === 0 && (
        <div className="glass-card" style={{ padding: 36, textAlign: "center" }}>
          <p className="text-soft">Записей пока нет.</p>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {entries.map((e) => (
          <div key={e.id} className="glass-card" style={{ padding: 22 }}>
            <div className="flex items-start justify-between gap-3">
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2 text-soft" style={{ fontSize: 13 }}>
                  <Calendar size={14} />
                  {new Date(e.date).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" })}
                  <span style={{ marginLeft: 8, padding: "2px 10px", borderRadius: 999, background: "rgba(37,99,235,0.25)", color: "#93C5FD", fontWeight: 600 }}>
                    {e.duration}
                  </span>
                </div>
                {e.triggers && <p className="mt-2" style={{ fontSize: 14 }}><strong>Триггеры:</strong> <span className="text-soft">{e.triggers}</span></p>}
                {e.notes && <p className="mt-1.5 text-soft" style={{ fontSize: 14 }}>{e.notes}</p>}
              </div>
              <button onClick={() => remove(e.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", padding: 8, borderRadius: 10, cursor: "pointer" }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
