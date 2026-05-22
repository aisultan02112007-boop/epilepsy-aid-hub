import { useEffect, useState } from "react";
import { Dumbbell, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

export type ViewKey = "home" | "workouts" | "progress" | "nutrition" | "profile";

const NAV: { key: ViewKey; label: string }[] = [
  { key: "home", label: "Главная" },
  { key: "workouts", label: "Тренировки" },
  { key: "progress", label: "Прогресс" },
  { key: "nutrition", label: "Питание" },
];

export function Navbar({
  active,
  onNavigate,
}: {
  active: ViewKey;
  onNavigate: (v: ViewKey) => void;
}) {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = (user?.name || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          backdropFilter: scrolled ? "blur(28px)" : "blur(16px)",
          WebkitBackdropFilter: scrolled ? "blur(28px)" : "blur(16px)",
          background: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)",
          borderBottom: "1px solid rgba(37,99,235,0.15)",
          transition: "all 0.3s ease",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: 1200, padding: "14px 24px" }}
        >
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2.5"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#0F172A" }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
              }}
            >
              <Dumbbell size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
              FitCare
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {NAV.map((n) => {
              const isActive = active === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => onNavigate(n.key)}
                  style={{
                    background: "none",
                    border: "none",
                    color: isActive ? "#2563EB" : "#475569",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 14,
                    padding: "10px 16px",
                    cursor: "pointer",
                    position: "relative",
                    transition: "color 0.2s ease",
                  }}
                >
                  {n.label}
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 2, left: "20%", right: "20%",
                        height: 2,
                      background: "#2563EB",
                        borderRadius: 2,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onNavigate("profile")}
              title={user?.name}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                color: "#fff", fontSize: 13, fontWeight: 700,
                border: "2px solid #fff",
                boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                cursor: "pointer",
              }}
            >
              {initials}
            </button>
            <button
              onClick={logout}
              title="Выйти"
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(148,163,184,0.35)",
                color: "#475569",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <LogOut size={16} />
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setOpen(true)}
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(148,163,184,0.35)",
              color: "#0F172A",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute", top: 0, right: 0, bottom: 0,
              width: "82%", maxWidth: 320,
              background: "rgba(15,23,42,0.92)",
              backdropFilter: "blur(28px)",
              borderLeft: "1px solid rgba(255,255,255,0.12)",
              padding: 24,
              display: "flex", flexDirection: "column", gap: 8,
              animation: "fadeUp 0.3s ease",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontWeight: 700, fontSize: 16 }}>Меню</span>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
              >
                <X size={22} />
              </button>
            </div>
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => { onNavigate(n.key); setOpen(false); }}
                style={{
                  textAlign: "left",
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: active === n.key ? "rgba(37,99,235,0.2)" : "transparent",
                  color: active === n.key ? "#fff" : "rgba(255,255,255,0.75)",
                  border: "1px solid " + (active === n.key ? "rgba(96,165,250,0.4)" : "transparent"),
                  fontSize: 15, fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {n.label}
              </button>
            ))}
            <button
              onClick={() => { onNavigate("profile"); setOpen(false); }}
              style={{
                textAlign: "left", padding: "14px 16px", borderRadius: 12,
                background: active === "profile" ? "rgba(37,99,235,0.2)" : "transparent",
                color: "rgba(255,255,255,0.85)",
                border: "1px solid transparent",
                fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}
            >
              Профиль ({initials})
            </button>
            <button
              onClick={() => { logout(); setOpen(false); }}
              style={{
                marginTop: 8, padding: "14px 16px", borderRadius: 12,
                background: "rgba(239,68,68,0.15)",
                color: "#FCA5A5",
                border: "1px solid rgba(239,68,68,0.3)",
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              <LogOut size={16} /> Выйти
            </button>
          </div>
        </div>
      )}
    </>
  );
}
