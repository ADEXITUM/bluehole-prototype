function xr(e) {
  return typeof e == "number" ? e > 0 : e.some((t) => t !== 0);
}
function rs(e) {
  return typeof e == "number" ? Math.max(0, e) : e.reduce((t, n) => Math.max(t, Math.abs(n)), 0);
}
const rc = (e, t) => (typeof e == "number" ? e : t >= 0 ? (e[t] ?? 0) : 0);
function lc(e, t = 1) {
  let n = la.get(e);
  n || la.set(e, (n = new Map()));
  const o = typeof t == "number" ? "1" : t.join(","),
    s = n.get(o);
  if (s) return s;
  const i = typeof t == "number" ? 1 : rs(t) || 1,
    a = typeof t == "number" ? 1 : t.map((y) => y / i),
    r = U.CELL_M,
    { gw: l, gh: h } = as(e, r),
    c = yo(e, r),
    d = new Float32Array(l * h),
    u = new Float32Array(l * h),
    f = new Int8Array(l * h).fill(-1),
    p = { x: 0, y: 0 };
  for (let y = 0; y < h; y++)
    for (let _ = 0; _ < l; _++) {
      const g = y * l + _;
      c[g] && (So(e, a, (_ + 0.5) * r, (y + 0.5) * r, p), (d[g] = p.x / Re), (u[g] = p.y / Re));
    }
  const m = { gw: l, gh: h, fx: d, fy: u, door: f };
  return (n.size > 16 && n.clear(), n.set(o, m), m);
}
function hc(e, t) {
  return e.axes.filter((n) => n.door === t);
}
function cc(e) {
  const t = ra.get(e);
  if (t) return t;
  const { gw: n, gh: o } = as(e, yn),
    s = yo(e, yn),
    i = new Float32Array(n * o),
    a = new Float32Array(n * o),
    r = new Int8Array(n * o).fill(-1),
    l = e.doors.map((c, d) => hc(e.site, d));
  for (let c = 0; c < o; c++) {
    const d = (c + 0.5) * yn;
    for (let u = 0; u < n; u++) {
      const f = c * n + u,
        p = (u + 0.5) * yn;
      if (!s[f]) continue;
      const m = He(e.doorSet, p, d);
      if (m < 0) continue;
      r[f] = m;
      let y = null;
      for (const L of l[m] ?? []) {
        const R = En(L.pts, { x: p, y: d });
        R && (!y || R.dist < y.pr.dist) && (y = { pr: R, ax: L });
      }
      if (!y || !(y.ax.flow > 0)) continue;
      const { pr: _, ax: g } = y,
        S = e.doors[m],
        A = aa((Et.ZERO_M - _.dist) / (Et.ZERO_M - Et.FULL_M)),
        E = aa(((p - S.x) * S.side) / Et.GATE_RAMP_M),
        b = A * E * g.flow;
      if (b <= 0) continue;
      const T = an(g.pts, _.s - Et.TANGENT_M),
        k = an(g.pts, _.s + Et.TANGENT_M),
        w = Math.hypot(k.x - T.x, k.y - T.y);
      w < 1e-6 || ((i[f] = ((k.x - T.x) / w) * b), (a[f] = ((k.y - T.y) / w) * b));
    }
  }
  const h = { gw: n, gh: o, fx: i, fy: a, door: r };
  return (ra.set(e, h), h);
}
function So(e, t, n, o, s = { x: 0, y: 0 }) {
  if (((s.x = 0), (s.y = 0), typeof t == "number" ? !(t > 0) : !xr(t))) return s;
  const i = cc(e),
    a = n / yn - 0.5,
    r = o / yn - 0.5,
    l = Math.floor(a),
    h = Math.floor(r);
  if (l < -1 || h < -1 || l >= i.gw || h >= i.gh) return s;
  const c = a - l,
    d = r - h;
  for (let u = 0; u <= 1; u++) {
    const f = h + u;
    if (f < 0 || f >= i.gh) continue;
    const p = u ? d : 1 - d;
    for (let m = 0; m <= 1; m++) {
      const y = l + m;
      if (y < 0 || y >= i.gw) continue;
      const _ = p * (m ? c : 1 - c),
        g = f * i.gw + y,
        S = rc(t, i.door[g]) * Re;
      S !== 0 && ((s.x += i.fx[g] * _ * S), (s.y += i.fy[g] * _ * S));
    }
  }
  return s;
}
function dc(e, t, n = e.diver.x, o = e.diver.y) {
  return So(t, Wi(e.env), n, o);
}
function fc(e, t, n) {
  const o = e.current;
  return o
    ? o.DOORS.map((s, i) => {
        if (n < o.CALM_DIVES) return 0;
        const a = s.levels,
          r = Math.min(
            Et.MAX_K,
            Math.max(
              0,
              a[Math.min(a.length - 1, Math.floor(dt(t | 0, 11 + i, o.SALT) * a.length))] ?? 0,
            ),
          ),
          l = s.tidal && dt(t | 0, 31 + i, o.SALT) < 0.5 ? -1 : 1;
        return r * l;
      })
    : null;
}
function uc(e, t = Et.PROLOGUE_LEVELS, n = Et.PROLOGUE_MAX_K) {
  const o = Math.min(t.length - 1, Math.floor(dt(e | 0, 7, Et.SEED_SALT) * t.length));
  return Math.min(n, Et.MAX_K, Math.max(0, t[o] ?? 0));
}
function Dr(e, t) {
  return t < Et.CALM_DIVES ? 0 : uc(e);
}
const yt = U.CELL_M;
const pc = Math.min(...Object.values(U.BOTTOM).map((e) => e.CRIT_MPS));
const To = (e) => (e < 0 ? 0 : e > 1 ? 1 : e);
function bo(e) {
  return e > U.CLEAR_RHO ? U.BEAM_K * (e - U.CLEAR_RHO) : 0;
}
function Fr(e) {
  const t = bo(e);
  return t > 0 ? Math.min(U.FOG_MAX_A, 1 - Math.exp(-t * U.FOG_DEPTH_M)) : 0;
}
function mc(e) {
  return as(e, yt);
}
function Ao(e) {
  return yo(e, yt);
}
function yc(e) {
  const { gw: t, gh: n } = mc(e);
  return { gw: t, gh: n, d: new Float32Array(t * n), bx0: t, by0: n, bx1: -1, by1: -1 };
}
function Eo(e, t, n) {
  (t < e.bx0 && (e.bx0 = t),
    t > e.bx1 && (e.bx1 = t),
    n < e.by0 && (e.by0 = n),
    n > e.by1 && (e.by1 = n));
}
function Bi(e, t, n, o, s, i) {
  if (!(s > 0)) return;
  const a = Ao(t),
    r = Math.max(i, yt * 0.75),
    l = Math.max(0, Math.floor((n - r) / yt)),
    h = Math.min(e.gw - 1, Math.floor((n + r) / yt)),
    c = Math.max(0, Math.floor((o - r) / yt)),
    d = Math.min(e.gh - 1, Math.floor((o + r) / yt)),
    u = (m, y) => {
      const _ = (Math.hypot((m + 0.5) * yt - n, (y + 0.5) * yt - o) / r) ** 2;
      return _ < 1 ? (1 - _) * (1 - _) : 0;
    };
  let f = 0;
  for (let m = c; m <= d; m++) for (let y = l; y <= h; y++) a[m * e.gw + y] && (f += u(y, m));
  if (f <= 0) return;
  const p = s / (f * yt * yt);
  for (let m = c; m <= d; m++)
    for (let y = l; y <= h; y++) {
      const _ = m * e.gw + y;
      if (!a[_]) continue;
      const g = u(y, m);
      g <= 0 || ((e.d[_] = Math.min(U.MAX, e.d[_] + p * g)), Eo(e, y, m));
    }
}
function _c(e, t, n, o, s, i) {
  const a = Ao(t),
    r = Math.max(0, Math.floor((n - s) / yt)),
    l = Math.min(e.gw - 1, Math.floor((n + s) / yt)),
    h = Math.max(0, Math.floor((o - s) / yt)),
    c = Math.min(e.gh - 1, Math.floor((o + s) / yt));
  for (let d = h; d <= c; d++)
    for (let u = r; u <= l; u++) {
      const f = d * e.gw + u;
      !a[f] ||
        Math.hypot((u + 0.5) * yt - n, (d + 0.5) * yt - o) > s ||
        ((e.d[f] = Math.min(U.MAX, Math.max(e.d[f], i))), Eo(e, u, d));
    }
}
function gc(e) {
  (e.d.fill(0), (e.bx0 = e.gw), (e.by0 = e.gh), (e.bx1 = -1), (e.by1 = -1));
}
function Qn(e, t, n) {
  if (e.bx1 < e.bx0) return 0;
  const o = t / yt - 0.5,
    s = n / yt - 0.5,
    i = Math.floor(o),
    a = Math.floor(s);
  if (i + 1 < e.bx0 || i > e.bx1 || a + 1 < e.by0 || a > e.by1) return 0;
  const r = o - i,
    l = s - a,
    h = (p, m) => (p < 0 || m < 0 || p >= e.gw || m >= e.gh ? 0 : e.d[m * e.gw + p]),
    c = h(i, a),
    d = h(i + 1, a),
    u = h(i, a + 1),
    f = h(i + 1, a + 1);
  return (c + (d - c) * r) * (1 - l) + (u + (f - u) * r) * l;
}
let mi = new Float32Array(0);
function Mc(e, t, n, o = null, s = 0) {
  if (e.bx1 < e.bx0) return;
  const i = Ao(t),
    { gw: a, gh: r } = e;
  mi.length < a * r && (mi = new Float32Array(a * r));
  const l = Math.max(0, e.bx0 - 1),
    h = Math.min(a - 1, e.bx1 + 1),
    c = Math.max(0, e.by0 - 1),
    d = Math.min(r - 1, e.by1 + 1);
  for (let b = c; b <= d; b++) for (let T = l; T <= h; T++) mi[b * a + T] = e.d[b * a + T];
  const u = (b, T) => (b < l || b > h || T < c || T > d ? 0 : mi[T * a + b]),
    f = (b, T) => b >= 0 && T >= 0 && b < a && T < r && i[T * a + b] === 1,
    p = (U.DIFFUSE_M2S * n) / (yt * yt),
    m = (U.SINK_MPS * n) / yt,
    y = o && s > 0 ? (s * n) / yt : 0,
    _ = o?.fx,
    g = o?.fy,
    S = (b, T) => (f(b, T) && f(b + 1, T) ? 0.5 * (_[T * a + b] + _[T * a + b + 1]) * y : 0),
    A = (b, T) => (f(b, T) && f(b, T + 1) ? 0.5 * (g[T * a + b] + g[(T + 1) * a + b]) * y : 0),
    E = Math.exp(-n / U.SETTLE_TAU_S);
  ((e.bx0 = a), (e.by0 = r), (e.bx1 = -1), (e.by1 = -1));
  for (let b = c; b <= d; b++)
    for (let T = l; T <= h; T++) {
      const k = b * a + T;
      if (!i[k]) continue;
      const w = u(T, b);
      let L = 0;
      (f(T - 1, b) && (L += u(T - 1, b) - w),
        f(T + 1, b) && (L += u(T + 1, b) - w),
        f(T, b - 1) && (L += u(T, b - 1) - w),
        f(T, b + 1) && (L += u(T, b + 1) - w));
      const R = f(T, b - 1) ? m * u(T, b - 1) : 0,
        P = f(T, b + 1) ? m * w : 0;
      let v = 0;
      if (y > 0) {
        const O = S(T - 1, b),
          C = S(T, b),
          W = A(T, b - 1),
          V = A(T, b);
        v =
          (O > 0 ? O * u(T - 1, b) : O * w) -
          (C > 0 ? C * w : C * u(T + 1, b)) +
          (W > 0 ? W * u(T, b - 1) : W * w) -
          (V > 0 ? V * w : V * u(T, b + 1));
      }
      let N = (w + p * L + R - P + v) * E;
      (N < U.EPS ? (N = 0) : (N > U.MAX && (N = U.MAX), Eo(e, T, b)), (e.d[k] = N));
    }
}
function Sc(e, t, n) {
  return os(e, t, n) === "silt";
}
function ha(e, t, n, o, s) {
  const i = -s;
  return (
    (i >= 0
      ? U.COVER_WALL + (U.COVER_FLOOR - U.COVER_WALL) * i
      : U.COVER_WALL + (U.COVER_CEIL - U.COVER_WALL) * -i) * U.BOTTOM[Or(e, t, n, o, s)].COVER
  );
}
function Vs(e, t, n, o, s) {
  return U.BOTTOM[Or(e, t, n, o, s)].CRIT_MPS;
}
function Hr(e) {
  return U.WASH_REACH_M * (1 + U.TIGHT_REACH * e);
}
function Tc(e, t, n) {
  return t < n ? e * e * Math.pow(1 - Math.max(0, t) / n, 1.5) : 0;
}
function Wr(e) {
  const t = Math.cos(e.heading),
    n = Math.sin(e.heading);
  return {
    x: e.x - t * U.FIN_BACK_M - e.face * n * U.FIN_DOWN_M,
    y: e.y - n * U.FIN_BACK_M + e.face * t * U.FIN_DOWN_M,
  };
}
function bc(e, t) {
  const n = Wr(t),
    o = z(e, n.x, n.y),
    s = Hr(ko(e, t.x, t.y));
  if (o >= s) return 1 / 0;
  const i = $t(e, n.x, n.y);
  return Vs(e, n.x - i.x * o, n.y - i.y * o, i.x, i.y) / Math.pow(1 - Math.max(0, o) / s, 0.75);
}
function ko(e, t, n) {
  const o = z(e, t, n),
    s = U.TIGHT_OPEN_M;
  if (o * 2 >= s) return 0;
  const i = $t(e, t, n),
    a = Math.max(0, o) + Ge(e, t, n, i.x, i.y, s);
  return To((s - a) / (s - U.TIGHT_SNUG_M));
}
function Ac(e, t, n, o) {
  const s = e.diver,
    i = Math.hypot(s.vx, s.vy),
    a = z(t, s.x, s.y),
    r = nt.RADIUS_M,
    l = a < r + U.TOUCH_M,
    h = s.fin > pc;
  if (!l && n <= U.BUMP_MIN_MPS && !h) return;
  const c = ko(t, s.x, s.y),
    d = 1 + U.TIGHT_GAIN * c;
  if (l || n > U.BUMP_MIN_MPS) {
    const u = $t(t, s.x, s.y),
      [f, p] = U.PUFF_R_M,
      m = (A, E) => {
        const b = f + (p - f) * To(E / U.CONTACT_FULL_MPS);
        Bi(e.silt, t, s.x - u.x * (a - b * 0.5), s.y - u.y * (a - b * 0.5), A, b);
      },
      y = s.x - u.x * a,
      _ = s.y - u.y * a,
      g = ha(t, y, _, u.x, u.y) * d;
    l && i > 0.02 && m(U.SCRAPE_MASS * i * i * g * o, i);
    const S = Vs(t, y, _, u.x, u.y);
    n > S && m(U.BUMP_MASS * (n * n - S * S) * g, n);
  }
  if (h) {
    const u = Wr(s),
      f = z(t, u.x, u.y),
      p = Hr(c);
    if (f < p) {
      const m = $t(t, u.x, u.y),
        y = u.x - m.x * f,
        _ = u.y - m.y * f,
        g = Vs(t, y, _, m.x, m.y),
        S = Tc(s.fin, f, p) - g * g;
      if (S > 0) {
        const A = U.WASH_MASS * S * ha(t, y, _, m.x, m.y) * d * o,
          E = y + m.x * U.WASH_LIFT_M,
          b = _ + m.y * U.WASH_LIFT_M,
          T = U.TIGHT_WRAP * c;
        Bi(e.silt, t, E + (s.x - E) * T, b + (s.y - b) * T, A, U.WASH_R_M);
      }
    }
  }
}
function Ec(e, t, n, o, s, i, a) {
  if (e.bx1 < e.bx0 || i <= 0) return;
  let r = 0,
    l = i;
  const h = (d, u, f, p) => {
    if (Math.abs(u) < 1e-9) return d >= f && d <= p;
    let m = (f - d) / u,
      y = (p - d) / u;
    return (m > y && ([m, y] = [y, m]), (r = Math.max(r, m)), (l = Math.min(l, y)), r <= l);
  };
  if (!h(t, o, (e.bx0 - 1) * yt, (e.bx1 + 2) * yt) || !h(n, s, (e.by0 - 1) * yt, (e.by1 + 2) * yt))
    return;
  const c = U.RAY_STEP_M;
  for (let d = r; d < l; d += c) {
    const u = Math.min(c, l - d),
      f = bo(Qn(e, t + o * (d + u * 0.5), n + s * (d + u * 0.5)));
    if (f > 0 && a(d, u, f)) return;
  }
}
function Br(e, t, n, o, s, i) {
  let a = 0,
    r = i;
  return (
    Ec(e, t, n, o, s, i, (l, h, c) =>
      a + c * h >= U.BEAM_CUT ? ((r = l + (U.BEAM_CUT - a) / c), !0) : ((a += c * h), !1),
    ),
    r
  );
}
function kc(e, t, n, o, s, i, a) {
  return Br(e, n, o, s, i, Ge(t, n, o, s, i, a));
}
function wc(e) {
  e.siltHere = Qn(e.silt, e.diver.x, e.diver.y);
  const t = e.blind;
  return (
    !t && e.siltHere >= U.BLIND ? (e.blind = !0) : t && e.siltHere < U.BLIND_OFF && (e.blind = !1),
    t !== e.blind
  );
}
function wo(e) {
  return To((e.siltHere - U.MURKY) / (U.BLIND - U.MURKY));
}
const $r = (e) => (e < 0 ? 0 : e > 1 ? 1 : e);
function Kr(e, t = !1) {
  const n = [];
  for (const s of t ? Jl : Tn) for (let i = 0; i < s.count; i++) n.push(s.id);
  const o = Qi(((e ^ Ee.SEED_SALT) * 2654435761) >>> 0);
  for (let s = n.length - 1; s > 0; s--) {
    const i = Math.floor(ii(o) * (s + 1));
    [n[s], n[i]] = [n[i], n[s]];
  }
  return n;
}
function ca(e, t = Et.CALM_DIVES) {
  return { current: Dr(e, t), deck: Kr(e) };
}
function Lc(e, t, n, o = !1) {
  const s = fc(e, t, n),
    i = Kr(t, !o),
    a = o || !e.doors ? 0 : Ee.RARE_FROM_DOOR,
    r = s ? { current: rs(s), deck: i, flows: s } : { current: Dr(t, n), deck: i };
  return a ? { ...r, failFrom: a } : r;
}
const Rc = Object.freeze({ current: 0, deck: [] });
function Ic(e) {
  return {
    rng: Qi((e ^ Ee.SEED_SALT) >>> 0),
    drawn: 0,
    nextM: Ee.FIRST_M,
    list: [],
    hold: null,
    holdLock: !1,
    press: null,
    torch: "main",
    queued: [],
  };
}
function si(e, t) {
  e.events.push(t);
}
function Lo(e, t) {
  e.log.push({ t: e.t, d: e.depth, type: "fail", info: t });
}
function In(e) {
  const t = e.fail.torch;
  return t === "spare" ? (e.plan.slots.includes("light") ? "spareHi" : "spare") : t;
}
function oi(e) {
  const t = In(e);
  return t === "dead"
    ? ft.DEAD_RANGE_M
    : t === "spare"
      ? ft.SPARE_RANGE_M
      : t === "spareHi"
        ? ft.SPARE_HI_RANGE_M
        : F.BEAM_RANGE_M;
}
function ai(e) {
  return $r((ft.DARK_FROM_M - oi(e)) / (ft.DARK_FROM_M - ft.DARK_FULL_M));
}
function ls(e) {
  return Math.max(wo(e), ai(e));
}
function Ro(e, t, n = 0) {
  const o = ft.FLICKER_SLOT_S,
    s = Math.floor(e / o),
    i = $r(e / Math.max(0.1, t)),
    a = da(s, n),
    r = ft.FLICKER_CHANCE[0] + (ft.FLICKER_CHANCE[1] - ft.FLICKER_CHANCE[0]) * i;
  if (a >= r) return 1;
  const l = da(s, n + 7) * (o - ft.FLICKER_DIP_S),
    h = e - s * o - l,
    c = ft.FLICKER_DIP_S;
  if (h <= 0 || h >= c) return 1;
  const d = ft.FLICKER_EDGE_S,
    u = Math.min(1, h / d, (c - h) / d);
  return 1 - (ft.FLICKER_DEPTH[0] + (ft.FLICKER_DEPTH[1] - ft.FLICKER_DEPTH[0]) * i) * u;
}
function da(e, t) {
  let n = Math.imul(e | 0, 374761393) ^ Math.imul(t | 0, 668265263);
  return ((n = Math.imul(n ^ (n >>> 13), 1274126177)), (n ^= n >>> 16), (n >>> 0) / 4294967296);
}
function rn(e, t) {
  return e.fail.list.find((n) => n.kind === t && (n.phase === "warn" || n.phase === "active")) ?? null;
}
function Xs(e) {
  return e.fail.list.some((t) => t.kind === "entangle" && t.phase === "active");
}
function Gr(e) {
  let t = 1;
  for (const n of e.fail.list)
    n.kind === "freeflow" &&
      (n.phase === "warn" ? (t *= we.WARN_MULT) : n.phase === "active" && (t *= we.MULT));
  return t;
}
function Ri(e, t) {
  if (e.phase !== "dive") return null;
  const n = rn(e, t);
  return !n || (t === "light" && e.fail.torch === "spare") ? null : n;
}
function Ur(e) {
  return { valve: !!Ri(e, "freeflow"), torch: !!Ri(e, "light"), untangle: !!Ri(e, "entangle") };
}
const Io = (e) => (e.valve ? "freeflow" : e.untangle ? "entangle" : e.torch ? "light" : null);
function Oc(e, t) {
  const n = e.fail.press;
  return n && n.kind === t ? n.frame : e.frame;
}
function Vr(e, t) {
  const n = Ri(e, t);
  return n && Oc(e, t) >= n.warnFrame ? n : null;
}
function Pc(e) {
  return e.kind === "freeflow"
    ? we.HOLD_S
    : e.kind === "light"
      ? ft.SWITCH_HOLD_S
      : e.phase === "warn"
        ? Nt.WARN_HOLD_S
        : Nt.HOLD_S;
}
function vc(e, t) {
  if (e.fail.holdLock) return !1;
  const n = Io(t);
  return !!n && !!Vr(e, n);
}
function Nc(e) {
  const t = Io(e);
  return t === "freeflow" ? we.HOLD_EFFORT : t === "entangle" ? Nt.HOLD_EFFORT : 0;
}
function Xr(e) {
  return e.fail.list.some((t) => t.phase === "warn" || (t.phase === "active" && t.kind !== "light"));
}
function jr(e, t) {
  const n = e.fail.rng,
    o = Ee.WARN_MIN_S + ii(n) * (Ee.WARN_MAX_S - Ee.WARN_MIN_S);
  return {
    kind: t,
    phase: "armed",
    t: 0,
    warnS: o,
    early: !1,
    drawT: e.t,
    warnT: -1,
    warnFrame: -1,
    activeT: -1,
    fixT: -1,
    lostBar: 0,
    x: 0,
    y: 0,
    line: null,
    leash: 0,
    tugT: Nt.TUG_REPEAT_S,
  };
}
function Oo(e, t, n = e.frame) {
  ((t.phase = "warn"),
    (t.t = 0),
    (t.warnT = e.t),
    (t.warnFrame = n),
    t.kind === "entangle" &&
      (t.leash = Math.max(Nt.WARN_LEASH_M, Math.hypot(e.diver.x - t.x, e.diver.y - t.y))),
    si(e, { type: "fail", kind: t.kind, phase: "warn", early: !1 }),
    Lo(e, `${t.kind}:warn`));
}
function qr(e, t) {
  ((t.phase = "active"),
    (t.t = 0),
    (t.activeT = e.t),
    t.kind === "light" && (e.fail.torch = "dead"),
    t.kind === "entangle" &&
      (t.leash = Math.max(Nt.LEASH_M, Math.hypot(e.diver.x - t.x, e.diver.y - t.y))),
    e.fail.hold?.kind === t.kind && (e.fail.hold = null),
    si(e, { type: "fail", kind: t.kind, phase: "active", early: !1 }),
    Lo(e, `${t.kind}:active`));
}
function Cc(e, t) {
  ((t.early = t.phase === "warn"),
    (t.phase = "fixed"),
    (t.fixT = e.t),
    (t.t = 0),
    t.kind === "light" && (e.fail.torch = "spare"),
    si(e, { type: "fail", kind: t.kind, phase: "fixed", early: t.early }),
    Lo(e, `${t.kind}:fixed:${t.early ? "early" : "late"}`));
}
function zr(e, t) {
  const n = [];
  for (const o of Er(e.line)) n.push({ p: o, line: "own" });
  for (const o of t.olds) for (const s of o.pts) _e(e, s.x, s.y) && n.push({ p: s, line: "explorer" });
  return n;
}
function xc(e, t, n) {
  const o = e.diver;
  if (!_e(e, o.x, o.y) || Math.hypot(o.vx, o.vy) < Nt.MIN_SPEED) return;
  let s = null;
  for (const i of zr(e, t)) {
    const a = Math.hypot(i.p.x - o.x, i.p.y - o.y);
    a <= Nt.NEAR_M && (!s || a < s.r) && (s = { ...i, r: a });
  }
  s && ((n.x = s.p.x), (n.y = s.p.y), (n.line = s.line), Oo(e, n));
}
function Dc(e, t, n, o, s) {
  const i = e.fail;
  for (
    i.queued.length && (e.events.push(...i.queued), (i.queued.length = 0));
    e.stats.galleryPathM >= i.nextM && i.drawn < e.env.deck.length;
  ) {
    const r = e.env.deck[i.drawn];
    if (
      (i.drawn++, (i.nextM += Ee.EVERY_M), si(e, { type: "card", card: r, n: i.drawn }), r === "empty")
    )
      continue;
    const l = jr(e, r);
    (i.list.push(l), r !== "entangle" && Oo(e, l));
  }
  for (const r of i.list) r.phase === "armed" && xc(e, n, r);
  const a = Io(t);
  if (((i.press = a ? (i.press?.kind === a ? i.press : { kind: a, frame: e.frame }) : null), !a))
    ((i.hold = null), (i.holdLock = !1));
  else if (i.holdLock || e.cesa || e.ox.phase === "convulse") i.hold = null;
  else {
    const r = Vr(e, a);
    if (!r) i.hold = null;
    else {
      const l = Pc(r);
      ((!i.hold || i.hold.kind !== a) && (i.hold = { kind: a, t: 0, need: l }),
        (i.hold.need = l),
        (i.hold.t += o),
        i.hold.t >= l - 1e-9 && (Cc(e, r), (i.hold = null), (i.holdLock = !0)));
    }
  }
  for (const r of i.list)
    if (r.phase === "warn") (i.hold?.kind !== r.kind && (r.t += o), r.t >= r.warnS && qr(e, r));
    else if (
      r.phase === "active" &&
      ((r.t += o),
      r.kind === "entangle" &&
        ((e.stats.tangleT += o), s > Nt.THRASH_STICK && i.hold?.kind !== "entangle"))
    ) {
      const l = z(n, e.diver.x, e.diver.y) < 1.2 ? 1.6 : 1;
      Bi(e.silt, n, e.diver.x, e.diver.y + 0.25, Nt.THRASH_SILT * s * l * o, U.WASH_R_M);
    }
  ai(e) >= 0.5 && (e.stats.darkT += o);
}
function Fc(e, t, n) {
  if (n <= 1 || t <= 0) return;
  const o = t * (1 - 1 / n);
  e.stats.failGasBar += o;
  const s = e.fail.list.find(
    (i) => i.kind === "freeflow" && (i.phase === "warn" || i.phase === "active"),
  );
  s && (s.lostBar += o);
}
function Hc(e, t, n) {
  const o = e.line,
    s = Rn(o);
  return o.reel !== "live" || !s
    ? !0
    : Math.hypot(t - s.x, n - s.y) <= Math.max(0, o.capacity - o.laid - ss(o)) + 1e-6;
}
function Wc(e, t, n, o, s) {
  for (const i of e.fail.list) {
    if (i.kind !== "entangle" || (i.phase !== "warn" && i.phase !== "active")) continue;
    ((i.tugT += s),
      i.phase === "active" && (i.leash = Math.max(Nt.LEASH_M, i.leash - Nt.TIGHTEN_MPS * s)));
    const a = e.diver,
      r = a.x - i.x,
      l = a.y - i.y,
      h = Math.hypot(r, l);
    if (h <= i.leash || h < 1e-9) continue;
    const c = r / h,
      d = l / h,
      u = Math.hypot(n - i.x, o - i.y),
      f = Math.min(h - i.leash, Math.max(0, h - u) + Nt.TIGHTEN_MPS * s),
      p = a.x - c * f,
      m = a.y - d * f;
    z(t, p, m) >= 0.28 && Hc(e, p, m) ? ((a.x = p), (a.y = m)) : h > u && ((a.x = n), (a.y = o));
    const y = a.vx * c + a.vy * d;
    y > 0 &&
      ((a.vx -= c * y),
      (a.vy -= d * y),
      y > Nt.TUG_MIN_MPS &&
        i.tugT >= Nt.TUG_REPEAT_S &&
        ((i.tugT = 0), si(e, { type: "failTug", dx: -c, dy: -d, speed: y })));
  }
}
function Bc(e, t, n, o = "warn") {
  const s = e.events.length,
    i = jr(e, n);
  if ((e.fail.list.push(i), n === "entangle")) {
    const a = e.diver;
    let r = null;
    for (const l of zr(e, t)) {
      const h = Math.hypot(l.p.x - a.x, l.p.y - a.y);
      h <= 3 && (!r || h < r.r) && (r = { ...l, r: h });
    }
    ((i.x = r ? r.p.x : a.x), (i.y = r ? r.p.y : a.y), (i.line = r ? r.line : null));
  }
  return (
    Oo(e, i, e.frame + 1),
    o === "active" && qr(e, i),
    e.fail.queued.push(...e.events.splice(s)),
    i
  );
}
function $c(e) {
  const t =
    e.kind === "freeflow" ? "свободная подача" : e.kind === "light" ? "отказ фонаря" : "запутывание";
  if (e.phase === "armed") return "";
  const n =
      e.phase === "fixed"
        ? e.kind === "freeflow"
          ? `вентиль ${e.early ? "сразу" : "поздно"}`
          : e.kind === "light"
            ? `запасной ${e.early ? "сразу" : "поздно"}`
            : `распутался ${e.early ? "сразу" : "поздно"}`
        : e.phase === "active"
          ? e.kind === "freeflow"
            ? "вентиль не закрыт"
            : e.kind === "light"
              ? "без света"
              : "не распутался"
          : "не наступил",
    o = e.kind === "freeflow" && e.lostBar >= 0.5 ? `, −${Math.round(e.lostBar)} бар` : "";
  return `${t} — ${n}${o}`;
}
const Kc = (e, t, n) => (e < t ? t : e > n ? n : e);
function Be(e, t) {
  e.events.push(t);
}
function Gn(e, t, n) {
  e.log.push(n === void 0 ? { t: e.t, d: e.depth, type: t } : { t: e.t, d: e.depth, type: t, info: n });
}
function Gc(e) {
  return {
    pts: [],
    trap: [],
    bend: [],
    run: [],
    runFrom: null,
    seen: null,
    parkRef: 0,
    departed: false,
    parent: null,
    parentIdx: -1,
    parentS: 0,
    reel: "off",
    capacity: e.includes("reel") ? q.REEL_M : 0,
    laid: 0,
    out: !1,
    outSeen: !1,
    tugT: q.TUG_REPEAT_S,
    cut: !1,
  };
}
function hn(e, t) {
  let n = null,
    o = 0;
  for (let s = 1; s < e.length; s++) {
    const i = e[s - 1],
      a = e[s],
      r = a.x - i.x,
      l = a.y - i.y,
      h = r * r + l * l,
      c = Math.sqrt(h),
      d = h > 0 ? Kc(((t.x - i.x) * r + (t.y - i.y) * l) / h, 0, 1) : 0,
      u = i.x + r * d,
      f = i.y + l * d,
      p = Math.hypot(t.x - u, t.y - f);
    ((!n || p < n.dist) && (n = { x: u, y: f, dist: p, i: s, s: o + c * d }), (o += c));
  }
  return n;
}
function ti(e, t) {
  const n = e[t - 1],
    o = e[t];
  if (!n || !o) return { x: -1, y: 0 };
  const s = n.x - o.x,
    i = n.y - o.y,
    a = Math.hypot(s, i);
  return a > 1e-9 ? { x: s / a, y: i / a } : { x: -1, y: 0 };
}
function Po(e, t, n, o = -1) {
  return n === "laid"
    ? (e.laid[o]?.pts ?? t.guide)
    : n === "explorer"
      ? (t.olds[Math.max(0, o)]?.pts ?? t.explorer)
      : t.guide;
}
function Ue(e) {
  return e.pts.length ? e.pts[e.pts.length - 1] : null;
}
function Yr(e, t) {
  const n = e.line,
    o = n.pts.length;
  if (o >= 2) return ti(n.pts, o - 1);
  const s = Po(e, t, n.parent, n.parentIdx),
    i = o === 1 ? hn(s, n.pts[0]) : null;
  return i ? ti(s, i.i) : { x: -1, y: 0 };
}
function Uc(e, t) {
  const n = e.line,
    o = n.pts.length,
    s = o >= 2 ? n.pts.slice(o - 2) : Po(e, t, n.parent, n.parentIdx);
  return hn(s, e.diver)?.dist ?? 1 / 0;
}
function Ie(e) {
  const t = e.line,
    n = Rn(t);
  return t.laid + (t.reel === "live" && n ? ss(t) + Math.hypot(e.diver.x - n.x, e.diver.y - n.y) : 0);
}
function Ke(e) {
  return Math.max(0, e.line.capacity - Ie(e));
}
function Vc(e, t) {
  const n = e.line,
    o = Rn(n);
  return n.reel !== "live" || !o
    ? !1
    : n.run.some((s) => s.trap) || Le(t, o, n.run.length === 0, e.diver, !0);
}
function Wt(e) {
  return _e(e, e.diver.x, e.diver.y);
}
function js(e, t, n) {
  const o = e.line,
    s = Ue(o),
    i = o.run.map((l) => ({ ...l }));
  (Sr(t, s, i, e.diver, n) || i.splice(0, i.length, ...Ar(t, s, n)),
    i.length > q.RUN_BENDS_MAX && Tr(t, s, i, n));
  let a = 0,
    r = s;
  for (const l of i) ((a += Math.hypot(l.x - r.x, l.y - r.y)), (r = l));
  return { run: i, len: a + Math.hypot(n.x - r.x, n.y - r.y) };
}
function ri(e, t) {
  if (e.phase !== "dive" || e.line.capacity <= 0) return null;
  const n = e.line,
    o = e.diver;
  if (!Wt(e) && !(n.reel === "off" && ec(t, o.x, o.y).dist <= q.TIE_DOOR_M)) return null;
  const s = Ue(n);
  if (n.reel === "live" && s) {
    if (Ke(e) <= q.EMPTY_M) return qc(e, t, s);
    if (Ie(e) - n.laid < q.TIE_MIN_SEG_M) return null;
    const h = z(t, o.x, o.y);
    if (h > q.TIE_WALL_M) return null;
    const c = $t(t, o.x, o.y),
      d = h - q.TIE_OFFSET_M,
      u = { x: o.x - c.x * d, y: o.y - c.y * d },
      f = js(e, t, u);
    return n.laid + f.len > n.capacity + 1e-6 ? null : { kind: "off", x: u.x, y: u.y, run: f.run };
  }
  if (n.reel === "parked" && s)
    return n.capacity - n.laid < q.TIE_MIN_SEG_M || Math.hypot(o.x - s.x, o.y - s.y) > q.TIE_IN_M
      ? null
      : { kind: "in", parent: "own", idx: -1, x: s.x, y: s.y, s: n.laid };
  if (n.reel !== "off") return null;
  let i = null;
  const a = (h, c, d) => {
    const u = hn(d, o);
    u && u.dist <= q.TIE_IN_M && (!i || u.dist < i.h.dist) && (i = { kind: h, idx: c, h: u });
  };
  (a("guide", -1, t.guide),
    t.olds.forEach((h, c) => a("explorer", c, h.pts)),
    e.laid.forEach((h, c) => a("laid", c, h.pts)));
  const r = i;
  if (!r) return null;
  const l = Xc(t, Po(e, t, r.kind, r.idx), r.h);
  return { kind: "in", parent: r.kind, idx: r.idx, x: l.x, y: l.y, s: l.s };
}
function Xc(e, t, n) {
  const o = q.ROPE_CLEAR_M + q.BEND_LIFT_M;
  if (ie(e, n.x, n.y) >= o) return { x: n.x, y: n.y, s: n.s };
  for (let i = 1; i <= 30; i++)
    for (const a of [1, -1]) {
      const r = jc(t, n.s + a * i * 0.05);
      if (r && ie(e, r.x, r.y) >= o) return r;
    }
  const s = is(e, n);
  return { x: s.x, y: s.y, s: n.s };
}
function jc(e, t) {
  if (t < 0) return null;
  let n = t;
  for (let o = 1; o < e.length; o++) {
    const s = e[o - 1],
      i = e[o],
      a = Math.hypot(i.x - s.x, i.y - s.y);
    if (n <= a && a > 0) return { x: s.x + ((i.x - s.x) * n) / a, y: s.y + ((i.y - s.y) * n) / a, s: t };
    n -= a;
  }
  return null;
}
function qc(e, t, n) {
  const o = e.line,
    s = e.diver,
    i = Rn(o),
    a = Math.max(0, o.capacity - o.laid - ss(o)) + 1e-6;
  let r = { x: s.x, y: s.y },
    l = !1;
  const h = z(t, s.x, s.y);
  if (h <= q.TIE_WALL_M) {
    const f = $t(t, s.x, s.y),
      p = h - q.TIE_OFFSET_M,
      m = { x: s.x - f.x * p, y: s.y - f.y * p };
    o.laid + js(e, t, m).len <= o.capacity + 1e-6 && ((r = m), (l = !0));
  }
  const c = Math.hypot(r.x - i.x, r.y - i.y);
  !l && c > a && (r = { x: i.x + ((r.x - i.x) * a) / c, y: i.y + ((r.y - i.y) * a) / c });
  const d = Ie(e) - o.laid >= 0.05;
  if (!d) return { kind: "end", x: n.x, y: n.y, run: [], wall: !1, extend: !1 };
  const u = js(e, t, r);
  return { kind: "end", x: r.x, y: r.y, run: u.run, wall: l, extend: d };
}
function hs(e, t) {
  if (e.phase !== "dive" || e.arrowsLeft <= 0 || !Wt(e)) return null;
  const n = e.diver;
  let o = null;
  const s = [
    ["guide", t.guide],
    ...t.olds.map((l) => ["explorer", l.pts]),
    ["own", e.line.pts],
    ...e.laid.map((l) => ["laid", l.pts]),
  ];
  for (const [l, h] of s) {
    const c = hn(h, n);
    c && c.dist <= Ae.REACH_M && (!o || c.dist < o.h.dist) && (o = { line: l, poly: h, h: c });
  }
  const i = o;
  if (!i) return null;
  const a = i.h;
  if (e.arrows.some((l) => Math.hypot(l.x - a.x, l.y - a.y) < Ae.MIN_GAP_M)) return null;
  const r = ti(i.poly, a.i);
  return { x: a.x, y: a.y, dx: r.x, dy: r.y, line: i.line };
}
function zc(e, t, n) {
  return e.lineHoldLock ? !1 : (t.tie && ri(e, n) !== null) || (!t.tie && t.arrow && hs(e, n) !== null);
}
function Yc(e, t, n, o, s) {
  const i = e.line;
  i.tugT += s;
  const a = Ue(i);
  if (i.reel !== "live" || !a) {
    ((i.run = []), (i.runFrom = null), (i.seen = null));
    return;
  }
  const r = e.diver,
    l = i.runFrom && i.runFrom.x === a.x && i.runFrom.y === a.y ? Rn(i) : a,
    h = Math.max(0, i.capacity - i.laid - (l === a ? 0 : ss(i))),
    c = r.x - l.x,
    d = r.y - l.y,
    u = Math.hypot(c, d);
  let f = 0,
    p = 0,
    m = 0;
  if (u > h && u > 1e-9) {
    const _ = h / u,
      g = l.x + c * _,
      S = l.y + d * _;
    (z(t, g, S) >= nt.RADIUS_M - 0.02 ? ((r.x = g), (r.y = S)) : ((r.x = n), (r.y = o)),
      (p = c / u),
      (m = d / u));
    const A = r.vx * p + r.vy * m;
    A > 0 && ((r.vx -= p * A), (r.vy -= m * A), (f = A));
  }
  $i(e, t);
  const y = Ie(e) >= i.capacity - 0.02;
  (y && !i.outSeen && ((i.outSeen = !0), Be(e, { type: "reelOut" }), Gn(e, "reelOut")),
    (i.out = y),
    f > q.TUG_MIN_MPS &&
      i.tugT >= q.TUG_REPEAT_S &&
      ((i.tugT = 0), Be(e, { type: "reelTug", dx: -p, dy: -m, speed: f })));
}
function $i(e, t) {
  const n = e.line,
    o = Ue(n);
  if (n.reel !== "live" || !o) {
    ((n.run = []), (n.runFrom = null), (n.seen = null));
    return;
  }
  const s = { x: e.diver.x, y: e.diver.y };
  ((!n.runFrom ||
    n.runFrom.x !== o.x ||
    n.runFrom.y !== o.y ||
    !n.seen ||
    e.teleported ||
    Math.hypot(s.x - n.seen.x, s.y - n.seen.y) > q.ROPE_JUMP_M ||
    !Sr(t, o, n.run, n.seen, s)) &&
    (n.run = Ar(t, o, s)),
    n.run.length > q.RUN_BENDS_MAX && Tr(t, o, n.run, s),
    (n.runFrom = { x: o.x, y: o.y }),
    (n.seen = s));
}
function fa(e, t, n, o) {
  const s = e.line;
  (!s.bend || s.bend.length !== s.pts.length) && (s.bend = s.pts.map(() => !1));
  let i = Ue(s),
    a = !0,
    r = !1,
    l = 1 / 0;
  for (const c of o)
    ((s.laid += Math.hypot(c.x - i.x, c.y - i.y)),
      s.pts.push({ x: c.x, y: c.y }),
      s.bend.push(!0),
      s.trap.push(c.trap),
      r || (r = c.trap),
      (l = Math.min(l, Us(t, i, a, c, !1))),
      (i = c),
      (a = !1));
  const h = Le(t, i, a, n, !0);
  return (
    (l = Math.min(l, Us(t, i, a, n, !0))),
    (s.laid += Math.hypot(n.x - i.x, n.y - i.y)),
    s.pts.push({ x: n.x, y: n.y }),
    s.bend.push(!1),
    s.trap.push(h),
    (s.run = []),
    (s.runFrom = null),
    (s.seen = null),
    { trap: r || h, gap: Math.min(l, q.TRAP_GAP_M * 2), bends: o.length }
  );
}
function qs(e, t) {
  const n = Ue(e.line);
  if (!n) return 0;
  const o = Yr(e, t);
  return (e.diver.x - n.x) * o.x + (e.diver.y - n.y) * o.y;
}
function Zc(e, t, n) {
  const o = e.line;
  if (n.kind === "in") {
    (n.parent !== "own" &&
      ((o.pts = [{ x: n.x, y: n.y }]),
      (o.trap = []),
      (o.bend = [!1]),
      (o.parent = n.parent),
      (o.parentIdx = n.idx),
      (o.parentS = n.s),
      (o.laid = 0),
      (o.outSeen = !1),
      (o.cut = !1)),
      (o.reel = "live"),
      (o.departed = false),
      (o.out = !1),
      (o.run = []),
      (o.runFrom = null),
      (o.seen = null),
      $i(e, t),
      (o.parkRef = Math.max(0, qs(e, t))),
      Be(e, { type: "tie", kind: "in", trap: !1, x: n.x, y: n.y }),
      Gn(
        e,
        "tie",
        n.parent === "own" ? "resume" : n.parent === "laid" ? `in:laid${n.idx}` : `in:${n.parent}`,
      ));
    return;
  }
  if (n.kind === "end") {
    const i = n.extend ? fa(e, t, n, n.run) : { trap: !1, gap: q.TRAP_GAP_M * 2, bends: 0 };
    (n.wall && e.stats.ties++,
      (o.reel = "parked"),
      (o.out = !1),
      (o.cut = !0),
      (o.run = []),
      (o.runFrom = null),
      (o.seen = null),
      Be(e, { type: "tie", kind: "end", trap: i.trap, x: n.x, y: n.y, gap: i.gap, bends: i.bends }),
      Gn(e, "tie", i.trap ? "end-trap" : "end"));
    return;
  }
  const s = fa(e, t, n, n.run);
  o.departed = false;
  (e.stats.ties++,
    o.capacity - o.laid < q.TIE_MIN_SEG_M
      ? ((o.reel = "parked"), (o.out = !1), (o.cut = !0))
      : ($i(e, t), (o.parkRef = Math.max(0, qs(e, t)))),
    Be(e, { type: "tie", kind: "off", trap: s.trap, x: n.x, y: n.y, gap: s.gap, bends: s.bends }),
    Gn(e, "tie", s.trap ? "trap" : "off"));
}
function Jc(e, t) {
  (e.arrows.push({ x: t.x, y: t.y, dx: t.dx, dy: t.dy, line: t.line, near: !0, own: !0, prior: !1 }),
    e.arrowsLeft--,
    Be(e, { type: "arrow", x: t.x, y: t.y, dx: t.dx, dy: t.dy }),
    Gn(e, "arrow", t.line));
}
function Qc(e, t, n, o) {
  const s = e.line,
    i = e.diver,
    a = t.tie ? "tie" : t.arrow ? "arrow" : null;
  if (!a) ((e.lineHold = null), (e.lineHoldLock = !1));
  else if (e.lineHoldLock || e.cesa || e.ox.phase === "convulse") e.lineHold = null;
  else {
    const l = a === "tie" ? ri(e, n) : null,
      h = a === "arrow" ? hs(e, n) : null;
    if (!l && !h) e.lineHold = null;
    else {
      const c = l ? (l.kind === "end" ? q.CUT_HOLD_S : q.HOLD_S) : Ae.HOLD_S;
      ((!e.lineHold || e.lineHold.kind !== a) && (e.lineHold = { kind: a, t: 0, need: c }),
        (e.lineHold.need = c),
        (e.lineHold.t += o),
        e.lineHold.t >= c - 1e-9 &&
          (l ? Zc(e, n, l) : h && Jc(e, h), (e.lineHold = null), (e.lineHoldLock = !0)));
    }
  }
  const r = Ue(s);
  if (s.reel === "live" && r) {
    const l = qs(e, n);
    if(Math.hypot(i.x-r.x,i.y-r.y)>2)s.departed=true;
    s.parkRef = Math.min(s.parkRef, Math.max(0, l));
    const h = l - s.parkRef;
    s.departed && (h > q.PARK_FAR_M || (h > q.PARK_BEHIND_M && s.run.length === 0 && Uc(e, n) <= q.PARK_NEAR_M)) &&
      ((s.reel = "parked"),
      (s.out = !1),
      (s.run = []),
      (s.runFrom = null),
      (s.seen = null),
      Be(e, { type: "reelPark" }));
  }
  for (const l of e.arrows) {
    const h = Math.hypot(i.x - l.x, i.y - l.y);
    !l.near && h < Ae.TOUCH_M
      ? ((l.near = !0),
        Be(e, { type: "arrowTouch", dx: l.dx, dy: l.dy, blind: e.siltHere >= U.MURKY || ai(e) > 0 }))
      : l.near && h > Ae.TOUCH_RESET_M && (l.near = !1);
  }
}
function cs(e, t, n = q.TOUCH_M, fixedOnly = false) {
  const o = e.diver;
  let s = null;
  const i = (l, h, c = 1 / 0) => {
    const d = hn(h, o);
    if (!d) return;
    const u = d.dist;
    if (u > n || (s && u >= s.dist)) return;
    const f = d.i > c;
    let p = ti(h, d.i);
    (f &&
      d.i === h.length - 1 &&
      Math.hypot(h[d.i].x - h[d.i - 1].x, h[d.i].y - h[d.i - 1].y) < 1e-6 &&
      (p = d.i >= 2 ? ti(h, d.i - 1) : Yr(e, t)),
      (s = { dist: u, x: d.x, y: d.y, ex: p.x, ey: p.y, line: l, running: f }));
  };
  i("guide", t.guide);
  for (const l of t.olds) i("explorer", l.pts);
  for (const l of e.laid) i("laid", l.pts);
  const a = e.line,
    r = Ue(a);
  return (
    !fixedOnly && a.reel === "live" && r
      ? i(
          "own",
          [...a.pts, ...a.run.map((l) => ({ x: l.x, y: l.y })), { x: o.x, y: o.y }],
          a.pts.length - 1,
        )
      : a.pts.length >= 2 && i("own", a.pts),
    s
  );
}
function Zr(e, t) {
  const n = e.line,
    o = n.pts.map((r) => ({ x: r.x, y: r.y })),
    s = [...n.trap],
    i = n.pts.map((r, l) => An(n, l)),
    a = Rn(n);
  if (n.reel === "live" && a) {
    for (const r of n.run) (o.push({ x: r.x, y: r.y }), s.push(r.trap), i.push(!0));
    (o.push({ x: e.diver.x, y: e.diver.y }),
      s.push(Le(t, a, n.run.length === 0, e.diver, !0)),
      i.push(!1));
  }
  return { pts: o, trap: s, bend: i };
}
function Jr(e, t) {
  return e.line.parent ? Kh(t, Zr(e, t)) : [];
}
function t0(e, t) {
  const n = [];
  let o = 0;
  for (let s = 0; s < e.length; s++) {
    const i = e[s];
    if (s > 0) {
      const a = e[s - 1],
        r = Math.hypot(i.x - a.x, i.y - a.y);
      if (o + r >= t) {
        const l = r > 0 ? (t - o) / r : 0;
        return (n.push({ x: a.x + (i.x - a.x) * l, y: a.y + (i.y - a.y) * l }), n);
      }
      o += r;
    }
    n.push(i);
  }
  return n;
}
function Es(e, t) {
  const n = t.indexOf(!0);
  return n >= 0 ? e.slice(0, n + 1) : [...e];
}
function ua(e, t, n) {
  return e === "explorer" ? 1 + Math.max(0, Math.min(n - 1, t)) : e === "laid" ? 1 + n + t : 0;
}
function e0(e, t) {
  return e.line.parent ? 1 + t.olds.length + e.laid.length : -1;
}
function n0(e, t) {
  const n = [],
    o = t.olds.length,
    s = (a, r, l) => n.push({ pts: a, len: _o(a), parent: r, parentS: l });
  s(t.guide, -1, 0);
  for (const a of t.olds) s(Es(a.pts, a.trap), a.parentS >= 0 ? 0 : -1, Math.max(0, a.parentS));
  for (const a of e.laid) s(Es(a.pts, a.trap), ua(a.parent, a.parentIdx, o), a.parentS);
  const i = e.line;
  if (i.parent && i.pts.length) {
    const a = i.reel === "live" && i.run.length > 0,
      r = a ? [...i.pts, ...i.run.map((h) => ({ x: h.x, y: h.y }))] : i.pts,
      l = a ? [...i.trap, ...i.run.map((h) => h.trap)] : i.trap;
    s(Es(r, l), ua(i.parent, i.parentIdx, o), i.parentS);
  }
  return n;
}
function Qr(e, t, n, o = 0) {
  const s = e[t],
    i = t0(s.pts, Math.min(n, s.len));
  if (s.parent < 0 || o > 64) return i;
  const a = Qr(e, s.parent, s.parentS, o + 1),
    r = a[a.length - 1],
    l = i[0];
  return r && l && Math.hypot(r.x - l.x, r.y - l.y) < 0.01 ? [...a, ...i.slice(1)] : [...a, ...i];
}
function tl(e, t, n, o = 0) {
  if (o > 64) return [];
  let s = [],
    i = -1;
  const a = e[t];
  for (let r = 0; r < e.length; r++) {
    const l = e[r];
    if (l.parent !== t || r === t || l.pts.length < 2 || Math.abs(l.parentS - a.len) > St.CONT_M)
      continue;
    const h = tl(e, r, n, o + 1),
      c = [r, ...h],
      d = (c.includes(n) ? 1e6 : 0) + c.reduce((u, f) => u + e[f].len, 0);
    d > i && ((i = d), (s = c));
  }
  return s;
}
function i0(e, t, n) {
  const o = Qr(e, t, 1 / 0);
  for (const s of tl(e, t, n)) {
    const i = e[s],
      a = o[o.length - 1],
      r = i.pts[0];
    o.push(...(a && r && Math.hypot(a.x - r.x, a.y - r.y) < 0.01 ? i.pts.slice(1) : i.pts));
  }
  return o;
}
function s0(e, t) {
  let n = 0;
  for (let o = 1; o < t.length; o++) {
    const s = t[o - 1],
      i = t[o],
      a = Math.hypot(i.x - s.x, i.y - s.y);
    if (!_e(e, s.x, s.y) && _e(e, i.x, i.y)) {
      let r = 0,
        l = 1;
      for (let h = 0; h < 20; h++) {
        const c = (r + l) / 2;
        _e(e, s.x + (i.x - s.x) * c, s.y + (i.y - s.y) * c) ? (l = c) : (r = c);
      }
      return n + a * l;
    }
    n += a;
  }
  return 0;
}
function o0(e, t, n) {
  const o = an(t, Math.max(0, n - 0.5)),
    s = an(t, n + 0.5),
    i = Math.hypot(s.x - o.x, s.y - o.y);
  if (i < 1e-6) return 1;
  const a = e.diver.heading;
  return (Math.cos(a) * (s.x - o.x) + Math.sin(a) * (s.y - o.y)) / i <= -0.3 ? -1 : 1;
}
function li(e, t, n = e.auto.on) {
  const o = n0(e, t);
  let s = n && e.auto.line >= 0 && e.auto.line < o.length ? e.auto.line : -1;
  if (s < 0) {
    let d = 1 / 0;
    for (let u = 0; u < o.length; u++) {
      const f = o[u];
      if (f.pts.length < 2) continue;
      const p = hn(f.pts, e.diver);
      p && p.dist < d - 0.05 && ((d = p.dist), (s = u));
    }
    if (s < 0) return null;
  }
  const i = i0(o, s, e0(e, t)),
    a = En(i, e.diver);
  if (!a) return null;
  const r = _o(i),
    l = e.ruleT !== null && _e(e, e.diver.x, e.diver.y);
  let h = n && e.auto.line === s ? e.auto.dir : o0(e, i, a.s);
  l || (h = 1);
  const c = h > 0 ? r - a.s : a.s - Math.min(a.s, s0(e, i));
  return { route: i, len: r, line: s, dir: h, s: a.s, dist: a.dist, ahead: c };
}
function vo(e, t, n = !0) {
  if (
    e.phase !== "dive" ||
    e.cesa || e.blind || Co(e) ||
    e.oogT > 0 ||
    e.ox.phase !== "none" ||
    Xs(e) ||
    !Wt(e)
  )
    return !1;
  const o = li(e, t, !n && e.auto.on);
  return !o || o.dist > St.ENGAGE_M ? !1 : o.ahead > (n ? St.MIN_AHEAD_M : St.END_M);
}
// Store metres along a site rope. Its stable index occupies the high bits.
function routeMark(lineIndex, distance) {
  return lineIndex * 65536 + Math.round(distance);
}
function recordRopeVisit(state, world) {
  if (world.site.id !== "hub" || !Wt(state) || state.frame % 6 !== 0 || state.dying) return;
  state.routeMarks ??= new Set();
  for (const [index, line] of world.olds.entries()) {
    const position = En(line.pts, state.diver);
    if (position && position.dist <= St.KNOWN_NEAR_M && Ir(world, state.diver, position)) {
      state.routeMarks.add(routeMark(index, position.s));
    }
  }
}
function blindLineSignal(state, world) {
  if (!state.blind || !Wt(state)) return '';
  const contact = cs(state, world, q.TOUCH_M, true);
  if (!contact || !Ir(world, state.diver, contact)) return 'Нет контакта с линией';
  const sector = (Math.round(Math.atan2(contact.ey, contact.ex) / (Math.PI / 4)) + 4) % 4;
  return 'Касание линии · ' + ['горизонталь ↔', 'наклон ╲', 'вертикаль ↕', 'наклон ╱'][sector];
}
function a0(e, t) {
  if (
    !e.auto.on ||
    e.ruleT === null ||
    !_e(e, e.diver.x, e.diver.y) ||
    e.siltHere >= St.KNOWN_MAX_SILT ||
    e.blind
  )
    return !1;
  const n = li(e, t, !0);
  if (!n || n.ahead <= St.KNOWN_END_M) return !1;
  const near=(line,point)=>line.length>=2&&(hn(line,point)?.dist??Infinity)<=St.KNOWN_NEAR_M;
  const s=point=>{
    if(e.laid.some(line=>near(line.pts,point)))return true;
    if(t.site.id!=="hub")return near(t.guide,point)||t.olds.some(line=>near(line.pts,point));
    return t.olds.some((line,index)=>{
      const position=En(line.pts,point);
      return position&&position.dist<=St.KNOWN_NEAR_M&&e.routeMarks?.has(routeMark(index,position.s));
    });
  };
  for (let i = 0; i <= St.KNOWN_END_M; i++) if (!s(an(n.route, Math.max(0, n.s + n.dir * i)))) return !1;
  return !0;
}
function r0(e, t, n = 1, o = null) {
  const s = li(e, t, !0);
  if (!s) return { x: 0, y: 0 };
  const i = an(s.route, Math.max(0, s.s + s.dir * St.LOOKAHEAD_M)),
    a = z(t, i.x, i.y);
  if (a < St.WALL_CLEAR_M) {
    const b = $t(t, i.x, i.y),
      T = Math.min(St.WALL_PUSH_MAX_M, St.WALL_CLEAR_M - a);
    ((i.x += b.x * T), (i.y += b.y * T));
  }
  const r = i.x - e.diver.x,
    l = i.y - e.diver.y,
    h = Math.hypot(r, l);
  if (h < 1e-6) return { x: 0, y: 0 };
  const c = _e(e, e.diver.x, e.diver.y);
  let d = c ? Math.min(St.SPEED_MPS, nt.V_MAX_X * $e.SPEED_K) : St.SPEED_MPS,
    u = r / h,
    f = l / h;
  const p = nt.RADIUS_M + St.BODY_CLEAR_M;
  let m = 0,
    y = 0;
  for (const b of [0, St.BODY_PROBE_M]) {
    const T = e.diver.x + u * b,
      k = e.diver.y + f * b,
      w = z(t, T, k);
    if (w >= p) continue;
    const L = $t(t, T, k),
      R = ((p - w) / p) * St.BODY_PUSH;
    ((m += L.x * R), (y += L.y * R));
  }
  if (m || y) {
    const b = u + m,
      T = f + y,
      k = Math.hypot(b, T);
    k > 1e-6 && ((u = b / k), (f = T / k));
  }
  const _ = o?.x ?? 0,
    g = o?.y ?? 0;
  if (c) {
    const b = bc(t, e.diver) * St.CAREFUL_K;
    if (Number.isFinite(b)) {
      const T = u * _ + f * g,
        k = T * T - (_ * _ + g * g) + b * b,
        w = k >= 0 ? T + Math.sqrt(k) : 0;
      d = Math.min(d, Math.max(St.CAREFUL_MIN_MPS, w));
    }
  }
  let S = (u * d - _) / (nt.V_MAX_X * n),
    A = (f * d - g) / (nt.V_MAX_Y * n);
  const E = Math.hypot(S, A);
  return (E > 1 && ((S /= E), (A /= E)), { x: S, y: A });
}
function l0() {
  return { hold: 0, lock: !1, frames: 0, charge: 0 };
}
function el(e) {
  return Math.max(0, Q.FRAMES - e.camera.frames);
}
function h0(e) {
  return e.phase === "dive" && !e.dying && !e.cesa && e.camera.frames < Q.FRAMES && e.camera.charge <= 0;
}
function pa(e) {
  return e.camera.charge > 0 ? Math.max(0, Math.min(1, 1 - e.camera.charge / Q.RECHARGE_S)) : 1;
}
function c0(e, t, n, o) {
  const s = e.camera;
  if ((s.charge > 0 && (s.charge = Math.max(0, s.charge - n)), !t.camera))
    return ((s.hold = 0), (s.lock = !1), !1);
  if (s.lock || !o || !h0(e)) return ((s.hold = 0), !1);
  if (((s.hold += n), s.hold < Q.HOLD_S - 1e-9)) return !0;
  (s.frames++, (s.hold = 0), (s.lock = !0), (s.charge = Q.RECHARGE_S));
  const i = e.diver;
  return (
    e.events.push({ type: "shot", n: s.frames, x: i.x, y: i.y, aim: i.aim, silt: e.siltHere }),
    !0
  );
}
const ks = Math.PI * 2;
function d0(e) {
  return e === "ox-tox"
    ? "convulse"
    : e === "hypoxia" || e === "dcs" || e === "embolism"
      ? "faint"
      : "struggle";
}
function f0(e, t, n) {
  if (t === "faint") return n === "dcs" || n === "embolism" ? Xt.SURFACE_FAINT_S : Xt.FAINT_S;
  const [o, s] = t === "convulse" ? Xt.CONVULSE_S : Xt.STRUGGLE_S;
  return o + ii(e.rng) * (s - o);
}
function hi(e, t, n) {
  if (e.dying) return;
  const o = d0(t);
  ((e.dying = {
    cause: t,
    stage: o,
    t: 0,
    total: 0,
    firstS: f0(e, o, t),
    t0: e.t,
    d0: e.depth,
    aim0: e.diver.aim,
    heading0: e.diver.heading,
  }),
    n !== void 0 && (e.dying.ppo2 = n),
    (e.hold = null),
    (e.lineHold = null),
    (e.fail.hold = null),
    (e.fail.press = null),
    (e.cesa = !1),
    e.events.push({ type: "dying", cause: t, stage: o }));
}
function u0(e, t) {
  const n = e.dying;
  if (!n) return !1;
  ((n.t += t),
    (n.total += t),
    n.stage !== "sink" &&
      n.t >= n.firstS - 1e-9 &&
      ((n.stage = "sink"), (n.t = 0), e.events.push({ type: "dying", cause: n.cause, stage: "sink" })));
  const o = e.diver,
    s = o.face,
    i = We(n.heading0);
  if (n.stage === "struggle" || n.stage === "convulse") {
    const a = n.stage === "convulse",
      r = ks * (a ? Xt.CONVULSE_HZ : Xt.THRASH_HZ) * n.total,
      l = Math.sin(r) * 0.6 + Math.sin(r * 1.73) * 0.3 + Math.sin(r * 2.9) * 0.1,
      h = Math.min(1, n.total / 0.4),
      c = a ? 1 : 1 - 0.5 * Math.min(1, n.t / n.firstS);
    o.aim = n.aim0 + l * (a ? Xt.CONVULSE_AIM_RAD : Xt.THRASH_AIM_RAD) * c * h;
    const u =
      (a ? i : i + (-0.4 - i) * (1 - Math.exp(-n.total * 2))) +
      (a ? l * Xt.CONVULSE_PITCH_RAD : -Math.abs(l) * Xt.THRASH_PITCH_RAD * c) * h;
    o.heading = Hi(Math.max(-1.4, Math.min(1.4, u)), s);
  } else {
    const a = Math.min(1, t * Xt.LIMP_RATE),
      r = We(o.heading);
    o.heading = Hi(r + (Xt.LIMP_PITCH_RAD - r) * a, s);
    let l = Math.PI / 2 - o.aim;
    for (; l > Math.PI; ) l -= ks;
    for (; l < -Math.PI; ) l += ks;
    o.aim += l * a;
  }
  return ((o.face = Mo(o.heading, s)), n.stage === "sink" && n.t >= Xt.SINK_S - 1e-9);
}
const ws = { on: !1, stage: null, u: 0, regOut: !1, ui: 1, close: 0, quiet: 1, struggle: 0, lit: !0 };
function p0(e) {
  const t = Math.sin(e * 127.1 + 311.7) * 43758.5453;
  return t - Math.floor(t);
}
function kn(e) {
  const t = e.dying,
    n = In(e) !== "dead",
    o = (f) => (n ? Math.min(f, Rt.LIT_CLOSE) : f);
  if (!t) {
    if (e.phase === "end" && e.outcome?.kind === "dead")
      return {
        on: !0,
        stage: null,
        u: 1,
        regOut: !0,
        ui: 0,
        close: o(1),
        quiet: 0,
        struggle: 0,
        lit: n,
      };
    if (e.phase === "dive" && e.oogT > 0) {
      const f = Math.min(1, e.oogT / tt.OOG_GRACE_S);
      return { ...ws, ui: 1 - (1 - Rt.UI_PRE_A) * f, close: o(Rt.GRACE_CLOSE * f), lit: n };
    }
    return n ? ws : { ...ws, lit: n };
  }
  if (t.stage === "sink") {
    const f = Math.min(1, t.t / Xt.SINK_S),
      p = f * f * (3 - 2 * f);
    return {
      on: !0,
      stage: "sink",
      u: f,
      regOut: !0,
      ui: 0,
      close: o(Rt.FIRST_CLOSE + (1 - Rt.FIRST_CLOSE) * p),
      quiet: Math.max(0, 1 - t.t / Rt.QUIET_S),
      struggle: 0,
      lit: n,
    };
  }
  const s = Math.min(1, t.t / t.firstS),
    i =
      t.cause === "oog-overhead" ||
      t.cause === "oog-deco" ||
      t.cause === "cesa-stuck" ||
      t.cause === "oog"
        ? Rt.UI_PRE_A
        : 1,
    [a, r] = Rt.UI_DROP,
    l = p0(Math.floor(t.total * Rt.UI_FLICKER_HZ)) < a + (r - a) * s,
    h = i * (1 - s) * (l ? Rt.UI_DROP_A : 1),
    c = i < 1 ? Rt.GRACE_CLOSE : 0,
    d = c + (Rt.FIRST_CLOSE - c) * s,
    u = t.stage === "faint" ? 0 : t.stage === "convulse" ? 1 : 1 - 0.5 * s;
  return { on: !0, stage: t.stage, u: s, regOut: !1, ui: h, close: o(d), quiet: 1, struggle: u, lit: n };
}
function nl(e) {
  return e.phase === "dive" && !e.dying && !e.cesa && !e.blind && ai(e) <= ke.DARK_MAX;
}
function il(e, t, n, o) {
  const s = n.kind === "sign" ? o * ke.SIGN_K : o;
  return Math.hypot(n.x - e.diver.x, n.y - e.diver.y) <= s && Ir(t, e.diver, n, -0.25);
}
function Ki(e, t, n) {
  if (!nl(e)) return null;
  const o = e.diver;
  let s = null,
    i = 1 / 0;
  for (const a of t.site.notes) {
    const r = Math.hypot(a.x - o.x, a.y - o.y);
    r >= i || !il(e, t, a, n) || ((s = a), (i = r));
  }
  return s;
}
function m0(e, t) {
  return e.reading ? e.reading : (Ki(e, t, ke.REACH_M)?.id ?? null);
}
function ma(e, t, n) {
  return e.reading
    ? e.reading
    : n
      ? (Ki(e, t, ke.REACH_M)?.id ?? null)
      : Math.hypot(e.diver.vx, e.diver.vy) >= ke.SHOW_V_MPS
        ? null
        : (Ki(e, t, ke.SHOW_IN_M)?.id ?? null);
}
function y0(e, t, n, o) {
  let s = null;
  if (t.read) {
    const i = e.reading ? n.site.notes.find((a) => a.id === e.reading) : void 0;
    i ? (s = nl(e) && il(e, n, i, ke.KEEP_M) ? i.id : null) : (s = Ki(e, n, ke.REACH_M)?.id ?? null);
  }
  return (
    s !== e.reading &&
      (e.reading && ya(e, { type: "read", note: e.reading, on: !1 }),
      s && (ya(e, { type: "read", note: s, on: !0 }), e.stats.reads++),
      (e.reading = s)),
    e.reading && (e.stats.readT += o),
    e.reading !== null
  );
}
function ya(e, t) {
  e.events.push(t);
}
function ds(e, t = null) {
  if (!t || t.site.beyond === "route") return En(lo, e)?.s ?? 0;
  let n = null;
  for (const o of t.site.axes) {
    const s = En(o.pts, e);
    s && (!n || s.dist < n.dist) && (n = s);
  }
  return n?.s ?? 0;
}
function sl(e) {
  const t = e.explorer[e.explorer.length - 1];
  return t ? ds(t) : 0;
}
function No(e, t) {
  const n = e.line;
  if (!n.parent || n.pts.length === 0) return 0;
  const o = [...n.pts];
  if (
    (n.reel === "live" &&
      o.push(...n.run.map((r) => ({ x: r.x, y: r.y })), { x: e.diver.x, y: e.diver.y }),
    t.site.beyond === "olds")
  )
    return g0(o, t);
  const s = sl(t) - 1,
    i = 0.25;
  let a = 0;
  for (let r = 1; r < o.length; r++) {
    const l = o[r - 1],
      h = o[r],
      c = Math.hypot(h.x - l.x, h.y - l.y),
      d = Math.max(1, Math.ceil(c / i));
    for (let u = 0; u < d; u++) {
      const f = (u + 0.5) / d;
      ds({ x: l.x + (h.x - l.x) * f, y: l.y + (h.y - l.y) * f }) > s && (a += c / d);
    }
  }
  return a;
}
const _0 = 2;
function g0(e, t) {
  const n = [t.guide, ...t.olds.map((a) => a.pts)],
    o = (a, r) => n.every((l) => (En(l, { x: a, y: r })?.dist ?? 1 / 0) > _0),
    s = 0.25;
  let i = 0;
  for (let a = 1; a < e.length; a++) {
    const r = e[a - 1],
      l = e[a],
      h = Math.hypot(l.x - r.x, l.y - r.y),
      c = Math.max(1, Math.ceil(h / s));
    for (let d = 0; d < c; d++) {
      const u = (d + 0.5) / c;
      o(r.x + (l.x - r.x) * u, r.y + (l.y - r.y) * u) && (i += h / c);
    }
  }
  return i;
}
