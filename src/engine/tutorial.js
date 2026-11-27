const Ai = (e) => {
  const t = 1 - Math.min(1, Math.max(0, e));
  return t * t;
};
function Ru(e) {
  switch (e.type) {
    case "fail":
      return e.phase === "warn" ? e.kind : null;
    case "blind":
      return e.on ? "blind" : null;
    case "alarm":
      return e.on
        ? e.kind === "gasOut"
          ? "gasOut"
          : e.kind === "ppo2High"
            ? "ppo2High"
            : e.kind === "ascent"
              ? "ascent"
              : e.kind === "ceiling"
                ? "ceiling"
                : null
        : null;
    case "ox":
      return e.phase === "symptoms" ? "ox" : null;
    default:
      return null;
  }
}
function Iu(e, t) {
  const n = t.site.halocline;
  if (n === null) return !1;
  const o = e.diver,
    s = oi(e);
  if (Math.abs(o.y - n) > s) return !1;
  const i = Math.cos(o.aim),
    a = Math.sin(o.aim);
  let r = o.y;
  for (let l = vt.HALO_STEP_M; l <= s; l += vt.HALO_STEP_M) {
    const h = o.x + i * l,
      c = o.y + a * l;
    if (z(t, h, c) <= 0) return !1;
    if ((r - n) * (c - n) <= 0 && z(t, h, n) > 0.04) return !0;
    r = c;
  }
  return !1;
}
function Ou(e, t, n, o = null, s = new Map()) {
  switch (e) {
    case "deco":
      return t.stop > 0;
    case "narc":
      return Ln(On(t), t.depth) >= ce.END_ONSET_M;
    case "current":
      return Wt(t) && Math.hypot(t.flow.x, t.flow.y) >= vt.CURRENT_MPS;
    case "halocline":
      return Iu(t, n);
    default:
      return !1;
  }
}
class Pu {
  constructor(t) {
    M(this, "mem");
    M(this, "phase", "run");
    M(this, "card", null);
    M(this, "halt", !1);
    M(this, "shown", []);
    M(this, "persist", null);
    M(this, "blocked", null);
    M(this, "slowT", 0);
    M(this, "slowId", null);
    M(this, "pauseT", 0);
    M(this, "wall", 0);
    M(this, "lastWall", -1 / 0);
    M(this, "urgent", []);
    M(this, "since", new Map());
    this.mem = t;
  }
  get on() {
    return this.mem.on;
  }
  beginDive() {
    ((this.phase = "run"),
      (this.card = null),
      (this.halt = !1),
      (this.shown.length = 0),
      (this.slowT = 0),
      (this.slowId = null),
      (this.pauseT = 0),
      (this.wall = 0),
      (this.lastWall = -1 / 0),
      (this.urgent.length = 0),
      this.since.clear());
  }
  allowed(t) {
    return this.mem.on && t.phase === "dive" && !t.dying && t.tWall >= vt.QUIET_S;
  }
  afterStep(t) {
    if (!this.mem.on) return !1;
    this.wall = t.tWall;
    const n = [];
    for (const i of t.events) {
      const a = Ru(i);
      a && n.push(a);
    }
    if (!n.length || !this.allowed(t)) return this.halt;
    const o = n.filter((i) => !this.mem.seen.has(i) && !this.urgent.includes(i) && this.card?.id !== i),
      s = new Set(o.flatMap((i) => te(i).cover ?? []));
    for (const i of o) s.has(i) || this.urgent.push(i);
    return (this.urgent.length && (this.halt = !0), this.halt);
  }
  update(t, n, o) {
    if (this.mem.on) {
      this.wall = t.tWall;
      for (const s of Li) {
        if (s.where !== "dive" || s.urgent || this.mem.seen.has(s.id) || this.blocked?.(s.id)) {
          this.since.delete(s.id);
          continue;
        }
        Ou(s.id, t, n, o)
          ? this.since.has(s.id) || this.since.set(s.id, t.tWall)
          : this.since.delete(s.id);
      }
    }
  }
  next(t) {
    if (!this.allowed(t)) return null;
    if (this.urgent.length) return { id: this.urgent[0], urgent: !0 };
    if (t.tWall - this.lastWall < vt.MIN_GAP_S - 1e-9) return null;
    let n = null,
      o = 1 / 0,
      s = 1 / 0;
    for (const [i, a] of this.since) {
      if (this.mem.seen.has(i)) continue;
      const r = te(i).prio ?? 2;
      (r < o || (r === o && a < s)) && ((n = i), (o = r), (s = a));
    }
    return n ? { id: n, urgent: !1 } : null;
  }
  queue() {
    return [...this.since.entries()]
      .sort((t, n) => (te(t[0]).prio ?? 2) - (te(n[0]).prio ?? 2) || t[1] - n[1])
      .map((t) => t[0]);
  }
  frame(t, n, o = null, s = null) {
    if (
      (this.phase === "run" && o && this.update(n, o, s), (this.wall = n.tWall), this.phase === "card")
    )
      return ((this.card.t += t), (this.pauseT += t), 0);
    if (this.phase === "slow")
      return this.allowed(n)
        ? this.urgent.length
          ? (this.open(this.urgent[0], !0, Ai(this.slowT / vt.SLOW_S)), 0)
          : ((this.slowT += t),
            (this.pauseT += t),
            this.slowT >= vt.SLOW_S - 1e-9
              ? (this.open(this.slowId, !1, 0), 0)
              : Ai(this.slowT / vt.SLOW_S))
        : ((this.phase = "run"), (this.slowId = null), 1);
    const i = this.next(n);
    return i
      ? ((this.pauseT = 0),
        i.urgent
          ? (this.open(i.id, !0, 1), 0)
          : ((this.phase = "slow"), (this.slowT = 0), (this.slowId = i.id), 1))
      : ((this.halt = !1), (this.urgent.length = 0), 1);
  }
  open(t, n, o) {
    ((this.phase = "card"), (this.card = { id: t, urgent: n, t: 0, vis0: o }), (this.slowId = null));
    const s = this.urgent.indexOf(t);
    (s >= 0 && this.urgent.splice(s, 1),
      (this.halt = !1),
      this.since.delete(t),
      (this.lastWall = this.wall),
      this.shown.push(t),
      this.markSeen(t));
  }
  forceOpen(t) {
    ((this.pauseT = 0), this.open(t, !!te(t).urgent, 0));
  }
  visualK() {
    if (this.phase === "run") return 1;
    if (this.phase === "slow") return Ai(this.slowT / vt.SLOW_S);
    const t = this.card;
    return t.vis0 * Ai(t.t / vt.SLOW_S);
  }
  canClose() {
    return this.phase === "card" && this.card.t >= vt.CLOSE_MIN_S - 1e-9;
  }
  dismiss() {
    if (!this.canClose()) return null;
    const t = this.card,
      n = { id: t.id, urgent: t.urgent, pause: this.pauseT };
    return (
      this.urgent.length
        ? ((this.pauseT = 0), this.open(this.urgent[0], !0, 0))
        : ((this.phase = "run"), (this.card = null)),
      n
    );
  }
  markSeen(t) {
    this.mem.seen.has(t) || (this.mem.seen.add(t), this.persist?.(this.mem));
  }
  reset() {
    (this.mem.seen.clear(), this.persist?.(this.mem));
  }
  setOn(t) {
    ((this.mem.on = t),
      t || ((this.urgent.length = 0), this.since.clear(), (this.halt = !1)),
      this.persist?.(this.mem));
  }
  nextPlan(t = () => !0) {
    return this.mem.on
      ? (Li.find((n) => n.where === "plan" && !this.mem.seen.has(n.id) && t(n))?.id ?? null)
      : null;
  }
  progress() {
    return { seen: this.mem.seen.size, total: Li.length };
  }
  recall(t, n = []) {
    const o = t.outcome;
    if (!o || o.kind !== "dead" || !o.cause) return null;
    const s = (...a) => a.some((r) => this.mem.seen.has(r)),
      i = (a) => n.includes(a);
    if (o.cause === "ox-tox") return i("deepGas") && s("ppo2High", "ox") ? te("ppo2High").recall : null;
    if (o.cause === "embolism" || o.cause === "dcs")
      return i("fastAscent") && s("ascent")
        ? te("ascent").recall
        : i("skipDeco") && s("ceiling", "deco")
          ? te("ceiling").recall
          : null;
    if (o.cause === "oog-overhead" || o.cause === "oog-deco" || o.cause === "oog") {
      if (i("valveLate") && s("freeflow")) return te("freeflow").recall;
      if (i("thirdsInCurrent") && s("current", "planThirds")) return te("current").recall;
      if (i("lateTurn") && s("gasOut", "planThirds")) return te("planThirds").recall;
    }
    return null;
  }
}
function vu(e, t, n, o, s, i = null, a = null) {
  const r = e.frame(n, o(), i, a);
  let l = 1;
  return (
    r > 0 &&
      (l = G0(
        t,
        n * r,
        () => o().timeScale,
        () => s() && !e.halt,
      )),
    e.halt && (e.frame(0, o()), (l = 1)),
    l
  );
}
const Nu = (e) => {
  let t = 0;
  for (let n = 1; n < e.length; n++) t += Math.hypot(e[n].x - e[n - 1].x, e[n].y - e[n - 1].y);
  return t;
};
function Cu(e, t, n) {
  return {
    ...e,
    auto: e.auto && t("auto"),
    dash: e.dash && t("dash"),
    tie: e.tie !== null && t("tie") ? e.tie : null,
    arrow: e.arrow && t("arrow"),
    valve: e.valve && t("valve"),
    torch: e.torch && t("torch"),
    untangle: e.untangle && t("untangle"),
    leave: e.leave && t("leave") && !n,
    pickup: e.pickup !== null && t("pickup") ? e.pickup : null,
    read: e.read && t("read"),
    camera: !!e.camera && t("camera"),
    wait: !!e.wait && t("wait"),
  };
}
function xu(e, t) {
  switch (e) {
    case "auto":
    case "dash":
    case "arrow":
    case "valve":
    case "torch":
    case "untangle":
    case "leave":
    case "read":
    case "camera":
    case "wait":
      return !!t[e];
    case "tie":
      return t.tie !== null;
    case "pickup":
      return t.pickup !== null;
    default:
      return !1;
  }
}
function Du(e, t, n) {
  if (n.tie !== "in") return !1;
  const o = ri(e, t);
  if (!o || o.kind !== "in") return !1;
  if (o.parent === "own") return !0;
  const s =
    o.parent === "explorer"
      ? (t.olds[Math.max(0, o.idx)]?.pts ?? t.explorer)
      : o.parent === "laid"
        ? e.laid[o.idx]?.pts
        : null;
  return !!s && Nu(s) - o.s <= vt.REEL_END_M;
}
function Fu(e) {
  const t = ye(Bt.ean50),
    n = e.tanks.findIndex((s) => s.mix === "ean50"),
    o = e.tanks[n];
  return (
    !!o &&
    o.bar > 0 &&
    n !== e.breathing &&
    e.maxDepth > t + vt.EAN50_DEEP_M &&
    e.depth <= t &&
    e.depth > 1
  );
}
function Hu(e, t, n, o, s, i, a) {
  switch (e) {
    case "start":
      return n.phase === "dive";
    case "ascending":
      return a >= Pe.ASCENT_S || n.alarms.ascent;
    case "rule":
      return n.ruleT !== null;
    case "turnMarkHit": {
      const r = n.tanks.find((l) => l.id === "back");
      return !!r && r.marks.length > 0 && r.bar <= r.marks[0] && Wt(n);
    }
    case "ndlNear":
      return n.started && i.stop === 0 && Number.isFinite(i.ndl) && i.ndl < Pe.NDL_S;
    case "decoStart":
      return n.stop > 0;
    case "murk":
      return n.siltHere >= U.MURKY;
    case "narc":
      return Ln(On(n), n.depth) >= ce.END_ONSET_M;
    case "current":
    case "halocline":
      return Ou(e, n, o);
    case "secondGas":
      return n.tanks.length >= 2 || n.alarms.ppo2High || n.alarms.ppo2Low;
    case "ean50Depth":
      return Fu(n);
    case "lineEnd":
      return Du(n, o, s);
    case "tieOff":
      return n.stats.ties >= 1;
    case "tieOffKind":
      return s.tie === "off";
    case "cutKind":
      return s.tie === "end";
    case "button":
      return xu(t, s);
    case "gallery":
      return Wt(n);
    default:
      return !1;
  }
}
class Wu {
  constructor(t) {
    M(this, "mem");
    M(this, "known", new Set());
    M(this, "pending", []);
    M(this, "line", null);
    M(this, "gap", 0);
    M(this, "perDive", 0);
    M(this, "ascT", 0);
    M(this, "diveT", 0);
    M(this, "opened", []);
    M(this, "persist", null);
    this.mem = t;
  }
  visible(t) {
    return this.mem.diver || this.mem.ui.has(t);
  }
  beginDive() {
    ((this.known = new Set(this.mem.ui)),
      (this.pending = Ks.filter((t) => t.line && this.mem.ui.has(t.id) && !this.mem.said.has(t.id)).map(
        (t) => t.id,
      )),
      (this.line = null),
      (this.gap = 0),
      (this.perDive = 0),
      (this.ascT = 0),
      (this.diveT = 0),
      (this.opened.length = 0));
  }
  update(t, n, o, s, i) {
    if (t.phase !== "dive" || t.dying) return [];
    this.ascT = t.started && t.ascRate >= tn.SHOW_MIN_MPS ? this.ascT + i : 0;
    const a = [];
    for (const r of Ks)
      this.mem.ui.has(r.id) ||
        (r.needs && !this.mem.ui.has(r.needs)) ||
        (r.after && !this.known.has(r.after)) ||
        (r.when.some((l) => Hu(l, r.id, t, n, o, s, this.ascT)) &&
          (this.mem.ui.add(r.id),
          a.push(r.id),
          this.opened.push(r.id),
          r.line && !this.mem.said.has(r.id) && this.pending.push(r.id)));
    return (a.length && this.persist?.(this.mem), a);
  }
  frame(t, n, o) {
    if(this.presenter){this.presenter(t,n,o);return;}
    if (!this.mem.lines || this.mem.diver || n || this.suppressText?.()) return;
    if (((this.diveT += t), this.line)) {
      const i = As(this.line.id);
      if (!o(i)) {
        this.finishLine(this.line.t >= Pe.LINE_MIN_S);
        return;
      }
      ((this.line.t += t), this.line.t >= Pe.LINE_S && this.finishLine(!0));
      return;
    }
    if (this.gap > 0) {
      this.gap -= t;
      return;
    }
    if (this.diveT < Pe.FIRST_S || this.perDive >= Pe.PER_DIVE) return;
    const s = this.pending.find((i) => !this.mem.said.has(i) && o(As(i)));
    s && ((this.line = { id: s, t: 0 }), this.perDive++);
  }
  finishLine(t) {
    const n = this.line.id;
    if (t && As(n)?.lesson) this.onLessonRead?.(As(n).lesson);
    ((this.line = null),
      (this.gap = Pe.LINE_GAP_S),
      t &&
        (this.mem.said.add(n),
        (this.pending = this.pending.filter((o) => o !== n)),
        this.persist?.(this.mem)));
  }
  current(state) {
    if (this.presenter || !this.line || !this.mem.lines || this.mem.diver || this.suppressText?.()) return null;
    const t = As(this.line.id);
    const text = typeof t.line === "function" ? t.line(state) : t.line;
    return text && t.at ? { id: t.id, text, at: t.at, t: this.line.t, dur: Pe.LINE_S } : null;
  }
  queue() {
    return [...this.pending];
  }
  reset() {
    (this.mem.ui.clear(),
      this.mem.said.clear(),
      this.known.clear(),
      (this.pending = []),
      (this.line = null),
      this.persist?.(this.mem));
  }
  setDiver(t) {
    ((this.mem.diver = t), this.persist?.(this.mem));
  }
  setLines(t) {
    ((this.mem.lines = t), t || (this.line = null));
  }
}
