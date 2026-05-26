import { useEffect, useState } from "react";
import { Dumbbell, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";

export type ViewKey = "home" | "workouts" | "games" | "progress" | "guide" | "profile";

const NAV: { key: ViewKey; label: string }[] = [
  { key: "home", label: "Главная" },
  { key: "workouts", label: "Программы" },
  { key: "games", label: "Игры" },
  { key: "progress", label: "Прогресс" },
  { key: "guide", label: "Гид" },
];

export function Navbar({
  active,
  onNavigate,
}: {
  active: ViewKey;
  onNavigate: (v: ViewKey) => void;
}) {
  const { user, logout } = useAuth();
  const [hovered, setHovered] = useState<ViewKey | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const initials = (user?.name || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <nav className="navbar-glass">
      <div
        className="mx-auto flex items-center justify-between"
        style={{ maxWidth: 1200, padding: "18px 24px" }}
      >
        {/* Left: Logo */}
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2.5 flex-shrink-0"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#0F172A" }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #6D28D9, #7C3AED 55%, #2563EB)",
              boxShadow: "0 6px 18px rgba(109,40,217,0.4)",
            }}
          >
            <Dumbbell size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
            FitCare
          </span>
        </button>

        {/* Center: Navigation Links (Desktop Only) */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map((n) => {
            const isActive = active === n.key;
            const isHover = hovered === n.key;
            return (
              <button
                key={n.key}
                onClick={() => onNavigate(n.key)}
                onMouseEnter={() => setHovered(n.key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: isActive
                    ? "rgba(37,99,235,0.10)"
                    : isHover
                    ? "rgba(37,99,235,0.06)"
                    : "transparent",
                  border: "none",
                  color: isActive || isHover ? "#2563EB" : "#475569",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  padding: "10px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s ease",
                }}
              >
                {n.label}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 2, left: "18%", right: "18%",
                      height: 2,
                      background: "linear-gradient(90deg, #6D28D9, #2563EB)",
                      borderRadius: 2,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Avatar and Logout Button (Desktop Only) */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
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
              height: 38, padding: "0 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(148,163,184,0.35)",
              color: "#475569",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontSize: 13, fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <LogOut size={16} /> Выйти
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden flex items-center justify-center"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#0F172A",
            padding: "8px",
          }}
        >
          <Menu size={24} strokeWidth={2} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {NAV.map((n) => {
              const isActive = active === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => {
                    onNavigate(n.key);
                    setIsMobileOpen(false);
                  }}
                  style={{
                    background: isActive ? "rgba(37,99,235,0.15)" : "transparent",
                    border: "none",
                    color: isActive ? "#2563EB" : "#475569",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 14,
                    padding: "12px 16px",
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  {n.label}
                </button>
              );
            })}
            <div style={{ borderTop: "1px solid rgba(148,163,184,0.2)", marginTop: "12px", paddingTop: "12px", display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  onNavigate("profile");
                  setIsMobileOpen(false);
                }}
                title={user?.name}
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  border: "2px solid #fff",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                  cursor: "pointer",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {initials}
              </button>
              <button
                onClick={logout}
                title="Выйти"
                style={{
                  height: 38, padding: "0 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(148,163,184,0.35)",
                  color: "#475569",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  flex: 1,
                }}
              >
                <LogOut size={16} /> Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
