const Ks = [
  {
    id: "depth",
    kind: "hud",
    when: ["start"],
    at: "depth",
    line: null,
  },
  {
    id: "time",
    kind: "hud",
    when: ["start"],
    at: "time",
    line: null,
  },
  {
    id: "gas",
    kind: "hud",
    when: ["start"],
    at: "tanks",
    line: null,
  },
  {
    id: "camera",
    kind: "button",
    when: ["start"],
    at: "camera",
    line: "Посвети на находку и удержи камеру до вспышки.",
  },
  {
    id: "auto",
    kind: "button",
    when: ["start"],
    at: "auto",
    line: "Под сводом удерживай «Автоплыв» или F, чтобы следовать по линии. В шахте управляй подъёмом сам.",
  },
  {
    id: "ascent",
    kind: "hud",
    when: ["ascending"],
    at: "ascent",
    line: "Стрелки над тобой — скорость подъёма. Загорелась красная — слишком быстро.",
  },
  {
    id: "turnMarks",
    kind: "hud",
    when: ["rule"],
    at: "tanks",
    line: (state) => {
      const tank = state?.tanks.find(item => item.id === "back");
      return tank?.marks?.length
        ? `Пора назад при ${Math.round(tank.marks[0])} бар. Остальной газ оставляем на выход и задержки. Развернуться можно раньше.`
        : "При входе в пещеру на манометре появится отметка разворота.";
    },
  },
  {
    id: "turnHit",
    kind: "hint",
    when: ["turnMarkHit"],
    needs: "turnMarks",
    at: "tanks",
    line: "Достигнута отметка разворота. Оставшийся газ запланирован на выход и задержки.",
  },
  {
    id: "ndl",
    kind: "hud",
    when: ["ndlNear"],
    at: "ndl",
    line: "Столько ещё можно без остановок. Кончится — наверх только со стопом.",
  },
  {
    id: "deco",
    kind: "hud",
    when: ["decoStart"],
    at: "deco",
    line: "Стоп: глубина и время. Справа — оценка подъёма со стопами. Путь из пещеры и запас газа в неё не входят.",
  },
  {
    id: "wait",
    kind: "button",
    when: ["decoStart"],
    at: "wait",
    line: "В скобке остановки нажми «Ждать» или H — время пойдёт быстрее. Движение отменит ожидание.",
  },
  {
    id: "ruler",
    kind: "hud",
    when: ["decoStart", "narc"],
    at: "ruler",
    line: "Линейка глубины: окно стопа, потолок и опасные глубины.",
  },
  {
    id: "narcLine",
    kind: "hud",
    when: ["narc"],
    at: "ruler",
    lesson: "narc",
    line: te("narc").lines[0].text,
  },
  {
    id: "currentHint", kind: "hint", when: ["current"], at: "tanks", lesson: "current",
    line: te("current").lines[0].text,
  },
  {
    id: "haloclineHint", kind: "hint", when: ["halocline"], at: "depth", lesson: "halocline",
    line: te("halocline").lines[0].text,
  },
  {
    id: "ppo2",
    kind: "hud",
    when: ["secondGas"],
    at: "ppo2",
    line: `Кислород под давлением. Выше ${Kt.PPO2_MAX.toFixed(1)} — яд: судороги.`,
  },
  {
    id: "gasMenu",
    kind: "hud",
    when: ["secondGas"],
    at: "gasTile",
    line: `Газ: коснись — список баллонов, держи строку — смена. У воздуха предел ${Eh} м, у EAN50 — ${bs}.`,
  },
  {
    id: "ean50Hint",
    kind: "hint",
    when: ["ean50Depth"],
    needs: "gasMenu",
    at: "gasTile",
    line: `Мельче ${bs} м EAN50 безопасен. Смени газ — азот выйдет быстрее, стопы короче.`,
  },
  {
    id: "tie",
    kind: "button",
    when: ["lineEnd"],
    at: "tie",
    line: "У конца верёвки нажми «Начать линию». Теперь за тобой тянется нить, по которой можно вернуться.",
  },
  {
    id: "tieOffHint",
    kind: "hint",
    when: ["tieOffKind"],
    needs: "tie",
    at: "tie",
    line: "«Закрепить» у стены — линия ляжет посреди хода, не уйдёт в щель. Закрепляй на поворотах.",
  },
  {
    id: "arrow",
    kind: "button",
    when: ["tieOff"],
    at: "arrow",
    line: "Поставь стрелку на верёвке у поворота. Остриё укажет путь к выходу.",
  },
  {
    id: "cutHint",
    kind: "hint",
    when: ["cutKind"],
    needs: "tie",
    at: "tie",
    line: "Катушка пуста. «Обрезать» — конец на камне, дальше без линии. Это риск.",
  },
  {
    id: "leave",
    kind: "button",
    when: ["button"],
    at: "leave",
    line: `«Оставить» — баллон на верёвке, заберёшь на подъёме. Глубже ${bs} м им не дышат.`,
  },
  {
    id: "pickup",
    kind: "button",
    when: ["button"],
    at: "pickup",
    line: "«Подобрать» только пристёгивает. Дышать им — сменой газа.",
  },
  {
    id: "read",
    kind: "button",
    when: ["button"],
    at: "read",
    line: "Чтение ставит нырок на паузу. Закрой запись касанием или T. После возвращения она останется на карте.",
  },
  {
    id: "dash",
    kind: "button",
    when: ["gallery"],
    after: "turnMarks",
    at: "dash",
    line: `Рывок: быстрее, но дышишь в ${Math.round(De.GAS_MULT)} раза тяжелее и мутишь у дна.`,
  },
  { id: "valve", kind: "button", when: ["button"], at: null, line: null },
  { id: "torch", kind: "button", when: ["button"], at: null, line: null },
  { id: "untangle", kind: "button", when: ["button"], at: null, line: null },
];
// Persistence and checkpoints must recognize every real reveal, including
// ambient lessons; a separately maintained ID list used to reject valid dives.
const $s = Ks.map(def=>def.id);
function As(e) {
  return Ks.find((t) => t.id === e);
}
const fo = (e) => `leave:${e}`;
