import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { generateText } from "ai";
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
          .min(3).max(6),
      }),
    )
    .min(6).max(12),
});

const PROMPT = `Сгенерируй ровно 10 уникальных вопросов по первой помощи при эпилептическом приступе.

Верни СТРОГО валидный JSON без markdown, без \`\`\`, без пояснений — только сам JSON-объект.

Формат:
{
  "questions": [
    {
      "scenario": "Дома",
      "question": "Текст вопроса?",
      "hint": "Короткая подсказка.",
      "options": [
        {"text": "Вариант 1", "correct": true, "explanation": "Почему правильно."},
        {"text": "Вариант 2", "correct": false, "explanation": "Почему неправильно."},
        {"text": "Вариант 3", "correct": false, "explanation": "Почему неправильно."},
        {"text": "Вариант 4", "correct": false, "explanation": "Почему неправильно."},
        {"text": "Вариант 5", "correct": false, "explanation": "Почему неправильно."}
      ]
    }
  ]
}

Требования:
- Ровно 10 вопросов, в каждом ровно 5 вариантов.
- В каждом вопросе РОВНО один вариант с correct=true.
- Сценарии варьируй: Дома, На улице, В школе, На работе, В транспорте.
- Весь текст на русском.
- Медицински корректно (положить на бок, ничего в рот, засечь время, не удерживать силой, скорая если приступ > 5 мин).
- Не повторяй вопросы.`;

function extractJson(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}

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
          const model = gateway("google/gemini-2.5-flash");
          const { text } = await generateText({ model, prompt: PROMPT });
          const parsed = JSON.parse(extractJson(text));
          const validated = QuizSchema.parse(parsed);
          validated.questions = validated.questions.slice(0, 10);
          return Response.json(validated);
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
