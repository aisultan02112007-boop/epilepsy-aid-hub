import { Apple, Droplets, Ban, ClipboardList } from "lucide-react";

const SECTIONS = [
  {
    icon: Apple,
    title: "Основы питания при похудении",
    text: "Главное правило — дефицит калорий: тратишь больше, чем съедаешь. Распределяй макросы: белок 1.6–2 г на кг веса, жиры 0.8–1 г, остальное — углеводы. Белок сохраняет мышцы и насыщает.",
  },
  {
    icon: Droplets,
    title: "Водный баланс",
    text: "Норма — 30 мл воды на кг веса. Достаточная гидратация ускоряет метаболизм, снижает чувство голода и улучшает работу мышц. Стакан воды за 20 минут до еды помогает не переедать.",
  },
  {
    icon: Ban,
    title: "Мифы о диетах",
    text: "«Не есть после 18:00» — миф, важна общая калорийность за день. «Жир делает жирным» — нет, лишний вес даёт профицит калорий. «Безуглеводка лучшая» — нет, она тяжела и часто срывается.",
  },
  {
    icon: ClipboardList,
    title: "Пример меню на день (~1800 ккал)",
    text: "Завтрак: овсянка на молоке, яйца, ягоды. Перекус: яблоко + горсть орехов. Обед: курица, гречка, овощной салат с оливковым маслом. Перекус: творог 5%. Ужин: рыба запечённая + овощи на пару.",
  },
];

export function Nutrition() {
  return (
    <div className="mx-auto" style={{ maxWidth: 880, padding: "100px 24px 80px" }}>
      <section className="text-center mb-12 animate-fade-up">
        <p style={{ color: "#2563EB", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Питание
        </p>
        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 900, letterSpacing: "-0.02em", marginTop: 8,
            background: "linear-gradient(135deg, #1E293B 0%, #2563EB 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}
        >
          Питание для результата
        </h1>
        <p className="text-soft mt-3" style={{ fontSize: 17 }}>
          Без правильной еды тренировки работают на 30%.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-5">
        {SECTIONS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="glass-card animate-fade-up"
              style={{ padding: 28, animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="flex items-center justify-center mb-4"
                style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                  boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
                }}
              >
                <Icon size={26} color="#fff" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#0F172A" }}>{s.title}</h2>
              <p className="text-soft" style={{ fontSize: 15, lineHeight: 1.6 }}>{s.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}