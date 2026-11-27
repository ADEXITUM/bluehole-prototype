const ao = (e) => Yt[e].label;
const Dn = (e) => `${Math.round(e)} с`;
const _u = new Set(["oog-overhead", "oog-deco", "cesa-stuck", "oog"]);
function Fn(e, t, n, o) {
  const s = n.meta.tanks.find((a) => a.id === "back")?.volumeL ?? Yt.back.volumeL;
  let i = 0;
  for (const a of n.meta.tanks) {
    if (a.id === "deco" || (o && !o(a.id))) continue;
    const r = e.col[`bar.${a.id}`];
    r !== void 0 && (i += t[r] * a.volumeL);
  }
  return i / s;
}
function gu(e, t, n) {
  let o = !0;
  for (const s of e.log) {
    if (s.t > n) break;
    (s.type === "drop" && s.info === t && (o = !1), s.type === "pickup" && s.info === t && (o = !0));
  }
  return o;
}
function Mu(e, t) {
  const n = t?.summary?.turn;
  if (!t || !n || n.state !== "ok" || !(n.p && n.p > 0) || n.t === null) return null;
  const o = ms(t),
    s = o.col;
  if (s.prog === void 0 || s.t === void 0 || o.rows.length < 2) return null;
  const i = t.meta.tanks.find((k) => k.id === "back")?.volumeL ?? Yt.back.volumeL,
    a = n.t;
  let r = 0,
    l = 0,
    h = 0,
    c = 0,
    d = o.rows[0];
  for (let k = 1; k < o.rows.length; k++) {
    const w = o.rows[k - 1],
      L = o.rows[k];
    L[s.t] <= a && (d = L);
    const R = L[s.t] - w[s.t];
    if (R <= 0 || w[s.prog] <= 0 || L[s.prog] <= 0) continue;
    const P = L[s.prog] - w[s.prog],
      v = Fn(o, w, t, null) - Fn(o, L, t, null);
    L[s.t] <= a
      ? P > Ht.MOVE_MPS * R && ((r += P), (l += v))
      : -P > Ht.MOVE_MPS * R && ((h += -P), (c += v));
  }
  const u = nt.V_MAX_X * $e.SPEED_K,
    f = e.env.current * Re,
    p = fr(n.d ?? e.depth, 1, i),
    m = r >= Ht.MIN_PATH_M && l > 0 ? l / r : p / (u + f),
    y = h >= Ht.MIN_PATH_M && c > 0 ? c / h : p / Math.max(0.25, u - f),
    _ = o.rows[o.rows.length - 1],
    S = e.outcome?.kind === "dead" ? Math.max(0, _[s.prog]) : 0,
    A = Math.max(0, Fn(o, d, t, null) - Fn(o, _, t, null)),
    E = A + S * y,
    b = n.tanks.find((k) => k.id === "back")?.bar ?? d[s["bar.back"] ?? -1] ?? 0,
    T = Fn(o, d, t, (k) => gu(e, k, a));
  return {
    have: b,
    haveEq: T,
    need: E,
    deficit: E - T,
    inRate: m,
    outRate: y,
    ratio: y / m,
    src: {
      in: r >= Ht.MIN_PATH_M && l > 0 ? "dive" : "model",
      out: h >= Ht.MIN_PATH_M && c > 0 ? "dive" : "model",
    },
    turnP: n.p,
    endP: S,
    backUsed: A,
  };
}
const ir = (e, t) => Math.round(e / t) * t;
function Su(e, t, n, o) {
  const s = e.outcome;
  if (!s || s.kind !== "dead" || !s.cause) return { chain: [], notes: [], turn: null, broke: [] };
  const i = [],
    a = [],
    r = new Set(),
    l = _u.has(s.cause),
    h = e.dying?.t0 ?? s.t,
    c = l ? Mu(e, n) : null;
  if (c) {
    const m = ir(c.need, Ht.NEED_ROUND_BAR),
      y = c.haveEq - c.have >= 3 ? ` (с баллонами на себе — ${Math.round(c.haveEq)})` : "";
    (a.push(`На развороте было ${Math.round(c.have)} бар${y}, на выход нужно было около ${m}.`),
      e.env.current > 0 &&
        c.ratio >= Ht.FLOW_RATIO_MIN &&
        (i.push({
          t: -1,
          rank: 1,
          text: `течение внутрь — дорога назад в ${c.ratio.toFixed(1)} раза дороже`,
        }),
        e.plan.rule === 3 && r.add("thirdsInCurrent")));
  }
  for (const m of e.fail.list)
    (m.kind === "freeflow" &&
      m.lostBar >= Ht.LOST_BAR &&
      (i.push({
        t: m.warnT >= 0 ? m.warnT : m.activeT,
        rank: 1,
        text: `свободная подача −${Math.round(m.lostBar)} бар`,
      }),
      m.early || r.add("valveLate")),
      m.kind === "entangle" &&
        m.activeT >= 0 &&
        e.stats.tangleT >= Ht.TANGLE_S &&
        i.push({ t: m.activeT, rank: 3, text: `запутался у обвязки — ${Dn(e.stats.tangleT)} в петле` }),
      m.kind === "light" &&
        m.activeT >= 0 &&
        e.stats.darkT >= Ht.DARK_S &&
        i.push({ t: m.activeT, rank: 4, text: `фонарь умер — ${Dn(e.stats.darkT)} без света` }));
  if (l)
    for (const m of e.tanks) {
      if (m.carried || m.bar < Ht.LEFT_BAR || (m.id === "deco" && s.cause !== "oog-deco")) continue;
      const y = [...e.log].reverse().find((S) => S.type === "drop" && S.info === m.id);
      if (!y) continue;
      const _ = `${ao(m.id)} (${Math.round(m.bar)} бар) на ${y.d.toFixed(0)} м`;
      if (!c) {
        i.push({ t: y.t, rank: 2, text: `оставил ${_}` });
        continue;
      }
      const g = (m.bar * m.volumeL) / (e.tanks.find((S) => S.id === "back")?.volumeL ?? Yt.back.volumeL);
      if (g >= c.deficit) i.push({ t: -2, rank: 0, text: `оставил ${_} — его хватило бы на выход` });
      else {
        const S = ao(m.id);
        a.push(
          `${S[0].toUpperCase()}${S.slice(1)} (${Math.round(m.bar)} бар), оставленный на ${y.d.toFixed(0)} м, не спас бы: это ≈ ${Math.round(g)} бар донного, а не хватало ≈ ${ir(c.deficit, Ht.NEED_ROUND_BAR)}.`,
        );
      }
    }
  if (l) {
    const m = Jr(e, t),
      y = e.log.find((_) => _.type === "tie" && (_.info === "trap" || _.info === "end-trap"));
    m.slice(0, Ht.TRAP_NOTES).forEach((_, g) => {
      const S = o ? Yi(o, _.x, _.y) : NaN,
        A =
          Number.isFinite(S) && S > 0
            ? `в ${Math.round(S)} м от входа, на ${_.y.toFixed(0)} м`
            : `на ${_.y.toFixed(0)} м`,
        E = (Math.round(_.gap * 20) / 20).toFixed(2).replace(".", ",");
      (g === 0 &&
        i.push({
          t: y?.t ?? h - 0.02,
          rank: 2,
          text: `линию затянуло в щель ${E} м (${A}) — по ней не пройти`,
        }),
        a.push(
          `Ловушка линии ${A}: линия легла в щель ${E} м — уже, чем проходит дайвер с баллонами (${q.TRAP_GAP_M.toFixed(1).replace(".", ",")} м). Обвязка перед поворотом держит линию посреди хода.`,
        ));
    });
  }
  const d = n?.summary ?? null;
  if (n && d) {
    const m = d.turn;
    if (m.state === "ok" && m.verdict === "late") {
      const S = m.tanks.find((A) => A.id === "back") ?? m.tanks[0];
      (S &&
        i.push({ t: m.t ?? 0, rank: 1, text: `разворот на ${Math.round(-S.delta)} бар позже отметки` }),
        r.add("lateTurn"));
    }
    const y = ms(n),
      _ = y.col;
    if (m.state === "noTurn" && l) {
      const S = e.tanks.find((E) => E.id !== "deco" && E.marks.length > 0),
        A = S ? _[`bar.${S.id}`] : void 0;
      if (S && A !== void 0) {
        const E = S.marks[0],
          b = y.rows.find((T) => T[A] <= E && T[_.prog] > 0);
        b &&
          (i.push({ t: b[_.t], rank: 1, text: `не развернулся на отметке ${Math.round(E)} бар` }),
          r.add("lateTurn"));
      }
    }
    if (o && _.prog !== void 0 && _.reel !== void 0) {
      let S = 0;
      for (const b of [
        ...t.olds.flatMap((T) => T.pts),
        ...t.guide,
        ...e.line.pts,
        ...e.laid.flatMap((T) => T.pts),
      ]) {
        const T = Yi(o, b.x, b.y);
        Number.isFinite(T) && (S = Math.max(S, T));
      }
      const A = Vo.indexOf("live"),
        E = y.rows.find((b) => b[_.prog] > S + Ht.OFFLINE_M && (b[_.reel] & 3) !== A);
      E &&
        d.reachM > S &&
        i.push({ t: E[_.t], rank: 2, text: `без линии ушёл вглубь на ${Math.round(d.reachM - S)} м` });
    }
    const g = ys(n).find((S) => S.e === "blind" && S.on === !0);
    d.blind.noLineT >= Ht.BLIND_NOLINE_S
      ? i.push({ t: g?.t ?? 0, rank: 3, text: `в мути без линии ${Dn(d.blind.noLineT)}` })
      : d.blind.t >= Ht.BLIND_S &&
        i.push({ t: g?.t ?? 0, rank: 4, text: `в нулевой видимости ${Dn(d.blind.t)}` });
  }
  const u = ln(s.mix ?? e.tanks[e.breathing].mix);
  if (s.cause === "ox-tox") {
    const m = Math.floor(ye(u)),
      y = [...e.log].reverse().find((g) => g.type === "gas" && g.t <= h);
    (y && y.d > m
      ? i.push({
          t: y.t,
          rank: 1,
          text: `перешёл на ${u.label} на ${y.d.toFixed(0)} м — глубже его предела ${m} м`,
        })
      : i.push({
          t: y?.t ?? 0,
          rank: 1,
          text: `на ${u.label} ушёл на ${s.depth.toFixed(0)} м — глубже его предела ${m} м`,
        }),
      r.add("deepGas"));
    const _ = [...e.log].reverse().find((g) => g.type === "ox" && g.info === "symptoms" && g.t <= h);
    _ && i.push({ t: _.t, rank: 2, text: `признаки ${Dn(e.ox.limit)} — газ не сменил` });
  }
  s.cause === "hypoxia" &&
    i.push({
      t: h - 0.01,
      rank: 1,
      text: `${u.label} на ${s.depth.toFixed(0)} м — мельче ${Math.ceil(dr(u))} м`,
    });
  const f = s.severe;
  if (f) {
    const y = [...e.log].reverse().find((_) => _.type === "surfaced" || _.type === "dead")?.t ?? h;
    if (f.runM >= xe.SEVERE_ASCENT_M * 0.5) {
      const _ = 1 / Math.max(0.05, 1 - f.runM / Math.max(1, f.fromM));
      (i.push({
        t: y - 0.03,
        rank: 0,
        text: `подъём с ${Math.round(f.fromM)} м без остановки — быстрее нормы${_ >= 1.15 ? ` в ${_.toFixed(1)} раза` : ""}`,
      }),
        r.add("fastAscent"));
    }
    (f.skipS >= 1 &&
      (i.push({ t: y - 0.02, rank: 0, text: `пропущено деко — стопов на ${sr(f.skipS)}` }),
      r.add("skipDeco")),
      !f.why.includes("ascent") &&
        !f.why.includes("skip") &&
        i.push({
          t: y - 0.01,
          rank: 1,
          text: `пересыщение на выходе — ${Math.round((f.gf - 1) * 100)}% сверх предела`,
        }),
      a.push(
        f.why[0] === "ascent"
          ? `Норма подъёма — пока над тобой не загорелась красная стрелка. Подъём с ${Math.round(f.fromM)} м быстрее нормы без остановки: газ в крови вскипает, лёгкие не успевают его отдать.`
          : `Компьютер держал стоп: тело не успело отдать азот. Стопов осталось на ${sr(f.skipS)} — их нельзя пропускать.`,
      ));
  }
  return {
    chain: [
      ...i
        .map((m, y) => ({ ...m, i: y }))
        .sort((m, y) => m.rank - y.rank || m.t - y.t || m.i - y.i)
        .slice(0, Ht.MAX_LINKS)
        .sort((m, y) => m.t - y.t || m.i - y.i)
        .map((m) => m.text),
      Tu(e),
    ],
    notes: a,
    turn: c,
    broke: [...r],
  };
}
function sr(e) {
  const t = Math.max(0, Math.round(e));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function Tu(e) {
  const t = e.outcome,
    n = e.tanks.find((s, i) => {
      if (i === e.breathing || !s.carried || s.bar <= 0) return !1;
      const a = es(ln(s.mix), t.depth);
      return a <= Kt.PPO2_MAX && a >= Kt.PPO2_MIN;
    }),
    o = n ? ` — в баллоне «${ao(n.id)}» ещё ${Math.round(n.bar)} бар` : "";
  switch (t.cause) {
    case "oog-overhead":
      return `газ кончился под сводом${o}`;
    case "oog-deco":
      return `газ кончился на деко${o}`;
    case "cesa-stuck":
      return "газ кончился, аварийный подъём упёрся в камень";
    case "ox-tox":
      return `судороги (ppO2 ${(t.ppo2 ?? 0).toFixed(2)})`;
    case "hypoxia":
      return `потеря сознания (ppO2 ${(t.ppo2 ?? 0).toFixed(2)})`;
    case "dcs":
      return "тяжёлая декомпрессионная болезнь";
    case "embolism":
      return "газовая эмболия";
    default:
      return `газ кончился${o}`;
  }
}
function bu(e) {
  return e.join(" → ");
}
function or(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) e[n] && !e[n - 1] && t++;
  return t;
}
const ni = (e) => (e < 0.01 ? (e * 100).toFixed(1) : Math.round(e * 100).toString());
function Au(e, t = !0) {
  const n = e.outcome;
  if (!n) return { title: "Нырок прерван", text: "" };
  const o = n.depth.toFixed(0),
    s = n.fails?.includes("freeflow")
      ? ": свободная подача, вентиль не закрыт"
      : n.fails?.includes("entangle")
        ? ": запутался в линии у обвязки"
        : "";
  if (n.kind === "dead")
    switch (n.cause) {
      case "oog-overhead":
        return { title: `Газ кончился под сводом на ${o} м${s}.`, text: "" };
      case "oog-deco":
        return { title: `Газ кончился на деко-стопе на ${o} м${s}.`, text: "" };
      case "ox-tox":
        return {
          title: `Кислородные судороги на ${o} м: ${Bt[n.mix ?? "ean50"].label}, ppO2 ${(n.ppo2 ?? 0).toFixed(2)} — регулятор выпал.`,
          text: "",
        };
      case "hypoxia":
        return {
          title: `Потеря сознания на ${o} м: гипоксичная смесь ${Bt[n.mix ?? "tx1050"].label}, ppO2 ${(n.ppo2 ?? 0).toFixed(2)}.`,
          text: "",
        };
      case "cesa-stuck":
        return { title: `Газ кончился, аварийный подъём упёрся в камень на ${o} м.`, text: "" };
      case "embolism":
        return {
          title: `Всплыл слишком быстро: подъём с ${o} м без остановки. Газовая эмболия.`,
          text: "На поверхности — минута, потом паралич и темнота. Нырок не засчитан.",
        };
      case "dcs":
        return {
          title: n.severe?.why.includes("skip")
            ? "Всплыл, пропустив деко. Тяжёлая декомпрессионная болезнь."
            : "Всплыл с пересыщением. Тяжёлая декомпрессионная болезнь.",
          text: "Через пару минут на поверхности — паралич ног, потом сознание. Нырок не засчитан.",
        };
      default:
        return { title: `Газ кончился на ${o} м.`, text: "" };
    }
  const i = n.p ?? 0,
    a = n.cesa ? "Аварийный подъём без газа. " : "";
  return n.kind === "dcs"
    ? {
        title: "Всплыл. Декомпрессионная болезнь.",
        text: `${a}Через двадцать минут — онемение и боль в плече. Кислород, звонок дежурному врачу, барокамера.${t ? ` Риск по пересыщению на выходе был ${ni(i)}%.` : ""}`,
      }
    : {
        title: "Всплыл.",
        text: `${a}Вышел чисто.${t ? ` Риск ДКБ по пересыщению на выходе — ${ni(i)}%.` : ""}`,
      };
}
const Eu = (e) => xt().finds.find((t) => t.id === e)?.name ?? e;
function ku(e, t, n) {
  const o = e.outcome,
    s = [
      Bt[e.plan.bottom].label,
      ...e.tanks.filter((h) => h.id !== "back").map((h) => (h.id === "deco" ? "EAN50" : "стейдж")),
    ].join(" + "),
    i = e.tanks.map((h) => `${Yt[h.id].label} ${h.startBar}→${Math.round(h.bar)}`).join(", "),
    a = e.doors.legacy,
    r = a
      ? Math.max(0, e.stats.maxX - (Number.isFinite(e.gateX) ? e.gateX : t.guide[t.guide.length - 1].x))
      : e.stats.galleryPathM,
    l = o
      ? o.kind === "dead"
        ? "погиб"
        : o.kind === "dcs"
          ? `ДКБ (риск ${ni(o.p ?? 0)}%)`
          : `чисто (риск ${ni(o.p ?? 0)}%)`
      : "";
  return [
    s,
    `правило 1/${e.plan.rule}`,
    `макс ${e.maxDepth.toFixed(1)} м`,
    me(e.t),
    r > 1
      ? a
        ? `в галерее до ${r.toFixed(0)} м от входа`
        : `под сводом ${r.toFixed(0)} м пути`
      : "в галерею не заходил",
    e.ruleT !== null
      ? `на входе ${Math.round(e.tanks.find((h) => h.id === "back").ruleBar ?? 0)} бар`
      : "",
    `газ: ${i} бар`,
    e.line.parent
      ? `линия ${e.line.laid.toFixed(0)} м, обвязок ${e.stats.ties}${or(e.line.trap) ? `, ловушек ${or(e.line.trap)}` : ""}`
      : "",
    e.arrows.some((h) => h.own && !h.prior)
      ? `стрелок ${e.arrows.filter((h) => h.own && !h.prior).length}`
      : "",
    n && n.lineM >= 0.5 ? `за обрывом ${n.lineM.toFixed(0)} м своей линии` : "",
    n && n.finds.length ? `находки: ${n.finds.map(Eu).join(", ")}` : "",
    e.stats.blindT >= 1 ? `в нулевой видимости ${me(e.stats.blindT)}` : "",
    e.stats.darkT >= 1 ? `без света ${me(e.stats.darkT)}` : "",
    wu(e, t),
    e.stats.seaT >= 0 ? "вышел через арку в море" : "",
    ...e.fail.list.map($c),
    e.stats.decoT > 0 ? `деко ${me(e.stats.decoT)}, ожидание ${me(e.stats.waitWall)}` : "без деко",
    l,
  ]
    .filter(Boolean)
    .join(" · ");
}
function wu(e, t) {
  const n = e.env.flows;
  if (!n)
    return e.env.current > 0 ? `течение внутрь ${(e.env.current * Re).toFixed(1)} м/с` : "без течения";
  const o = n.flatMap((s, i) =>
    s === 0
      ? []
      : [
          `${t.doors[i]?.name.split(" ")[0] ?? `#${i}`} ${s > 0 ? "внутрь" : "наружу"} ${(Math.abs(s) * Re).toFixed(1)} м/с`,
        ],
  );
  return o.length ? `течение: ${o.join(", ")}` : "без течения";
}
class Lu {
  constructor(t) {
    M(this, "root");
    M(this, "onAgain", null);
    M(this, "onPlan", null);
    M(this, "shots", []);
    M(this, "riskText", "");
    M(this, "telemetry", null);
    ((this.root = t),
      (t.innerHTML = `
      <div class="card result">
        <h2 data-n="title"></h2>
        <p class="chain hidden" data-n="chain"></p>
        <div class="review hidden" data-n="review"></div>
        <p class="text" data-n="text"></p>
        <p class="risk dim hidden" data-n="risk"><button class="link" data-a="risk">риск по пересыщению</button></p>
        <div class="finds hidden" data-n="finds"></div>
        <canvas data-n="chart"></canvas>
        <p class="legend" data-n="legend"></p>
        <details class="logbook" data-n="logbook"><summary>Логбук</summary><p class="logline" data-n="log"></p></details>
        <div class="btns"><button class="big" data-a="again">Повторить план</button><button class="wide" data-a="plan">К плану</button></div>
        <div class="tm"><span class="dim">Телеметрия для разбора плейтеста</span><button class="mini" data-a="tm-copy">скопировать JSON</button><button class="mini" data-a="tm-all">скачать все нырки</button></div>
        <p class="tm-msg dim hidden" data-n="tm-msg"></p>
        <textarea class="tm-text hidden" readonly data-n="tm-text" aria-label="JSON телеметрии"></textarea>
      </div>`),
      t.querySelector('[data-a="again"]').addEventListener("click", () => this.onAgain?.()),
      t.querySelector('[data-a="plan"]').addEventListener("click", () => this.onPlan?.()),
      t.querySelector('[data-a="tm-copy"]').addEventListener("click", () => {
        this.copy();
      }),
      t.querySelector('[data-a="tm-all"]').addEventListener("click", () => this.downloadAll()),
      t.addEventListener("click", (n) => {
        const o = n.target.closest("[data-shot]");
        if (!o) return;
        const s = this.shots[Number(o.dataset.shot)];
        s && openDivePhoto(s.big ?? s.img, s.n, s.finds, s.white, s.fresh, s.marks, s.feedback);
      }));
  }
  msg(t) {
    const n = this.root.querySelector('[data-n="tm-msg"]');
    ((n.textContent = t), n.classList.toggle("hidden", !t));
  }
  async copy() {
    const t = this.telemetry?.last() ?? null;
    if (!t) return this.msg("Нет записи этого нырка.");
    const n = this.root.querySelector('[data-n="tm-text"]'),
      o = await Nf(t, n);
    this.msg(
      o === "manual"
        ? `Не вышло скопировать само (${Ni(t.length)}). Текст выделен ниже — скопируй вручную.`
        : `Скопировано: последний нырок, ${Ni(t.length)}.`,
    );
  }
  downloadAll() {
    this.root.querySelector('[data-n="tm-text"]').classList.add("hidden");
    const t = this.telemetry?.downloadAll();
    t &&
      this.msg(
        t.ok
          ? `Скачивание запущено: ${t.dives} ${Gl(t.dives, ["нырок", "нырка", "нырков"])} · ${Ni(t.chars)}. Если файла нет (встроенный браузер мессенджера) — скопируй JSON.`
          : "Скачать не вышло — скопируй JSON последнего нырка.",
      );
  }
  show(t, n, o = [], s = null, i = []) {
    (this.msg(""), this.root.querySelector('[data-n="tm-text"]').classList.add("hidden"));
    const a = Au(t, s?.diver ?? !0);
    this.root.querySelector('[data-n="title"]').textContent = a.title;
    const r = this.root.querySelector('[data-n="text"]'),
      l =
        t.stats.seaT >= 0
          ? t.outcome?.kind === "dead"
            ? "Ты вышел через арку в море, но наверх не вернулся."
            : "Ты вышел через арку в море и поднялся в открытой воде."
          : "";
    ((r.textContent = [a.text, l].filter(Boolean).join(" ")),
      r.classList.toggle("hidden", !a.text && !l));
    const h = t.outcome,
      c = s?.diver ?? !0,
      d = this.root.querySelector('[data-n="risk"]');
    ((this.riskText =
      h && h.kind !== "dead" ? `Риск ДКБ по пересыщению на выходе — ${ni(h.p ?? 0)}%.` : ""),
      (d.innerHTML = '<button class="link" data-a="risk">риск по пересыщению</button>'),
      d
        .querySelector('[data-a="risk"]')
        .addEventListener("click", () => (d.textContent = this.riskText)),
      d.classList.toggle("hidden", c || !this.riskText));
    const u = this.root.querySelector('[data-n="chain"]');
    ((u.textContent = bu(o)), u.classList.toggle("hidden", o.length === 0));
    const f = this.root.querySelector('[data-n="review"]');
    (f.replaceChildren(
      ...i.map((_) => {
        const g = document.createElement("p");
        return ((g.textContent = _), g);
      }),
    ),
      f.classList.toggle("hidden", i.length === 0),
      this.showFinds(t, s),
      (this.root.querySelector('[data-n="log"]').textContent = `№${n.n} · ${n.date} · ${n.line}`),
      (this.root.querySelector('[data-n="logbook"]').open = s?.diver ?? !0),
      this.root.classList.remove("hidden"),
      this.root.classList.toggle("dead", t.outcome?.kind === "dead"));
    const p = [];
    for (const _ of t.tanks)
      p.push(
        `<i style="background:${_.id === "back" ? "#8fe0f0" : _.id === "stage" ? "#7fb3ff" : "#d6e05a"}"></i>${_.id === "back" ? (t.tanks.length > 1 ? "донный" : "газ") : _.id === "stage" ? "стейдж" : "EAN50"}`,
      );
    (t.stats.decoT > 0 && p.push('<i class="dash"></i>потолок'),
      t.log.some((_) => _.type === "gas") && p.push("◆ смена газа"),
      t.log.some((_) => _.type === "drop" || _.type === "pickup") &&
        p.push("◇ баллон подобран / оставлен"),
      t.fail.list.length &&
        p.push(
          '<br><i style="background:#ffc24a"></i>предупреждение <i style="background:#ff5a5a"></i>отказ: П подача, Ф фонарь, Л линия',
        ),
      (this.root.querySelector('[data-n="legend"]').innerHTML = p.join(" ")));
    const m = this.root.querySelector('[data-n="chart"]'),
      y = Math.min(340, this.root.querySelector(".card").clientWidth - 32);
    Jf(m, t, y, Math.round(y * 0.56));
  }
  showFinds(t, n) {
    const o = this.root.querySelector('[data-n="finds"]');
    if ((o.classList.toggle("hidden", !n), !n)) return;
    const s = t.outcome?.kind === "dead",
      i = (d) =>
        d.replace(/[&<>"]/g, (u) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[u]),
      a = [];
    this.shots = s ? [] : (n.shots ?? []);
    const r = t.outcome?.cause === "dcs" || t.outcome?.cause === "embolism";
    n.shots && a.push(If(this.shots, s, s ? 0 : this.shots.filter((d) => d.fresh.length > 0).length, r));
    const l = n.keptM ?? n.lineAllM,
      h = [];
    if (
      (l >= 1 &&
        (h.push(`Проложил <b>${l.toFixed(0)} м</b> линии — в следующий раз сюда автоплывом.`),
        n.lineM >= 0.5 &&
          h.push(
            `${n.lineM.toFixed(0)} м из них — дальше, чем был кто-либо${n.season.bestLine && !s ? ' <span class="new">рекорд</span>' : ""}.`,
          )),
      (n.reeledM ?? 0) >= 1 &&
        h.push(`<span class="dim">${(n.reeledM ?? 0).toFixed(0)} м не закреплено — смотал.</span>`),
      h.length && a.push(`<p class="fline">${h.join(" ")}</p>`),
      !(s && n.shots))
    )
      if (n.finds.length) {
        a.push(`<p class="fhead">${s ? "Видел, но не рассказал:" : "Снято:"}</p><ul class="flist">`);
        for (const d of n.finds) {
          const u = xt().finds.find((p) => p.id === d),
            f = !s && n.season.newFinds.includes(d);
          a.push(
            `<li><b>${i(u.name)}</b>${f ? ' <span class="new">новое</span>' : ""}<br><span class="dim">${i(u.fact)}</span></li>`,
          );
        }
        (a.push("</ul>"),
          s && a.push('<p class="dim">Находки этого нырка не дошли до поверхности.</p>'));
      } else
        a.push(
          this.shots.length
            ? '<p class="dim">На кадрах нет узнаваемых находок.</p>'
            : '<p class="dim">В этом нырке нет кадров.</p>',
        );
    if (n.survey) {
      const d = n.survey.added * Ne.CELL_M * Ne.CELL_M;
      n.survey.kept
        ? a.push(
            `<p class="dim">На карту: ${d >= 1 ? `+${d.toFixed(0)} м² разведанного` : "нового нет"}.</p>`,
          )
        : a.push(
            `<p class="dim">${s ? "Разведанное этого нырка на карту не легло." : "Карта не обновилась."}</p>`,
          );
    }
    const c = n.season.season;
    a.push(
      `<p class="fbest dim">Найдено за сезон ${c.found.length} из ${xt().finds.length}${c.bestLineM >= 0.5 ? ` · дальше всех: ${c.bestLineM.toFixed(0)} м своей линии` : ""}</p>`,
    );
    for (const d of n.gear ?? []) a.push(`<p class="fgear">${i(d)}</p>`);
    o.innerHTML = a.join("");
  }
  hide() {
    this.root.classList.add("hidden");
  }
}
