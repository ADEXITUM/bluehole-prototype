function ie(e, t, n) {
  return Math.min(z(e, t, n), Rr(e, t, n));
}
function yr(e, t, n) {
  const s = ie(e, t + 0.02, n) - ie(e, t - 0.02, n),
    i = ie(e, t, n + 0.02) - ie(e, t, n - 0.02),
    a = Math.hypot(s, i);
  return a > 1e-9 ? { x: s / a, y: i / a } : { x: 0, y: -1 };
}
function Gt(e, t, n, o = ge()) {
  const s = Math.hypot(n.x - t.x, n.y - t.y);
  if (s < 1e-9) return ie(e, t.x, t.y) >= o;
  const i = (n.x - t.x) / s,
    a = (n.y - t.y) / s;
  let r = 0;
  for (let l = 0; l < 1e5; l++) {
    const h = ie(e, t.x + i * r, t.y + a * r);
    if (h < o) return !1;
    if (r >= s) return !0;
    r = Math.min(s, r + Math.max((h - o) * mr, 0.004));
  }
  return !0;
}
function Fh(e, t, n, o = ge() + 0.03) {
  const s = Math.hypot(n.x - t.x, n.y - t.y),
    i = (p) => ie(e, t.x + (n.x - t.x) * p, t.y + (n.y - t.y) * p);
  if (s < 1e-9) return { t: 0, s: i(0) };
  let a = { t: 0, s: 1 / 0 },
    r = 0,
    l = 0.004;
  for (let p = 0; p < 1e5; p++) {
    const m = Math.min(1, r / s),
      y = i(m);
    if ((y < a.s && (a = { t: m, s: y }), r >= s)) break;
    ((l = Math.max((y - o) * mr, 0.004)), (r = Math.min(s, r + l)));
  }
  let h = Math.max(0, a.t - 0.006 / s),
    c = Math.min(1, a.t + 0.006 / s);
  const d = 0.381966;
  for (let p = 0; p < 18; p++) {
    const m = h + (c - h) * d,
      y = c - (c - h) * d;
    i(m) < i(y) ? (c = y) : (h = m);
  }
  const u = (h + c) / 2,
    f = i(u);
  return f < a.s ? { t: u, s: f } : a;
}
function is(e, t, n = ge() + q.BEND_LIFT_M, o = 0.12) {
  let s = { x: t.x, y: t.y },
    i = 0;
  for (let a = 0; a < 4; a++) {
    const r = ie(e, s.x, s.y);
    if (r >= n - 1e-4) break;
    const l = yr(e, s.x, s.y),
      h = Math.min(n - r + 0.001, o - i);
    if (h <= 0) break;
    ((s = { x: s.x + l.x * h, y: s.y + l.y * h }), (i += h));
  }
  return s;
}
const bn = (e, t, n, o) => e * o - t * n;
const Fe = (e, t, n) => ({ x: e.x + (t.x - e.x) * n, y: e.y + (t.y - e.y) * n });
const se = (e, t) => Math.hypot(t.x - e.x, t.y - e.y);
function Gs(e, t, n, o, s, i) {
  let a = 0;
  for (let r = 0; r < 256 && a < i; r++) {
    const l = z(e, t + o * a, n + s * a);
    if (l <= 0.004) return a;
    a += Math.max(l, 0.01);
  }
  return Math.min(a, i);
}
function _r(e, t, n, o, s) {
  if (z(e, t, n) <= 0) return 0;
  const i = q.TRAP_GAP_M;
  return Gs(e, t, n, -s, o, i) + Gs(e, t, n, s, -o, i);
}
function gr(e, t) {
  const n = z(e, t.x, t.y);
  if (n <= 0) return 0;
  const o = yr(e, t.x, t.y);
  return n + Gs(e, t.x, t.y, o.x, o.y, q.TRAP_GAP_M);
}
function Mr(e, t, n, o = !1, s = !1) {
  const i = se(t, n),
    a = q.TRAP_GAP_M * 2;
  if (i < 1e-6) return a;
  const r = (n.x - t.x) / i,
    l = (n.y - t.y) / i,
    h = Math.max(1, Math.ceil(i / q.TRAP_SAMPLE_M)),
    c = q.TRAP_KNOT_M;
  let d = a;
  for (let u = 0; u <= h; u++) {
    const f = (i * u) / h;
    if ((o && f < c) || (s && i - f < c)) continue;
    const p = _r(e, t.x + r * f, t.y + l * f, r, l);
    p < d && (d = p);
  }
  return d;
}
function Us(e, t, n, o, s) {
  const i = Mr(e, t, o, n, s);
  return s ? i : Math.min(i, gr(e, o));
}
function Le(e, t, n, o, s) {
  return Us(e, t, n, o, s) < q.TRAP_GAP_M || !Gt(e, t, o, ge() - 0.01);
}
function Yo(e, t, n, o, s, i) {
  const a = ge();
  let r = t,
    l = n,
    h = o;
  for (let c = 0; c < q.WRAP_PER_STEP; c++) {
    if (Gt(e, r, s, a)) return !0;
    if (!Gt(e, r, h, a)) return !1;
    let d = 0,
      u = 1;
    for (let _ = 0; _ < 24; _++) {
      const g = (d + u) / 2;
      Gt(e, r, Fe(h, s, g), a) ? (d = g) : (u = g);
    }
    const f = Fe(h, s, d),
      { t: p } = Fh(e, r, f),
      m = is(e, Fe(r, f, p));
    if (se(r, m) < 1e-4) return !1;
    let y = Math.sign(bn(m.x - r.x, m.y - r.y, s.x - m.x, s.y - m.y));
    (y || (y = Math.sign(bn(h.x - r.x, h.y - r.y, s.x - r.x, s.y - r.y)) || 1),
      i.push({ x: m.x, y: m.y, sgn: y > 0 ? 1 : -1, trap: Le(e, r, l, m, !1) }),
      (r = m),
      (l = !1),
      (h = f));
  }
  return Gt(e, r, s, a);
}
function Sr(e, t, n, o, s) {
  const i = Math.max(1, Math.ceil(se(o, s) / q.ROPE_SUBSTEP_M));
  let a = o;
  for (let r = 1; r <= i; r++) {
    const l = r === i ? s : Fe(o, s, r / i);
    if (!Hh(e, t, n, a, l)) return !1;
    a = l;
  }
  return !0;
}
function Hh(e, t, n, o, s) {
  const i = ge();
  let a = !1;
  for (let l = 0; l < 4 * q.RUN_BENDS_MAX && n.length; l++) {
    const h = n[n.length - 1],
      c = n.length >= 2 ? n[n.length - 2] : t;
    if (bn(h.x - c.x, h.y - c.y, s.x - h.x, s.y - h.y) * h.sgn >= -1e-9) break;
    if ((n.pop(), (a = !0), !Gt(e, c, s, i))) return Yo(e, c, n.length === 0, { x: h.x, y: h.y }, s, n);
  }
  if (a) return !0;
  const r = n.length ? n[n.length - 1] : t;
  return Gt(e, r, s, i) ? !0 : Yo(e, r, n.length === 0, o, s, n);
}
function Tr(e, t, n, o, s = q.RUN_BENDS_MAX) {
  const i = ge();
  for (let r = 0; n.length > s && r < n.length; ) {
    const l = r > 0 ? n[r - 1] : t,
      h = r + 1 < n.length ? n[r + 1] : o;
    Gt(e, l, h, i) ? n.splice(r, 1) : r++;
  }
  let a = 0;
  for (; n.length > s && a++ < 4 * s; ) {
    let r = -1,
      l = null,
      h = 1 / 0;
    for (let u = 0; u + 1 < n.length; u++) {
      const f = n[u],
        p = n[u + 1],
        m = se(f, p);
      if (m >= h) continue;
      const y = u > 0 ? n[u - 1] : t,
        _ = u + 2 < n.length ? n[u + 2] : o,
        g = Wh(y, f, _, p);
      !g ||
        se(g, f) > 0.6 ||
        se(g, p) > 0.6 ||
        !Gt(e, y, g, i) ||
        !Gt(e, g, _, i) ||
        ((r = u), (l = g), (h = m));
    }
    if (r < 0 || !l) break;
    const c = r > 0 ? n[r - 1] : t;
    n.splice(r, 2, { x: l.x, y: l.y, sgn: n[r].sgn, trap: Le(e, c, r === 0, l, !1) });
    const d = n[r + 1];
    d && (d.trap = Le(e, l, !1, d, !1));
  }
}
function Wh(e, t, n, o) {
  const s = { x: t.x - e.x, y: t.y - e.y },
    i = { x: o.x - n.x, y: o.y - n.y },
    a = bn(s.x, s.y, i.x, i.y);
  if (Math.abs(a) < 1e-9) return null;
  const r = bn(n.x - e.x, n.y - e.y, i.x, i.y) / a;
  return r < 1 ? null : { x: e.x + s.x * r, y: e.y + s.y * r };
}
class Bh {
  constructor(t) {
    M(this, "key");
    M(this, "a", []);
    this.key = t;
  }
  get size() {
    return this.a.length;
  }
  push(t) {
    const n = this.a;
    n.push(t);
    let o = n.length - 1;
    for (; o > 0; ) {
      const s = (o - 1) >> 1;
      if (this.key[n[s]] <= this.key[n[o]]) break;
      (([n[s], n[o]] = [n[o], n[s]]), (o = s));
    }
  }
  pop() {
    const t = this.a,
      n = t[0],
      o = t.pop();
    if (t.length) {
      t[0] = o;
      let s = 0;
      for (;;) {
        const i = 2 * s + 1,
          a = i + 1;
        let r = s;
        if (
          (i < t.length && this.key[t[i]] < this.key[t[r]] && (r = i),
          a < t.length && this.key[t[a]] < this.key[t[r]] && (r = a),
          r === s)
        )
          break;
        (([t[r], t[s]] = [t[s], t[r]]), (s = r));
      }
    }
    return n;
  }
}
function br(e, t, n, o = 1 / 0) {
  const s = ge();
  if (Gt(e, t, n, s)) return [];
  const i = q.ROPE_GRID_M,
    a = se(t, n),
    r = Math.max(2, Math.min(6, 0.35 * a)),
    l = Math.min(t.x, n.x) - r,
    h = Math.min(t.y, n.y) - r,
    c = Math.ceil((Math.max(t.x, n.x) + r - l) / i),
    d = Math.ceil((Math.max(t.y, n.y) + r - h) / i);
  if (c * d > q.ROPE_GRID_MAX) return null;
  const u = new Uint8Array(c * d),
    f = s + i * 0.75;
  for (let O = 0; O < d; O++)
    for (let C = 0; C < c; C++) u[O * c + C] = ie(e, l + (C + 0.5) * i, h + (O + 0.5) * i) >= f ? 1 : 0;
  const p = (O) => {
      const C = Math.floor((O.x - l) / i),
        W = Math.floor((O.y - h) / i);
      let V = -1,
        K = 1 / 0;
      for (let B = 0; B <= 6 && V < 0; B++)
        for (let Y = -B; Y <= B; Y++)
          for (let x = -B; x <= B; x++) {
            const G = C + x,
              J = W + Y;
            if (G < 0 || J < 0 || G >= c || J >= d || !u[J * c + G]) continue;
            const ot = Math.hypot(l + (G + 0.5) * i - O.x, h + (J + 0.5) * i - O.y);
            ot < K && ((K = ot), (V = J * c + G));
          }
      return V;
    },
    m = p(t),
    y = p(n);
  if (m < 0 || y < 0) return null;
  const _ = c * d,
    g = new Float64Array(_).fill(1 / 0),
    S = new Float64Array(_).fill(1 / 0),
    A = new Int32Array(_).fill(-1),
    E = new Uint8Array(_),
    b = y % c,
    T = Math.floor(y / c),
    k = (O) => {
      const C = Math.abs((O % c) - b),
        W = Math.abs(Math.floor(O / c) - T);
      return Math.max(C, W) + (Math.SQRT2 - 1) * Math.min(C, W);
    },
    w = new Bh(S);
  ((g[m] = 0), (S[m] = k(m)), w.push(m));
  let L = !1;
  for (; w.size; ) {
    const O = w.pop();
    if (E[O]) continue;
    if (((E[O] = 1), O === y)) {
      L = !0;
      break;
    }
    const C = O % c,
      W = Math.floor(O / c);
    for (let V = -1; V <= 1; V++)
      for (let K = -1; K <= 1; K++) {
        if (!K && !V) continue;
        const B = C + K,
          Y = W + V;
        if (B < 0 || Y < 0 || B >= c || Y >= d) continue;
        const x = Y * c + B;
        if (!u[x] || E[x] || (K && V && (!u[W * c + B] || !u[Y * c + C]))) continue;
        const G = g[O] + (K && V ? Math.SQRT2 : 1);
        G < g[x] && ((g[x] = G), (S[x] = G + k(x)), (A[x] = O), w.push(x));
      }
  }
  if (!L) return null;
  const R = [];
  for (let O = y; O >= 0; O = A[O])
    R.push({ x: l + ((O % c) + 0.5) * i, y: h + (Math.floor(O / c) + 0.5) * i });
  R.reverse();
  const P = [t, ...R, n],
    v = [t];
  for (let O = 0; O < P.length - 1; ) {
    let C = O + 1;
    for (; C + 1 < P.length && Gt(e, v[v.length - 1], P[C + 1], s); ) C++;
    (v.push(P[C]), (O = C));
  }
  $h(e, v);
  for (let O = 1; O < v.length - 1; O++) v[O] = is(e, v[O]);
  for (let O = 1; O < v.length; O++) if (!Gt(e, v[O - 1], v[O], s - 0.005)) return null;
  let N = 0;
  for (let O = 1; O < v.length; O++) N += se(v[O - 1], v[O]);
  return N > o ? null : v.slice(1, -1);
}
function $h(e, t) {
  const n = ge();
  for (let o = 0; o < 40; o++) {
    let s = 0;
    for (let i = 1; i < t.length - 1; i++) {
      const a = t[i - 1],
        r = t[i],
        l = t[i + 1];
      if (Gt(e, a, l, n)) {
        (t.splice(i, 1), i--, (s += 1));
        continue;
      }
      const h = l.x - a.x,
        c = l.y - a.y,
        d = h * h + c * c,
        u = d > 0 ? Math.max(0, Math.min(1, ((r.x - a.x) * h + (r.y - a.y) * c) / d)) : 0,
        f = { x: a.x + h * u, y: a.y + c * u };
      let p = 0,
        m = 1;
      for (let y = 0; y < 12; y++) {
        const _ = (p + m) / 2,
          g = Fe(r, f, _);
        Gt(e, a, g, n) && Gt(e, g, l, n) ? (p = _) : (m = _);
      }
      if (p > 0) {
        const y = Fe(r, f, p);
        ((s += se(r, y)), (t[i] = y));
      }
    }
    if (s < 0.001) break;
  }
}
function Ar(e, t, n) {
  const o = br(e, t, n) ?? [],
    s = [];
  let i = t;
  for (let a = 0; a < o.length; a++) {
    const r = o[a],
      l = a + 1 < o.length ? o[a + 1] : n,
      h = Math.sign(bn(r.x - i.x, r.y - i.y, l.x - r.x, l.y - r.y)) || 1;
    (s.push({ x: r.x, y: r.y, sgn: h > 0 ? 1 : -1, trap: Le(e, i, a === 0, r, !1) }), (i = r));
  }
  return s;
}
function An(e, t) {
  return !!e.bend && e.bend.length === e.pts.length && e.bend[t] === !0;
}
function Er(e) {
  return e.pts.filter((t, n) => !An(e, n));
}
function Rn(e) {
  return e.run.length ? e.run[e.run.length - 1] : e.pts.length ? e.pts[e.pts.length - 1] : null;
}
function ss(e) {
  const t = e.pts[e.pts.length - 1];
  if (!t || !e.run.length) return 0;
  let n = 0,
    o = t;
  for (const s of e.run) ((n += se(o, s)), (o = s));
  return n;
}
const Zo = new WeakMap();
function Fi(e, t) {
  if (t.bend && t.bend.length === t.pts.length)
    return {
      pts: t.pts.map((h) => ({ x: h.x, y: h.y })),
      trap: [...t.trap],
      bend: [...t.bend],
      parent: t.parent,
      parentIdx: t.parentIdx,
      parentS: t.parentS,
    };
  let n = Zo.get(e);
  n || Zo.set(e, (n = new WeakMap()));
  const o = n.get(t);
  if (o) return Fi(e, o);
  const s = t.pts.map((h) => (ie(e, h.x, h.y) < ge() + q.BEND_LIFT_M ? is(e, h) : { x: h.x, y: h.y })),
    i = s.length ? [s[0]] : [],
    a = s.length ? [!1] : [],
    r = [];
  for (let h = 1; h < s.length; h++) {
    const c = s[h - 1],
      d = s[h],
      u = Gt(e, c, d) ? [] : br(e, c, d, se(c, d) * q.LEGACY_DETOUR + 1);
    if (!u) {
      (i.push(d), a.push(!1), r.push(!0));
      continue;
    }
    let f = c;
    for (const p of u) (i.push(p), a.push(!0), r.push(Le(e, f, f === c, p, !1)), (f = p));
    (i.push(d), a.push(!1), r.push(Le(e, f, f === c, d, !0)));
  }
  const l = { pts: i, trap: r, bend: a, parent: t.parent, parentIdx: t.parentIdx, parentS: t.parentS };
  return (n.set(t, l), Fi(e, l));
}
function Kh(e, t) {
  const n = [],
    o = q.TRAP_KNOT_M;
  for (let s = 0; s < t.trap.length; s++) {
    if (!t.trap[s]) continue;
    let i = s;
    for (; i + 1 < t.trap.length && t.trap[i + 1]; ) i++;
    let a = 1 / 0,
      r = t.pts[s];
    for (let l = s; l <= i; l++) {
      const h = t.pts[l],
        c = t.pts[l + 1];
      if (!c) continue;
      const d = !An(t, l),
        u = !An(t, l + 1),
        f = se(h, c),
        p = Math.max(1, Math.ceil(f / q.TRAP_SAMPLE_M)),
        m = f > 1e-9 ? (c.x - h.x) / f : 1,
        y = f > 1e-9 ? (c.y - h.y) / f : 0;
      for (let _ = 0; _ <= p; _++) {
        const g = (f * _) / p;
        if ((d && g < o) || (u && f - g < o)) continue;
        const S = Fe(h, c, _ / p),
          A = _r(e, S.x, S.y, m, y);
        A < a && ((a = A), (r = S));
      }
      if (!u) {
        const _ = gr(e, c);
        _ < a && ((a = _), (r = c));
      }
    }
    if (!Number.isFinite(a)) {
      const l = t.pts[s],
        h = t.pts[i + 1] ?? l;
      ((r = Fe(l, h, 0.5)), (a = 0));
    }
    (n.push({ x: r.x, y: r.y, gap: a, i: s }), (s = i));
  }
  return n;
}
const Jo = sn.NOISE.reduce((e, t) => e + t.amp, 0);
function Gh(e, t) {
  let n = 0;
  for (let o = 0; o < sn.NOISE.length; o++) {
    const s = sn.NOISE[o];
    n += s.amp * Jn(e / s.scaleM, t / s.scaleM, sn.NOISE_SEED + o * 101);
  }
  return n;
}
function pi(e, t, n) {
  return n < 0 ? 0 : t < 0 || t >= e.w || n >= e.h ? 1 : e.cells[n * e.w + t];
}
const Uh = 4;
function Vh(e, t, n) {
  let o = 1;
  for (const s of e) {
    const i = s.pts;
    for (let a = 1; a < i.length; a++) {
      const r = i[a - 1],
        l = i[a];
      if (
        t < Math.min(r.x, l.x) - 1 ||
        t > Math.max(r.x, l.x) + 1 ||
        n < Math.min(r.y, l.y) - 1 ||
        n > Math.max(r.y, l.y) + 1
      )
        continue;
      const h = l.x - r.x,
        c = l.y - r.y,
        d = h * h + c * c,
        u = d > 0 ? Math.max(0, Math.min(1, ((t - r.x) * h + (n - r.y) * c) / d)) : 0,
        p = 0.5 + (Math.hypot(t - r.x - h * u, n - r.y - c * u) - s.halfW) * Uh;
      p < o && (o = p);
    }
  }
  return o < 0 ? 0 : o;
}
function kr(e, t, n) {
  const o = Xh(e, t, n);
  return e.slits && e.slits.length ? Math.min(o, Vh(e.slits, t, n)) : o;
}
function Xh(e, t, n) {
  const o = t - 0.5,
    s = n + e.airRows - 0.5,
    i = Math.floor(o),
    a = Math.floor(s),
    r = o - i,
    l = s - a,
    h = pi(e, i, a),
    c = pi(e, i + 1, a),
    d = pi(e, i, a + 1),
    u = pi(e, i + 1, a + 1),
    f = (h + (c - h) * r) * (1 - l) + (d + (u - d) * r) * l;
  return f <= 0.5 - Jo - 1e-6 || f >= 0.5 + Jo + 1e-6 ? f : f + Gh(t, n);
}
const jh = ["rock", "sand", "silt"];
const qh = { ".": 0, ":": 1, ",": 2 };
function zh(e, t, n = null) {
  const o = e.length,
    s = Math.max(...e.map((k) => k.length)),
    i = new Uint8Array(s * o),
    a = new Uint8Array(s * o),
    r = new Uint8Array(s * o),
    l = [],
    h = [];
  let c = null,
    d = null;
  for (let k = 0; k < o; k++) {
    const w = e[k];
    for (let L = 0; L < s; L++) {
      const R = w[L] ?? "#",
        P = { x: L + 0.5, y: k - t + 0.5 },
        v = qh[R];
      (v !== void 0 && ((a[k * s + L] = v), (r[k * s + L] = 1)),
        R === "#"
          ? (i[k * s + L] = 1)
          : R === "@"
            ? (d = P)
            : R === "*"
              ? (c = P)
              : R >= "A" && R <= "Z"
                ? l.push({ k: R, p: P })
                : R >= "a" && R <= "z" && h.push({ k: R, p: P }));
    }
  }
  const u = (k, w) => (k.k < w.k ? -1 : k.k > w.k ? 1 : 0);
  for (let k = 0; k < o; k++)
    for (let w = 0; w < s; w++) {
      const L = k * s + w;
      if (!(r[L] || i[L]))
        for (let R = 1; R < s; R++) {
          const P = w - R >= 0 && r[L - R] ? L - R : -1,
            v = w + R < s && r[L + R] ? L + R : -1,
            N = k - R >= 0 && r[L - R * s] ? L - R * s : -1,
            O = k + R < o && r[L + R * s] ? L + R * s : -1,
            C = P >= 0 ? P : v >= 0 ? v : N >= 0 ? N : O;
          if (C >= 0) {
            a[L] = a[C];
            break;
          }
        }
    }
  const f = new Uint8Array(s * o);
  for (let k = 0; k < s; k++) {
    let w = 1;
    for (let L = 0; L < o; L++) (i[L * s + k] && (w = 0), (f[L * s + k] = w));
  }
  const p = sn.SDF_RES,
    m = n?.slits ?? [],
    y = { w: s, h: o, airRows: t, cells: i, slits: m },
    _ = s * p,
    g = o * p,
    S = wr(y, p, _, g),
    A = l.sort(u).map((k) => k.p),
    E = [...h.sort(u).map((k) => k.p), ...(c ? [c] : [])],
    b = {
      w: s,
      h: o,
      airRows: t,
      cells: i,
      bottom: a,
      open: f,
      guide: A,
      olds: [],
      explorer: E,
      note: c,
      doors: [],
      doorSet: new sa([], f, s, o, t),
      site: n ?? Yh(e, t),
      slits: m,
      start: d ?? { x: s / 2, y: 0.5 },
      res: p,
      sw: _,
      sh: g,
      sdf: S,
    },
    T = _o(A);
  if (n?.oldLines) {
    ((b.olds = n.oldLines.map((w) => {
      const L = w.pts.map((P) => ({ x: P.x, y: P.y })),
        R = w.fromGuide ? En(A, L[0]) : null;
      return {
        id: w.id,
        year: w.year,
        door: w.door,
        pts: L,
        trap: L.slice(1).map(() => !1),
        parentS: R ? R.s : -1,
        end: w.end,
        arrow: w.end !== null,
      };
    })),
      (b.explorer = b.olds[0]?.pts ?? []));
    const k = b.olds[0];
    b.note = k && k.end ? k.pts[k.pts.length - 1] : null;
  } else
    E.length >= 2 &&
      (b.olds = [
        {
          id: "explorer",
          year: 1996,
          door: 0,
          pts: E,
          trap: E.slice(1).map(() => !1),
          parentS: T,
          end: c ? "cut" : null,
          arrow: c !== null,
        },
      ]);
  if (
    ((b.doors = n?.doors
      ? n.doors.map((k) => ({ ...k }))
      : [
          {
            id: "gate",
            name: "галерея",
            x: Cr(b),
            side: 1,
            yMin: Fs.GATE_MIN_DEPTH_M,
            yMax: 1 / 0,
            span: [Fs.GATE_MIN_DEPTH_M, 1 / 0],
            roof: !1,
          },
        ]),
    (b.doorSet = new sa(b.doors, f, s, o, t, !n?.doors)),
    n?.oldLines)
  )
    for (const k of b.olds)
      k.trap = k.pts.slice(1).map((w, L) => Mr(b, k.pts[L], w, !0, !0) < q.TRAP_GAP_M);
  return b;
}
function Yh(e, t) {
  return {
    ...Ji.m7,
    id: "m7",
    name: "карта из строк",
    rows: e,
    airRows: t,
    doors: null,
    oldLines: null,
    axes: [],
    finds: [],
    notes: [],
    halocline: null,
    slits: [],
    current: null,
    arch: null,
  };
}
const Qo = new Map();
function Zh(e) {
  const t = typeof e == "string" ? Ji[e] : e,
    n = `${t.id}:${t.arch ? (t.arch.OPEN ? 1 : 0) : "-"}`,
    o = typeof e == "string" ? Qo.get(n) : void 0;
  if (o) return o;
  let s = t.rows;
  if (t.arch && !t.arch.OPEN) {
    const a = t.arch;
    s = s.map((r, l) => {
      const h = l - t.airRows;
      return h < a.BLOCK_Y[0] || h > a.BLOCK_Y[1]
        ? r
        : r.slice(0, a.BLOCK_X[0]) +
            "#".repeat(a.BLOCK_X[1] - a.BLOCK_X[0] + 1) +
            r.slice(a.BLOCK_X[1] + 1);
    });
  }
  const i = zh(s, t.airRows, t);
  return (typeof e == "string" && Qo.set(n, i), i);
}
function Jh(e, t, n) {
  const o = e.site.arch;
  return !!o && t < o.SEA_X && n > o.SEA_MIN_Y;
}
const Kn = 1e20;
function ta(e, t, n, o, s) {
  let i = 0;
  ((o[0] = 0), (s[0] = -Kn), (s[1] = Kn));
  for (let a = 1; a < t; a++) {
    let r = (e[a] + a * a - (e[o[i]] + o[i] * o[i])) / (2 * a - 2 * o[i]);
    for (; r <= s[i]; ) (i--, (r = (e[a] + a * a - (e[o[i]] + o[i] * o[i])) / (2 * a - 2 * o[i])));
    (i++, (o[i] = a), (s[i] = r), (s[i + 1] = Kn));
  }
  i = 0;
  for (let a = 0; a < t; a++) {
    for (; s[i + 1] < a; ) i++;
    const r = a - o[i];
    n[a] = r * r + e[o[i]];
  }
}
function ea(e, t, n) {
  const o = Math.max(t, n),
    s = new Float64Array(o),
    i = new Float64Array(o),
    a = new Int32Array(o),
    r = new Float64Array(o + 1);
  for (let l = 0; l < t; l++) {
    for (let h = 0; h < n; h++) s[h] = e[h * t + l];
    ta(s, n, i, a, r);
    for (let h = 0; h < n; h++) e[h * t + l] = i[h];
  }
  for (let l = 0; l < n; l++) {
    for (let h = 0; h < t; h++) s[h] = e[l * t + h];
    ta(s, t, i, a, r);
    for (let h = 0; h < t; h++) e[l * t + h] = i[h];
  }
}
function wr(e, t, n, o) {
  const s = n * o,
    i = new Uint8Array(s);
  for (let h = 0; h < o; h++) {
    const c = (h + 0.5) / t - e.airRows;
    for (let d = 0; d < n; d++) i[h * n + d] = kr(e, (d + 0.5) / t, c) >= 0.5 ? 1 : 0;
  }
  const a = new Float64Array(s),
    r = new Float64Array(s);
  for (let h = 0; h < s; h++) ((a[h] = i[h] ? 0 : Kn), (r[h] = i[h] ? Kn : 0));
  (ea(a, n, o), ea(r, n, o));
  const l = new Float32Array(s);
  for (let h = 0; h < s; h++) l[h] = i[h] ? -(Math.sqrt(r[h]) - 0.5) / t : (Math.sqrt(a[h]) - 0.5) / t;
  return l;
}
function Lr(e, t, n) {
  const o = t * e.res - 0.5,
    s = (n + e.airRows) * e.res - 0.5;
  if (s < 0) return 1;
  if (o < 0 || o > e.sw - 1 || s > e.sh - 1) return -1;
  const i = Math.floor(o),
    a = Math.floor(s),
    r = Math.min(i + 1, e.sw - 1),
    l = Math.min(a + 1, e.sh - 1),
    h = o - i,
    c = s - a,
    d = e.sdf,
    u = d[a * e.sw + i],
    f = d[a * e.sw + r],
    p = d[l * e.sw + i],
    m = d[l * e.sw + r];
  return (u + (f - u) * h) * (1 - c) + (p + (m - p) * h) * c;
}
function z(e, t, n) {
  return Lr(e, t, n);
}
const na = new WeakMap();
function Rr(e, t, n) {
  let o = na.get(e);
  if (!o) {
    const s = st.ROCK_PPM,
      i = e.w * s,
      a = e.h * s;
    ((o = { res: s, sw: i, sh: a, airRows: e.airRows, sdf: wr(e, s, i, a) }), na.set(e, o));
  }
  return Lr(o, t, n);
}
function $t(e, t, n) {
  const o = 0.5 / e.res,
    s = z(e, t + o, n) - z(e, t - o, n),
    i = z(e, t, n + o) - z(e, t, n - o),
    a = Math.hypot(s, i);
  return a > 1e-9 ? { x: s / a, y: i / a } : { x: 0, y: -1 };
}
function Ge(e, t, n, o, s, i) {
  let a = 0;
  for (let r = 0; r < 256 && a < i; r++) {
    const l = z(e, t + o * a, n + s * a);
    if (l < 0.02) return a;
    a += Math.max(l, 0.04);
  }
  return Math.min(a, i);
}
function Ir(e, t, n, o = 0) {
  const s = Math.hypot(n.x - t.x, n.y - t.y);
  if (s < 1e-9) return z(e, t.x, t.y) >= o;
  const i = (n.x - t.x) / s,
    a = (n.y - t.y) / s;
  let r = 0;
  for (let l = 0; l < 4096; l++) {
    const h = z(e, t.x + i * r, t.y + a * r);
    if (h < o) return !1;
    if (r >= s) return !0;
    r = Math.min(s, r + Math.max(h - o, 0.02));
  }
  return !0;
}
function mo(e, t, n) {
  const o = Math.floor(t),
    s = Math.floor(n + e.airRows);
  return o < 0 || o >= e.w || s < 0 || s >= e.h ? !1 : e.open[s * e.w + o] === 1;
}
function os(e, t, n) {
  const o = Math.floor(t),
    s = Math.floor(n + e.airRows);
  return o < 0 || o >= e.w || s < 0 || s >= e.h ? "rock" : jh[e.bottom[s * e.w + o]];
}
function Or(e, t, n, o, s) {
  return os(e, t + o * sn.BOTTOM_PROBE_M, n + s * sn.BOTTOM_PROBE_M);
}
function as(e, t) {
  return { gw: Math.ceil(e.w / t), gh: Math.ceil((e.h - e.airRows) / t) };
}
const ia = new WeakMap();
function yo(e, t) {
  let n = ia.get(e);
  n || ia.set(e, (n = new Map()));
  let o = n.get(t);
  if (o) return o;
  const { gw: s, gh: i } = as(e, t);
  o = new Uint8Array(s * i);
  for (let a = 0; a < i; a++)
    for (let r = 0; r < s; r++) o[a * s + r] = z(e, (r + 0.5) * t, (a + 0.5) * t) > -t * 0.5 ? 1 : 0;
  return (n.set(t, o), o);
}
function Pr(e, t, n, o) {
  if (z(e, t, n) >= o) return { x: t, y: n };
  for (let s = 0.25; s < 12; s += 0.25) {
    const i = Math.max(8, Math.ceil(s * 12));
    for (let a = 0; a < i; a++) {
      const r = (a / i) * Math.PI * 2,
        l = t + Math.cos(r) * s,
        h = n + Math.sin(r) * s;
      if (h > 0 && z(e, l, h) >= o) return { x: l, y: h };
    }
  }
  return { x: t, y: n };
}
function vr(e, t) {
  for (let n = 1; n < e.length; n++) {
    const o = e[n - 1],
      s = e[n],
      i = Math.min(o.y, s.y),
      a = Math.max(o.y, s.y);
    if (t >= i && t <= a && a > i) {
      const r = (t - o.y) / (s.y - o.y);
      return { x: o.x + (s.x - o.x) * r, y: t };
    }
  }
  return null;
}
function Nr(e, t) {
  let n = null;
  for (let o = 1; o < e.length; o++) {
    const s = e[o - 1],
      i = e[o],
      a = i.x - s.x,
      r = i.y - s.y,
      l = a * a + r * r,
      h = l > 0 ? Math.max(0, Math.min(1, ((t.x - s.x) * a + (t.y - s.y) * r) / l)) : 0,
      c = s.x + a * h,
      d = s.y + r * h,
      u = Math.hypot(t.x - c, t.y - d);
    (!n || u < n.dist) && (n = { x: c, y: d, dist: u });
  }
  return n;
}
function _o(e) {
  let t = 0;
  for (let n = 1; n < e.length; n++) t += Math.hypot(e[n].x - e[n - 1].x, e[n].y - e[n - 1].y);
  return t;
}
function En(e, t) {
  let n = null,
    o = 0;
  for (let s = 1; s < e.length; s++) {
    const i = e[s - 1],
      a = e[s],
      r = a.x - i.x,
      l = a.y - i.y,
      h = r * r + l * l,
      c = Math.sqrt(h),
      d = h > 0 ? Math.max(0, Math.min(1, ((t.x - i.x) * r + (t.y - i.y) * l) / h)) : 0,
      u = i.x + r * d,
      f = i.y + l * d,
      p = Math.hypot(t.x - u, t.y - f);
    ((!n || p < n.dist) && (n = { s: o + c * d, x: u, y: f, dist: p }), (o += c));
  }
  return n;
}
function an(e, t) {
  if (e.length === 0) return { x: 0, y: 0 };
  let n = Math.max(0, t);
  for (let s = 1; s < e.length; s++) {
    const i = e[s - 1],
      a = e[s],
      r = Math.hypot(a.x - i.x, a.y - i.y);
    if (n <= r && r > 0) return { x: i.x + ((a.x - i.x) * n) / r, y: i.y + ((a.y - i.y) * n) / r };
    n -= r;
  }
  const o = e[e.length - 1];
  return { x: o.x, y: o.y };
}
function Qh(e, t, n) {
  return t >= e && n >= Fs.GATE_MIN_DEPTH_M;
}
function tc(e, t, n, o, s, i) {
  const a = Math.floor(s),
    r = Math.floor(i + o);
  return a < 0 || a >= t || r < 0 || r >= n ? !1 : e[r * t + a] === 1;
}
class sa {
  constructor(t, n, o, s, i, a = !1) {
    M(this, "doors");
    M(this, "open");
    M(this, "w");
    M(this, "h");
    M(this, "airRows");
    M(this, "legacy");
    ((this.doors = t),
      (this.open = n),
      (this.w = o),
      (this.h = s),
      (this.airRows = i),
      (this.legacy = a));
  }
  toJSON() {
    return this.doors;
  }
}
function He(e, t, n) {
  for (let o = 0; o < e.doors.length; o++) {
    const s = e.doors[o];
    if (
      !((t - s.x) * s.side < 0 || n < s.yMin || n > s.yMax) &&
      !(s.roof && tc(e.open, e.w, e.h, e.airRows, t, n))
    )
      return o;
  }
  return -1;
}
function _e(e, t, n) {
  return e.doors.legacy ? Qh(e.gateX, t, n) : He(e.doors, t, n) >= 0;
}
function ec(e, t, n) {
  let o = { i: -1, dist: 1 / 0 };
  return (
    e.doors.forEach((s, i) => {
      const a = Math.max(s.span[0], Math.min(s.span[1], n)),
        r = Math.hypot(t - s.x, n - a);
      r < o.dist && (o = { i, dist: r });
    }),
    o
  );
}
function Cr(e) {
  const t = e.guide[e.guide.length - 1];
  if (!t) return 1 / 0;
  let n = Math.floor(t.x);
  for (; n > 0 && !mo(e, n - 1 + 0.5, t.y); ) n--;
  return n;
}
const go = Math.PI / 180;
const oa = (le.SECTORS_DEG[2] - le.SECTOR_STICK_DEG) * go;
const nc = Math.cos(nt.HAND_TURN_DEG * go);
const ic = (e) => (e <= 0 ? 0 : e >= 1 ? 1 : e * e * (3 - 2 * e));
function nn(e) {
  for (; e > Math.PI; ) e -= Math.PI * 2;
  for (; e < -Math.PI; ) e += Math.PI * 2;
  return e;
}
function We(e) {
  return Math.atan2(Math.sin(e), Math.abs(Math.cos(e)));
}
function Hi(e, t) {
  return t > 0 ? e : nn(Math.PI - e);
}
function Mo(e, t) {
  const n = Math.cos(e);
  return n > 1e-9 ? 1 : n < -1e-9 ? -1 : t;
}
function sc(e, t, n, o, s = null) {
  let i, a;
  if (Math.hypot(t, n) > le.INTENT_MPS) {
    const c = t > le.SIDE_MPS ? 1 : t < -0.05 ? -1 : 0;
    if (c !== 0 && c !== e.face) {
      const d = We(e.heading);
      Math.abs(d) < oa && ((e.face = c), (e.heading = Hi(d, c)));
    }
    ((i = Math.atan2(n, t)), (a = le.TURN_RATE));
  } else {
    const c = s ? Math.hypot(s.x, s.y) : 0;
    if (s && c > 0.5 && (s.x / c) * e.face < nc) {
      const d = We(e.heading);
      Math.abs(d) < oa && ((e.face = e.face > 0 ? -1 : 1), (e.heading = Hi(d, e.face)));
    }
    ((i = e.face > 0 ? 0 : Math.PI), (a = le.TRIM_RATE));
  }
  let r = nn(i - e.heading);
  Math.abs(Math.abs(r) - Math.PI) < 0.05 &&
    (r = e.face > 0 == e.heading > 0 ? -Math.abs(r) : Math.abs(r));
  const l = r * Math.min(1, o * a),
    h = le.TURN_MAX_DEG_S * go * o;
  ((e.heading = nn(e.heading + Math.max(-h, Math.min(h, l)))), (e.face = Mo(e.heading, e.face)));
}
function oc(e, t, n, o, s, i = null, a = 1, r = null, l = !0, h = null) {
  const c = r?.x ?? 0,
    d = r?.y ?? 0;
  let u = t * nt.V_MAX_X * a,
    f = i ?? n * nt.V_MAX_Y * a;
  const p = u + c,
    m = i ?? f + d,
    y = Math.min(1, s * nt.RESPONSE);
  ((e.vx += (p - e.vx) * y), (e.vy += (m - e.vy) * y), (e.x += e.vx * s), (e.y += e.vy * s));
  let _ = 0;
  const g = nt.RADIUS_M;
  for (let S = 0; S < 4; S++) {
    const A = z(o, e.x, e.y);
    if (A >= g) break;
    const E = $t(o, e.x, e.y);
    ((e.x += E.x * (g - A)), (e.y += E.y * (g - A)));
    const b = e.vx * E.x + e.vy * E.y;
    b < 0 && ((_ = Math.max(_, -b)), (e.vx -= b * E.x), (e.vy -= b * E.y));
    const T = u * E.x + f * E.y;
    T < 0 && ((u -= T * E.x), (f -= T * E.y));
  }
  return (
    (e.x = Math.min(o.w - g, Math.max(g, e.x))),
    e.y < nt.SURFACE_MIN_Y && ((e.y = nt.SURFACE_MIN_Y), e.vy < 0 && (e.vy = 0)),
    e.y <= nt.SURFACE_MIN_Y + 1e-9 && f < 0 && (f = 0),
    l && sc(e, u, f, s, i === null ? h : null),
    ac(e, t, n, c, d, i === null, i === null ? h : null, s),
    _
  );
}
function ac(e, t, n, o, s, i, a, r) {
  const l = e.vx - o,
    h = e.vy - s,
    c = Math.hypot(l, h),
    d = a ? Math.hypot(a.x, a.y) : 0;
  if (a && d > 1e-6) {
    const [u, f] = nt.HAND_MPS,
      p = Math.min(1, d) * (1 - ic((c - u) / (f - u)));
    if (p > 0) {
      const m = nn(Math.atan2(a.y, a.x) - e.aim);
      e.aim = nn(e.aim + m * Math.min(1, r * nt.HAND_RATE * p));
    }
  }
  if (!((o !== 0 || s !== 0) && Math.hypot(t, n) < 0.05 && i) && c > nt.AIM_MIN_SPEED) {
    const u = Math.atan2(h, l),
      f = nn(u - e.aim);
    e.aim = nn(e.aim + f * Math.min(1, r * nt.AIM_RATE * Math.min(1, c / nt.V_MAX_X)));
  }
}
const Re = nt.V_MAX_X * $e.SPEED_K;
const yn = Et.CELL_M;
const aa = (e) => (e < 0 ? 0 : e > 1 ? 1 : e);
const ra = new WeakMap();
const la = new WeakMap();
function Wi(e) {
  return e.flows ?? e.current;
}
