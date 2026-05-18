import { Brain, AlertCircle, HandHelping, Stethoscope } from "lucide-react";

const SECTIONS = [
  {
    icon: Brain,
    title: "Что такое эпилепсия",
    text: "Эпилепсия — хроническое неврологическое расстройство, характеризующееся повторяющимися приступами из-за внезапных электрических разрядов в мозге. Это не заразное и не психическое заболевание.",
  },
  {
    icon: AlertCircle,
    title: "Признаки приступа",
    text: "Внезапное падение, судороги конечностей, потеря сознания, пена изо рта, закатывание глаз, временная остановка дыхания. Приступ обычно длится 1–3 минуты.",
  },
  {
    icon: HandHelping,
    title: "Что делать",
    text: "Сохраняйте спокойствие. Уберите опасные предметы. Положите человека на бок. Подложите мягкое под голову. Засеките время. Не вкладывайте ничего в рот. Не удерживайте силой.",
  },
  {
    icon: Stethoscope,
    title: "Когда вызывать скорую",
    text: "Если приступ длится более 5 минут, повторяется без восстановления сознания, случился впервые, человек получил травму, тяжело дышит после приступа, или это ребёнок/беременная женщина.",
  },
];

export function Info() {
  return (
    <div className="mx-auto" style={{ maxWidth: 880, padding: "100px 24px 80px" }}>
      <section className="text-center mb-12 animate-fade-up">
        <p style={{ color: "#93C5FD", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Образование
        </p>
        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 56px)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            marginTop: 8,
            background: "linear-gradient(135deg, #fff 0%, #93C5FD 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Всё об эпилепсии
        </h1>
        <p className="text-soft mt-3" style={{ fontSize: 17 }}>
          Знание спасает жизни — изучи основы за 5 минут.
        </p>
      </section>

      <div className="flex flex-col gap-5">
        {SECTIONS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="glass-card animate-fade-up flex gap-5"
              style={{ padding: 28, animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                  boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
                }}
              >
                <Icon size={26} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{s.title}</h2>
                <p className="text-soft" style={{ fontSize: 15, lineHeight: 1.6 }}>{s.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
