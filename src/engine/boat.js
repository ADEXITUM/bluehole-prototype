const Ff = { 3: "треть", 4: "четверть", 5: "пятую часть" };
function Hf() {
  return [...Tn.filter((t) => t.id !== "empty"), ...Tn.filter((t) => t.id === "empty")].flatMap((t) =>
    Array.from({ length: t.count }, () => t.id),
  );
}
const Ti = (e) =>
  e.replace(/[&<>"]/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[t]);
class Wf {
  constructor(t, n, o) {
    M(this, "plan");
    M(this, "root");
    M(this, "onDive", null);
    M(this, "onChange", null);
    M(this, "onSound", null);
    M(this, "onTmDownload", null);
    M(this, "onTmClear", null);
    M(this, "tmArmed", 0);
    M(this, "onSeasonReset", null);
    M(this, "seasonArmed", 0);
    M(this, "onTipsToggle", null);
    M(this, "onTipsReset", null);
    M(this, "onDiverToggle", null);
    M(this, "onFreqToggle", null);
    M(this, "tipEl", null);
    M(this, "view", {
      visible: () => !0,
      diver: !0,
      kit: { backs: ["twin"], slots: $n.filter((t) => t.active).map((t) => t.id) },
      freq: !0,
      ladder: !1,
    });
    M(this, "intro", null);
    M(this, "onShow", null);
    ((this.root = t),
      (this.plan = Xi(n)),
      (t.innerHTML = `
      <div class="card plan">
        <div class="phead"><h1>Блю-хол</h1></div>
        <div data-n="map"></div>
        <section class="season" data-n="season"></section>
        <section data-tipanchor="rule" data-sec="rule"><h3>Запас газа</h3><div class="seg" data-k="rule"></div><p class="note" data-n="rule"></p></section>
        <section data-tipanchor="slots" data-sec="gear"><h3>Снаряжение</h3><div class="seg" data-k="back"></div><p class="note" data-n="gas"></p><div class="slots"></div><p class="note dim" data-n="slotsn"></p></section>
        <section data-tipanchor="bottom" data-sec="bottom"><h3>Донный газ <span class="dim">· спарка ${Yt.back.desc} · ${Yt.back.startBar} бар</span></h3><div class="seg" data-k="bottom"></div><p class="note" data-n="bottom"></p></section>
        <section data-tipanchor="deck" data-sec="deck"><h3>Отказы</h3><div class="deck" data-n="deckc" aria-label="состав колоды">${Hf()
          .map((s) => `<i class="dcard ${s}"></i>`)
          .join("")}</div><p class="note" data-n="deckn"></p></section>
        <details class="help" data-sec="help"><summary>Справка</summary>
          <div data-help="map"><h4>Карта</h4><ul>
            <li>Карта — то, что ты рассказал на лодке. Где побывал свет фонаря и что было в кадре, там старая схема исследователя сменяется точной съёмкой. Копится за сезон.</li>
            <li>Погиб — разведанное этого нырка на карту не ложится, как и находки: видел, но не рассказал.</li>
            <li>«?» — там, где разведанная вода уходит в неразведанную.</li>
            <li>Коснись карты — откроется целиком: тяни пальцем, щипком — масштаб; на ПК — мышью и колесом. Записку можно перечитать, коснувшись её значка.</li>
          </ul></div>
          <div data-help="camera"><h4>Камера</h4><ul>
            <li><b>Находка засчитывается снимком.</b> Держи «камеру» (X) ~${Q.HOLD_S.toFixed(1)} с — кольцо у дайвера заполнится, сработает вспышка. Отпустил раньше — кадра нет.</li>
            <li>Пока держишь — висишь на месте, время и газ идут. Фонарь (рука) наводит камеру: вспышка светит туда же, широко.</li>
            <li>Кадров ${Q.FRAMES} на нырок, вспышка заряжается ~${Q.RECHARGE_S} с (кольцо на кнопке, на ней же — сколько кадров осталось).</li>
            <li>Вспышка своя: снимать можно и в темноте. В мути вспышка отразится от взвеси — кадр выйдет белым.</li>
            <li>Что именно снял — на лодке: кадры на экране итога, альбом сезона на плане. Погиб — камера осталась внизу.</li>
          </ul></div>
          <div data-help="line"><h4>Линия</h4><ul>
            <li>Возьми катушку (${q.REEL_M} м) в одно из мест комплекта. «Начать линию» (E) — закрепить её у конца верёвки. Дальше нить тянется за тобой.</li>
            <li><b>«Закрепить» на поворотах</b> (E) у стены. Без этого линия ложится кратчайшим путём — по углам и в щели, где ты не пролезешь.</li>
            <li>Что не закреплено, катушка смотает на обратном пути. Закреплённое остаётся в воде между нырками — в следующий раз сюда автоплывом.</li>
            <li>Катушка кончилась — линия держит. Вернись или «обрезать» (E, держать): конец на камне, дальше без линии. Это риск.</li>
            <li>Стрелка (Q) — на любую линию под сводом (не ближе ${Ae.MIN_GAP_M} м к другой; с собой ${Ae.COUNT}), острым концом к выходу.</li>
          </ul></div>
          <div data-help="move"><h4>Ход и муть</h4><ul>
            <li><b>Медленно — чисто.</b> Shift или малый стик не мутят, пока не касаешься камня. Касание мутит тем гуще, чем быстрее.</li>
            <li>Волна от ласт тем сильнее, чем быстрее ход: посередине хода полный ход чист, у пола и над илом поднимает муть, в узком проходе — густо.</li>
            <li>Рывок (пробел, ~${nt.V_MAX_X.toFixed(1)} м/с вместо ${(nt.V_MAX_X * $e.SPEED_K).toFixed(1)}) — чтобы быстро уйти: дышится в ${De.GAS_MULT.toFixed(0)} раза тяжелее, метр пути выходит в ~${((De.GAS_MULT * $e.SPEED_K) / De.SPEED_K).toFixed(1)} раза дороже по газу.</li>
            <li>В плотной мути не видно ничего дальше полуметра. Прекрати грести, дай илу осесть. Держись линии, дальше двигайся медленно и выше дна.</li>
          </ul></div>
          <div data-help="deco"><h4>Стоп</h4><ul>
            <li>Компьютер показал стоп — встань в окно (скобка рядом с тобой) и жми «ждать» (H): время пойдёт ×${ro.SCALE}, газ и тело — честно. Любое движение — обычный ход.</li>
            <li>Пропустил стоп или поднялся с глубины быстрее нормы — тяжёлая форма декомпрессионной болезни: нырок не засчитан.</li>
          </ul></div>
          <div data-help="fails"><h4>Отказы</h4><ul>
            <li>Сначала предупреждение — звук и картинка, через несколько секунд — сам отказ.</li>
            <li><b>Шипение и струйка пузырей у регулятора</b> — свободная подача. «Вентиль» (V, держать ~${we.HOLD_S.toFixed(0)} с, плыть нельзя). Не закрыл — газ уходит в ${we.MULT} раза быстрее.</li>
            <li><b>Фонарь моргает и трещит</b> — сейчас погаснет совсем. Запасной есть у всех: «фонарь» (L) — ${ft.SPARE_RANGE_M} м, улучшенный запасной фонарь — ${ft.SPARE_HI_RANGE_M} м.</li>
            <li><b>Линия дёрнулась у закреплённого места</b> — петля зацепила. «Распутать» (R): сразу — ~${Nt.WARN_HOLD_S.toFixed(0)} с, затянулась — ~${Nt.HOLD_S.toFixed(0)} с.</li>
          </ul></div>
          <div data-help="gases"><h4>Газы</h4><ul>
            <li>На строке газа — его предел глубины. Глубже — отравление кислородом: ${ve.SYMPTOMS_MIN_S}–${ve.SYMPTOMS_MAX_S} с признаков, потом судороги. Спасают другой газ или подъём.</li>
            <li>Смена — удержание строки ~${tt.SWITCH_HOLD_S.toFixed(0)} с. Ошибся — список ещё открыт: сразу держи нужную строку.</li>
            <li><b>«Подобрать» только пристёгивает баллон</b> — дышишь тем же. Дышать им — отдельной сменой газа.</li>
            <li>«Оставить здесь» есть у любого баллона, кроме того, которым дышишь: держать ~${tt.DROP_HOLD_S.toFixed(1)} с. У линии — пристегнёшь, без линии — утонет на дно.</li>
            <li>EAN50 (до ${ye(Bt.ean50).toFixed(0)} м): у ходовой около ${tt.DECO_CLIP_DEPTH_M} м — кнопка «оставить», можно и нести с собой. На подъёме — его строка; оставил на линии — «подобрать», потом смени газ.</li>
          </ul></div>
          <div data-help="keys"><h4>Клавиши</h4><ul>
            <li>Телефон: коснись где угодно — там джойстик. Кнопки справа внизу видны, только когда действие возможно.</li>
            <li>Автоплыв (F) — по известной верёвке. По знакомой линии время идёт ×${St.KNOWN_SCALE}: газ и деко — честно, просто быстрее.</li>
            <li>ПК: WASD или стрелки, Shift — медленно; F — автоплыв; пробел — рывок; E — линия; Q — стрелка; C — подобрать баллон; T — записка; X — камера (держать); H — ждать; M — звук.</li>
            <li>Отказы: V — вентиль, L — запасной фонарь, R — распутать. Газ: G — список; держать 1 — донный, 3 — деко; Shift+цифра — оставить; Esc — закрыть.</li>
          </ul></div>
        </details>
        <div class="btns pbtns"><button class="big" data-a="dive">Нырнуть</button><button class="wide" data-a="repeat">Повторить прошлый план</button></div>
        <div class="pfoot">
          <label class="snd"><input type="checkbox" data-a="sound"${o ? " checked" : ""}> Звук</label>
          <div class="tipset" data-n="tips">Подсказки инструктора: <span class="seg mini" data-k="tips"><button data-tips="1">вкл</button><button data-tips="0">выкл</button></span> <button class="link" data-a="tips-reset">показать заново</button><span class="dim" data-n="tipsn"></span></div>
          <label class="snd"><input type="checkbox" data-a="diver"> Режим дайвера <span class="dim">— всё сразу, термины и числа</span></label>
          <label class="snd"><input type="checkbox" data-a="freq"> Частые отказы <span class="dim">— для проверки</span></label>
          <p class="log dim" data-n="log"></p>
          <p class="tmlink dim" data-n="tm"></p>
          <p class="ver dim">${ho.STAGE}</p>
        </div>
      </div>`),
      t.addEventListener("click", (s) => this.click(s)),
      t
        .querySelector('[data-a="sound"]')
        .addEventListener("change", (s) => this.onSound?.(s.target.checked)),
      t
        .querySelector('[data-a="diver"]')
        .addEventListener("change", (s) => this.onDiverToggle?.(s.target.checked)),
      t
        .querySelector('[data-a="freq"]')
        .addEventListener("change", (s) => this.onFreqToggle?.(s.target.checked)),
      this.render());
  }
  get current() {
    return { ...this.plan, slots: [...this.plan.slots] };
  }
  setView(t) {
    ((this.view = t),
      t.ladder && (this.plan = Mn(this.plan, t.kit)),
      (this.root.querySelector('[data-a="diver"]').checked = t.diver),
      (this.root.querySelector('[data-a="freq"]').checked = t.freq),
      this.render());
  }
  setPlan(t) {
    ((this.plan = this.view.ladder ? Mn(t, this.view.kit) : Xi(t)), this.render());
  }
  sectionVisible(t) {
    if (!t) return !0;
    const n = t === "slots" ? "gear" : t,
      o = this.root.querySelector(`[data-sec="${n}"]`);
    return !!o && !o.classList.contains("hidden");
  }
  hasChoice() {
    return this.sectionVisible("rule") || this.sectionVisible("slots");
  }
  setTips(t, n, o) {
    for (const s of this.root.querySelectorAll("[data-tips]"))
      s.classList.toggle("on", (s.dataset.tips === "1") === t);
    this.root.querySelector('[data-n="tipsn"]').textContent = ` · пройдено ${n} из ${o}`;
  }
  showTip(t, n) {
    this.closeTip();
    const o = this.root.parentElement ?? document.body,
      s = document.createElement("div");
    s.className = "tipov";
    const i = t.lines.map((d) => `<p>${Ti(Ws(d.text))}</p>`).join("");
    s.innerHTML = `<div class="tipcard" role="dialog" aria-label="${Ti(t.title)}"><i class="tipbar"></i><span class="tiplab">ИНСТРУКТОР</span><h3>${Ti(t.title)}</h3>${i}${t.joke ? `<p class="tipjoke">${Ti(Ws(t.joke))}</p>` : ""}<p class="tipfoot">коснись — дальше</p></div>`;
    const a = t.planRing ? this.root.querySelector(`[data-tipanchor="${t.planRing}"]`) : null;
    if (a) {
      (a.classList.add("tipring"), a.scrollIntoView({ block: "start" }));
      const d = a.getBoundingClientRect(),
        u = o.getBoundingClientRect();
      s.classList.add((d.top + d.bottom) / 2 < u.top + u.height / 2 ? "low" : "high");
    }
    const r = performance.now(),
      l = () => performance.now() - r >= vt.CLOSE_MIN_S * 1e3,
      h = window.setTimeout(() => s.classList.add("ready"), vt.CLOSE_MIN_S * 1e3),
      c = () => {
        l() &&
          (window.clearTimeout(h),
          a?.classList.remove("tipring"),
          s.remove(),
          this.tipEl === s && (this.tipEl = null),
          n());
      };
    (s.addEventListener("click", c),
      s.addEventListener("keydown", (d) => {
        (d.key === "Enter" || d.key === " " || d.key === "Escape") && c();
      }),
      (s.tabIndex = -1),
      o.appendChild(s),
      s.focus({ preventScroll: !0 }),
      (this.tipEl = s));
  }
  closeTip() {
    if (this.tipEl) {
      (this.tipEl.remove(), (this.tipEl = null));
      for (const t of this.root.querySelectorAll(".tipring")) t.classList.remove("tipring");
    }
  }
  setSound(t) {
    this.root.querySelector('[data-a="sound"]').checked = t;
  }
  setSeason(t) {
    this.seasonArmed = 0;
    const n = this.root.querySelector('[data-n="season"]'),
      o = t.found.map((a) => xt().finds.find((r) => r.id === a)?.name ?? a),
      s = xt().finds.length - t.found.length,
      i = o.length
        ? `${o.join(" · ")}${s ? ` · ${"?".repeat(Math.min(s, 3))}` : ""}`
        : xt().id === "m7"
          ? "пока ничего — за обрывом старой линии"
          : "пока ничего";
    n.innerHTML =
      (this.intro ? `<p class="note intro">${this.intro}</p>` : "") +
      `<h3>Сезон <span class="dim">· найдено ${t.found.length} из ${xt().finds.length} · нырков ${t.dives}</span></h3><p class="note">${i}</p>` +
      (t.found.length ? `<h4 class="ahead">Альбом сезона</h4>${Of(t.found, ji())}` : "") +
      `<p class="note dim">${[t.bestLineM >= 0.5 ? `Дальше всех: ${t.bestLineM.toFixed(0)} м своей линии` : "", t.bestFinds > 1 ? `больше всего за нырок — ${t.bestFinds}` : ""].filter(Boolean).join(" · ")}${t.bestLineM >= 0.5 || t.bestFinds > 1 ? " · " : ""}<button class="link" data-a="season-reset">новый сезон</button></p>`;
  }
  get mapSlot() {
    return this.root.querySelector('[data-n="map"]');
  }
  setLog(t) {
    this.root.querySelector('[data-n="log"]').textContent = t;
  }
  setTelemetry(t, n, o) {
    this.tmArmed = 0;
    const s = this.root.querySelector('[data-n="tm"]'),
      i = `телеметрия: ${t} ${Gl(t, ["нырок", "нырка", "нырков"])}${t ? ` · ${Ni(n)}` : ""}${o ? "" : " (без хранилища — до перезагрузки)"}`;
    s.innerHTML = t
      ? `${i} · <button class="link" data-a="tm-dl">скачать</button> / <button class="link" data-a="tm-clear">очистить</button>`
      : i;
  }
  show() {
    (this.root.classList.remove("hidden"), this.render(), this.onShow?.());
  }
  hide() {
    this.root.classList.add("hidden");
  }
  click(t) {
    const n = t.target.closest("[data-album]");
    if (n) {
      const i = n.dataset.album;
      const album = ji();
      openDivePhoto(album.frames[i] ?? null, null, [i], false, [], album.marks);
      return;
    }
    const o = t.target.closest("[data-tips]");
    if (o) {
      this.onTipsToggle?.(o.dataset.tips === "1");
      return;
    }
    const s = t.target.closest("[data-v],[data-a],[data-slot]");
    if (s) {
      if (s.dataset.slot) {
        const i = s.dataset.slot;
        if (!this.slotIds().includes(i)) return;
        const a = this.plan.slots.includes(i);
        this.plan.slots = a
          ? this.plan.slots.filter((r) => r !== i)
          : [...this.plan.slots, i].slice(-Sn);
      } else if (s.dataset.v) {
        const i = s.parentElement?.dataset.k;
        (i === "rule" && (this.plan.rule = Number(s.dataset.v)),
          i === "bottom" &&
            Hs.some((a) => a.id === s.dataset.v && !a.locked) &&
            (this.plan.bottom = s.dataset.v),
          i === "back" &&
            (s.dataset.v === "single" || s.dataset.v === "twin") &&
            this.view.kit.backs.includes(s.dataset.v) &&
            (this.plan.back = s.dataset.v));
      } else if (s.dataset.a === "dive") {
        this.onDive?.(this.current);
        return;
      } else if (s.dataset.a === "tips-reset") {
        this.onTipsReset?.();
        return;
      } else if (s.dataset.a === "tm-dl") {
        this.onTmDownload?.();
        return;
      } else if (s.dataset.a === "tm-clear") {
        Date.now() - this.tmArmed < 4e3
          ? this.onTmClear?.()
          : ((this.tmArmed = Date.now()), (s.textContent = "точно очистить?"));
        return;
      } else if (s.dataset.a === "season-reset") {
        Date.now() - this.seasonArmed < 4e3
          ? this.onSeasonReset?.()
          : ((this.seasonArmed = Date.now()), (s.textContent = "точно начать заново?"));
        return;
      } else if (s.dataset.a === "repeat") {
        const i = Vn();
        i &&
          ((this.plan = this.view.ladder ? Mn(i, this.view.kit) : i),
          this.render(),
          this.onDive?.(this.current));
        return;
      } else return;
      (this.render(), this.onChange?.(this.current));
    }
  }
  slotIds() {
    return $n.filter((t) => t.active && this.view.kit.slots.includes(t.id)).map((t) => t.id);
  }
  render() {
    const t = this.plan,
      n = this.view,
      o = (g) => this.root.querySelector(g),
      s = (g, S) => o(`[data-sec="${g}"]`).classList.toggle("hidden", !S),
      i = (g) => n.diver || n.visible(g),
      a = i("turnMarks");
    (s("rule", a),
      (o('[data-k="rule"]').innerHTML = ar
        .map((g) => `<button data-v="${g}" class="${t.rule === g ? "on" : ""}">1/${g}</button>`)
        .join("")),
      (o('[data-n="rule"]').textContent = n.diver
        ? `На вход — 1/${t.rule} газа. Отметки разворота и резерва появятся на манометре на входе в галерею — от давления там.`
        : `На вход — ${Ff[t.rule]} газа. Риски разворота появятся на манометре под сводом — от давления на входе.`));
    const r = this.slotIds(),
      l = n.ladder ? n.diver || n.kit.backs.length > 1 || r.length > 0 : !0;
    s("gear", l);
    this.renderLoadout();
    const m = i("valve") || i("torch") || i("untangle");
    (s("deck", n.diver || n.freq || m),
      o('[data-n="deckc"]').classList.toggle("hidden", !(n.diver || n.freq)),
      (o('[data-n="deckn"]').textContent =
        n.diver || n.freq
          ? `${n.freq ? "Частые отказы · " : ""}${Tn.reduce((g, S) => g + S.count, 0)} карт: ${Tn.map((g) => `${g.count} ${g.label}`).join(" · ")}${n.freq ? "" : " (по умолчанию — вдвое реже и не раньше второй галереи)"}`
          : Ql));
    const y = {
      map: !0,
      camera: !0,
      keys: !0,
      line: i("tie"),
      move: i("dash") || i("wait"),
      deco: i("deco"),
      fails: m,
      gases: i("gasMenu"),
    };
    for (const g of this.root.querySelectorAll("[data-help]"))
      g.classList.toggle("hidden", !y[g.dataset.help]);
    o('[data-n="log"]').classList.toggle("hidden", !n.diver);
    const _ = o('[data-a="repeat"]');
    (_.classList.toggle("hidden", !(a || (n.ladder && l))), (_.disabled = !Vn()));
  }
  renderLoadout() {
    const t=this.plan,n=this.view,o=selector=>this.root.querySelector(selector);
    const s=(id,show)=>o(`[data-sec="${id}"]`).classList.toggle("hidden",!show);
    const r=this.slotIds();
    const h = o('[data-k="back"]');
    (h.classList.toggle("hidden", !n.ladder || n.kit.backs.length < 2),
      (h.innerHTML = n.kit.backs
        .map(
          (g) =>
            `<button data-v="${g}" class="${(t.back ?? "twin") === g ? "on" : ""}">${g === "single" ? `Баллон ${Yt.single.desc}` : `Спарка ${Yt.back.desc}`}</button>`,
        )
        .join("")));
    const c = Bt[t.bottom],
      d = Ln(c, 35),
      u = Math.round(ce.END_ONSET_M),
      f = n.diver
        ? `END на 35 м — ${d.toFixed(0)} м${d > ce.END_ONSET_M ? " (наркоз глубже 30 м)" : ""}. MOD при ppO2 1.6 — ${ye(c).toFixed(0)} м.` +
          (t.bottom === "tx2135" ? " Деко как у воздуха: та же доля инертного газа." : "")
        : `${c.label}. Глубже ${u} м от него мутнеет голова. Глубже ${ye(c).toFixed(0)} м он ядовит.`,
      p = o('[data-n="gas"]');
    ((p.textContent = n.ladder ? f : ""),
      p.classList.toggle("hidden", !n.ladder),
      (o(".slots").innerHTML = r
        .map((g) => {
          const S = $n.find((E) => E.id === g),
            A = t.slots.includes(g);
          return `<button data-slot="${g}" class="slot ${A ? "on" : ""}"><b>${S.label}</b><span>${n.diver ? S.note : Bf(g)}</span></button>`;
        })
        .join("")),
      (o('[data-n="slotsn"]').textContent = r.length > Sn ? `Возьми с собой два из ${r.length}.` : ""),
      s("bottom", !n.ladder),
      n.ladder ||
        ((o('[data-k="bottom"]').innerHTML = Hs.map((g) =>
          g.locked
            ? `<button data-v="${g.id}" class="locked" disabled><span class="lock" aria-hidden="true"></span>${g.label}<small>${g.locked}</small></button>`
            : `<button data-v="${g.id}" class="${t.bottom === g.id ? "on" : ""}">${g.label}</button>`,
        ).join("")),
        (o('[data-n="bottom"]').textContent = f)));
  }

}
function Bf(e) {
  switch (e) {
    case "deco50":
      return `баллон для подъёма: стопы короче · глубже ${ye(Bt.ean50).toFixed(0)} м им не дышат`;
    case "reel":
      return `${q.REEL_M} м своей линии; занимает одно место`;
    case "light":
      return `запасной светит на ${ft.SPARE_HI_RANGE_M} м вместо ${ft.SPARE_RANGE_M}`;
    default:
      return $n.find((t) => t.id === e)?.note ?? "";
  }
}
