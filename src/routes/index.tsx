import { createFileRoute } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AuthScreen } from "@/components/AuthScreen";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitCare — Твой путь к лучшему телу" },
      { name: "description", content: "Персональные тренировки, питание и геймификация в одном месте." },
      { property: "og:title", content: "FitCare — Твой путь к лучшему телу" },
      { property: "og:description", content: "Персональные программы тренировок, прогресс и питание." },
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
