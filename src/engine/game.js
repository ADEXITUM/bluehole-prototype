const he = new URLSearchParams(window.location.search);
const jl = (() => {
  const e = he.get("map");
  return bh(e) ? e : cr.DEFAULT;
})();
Ah(jl);
function Xu() {
  if (!he.has("dbg")) return {};
  const e = {},
    t = Number.parseFloat(he.get("current") ?? "");
  Number.isFinite(t) && (e.current = Math.max(0, Math.min(Et.MAX_K, t)));
  const n = he.get("flows");
  if (n) {
    const s = n.split(",").map((i) => Number.parseFloat(i));
    s.every(Number.isFinite) && (e.flows = s.map((i) => Math.max(-Et.MAX_K, Math.min(Et.MAX_K, i))));
  }
  const o = he.get("deck");
  if (o !== null) {
    const s = new Set(Tn.map((i) => i.id));
    e.deck = o === "none" || o === "" ? [] : o.split(",").filter((i) => s.has(i));
  }
  return e;
}
class ju {
  constructor(ResultScreen = Lu, PlanScreen = Wf) {
    M(this, "world", Zh(jl));
    M(this, "scene", new of(this.world, hd(this.world)));
    M(this, "hud", new rd());
    M(this, "cam", new nd());
    M(this, "canvas", document.getElementById("game"));
    M(this, "frameEl", document.getElementById("frame"));
    M(this, "ctx", this.canvas.getContext("2d", { alpha: !1 }));
    M(this, "input", new Z0(this.canvas));
    M(this, "sound", new td());
    M(this, "planScreen");
    M(this, "boatMap");
    M(this, "resultScreen");
    M(this, "tmStore");
    M(this, "tm");
    M(this, "dprCap", st.MAX_DPR);
    M(this, "devDpr", window.devicePixelRatio || 1);
    M(this, "layout", ka(window.innerWidth, window.innerHeight, this.devDpr, this.dprCap));
    M(this, "state");
    M(this, "mode", "plan");
    M(this, "paused", !1);
    M(this, "gas", new j0());
    M(this, "noteOpen", null);
    M(this, "diveFinds", []);
    M(this, "diveShots", []);
    M(this, "shotData", new Map());
    M(this, "shotBadge", null);
    M(this, "thumbCanvas", document.createElement("canvas"));
    M(this, "diveNotes", new Set());
    M(this, "n2Known", !1);
    M(this, "readShown", !1);
    M(this, "override", null);
    M(this, "tips");
    M(this, "reveal");
    M(this, "freq", !1);
    M(this, "intro");
    M(this, "maxDoor", -1);
    M(this, "lastButtons", null);
    M(this, "worldTime", 0);
    M(this, "envOverride", Xu());
    M(this, "lastInput", xi);
    M(this, "nextSeed", ((Date.now() % 1e9) ^ Math.floor(Math.random() * 1e9)) >>> 0);
    M(this, "diveIndex", 0);
    M(this, "perf", { renderMs: 0, hudMs: 0, frameMs: 16.7, downscales: 0 });
    M(this, "autoDownscale", !he.has("fixeddpr"));
    M(this, "intervals", []);
    M(this, "lastDownscale", 0);
    M(this, "clock", { acc: 0 });
    M(this, "alpha", 1);
    M(this, "last", performance.now());
    M(this, "endT", 0);
    M(this, "time", 0);
    M(this, "prevX", 0);
    M(this, "prevY", 0);
    M(this, "lastView", null);
    M(this, "caveView", !1);
    M(this, "camDoor", -1);
    M(this, "vk", 1);
    const { kv: t, persistent: n } = Ku(() => window.localStorage);
    ((this.tmStore = new Gu(t, n)),
      this.tmStore.recover(Me(qt('session'))?.snapshot?.diveId),
      (this.tm = new yu(this.world, this.tmStore, () => performance.now())),
      (this.tm.shotInfo = (f) => this.shotData.get(f) ?? null));
    const o = mf();
    (this.sound.setMuted(!o), (this.sound.onBreath = (f) => this.scene.bubbles.onBreath(f)));
    const s = df(),
      i = he.has("dbg") && he.has("notips");
    ((this.tips = new Pu({ on: s.on && !i, seen: new Set(s.seen) })),
      (this.reveal = new Wu({
        ui: new Set(s.ui),
        said: new Set(s.said),
        diver: s.diver,
        lines: s.on && !i,
      })),
      (this.freq = s.freq));
    const a = () =>
      ff({
        on: i ? s.on : this.tips.mem.on,
        seen: [...this.tips.mem.seen],
        ui: [...this.reveal.mem.ui],
        said: [...this.reveal.mem.said],
        diver: this.reveal.mem.diver,
        freq: this.freq,
      });
    ((this.tips.persist = a),
      (this.reveal.persist = a),
      (this.tips.blocked = (f) =>
        f === "current" && this.world.site.id === "hub" && !this.diveNotes.has("n2") && !this.n2Known));
    const r = Ci(this.world.site),
      l = Bn();
    if (r && pf() && l.found.length) {
      const f = l.found.map((m) => {
          const y = this.world.site.finds.find((_) => _.id === m);
          return y ? He(this.world.doorSet, y.x, y.y) : -1;
        }),
        p = ja(
          fn(),
          { found: l.found, maxDoor: Math.max(-1, ...f), deco: !1, reelOut: !1, lightFail: !1 },
          !0,
        );
      to([...fn(), ...p.map((m) => m.id)]);
    }
    const h = r ? Mn(Vn() ?? Ua, Si(this.world.site, fn(), this.reveal.mem.diver)) : (Vn() ?? Vi);
    ((this.state = Ls(this.world, h, 1)),
      (this.planScreen = new PlanScreen(document.getElementById("plan"), h, o)),
      (this.intro = new Bu(document.getElementById("intro"))),
      (this.planScreen.onDive = (f) => this.startDive(f)),
      (this.planScreen.onChange = (f) => this.preview(f)),
      (this.planScreen.onSound = (f) => this.setSound(f)),
      (this.planScreen.onTipsToggle = (f) => {
        (this.tips.setOn(f), this.reveal.setLines(f), this.updateTipsRow(), f && this.planTips());
      }),
      (this.planScreen.onTipsReset = () => {
        (this.reveal.reset(),
          this.tips.reset(),
          this.refreshPlanView(),
          this.updateTipsRow(),
          this.planTips());
      }),
      (this.planScreen.onDiverToggle = (f) => {
        (this.reveal.setDiver(f),
          this.refreshPlanView(),
          this.preview(this.planScreen.current),
          this.planTips());
      }),
      (this.planScreen.onFreqToggle = (f) => {
        ((this.freq = f), a(), this.refreshPlanView());
      }),
      (this.resultScreen = new ResultScreen(document.getElementById("result"))),
      (this.resultScreen.onAgain = () => this.startDive(this.state.plan)),
      (this.resultScreen.onPlan = () => this.showPlan()),
      (this.resultScreen.telemetry = {
        last: () => this.telemetryJson("last"),
        downloadAll: () => this.downloadTelemetry(),
      }),
      (this.planScreen.onTmDownload = () => this.downloadTelemetry()),
      (this.planScreen.onTmClear = () => {
        (this.tmStore.clear(), this.updateTmLink());
      }),
      this.updateTmLink(),
      (this.input.onMute = () => {
        (this.setSound(this.sound.muted), this.planScreen.setSound(!this.sound.muted));
      }),
      (this.input.onPress = (f) => {
        f === "gasTile"
          ? this.toggleMenu()
          : f === "read"
            ? this.toggleNote()
            : f === "noteCard" && (this.noteOpen = null);
      }),
      (this.input.onKey = (f) => {
        f === "gas"
          ? this.toggleMenu()
          : f === "read"
            ? this.toggleNote()
            : (this.gas.close(), (this.noteOpen = null));
      }),
      (this.input.onGasKey = () => {
        this.canPickGas() && this.gas.keyPressed();
      }),
      af() && (this.planScreen.intro = "Новая карта — сезон начат заново"),
      this.planScreen.setSeason(Bn()),
      setTimeout(() => Rr(this.world, 0, 0), 0),
      (this.boatMap = new Zf(this.world, this.planScreen.mapSlot)),
      (this.planScreen.onShow = () => this.boatMap.refresh()),
      this.refreshMap(),
      (this.planScreen.onSeasonReset = () => {
        (this.planScreen.setSeason(gf()), this.refreshMap());
      }));
    const c = Il(),
      d = c[c.length - 1];
    (d && this.planScreen.setLog(`Последняя запись логбука — №${d.n} · ${d.date} · ${d.line}`),
      window.addEventListener("resize", () => this.resize()),
      window.addEventListener("pagehide", () => this.tm.flush()),
      document.addEventListener("visibilitychange", () => {
        (document.hidden && this.tm.flush(),
          (this.last = performance.now()),
          (this.clock.acc = 0),
          (this.intervals.length = 0));
      }),
      this.resize(),
      this.refreshPlanView(),
      this.preview(h),
      this.updateTipsRow(),
      !Vn() && c.length === 0 && s.seen.length === 0 && s.ui.length === 0 && !he.has("plan")
        ? (this.planScreen.hide(),
          (this.intro.onDive = () => {
            (this.intro.hide(),
              this.startDive(r ? Mn(Ua, Si(this.world.site, fn(), this.reveal.mem.diver)) : Vi));
          }),
          this.intro.show(this.planScreen.mapSlot),
          requestAnimationFrame(() => this.boatMap.refresh()))
        : this.planTips(),
      requestAnimationFrame((f) => this.frame(f)));
  }
  refreshPlanView() {
    const t = this.reveal.mem.diver;
    ((this.boatMap.refView = { show: (n) => this.reveal.visible(n), plain: !t }),
      this.boatMap.refresh(),
      this.planScreen.setView({
        visible: (n) => this.reveal.visible(n),
        diver: t,
        kit: Si(this.world.site, fn(), t),
        freq: this.freq,
        ladder: Ci(this.world.site),
      }));
  }
  updateTipsRow() {
    const t = this.tips.progress();
    this.planScreen.setTips(this.tips.on, t.seen, t.total);
  }
  planTips() {
    if (this.mode !== "plan" || this.intro?.shown) return;
    const t = this.tips.nextPlan((n) =>
      n.id === "planBoat" ? this.planScreen.hasChoice() : this.planScreen.sectionVisible(n.planRing),
    );
    t &&
      this.planScreen.showTip(te(t), () => {
        (this.tips.markSeen(t), this.updateTipsRow(), this.planTips());
      });
  }
  refreshMap() {
    const t = eo(),
      n = this.scene.explored;
    this.boatMap.setData({
      seen: Bl(t, n.gw, n.gh),
      found: Bn().found,
      notes: t.notes,
      dives: t.dives,
      routeMarks: t.routeMarks,
      lines: vi(this.world),
    });
  }
  get menuOpen() {
    return this.gas.open;
  }
  canAct() {
    const t = this.state;
    return this.mode === "dive" && t.phase === "dive" && !t.dying && !t.cesa;
  }
  canPickGas() {
    return this.canAct() && this.reveal.visible("gasMenu");
  }
  toggleMenu(t = !this.gas.open) {
    if (t && !this.canPickGas()) return this.gas.close();
    (t && (this.noteOpen = null), this.gas.toggle(t));
  }
  toggleNote() {
    if (this.noteOpen) {
      this.noteOpen = null;
      return;
    }
    if (!this.canAct()) return;
    const t = ma(this.state, this.world, this.readShown);
    t && (this.gas.close(), (this.noteOpen = t));
  }
  readInput() {
    if (this.override) return this.override;
    const t = this.input.readStick(),
      n = this.input.isHeld("leave") ? _a(this.state, this.world) : null,
      o = !n && this.input.isHeld("pickup") ? zs(this.state, this.world) : null,
      s = n ?? o ?? (this.gas.open ? X0(this.input.heldRows(), this.input.heldGasKeys()) : null),
      i = this.input.isHeld("dash");
    this.noteOpen &&
      (i ||
        ["valve", "torch", "untangle", "tie", "arrow", "camera"].some((l) => this.input.isHeld(l))) &&
      (this.noteOpen = null);
    let a = t.x,
      r = t.y;
    return (
      i &&
        Math.hypot(a, r) < jt.DASH_IDLE_STICK &&
        Wt(this.state) &&
        ((a = this.state.diver.face), (r = 0)),
      {
        x: a,
        y: r,
        lx: t.lx,
        ly: t.ly,
        pick: s,
        menu: this.gas.open,
        auto: this.input.isHeld("auto"),
        dash: i,
        tie: this.input.isHeld("tie"),
        arrow: this.input.isHeld("arrow"),
        valve: this.input.isHeld("valve"),
        torch: this.input.isHeld("torch"),
        untangle: this.input.isHeld("untangle"),
        read: this.noteOpen !== null,
        camera: this.input.isHeld("camera"),
        wait: this.input.isHeld("wait"),
      }
    );
  }
  setSound(t) {
    (this.sound.setMuted(!t), t && this.sound.init(), yf(t));
  }
  resize() {
    this.devDpr = window.devicePixelRatio || 1;
    const t = ka(window.innerWidth, window.innerHeight, this.devDpr, this.dprCap);
    ((this.layout = t),
      (this.frameEl.style.left = `${t.left}px`),
      (this.frameEl.style.width = `${t.cssW}px`),
      (this.frameEl.style.height = `${t.cssH}px`),
      (this.canvas.width = t.devW),
      (this.canvas.height = t.devH),
      (this.canvas.style.width = `${t.cssW}px`),
      (this.canvas.style.height = `${t.cssH}px`),
      this.scene.resize(t.devW, t.devH, Math.min(t.zoomOpen, t.zoomCave), t.dpr),
      this.snapCamera());
  }
  zoomFor(t) {
    const n = He(this.world.doorSet, t.diver.x, t.diver.y);
    if (n >= 0) ((this.caveView = !0), (this.camDoor = n));
    else if (this.caveView) {
      const o = this.world.doors[this.camDoor] ?? this.world.doors[0];
      (!o ||
        (t.diver.x - o.x) * o.side < -1.5 ||
        t.depth < o.span[0] - st.ZOOM_EXIT_DEPTH_M ||
        t.depth > o.span[1] + st.ZOOM_EXIT_DEPTH_M) &&
        (this.caveView = !1);
    }
    return this.mode !== "plan" && this.caveView ? this.layout.zoomCave : this.layout.zoomOpen;
  }
  snapCamera() {
    const t = this.state.diver,
      n = this.layout;
    ((this.caveView = Wt(this.state)),
      this.cam.snap(t.x, t.y, n.devW, n.devH, this.world, this.zoomFor(this.state)),
      (this.prevX = t.x),
      (this.prevY = t.y),
      this.scene.anim.snap(this.state));
  }
  preview(t) {
    this.mode === "plan" &&
      ((this.state = Ls(this.world, t, 1, void 0, vi(this.world))), this.snapCamera());
  }
  showPlan() {
    ((this.mode = "plan"),
      this.gas.close(),
      (this.input.enabled = !1),
      this.input.reset(),
      this.resultScreen.hide(),
      this.planScreen.show(),
      this.preview(this.planScreen.current),
      this.updateTipsRow(),
      this.planTips());
  }
  startDive(t, n = this.nextSeed, o = {}) {
    (this.sound.init(), Va(t), document.activeElement?.blur?.());
    const s = lf();
    (Pl(s + 1), (this.diveIndex = s));
    const i = this.freq || he.has("dbg");
    ((this.state = Ls(
      this.world,
      t,
      n,
      { ...Lc(this.world.site, n, s, i), ...this.envOverride, ...o },
      vi(this.world),
    )),
      (this.state.routeMarks=new Set(eo().routeMarks??[])),
      this.tm.begin(this.state, {
        id: `${Date.now().toString(36)}-${(n >>> 0).toString(36)}`,
        n: s + 1,
        date: new Date().toISOString(),
        build: ki,
        device: {
          touch: window.matchMedia?.("(pointer: coarse)").matches ?? !1,
          w: window.innerWidth,
          h: window.innerHeight,
          dpr: window.devicePixelRatio || 1,
        },
      }),
      (this.nextSeed = (Math.imul(n, 1664525) + 1013904223) >>> 0),
      (this.mode = "dive"),
      (this.paused = !1),
      this.gas.close(),
      (this.noteOpen = null),
      (this.diveFinds = []),
      (this.diveShots = []),
      this.shotData.clear(),
      (this.shotBadge = null),
      this.diveNotes.clear(),
      (this.n2Known = eo().notes.includes("n2")),
      (this.readShown = !1),
      this.tips.beginDive(),
      this.reveal.beginDive(),
      (this.maxDoor = -1),
      this.intro.hide(),
      (this.input.modal = null),
      (this.lastButtons = null),
      this.planScreen.closeTip(),
      (this.lastInput = xi),
      (this.clock.acc = 0),
      (this.alpha = 1),
      (this.endT = 0),
      this.input.reset(),
      (this.input.enabled = !0),
      this.planScreen.hide(),
      this.resultScreen.hide(),
      this.scene.resetFx(Bn().found),
      this.snapCamera());
  }
  simStep(t) {
    const n = this.state;
    ((this.prevX = n.diver.x), (this.prevY = n.diver.y), (this.lastInput = t), T0(n, t, this.world));
    this.afterSimulationStep?.(n, this.world);
    const o = He(this.world.doorSet, n.diver.x, n.diver.y);
    o > this.maxDoor && (this.maxDoor = o);
    for (const s of n.events) s.type === "shot" && this.onShot(s);
    (this.tm.onStep(n, t),
      this.tips.afterStep(n),
      this.noteOpen && n.reading !== this.noteOpen && (this.noteOpen = null));
    for (const s of n.events)
      (this.sound.onEvent(s),
        this.scene.onEvent(s),
        (s.type === "gas" || s.type === "drop" || s.type === "pickup") && this.gas.acted(),
        (s.type === "cesa" || s.type === "dying") && this.gas.close(),
        s.type === "read" && s.on && this.diveNotes.add(s.note));
    n.phase !== "dive" &&
      this.mode === "dive" &&
      (this.tm.finish(n, { keyboard: this.input.lastKeyboard }),
      this.updateTmLink(),
      (this.mode = "ending"),
      this.gas.close(),
      (this.noteOpen = null),
      (this.endT = 0),
      (this.input.enabled = !1),
      this.input.reset());
  }
  finishDive() {
    this.mode = "result";
    const t = this.state,
      n = this.diveFinds.map((_) => _.id),
      o = {}, albumMarks = {};
    for (const shot of this.diveShots) {
      for (const id of shot.finds) {
        if (o[id] || !shot.img) continue;
        o[id] = shot.img;
        if (shot.marks?.[id]) albumMarks[id] = shot.marks[id];
      }
    }
    const s = No(t, this.world),
      i = rf(ku(t, this.world, { finds: t.outcome?.kind === "dead" ? [] : n, lineM: s })),
      a = t.outcome?.kind === "dead" ? Su(t, this.world, this.tm.cur, this.tm.field) : null,
      r = a ? this.tips.recall(t, a.broke) : null,
      l = [...(a?.notes ?? []), ...(r ? [`Инструктор говорил: «${r}»`] : [])],
      h = t.outcome?.kind !== "dead",
      c = Rf(t, this.world),
      d = c.added ? c.lines.lines[c.lines.lines.length - 1] : null,
      u = d
        ? d.pts.reduce(
            (_, g, S) => (S ? _ + Math.hypot(g.x - d.pts[S - 1].x, g.y - d.pts[S - 1].y) : 0),
            0,
          )
        : 0,
      f = t.line.parent ? Math.max(0, t.stats.lineMaxM - u) : 0,
      p = _f(n, s, h, o, albumMarks),
      m = Tf(this.scene.explored.serialize(), [...this.diveNotes], h, t.routeMarks),
      y = [],
      gearIds = [];
    if (Ci(this.world.site)) {
      const previousGear = fn();
      const earned = ja(previousGear, Cf(t, p.season.found, this.maxDoor), h);
      for (const item of earned) {
        gearIds.push(item.id);
        if (item.line) y.push(item.line);
      }
      if (earned.length) to([...previousGear, ...gearIds]);
      this.refreshPlanView();
      if (earned.length) {
        // Validate the new loadout against the gear just earned on this dive.
        const nextPlan = Df(t.plan, earned, this.planScreen.view.kit);
        Va(nextPlan);
        this.planScreen.setPlan(nextPlan);
      }
    }
    (this.resultScreen.show(
      t,
      i,
      a?.chain ?? [],
      {
        finds: n,
        lineM: s,
        lineAllM: t.line.parent ? Ie(t) : 0,
        season: p,
        survey: m,
        shots: this.diveShots,
        keptM: u,
        reeledM: f,
        gear: y,
        gearIds,
        nextPlan: this.planScreen.current,
        turn: this.tm.cur?.summary?.turn,
        diver: this.reveal.mem.diver,
      },
      l,
    ),
      (this.planScreen.intro = null),
      this.planScreen.setSeason(p.season),
      this.refreshMap(),
      this.planScreen.setLog(`Последняя запись логбука — №${i.n} · ${i.date} · ${i.line}`));
  }
  onShot(event) {
    const state = this.state;
    const view = this.view();
    const frame = this.photoFrame(view, event);
    const shot = this.scene.shoot(state, view, event.n, frame);
    const progress = ds(state.diver, this.world);
    for (const id of shot.finds) {
      if (!this.diveFinds.some(find => find.id === id)) this.diveFinds.push({ id, t: state.t, prog: progress });
    }
    // Expose at the shutter position, before the camera follows the next
    // movement. Both the album image and the full photo use this same frame.
    this.scene.draw(this.ctx, state, view, state.diver.x, state.diver.y, 0, 0, this.worldTime);
    this.captureShot(shot, frame);
    this.diveShots.push(shot);
    this.shotData.set(event.n, {
      finds: shot.finds,
      fresh: shot.fresh,
      white: shot.white,
      bs: Math.round(shot.backscatter * 100) / 100,
    });
    if (shot.fresh.length) {
      this.sound.discovery();
      this.shotBadge = { n: event.n, t: 0 };
    }
  }
  photoFrame(view, event) {
    const hit = this.flashHit(event.x, event.y, event.aim);
    const cx = ((event.x + hit.x) / 2 - view.ox) * view.zoom;
    const cy = ((event.y + hit.y) / 2 - view.oy) * view.zoom;
    const size = Math.min(view.W, view.H);
    return {
      x: Math.max(0, Math.min(view.W - size, Math.round(cx - size / 2))),
      y: Math.max(0, Math.min(view.H - size, Math.round(cy - size / 2))),
      size,
    };
  }
  flashHit(t, n, o) {
    const s = Math.cos(o),
      i = Math.sin(o);
    for (let a = 0.1; a <= Q.FLASH_RANGE_M; a += 0.1)
      if (z(this.world, t + s * a, n + i * a) <= 0) return { x: t + s * a, y: n + i * a };
    return { x: t + s * Q.FLASH_RANGE_M, y: n + i * Q.FLASH_RANGE_M };
  }
  captureShot(shot, frame) {
    const output = this.thumbCanvas;
    const ctx = output.getContext("2d");
    shot.big = null;
    shot.img = null;
    if (!ctx) return;
    const encode = (width, qualities, maxChars) => {
      output.width = width;
      output.height = width;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(this.canvas, frame.x, frame.y, frame.size, frame.size, 0, 0, width, width);
      let data = null;
      for (const quality of qualities) {
        data = output.toDataURL("image/jpeg", quality);
        if (data.length <= maxChars) break;
      }
      return data?.startsWith("data:image/") ? data : null;
    };
    try {
      shot.big = encode(Q.BIG_W, [Q.BIG_Q], Infinity);
      shot.img = encode(Q.THUMB_W, Q.THUMB_Q, Q.THUMB_MAX_CHARS);
    } catch {}
  }
  telemetryJson(t) {
    if (t === "last") {
      const n = this.tm.snapshot();
      return n ? JSON.stringify(Ds([n], ki)) : null;
    }
    return JSON.stringify(Ds(this.tmStore.loadAll(this.tm.snapshot()), ki));
  }
  downloadTelemetry() {
    const t = this.tmStore.loadAll(this.tm.snapshot()),
      n = JSON.stringify(Ds(t, ki));
    return { ok: vf(Pf("bluehole-telemetry"), n), dives: t.length, chars: n.length };
  }
  updateTmLink() {
    this.planScreen.setTelemetry(this.tmStore.count(), this.tmStore.chars(), this.tmStore.persistent);
  }
  frame(t) {
    const n = t - this.last,
      o = Math.min(wi.MAX_FRAME_S, Math.max(0, n / 1e3));
    if (
      ((this.last = t),
      (this.time += o),
      (window.devicePixelRatio || 1) !== this.devDpr && this.resize(),
      this.watchPerf(t, n),
      this.canSimulate())
    ) {
      ((this.alpha = vu(
        this.tips,
        this.clock,
        o,
        () => this.state,
        () => (this.simStep(this.readInput()), this.canSimulate()),
        this.world,
        this.lastButtons,
      )),
        this.syncTipInput());
      const i = this.state;
      this.gas.frame(
        o * this.tips.visualK(),
        this.lastInput.pick !== null,
        i.alarms.ppo2High || i.alarms.ppo2Low,
      );
    } else this.alpha = 1;
    ((this.vk = this.mode === "dive" ? this.tips.visualK() : 1),
      (this.worldTime += o * this.vk),
      this.sound.setDuck(vt.DUCK + (1 - vt.DUCK) * this.vk),
      this.gas.open || this.input.dropRows(),
      this.mode === "ending" && ((this.endT += o), this.endT >= this.endFadeS() && this.finishDive()));
    const s = this.state;
    (this.sound.update(s, o * this.vk, fl(s), {
      line: this.mode === "dive" ? cs(s, this.world) : null,
      murk: wo(s),
      feel: ls(s),
    }),
      this.render(o),
      requestAnimationFrame((i) => this.frame(i)));
  }
  syncTipInput() {
    const t = this.tips.phase === "card";
    t && !this.input.modal
      ? (this.input.resetHolds(), (this.input.modal = () => this.closeTip()))
      : !t && this.input.modal && (this.input.modal = null);
  }
  canSimulate(){
    // Reading gets one simulation step to register the note, then freezes.
    return this.mode==="dive"&&!this.paused&&!document.hidden&&(!this.noteOpen||this.state.reading!==this.noteOpen);
  }
  closeTip() {
    const t = this.tips.dismiss();
    return t
      ? (this.tm.mark(this.state, "tip", { id: t.id, pause: t.pause, urgent: t.urgent }),
        this.tips.phase !== "card" && ((this.input.modal = null), this.input.resetHolds()),
        t.id)
      : null;
  }
  endFadeS() {
    return this.state.outcome?.kind === "dead" ? Rt.END_FADE_S : j.END_FADE_S;
  }
  watchPerf(t, n) {
    if (
      (n > 0 &&
        n < 250 &&
        ((this.perf.frameMs += (n - this.perf.frameMs) * 0.05),
        this.intervals.push(n),
        this.intervals.length > je.WINDOW_FRAMES && this.intervals.shift()),
      !this.autoDownscale ||
        document.hidden ||
        this.intervals.length < je.WINDOW_FRAMES ||
        t - this.lastDownscale < je.COOLDOWN_S * 1e3 ||
        this.layout.dpr <= je.MIN_DPR)
    )
      return;
    const o = [...this.intervals].sort((s, i) => s - i);
    o[o.length >> 1] <= je.SLOW_FRAME_MS ||
      ((this.dprCap = Math.max(je.MIN_DPR, this.layout.dpr * je.STEP)),
      (this.lastDownscale = t),
      this.perf.downscales++,
      (this.intervals.length = 0),
      this.resize());
  }
  view() {
    const t = this.layout,
      n = this.cam.zoom;
    return {
      ox: Math.round(this.cam.left(t.devW) * n) / n,
      oy: Math.round(this.cam.top(t.devH) * n) / n,
      zoom: n,
      W: t.devW,
      H: t.devH,
      dpr: t.dpr,
    };
  }
  buttons(t) {
    if(this.noteOpen)return {auto:false,autoDir:{x:0,y:1},dash:false,tie:null,arrow:false,valve:false,torch:false,untangle:false,leave:false,pickup:null,read:true,camera:false,wait:false};
    const n = this.mode === "dive" && t.phase === "dive" && !t.dying,
      o = n && !t.lineHoldLock,
      s = o ? ri(t, this.world) : null,
      i = n && vo(t, this.world, !t.auto.on);
    let a = { x: 0, y: 1 };
    if (i && Wt(t)) {
      const l = li(t, this.world);
      if (l) {
        const h = an(l.route, Math.max(0, l.s + l.dir * 3));
        Math.hypot(h.x - t.diver.x, h.y - t.diver.y) > 0.2 &&
          (a = { x: h.x >= t.diver.x ? 1 : -1, y: 0 });
      }
    }
    const r =
      n && !t.fail.holdLock && !t.cesa && t.ox.phase !== "convulse"
        ? Ur(t)
        : { valve: !1, torch: !1, untangle: !1 };
    return {
      auto: i,
      autoDir: a,
      dash: n && Wt(t) && !t.cesa && t.ox.phase !== "convulse" && !t.lineHold && !t.fail.hold,
      tie: s ? s.kind : null,
      arrow: o && hs(t, this.world) !== null,
      ...r,
      leave: n && _a(t, this.world) !== null,
      pickup: n ? zs(t, this.world) : null,
      read: this.readButton(t, n),
      camera: n && !t.cesa && el(t) > 0 && this.noteOpen === null,
      wait: n && Ys(t),
    };
  }
  readButton(t, n) {
    return ((this.readShown = n && ma(t, this.world, this.readShown) !== null), this.readShown);
  }
  render(t) {
    const n = performance.now(),
      o = this.layout,
      s = this.state,
      i = this.mode === "dive" && !this.paused ? this.alpha : 1,
      a = this.prevX + (s.diver.x - this.prevX) * i,
      r = this.prevY + (s.diver.y - this.prevY) * i,
      l = this.mode === "dive" && !this.paused && s.phase === "dive" ? s.timeScale : 1,
      h = t * this.vk;
    this.cam.update(
      a,
      r,
      s.diver.vx * l,
      s.diver.vy * l,
      o.devW,
      o.devH,
      this.world,
      h,
      this.zoomFor(s),
    );
    const c = this.view();
    this.lastView = c;
    const d = this.ctx,
      u = this.mode === "dive" && !this.paused && s.phase === "dive" ? h * s.timeScale : 0;
    (this.scene.draw(d, s, c, a, r, u, h, this.worldTime),
      this.scene.drawUntruth(d, s, c),
      this.scene.drawAfterglow(d, c),
      this.shotBadge &&
        ((this.shotBadge.t += h), this.shotBadge.t >= Q.NEW_BADGE_S && (this.shotBadge = null)));
    const f = performance.now();
    if ((d.setTransform(o.dpr, 0, 0, o.dpr, 0, 0), this.mode !== "plan")) {
      const m =
          this.mode === "ending"
            ? Math.min(1, this.endT / this.endFadeS())
            : this.mode === "result"
              ? 0.85
              : 0,
        y = c.zoom / o.dpr,
        _ = this.buttons(s),
        g = cl(s);
      this.mode === "dive" && !this.paused && this.reveal.update(s, this.world, _, g, t);
      const S = Cu(_, (b) => this.reveal.visible(b), Wt(s));
      this.lastButtons = this.mode === "dive" ? S : null;
      const A = this.mode === "dive" ? this.tips.card : null,
        E = this.mode === "dive" ? this.reveal.current(s) : null;
      if (
        (this.hud.draw(
          d,
          s,
          g,
          {
            layout: o,
            ppm: y,
            oy: c.oy,
            diverX: (a - c.ox) * y,
            diverY: (r - c.oy) * y,
            joy: this.input.joy,
            menuOpen: this.gas.open || !!this.override?.menu,
            options: s.phase === "dive" && !s.dying ? ei(s, this.world) : [],
            pickHeld: this.lastInput.pick,
            buttons: S,
            cave: Wt(s),
            autoHeld: this.lastInput.auto,
            dashHeld: this.lastInput.dash,
            tieHeld: this.lastInput.tie,
            arrowHeld: this.lastInput.arrow,
            valveHeld: this.lastInput.valve,
            torchHeld: this.lastInput.torch,
            untangleHeld: this.lastInput.untangle,
            leaveHeld: this.lastInput.pick !== null && this.input.isHeld("leave"),
            pickupHeld: this.lastInput.pick !== null && this.input.isHeld("pickup"),
            cameraHeld: !!this.lastInput.camera,
            shotBadge: this.shotBadge,
            note: this.noteOpen
              ? (this.world.site.notes.find((b) => b.id === this.noteOpen) ?? null)
              : null,
            reelFrac: s.line.capacity > 0 ? Ke(s) / s.line.capacity : 0,
            reelLeft: Ke(s),
            keyboard: this.input.lastKeyboard,
            fade: m,
            time: this.time,
            tip: A ? { def: te(A.id), t: A.t, closable: this.tips.canClose() } : null,
            ui: { has: (b) => this.reveal.visible(b), diver: this.reveal.mem.diver },
            line: E ? { text: E.text, at: E.at, t: E.t, dur: E.dur } : null,
            waitHeld: !!this.lastInput.wait,
          },
          t,
        ),
        this.mode === "dive")
      ) {
        const b = (T) => {
          if (T.lesson && !Ou(T.lesson, s, this.world)) return false;
          if (T.id === "turnMarks" || T.id === "turnHit") {
            if (!Wt(s) || s.ruleT === null) return false;
            if (T.id === "turnHit" && !Hu("turnMarkHit", T.id, s, this.world, S, g, 0)) return false;
          }
          return T.kind === "button" ? !!S[T.id] : !!T.at && this.hud.anchorOf(T.at) !== null;
        };
        this.reveal.frame(t, this.paused || this.tips.phase !== "run" || !!s.dying, b);
      }
    }
    this.input.setZones(this.hud.buttonZones());
    const p = performance.now();
    ((this.perf.renderMs += (p - n - this.perf.renderMs) * 0.05),
      (this.perf.hudMs += (p - f - this.perf.hudMs) * 0.05));
  }
  hudAnchor(t) {
    return this.hud.anchorOf(t);
  }
  get currentView() {
    return this.lastView;
  }
}
