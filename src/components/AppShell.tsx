import { useState } from "react";
import { Background } from "./Background";
import { Navbar, type ViewKey } from "./Navbar";
import { Home } from "./Home";
import { Simulation } from "./Simulation";
import { Diary } from "./Diary";
import { Info } from "./Info";
import { Profile } from "./Profile";

export function AppShell() {
  const [view, setView] = useState<ViewKey>("home");
  return (
    <>
      <Background />
      <Navbar active={view} onNavigate={setView} />
      <main key={view} className="animate-fade-up">
        {view === "home" && <Home onNavigate={setView} />}
        {view === "simulation" && <Simulation />}
        {view === "diary" && <Diary />}
        {view === "info" && <Info />}
        {view === "profile" && <Profile />}
      </main>
    </>
  );
}
