class Bu {
  constructor(t) {
    M(this, "root");
    M(this, "onDive", null);
    M(this, "slot");
    M(this, "home", null);
    M(this, "map", null);
    ((this.root = t),
      (t.innerHTML = `
      <div class="card intro">
        <div class="phead"><h1>Блю-хол</h1></div>
        <div class="intro-map" data-n="map"></div>
        <blockquote class="vk">«Дальше — твоё. Вернись и расскажи».<cite>— В. К., на последней стрелке</cite></blockquote>
        <div class="btns pbtns"><button class="big" data-a="dive">Нырнуть</button></div>
      </div>`),
      (this.slot = t.querySelector('[data-n="map"]')),
      t.querySelector('[data-a="dive"]').addEventListener("click", () => this.onDive?.()));
  }
  show(t) {
    ((this.map = t),
      (this.home = { parent: t.parentElement, next: t.nextSibling }),
      this.slot.appendChild(t),
      this.root.classList.remove("hidden"));
  }
  hide() {
    (this.root.classList.add("hidden"),
      this.map && this.home && this.home.parent.insertBefore(this.map, this.home.next),
      (this.map = null),
      (this.home = null));
  }
  get shown() {
    return !this.root.classList.contains("hidden");
  }
}
function $u(e = Tt.MEMORY_MAX_CHARS) {
  const t = new Map();
  let n = 0;
  return {
    getItem: (o) => t.get(o) ?? null,
    setItem: (o, s) => {
      const i = t.get(o),
        a = n - (i ? i.length + o.length : 0) + s.length + o.length;
      if (a > e) throw new Error("QuotaExceededError");
      (t.set(o, s), (n = a));
    },
    removeItem: (o) => {
      const s = t.get(o);
      (s !== void 0 && (n -= s.length + o.length), t.delete(o));
    },
    size: () => n,
    keys: () => [...t.keys()],
  };
}
function Ku(e) {
  try {
    const t = e();
    if (t) {
      const n = `${Tt.KEY_PREFIX}probe`;
      return (t.setItem(n, "1"), t.removeItem(n), { kv: t, persistent: !0 });
    }
  } catch {}
  return { kv: $u(), persistent: !1 };
}
const Ce = Tt.KEY_PREFIX;
const Ei = (e) => `${Ce}d:${e}:meta`;
const Hn = (e, t) => `${Ce}d:${e}:c:${t}`;
const Cs = (e) => `${Ce}d:${e}:all`;
const xs = (e) => `${Ce}d:${e}:sum`;
class Gu {
  constructor(t, n) {
    M(this, "kv");
    M(this, "persistent");
    ((this.kv = t), (this.persistent = n));
  }
  get(t) {
    try {
      return this.kv.getItem(t);
    } catch {
      return null;
    }
  }
  del(t) {
    try {
      this.kv.removeItem(t);
    } catch {}
  }
  put(t, n, o) {
    for (let s = 0; s <= Tt.MAX_DIVES; s++)
      try {
        return (this.kv.setItem(t, n), !0);
      } catch {
        if (!this.evictOldest(o)) return !1;
      }
    return !1;
  }
  list() {
    const t = this.get(`${Ce}idx`);
    if (!t) return [];
    try {
      const n = JSON.parse(t);
      return Array.isArray(n) ? n.filter((o) => !!o && typeof o.id == "string") : [];
    } catch {
      return [];
    }
  }
  saveList(t, n) {
    this.put(`${Ce}idx`, JSON.stringify(t), n);
  }
  count() {
    return this.list().length;
  }
  chars() {
    return this.list().reduce((t, n) => t + (n.chars || 0), 0);
  }
  evictOldest(t) {
    const n = this.list(),
      o = n.find((s) => s.id !== t);
    if (!o) return !1;
    this.removeKeys(o);
    try {
      this.kv.setItem(`${Ce}idx`, JSON.stringify(n.filter((s) => s !== o)));
    } catch {}
    return !0;
  }
  removeKeys(t) {
    (this.del(Ei(t.id)), this.del(Cs(t.id)), this.del(xs(t.id)));
    for (let n = 0; n < t.chunks + 2 || this.get(Hn(t.id, n)) !== null; n++) this.del(Hn(t.id, n));
  }
  trim(t) {
    let n = this.list();
    for (
      ;
      n.length > 1 && n.reduce((o, s) => o + (s.chars || 0), 0) > Tt.MAX_CHARS && this.evictOldest(t);
    )
      n = this.list();
  }
  begin(t) {
    let n = this.list().filter((s) => s.id !== t.id);
    for (; n.length >= Tt.MAX_DIVES; ) (this.removeKeys(n[0]), (n = n.slice(1)));
    const o = JSON.stringify(t);
    (n.push({ id: t.id, n: t.n, date: t.date, done: !1, complete: !1, chunks: 0, chars: o.length }),
      this.saveList(n, t.id),
      this.put(Ei(t.id), o, t.id));
  }
  chunk(t, n, o) {
    const s = JSON.stringify(o),
      i = this.put(Hn(t, n), s, t),
      a = this.list(),
      r = a.find((l) => l.id === t);
    r &&
      ((r.chunks = Math.max(r.chunks, n + 1)),
      i && (r.chars += s.length),
      this.saveList(a, t),
      this.trim(t));
  }
  finish(t) {
    const n = t.meta.id,
      s = this.list().find((c) => c.id === n);
    if (!s) return;
    const i = JSON.stringify(t.summary);
    this.put(xs(n), i, n);
    const a = JSON.stringify(t.chunks);
    let r = (this.get(Ei(n))?.length ?? 0) + i.length;
    if (this.put(Cs(n), a, n)) {
      for (let c = 0; c < s.chunks; c++) this.del(Hn(n, c));
      r += a.length;
    } else r += s.chars;
    const l = this.list(),
      h = l.find((c) => c.id === n);
    h && ((h.done = !0), (h.complete = !!t.summary?.complete), (h.chars = r), this.saveList(l, n));
  }
  load(t) {
    try {
      const n = this.get(Ei(t));
      if (!n) return null;
      const o = JSON.parse(n),
        s = this.get(xs(t)),
        i = s ? JSON.parse(s) : null,
        a = this.get(Cs(t));
      let r = [];
      if (a) r = JSON.parse(a);
      else
        for (let l = 0; ; l++) {
          const h = this.get(Hn(t, l));
          if (h === null) break;
          r.push(JSON.parse(h));
        }
      return { meta: o, summary: i, chunks: r };
    } catch {
      return null;
    }
  }
  remove(t) {
    const n = this.list(),
      o = n.find((s) => s.id === t);
    o &&
      (this.removeKeys(o),
      this.saveList(
        n.filter((s) => s !== o),
        null,
      ));
  }
  clear() {
    for (const t of this.list()) this.removeKeys(t);
    this.del(`${Ce}idx`);
  }
  recover(resumingId = null) {
    let t = 0;
    for (const n of this.list()) {
      if (n.done || n.id === resumingId) continue;
      const o = this.load(n.id);
      if (!o) {
        this.remove(n.id);
        continue;
      }
      try {
        o.summary = so(o, { complete: !1 });
      } catch {
        o.summary = null;
      }
      (this.finish(o), t++);
    }
    return t;
  }
  loadAll(t = null) {
    const n = [];
    for (const o of this.list()) {
      const s = this.load(o.id);
      s && n.push(s);
    }
    return (t && !n.some((o) => o.meta.id === t.meta.id) && n.push(t), n);
  }
}
function Uu(e) {
  return {
    meta: e.meta,
    summary: e.summary,
    events: ys(e),
    frames: { n: e.chunks.reduce((t, n) => t + n.n, 0), chunks: e.chunks.map((t) => t.f) },
  };
}
function Ds(e, t, n = new Date()) {
  return { format: Tt.FORMAT, v: Tt.VERSION, exported: n.toISOString(), build: t, dives: e.map(Uu) };
}
const ki = `${ho.STAGE} · 2026-11-27`;
function Vu(e) {
  const t = () => e.state,
    n = () => {
      const i = t().diver;
      return {
        heading: +((i.heading * 180) / Math.PI).toFixed(1),
        pitch: +((We(i.heading) * 180) / Math.PI).toFixed(1),
        face: i.face,
        sector: e.scene.anim.currentSector,
        mirror: e.scene.anim.mirror,
      };
    },
    o = () => {
      const i = t(),
        a = cl(i);
      return {
        mode: e.mode,
        phase: i.phase,
        t: +i.t.toFixed(2),
        tWall: +i.tWall.toFixed(2),
        x: +i.diver.x.toFixed(2),
        y: +i.diver.y.toFixed(2),
        depth: +i.depth.toFixed(2),
        maxDepth: +i.maxDepth.toFixed(2),
        ascRate: +i.ascRate.toFixed(2),
        timeScale: i.timeScale,
        auto: { ...i.auto, available: vo(i, e.world) },
        gas: i.tanks[i.breathing].id,
        mix: i.tanks[i.breathing].mix,
        bars: Object.fromEntries(i.tanks.map((r) => [r.id, +r.bar.toFixed(1)])),
        marks: Object.fromEntries(i.tanks.map((r) => [r.id, r.marks.map((l) => +l.toFixed(1))])),
        ruleT: i.ruleT,
        tissues: i.tissues.map((r) => +r.toFixed(3)),
        ceiling: +a.ceiling.toFixed(2),
        stop: a.stop,
        stopTime: a.stopTime,
        ndl: Number.isFinite(a.ndl) ? +a.ndl.toFixed(1) : null,
        tts: Number.isFinite(a.tts) ? +a.tts.toFixed(1) : null,
        forecastStatus: a.forecastStatus,
        ppo2: +a.ppo2.toFixed(3),
        end: +a.end.toFixed(1),
        narc: +a.narc.toFixed(2),
        ox: { ...i.ox, t: +i.ox.t.toFixed(2), limit: +i.ox.limit.toFixed(2) },
        alarms: Object.entries(i.alarms)
          .filter(([, r]) => r)
          .map(([r]) => r),
        options: ei(i, e.world).map((r) => ({
          row: r.row,
          id: r.id,
          mix: r.mix,
          mod: Math.floor(r.mod),
          kind: r.kind,
          current: r.current,
          carried: r.carried,
          enabled: r.enabled,
          onLine: r.onLine,
        })),
        pickupButton: zs(i, e.world),
        menuLinger: e.gas.linger,
        menu: e.menuOpen,
        outcome: i.outcome,
        stats: i.stats,
        cave: Wt(i),
        dash: i.dash,
        silt: +i.siltHere.toFixed(3),
        tight: +ko(e.world, i.diver.x, i.diver.y).toFixed(2),
        bottom: os(e.world, i.diver.x, i.diver.y),
        murk: +wo(i).toFixed(2),
        blind: i.blind,
        pose: n(),
        line: {
          reel: i.line.reel,
          parent: i.line.parent,
          pts: i.line.pts.length,
          bends: (i.line.bend ?? []).filter(Boolean).length,
          run: i.line.run.length,
          traps: i.line.trap.filter(Boolean).length,
          laid: +i.line.laid.toFixed(1),
          used: +Ie(i).toFixed(1),
          left: +Ke(i).toFixed(1),
          capacity: i.line.capacity,
          out: i.line.out,
          cut: i.line.cut,
          runningTrapped: Vc(i, e.world),
          tie: ri(i, e.world)?.kind ?? null,
        },
        arrowsLeft: i.arrowsLeft,
        arrows: i.arrows.filter((r) => r.own).length,
        arrowHere: hs(i, e.world) !== null,
        current: i.env.current,
        flow: { x: +i.flow.x.toFixed(3), y: +i.flow.y.toFixed(3) },
        deck: {
          drawn: i.fail.drawn,
          size: i.env.deck.length,
          nextM: i.fail.nextM,
          next: i.env.deck[i.fail.drawn] ?? null,
        },
        fails: i.fail.list.map((r) => ({
          kind: r.kind,
          phase: r.phase,
          t: +r.t.toFixed(2),
          warnS: +r.warnS.toFixed(2),
          early: r.early,
          lostBar: +r.lostBar.toFixed(1),
          leash: +r.leash.toFixed(2),
        })),
        failHold: i.fail.hold && {
          kind: i.fail.hold.kind,
          t: +i.fail.hold.t.toFixed(2),
          need: i.fail.hold.need,
        },
        failButtons: Ur(i),
        gasMult: Gr(i),
        torch: i.fail.torch,
        torchRange: oi(i),
        dark: +ai(i).toFixed(2),
        feel: +ls(i).toFixed(2),
        contact: (() => {
          const r = cs(i, e.world);
          return (
            r && {
              dist: +r.dist.toFixed(2),
              x: +r.x.toFixed(2),
              y: +r.y.toFixed(2),
              ex: +r.ex.toFixed(2),
              ey: +r.ey.toFixed(2),
              line: r.line,
              running: r.running,
            }
          );
        })(),
      };
    },
    s = {
      get app() {
        return e;
      },
      get state() {
        return t();
      },
      get world() {
        return e.world;
      },
      get plan() {
        return t().plan;
      },
      info: o,
      step(i = 1, a) {
        for (let r = 0; r < i && t().phase === "dive"; r++)
          e.simStep(a ? cn({ menu: e.menuOpen, ...a }) : e.readInput());
        return o();
      },
      tick(i = 1, a) {
        for (let r = 0; r < i && t().phase === "dive"; r++)
          e.simStep(a ? cn({ menu: e.menuOpen, ...a }) : e.readInput());
      },
      run(i, a) {
        return s.step(Math.round(i / bt.DT), a ?? {});
      },
      pause() {
        e.paused = !0;
      },
      resume() {
        e.paused = !1;
      },
      teleport(i, a) {
        const r = t();
        let l = r.diver.x,
          h = r.diver.y;
        if (typeof i == "number") ((l = i), (h = a ?? h));
        else if (i.depth !== void 0 && i.x === void 0) {
          const c = vr(e.world.guide, i.depth);
          ((l = c ? c.x : l), (h = i.depth));
        } else ((l = i.x ?? l), (h = i.y ?? i.depth ?? h));
        return ($0(r, e.world, l, h), e.snapCamera(), o());
      },
      setGas(i, a) {
        const r = t(),
          l = a ? r.tanks.find((h) => h.id === a) : r.tanks[r.breathing];
        return (l && (l.bar = i), o());
      },
      setMix(i, a) {
        const r = t(),
          l = a ? r.tanks.find((h) => h.id === a) : r.tanks[r.breathing];
        return (l && (l.mix = i), o());
      },
      setTissues(...i) {
        return (K0(t(), i.flat()), o());
      },
      setSeed(i) {
        e.nextSeed = i >>> 0;
        const a = t();
        return ((a.seed = i >>> 0), (a.rng = Qi(i)), i);
      },
      fail(i, a = "warn") {
        const r = t();
        return ["freeflow", "light", "entangle"].includes(i) ? (Bc(r, e.world, i, a), o()) : null;
      },
      setCurrent(i) {
        return ((t().env.current = Math.max(0, Math.min(Et.MAX_K, i))), t().env.current);
      },
      deck(i) {
        const a = t();
        return (
          i && (a.env.deck = [...i]),
          {
            deck: [...a.env.deck],
            drawn: a.fail.drawn,
            nextM: a.fail.nextM,
            pathM: +a.stats.galleryPathM.toFixed(1),
          }
        );
      },
      flicker() {
        const i = t().fail.list.find((a) => a.kind === "light" && a.phase === "warn");
        return i ? Ro(i.t, i.warnS) : 1;
      },
      envFor(i, a) {
        return ca(i, a);
      },
      seedFor(i, a = 1) {
        for (let r = a; r < a + 1e5; r++) {
          const l = ca(r);
          if (
            (i.current === void 0 || Math.abs(l.current - i.current) < 1e-9) &&
            (i.card === void 0 || l.deck[0] === i.card)
          )
            return r;
        }
        return null;
      },
      silt(i, a, r = 2, l = 1) {
        const h = t();
        return (
          _c(h.silt, e.world, i ?? h.diver.x, a ?? h.diver.y, r, l),
          +Qn(h.silt, h.diver.x, h.diver.y).toFixed(3)
        );
      },
      clearSilt() {
        gc(t().silt);
      },
      siltAt(i, a) {
        return Qn(t().silt, i, a);
      },
      line() {
        const i = t().line;
        return {
          ...i,
          pts: i.pts.map((a) => ({ x: +a.x.toFixed(2), y: +a.y.toFixed(2) })),
          used: Ie(t()),
          left: Ke(t()),
        };
      },
      setReel(i) {
        return ((t().line.capacity = i), i);
      },
      sdf(i, a) {
        return z(e.world, i, a);
      },
      normal(i, a) {
        return $t(e.world, i, a);
      },
      cfg: {
        MAIN_ROUTE: lo,
        FORKS: nh,
        LINE: q,
        ARROW: Ae,
        SILT: U,
        CAVE: $e,
        DASH: De,
        CURRENT: Et,
        FAILS: Ee,
        FREEFLOW: we,
        LIGHT_FAIL: ft,
        ENTANGLE: Nt,
        GEAR: tt,
        V_MAX_X: nt.V_MAX_X,
        V_MAX_Y: nt.V_MAX_Y,
        DT: bt.DT,
        SITE: {
          id: e.world.site.id,
          doors: e.world.doors,
          axes: e.world.site.axes,
          olds: e.world.olds.map((i) => ({ id: i.id, year: i.year, pts: i.pts, trap: i.trap })),
          guide: e.world.guide,
          finds: e.world.site.finds.map((i) => ({ id: i.id, kind: i.kind, x: i.x, y: i.y, pts: i.pts })),
          notes: e.world.site.notes.map((i) => ({ id: i.id, kind: i.kind, x: i.x, y: i.y })),
          halocline: e.world.site.halocline,
        },
      },
      gas(i) {
        const a = t(),
          r = ei(a, e.world).find(
            (l) => !l.current && l.enabled && (i === void 0 ? l.kind !== "drop" : l.row === i),
          );
        return (r && al(a, r, e.world), o());
      },
      menu(i = !0) {
        return (e.toggleMenu(i), e.menuOpen);
      },
      placeTank(i, a = 0.8, r = 0, l = "line") {
        const h = t(),
          c = h.tanks.find((d) => d.id === i);
        return c
          ? ((c.carried = !1),
            (c.x = h.diver.x + a),
            (c.y = h.diver.y + r),
            (c.onLine = l === "line"),
            (c.falling = l === "falling"),
            (c.vx = 0),
            (c.vy = 0),
            (c.fallT = 0),
            { x: c.x, y: c.y })
          : null;
      },
      tanks() {
        return t().tanks.map((i) => ({
          id: i.id,
          carried: i.carried,
          onLine: i.onLine,
          falling: i.falling,
          x: +i.x.toFixed(2),
          y: +i.y.toFixed(2),
          vy: +i.vy.toFixed(2),
          bar: +i.bar.toFixed(1),
        }));
      },
      pose() {
        return n();
      },
      setHeading(i, a) {
        const r = t().diver;
        return (
          (r.heading = (i * Math.PI) / 180),
          (r.face = Mo(r.heading, a ?? r.face)),
          e.scene.anim.snap(t()),
          n()
        );
      },
      dying() {
        const i = t();
        if (!i.dying) return null;
        const a = kn(i);
        return {
          ...i.dying,
          cues: { ...a, ui: +a.ui.toFixed(2), close: +a.close.toFixed(2), quiet: +a.quiet.toFixed(2) },
        };
      },
      snap() {
        e.snapCamera();
      },
      warmFx(i = 3) {
        const a = t();
        e.scene.warm(a, a.diver.x, a.diver.y, i);
      },
      perf() {
        const i = e.layout,
          a = e.currentView;
        return {
          renderMs: +e.perf.renderMs.toFixed(2),
          hudMs: +e.perf.hudMs.toFixed(2),
          phases: Object.fromEntries(Object.entries(e.scene.prof).map(([r, l]) => [r, +l.toFixed(2)])),
          frameMs: +e.perf.frameMs.toFixed(2),
          downscales: e.perf.downscales,
          dpr: i.dpr,
          dev: [i.devW, i.devH],
          css: [+i.cssW.toFixed(2), +i.cssH.toFixed(2)],
          zoom: a ? a.zoom : null,
          zoomOpen: i.zoomOpen,
          zoomCave: i.zoomCave,
          viewW: a ? +(a.W / a.zoom).toFixed(2) : null,
          particles: e.scene.particleCount,
        };
      },
      input(i) {
        e.override = i ? cn(i) : null;
      },
      startDive(i, a, r) {
        const l = Xi({
          ...e.planScreen.current,
          ...i,
          slots: (i?.slots ?? e.planScreen.current.slots).slice(0, Sn),
        });
        return (e.startDive(l, a ?? e.nextSeed, r ?? {}), o());
      },
      envOverride(i) {
        return ((e.envOverride = { ...i }), e.envOverride);
      },
      showPlan() {
        e.showPlan();
      },
      tm: {
        frames: () => {
          const i = e.tm.snapshot();
          return i ? nu(i) : [];
        },
        events: () => {
          const i = e.tm.snapshot();
          return i ? ys(i) : [];
        },
        summary: () => e.tm.cur?.summary ?? null,
        meta: () => e.tm.cur?.meta ?? null,
        json: (i = "last") => e.telemetryJson(i),
        perf: () => ({
          ...e.tm.perf,
          avgUs: e.tm.perf.steps ? +((e.tm.perf.ms / e.tm.perf.steps) * 1e3).toFixed(2) : 0,
        }),
        store: () => ({
          count: e.tmStore.count(),
          chars: e.tmStore.chars(),
          persistent: e.tmStore.persistent,
          list: e.tmStore.list(),
        }),
        flush: () => e.tm.flush(),
      },
      radius: nt.RADIUS_M,
      observe() {
        (e.snapCamera(), e.scene.observe(t(), e.view()));
      },
      walk(i, a, r = 3) {
        for (let l = 0; l < i && t().phase === "dive"; l++)
          (e.simStep(a ? cn({ menu: e.menuOpen, ...a }) : e.readInput()),
            l % r === r - 1 && s.observe());
        return (s.observe(), o());
      },
      vis(i, a) {
        const r = e.scene.lit;
        return {
          light: +r.light(i, a).toFixed(3),
          beam: +r.beam.at(i, a).toFixed(3),
          glow: +r.glow.at(i, a).toFixed(3),
          day: +r.day(i, a).toFixed(3),
          explored: +e.scene.explored.litAt(i, a).toFixed(3),
        };
      },
      explored(i = !1) {
        const a = e.scene.explored;
        return { cells: a.count(), map: i ? a.serialize() : void 0 };
      },
      forget() {
        e.scene.explored.reset();
      },
      finds(i = !1) {
        return (
          i && (e.scene.finds.reset(), (e.diveFinds = [])),
          {
            dive: e.diveFinds.map((a) => ({ ...a, t: +a.t.toFixed(1), prog: +a.prog.toFixed(1) })),
            tracker: [...e.scene.finds.found],
          }
        );
      },
      shoot(i, a = 2) {
        const l = t().camera.frames,
          h = i === void 0 ? {} : { lx: Math.cos(i) * 0.3, ly: Math.sin(i) * 0.3 },
          c = Math.ceil(Q.HOLD_S / bt.DT) + a;
        for (let u = 0; u < c && t().phase === "dive" && t().camera.frames === l; u++)
          e.simStep(cn({ camera: !0, ...h }));
        e.simStep(cn({ ...h }));
        const d = e.diveShots.find((u) => u.n === l + 1);
        return d ? { n: d.n, finds: d.finds, fresh: d.fresh, white: d.white } : null;
      },
      shots() {
        const i = t().camera;
        return {
          camera: { ...i, hold: +i.hold.toFixed(2), charge: +i.charge.toFixed(2) },
          list: e.diveShots.map((a) => ({
            n: a.n,
            finds: a.finds,
            fresh: a.fresh,
            white: a.white,
            img: a.img?.length ?? 0,
            big: a.big?.length ?? 0,
          })),
        };
      },
      flashCover(i = 0.25) {
        const a = e.currentView ?? e.view(),
          r = Xd(e.scene.lit, e.world, a, Oi(a.W, t().tanks.length), i);
        return { ...r, frac: +r.frac.toFixed(3), fracSight: +r.fracSight.toFixed(3) };
      },
      album() {
        const i = ji();
        return {
          frames: Object.fromEntries(Object.entries(i.frames).map(([a, r]) => [a, r?.length ?? 0])),
          chars: Dl(i),
        };
      },
      note(i = !0) {
        return (
          i !== (e.noteOpen !== null) && e.toggleNote(),
          {
            open: e.noteOpen,
            reading: t().reading,
            action: m0(t(), e.world),
            readT: +t().stats.readT.toFixed(1),
          }
        );
      },
      tips: {
        state: () => {
          const i = e.tips;
          return {
            on: i.on,
            phase: i.phase,
            card: i.card ? { ...i.card, t: +i.card.t.toFixed(2) } : null,
            halt: i.halt,
            queue: i.queue(),
            shown: [...i.shown],
            seen: [...i.mem.seen],
            visualK: +i.visualK().toFixed(3),
          };
        },
        force: (i) => (e.tips.forceOpen(i), e.tips.card?.id ?? null),
        close: () => e.closeTip(),
        on: (i) => {
          (e.tips.setOn(i), e.updateTipsRow());
        },
        reset: () => {
          (e.tips.reset(), e.updateTipsRow());
        },
        plan: () => e.planTips(),
        anchor: (i) => e.hudAnchor(i),
      },
      reveal: {
        state: () => ({
          ui: [...e.reveal.mem.ui],
          said: [...e.reveal.mem.said],
          diver: e.reveal.mem.diver,
          line: e.reveal.current(),
          queue: e.reveal.queue(),
          opened: [...e.reveal.opened],
        }),
        open: (i) => {
          for (const a of i === "all" ? $s : i) e.reveal.mem.ui.add(a);
          (e.reveal.persist?.(e.reveal.mem), e.refreshPlanView());
        },
        say: (i) => {
          for (const a of i === "all" ? $s : i) e.reveal.mem.said.add(a);
          e.reveal.persist?.(e.reveal.mem);
        },
        reset: () => {
          (e.reveal.reset(), e.refreshPlanView());
        },
        diver: (i) => {
          (e.reveal.setDiver(i), e.refreshPlanView());
        },
        lines: (i) => e.reveal.setLines(i),
      },
      beyond() {
        return { lineM: +No(t(), e.world).toFixed(1), cutS: +sl(e.world).toFixed(1) };
      },
    };
  window.__dbg = s;
}
