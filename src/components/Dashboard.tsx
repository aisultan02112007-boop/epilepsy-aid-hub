import { useState } from "react";
import { LifeBuoy, LineChart, BookOpen, User, LogOut, ArrowLeft, LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";

type CardKey = "simulation" | "diary" | "about" | "profile";
type CardDef = { key: CardKey; title: string; desc: string; icon: LucideIcon; emoji: string };

const CARDS: CardDef[] = [
  { key: "simulation", title: "First Aid Simulation", desc: "Practice step-by-step response", icon: LifeBuoy, emoji: "🆘" },
  { key: "diary", title: "Symptom Diary", desc: "Track seizures and triggers", icon: LineChart, emoji: "📊" },
  { key: "about", title: "About Epilepsy", desc: "Learn the essentials", icon: BookOpen, emoji: "📚" },
  { key: "profile", title: "Profile", desc: "Your account and settings", icon: User, emoji: "👤" },
];

export function Dashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<CardDef | null>(null);

  if (active) {
    const Icon = active.icon;
    return (
      <main className="min-h-screen bg-app-bg px-5 py-6 max-w-md mx-auto">
        <button onClick={() => setActive(null)} className="inline-flex items-center gap-2 text-app-primary font-semibold mb-6">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="app-card flex flex-col items-center text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-app-primary/10 text-app-primary flex items-center justify-center mb-4">
            <Icon size={32} />
          </div>
          <h2 className="text-xl font-bold text-app-text">{active.title}</h2>
          <p className="text-app-text/60 mt-2">Coming soon</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app-bg px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-app-text/60">Welcome back</p>
          <h1 className="text-2xl font-extrabold text-app-text">Hello, {user?.name || "Friend"}</h1>
        </div>
        <button onClick={logout} aria-label="Log out" className="w-11 h-11 rounded-xl bg-white shadow-md flex items-center justify-center text-app-text/70 hover:text-app-error transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      <section className="grid grid-cols-2 gap-4">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => setActive(c)}
              className="app-card text-left flex flex-col gap-3 active:scale-[0.98] transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-app-primary/10 text-app-primary flex items-center justify-center">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="font-bold text-app-text leading-tight">
                  <span className="mr-1" aria-hidden>{c.emoji}</span>
                  {c.title}
                </h3>
                <p className="text-xs text-app-text/60 mt-1">{c.desc}</p>
              </div>
            </button>
          );
        })}
      </section>
    </main>
  );
}