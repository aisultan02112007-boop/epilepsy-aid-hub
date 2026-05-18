import { createFileRoute } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AuthScreen } from "@/components/AuthScreen";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedCare — Epilepsy First Aid Education" },
      { name: "description", content: "Learn epilepsy first aid. Practice simulations, track symptoms, and be ready to help save a life." },
      { property: "og:title", content: "MedCare — Epilepsy First Aid Education" },
      { property: "og:description", content: "Learn to help. Save a life." },
    ],
  }),
  component: Index,
});

function Gate() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <AuthScreen />;
}

function Index() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
