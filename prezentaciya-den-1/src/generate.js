// Презентация Дня 1 — «Цифровой сотрудник» (18:00–21:00, 7 модулей).
// Сборка: node generate.js  ->  Den-1-Cifrovoy-sotrudnik.pptx
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const fa6 = require("react-icons/fa6");
const { buildScenes } = require("./scenes");

const OUT = path.join(__dirname, "Den-1-Cifrovoy-sotrudnik.pptx");
const ASSETS = path.join(__dirname, "assets");

// Палитра «вечер в Зверограде»
const NIGHT = "150C2C";
const INK = "241C40";
const MUTED = "6E6788";
const ACCENT = "FF7A3D";
const TEAL = "17B8A6";
const GOLD = "FFC94D";
const SOFT = "F5F3FB";
const SOFT_ACCENT = "FFF0E6";
const WHITE = "FFFFFF";
const FONT = "Arial";

const W = 13.33, H = 7.5;

async function renderIcon(name, Comp, hex) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { color: "#" + hex, size: 512 })
  );
  const p = path.join(ASSETS, `icon-${name}-${hex}.png`);
  await sharp(Buffer.from(svg)).resize(512, 512).png().toFile(p);
  return p;
}

async function main() {
  fs.mkdirSync(ASSETS, { recursive: true });
  const scenes = await buildScenes(ASSETS);

  const iconDefs = {
    mic: fa6.FaMicrophone, robot: fa6.FaRobot, chat: fa6.FaCommentDots,
    db: fa6.FaDatabase, doc: fa6.FaFileLines, clock: fa6.FaClock,
    bolt: fa6.FaBolt, rocket: fa6.FaRocket, list: fa6.FaListCheck,
    check: fa6.FaCircleCheck, mug: fa6.FaMugHot, calc: fa6.FaCalculator,
    wand: fa6.FaWandMagicSparkles, target: fa6.FaBullseye, key: fa6.FaKeyboard,
    mail: fa6.FaEnvelope, pen: fa6.FaPenNib, share: fa6.FaShareNodes,
    filter: fa6.FaFilter, user: fa6.FaUserCheck, hand: fa6.FaHandshake,
    bell: fa6.FaBell, moon: fa6.FaMoon,
  };
  const icons = {};
  for (const [name, Comp] of Object.entries(iconDefs)) {
    icons[name] = await renderIcon(name, Comp, WHITE);
  }

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Салават";
  pres.title = "Цифровой сотрудник — День 1";

  const notesJoin = (lines) => lines.join("\n");

  function iconCircle(slide, x, y, d, color, iconKey) {
    slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color } });
    const pad = d * 0.27;
    slide.addImage({ path: icons[iconKey], x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad });
  }

  // ---------- шаблоны слайдов ----------

  function divider(sceneKey, { kicker, title, sub, notes }) {
    const s = pres.addSlide();
    s.addImage({ path: scenes[sceneKey], x: 0, y: 0, w: W, h: H });
    s.addText(kicker, {
      x: 0.85, y: 4.55, w: 11.6, h: 0.5, margin: 0,
      fontFace: FONT, fontSize: 17, bold: true, color: GOLD, charSpacing: 4,
    });
    s.addText(title, {
      x: 0.85, y: 5.0, w: 11.6, h: 1.1, margin: 0,
      fontFace: FONT, fontSize: 42, bold: true, color: WHITE,
    });
    if (sub) s.addText(sub, {
      x: 0.85, y: 6.15, w: 11.6, h: 0.6, margin: 0,
      fontFace: FONT, fontSize: 18, color: "E8E4F5",
    });
    s.addNotes(notes);
    return s;
  }

  function darkBase() {
    const s = pres.addSlide();
    s.background = { color: NIGHT };
    s.addImage({ path: scenes.strip, x: 0, y: H - 1.53, w: W, h: 1.53, transparency: 35 });
    return s;
  }

  function bigStat({ stat, label, sub, notes }) {
    const s = darkBase();
    s.addText(stat, {
      x: 0.7, y: 1.75, w: 11.93, h: 2.2, margin: 0, align: "center",
      fontFace: FONT, fontSize: stat.length > 5 ? 84 : 120, bold: true, color: ACCENT,
    });
    s.addText(label, {
      x: 1.6, y: 4.1, w: 10.13, h: 0.7, margin: 0, align: "center",
      fontFace: FONT, fontSize: 22, color: WHITE,
    });
    if (sub) s.addText(sub, {
      x: 1.6, y: 4.85, w: 10.13, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 15, color: "B8B0D6",
    });
    s.addNotes(notes);
    return s;
  }

  function statement({ text, sub, notes }) {
    const s = darkBase();
    s.addText(text, {
      x: 1.3, y: 2.3, w: 10.73, h: 2.0, margin: 0, align: "center",
      fontFace: FONT, fontSize: 36, bold: true, color: WHITE,
    });
    if (sub) s.addText(sub, {
      x: 2.0, y: 4.5, w: 9.33, h: 0.6, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, italic: true, color: GOLD,
    });
    s.addNotes(notes);
    return s;
  }

  function content(title, notes) {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addText(title, {
      x: 0.7, y: 0.45, w: 11.93, h: 0.75, margin: 0,
      fontFace: FONT, fontSize: 30, bold: true, color: INK,
    });
    s.addNotes(notes);
    return s;
  }

  function card(slide, x, y, w, h, { iconKey, iconColor, head, body }) {
    slide.addShape("roundRect", {
      x, y, w, h, rectRadius: 0.12, fill: { color: SOFT },
      shadow: { type: "outer", color: "3A2E5F", opacity: 0.18, blur: 8, offset: 3, angle: 90 },
    });
    iconCircle(slide, x + 0.35, y + 0.35, 0.75, iconColor, iconKey);
    slide.addText(head, {
      x: x + 0.35, y: y + 1.28, w: w - 0.7, h: 0.75, margin: 0,
      fontFace: FONT, fontSize: 17, bold: true, color: INK,
    });
    if (body) slide.addText(body, {
      x: x + 0.35, y: y + 2.0, w: w - 0.7, h: h - 2.25, margin: 0,
      fontFace: FONT, fontSize: 13, color: MUTED,
    });
  }

  // ================================================================
  // 1 — Титул
  {
    const s = pres.addSlide();
    s.addImage({ path: scenes.sunset, x: 0, y: 0, w: W, h: H });
    s.addText("ВЕЧЕРНИЙ ИНТЕНСИВ · 18:00–21:00", {
      x: 0.85, y: 3.95, w: 11.6, h: 0.5, margin: 0,
      fontFace: FONT, fontSize: 17, bold: true, color: GOLD, charSpacing: 4,
    });
    s.addText("Цифровой сотрудник", {
      x: 0.85, y: 4.45, w: 11.6, h: 1.3, margin: 0,
      fontFace: FONT, fontSize: 60, bold: true, color: WHITE,
    });
    s.addText("День 1 · 7 модулей · ваш первый ИИ-агент", {
      x: 0.85, y: 5.85, w: 11.6, h: 0.6, margin: 0,
      fontFace: FONT, fontSize: 20, color: "E8E4F5",
    });
    s.addNotes(notesJoin([
      "ТАЙМИНГ: слайд висит с 17:45, старт ровно в 18:00.",
      "До старта: Handy запущен и проверен, микрофон работает, агент для демо №2 открыт в соседней вкладке, фоновая музыка играет.",
      "Приветствие — 2 минуты, без долгой самопрезентации: одна фраза о себе и сразу обещание вечера: «через три часа у вас будет первый цифровой сотрудник и план внедрения».",
      "【пометка】 Имя спикера и логотип не добавлены — брифа с брендингом нет, вставить при необходимости.",
    ]));
  }

  // 2 — Воздушный: хук
  statement({
    text: "Сегодня вы наймёте сотрудника,\nкоторый работает круглосуточно\nи не просит зарплату.",
    sub: "и он выйдет на работу ещё до конца вечера",
    notes: notesJoin([
      "ТАЙМИНГ: 18:02–18:05.",
      "Хук из видеосценария приглашения. Произнести медленно, выдержать паузу после фразы.",
      "Сразу мостик: «Не верите? Смотрите — прямо сейчас, без слайдов».",
    ]),
  });

  // 3 — Демо №1: голосом через Handy
  {
    const s = content("Демо №1: ставлю задачу голосом", notesJoin([
      "ТАЙМИНГ: 18:05–18:12. ДЕМО ИДЁТ ПЕРВЫМ НОМЕРОМ — до любой теории (правило брифа).",
      "Сценарий: зажать хоткей Handy, голосом продиктовать: «Напиши вежливый ответ клиенту, который спрашивает про сроки доставки, и предложи два варианта». Показать, как текст появляется и агент выполняет.",
      "Проговаривать вслух каждое действие. После результата — тишина 3 секунды, пусть зал осознает.",
      "【пометка】 Подготовить запасной вариант: записанный ролик демо на случай отказа микрофона.",
    ]));
    const steps = [
      { iconKey: "key", color: ACCENT, head: "Зажал клавишу — говорю", body: "обычная человеческая речь" },
      { iconKey: "mic", color: TEAL, head: "Handy превращает речь в текст", body: "мгновенно, в любом окне" },
      { iconKey: "robot", color: INK, head: "Агент выполняет", body: "результат — у вас на глазах" },
    ];
    const cw = 3.74, gap = 0.35;
    steps.forEach((st, i) => {
      card(s, 0.7 + i * (cw + gap), 1.75, cw, 3.5, { iconKey: st.iconKey, iconColor: st.color, head: st.head, body: st.body });
      if (i < 2) s.addText("→", {
        x: 0.7 + (i + 1) * cw + i * gap - 0.06, y: 3.1, w: gap + 0.12, h: 0.6, margin: 0,
        align: "center", fontFace: FONT, fontSize: 26, bold: true, color: ACCENT,
      });
    });
    s.addText("Без монтажа. Без заготовок. Вживую.", {
      x: 0.7, y: 5.75, w: 11.93, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, italic: true, color: MUTED,
    });
  }

  // 4 — Воздушный: большая цифра
  bigStat({
    stat: "60 секунд",
    label: "от голосовой команды — до готового результата",
    sub: "вы только что видели это сами",
    notes: notesJoin([
      "ТАЙМИНГ: 18:12–18:13.",
      "Закрепление демо. Источник цифры — видеосценарий приглашения («найму сотрудника за 60 секунд»).",
      "【пометка】 Сверить формулировку с proof-bank: файл не найден в репозитории, цифра взята из masterclass-video-script.md.",
    ]),
  });

  // 5 — Маршрут вечера
  {
    const s = content("Маршрут вечера", notesJoin([
      "ТАЙМИНГ: 18:13–18:15. Пройти за минуту-полторы, не зачитывать каждый пункт.",
      "Обещание: «в 21:00 вы уйдёте с работающим навыком, первым агентом и планом внедрения».",
      "Показать, где перерыв, чтобы зал не ждал его раньше.",
      "【пометка】 Тайминг модулей — по умолчанию (по 20 минут); сверить с брифом NOCHNAYA-SESSIYA.md, когда он появится.",
    ]));
    const rows = [
      ["18:00", "Старт и демо голосом"], ["18:15", "М1 · Цифровой сотрудник"],
      ["18:35", "М2 · Голос вместо клавиатуры"], ["18:55", "М3 · Промпт = ТЗ"],
      ["19:15", "М4 · Агент для клиентов"], ["19:35", "Перерыв"],
      ["19:50", "М5 · Документы и отчёты"], ["20:10", "М6 · Заявки и CRM"],
      ["20:30", "М7 · План внедрения"], ["20:50", "Итоги и ДЗ"],
    ];
    rows.forEach(([t, label], i) => {
      const col = i < 5 ? 0 : 1;
      const row = i % 5;
      const x = 0.9 + col * 6.2, y = 1.7 + row * 1.02;
      const isBreak = label === "Перерыв";
      s.addShape("ellipse", { x, y: y + 0.13, w: 0.22, h: 0.22, fill: { color: isBreak ? GOLD : ACCENT } });
      s.addText(t, {
        x: x + 0.42, y, w: 1.05, h: 0.5, margin: 0,
        fontFace: FONT, fontSize: 17, bold: true, color: isBreak ? "B8860B" : ACCENT,
      });
      s.addText(label, {
        x: x + 1.55, y, w: 4.5, h: 0.5, margin: 0,
        fontFace: FONT, fontSize: 16, color: INK,
      });
    });
  }

  // ================================================================
  // МОДУЛЬ 1
  divider("indigo", {
    kicker: "МОДУЛЬ 1 · 18:15",
    title: "Знакомьтесь: цифровой сотрудник",
    sub: "кто он и почему появился именно сейчас",
    notes: notesJoin([
      "ТАЙМИНГ: 18:15–18:35 (20 минут на модуль 1).",
      "Переход: «То, что вы видели, — не фокус. Разберёмся, кто этот сотрудник и что он умеет».",
      "Полноэкранная сцена Зверограда — дать 2 секунды на разглядывание, не тараторить поверх.",
    ]),
  });

  {
    const s = content("Что он умеет уже сегодня", notesJoin([
      "ТАЙМИНГ: 18:16–18:24.",
      "По каждой карточке — микро-история из практики (истории и цифры кейсов — только из proof-bank).",
      "Формулировки — из видеосценария: отвечает клиентам, ведёт заявки в CRM, готовит отчёты и документы.",
      "Акцент: это не «когда-нибудь потом», это работает сегодня.",
    ]));
    const items = [
      { iconKey: "chat", color: ACCENT, head: "Отвечает клиентам", body: "в мессенджерах, мгновенно, в тоне бренда" },
      { iconKey: "db", color: TEAL, head: "Ведёт заявки в CRM", body: "принимает, заполняет, ничего не забывает" },
      { iconKey: "doc", color: INK, head: "Готовит отчёты и документы", body: "по шаблону, без напоминаний" },
    ];
    const cw = 3.74, gap = 0.35;
    items.forEach((it, i) => card(s, 0.7 + i * (cw + gap), 1.75, cw, 3.5, { iconKey: it.iconKey, iconColor: it.color, head: it.head, body: it.body }));
    s.addText("За минуты — а не за часы.", {
      x: 0.7, y: 5.75, w: 11.93, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, italic: true, color: MUTED,
    });
  }

  {
    const s = content("Почему это доступно каждому", notesJoin([
      "ТАЙМИНГ: 18:24–18:32.",
      "Снять три главных возражения: «нужны программисты», «это дорого», «это сырое».",
      "«Сотни компаний» — формулировка из видеосценария. 【пометка】 сверить с proof-bank, при наличии точной цифры — заменить.",
      "В конце модуля — вопрос залу: «у кого из вас рутина съедает больше часа в день?» — поднятые руки станут мостиком к М2.",
    ]));
    const rows = [
      { iconKey: "user", color: ACCENT, head: "Без программистов", body: "настраивается словами, а не кодом" },
      { iconKey: "calc", color: TEAL, head: "Без миллионных бюджетов", body: "дешевле стажёра" },
      { iconKey: "rocket", color: INK, head: "Уже работает в сотнях компаний", body: "это не эксперимент, а практика" },
    ];
    rows.forEach((rw, i) => {
      const y = 1.75 + i * 1.65;
      s.addShape("roundRect", { x: 0.9, y, w: 11.5, h: 1.35, rectRadius: 0.1, fill: { color: SOFT } });
      iconCircle(s, 1.2, y + 0.3, 0.75, rw.color, rw.iconKey);
      s.addText(rw.head, {
        x: 2.35, y: y + 0.22, w: 9.6, h: 0.5, margin: 0,
        fontFace: FONT, fontSize: 18, bold: true, color: INK,
      });
      s.addText(rw.body, {
        x: 2.35, y: y + 0.72, w: 9.6, h: 0.45, margin: 0,
        fontFace: FONT, fontSize: 14, color: MUTED,
      });
    });
  }

  bigStat({
    stat: "24/7",
    label: "не болеет · не выгорает · не уходит в отпуск",
    notes: notesJoin([
      "ТАЙМИНГ: 18:32–18:35. Воздушный слайд — дать повисеть.",
      "Цифра из видеосценария приглашения. 【пометка】 сверить с proof-bank.",
      "Шутка-мостик: «единственный сотрудник, который не просится в отпуск в августе».",
    ]),
  });

  // ================================================================
  // МОДУЛЬ 2
  divider("teal", {
    kicker: "МОДУЛЬ 2 · 18:35",
    title: "Голос вместо клавиатуры",
    sub: "Handy: ставим задачи со скоростью мысли",
    notes: notesJoin([
      "ТАЙМИНГ: 18:35–18:55.",
      "Переход: «Чтобы командовать цифровым сотрудником, не нужно даже печатать».",
      "Здесь зал впервые повторяет за спикером — убедиться, что у всех установлен Handy (ссылку — в чат заранее).",
    ]),
  });

  {
    const s = content("Как работает Handy", notesJoin([
      "ТАЙМИНГ: 18:36–18:44. Показать ещё раз медленно, теперь с объяснением каждого шага.",
      "Handy — бесплатное приложение с открытым кодом, распознавание идёт локально на компьютере. 【пометка】 проверить актуальность фактов на handy.computer перед показом.",
      "Подчеркнуть: текст появляется в ЛЮБОМ окне — почта, мессенджер, CRM, документ.",
    ]));
    const steps = [
      { iconKey: "key", color: ACCENT, head: "1 · Зажмите горячую клавишу", body: "в любой программе" },
      { iconKey: "mic", color: TEAL, head: "2 · Скажите мысль вслух", body: "как коллеге, без «компьютерного» языка" },
      { iconKey: "bolt", color: INK, head: "3 · Текст уже в окне", body: "почта, чат, документ — куда смотрите" },
    ];
    const cw = 3.74, gap = 0.35;
    steps.forEach((st, i) => card(s, 0.7 + i * (cw + gap), 1.75, cw, 3.5, { iconKey: st.iconKey, iconColor: st.color, head: st.head, body: st.body }));
    s.addText("Бесплатно · открытый код · работает локально", {
      x: 0.7, y: 5.75, w: 11.93, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, italic: true, color: MUTED,
    });
  }

  {
    const s = content("Практика: три задачи голосом", notesJoin([
      "ТАЙМИНГ: 18:44–18:52. Зал делает вместе со спикером, по одной задаче за раз.",
      "Ходить по залу, помогать тем, у кого не срабатывает хоткей.",
      "Правило вечера: «Сначала мысль — потом клавиша»: сформулируй фразу в голове, затем диктуй без пауз.",
      "Быстрый шеринг: 2–3 участника зачитывают, что получилось.",
    ]));
    const items = [
      { iconKey: "mail", color: ACCENT, head: "Письмо клиенту", body: "ответ на реальный вопрос из вашей почты" },
      { iconKey: "list", color: TEAL, head: "Задача для агента", body: "«сделай…» — по формуле из демо" },
      { iconKey: "pen", color: INK, head: "Пост для соцсетей", body: "о вашем продукте, 3 предложения" },
    ];
    const cw = 3.74, gap = 0.35;
    items.forEach((it, i) => card(s, 0.7 + i * (cw + gap), 1.75, cw, 3.5, { iconKey: it.iconKey, iconColor: it.color, head: it.head, body: it.body }));
    s.addText("Правило: сначала мысль — потом клавиша.", {
      x: 0.7, y: 5.75, w: 11.93, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, italic: true, color: MUTED,
    });
  }

  statement({
    text: "Говорить — быстрее, чем печатать.",
    sub: "голос — самый быстрый интерфейс между вами и агентом",
    notes: notesJoin([
      "ТАЙМИНГ: 18:52–18:55.",
      "【пометка】 На слайде сознательно нет цифры скорости: в proof-bank её найти не удалось. Если в proof-bank есть подтверждённое сравнение (например, «в N раз быстрее») — назвать его устно или добавить на слайд.",
      "Мостик к М3: «скорость есть — теперь научимся формулировать так, чтобы агент понимал с первого раза».",
    ]),
  });

  // ================================================================
  // МОДУЛЬ 3
  divider("plum", {
    kicker: "МОДУЛЬ 3 · 18:55",
    title: "Промпт — это ТЗ",
    sub: "формула задачи, которую агент понимает с первого раза",
    notes: notesJoin([
      "ТАЙМИНГ: 18:55–19:15.",
      "Ключевая мысль модуля: промпт — не заклинание, а обычное техзадание сотруднику.",
    ]),
  });

  {
    const s = content("Формула сильного промпта", notesJoin([
      "ТАЙМИНГ: 18:56–19:04.",
      "Разобрать каждый элемент на живом примере — том самом письме клиенту из практики М2.",
      "Роль: «ты — менеджер по продажам». Задача: «ответь на вопрос о сроках». Контекст: «доставка 3–5 дней, клиент торопится». Формат: «5 предложений, дружелюбно, без канцелярита».",
    ]));
    const parts = [
      { iconKey: "user", color: ACCENT, head: "Роль", body: "кем работает агент" },
      { iconKey: "target", color: TEAL, head: "Задача", body: "что сделать, глаголом" },
      { iconKey: "share", color: INK, head: "Контекст", body: "что нужно знать" },
      { iconKey: "doc", color: "8A5FBF", head: "Формат", body: "как выглядит результат" },
    ];
    const cw = 2.85, gap = 0.25;
    parts.forEach((p, i) => card(s, 0.7 + i * (cw + gap), 1.75, cw, 3.5, { iconKey: p.iconKey, iconColor: p.color, head: p.head, body: p.body }));
    s.addText("Роль + Задача + Контекст + Формат", {
      x: 0.7, y: 5.75, w: 11.93, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 18, bold: true, color: ACCENT,
    });
  }

  {
    const s = content("Почувствуйте разницу", notesJoin([
      "ТАЙМИНГ: 19:04–19:11. Показать вживую оба промпта и оба результата агента — контраст продаёт формулу лучше слов.",
      "Затем зал переписывает свой промпт из практики М2 по формуле.",
    ]));
    s.addShape("roundRect", { x: 0.7, y: 1.75, w: 5.75, h: 4.3, rectRadius: 0.12, fill: { color: "F3F2F6" } });
    s.addText("ТАК НЕ РАБОТАЕТ", {
      x: 1.1, y: 2.15, w: 4.95, h: 0.45, margin: 0,
      fontFace: FONT, fontSize: 15, bold: true, color: MUTED, charSpacing: 2,
    });
    s.addText("«Напиши пост»", {
      x: 1.1, y: 2.85, w: 4.95, h: 0.7, margin: 0,
      fontFace: FONT, fontSize: 22, italic: true, color: INK,
    });
    s.addText("Агент гадает — вы получаете «воду».", {
      x: 1.1, y: 5.2, w: 4.95, h: 0.6, margin: 0,
      fontFace: FONT, fontSize: 14, color: MUTED,
    });
    s.addShape("roundRect", { x: 6.88, y: 1.75, w: 5.75, h: 4.3, rectRadius: 0.12, fill: { color: SOFT_ACCENT } });
    s.addText("ТАК РАБОТАЕТ", {
      x: 7.28, y: 2.15, w: 4.95, h: 0.45, margin: 0,
      fontFace: FONT, fontSize: 15, bold: true, color: ACCENT, charSpacing: 2,
    });
    s.addText("Роль · Задача · Контекст · Формат —\nвсе четыре поля заполнены", {
      x: 7.28, y: 2.85, w: 4.95, h: 1.2, margin: 0,
      fontFace: FONT, fontSize: 18, bold: true, color: INK,
    });
    s.addText("Агент попадает в цель с первого раза.", {
      x: 7.28, y: 5.2, w: 4.95, h: 0.6, margin: 0,
      fontFace: FONT, fontSize: 14, color: MUTED,
    });
  }

  statement({
    text: "Агент работает ровно настолько хорошо,\nнасколько поставлена задача.",
    notes: notesJoin([
      "ТАЙМИНГ: 19:11–19:15. Итог модуля 3 — одна мысль, без комментариев сверх фразы.",
      "Мостик к М4: «формула есть — пора нанимать первого агента на настоящую работу».",
    ]),
  });

  // ================================================================
  // МОДУЛЬ 4
  divider("sunset", {
    kicker: "МОДУЛЬ 4 · 19:15",
    title: "Первый агент: отвечает клиентам",
    sub: "собираем автоответчик мечты — прямо сейчас",
    notes: notesJoin([
      "ТАЙМИНГ: 19:15–19:35. Это второе большое демо вечера.",
      "Энергию держать высоко: до перерыва 20 минут, зал уже подустал — больше действия, меньше теории.",
    ]),
  });

  {
    const s = content("Как это выглядит у клиента", notesJoin([
      "ТАЙМИНГ: 19:16–19:22.",
      "Сценарий из видеоприглашения: клиент пишет — агент мгновенно отвечает.",
      "Обязательно проговорить третий шаг: сложное агент передаёт человеку. Это снимает страх «робот нахамит клиенту».",
    ]));
    const steps = [
      { iconKey: "chat", color: ACCENT, head: "Клиент пишет", body: "в любое время — хоть ночью" },
      { iconKey: "robot", color: TEAL, head: "Агент отвечает", body: "по вашей базе знаний, в тоне бренда" },
      { iconKey: "hand", color: INK, head: "Сложное — человеку", body: "агент знает границы своих полномочий" },
    ];
    const cw = 3.74, gap = 0.35;
    steps.forEach((st, i) => {
      card(s, 0.7 + i * (cw + gap), 1.75, cw, 3.5, { iconKey: st.iconKey, iconColor: st.color, head: st.head, body: st.body });
      if (i < 2) s.addText("→", {
        x: 0.7 + (i + 1) * cw + i * gap - 0.06, y: 3.1, w: gap + 0.12, h: 0.6, margin: 0,
        align: "center", fontFace: FONT, fontSize: 26, bold: true, color: ACCENT,
      });
    });
    s.addText("Клиент получает ответ за секунды — всегда.", {
      x: 0.7, y: 5.75, w: 11.93, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, italic: true, color: MUTED,
    });
  }

  {
    const s = content("Собираем на ваших глазах", notesJoin([
      "ТАЙМИНГ: 19:22–19:33. ДЕМО №2: живая настройка агента, голосом через Handy.",
      "Взять бизнес добровольца из зала — его частые вопросы, его тон. Так демо становится личным для зала.",
      "Через 4 пункта чек-листа пройти по порядку, каждый диктуется голосом.",
      "【пометка】 Платформа для агента в брифе не указана — выбрать заранее ту, что используется в программе тренинга, и отрепетировать демо.",
    ]));
    const items = [
      { iconKey: "hand", color: ACCENT, head: "Приветствие", body: "первая фраза агента" },
      { iconKey: "list", color: TEAL, head: "5 частых вопросов", body: "и точные ответы на них" },
      { iconKey: "pen", color: INK, head: "Тон бренда", body: "как звучит ваша компания" },
      { iconKey: "filter", color: "8A5FBF", head: "Стоп-темы", body: "что агент передаёт человеку" },
    ];
    const cw = 2.85, gap = 0.25;
    items.forEach((it, i) => card(s, 0.7 + i * (cw + gap), 1.75, cw, 3.5, { iconKey: it.iconKey, iconColor: it.color, head: it.head, body: it.body }));
    s.addText("Четыре шага — и агент выходит на смену.", {
      x: 0.7, y: 5.75, w: 11.93, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, italic: true, color: MUTED,
    });
  }

  // Перерыв
  {
    const s = pres.addSlide();
    s.addImage({ path: scenes.amber, x: 0, y: 0, w: W, h: H });
    s.addText("ПЕРЕРЫВ · 15 МИНУТ", {
      x: 0.85, y: 4.8, w: 11.6, h: 0.55, margin: 0,
      fontFace: FONT, fontSize: 20, bold: true, color: GOLD, charSpacing: 4,
    });
    s.addText("Возвращаемся в 19:50", {
      x: 0.85, y: 5.35, w: 11.6, h: 1.0, margin: 0,
      fontFace: FONT, fontSize: 40, bold: true, color: WHITE,
    });
    s.addNotes(notesJoin([
      "ТАЙМИНГ: 19:35–19:50, ровно 15 минут — объявить время возврата вслух.",
      "Включить музыку. Остаться у сцены: кулуарные вопросы в перерыве — самые честные.",
      "За 2 минуты до конца перерыва — голосом позвать зал на места.",
    ]));
  }

  // ================================================================
  // МОДУЛЬ 5
  divider("indigo", {
    kicker: "МОДУЛЬ 5 · 19:50",
    title: "Документы и отчёты за минуты",
    sub: "рутинные тексты больше не ваша работа",
    notes: notesJoin([
      "ТАЙМИНГ: 19:50–20:10.",
      "Рестарт после перерыва — короткий вопрос залу: «что успели обсудить в перерыве?» — 1–2 ответа, и в бой.",
    ]),
  });

  {
    const s = content("Что агент пишет за вас", notesJoin([
      "ТАЙМИНГ: 19:51–20:02. По каждой карточке — показать готовый пример документа (заготовить заранее).",
      "Типы документов — из видеосценария: отчёты и документы; конкретный список — по умолчанию. 【пометка】 сверить набор с программой тренинга.",
      "Практика: каждый выбирает один документ и диктует промпт для него по формуле М3.",
    ]));
    const items = [
      { iconKey: "doc", color: ACCENT, head: "Коммерческое предложение", body: "под конкретного клиента" },
      { iconKey: "calc", color: TEAL, head: "Отчёт за неделю", body: "из ваших данных, по шаблону" },
      { iconKey: "list", color: INK, head: "Договор по шаблону", body: "с подстановкой реквизитов" },
      { iconKey: "mail", color: "8A5FBF", head: "Рассылка клиентам", body: "в тоне бренда, без «воды»" },
    ];
    const cw = 2.85, gap = 0.25;
    items.forEach((it, i) => card(s, 0.7 + i * (cw + gap), 1.75, cw, 3.5, { iconKey: it.iconKey, iconColor: it.color, head: it.head, body: it.body }));
    s.addText("Черновик — за минуты. Вам остаётся проверить и отправить.", {
      x: 0.7, y: 5.75, w: 11.93, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, italic: true, color: MUTED,
    });
  }

  statement({
    text: "Минуты — вместо часов.",
    sub: "формулировка из вашего же приглашения: «за минуты, а не за часы»",
    notes: notesJoin([
      "ТАЙМИНГ: 20:02–20:10 (оставшееся время — на практику из предыдущего слайда).",
      "Цифр на слайде нет сознательно: конкретные минуты/часы — только из proof-bank. 【пометка】 при наличии кейса в proof-bank («КП за N минут вместо N часов») — назвать его здесь устно.",
    ]),
  });

  // ================================================================
  // МОДУЛЬ 6
  divider("teal", {
    kicker: "МОДУЛЬ 6 · 20:10",
    title: "Заявки и CRM — без ручного ввода",
    sub: "агент как идеальный операционист",
    notes: notesJoin([
      "ТАЙМИНГ: 20:10–20:30.",
      "Мостик: «агент умеет говорить и писать — теперь научим его вести учёт»."
    ]),
  });

  {
    const s = content("Путь заявки без человека", notesJoin([
      "ТАЙМИНГ: 20:11–20:22. Показать на экране реальный сценарий: заявка из мессенджера появляется в CRM (сценарий b-roll из видеоприглашения).",
      "Боль, на которую давим: потерянные заявки и ошибки ручного переноса.",
      "【пометка】 Конкретная CRM для демо в брифе не указана — использовать ту, что в программе тренинга.",
    ]));
    const steps = [
      { iconKey: "share", color: ACCENT, head: "Заявка из любого канала", body: "мессенджер, сайт, почта, звонок" },
      { iconKey: "db", color: TEAL, head: "Агент вносит в CRM", body: "все поля, без опечаток, сразу" },
      { iconKey: "bell", color: INK, head: "Менеджеру — напоминание", body: "кто, о чём и когда перезвонить" },
    ];
    const cw = 3.74, gap = 0.35;
    steps.forEach((st, i) => {
      card(s, 0.7 + i * (cw + gap), 1.75, cw, 3.5, { iconKey: st.iconKey, iconColor: st.color, head: st.head, body: st.body });
      if (i < 2) s.addText("→", {
        x: 0.7 + (i + 1) * cw + i * gap - 0.06, y: 3.1, w: gap + 0.12, h: 0.6, margin: 0,
        align: "center", fontFace: FONT, fontSize: 26, bold: true, color: ACCENT,
      });
    });
    s.addText("Человек ничего не переносит руками.", {
      x: 0.7, y: 5.75, w: 11.93, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, italic: true, color: MUTED,
    });
  }

  statement({
    text: "Ни одна заявка не теряется.",
    sub: "каждая доходит до CRM и до менеджера",
    notes: notesJoin([
      "ТАЙМИНГ: 20:22–20:30 (запас — на вопросы по модулю).",
      "Одна мысль на слайд. Дать залу примерить на свой поток заявок: «сколько заявок в месяц у вас тонет?» — риторический вопрос.",
    ]),
  });

  // ================================================================
  // МОДУЛЬ 7
  divider("plum", {
    kicker: "МОДУЛЬ 7 · 20:30",
    title: "Ваш план внедрения",
    sub: "что автоматизировать первым — и сколько это сэкономит",
    notes: notesJoin([
      "ТАЙМИНГ: 20:30–20:50. Самый практичный модуль — участники работают со своим бизнесом.",
      "Обещание из приглашения: «уйдёте с готовым планом: что автоматизировать первым и сколько это сэкономит именно вам».",
    ]),
  });

  {
    const s = content("Что автоматизировать первым", notesJoin([
      "ТАЙМИНГ: 20:31–20:40. Каждый участник письменно (или голосом в заметку) отвечает на три вопроса для 3–5 своих процессов.",
      "Процесс, набравший три «да», — первый кандидат на автоматизацию.",
      "Пройти по залу, помочь 2–3 участникам вслух — их примеры полезны всем.",
    ]));
    const items = [
      { iconKey: "clock", color: ACCENT, head: "Повторяется каждый день?", body: "рутина — лучший кандидат" },
      { iconKey: "bolt", color: TEAL, head: "Съедает часы?", body: "чем дороже процесс, тем быстрее окупится" },
      { iconKey: "list", color: INK, head: "Есть чёткий шаблон?", body: "понятные правила = лёгкий старт" },
    ];
    const cw = 3.74, gap = 0.35;
    items.forEach((it, i) => card(s, 0.7 + i * (cw + gap), 1.75, cw, 3.5, { iconKey: it.iconKey, iconColor: it.color, head: it.head, body: it.body }));
    s.addText("Три «да» — это ваш первый агент.", {
      x: 0.7, y: 5.75, w: 11.93, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, bold: true, color: ACCENT,
    });
  }

  {
    const s = content("Считаем экономию", notesJoin([
      "ТАЙМИНГ: 20:40–20:48. Формула без готовых цифр — каждый подставляет свои: часы на процесс в неделю × ставка в час × 4 недели.",
      "Посчитать вслух на примере добровольца из зала. Его цифра и станет «большой цифрой» этого слайда — живой, а не нарисованной.",
      "【пометка】 Кейсовые цифры экономии со сцены — только из proof-bank; на слайде их нет намеренно.",
    ]));
    const boxes = [
      { head: "часы в неделю", sub: "на этот процесс" },
      { head: "×  ставка в час", sub: "сотрудника" },
      { head: "×  4 недели", sub: "" },
    ];
    boxes.forEach((b, i) => {
      const x = 0.7 + i * 3.05;
      s.addShape("roundRect", { x, y: 2.3, w: 2.75, h: 1.7, rectRadius: 0.12, fill: { color: SOFT } });
      s.addText(b.head, {
        x: x + 0.2, y: 2.6, w: 2.35, h: 0.6, margin: 0, align: "center",
        fontFace: FONT, fontSize: 17, bold: true, color: INK,
      });
      if (b.sub) s.addText(b.sub, {
        x: x + 0.2, y: 3.2, w: 2.35, h: 0.45, margin: 0, align: "center",
        fontFace: FONT, fontSize: 13, color: MUTED,
      });
    });
    s.addText("=", {
      x: 9.75, y: 2.75, w: 0.6, h: 0.8, margin: 0, align: "center",
      fontFace: FONT, fontSize: 34, bold: true, color: MUTED,
    });
    s.addShape("roundRect", { x: 10.35, y: 2.3, w: 2.28, h: 1.7, rectRadius: 0.12, fill: { color: SOFT_ACCENT } });
    s.addText("экономия\nв месяц", {
      x: 10.5, y: 2.62, w: 1.98, h: 1.1, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, bold: true, color: ACCENT,
    });
    s.addText("Подставьте свои цифры — прямо сейчас.", {
      x: 0.7, y: 5.0, w: 11.93, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, italic: true, color: MUTED,
    });
  }

  // ================================================================
  // Финал
  {
    const s = content("Вы забираете сегодня", notesJoin([
      "ТАЙМИНГ: 20:50–20:54. Итог дня — пройтись по четырём пунктам, каждый привязать к моменту вечера («помните, как…»).",
      "Это слайд-зеркало обещания с маршрута вечера: обещали — сделали.",
    ]));
    const items = [
      { iconKey: "mic", color: ACCENT, head: "Навык голосового ввода", body: "Handy настроен и работает" },
      { iconKey: "wand", color: TEAL, head: "Формулу промпта", body: "Роль · Задача · Контекст · Формат" },
      { iconKey: "robot", color: INK, head: "Первого агента", body: "отвечает клиентам уже сегодня" },
      { iconKey: "target", color: "8A5FBF", head: "План внедрения", body: "процесс выбран, экономия посчитана" },
    ];
    const cw = 2.85, gap = 0.25;
    items.forEach((it, i) => card(s, 0.7 + i * (cw + gap), 1.75, cw, 3.5, { iconKey: it.iconKey, iconColor: it.color, head: it.head, body: it.body }));
  }

  {
    const s = content("Домашнее задание — до завтра", notesJoin([
      "ТАЙМИНГ: 20:54–20:57.",
      "ДЗ маленькое и выполнимое за 20 минут — так его реально сделают.",
      "【пометка】 Время и тема Дня 2 — по умолчанию («завтра, 18:00»); сверить с программой тренинга и брифом.",
    ]));
    const items = [
      { iconKey: "mic", color: ACCENT, head: "1 · Надиктуйте три задачи", body: "через Handy — любые рабочие" },
      { iconKey: "wand", color: TEAL, head: "2 · Один промпт по формуле", body: "для самой частой вашей задачи" },
      { iconKey: "filter", color: INK, head: "3 · Выберите процесс", body: "который отдадите агенту первым" },
    ];
    const cw = 3.74, gap = 0.35;
    items.forEach((it, i) => card(s, 0.7 + i * (cw + gap), 1.75, cw, 3.5, { iconKey: it.iconKey, iconColor: it.color, head: it.head, body: it.body }));
    s.addText("День 2 — завтра в 18:00. Продолжаем строить.", {
      x: 0.7, y: 5.75, w: 11.93, h: 0.5, margin: 0, align: "center",
      fontFace: FONT, fontSize: 17, bold: true, color: ACCENT,
    });
  }

  {
    const s = pres.addSlide();
    s.addImage({ path: scenes.sunset, x: 0, y: 0, w: W, h: H });
    s.addText("ДЕНЬ 1 — ПРОЙДЕН", {
      x: 0.85, y: 4.8, w: 11.6, h: 0.55, margin: 0,
      fontFace: FONT, fontSize: 20, bold: true, color: GOLD, charSpacing: 4,
    });
    s.addText("Ваш цифровой сотрудник уже на смене.", {
      x: 0.85, y: 5.35, w: 11.6, h: 1.0, margin: 0,
      fontFace: FONT, fontSize: 38, bold: true, color: WHITE,
    });
    s.addNotes(notesJoin([
      "ТАЙМИНГ: 20:57–21:00. Благодарность, аплодисменты, общее фото на фоне слайда.",
      "Напомнить про ДЗ одной фразой. Финал ровно в 21:00 — уважение ко времени зала тоже продаёт день 2.",
      "【пометка】 Контакты/QR-код для связи не добавлены — брифа с контактами нет; при необходимости вставить на этот слайд.",
    ]));
  }

  await pres.writeFile({ fileName: OUT });
  console.log("OK:", OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
