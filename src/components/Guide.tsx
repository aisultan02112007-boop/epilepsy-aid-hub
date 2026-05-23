import { useMemo, useState } from "react";
import {
  Scale, Flame, Calculator, Repeat, Dumbbell, Apple, Beef, Droplet,
  Moon, HeartPulse, Activity, Zap, Sparkles, GlassWater, Search,
} from "lucide-react";

type Topic = {
  key: string;
  icon: typeof Scale;
  title: string;
  tagline: string;
  summary: string;
  facts: string[];
  bullets: string[];
  tag: "Тело" | "Питание" | "Тренировки" | "Восстановление";
};

const TOPICS: Topic[] = [
  {
    key: "obesity", icon: Scale, tag: "Тело",
    title: "Ожирение",
    tagline: "Это не лень, это нарушение энергобаланса",
    summary: "Ожирение — хроническое состояние, при котором ИМТ ≥ 30. Главная причина — длительный профицит калорий + малоподвижность.",
    facts: [
      "По данным ВОЗ, ожирение утроилось с 1975 года.",
      "Висцеральный жир выделяет воспалительные цитокины — это повышает риск диабета 2 типа.",
    ],
    bullets: ["ИМТ ≥ 30 = ожирение", "Решается дефицитом и движением", "Это управляемо, не приговор"],
  },
  {
    key: "fatloss", icon: Flame, tag: "Тело",
    title: "Жиросжигание",
    tagline: "Жир уходит только при дефиците калорий",
    summary: "Нельзя «сжечь жир локально». Тело берёт энергию из жировых депо по всему организму, когда есть дефицит.",
    facts: [
      "1 кг жира ≈ 7700 ккал.",
      "Безопасный темп — 0.5–1% массы тела в неделю.",
    ],
    bullets: ["Дефицит 10–20% от поддержки", "Белок 1.6–2 г/кг", "Силовые сохраняют мышцы"],
  },
  {
    key: "deficit", icon: Calculator, tag: "Питание",
    title: "Калорийный дефицит",
    tagline: "Главный закон похудения",
    summary: "Дефицит — когда расход калорий больше прихода. Любая «магическая» диета работает только через дефицит.",
    facts: [
      "Средний дефицит 300–500 ккал/день даёт ~0.3–0.5 кг/нед.",
      "Слишком большой дефицит = потеря мышц и срыв.",
    ],
    bullets: ["Считай TDEE", "Минус 15–20%", "Веди дневник 2 недели"],
  },
  {
    key: "recomp", icon: Repeat, tag: "Тело",
    title: "Рекомпозиция",
    tagline: "Меньше жира + больше мышц одновременно",
    summary: "Возможна у новичков, после долгого перерыва или при возврате в спорт. Нужны: высокий белок, силовые, лёгкий дефицит.",
    facts: [
      "Лучше всего работает у новичков и людей с лишним весом.",
      "У опытных атлетов — медленнее, но возможна.",
    ],
    bullets: ["Белок 2 г/кг", "Прогрессия в зале", "Слип ≥ 7 ч"],
  },
  {
    key: "muscle", icon: Dumbbell, tag: "Тренировки",
    title: "Набор мышц",
    tagline: "Профицит + прогрессия нагрузки",
    summary: "Мышцы растут от механического напряжения и регулярного увеличения нагрузки при достаточном питании и сне.",
    facts: [
      "Натуральный максимум — ~0.5–1 кг мышц/мес у новичков.",
      "10–20 рабочих подходов на группу в неделю — оптимум.",
    ],
    bullets: ["Профицит 200–300 ккал", "8–12 повторов на массу", "Прогресс в весе/повторах"],
  },
  {
    key: "nutrition", icon: Apple, tag: "Питание",
    title: "Питание",
    tagline: "Качество еды решает самочувствие",
    summary: "80% рациона — цельные продукты: овощи, мясо/рыба, крупы, фрукты. 20% — что хочешь. Так проще соблюдать долго.",
    facts: [
      "Клетчатка снижает аппетит и стабилизирует сахар.",
      "Овощи занимают объём желудка при низкой калорийности.",
    ],
    bullets: ["Белок в каждый приём", "Клетчатка 25–35 г/день", "Минимум жидких калорий"],
  },
  {
    key: "macros", icon: Beef, tag: "Питание",
    title: "БЖУ",
    tagline: "Белки, жиры, углеводы — ваше топливо",
    summary: "Белок — 1.6–2 г/кг, жиры — 0.8–1 г/кг (минимум), углеводы — остальное по калориям и активности.",
    facts: [
      "Белок термогенен — на его усвоение уходит до 30% его калорий.",
      "Жиры нужны для гормонов, не убирай их полностью.",
    ],
    bullets: ["Белок: курица, рыба, творог", "Жиры: орехи, оливковое, авокадо", "Углеводы: крупы, фрукты"],
  },
  {
    key: "sleep", icon: Moon, tag: "Восстановление",
    title: "Сон",
    tagline: "Главный анаболик и жиросжигатель",
    summary: "Меньше 6 ч сна = рост грелина (голод) и падение лептина (насыщения). Похудение замедляется, мышцы хуже растут.",
    facts: [
      "Недосып повышает тягу к сахару на 30–50%.",
      "Тестостерон падает на 10–15% после недели плохого сна.",
    ],
    bullets: ["7–9 часов", "Темнота и прохлада", "Без экранов за 30 мин"],
  },
  {
    key: "recovery", icon: HeartPulse, tag: "Восстановление",
    title: "Восстановление",
    tagline: "Мышцы растут не в зале, а после",
    summary: "Тренировка — стресс. Прогресс происходит во время отдыха. Без восстановления — плато и травмы.",
    facts: [
      "ЦНС восстанавливается дольше, чем мышцы.",
      "Разгрузочная неделя каждые 6–10 недель снимает усталость.",
    ],
    bullets: ["Дни отдыха 2–3/нед", "Лёгкая ходьба", "Растяжка и мобилити"],
  },
  {
    key: "cardio", icon: Activity, tag: "Тренировки",
    title: "Кардио",
    tagline: "Здоровье сердца + лишние калории",
    summary: "Низкоинтенсивное кардио (Zone 2) развивает выносливость и почти не мешает восстановлению. HIIT экономит время.",
    facts: [
      "10 000 шагов сжигают ~300–400 ккал.",
      "Zone 2: пульс 60–70% от максимума, можно говорить.",
    ],
    bullets: ["3–5 раз в неделю", "20–45 мин", "Шаги — лучшее ежедневное кардио"],
  },
  {
    key: "strength", icon: Dumbbell, tag: "Тренировки",
    title: "Силовые",
    tagline: "Фундамент тела и метаболизма",
    summary: "Силовые увеличивают мышцы, плотность костей и базовый расход калорий. Главное — прогрессия нагрузки.",
    facts: [
      "1 кг мышц тратит ~13 ккал в покое — против ~4 ккал у жира.",
      "Базовые упражнения (присед, тяга, жим) самые эффективные.",
    ],
    bullets: ["3–5 тренировок/нед", "Прогрессия — закон", "Техника > вес"],
  },
  {
    key: "metabolism", icon: Zap, tag: "Тело",
    title: "Метаболизм",
    tagline: "Не «сломан» — он адаптируется",
    summary: "BMR зависит от массы, мышц, возраста и активности. При долгом дефиците он немного снижается — это нормально.",
    facts: [
      "Адаптивный термогенез снижает расход на 5–15%.",
      "Силовые и больше мышц = выше расход в покое.",
    ],
    bullets: ["Не «разгоняется» едой каждые 2 ч", "Двигайся больше — NEAT", "Стройте мышцы"],
  },
  {
    key: "habits", icon: Sparkles, tag: "Тело",
    title: "Привычки",
    tagline: "Маленькие действия > сила воли",
    summary: "Системы побеждают мотивацию. 1% улучшения каждый день = в 37 раз лучше за год.",
    facts: [
      "На формирование привычки уходит в среднем 66 дней.",
      "Цепочка «триггер → действие → награда» — основа любой привычки.",
    ],
    bullets: ["Стакан воды утром", "Шаги после еды", "Спать в одно время"],
  },
  {
    key: "hydration", icon: GlassWater, tag: "Питание",
    title: "Гидратация",
    tagline: "Вода = энергия и аппетит под контролем",
    summary: "Норма ~30 мл/кг массы. Лёгкое обезвоживание снижает силу и концентрацию, повышает чувство голода.",
    facts: [
      "Потеря 2% воды снижает производительность на 10–20%.",
      "Часто «голод» — это жажда. Попробуй воду первой.",
    ],
    bullets: ["~30 мл/кг", "Стакан перед едой", "Кофе считается, алкоголь — нет"],
  },
];

const TAGS = ["Все", "Тело", "Питание", "Тренировки", "Восстановление"] as const;

export function Guide() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<(typeof TAGS)[number]>("Все");
  const [active, setActive] = useState<Topic | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOPICS.filter((t) => {
      if (tag !== "Все" && t.tag !== tag) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q)
      );
    });
  }, [query, tag]);

  return (
    <div className="mx-auto" style={{ maxWidth: 1100, padding: "100px 24px 80px" }}>
      <section className="text-center mb-10 animate-fade-up">
        <p style={{ color: "#2563EB", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Гид
        </p>
        <h1
          style={{
            fontSize: "clamp(34px, 6vw, 54px)", fontWeight: 900, letterSpacing: "-0.02em", marginTop: 8,
            background: "linear-gradient(135deg, #1E293B 0%, #2563EB 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}
        >
          Знания, которые меняют тело
        </h1>
        <p className="text-soft mt-3" style={{ fontSize: 16, maxWidth: 560, margin: "12px auto 0" }}>
          Короткие научные карточки. Открой любую — читай за 30 секунд.
        </p>
      </section>

      <div className="glass-card flex flex-wrap items-center gap-3 mb-6" style={{ padding: 14 }}>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]" style={{ paddingLeft: 6 }}>
          <Search size={18} color="#64748B" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти тему..."
            style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              fontSize: 15, color: "#0F172A", padding: "8px 4px",
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => {
            const isActive = tag === t;
            return (
              <button
                key={t}
                onClick={() => setTag(t)}
                style={{
                  padding: "8px 14px", borderRadius: 999, fontWeight: 700, fontSize: 13,
                  background: isActive ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "rgba(255,255,255,0.8)",
                  color: isActive ? "#fff" : "#1E293B",
                  border: "1px solid " + (isActive ? "transparent" : "rgba(148,163,184,0.35)"),
                  boxShadow: isActive ? "0 6px 16px rgba(37,99,235,0.3)" : "none",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t, i) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t)}
              className="glass-card text-left animate-fade-up"
              style={{ padding: 22, animationDelay: `${i * 0.05}s`, cursor: "pointer", transition: "transform 0.2s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    boxShadow: "0 6px 18px rgba(37,99,235,0.35)",
                  }}
                >
                  <Icon size={22} color="#fff" />
                </div>
                <span
                  style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                    color: "#2563EB", textTransform: "uppercase",
                    background: "rgba(37,99,235,0.1)", padding: "4px 10px", borderRadius: 999,
                  }}
                >
                  {t.tag}
                </span>
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.01em" }}>
                {t.title}
              </h3>
              <p className="text-soft mt-1.5" style={{ fontSize: 14, lineHeight: 1.5 }}>{t.tagline}</p>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="glass-card col-span-full text-center" style={{ padding: 40 }}>
            <p className="text-soft">Ничего не найдено. Попробуй другой запрос.</p>
          </div>
        )}
      </div>

      {active && (
        <div
          onClick={() => setActive(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 70,
            background: "rgba(15,23,42,0.55)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, animation: "fadeUp 0.25s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-strong"
            style={{ maxWidth: 560, width: "100%", padding: 32, maxHeight: "85vh", overflowY: "auto" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                  boxShadow: "0 8px 22px rgba(37,99,235,0.4)",
                }}
              >
                <active.icon size={24} color="#fff" />
              </div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.01em" }}>
                  {active.title}
                </h2>
                <p style={{ color: "#2563EB", fontSize: 13, fontWeight: 600 }}>{active.tagline}</p>
              </div>
            </div>

            <p style={{ fontSize: 15, lineHeight: 1.65, color: "#1E293B" }}>{active.summary}</p>

            <div className="mt-5 grid gap-2">
              {active.bullets.map((b) => (
                <div
                  key={b}
                  style={{
                    padding: "10px 14px", borderRadius: 12,
                    background: "rgba(37,99,235,0.08)",
                    border: "1px solid rgba(37,99,235,0.18)",
                    fontSize: 14, fontWeight: 600, color: "#1E293B",
                  }}
                >
                  • {b}
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "#64748B", textTransform: "uppercase", marginBottom: 8 }}>
                Интересные факты
              </p>
              <div className="grid gap-2">
                {active.facts.map((f) => (
                  <div
                    key={f}
                    style={{
                      padding: 12, borderRadius: 12,
                      background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))",
                      border: "1px solid rgba(255,255,255,0.5)",
                      fontSize: 13.5, lineHeight: 1.55, color: "#1E293B",
                    }}
                  >
                    ✦ {f}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActive(null)}
              className="btn-primary w-full mt-6"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}