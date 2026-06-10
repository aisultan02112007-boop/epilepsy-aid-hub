import { useState } from "react";
import { Dumbbell, Menu, X, Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/hooks/useTheme";

export function Navbar({ onNavigate }: { onNavigate: (v: string) => void }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navLinks = [
    { label: "Главная", key: "home" },
    { label: "Программы", key: "programs" },
    { label: "Игры", key: "games" },
    { label: "Прогресс", key: "progress" },
    { label: "Гид", key: "guide" },
  ];

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          zIndex: 50,
          transition: "all 0.4s ease",
        }}
        className="dark:bg-[rgba(20,30,60,0.7)] dark:border-[rgba(100,150,255,0.2)]"
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            height: "100%",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left: Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
            onClick={() => onNavigate("home")}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Dumbbell size={20} color="#fff" strokeWidth={2.4} />
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#1E293B",
                transition: "color 0.4s ease",
              }}
              className="dark:text-[#E2E8F0]"
            >
              FitCare
            </span>
          </div>

          {/* Center: Nav Links (Desktop Only) */}
          <div
            style={{
              display: "none",
              alignItems: "center",
              gap: 8,
              "@media (min-width: 1024px)": {
                display: "flex",
              },
            }}
            className="hidden lg:flex"
          >
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => onNavigate(link.key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "none",
                  color: "#475569",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                className="hover:text-[#2563EB] hover:bg-[rgba(37,99,235,0.1)] dark:text-[#A0AEC0] dark:hover:text-[#6DAAFF] dark:hover:bg-[rgba(100,150,255,0.1)]"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right: Theme Switcher + Avatar + Logout */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.5)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                color: "#475569",
              }}
              className="hover:bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(30,50,100,0.4)] dark:border-[rgba(100,150,255,0.2)] dark:text-[#A0AEC0] dark:hover:bg-[rgba(50,80,150,0.6)]"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? (
                <Sun size={18} style={{ animation: "rotate 0.3s ease-in-out" }} />
              ) : (
                <Moon size={18} style={{ animation: "rotate 0.3s ease-in-out" }} />
              )}
            </button>

            {user && (
              <>
                {/* Avatar */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  className="hover:shadow-[0_8px_20px_rgba(37,99,235,0.4)]"
                >
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.7)",
                    border: "1px solid rgba(148, 163, 184, 0.4)",
                    color: "#1E293B",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  className="hover:bg-[#ffffff] hover:border-[rgba(37,99,235,0.4)] dark:bg-[rgba(30,50,100,0.5)] dark:border-[rgba(100,150,255,0.2)] dark:text-[#E2E8F0] dark:hover:bg-[rgba(50,80,150,0.6)]"
                >
                  Выйти
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#475569",
              transition: "color 0.2s ease",
            }}
            className="lg:hidden dark:text-[#A0AEC0]"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.8)",
            zIndex: 40,
            padding: "12px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            transition: "all 0.3s ease",
          }}
          className="dark:bg-[rgba(20,30,60,0.85)] dark:border-b-[rgba(100,150,255,0.2)]"
        >
          {navLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => {
                onNavigate(link.key);
                setIsMobileOpen(false);
              }}
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                background: "transparent",
                border: "none",
                color: "#475569",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
              }}
              className="hover:bg-[rgba(37,99,235,0.1)] hover:text-[#2563EB] dark:text-[#A0AEC0] dark:hover:bg-[rgba(100,150,255,0.1)] dark:hover:text-[#6DAAFF]"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (min-width: 1024px) {
          nav > div > div:nth-child(2) {
            display: flex;
          }
          
          button.lg\\:hidden {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
