function Ls(e, t, n, o = Rc, s = null) {
  const i = (h, c, d = h) => {
      const u = Yt[d];
      return {
        id: h,
        mix: c,
        volumeL: u.volumeL,
        startBar: u.startBar,
        bar: u.startBar,
        carried: !0,
        x: 0,
        y: 0,
        onLine: !1,
        falling: !1,
        vx: 0,
        vy: 0,
        fallT: 0,
        marks: [],
        ruleBar: null,
      };
    },
    a = [i("back", t.bottom, t.back === "single" ? "single" : "back")];
  (t.slots.includes("stage") && a.push(i("stage", t.bottom)),
    t.slots.includes("deco50") && a.push(i("deco", "ean50")));
  const r = a.findIndex((h) => h.id === "stage"),
    l = e.start;
  return {
    seed: n,
    rng: Qi(n),
    frame: 0,
    t: 0,
    tWall: 0,
    phase: "dive",
    started: !1,
    deep: !1,
    plan: { rule: t.rule, bottom: t.bottom, slots: [...t.slots], ...(t.back ? { back: t.back } : {}) },
    diver: {
      x: l.x,
      y: l.y,
      vx: 0,
      vy: 0,
      face: 1,
      heading: 0,
      aim: nt.AIM_START_RAD,
      effort: 0,
      fin: 0,
    },
    depth: l.y,
    prevDepth: l.y,
    maxDepth: 0,
    ascRate: 0,
    tanks: a,
    breathing: r >= 0 ? r : 0,
    decoSpot: vr(e.guide, tt.DECO_CLIP_DEPTH_M),
    gateX: e.doors[0]?.x ?? 1 / 0,
    doors: e.doorSet,
    ruleT: null,
    tissues: vh(),
    ceiling: 0,
    stop: 0,
    alarms: { ppo2High: !1, ppo2Low: !1, ceiling: !1, ascent: !1, gasOut: !1 },
    ox: { phase: "none", t: 0, limit: 0, ppo2: 0 },
    hypoT: 0,
    gasT: -1e9,
    oogT: 0,
    cesa: !1,
    cesaStuckT: 0,
    timeScale: 1,
    auto: { on: !1, lock: !1, line: -1, dir: 1 },
    steadyT: 0,
    hold: null,
    holdLock: null,
    stats: {
      decoT: 0,
      waitWall: 0,
      accelWall: 0,
      ascentExcessM: 0,
      autoT: 0,
      autoWall: 0,
      fastT: 0,
      fastWall: 0,
      ceilViolMS: 0,
      maxX: l.x,
      galleryPathM: 0,
      dashT: 0,
      blindT: 0,
      ties: 0,
      failGasBar: 0,
      darkT: 0,
      tangleT: 0,
      readT: 0,
      reads: 0,
      seaT: -1,
      waitBtnT: 0,
      waitBtnWall: 0,
      waits: 0,
      fastRunM: 0,
      fastRunFrom: 0,
      fastRunMaxM: 0,
      fastRunMaxFrom: 0,
      lineMaxM: 0,
    },
    profile: [],
    log: [],
    nextSampleT: 0,
    outcome: null,
    dying: null,
    events: [],
    teleported: !0,
    dash: !1,
    line: Gc(t.slots),
    arrows: [
      ...e.olds
        .filter((h) => h.arrow)
        .map((h) => ({ ...M0(h), ...ol(h), line: "explorer", near: !1, own: !1, prior: !1 })),
      ...(s?.arrows ?? []).map((h) => ({
        x: h.x,
        y: h.y,
        dx: h.dx,
        dy: h.dy,
        line: h.line,
        near: !1,
        own: !0,
        prior: !0,
      })),
    ],
    arrowsLeft: Ae.COUNT,
    lineHold: null,
    lineHoldLock: !1,
    silt: yc(e),
    siltHere: 0,
    blind: !1,
    env: {
      current: _n(o.current, 0, Et.MAX_K),
      deck: [...o.deck],
      ...(o.flows ? { flows: o.flows.map((h) => _n(h, -Et.MAX_K, Et.MAX_K)) } : {}),
      ...(o.failFrom ? { failFrom: o.failFrom } : {}),
    },
    flow: { x: 0, y: 0 },
    fail: Ic(n),
    reading: null,
    camera: l0(),
    laid: (s?.lines ?? []).map((h) => Fi(e, h)),
    wait: { on: !1, held: !1, band: !1 },
  };
}
const _n = (e, t, n) => (e < t ? t : e > n ? n : e);
function ol(e) {
  return S0(e.pts);
}
function M0(e) {
  const t = e.pts[e.pts.length - 1];
  return { x: t.x, y: t.y };
}
function S0(e) {
  const t = e[e.length - 1],
    n = e[e.length - 2];
  if (!n || !t) return { dx: -1, dy: 0 };
  const o = Math.hypot(n.x - t.x, n.y - t.y);
  return o > 1e-9 ? { dx: (n.x - t.x) / o, dy: (n.y - t.y) / o } : { dx: -1, dy: 0 };
}
const yi = (e) => (Number.isFinite(e) ? e : 0);
function kt(e, t) {
  e.events.push(t);
}
function Zt(e, t, n) {
  e.log.push(n === void 0 ? { t: e.t, d: e.depth, type: t } : { t: e.t, d: e.depth, type: t, info: n });
}
function Cn(e, t, n) {
  e.alarms[t] !== n &&
    ((e.alarms[t] = n), kt(e, { type: "alarm", kind: t, on: n }), n && Zt(e, "alarm", t));
}
function Co(e) {
  const t = e.alarms;
  return t.ppo2High || t.ppo2Low || t.ceiling || t.ascent || t.gasOut;
}
function On(e) {
  return ln(e.tanks[e.breathing].mix);
}
function T0(e, t, n) {
  if (((e.events.length = 0), e.phase !== "dive")) return;
  const o = e.dying !== null;
  (o && (t = xi),
    (!Number.isFinite(t.x) || !Number.isFinite(t.y)) && (t = { ...t, x: yi(t.x), y: yi(t.y) }),
    (!Number.isFinite(t.lx ?? 0) || !Number.isFinite(t.ly ?? 0)) &&
      (t = { ...t, lx: yi(t.lx ?? 0), ly: yi(t.ly ?? 0) }));
  const s = bt.DT,
    i = s / e.timeScale;
  e.frame++;
  recordRopeVisit(e,n);
  const a = e.diver;
  let r = _n(t.x, -1, 1),
    l = _n(t.y, -1, 1);
  const h = Math.hypot(r, l);
  h > 1 && ((r /= h), (l /= h));
  const c = Math.min(1, h);
  N0(e, t, c, n);
  let d = c,
    u = null;
  const f = Wt(e),
    p = zc(e, t, n),
    m = vc(e, t),
    y = !o && y0(e, t, n, s),
    _ = c0(e, t, s, !o && !p && !m && !y && !t.menu && t.pick === null),
    g = dc(e, n);
  if (((e.flow = g), e.auto.on)) {
    const N = r0(e, n, f ? $e.SPEED_K : 1, g);
    ((r = N.x), (l = N.y), (d = f ? Math.min(1, Math.hypot(N.x, N.y)) : St.EFFORT));
  }
  if (
    (p || m || y || _
      ? ((r = 0), (l = 0), (d = m ? Nc(t) : y ? ke.EFFORT : _ ? Q.EFFORT : 0))
      : Xs(e) && c > Nt.THRASH_STICK && (d = 1),
    e.cesa && ((r = 0), (l = 0), (u = -tt.CESA_MPS), (d = 1)),
    o)
  ) {
    const N = e.dying.stage;
    ((r = 0),
      (l = 0),
      (d = N === "struggle" || N === "convulse" ? 1 : 0),
      (u = N === "sink" || N === "faint" ? (e.dying.dcs ? 0 : Xt.SINK_MPS) : null));
  }
  e.dash =
    f &&
    t.dash &&
    !e.auto.on &&
    !p &&
    !m &&
    !y &&
    !_ &&
    !o &&
    !e.cesa &&
    Math.hypot(r, l) > De.MIN_STICK;
  let S = null;
  if (!p && !m && !y && !e.cesa && !o) {
    const N = _n(t.lx ?? 0, -1, 1),
      O = _n(t.ly ?? 0, -1, 1),
      C = Math.hypot(N, O);
    C > 1e-6 && (S = C > 1 ? { x: N / C, y: O / C } : { x: N, y: O });
  }
  a.effort = d;
  const A = a.x,
    E = a.y,
    b = oc(a, r, l, n, s, u, f ? (e.dash ? De.SPEED_K : $e.SPEED_K) : 1, g, !o, S);
  if (
    (b > nt.BUMP_MPS && kt(e, { type: "bump", speed: b }),
    Yc(e, n, A, E, s),
    Wc(e, n, A, E, s),
    $i(e, n),
    (a.fin = Math.min(Math.hypot(a.vx - g.x, a.vy - g.y), d * nt.FIN_MPS)),
    f && !Xs(e))
  ) {
    const N = Math.hypot(a.x - A, a.y - E);
    e.stats.galleryPathM += N;
    const O = e.env.failFrom ?? 0;
    O > 0 && (e.doors.legacy ? 0 : He(e.doors, a.x, a.y)) < O && (e.fail.nextM += N);
  }
  e.dash && (e.stats.dashT += s);
  const T = Math.max(0, a.y);
  ((e.depth = T),
    (e.maxDepth = Math.max(e.maxDepth, T)),
    a.x > e.stats.maxX && (e.stats.maxX = a.x),
    e.teleported && ((e.prevDepth = T), (e.ascRate = 0), (e.teleported = !1)));
  const k = (e.prevDepth - T) / s;
  ((e.ascRate += (k - e.ascRate) * Math.min(1, s / tn.RATE_TAU_S)),
    (e.prevDepth = T),
    !e.started && T > Yn.START_DEPTH_M && ((e.started = !0), kt(e, { type: "start" })),
    T > nt.DIVE_STARTED_M && (e.deep = !0),
    e.started && (e.t += s),
    (e.tWall += i),
    A0(e, t, n, s),
    I0(e, n, s),
    Qc(e, t, n, s),
    o || Dc(e, t, n, s, p || m ? 0 : c));
  const w = z(n, A, E) <= nt.RADIUS_M + U.REST_EPS_M;
  if ((Ac(e, n, w ? 0 : b, s), e.frame % U.UPDATE_EVERY === 0)) {
    const N = Wi(e.env),
      O = rs(N);
    Mc(e.silt, n, s * U.UPDATE_EVERY, O > 0 ? lc(n, N) : null, O * Re * Et.SILT_K);
  }
  (wc(e) && (kt(e, { type: "blind", on: e.blind }), e.blind && Zt(e, "blind")),
    e.blind && (e.stats.blindT += s));
  const L = e.tanks[e.breathing],
    R = ln(L.mix);
  if (e.started && !e.cesa && !o && L.bar > 0) {
    const N = Gr(e),
      O = Math.min(L.bar, fr(T, d, L.volumeL, (e.dash ? De.GAS_MULT : 1) * N) * s);
    ((L.bar = Math.max(0, L.bar - O)), Fc(e, O, N));
  }
  if ((Di(e.tissues, R, T, s), e.started && e.ascRate > tn.LIMIT_MPS)) {
    const N = (e.ascRate - tn.LIMIT_MPS) * s;
    e.stats.ascentExcessM += N;
    for (let O = 0; O < e.tissues.length; O++) e.tissues[O] += xe.ASCENT_LOAD_PER_M * N;
    (e.stats.fastRunM === 0 && (e.stats.fastRunFrom = T),
      (e.stats.fastRunM += N),
      e.stats.fastRunM > e.stats.fastRunMaxM &&
        ((e.stats.fastRunMaxM = e.stats.fastRunM), (e.stats.fastRunMaxFrom = e.stats.fastRunFrom)));
  } else e.stats.fastRunM = 0;
  (e.line.parent && (e.stats.lineMaxM = Math.max(e.stats.lineMaxM, Ie(e))),
    e.ruleT === null && Wt(e) && b0(e),
    e.stats.seaT < 0 && Jh(n, a.x, a.y) && ((e.stats.seaT = e.t), kt(e, { type: "sea" })));
  const P = e.stop;
  ((e.ceiling = ns(e.tissues)),
    (e.stop = e.ceiling > 0 ? po(e.tissues, T, R, fs(e)) : 0),
    e.started &&
      !o &&
      (P === 0 && e.stop > 0
        ? (kt(e, { type: "decoStart" }), Zt(e, "decoStart"))
        : P > 0 &&
          e.stop < P &&
          (kt(e, { type: "stopClear", from: P, to: e.stop }), Zt(e, "stopClear", `${P}→${e.stop}`))));
  const v = es(R, T);
  if (
    (o ||
      (Cn(e, "ppo2High", v > Kt.PPO2_MAX),
      Cn(e, "ppo2Low", v < Kt.PPO2_MIN),
      Cn(e, "ceiling", e.started && T < e.ceiling - ut.CEIL_TOL_M),
      Cn(e, "ascent", e.started && e.ascRate > tn.LIMIT_MPS),
      Cn(e, "gasOut", e.started && L.bar <= 0),
      e.alarms.ceiling && (e.stats.ceilViolMS += (e.ceiling - T) * s),
      e.stop > 0 && (e.stats.decoT += s)),
    o)
  ) {
    if (u0(e, s)) {
      const N = e.dying;
      return B0(e, N.cause, N.ppo2);
    }
  } else
    (O0(e, v, s),
      e.dying || P0(e, v, s),
      e.dying || v0(e, n, s),
      !e.dying &&
        e.cesa &&
        ((e.cesaStuckT = k < tt.CESA_STUCK_MPS ? e.cesaStuckT + s : 0),
        e.cesaStuckT > tt.CESA_STUCK_S && hi(e, "cesa-stuck")));
  (x0(e),
    D0(e, t, c),
    F0(e, t, c, s, i, n),
    e.started &&
      e.t >= e.nextSampleT &&
      (e.profile.push({ t: e.t, d: T, g: L.id, c: e.ceiling }), (e.nextSampleT += Zl.SAMPLE_S)),
    // Any return to the surface finishes a started dive, including shallow ones.
    // At entry, an explicit upward stroke also lets the player climb back out.
    // Idle at the initial 0.5 m must not immediately finish a fresh dive.
    (e.started || l < -0.15) && T <= nt.SURFACED_M && !e.dying && W0(e));
}
function b0(e) {
  e.ruleT = e.t;
  for (const n of e.tanks) n.id !== "deco" && ((n.ruleBar = n.bar), (n.marks = Rh(n.bar, e.plan.rule)));
  const t = e.tanks.find((n) => n.id === "back");
  (kt(e, { type: "rule", bar: t.bar }), Zt(e, "rule", String(Math.round(t.bar))));
}
function ei(e, t) {
  const n = e.diver,
    o = [],
    s = rl(e, t) !== null;
  return (
    e.tanks.forEach((i, a) => {
      const r = a === e.breathing,
        l = ln(i.mix),
        h = {
          tank: a,
          id: i.id,
          mix: i.mix,
          bar: i.bar,
          mod: ye(l),
          minDepth: dr(l),
          carried: i.carried,
        };
      let c = "switch",
        d = !0;
      (i.carried
        ? !r && i.bar <= 0 && (d = !1)
        : ((d = i.bar > 0 && Math.hypot(i.x - n.x, i.y - n.y) <= tt.REACH_M), (c = "pickup")),
        d && o.push({ ...h, row: i.id, kind: c, current: r, enabled: !0, onLine: !1 }),
        i.carried && o.push({ ...h, row: fo(i.id), kind: "drop", current: !1, enabled: !r, onLine: s }));
    }),
    o
  );
}
function _a(e, t) {
  if (e.phase !== "dive" || e.cesa || e.dying) return null;
  const n = e.tanks.findIndex((i) => i.id === "deco"),
    o = e.tanks[n];
  if (
    !o ||
    !o.carried ||
    n === e.breathing ||
    Math.abs(e.depth - tt.DECO_CLIP_DEPTH_M) > tt.LEAVE_BTN_DY_M
  )
    return null;
  const s = Nr(t.guide, e.diver);
  return s && s.dist <= tt.LEAVE_BTN_LINE_M ? fo("deco") : null;
}
function zs(e, t) {
  if (e.phase !== "dive" || e.cesa || e.dying) return null;
  const n = e.diver;
  let o = null,
    s = 1 / 0;
  for (const i of ei(e, t)) {
    if (i.kind !== "pickup" || !i.enabled) continue;
    const a = e.tanks[i.tank],
      r = Math.hypot(a.x - n.x, a.y - n.y);
    r < s && ((o = i.id), (s = r));
  }
  return o;
}
function Ii(e) {
  return e === "drop" ? tt.DROP_HOLD_S : tt.SWITCH_HOLD_S;
}
function A0(e, t, n, o) {
  if (t.pick === null) {
    ((e.hold = null), (e.holdLock = null));
    return;
  }
  if (
    (e.holdLock !== null && e.holdLock !== t.pick && (e.holdLock = null),
    e.holdLock !== null || e.cesa || e.dying)
  ) {
    e.hold = null;
    return;
  }
  const s = ei(e, n).find((i) => i.row === t.pick && !i.current && i.enabled);
  if (!s) {
    e.hold = null;
    return;
  }
  ((!e.hold || e.hold.row !== s.row || e.hold.kind !== s.kind || e.hold.tank !== s.tank) &&
    (e.hold = { row: s.row, kind: s.kind, tank: s.tank, t: 0 }),
    (e.hold.t += o),
    e.hold.t >= Ii(s.kind) - 1e-9 && (al(e, s, n), (e.hold = null), (e.holdLock = s.row)));
}
function al(e, t, n) {
  const o = e.tanks[t.tank];
  if (t.kind === "drop") {
    w0(e, t.tank, n);
    return;
  }
  if (t.kind === "pickup") {
    E0(e, t.tank);
    return;
  }
  if (!o.carried || t.tank === e.breathing) return;
  const s = e.tanks[e.breathing];
  ((e.breathing = t.tank),
    (e.oogT = 0),
    (e.gasT = e.t),
    kt(e, { type: "gas", kind: "switch", from: s.id, to: o.id, mix: o.mix }),
    Zt(e, "gas", o.id));
}
function E0(e, t) {
  const n = e.tanks[t];
  if (n.carried) return;
  const o = { x: n.x, y: n.y, onLine: n.onLine };
  ((n.carried = !0),
    (n.onLine = !1),
    (n.falling = !1),
    (n.vx = 0),
    (n.vy = 0),
    kt(e, { type: "pickup", tank: n.id, ...o }),
    Zt(e, "pickup", n.id));
}
function rl(e, t) {
  let n = null;
  for (const o of [t.guide, ...t.olds.map((s) => s.pts), e.line.pts, ...e.laid.map((s) => s.pts)]) {
    let s = Nr(o, e.diver);
    (s &&
      s.dist <= tt.DROP_SNAP_M &&
      z(t, s.x, s.y) < tt.CLIP_WATER_M &&
      (s = k0(t, o, e.diver, tt.DROP_SNAP_M)),
      s && s.dist <= tt.DROP_SNAP_M && (!n || s.dist < n.dist) && (n = s));
  }
  return n;
}
function k0(e, t, n, o) {
  let s = null;
  for (let i = 1; i < t.length; i++) {
    const a = t[i - 1],
      r = t[i],
      l = Math.hypot(r.x - a.x, r.y - a.y),
      h = Math.max(1, Math.ceil(l / tt.CLIP_SAMPLE_M));
    for (let c = 0; c <= h; c++) {
      const d = a.x + ((r.x - a.x) * c) / h,
        u = a.y + ((r.y - a.y) * c) / h,
        f = Math.hypot(n.x - d, n.y - u);
      f > o || (s && f >= s.dist) || z(e, d, u) < tt.CLIP_WATER_M || (s = { x: d, y: u, dist: f });
    }
  }
  return s;
}
function w0(e, t, n) {
  const o = e.tanks[t];
  if (t === e.breathing || !o.carried) return;
  const s = e.diver,
    i = rl(e, n);
  if (((o.carried = !1), (o.onLine = !!i), (o.fallT = 0), (o.vx = 0), i))
    ((o.x = i.x), (o.y = i.y), (o.falling = !1), (o.vy = 0));
  else {
    const a = Pr(n, s.x, s.y + tt.DROP_HAND_DY_M, tt.TANK_R_M[o.id] + 0.02);
    ((o.x = a.x), (o.y = a.y), (o.falling = !0), (o.vy = Math.max(0, s.vy)));
  }
  (kt(e, { type: "drop", tank: o.id, x: o.x, y: o.y, onLine: o.onLine }), Zt(e, "drop", o.id));
}
const L0 = Math.cos((tt.SINK_REST_SLOPE_DEG * Math.PI) / 180);
const R0 = Array.from({ length: 9 }, (e, t) => {
  const n = ((t + 1) * 10 * Math.PI) / 180;
  return [Math.sin(n), Math.cos(n)];
});
function ga(e, t, n, o) {
  if (-$t(e, t, n).y >= L0 && Ge(e, t, n, 0, 1, o + 1) - o <= tt.SINK_REST_GAP_M) return !0;
  const i = o + tt.SINK_LAND_M + tt.SINK_PROBE_M;
  let a = !1,
    r = !1;
  for (const [l, h] of R0)
    if (
      (!a && z(e, t - l * i, n + h * i) < tt.SINK_PROBE_M && (a = !0),
      !r && z(e, t + l * i, n + h * i) < tt.SINK_PROBE_M && (r = !0),
      a && r)
    )
      return !0;
  return !1;
}
function I0(e, t, n) {
  for (const o of e.tanks) {
    if (o.carried || !o.falling) continue;
    o.fallT += n;
    const s = tt.TANK_R_M[o.id],
      i = s + tt.SINK_LAND_M,
      a = 1 - Math.exp(-n / tt.SINK_TAU_S);
    ((o.vx -= o.vx * a), (o.vy += (tt.SINK_MPS[o.id] - o.vy) * a));
    const r = Ge(t, o.x, o.y, 0, 1, s + 3) - s,
      l = Math.max(
        tt.SINK_LAND_MPS,
        Math.sqrt(2 * tt.SINK_DECEL_MPS2 * Math.max(0, r - tt.SINK_LAND_M)),
      );
    o.vy > l && (o.vy = l);
    const h = Math.hypot(o.vx, o.vy),
      c = o.vy * n;
    if (r - c <= tt.SINK_LAND_M && Math.abs(o.vx) < 0.001) {
      const u = o.y;
      if (
        ((o.y += Math.max(0, r - tt.SINK_LAND_M)),
        z(t, o.x, o.y) >= i - tt.SINK_LAND_M && ga(t, o.x, o.y, s))
      ) {
        Ma(e, t, o, h);
        continue;
      }
      o.y = u;
    }
    ((o.x += o.vx * n), (o.y += c));
    let d = !1;
    for (let u = 0; u < 4; u++) {
      const f = z(t, o.x, o.y);
      if (f >= i) break;
      d = !0;
      const p = $t(t, o.x, o.y);
      ((o.x += p.x * (i - f)), (o.y += p.y * (i - f)));
      const m = o.vx * p.x + o.vy * p.y;
      m < 0 && ((o.vx -= m * p.x), (o.vy -= m * p.y));
    }
    d && ga(t, o.x, o.y, s) && Ma(e, t, o, h);
  }
}
function Ma(e, t, n, o) {
  const s = tt.TANK_R_M[n.id];
  ((n.falling = !1),
    (n.vx = 0),
    (n.vy = 0),
    kt(e, { type: "land", tank: n.id, x: n.x, y: n.y, speed: o }),
    Sc(t, n.x, n.y) && Bi(e.silt, t, n.x, n.y + s, tt.SINK_SILT * Math.max(0.3, o), U.WASH_R_M));
}
function O0(e, t, n) {
  const o = e.ox;
  o.phase !== "convulse" &&
    (t > Kt.PPO2_MAX
      ? (o.phase === "none" &&
          ((o.phase = "symptoms"),
          (o.t = 0),
          (o.limit = ve.SYMPTOMS_MIN_S + ii(e.rng) * (ve.SYMPTOMS_MAX_S - ve.SYMPTOMS_MIN_S)),
          kt(e, { type: "ox", phase: "symptoms" }),
          Zt(e, "ox", "symptoms")),
        (o.t += n),
        o.t >= o.limit &&
          ((o.phase = "convulse"),
          (o.ppo2 = t),
          kt(e, { type: "ox", phase: "convulse" }),
          Zt(e, "ox", "convulse"),
          hi(e, "ox-tox", t)))
      : o.phase === "symptoms" &&
        ((o.t -= n * ve.RECOVER_RATE),
        o.t <= 0 &&
          ((o.t = 0), (o.phase = "none"), kt(e, { type: "ox", phase: "none" }), Zt(e, "ox", "clear"))));
}
function P0(e, t, n) {
  if (t >= Kt.PPO2_MIN) {
    e.hypoT = 0;
    return;
  }
  ((e.hypoT += n), e.hypoT >= Yl.LOC_S && hi(e, "hypoxia", t));
}
function v0(e, t, n) {
  const o = e.tanks[e.breathing];
  if (!e.started || e.cesa || o.bar > 0) {
    e.oogT = 0;
    return;
  }
  (e.oogT === 0 && (kt(e, { type: "oog" }), Zt(e, "oog")), (e.oogT += n));
  const s = e.diver,
    i = e.tanks.some(
      (l, h) =>
        h !== e.breathing && l.bar > 0 && (l.carried || Math.hypot(l.x - s.x, l.y - s.y) <= tt.REACH_M),
    ),
    a = !mo(t, s.x, s.y),
    r = e.ceiling > ut.CEIL_TOL_M;
  if (!a && !r && !i) {
    Sa(e);
    return;
  }
  e.oogT >= tt.OOG_GRACE_S && (a || r ? hi(e, a ? "oog-overhead" : "oog-deco") : Sa(e));
}
function Sa(e) {
  ((e.cesa = !0), (e.hold = null), kt(e, { type: "cesa" }), Zt(e, "cesa"));
}
function N0(e, t, n, o) {
  const s = e.auto.on;
  if (!t.auto) ((e.auto.lock = !1), (e.auto.on = !1));
  else if (e.auto.lock) e.auto.on = !1;
  else {
    const i =
      vo(e, o, !s) &&
      !t.menu &&
      !t.dash &&
      !t.tie &&
      !t.arrow &&
      !t.valve &&
      !t.torch &&
      !t.untangle &&
      !t.read &&
      !t.camera &&
      n <= St.STICK_OFF;
    if ((!i && s && (e.auto.lock = !0), i && !s)) {
      const a = li(e, o, !1);
      ((e.auto.line = a ? a.line : -1), (e.auto.dir = a ? a.dir : 1));
    }
    e.auto.on = i;
  }
  e.auto.on !== s && kt(e, { type: "auto", on: e.auto.on });
}
function C0(e) {
  switch (e.type) {
    case "alarm":
    case "blind":
      return e.on;
    case "fail":
      return e.phase !== "fixed";
    case "failTug":
      return !0;
    case "bump":
    case "gas":
    case "drop":
    case "reelTug":
    case "oog":
    case "decoStart":
    case "ox":
    case "cesa":
    case "rule":
    case "reelOut":
      return !0;
    default:
      return !1;
  }
}
function x0(e) {
  !e.auto.on ||
    !e.events.some(C0) ||
    ((e.auto.on = !1), (e.auto.lock = !0), kt(e, { type: "auto", on: !1 }));
}
function wn(e) {
  return (
    e.stop > 0 &&
    e.depth >= Math.max(e.ceiling, e.stop - ut.BAND_ABOVE_M) &&
    e.depth <= e.stop + ut.BAND_BELOW_M
  );
}
function ll(e, t) {
  const n = Math.hypot(e.lx ?? 0, e.ly ?? 0) >= 0.001;
  return (
    t >= 0.001 ||
    n ||
    e.pick !== null ||
    e.menu ||
    e.auto ||
    e.dash ||
    e.tie ||
    e.arrow ||
    e.valve ||
    e.torch ||
    e.untangle ||
    e.read ||
    !!e.camera
  );
}
function Ys(e) {
  return (
    e.phase === "dive" &&
    e.started &&
    e.stop > 0 && wn(e) &&
    !e.dying &&
    !e.cesa &&
    !Co(e) &&
    e.oogT === 0 &&
    e.ox.phase === "none" &&
    !Xr(e)
  );
}
function D0(e, t, n) {
  const o = e.wait,
    s = !!t.wait && !o.held;
  o.held = !!t.wait;
  const i = o.on;
  (s
    ? o.on
      ? (o.on = !1)
      : Ys(e) && ((o.on = !0), (o.band = wn(e)), e.stats.waits++)
    : o.on &&
      (ll(t, n) ||
        !Ys(e) ||
        (o.band && !wn(e)) ||
        e.events.some(
          (r) =>
            r.type === "bump" ||
            r.type === "fail" ||
            r.type === "gas" ||
            r.type === "drop" ||
            r.type === "pickup",
        )) &&
      (o.on = !1),
    o.on !== i && kt(e, { type: "wait", on: o.on }));
}
function F0(e, t, n, o, s, i) {
  let a = 1;
  if (e.wait.on)
    ((a = ro.SCALE),
      (e.steadyT = 0),
      (e.stats.waitBtnT += o),
      (e.stats.waitBtnWall += s),
      wn(e) && (e.stats.waitWall += s));
  else if (e.auto.on) {
    const r = a0(e, i);
    ((a = r ? St.KNOWN_SCALE : St.TIME_SCALE),
      (e.steadyT = 0),
      (e.stats.autoT += o),
      (e.stats.autoWall += s),
      r && ((e.stats.fastT += o), (e.stats.fastWall += s)));
  } else {
    const l =
        !ll(t, n) &&
        Math.abs(e.diver.vy) < ut.ACCEL_MAX_VY &&
        !Co(e) &&
        !e.cesa &&
        e.oogT === 0 &&
        e.ox.phase === "none" &&
        !Xr(e) &&
        !e.dying,
      h = wn(e),
      c = e.events.some((d) => d.type !== "accel");
    (h && l && (e.stats.waitWall += s),
      (e.steadyT = h && l && !c ? e.steadyT + s : 0),
      (a = e.steadyT >= ut.ACCEL_DELAY_S ? ut.ACCEL : 1));
  }
  (e.timeScale === ut.ACCEL && (e.stats.accelWall += s),
    a !== e.timeScale && ((e.timeScale = a), kt(e, { type: "accel", on: a > 1 })));
}
function hl(e) {
  e.profile.push({ t: e.t, d: e.depth, g: e.tanks[e.breathing].id, c: e.ceiling });
}
function H0(e, t, n) {
  const o = ns(e.tissues),
    s = ur(o),
    i = s > 0 ? uo(e.tissues, s, On(e), fs(e)).stops.reduce((l, h) => l + h.time, 0) : 0,
    a = e.stats.fastRunMaxM,
    r = [];
  return (
    a >= xe.SEVERE_ASCENT_M && r.push("ascent"),
    i >= xe.SEVERE_SKIP_S && r.push("skip"),
    t >= xe.SEVERE_GF && r.push("gf"),
    r.length ? { why: r, gf: t, p: n, skipS: i, runM: a, fromM: e.stats.fastRunMaxFrom } : null
  );
}
function W0(e) {
  const t =
      pr(e.tissues) +
      xe.ASCENT_GF_PER_M * e.stats.ascentExcessM +
      xe.CEIL_GF_PER_MS * e.stats.ceilViolMS,
    n = xh(t),
    o = H0(e, t, n);
  if (o) {
    (hi(e, o.why[0] === "ascent" ? "embolism" : "dcs"),
      (e.dying.dcs = o),
      (e.timeScale = 1),
      (e.auto.on = !1),
      (e.wait.on = !1));
    return;
  }
  const s = ii(e.rng);
  ((e.outcome = {
    kind: s < n ? "dcs" : "clean",
    depth: e.depth,
    t: e.t,
    p: n,
    gf: t,
    roll: s,
    cesa: e.cesa,
  }),
    (e.phase = "end"),
    (e.timeScale = 1),
    (e.auto.on = !1),
    hl(e),
    kt(e, { type: "surfaced" }),
    Zt(e, "surfaced"));
}
function B0(e, t, n) {
  ((e.outcome = {
    kind: "dead",
    cause: t,
    depth: e.dying?.d0 ?? e.depth,
    t: e.t,
    mix: e.tanks[e.breathing].mix,
  }),
    n !== void 0 && (e.outcome.ppo2 = n));
  const o = e.dying?.dcs;
  o &&
    ((e.outcome.severe = o),
    (e.outcome.gf = o.gf),
    (e.outcome.p = o.p),
    (e.outcome.depth = o.why[0] === "ascent" ? o.fromM : e.maxDepth));
  const s = ["freeflow", "entangle", "light"].filter((i) => rn(e, i)?.phase === "active");
  (s.length && (e.outcome.fails = s),
    (e.phase = "end"),
    (e.timeScale = 1),
    (e.auto.on = !1),
    hl(e),
    kt(e, { type: "dead", cause: t }),
    Zt(e, "dead", t));
}
function fs(e) {
  const t = e.tanks[e.breathing],
    n = e.tanks.find((o) => o.id === "deco");
  return n && n.carried && n.bar > tt.TTS_GAS_MIN_BAR && t.id !== "deco"
    ? [{ mix: ln(n.mix), fromDepth: ut.SWITCH_DEPTH_M }]
    : [];
}
function cl(e) {
  const t = On(e),
    available = e.tanks[e.breathing].carried && e.tanks[e.breathing].bar > 0,
    n = fs(e),
    o = available ? uo(e.tissues, e.depth, t, n) : null,
    s = o?.stops[0];
  return {
    ceiling: e.ceiling,
    stop: available ? (s ? s.depth : 0) : e.stop,
    ndl: available ? (s ? 0 : Dh(e.tissues, e.depth, t, n)) : null,
    // This is a conditional decompression estimate, not a gas-endurance or
    // cave-egress forecast. Never invent an emergency switch from an empty gas.
    forecastStatus: available ? "conditional" : "no-current-gas",
    tts: o?.tts ?? null,
    stopTime: available ? (s ? s.time : 0) : null,
    inBand: wn(e),
    ppo2: es(t, e.depth),
    end: Ln(t, e.depth),
    narc: kh(t, e.depth),
    mix: t,
  };
}
function $0(e, t, n, o) {
  const s = Pr(t, n, o, nt.RADIUS_M + 0.02);
  ((e.diver.x = s.x),
    (e.diver.y = s.y),
    (e.diver.vx = 0),
    (e.diver.vy = 0),
    (e.depth = Math.max(0, s.y)),
    (e.maxDepth = Math.max(e.maxDepth, e.depth)),
    (e.teleported = !0),
    e.depth > Yn.START_DEPTH_M && (e.started = !0),
    e.depth > nt.DIVE_STARTED_M && (e.deep = !0),
    dl(e));
}
function K0(e, t) {
  for (let n = 0; n < e.tissues.length && n < t.length; n++) e.tissues[n] = t[n];
  dl(e);
}
function dl(e) {
  ((e.ceiling = ns(e.tissues)), (e.stop = e.ceiling > 0 ? po(e.tissues, e.depth, On(e), fs(e)) : 0));
}
function G0(e, t, n, o) {
  e.acc += Math.max(0, Math.min(wi.MAX_FRAME_S, t));
  let s = 0;
  for (;;) {
    const i = bt.DT / Math.max(0.001, n());
    if (e.acc < i) return e.acc / i;
    if (s >= wi.MAX_STEPS) return ((e.acc = Math.min(e.acc, i * wi.MAX_DEBT_STEPS)), 1);
    if (((e.acc -= i), s++, !o())) return ((e.acc = 0), 1);
  }
}
const U0 = Object.keys(rr);
function V0(e, t = !1) {
  for (const n of U0) if (rr[n].includes(e)) return t ? fo(n) : n;
  return null;
}
function X0(e, t) {
  return e.length ? e[e.length - 1] : t.length ? t[t.length - 1] : null;
}
