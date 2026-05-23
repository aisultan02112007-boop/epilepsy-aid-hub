import { useState } from "react";
import { Background } from "./Background";
import { Navbar, type ViewKey } from "./Navbar";
import { Home } from "./Home";
import { Workouts } from "./Workouts";
import { Progress } from "./Progress";
import { Nutrition } from "./Nutrition";
import { Guide } from "./Guide";
import { Profile } from "./Profile";

export function AppShell() {
  const [view, setView] = useState<ViewKey>("home");
  return (
    <>
      <Background />
      <Navbar active={view} onNavigate={setView} />
      <main key={view} className="animate-fade-up">
        {view === "home" && <Home onNavigate={setView} />}
        {view === "workouts" && <Workouts />}
        {view === "progress" && <Progress />}
        {view === "nutrition" && <Nutrition />}
        {view === "guide" && <Guide />}
        {view === "profile" && <Profile />}
      </main>
    </>
  );
}
