import { createFileRoute } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AuthScreen } from "@/components/AuthScreen";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedCare — Первая помощь при эпилепсии" },
      { name: "description", content: "Интерактивное обучение первой помощи при эпилепсии. Симуляции, дневник, рейтинг." },
      { property: "og:title", content: "MedCare — Знай. Помогай. Спасай." },
      { property: "og:description", content: "Интерактивное обучение первой помощи при эпилепсии." },
    ],
  }),
  component: Index,
});

function Gate() {
  const { user } = useAuth();
  return user ? <AppShell /> : <AuthScreen />;
}

function Index() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
