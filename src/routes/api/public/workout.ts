import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const Schema = z.object({
  program_name: z.string(),
  goal: z.string(),
  split: z.string(),
  weekly_calories_deficit_or_surplus: z.string(),
  days: z.array(z.object({
    day: z.string(),
    focus: z.string(),
    exercises: z.array(z.object({
      name: z.string(),
      sets: z.number(),
      reps: z.string(),
      rest: z.string(),
      tip: z.string(),
    })).min(3),
    cardio: z.string(),
    duration_minutes: z.number(),
  })).min(3),
  nutrition_tip: z.string(),
  motivation: z.string(),
});

const Input = z.object({
  goal: z.string().min(1).max(50),
  location: z.string().min(1).max(50),
  experience: z.string().min(1).max(50),
  days: z.number().min(2).max(7),
});

function extractJson(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s !== -1 && e !== -1) return text.slice(s, e + 1);
  return text.trim();
}

export const Route = createFileRoute("/api/public/workout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
        try {
          const body = await request.json();
          const input = Input.parse(body);
          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("google/gemini-2.5-flash");
          const prompt = `Сгенерируй персональную недельную программу тренировок на русском языке. Верни СТРОГО валидный JSON без markdown.

Параметры пользователя:
- Цель: ${input.goal}
- Место: ${input.location}
- Уровень: ${input.experience}
- Дней в неделю: ${input.days}

Формат:
{
  "program_name": "...",
  "goal": "${input.goal}",
  "split": "напр. Push/Pull/Legs или Full body",
  "weekly_calories_deficit_or_surplus": "напр. дефицит 400 ккал/день",
  "days": [
    {
      "day": "Понедельник",
      "focus": "Грудь и трицепс",
      "exercises": [
        {"name": "Жим лёжа", "sets": 4, "reps": "8-12", "rest": "90 сек", "tip": "Держи лопатки сведёнными"}
      ],
      "cardio": "20 мин ходьба 6 км/ч",
      "duration_minutes": 60
    }
  ],
  "nutrition_tip": "...",
  "motivation": "..."
}

Требования:
- Ровно ${input.days} тренировочных дней с днями недели по порядку.
- В каждом дне 5-7 упражнений, подходящих под место (${input.location}) и уровень (${input.experience}).
- Указывай реалистичные подходы/повторы/отдых.
- Кардио и nutrition_tip учитывают цель "${input.goal}".`;
          const { text } = await generateText({ model, prompt });
          const parsed = JSON.parse(extractJson(text));
          const validated = Schema.parse(parsed);
          return Response.json(validated);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          const status = /rate limit|429/i.test(message) ? 429 : /402|credit/i.test(message) ? 402 : 500;
          return new Response(JSON.stringify({ error: message }), { status, headers: { "Content-Type": "application/json" } });
        }
      },
    },
  },
});