const xi = Object.freeze({
  x: 0,
  y: 0,
  pick: null,
  menu: !1,
  auto: !1,
  dash: !1,
  tie: !1,
  arrow: !1,
  valve: !1,
  torch: !1,
  untangle: !1,
  read: !1,
  lx: 0,
  ly: 0,
  camera: !1,
  wait: !1,
});
function cn(e = {}) {
  return {
    x: e.x ?? 0,
    y: e.y ?? 0,
    pick: e.pick ?? null,
    menu: e.menu ?? !1,
    auto: e.auto ?? !1,
    dash: e.dash ?? !1,
    tie: e.tie ?? !1,
    arrow: e.arrow ?? !1,
    valve: e.valve ?? !1,
    torch: e.torch ?? !1,
    untangle: e.untangle ?? !1,
    read: e.read ?? !1,
    lx: e.lx ?? 0,
    ly: e.ly ?? 0,
    camera: e.camera ?? !1,
    wait: e.wait ?? !1,
  };
}
function Qi(e) {
  return { s: e >>> 0 || 2654435769 };
}
function ii(e) {
  e.s = (e.s + 1831565813) | 0;
  let t = e.s;
  return (
    (t = Math.imul(t ^ (t >>> 15), t | 1)),
    (t ^= t + Math.imul(t ^ (t >>> 7), t | 61)),
    ((t ^ (t >>> 14)) >>> 0) / 4294967296
  );
}
function dt(e, t, n) {
  let o = Math.imul(e | 0, 374761393) ^ Math.imul(t | 0, 668265263) ^ Math.imul(n | 0, 2147483587);
  return ((o = Math.imul(o ^ (o >>> 13), 1274126177)), (o ^= o >>> 16), (o >>> 0) / 4294967296);
}
function Jn(e, t, n) {
  const o = Math.floor(e),
    s = Math.floor(t),
    i = e - o,
    a = t - s,
    r = i * i * (3 - 2 * i),
    l = a * a * (3 - 2 * a),
    h = dt(o, s, n),
    c = dt(o + 1, s, n),
    d = dt(o, s + 1, n),
    u = dt(o + 1, s + 1, n),
    f = h + (c - h) * r,
    p = d + (u - d) * r;
  return (f + (p - f) * l) * 2 - 1;
}
const ln = (e) => Bt[e];
function ts(e) {
  return bt.SURFACE_BAR + Math.max(0, e) / bt.M_PER_BAR;
}
function es(e, t) {
  return e.fO2 * ts(t);
}
function ye(e, t = Kt.MOD_PPO2) {
  return (t / e.fO2 - bt.SURFACE_BAR) * bt.M_PER_BAR;
}
function dr(e, t = Kt.PPO2_MIN) {
  return Math.max(0, (t / e.fO2 - bt.SURFACE_BAR) * bt.M_PER_BAR);
}
function Ln(e, t) {
  const n = ts(t),
    o = 1 - e.fHe;
  return Math.max(0, (n * o - bt.SURFACE_BAR) * bt.M_PER_BAR);
}
function kh(e, t) {
  const n = Ln(e, t);
  return Math.min(1, Math.max(0, (n - ce.END_ONSET_M) / (ce.END_FULL_M - ce.END_ONSET_M)));
}
function wh(e) {
  return Yn.EFFORT_BASE + Yn.EFFORT_GAIN * Math.min(1, Math.max(0, e));
}
function Lh(e, t, n = 1) {
  return Yn.SAC_LPS * ts(e) * wh(t) * n;
}
function fr(e, t, n, o = 1) {
  return Lh(e, t, o) / n;
}
function Rh(e, t) {
  return [e * (1 - 1 / t), e * (1 - 2 / t)];
}
function Ih(e) {
  return e > Kt.PPO2_MAX || e < Kt.PPO2_MIN
    ? "alarm"
    : e > Kt.SHOW_DIM_MAX
      ? "high"
      : e < Kt.SHOW_DIM_MIN
        ? "low"
        : "normal";
}
const Oh = Math.log(2);
const Ph = (e) => Oh / ut.TISSUES[e].halfTimeS;
function vh() {
  return ut.TISSUES.map(() => 1);
}
function Nh(e, t) {
  return (ts(t) * (1 - e.fO2)) / ut.AIR_INERT;
}
function Di(e, t, n, o) {
  const s = Nh(t, n);
  for (let i = 0; i < e.length; i++) e[i] = e[i] + (s - e[i]) * (1 - Math.exp(-Ph(i) * o));
}
function Ch(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) t = Math.max(t, e[n] / ut.TISSUES[n].M);
  return t;
}
function ns(e) {
  return Math.max(0, (Ch(e) - bt.SURFACE_BAR) * bt.M_PER_BAR);
}
function ur(e) {
  return e > 0 ? Math.ceil(e / ut.STOP_STEP_M - 1e-9) * ut.STOP_STEP_M : 0;
}
function pr(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    const o = ut.TISSUES[n].M;
    t = Math.max(t, (e[n] - bt.SURFACE_BAR) / (o * bt.SURFACE_BAR - bt.SURFACE_BAR));
  }
  return Math.max(0, t);
}
function xh(e) {
  const t = xe.CURVE;
  if (e <= t[0][0]) return t[0][1];
  for (let n = 1; n < t.length; n++) {
    const [o, s] = t[n],
      [i, a] = t[n - 1];
    if (e <= o) return a + ((s - a) * (e - i)) / (o - i);
  }
  return t[t.length - 1][1];
}
function uo(e, t, n, o = [], s = !1) {
  const i = e.slice(),
    a = ut.TTS_STEP_S,
    r = ut.TTS_ASCENT_MPS;
  let l = Math.max(0, t),
    h = 0,
    c = n;
  const d = [];
  for (; l > 1e-6 && h < ut.TTS_MAX_S; ) {
    for (const f of o) l <= f.fromDepth + 1e-6 && f.mix.fO2 > c.fO2 && (c = f.mix);
    const u = ur(ns(i));
    if (u > 0 && l <= u + 1e-6) {
      if (((l = u), s)) {
        d.push({ depth: u, time: 0 });
        break;
      }
      (Di(i, c, l, a), (h += a));
      const f = d[d.length - 1];
      f && f.depth === u ? (f.time += a) : d.push({ depth: u, time: a });
    } else {
      const f = Math.min(r * a, l - u),
        p = f / r;
      (Di(i, c, l - f / 2, p), (l -= f), (h += p));
    }
  }
  return { tts: h, stops: d };
}
function po(e, t, n, o = []) {
  return uo(e, t, n, o, !0).stops[0]?.depth ?? 0;
}
function Dh(e, t, n, o = []) {
  const s = (l) => {
    const h = e.slice();
    return (l > 0 && Di(h, n, t, l), po(h, t, n, o) > 0);
  };
  if (s(0)) return 0;
  const i = ut.NDL_SHOW_MAX_S;
  let a = 0,
    r = ut.NDL_SEARCH_START_S;
  for (; !s(r); ) {
    if (r >= i) return 1 / 0;
    ((a = r), (r = Math.min(i, r * 2)));
  }
  for (; r - a > ut.NDL_TOL_S; ) {
    const l = (a + r) / 2;
    s(l) ? (r = l) : (a = l);
  }
  return a;
}
const ge = () => q.ROPE_CLEAR_M;
const mr = Math.SQRT1_2;
