import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const ScenarioSchema = z.object({
  location: z.string(),
  situation: z.string(),
  steps: z
    .array(
      z.object({
        question: z.string(),
        hint: z.string(),
        options: z
          .array(
            z.object({
              text: z.string(),
              correct: z.boolean(),
              explanation: z.string(),
            }),
          )
          .min(3)
          .max(3),
      }),
    )
    .min(3)
    .max(3),
  timer_seconds: z.number().int().min(30).max(300),
});

const PROMPT = `Сгенерируй уникальный сценарий первой помощи при эпилептическом приступе.

Требования:
- Поле "location": одно из "Дома", "На улице", "В школе" (на русском).
- Поле "situation": короткое описание ситуации (1-2 предложения) на русском.
- Ровно 3 шага в "steps". В каждом шаге 3 варианта ответа: один правильный, два неправильных.
- Каждый шаг включает "question", "hint" (короткая обучающая подсказка) и "options".
- В каждом варианте: "text", "correct" (true/false), "explanation" (почему правильно/неправильно).
- "timer_seconds": целое число секунд, отражающее ограничение по времени для последнего шага (обычно 60-180).
- Каждый раз меняй локацию, ситуацию и формулировки. Не повторяйся.
- Весь текст — на русском языке.
- Сценарий должен быть медицински корректным (положить на бок, ничего в рот, засечь время приступа и т.д.).`;

export const Route = createFileRoute("/api/public/simulation")({
  server: {
    handlers: {
      POST: async () => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response(
            JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        try {
          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("google/gemini-3-flash-preview");

          const { experimental_output } = await generateText({
            model,
            experimental_output: Output.object({ schema: ScenarioSchema }),
            prompt: PROMPT,
          });

          return Response.json(experimental_output);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          const status = /rate limit|429/i.test(message)
            ? 429
            : /402|credit/i.test(message)
              ? 402
              : 500;
          return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});