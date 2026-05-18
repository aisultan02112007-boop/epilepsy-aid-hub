import { useState } from "react";
import { LifeBuoy, LineChart, BookOpen, User, LogOut, ArrowLeft, HeartPulse, LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Simulation } from "@/components/Simulation";

type CardKey = "simulation" | "diary" | "about" | "profile";
type CardDef = { key: CardKey; title: string; desc: string; icon: LucideIcon };

const CARDS: CardDef[] = [
  { key: "simulation", title: "First Aid Simulation", desc: "Practice step-by-step response", icon: LifeBuoy },
  { key: "diary", title: "Symptom Diary", desc: "Track seizures and triggers", icon: LineChart },
  { key: "about", title: "About Epilepsy", desc: "Learn the essentials", icon: BookOpen },
  { key: "profile", title: "Profile", desc: "Your account and settings", icon: User },
];

export function Dashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<CardDef | null>(null);

  if (active) {
    if (active.key === "simulation") {
      return <Simulation onBack={() => setActive(null)} />;
    }
    const Icon = active.icon;
    return (
      <main className="min-h-screen px-5 py-6 mx-auto" style={{ maxWidth: 480, backgroundColor: "#F0F4FF" }}>
        <button
          onClick={() => setActive(null)}
          className="inline-flex items-center gap-2 mb-6"
          style={{ color: "#2563EB", fontWeight: 600, fontSize: 15 }}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="app-card flex flex-col items-center text-center" style={{ padding: "48px 24px" }}>
          <div
            className="flex items-center justify-center mb-4"
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "rgba(37,99,235,0.10)",
              color: "#2563EB",
            }}
          >
            <Icon size={32} />
          </div>
          <h2 className="app-heading">{active.title}</h2>
          <p className="app-muted mt-2">Coming soon</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-6 mx-auto" style={{ maxWidth: 480, backgroundColor: "#F0F4FF" }}>
      <header className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "rgba(37,99,235,0.10)",
              color: "#2563EB",
            }}
          >
            <HeartPulse size={20} strokeWidth={2.4} />
          </div>
          <div>
            <p className="app-muted" style={{ fontSize: 13 }}>Welcome back</p>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1E293B", lineHeight: 1.1 }}>
              Hello, {user?.name || "Friend"}
            </h1>
          </div>
        </div>
        <button
          onClick={logout}
          aria-label="Log out"
          className="app-card flex items-center justify-center"
          style={{ width: 44, height: 44, padding: 0, color: "#64748B" }}
        >
          <LogOut size={18} />
        </button>
      </header>

      <section className="grid grid-cols-2 gap-4">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => setActive(c)}
              className="app-card text-left flex flex-col"
              style={{ padding: 20, gap: 14, transition: "transform 150ms ease" }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: "rgba(37,99,235,0.10)",
                  color: "#2563EB",
                }}
              >
                <Icon size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", lineHeight: 1.2 }}>
                  {c.title}
                </h3>
                <p className="app-muted mt-1" style={{ fontSize: 12, lineHeight: 1.4 }}>
                  {c.desc}
                </p>
              </div>
            </button>
          );
        })}
      </section>
    </main>
  );
}