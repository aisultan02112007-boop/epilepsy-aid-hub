import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const QuizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        hint: z.string(),
        scenario: z.string(),
        options: z
          .array(z.object({
            text: z.string(),
            correct: z.boolean(),
            explanation: z.string(),
          }))
          .min(5).max(5),
      }),
    )
    .min(10).max(10),
});

const PROMPT = `Сгенерируй 10 уникальных вопросов по первой помощи при эпилептическом приступе.

Требования:
- Ровно 10 вопросов.
- Каждый вопрос содержит "scenario" (короткий контекст — место/ситуация, напр. "Дома", "На улице", "В школе", "На работе", "В транспорте"), "question" (сам вопрос), "hint" (короткая обучающая подсказка) и "options".
- Ровно 5 вариантов ответа. РОВНО один правильный (correct=true), четыре неправильных (correct=false).
- Каждый вариант: "text", "correct" (boolean), "explanation" (почему правильно или неправильно).
- Варьируй сценарии: дом, улица, школа, работа, транспорт.
- Весь текст — на русском.
- Медицински корректно: положить на бок, ничего в рот, засечь время, не удерживать силой, скорая если > 5 мин и т.д.
- Не повторяй вопросы.`;

export const Route = createFileRoute("/api/public/simulation")({
  server: {
    handlers: {
      POST: async () => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
        try {
          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("google/gemini-3-flash-preview");
          const { experimental_output } = await generateText({
            model,
            experimental_output: Output.object({ schema: QuizSchema }),
            prompt: PROMPT,
          });
          return Response.json(experimental_output);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          const status = /rate limit|429/i.test(message) ? 429 : /402|credit/i.test(message) ? 402 : 500;
          return new Response(JSON.stringify({ error: message }), {
            status, headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
