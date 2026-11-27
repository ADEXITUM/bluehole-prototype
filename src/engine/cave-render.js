function ka(e, t, n, o = st.MAX_DPR) {
  let s = Math.max(1, Math.floor(e));
  const i = Math.max(1, Math.floor(t));
  s / i > st.FRAME_ASPECT_MAX && (s = Math.round(i * st.FRAME_ASPECT));
  const a = Math.max(1, n || 1),
    r = Math.max(0.5, Math.min(o, st.MAX_DPR, a)),
    l = Math.max(1, Math.round(s * r)),
    h = Math.max(1, Math.round(i * r)),
    c = (p) => Math.max(1, Math.round(l / (st.ROCK_PPM * p))),
    d = c(st.VIEW_W_OPEN_M),
    u = Math.max(d, c(st.VIEW_W_CAVE_M)),
    f = l / r;
  return {
    cssW: f,
    cssH: h / r,
    left: Math.round(((e - f) / 2) * a) / a,
    dpr: r,
    devW: l,
    devH: h,
    zoomOpen: st.ROCK_PPM * d,
    zoomCave: st.ROCK_PPM * u,
    u: f / H.REF_W,
  };
}
function Oi(e, t) {
  return ((H.PANEL_TOP + (t >= 3 ? H.PANEL_H3 : H.PANEL_H)) * e) / H.REF_W;
}
const wa = 18;
function dn(e) {
  const t = parseInt(e.slice(1), 16);
  return [(t >> 16) & 255, (t >> 8) & 255, t & 255];
}
function ul(e, t, n) {
  const o = F.ROCK_NORMAL_M,
    s = z(e, t + o, n) - z(e, t - o, n),
    i = z(e, t, n + o) - z(e, t, n - o),
    a = Math.hypot(s, i);
  return a > 1e-9 ? { x: s / a, y: i / a } : $t(e, t, n);
}
function Zs(e) {
  const t = 1 - (e - 1) / F.EDGE_BAND_PX;
  return t <= 0 ? 0 : Math.min(1, t * 1.25);
}
function ld(e) {
  const t = st.ROCK_PPM,
    n = e.w * t,
    o = e.h * t,
    s = -e.airRows,
    i = new Uint8Array(n * o);
  for (let x = 0; x < o; x++) {
    const G = (x + 0.5) / t + s;
    for (let J = 0; J < n; J++) i[x * n + J] = kr(e, (J + 0.5) / t, G) >= 0.5 ? 1 : 0;
  }
  const a = (x, G) => x < 0 || G < 0 || x >= n || G >= o || i[G * n + x] === 1,
    r = dn(I.rock),
    l = dn(I.rockDark),
    h = dn(I.rockLight),
    c = dn(I.silt),
    d = dn(I.sand),
    u = dn(I.edge),
    f = new Uint8ClampedArray(n * o * 4),
    p = new Uint8ClampedArray(n * o * 4),
    m = F.EDGE_BAND_PX,
    y = F.ROCK_SAMPLE_M,
    _ = F.ROCK_MEDIAL_M * t,
    g = 0.5 / t,
    S = new Int32Array(n * o).fill(-1),
    A = [],
    E = (x) => {
      let G = S[x];
      return (G < 0 && ((G = S[x] = A.length), A.push(x)), G);
    },
    b = (x, G, J, ot, D, Z, rt) => {
      for (let lt = 0; lt < 10; lt++) {
        const It = D + lt * g,
          Ft = Math.floor((x + J * It) * t),
          Ot = Math.floor((G + ot * It - s) * t);
        if (Math.abs(Ft - Z) > wa || Math.abs(Ot - rt) > wa) return -1;
        if (!a(Ft, Ot)) return Ot * n + Ft;
      }
      return -1;
    },
    T = new Int32Array(o + 1),
    k = [],
    w = [],
    L = [],
    R = [],
    P = [];
  for (let x = 0; x < o; x++) {
    T[x] = k.length;
    const G = (x + 0.5) / t + s;
    for (let J = 0; J < n; J++) {
      const ot = x * n + J;
      if (!i[ot]) continue;
      const D = (J + 0.5) / t;
      let Z = 99,
        rt = !1;
      for (let it = 1; it <= 3 && Z === 99; it++)
        a(J, x - it)
          ? (!a(J - it, x) || !a(J + it, x) || !a(J, x + it)) && (Z = it)
          : ((Z = it), (rt = !0));
      const lt = z(e, D, G);
      Z === 99 && (Z = Math.max(4, -lt * t + 0.5));
      const It = Math.min(1, Math.max(0, -lt / 1.4)),
        Ft = 0.5 + 0.5 * Math.sin(G * 2.3 + Jn(D * 0.25, G * 0.4, 5) * 2.2),
        Ot = dt(J, x, 11),
        Xe = Jn(D * 0.6, G * 0.6, 9);
      let Pt = [0, 0, 0];
      const _s = Math.max(0, 0.55 - It) * 0.9 + Ft * 0.18 + Xe * 0.12;
      for (let it = 0; it < 3; it++) {
        const vn = r[it] + (h[it] - r[it]) * _s;
        Pt[it] = vn + (l[it] - vn) * Math.min(1, It * 1.1) + (Ot - 0.5) * 14;
      }
      const Pn = rt && Z <= 3 ? os(e, D, G - Z / t - 0.1) : "rock";
      if (
        (Pn === "silt"
          ? (Pt = [c[0] + (Ot - 0.5) * 10, c[1] + (Ot - 0.5) * 10, c[2] + (Ot - 0.5) * 8])
          : Pn === "sand" &&
            Z <= 2 &&
            (Pt = [d[0] + (Ot - 0.5) * 16, d[1] + (Ot - 0.5) * 14, d[2] + (Ot - 0.5) * 10]),
        (f[ot * 4] = Pt[0]),
        (f[ot * 4 + 1] = Pt[1]),
        (f[ot * 4 + 2] = Pt[2]),
        (f[ot * 4 + 3] = 255),
        Z > m)
      )
        continue;
      const oe = Zs(Z),
        ci = Z <= 1.5 ? 0.55 : Z <= 2.5 ? 0.25 : 0;
      for (let it = 0; it < 3; it++) {
        const vn = Math.min(255, Pt[it] * 1.55 + (it === 0 ? 26 : it === 1 ? 18 : 6));
        p[ot * 4 + it] = vn + (u[it] - vn) * ci;
      }
      p[ot * 4 + 3] = Math.round(255 * oe);
      const Se = $t(e, D, G),
        Xo = b(D, G, Se.x, Se.y, Math.max(0, -lt) + y, J, x);
      if (Xo < 0) continue;
      let di = -1;
      for (let it = g; it <= (m + 1) / t; it += g)
        if (!a(Math.floor((D - Se.x * it) * t), Math.floor((G - Se.y * it - s) * t))) {
          di = it;
          break;
        }
      const jo = di > 0 ? b(D, G, -Se.x, -Se.y, di + y, J, x) : -1;
      let gs = 1,
        Ms = 0;
      if (jo >= 0) {
        const it = di * t;
        ((gs = Math.min(1, Math.max(0, 0.5 + (it - Z) / (2 * _)))),
          (Ms = Math.round(255 * (1 - gs) * (oe > 0 ? Math.min(1, Zs(it) / oe) : 0))));
      }
      (k.push(J), w.push(E(Xo)), L.push(Ms > 0 ? E(jo) : -1), R.push(Math.round(255 * gs)), P.push(Ms));
    }
  }
  T[o] = k.length;
  const v = A.length,
    N = new Float32Array(v),
    O = new Float32Array(v),
    C = new Float32Array(v),
    W = new Float32Array(v);
  for (let x = 0; x < v; x++) {
    const G = A[x],
      J = G % n;
    ((N[x] = (J + 0.5) / t), (O[x] = ((G - J) / n + 0.5) / t + s));
    const ot = ul(e, N[x], O[x]);
    ((C[x] = ot.x), (W[x] = ot.y));
  }
  const V = F.ROCK_SMOOTH_PX,
    K = new Int32Array(v + 1),
    B = [],
    Y = [];
  for (let x = 0; x < v; x++) {
    K[x] = B.length;
    const G = A[x],
      J = G % n,
      ot = (G - J) / n,
      D = B.length;
    let Z = 0;
    for (let rt = -V; rt <= V; rt++)
      for (let lt = -V; lt <= V; lt++) {
        const It = J + lt,
          Ft = ot + rt;
        if (It < 0 || Ft < 0 || It >= n || Ft >= o) continue;
        const Ot = S[Ft * n + It];
        if (Ot < 0) continue;
        const Xe = C[x] * C[Ot] + W[x] * W[Ot];
        if (Xe <= 0) continue;
        const Pt = (V + 1 - Math.abs(lt)) * (V + 1 - Math.abs(rt)) * Xe;
        (B.push(Ot), Y.push(Pt), (Z += Pt));
      }
    for (let rt = D; rt < Y.length; rt++) Y[rt] /= Z;
  }
  return (
    (K[v] = B.length),
    {
      W: n,
      H: o,
      originY: s,
      rock: f,
      edge: p,
      sx: N,
      sy: O,
      snx: C,
      sny: W,
      nbStart: K,
      nbId: Int32Array.from(B),
      nbW: Float32Array.from(Y),
      rowStart: T,
      bi: Int16Array.from(k),
      bf: Int32Array.from(w),
      bb: Int32Array.from(L),
      bwf: Uint8Array.from(R),
      bwb: Uint8Array.from(P),
    }
  );
}
function hd(e) {
  const t = ld(e),
    n = (s) => {
      const i = document.createElement("canvas");
      ((i.width = t.W), (i.height = t.H));
      const a = i.getContext("2d").createImageData(t.W, t.H);
      return (a.data.set(s), i.getContext("2d").putImageData(a, 0, 0), i);
    },
    o = { rock: n(t.rock), edge: n(t.edge), originY: t.originY, data: t };
  return ((t.rock = new Uint8ClampedArray(0)), (t.edge = new Uint8ClampedArray(0)), o);
}
function cd() {
  return {
    frame: 0,
    lit: new Float32Array(0),
    soft: new Float32Array(0),
    litAt: new Int32Array(0),
    softAt: new Int32Array(0),
  };
}
function dd(e, t, n, o, s, i, a, r, l) {
  const h = e.sx.length;
  l.lit.length !== h &&
    ((l.lit = new Float32Array(h)),
    (l.soft = new Float32Array(h)),
    (l.litAt = new Int32Array(h)),
    (l.softAt = new Int32Array(h)),
    (l.frame = 0));
  const c = ++l.frame,
    { lit: d, soft: u, litAt: f, softAt: p } = l,
    {
      sx: m,
      sy: y,
      snx: _,
      sny: g,
      nbStart: S,
      nbId: A,
      nbW: E,
      rowStart: b,
      bi: T,
      bf: k,
      bb: w,
      bwf: L,
      bwb: R,
    } = e,
    P = (N) => (f[N] !== c && ((f[N] = c), (d[N] = t(m[N], y[N], _[N], g[N]))), d[N]),
    v = (N) => {
      if (p[N] !== c) {
        p[N] = c;
        let O = 0;
        for (let C = S[N], W = S[N + 1]; C < W; C++) O += E[C] * P(A[C]);
        u[N] = O;
      }
      return u[N];
    };
  for (let N = 0; N < i; N++) {
    const O = N * r * 4 + 3;
    for (let B = 0; B < s; B++) a[O + B * 4] = 0;
    const C = o + N;
    if (C < 0 || C >= e.H) continue;
    let W = b[C],
      V = b[C + 1];
    for (; W < V; ) {
      const B = (W + V) >> 1;
      T[B] < n ? (W = B + 1) : (V = B);
    }
    const K = b[C + 1];
    for (let B = W; B < K; B++) {
      const Y = T[B] - n;
      if (Y >= s) break;
      let x = 0;
      const G = L[B];
      G > 0 && (x = G * v(k[B]));
      const J = R[B];
      (J > 0 && (x += J * v(w[B])), (a[O + Y * 4] = x));
    }
  }
}
const La = Math.PI / 180;
function fd(e) {
  if (e <= F.DAYLIGHT_FULL_M) return 1;
  const t = Math.min(1, (e - F.DAYLIGHT_FULL_M) / (F.DAYLIGHT_END_M - F.DAYLIGHT_FULL_M));
  return Math.pow(1 - t, F.DAYLIGHT_GAMMA);
}
function ud(e) {
  const t = pl(e),
    { gw: n, gh: o, v: s } = t,
    i = document.createElement("canvas");
  ((i.width = n), (i.height = o));
  const a = new ImageData(n, o);
  for (let r = 0; r < n * o; r++)
    ((a.data[r * 4] = 255),
      (a.data[r * 4 + 1] = 255),
      (a.data[r * 4 + 2] = 255),
      (a.data[r * 4 + 3] = Math.round(255 * Math.min(1, Math.max(0, s[r])))));
  return (i.getContext("2d").putImageData(a, 0, 0), { ...t, canvas: i });
}
function pl(e) {
  const t = F.SKY_CELL_M,
    n = -e.airRows,
    o = Math.ceil(e.w / t),
    s = Math.ceil((F.DAYLIGHT_END_M + 2 - n) / t),
    i = new Float32Array(o * s),
    a = new Uint8Array(o * s),
    r = new Float32Array(o * s).fill(-1),
    l = new Float32Array(o * s),
    h = F.SKY_RAYS,
    c = F.SKY_TILT_DEG * La,
    d = F.SKY_SPREAD_DEG * La;
  for (let y = 0; y < s; y++) {
    const _ = n + (y + 0.5) * t;
    for (let g = 0; g < o; g++) {
      const S = y * o + g,
        A = (g + 0.5) * t;
      if (_ <= 0) {
        ((i[S] = 1), (r[S] = 1), (a[S] = 1));
        continue;
      }
      if (z(e, A, _) < 0.05) continue;
      a[S] = 1;
      const E = fd(_);
      if (((r[S] = 0), E <= 0)) continue;
      l[S] = E;
      let b = 0;
      for (let T = 0; T < h; T++) {
        const k = c + (-d + (2 * d * T) / (h - 1)),
          w = Math.sin(k),
          L = -Math.cos(k),
          R = _ / Math.cos(k);
        Ge(e, A, _, w, L, R) >= R - 0.05 && b++;
      }
      r[S] = b / h;
    }
  }
  const u = 1e9,
    f = new Float32Array(o * s).fill(u);
  for (let y = 0; y < o * s; y++) r[y] > 0 && (f[y] = 0);
  const p = Math.SQRT2 * t;
  for (let y = 0, _ = !0; _ && y < 32; y++) {
    _ = !1;
    for (const g of [1, -1])
      for (let S = 0; S < s; S++) {
        const A = g > 0 ? S : s - 1 - S;
        for (let E = 0; E < o; E++) {
          const b = g > 0 ? E : o - 1 - E,
            T = A * o + b;
          if (r[T] < 0) continue;
          let k = f[T];
          for (let w = -1; w <= 1; w++) {
            const L = A + w;
            if (!(L < 0 || L >= s))
              for (let R = -1; R <= 1; R++) {
                const P = b + R;
                if ((R === 0 && w === 0) || P < 0 || P >= o) continue;
                const v = L * o + P;
                if (r[v] < 0) continue;
                const N = f[v] + (R && w ? p : t);
                N < k && (k = N);
              }
          }
          k < f[T] && ((f[T] = k), (_ = !0));
        }
      }
  }
  for (let y = 0; y < o * s; y++) {
    if (r[y] < 0 || n + (Math.floor(y / o) + 0.5) * t <= 0) continue;
    const _ = f[y] >= u ? 0 : F.SKY_OPEN_MIN * Math.exp(-f[y] / F.SKY_DIFFUSE_M);
    i[y] = l[y] * (_ + (1 - F.SKY_OPEN_MIN) * r[y]);
  }
  for (let y = 0; y < 4; y++) {
    const _ = [];
    for (let g = 0; g < s; g++)
      for (let S = 0; S < o; S++) {
        const A = g * o + S;
        if (a[A]) continue;
        let E = -1;
        for (let b = -1; b <= 1; b++)
          for (let T = -1; T <= 1; T++) {
            const k = S + T,
              w = g + b;
            if (k < 0 || w < 0 || k >= o || w >= s) continue;
            const L = w * o + k;
            a[L] && i[L] > E && (E = i[L]);
          }
        E >= 0 && _.push(A, E);
      }
    for (let g = 0; g < _.length; g += 2) ((i[_[g]] = _[g + 1]), (a[_[g]] = 1));
  }
  const m = new Float32Array(o * s);
  for (let y = 0; y < F.SKY_BLUR; y++) {
    for (let _ = 0; _ < s; _++)
      for (let g = 0; g < o; g++) {
        let S = 0,
          A = 0;
        for (let E = -1; E <= 1; E++) {
          const b = _ + E;
          if (!(b < 0 || b >= s))
            for (let T = -1; T <= 1; T++) {
              const k = g + T;
              k < 0 || k >= o || ((S += i[b * o + k]), A++);
            }
        }
        m[_ * o + g] = S / A;
      }
    i.set(m);
  }
  for (let y = 0; y < s && !(n + (y + 1) * t > 0); y++) for (let _ = 0; _ < o; _++) i[y * o + _] = 1;
  return { cell: t, gw: o, gh: s, y0: n, v: i };
}
function ml(e, t, n) {
  const o = t / e.cell - 0.5,
    s = (n - e.y0) / e.cell - 0.5;
  if (s < 0) return 1;
  if (s >= e.gh - 1) return 0;
  const i = Math.max(0, Math.min(e.gw - 2, Math.floor(o))),
    a = Math.floor(s),
    r = Math.max(0, Math.min(1, o - i)),
    l = s - a,
    h = e.v[a * e.gw + i],
    c = e.v[a * e.gw + i + 1],
    d = e.v[(a + 1) * e.gw + i],
    u = e.v[(a + 1) * e.gw + i + 1];
  return (h + (c - h) * r) * (1 - l) + (d + (u - d) * r) * l;
}
function pd(e) {
  let t = 1 / 0,
    n = -1 / 0;
  for (let o = 0; o < e.w; o++)
    z(e, o + 0.5, 0.5) > 0.2 && mo(e, o + 0.5, 0.5) && ((t = Math.min(t, o)), (n = Math.max(n, o + 1)));
  return Number.isFinite(t) ? { x0: t, x1: n } : { x0: 0, x1: 0 };
}
function md() {
  const n = document.createElement("canvas");
  ((n.width = 48), (n.height = 256));
  const o = new ImageData(48, 256);
  for (let s = 0; s < 256; s++) {
    const i = s / 256,
      a = Math.pow(1 - i, 1.5) * Math.min(1, s / 10);
    for (let r = 0; r < 48; r++) {
      const l = (r + 0.5) / 48 - 0.5,
        h = Math.exp(-(l * l) / 0.035) * a,
        c = (s * 48 + r) * 4;
      ((o.data[c] = 218),
        (o.data[c + 1] = 246),
        (o.data[c + 2] = 255),
        (o.data[c + 3] = Math.round(255 * h)));
    }
  }
  return (n.getContext("2d").putImageData(o, 0, 0), n);
}
function yd(e) {
  const t = document.createElement("canvas");
  ((t.width = e), (t.height = e));
  const n = new ImageData(e, e),
    o = Math.PI * 2;
  for (let s = 0; s < e; s++)
    for (let i = 0; i < e; i++) {
      const a = (i / e) * o,
        r = (s / e) * o,
        l = Math.sin(2 * a + 1.3 * Math.cos(3 * r) + 0.7 * Math.sin(a + 2 * r)),
        h = Math.sin(3 * r - 1.1 * Math.cos(2 * a) + 0.6 * Math.cos(2 * a - r)),
        c = Math.max(0, 1 - Math.min(Math.abs(l), Math.abs(h)) * 3.2),
        d = Math.pow(c, 2.2),
        u = (s * e + i) * 4;
      ((n.data[u] = 255),
        (n.data[u + 1] = 251),
        (n.data[u + 2] = 228),
        (n.data[u + 3] = Math.round(255 * Math.min(1, d))));
    }
  return (t.getContext("2d").putImageData(n, 0, 0), t);
}
const Ra = (e, t, n) => (e < t ? t : e > n ? n : e);
const Ia = (e, t) => e[0] + (e[1] - e[0]) * t;
const Un = Math.PI / 180;
const pn = { x: 0.28, y: 0.03 };
const Oa = 0.13;
const Jt = {
  SHOULDER_R: { x: 0.21, y: -0.3 },
  SHOULDER_L: { x: -0.21, y: -0.3 },
  HEAD: { x: 0, y: -0.575 },
  MOUTH: { x: 0, y: -0.66 },
  REEL: { x: -0.2, y: 0.07 },
};
function _d(e) {
  return Math.max($.KICK_IDLE_RATE, (2 * Math.PI * Math.max(0, e)) / $.KICK_STROKE_M);
}
const yl = (e) => (e.fail.torch === "spare" ? Oa * Zn.SPARE_SCALE : Oa);
function Pa(e, t = null) {
  const n = Math.abs(e) / Un,
    [o, s, i] = le.SECTORS_DEG,
    a = n < o ? 0 : n < s ? 30 : n < i ? 60 : 90;
  if (t === null || a === t) return a;
  const r = le.SECTOR_STICK_DEG,
    l = t === 0 ? -1 / 0 : t === 30 ? o : t === 60 ? s : i,
    h = t === 0 ? o : t === 30 ? s : t === 60 ? i : 1 / 0;
  return n >= l - r && n < h + r ? t : a;
}
function gd(e, t) {
  const n = Math.cos(e),
    o = Math.sin(e);
  return { a: n, b: o, c: -t * o, d: t * n };
}
function Md(e) {
  const t = kn(e);
  if (t.stage === "convulse") {
    const n = j.OX_CONVULSE_M;
    return {
      dx: (Math.random() * 2 - 1) * n,
      dy: (Math.random() * 2 - 1) * n,
      rot: (Math.random() * 2 - 1) * j.OX_CONVULSE_RAD,
    };
  }
  if (t.stage === "struggle" && e.dying) {
    const n = e.dying.total,
      o = t.struggle * Math.min(1, n / 0.4),
      s = j.OX_CONVULSE_M * 0.6 * o;
    return {
      dx: s * Math.sin(n * 13.1) * Math.sin(n * 3.7),
      dy: s * 0.7 * Math.sin(n * 9.3 + 1),
      rot: j.OX_CONVULSE_RAD * 0.5 * o * Math.sin(n * 7.9 + 2),
    };
  }
  return null;
}
const _l = (e) => (e === 90 ? Math.PI / 2 : le.ROLL_60_DEG * Un);
class Sd {
  constructor() {
    M(this, "sector", 0);
    M(this, "hand", 1);
    M(this, "kick", 0);
    M(this, "amp", $.KICK_AMP[0]);
    M(this, "glide", !1);
  }
  update(t, n, o) {
    const s = t.diver,
      i = Pa(We(s.heading), this.sector);
    ((i !== 90 || this.sector !== 90) && (this.hand = s.face), (this.sector = i));
    const a = kn(t),
      r = a.regOut || a.stage === "faint",
      l = Ra(s.effort, 0, 1);
    ((this.glide = Wt(t) && !a.on),
      (this.kick +=
        n *
        (r
          ? 0
          : a.on
            ? Ia([$.KICK_IDLE_RATE, $.KICK_THRASH_RATE], l) * (a.stage === "convulse" ? 1.8 : 1)
            : _d(s.fin))),
      (this.amp += ((r ? 0.3 : Ia($.KICK_AMP, l)) - this.amp) * Math.min(1, o * 4)));
  }
  snap(t) {
    ((this.sector = Pa(We(t.diver.heading))), (this.hand = t.diver.face), (this.glide = Wt(t)));
  }
  get currentSector() {
    return this.sector;
  }
  get mirror() {
    return this.hand;
  }
  kickPhase() {
    if (!this.glide) return this.kick;
    const t = Math.PI * 2,
      n = Math.floor(this.kick / t),
      o = this.kick / t - n,
      s = $.KICK_GLIDE,
      i = (1 - s) * 0.35;
    let a;
    return (
      o < i
        ? (a = (o / i) * Math.PI)
        : o < i + s
          ? (a = Math.PI)
          : (a = Math.PI + ((o - i - s) / (1 - i - s)) * Math.PI),
      n * t + a
    );
  }
  pose(t, n, o, s, i) {
    const a = $.DIVER_SCALE,
      r = n + i.dx,
      l = o + i.dy,
      h = yl(t),
      c = Math.cos(t.diver.aim),
      d = Math.sin(t.diver.aim),
      u = t.diver.heading + i.rot,
      f = gd(u, this.hand),
      p = this.sector,
      m = We(t.diver.heading),
      y = (w, L) => ({ x: r + (f.a * w + f.c * L) * a, y: l + (f.b * w + f.d * L) * a }),
      _ = f.a * c + f.b * d,
      g = f.c * c + f.d * d,
      S = (w, L, R) => {
        let P = 1,
          v = w(L.x, L.y);
        for (const N of [1, 0.8, 0.62, 0.45, 0.3]) {
          P = N;
          const O = $.ARM_M * N + h;
          if (((v = w(L.x + Math.cos(R) * O, L.y + Math.sin(R) * O)), z(s, v.x, v.y) >= 0.05)) break;
        }
        return (z(s, v.x, v.y) < 0.03 && (v = { x: r, y: l }), { reach: P, torch: v });
      },
      A = kn(t).regOut,
      E = {
        x: r,
        y: l,
        sector: p,
        m: f,
        fs: this.hand,
        pitch: m,
        ang: u,
        kick: this.kickPhase(),
        amp: this.amp,
        regOut: A,
      };
    if (p >= 60) {
      const w = _l(p),
        L = (O, C) => y(-C, O),
        R = { x: Pi(w, Jt.SHOULDER_R.x, -0.03), y: Jt.SHOULDER_R.y },
        P = Math.atan2(-_, g),
        { reach: v, torch: N } = S(L, R, P);
      return {
        ...E,
        arm: P,
        reach: v,
        torch: N,
        mouth: L(Pi(w, Jt.MOUTH.x, -0.06), Jt.MOUTH.y),
        reel: L(Pi(w, Jt.REEL.x, -0.05), Jt.REEL.y),
      };
    }
    const b = Ra(Math.atan2(g, _), -2, 2),
      { reach: T, torch: k } = S(y, pn, b);
    return { ...E, arm: b, reach: T, torch: k, mouth: y(0.71, 0.05), reel: y(0.38, 0.19) };
  }
}
function Pi(e, t, n = 0) {
  return t * Math.sin(e) - n * Math.cos(e);
}
function _t(e, t, n, o, s, i) {
  const a = Math.min(i, o / 2, s / 2);
  (e.beginPath(),
    e.moveTo(t + a, n),
    e.arcTo(t + o, n, t + o, n + s, a),
    e.arcTo(t + o, n + s, t, n + s, a),
    e.arcTo(t, n + s, t, n, a),
    e.arcTo(t, n, t + o, n, a),
    e.closePath());
}
function va(e, t, n, o) {
  o.sector >= 60 ? bd(e, t, n, o, _l(o.sector)) : Td(e, t, n, o, o.sector === 30 ? le.STREAMLINE_30 : 0);
}
function Td(e, t, n, o, s) {
  const i = $.DIVER_SCALE * t.zoom,
    a = o.m;
  (e.save(),
    e.setTransform(a.a * i, a.b * i, a.c * i, a.d * i, (o.x - t.ox) * t.zoom, (o.y - t.oy) * t.zoom));
  const { fillOutline: r, limb: l } = gl(e, t, i),
    h = (_) => {
      const g = _ > 0 ? 0 : 0.35,
        S = o.amp * (0.5 - 0.5 * Math.cos(o.kick + g)),
        A = (1 - S) * (1 - s),
        E = _ > 0 ? 0 : -0.07,
        b = { x: -0.4, y: 0.045 + _ * 0.012 },
        T = Math.PI - 0.16 + 0.12 * S + E,
        k = { x: b.x + Math.cos(T) * 0.31, y: b.y + Math.sin(T) * 0.31 },
        w = T + 0.12 + 1.02 * A,
        L = { x: k.x + Math.cos(w) * 0.29, y: k.y + Math.sin(w) * 0.29 },
        R = Math.PI + 0.06 + 0.24 * A + 0.22 * o.amp * Math.sin(o.kick + g) + E * 0.5,
        P = _ < 0;
      l([b, k, L], 0.12, P ? "#18222c" : $.SUIT);
      const v = Math.cos(R),
        N = Math.sin(R),
        O = -N,
        C = v,
        W = 0.46,
        V = { x: L.x + v * W, y: L.y + N * W },
        K = 0.06 * o.amp * Math.cos(o.kick + g) + 0.015;
      (e.beginPath(),
        e.moveTo(L.x + O * 0.055, L.y + C * 0.055),
        e.quadraticCurveTo(
          L.x + v * W * 0.55 + O * (0.08 + K),
          L.y + N * W * 0.55 + C * (0.08 + K),
          V.x + O * 0.09,
          V.y + C * 0.09,
        ),
        e.lineTo(V.x - O * 0.085, V.y - C * 0.085),
        e.quadraticCurveTo(
          L.x + v * W * 0.55 - O * (0.07 - K),
          L.y + N * W * 0.55 - C * (0.07 - K),
          L.x - O * 0.05,
          L.y - C * 0.05,
        ),
        e.closePath(),
        r(P ? "#0b0f13" : $.FIN),
        e.beginPath(),
        e.moveTo(V.x + O * 0.085, V.y + C * 0.085),
        e.lineTo(V.x - O * 0.08, V.y - C * 0.08),
        (e.strokeStyle = P ? "#a8862f" : $.FIN_TIP),
        (e.lineWidth = 0.04),
        e.stroke(),
        e.beginPath(),
        e.arc(L.x, L.y, 0.06, 0, Math.PI * 2),
        r(P ? "#0d1216" : "#151c22"));
    };
  if ((h(-1), n.line.reel === "live")) {
    const _ = Ke(n) <= q.EMPTY_M;
    if (
      (l(
        [
          { x: 0.22, y: 0.06 },
          { x: 0.3, y: 0.15 },
          { x: 0.38, y: 0.19 },
        ],
        0.075,
        "#1a2430",
      ),
      e.beginPath(),
      e.arc(0.4, 0.2, 0.058, 0, Math.PI * 2),
      r("#2a3138"),
      e.beginPath(),
      _)
    ) {
      for (let g = 0; g < 3; g++) {
        const S = (g * Math.PI * 2) / 3 + 0.5;
        (e.moveTo(0.4, 0.2), e.lineTo(0.4 + Math.cos(S) * 0.045, 0.2 + Math.sin(S) * 0.045));
      }
      ((e.strokeStyle = I.amber), (e.lineWidth = 0.014), e.stroke());
    } else (e.arc(0.4, 0.2, 0.034, 0, Math.PI * 2), (e.fillStyle = I.ownLine), e.fill());
  }
  if (n.tanks.find((_) => _.id === "back")?.carried !== !1) {
    const _ = e.createLinearGradient(0, -0.34, 0, -0.11);
    (_.addColorStop(0, $.TANK[0]),
      _.addColorStop(0.4, $.TANK[1]),
      _.addColorStop(1, $.TANK[2]),
      _t(e, -0.41, -0.34, 0.72, 0.225, 0.1),
      r(_),
      e.beginPath(),
      e.moveTo(-0.36, -0.228),
      e.lineTo(0.27, -0.228),
      (e.strokeStyle = "rgba(30,40,48,0.35)"),
      (e.lineWidth = 0.012),
      e.stroke(),
      (e.fillStyle = "#2b333a"),
      e.fillRect(-0.25, -0.34, 0.035, 0.225),
      e.fillRect(0.08, -0.34, 0.035, 0.225),
      _t(e, 0.3, -0.325, 0.075, 0.075, 0.02),
      r($.VALVE),
      _t(e, 0.3, -0.225, 0.065, 0.07, 0.02),
      r($.VALVE));
  }
  {
    const _ = e.createLinearGradient(0, -0.14, 0, 0.18);
    (_.addColorStop(0, $.SUIT_HI),
      _.addColorStop(0.45, $.SUIT),
      _.addColorStop(1, "#1a2530"),
      e.beginPath(),
      e.ellipse(-0.05, 0.022, 0.47, 0.158, 0, 0, Math.PI * 2),
      r(_),
      e.beginPath(),
      e.moveTo(0.2, -0.12),
      e.lineTo(0.13, 0.16),
      (e.strokeStyle = "rgba(8,12,16,0.75)"),
      (e.lineWidth = 0.03),
      e.stroke(),
      _t(e, -0.33, 0.085, 0.17, 0.085, 0.03),
      r("#39424a"));
  }
  h(1);
  let c = 0;
  for (const _ of n.tanks) {
    if (_.id === "back" || !_.carried) continue;
    const g = 0.115 + c * 0.08;
    (_t(e, -0.27, g, 0.62, 0.105, 0.05),
      r(_.id === "deco" ? I.ean50 : I.stage),
      (e.fillStyle = "rgba(255,255,255,0.35)"),
      e.fillRect(-0.22, g + 0.018, 0.48, 0.018),
      _.id === "deco" && ((e.fillStyle = "#5b6a1e"), e.fillRect(0.2, g, 0.03, 0.105)),
      _t(e, 0.34, g + 0.02, 0.06, 0.065, 0.015),
      r($.VALVE),
      c++);
  }
  {
    const _ = e.createRadialGradient(0.49, -0.12, 0.01, 0.52, -0.06, 0.16);
    (_.addColorStop(0, "#3a4b5c"),
      _.addColorStop(1, $.HOOD),
      e.beginPath(),
      e.arc(0.52, -0.06, 0.148, 0, Math.PI * 2),
      r(_),
      _t(e, 0.572, -0.142, 0.13, 0.112, 0.035),
      r($.MASK));
    const g = e.createLinearGradient(0.59, -0.13, 0.69, -0.04);
    (g.addColorStop(0, "#d8f8ff"),
      g.addColorStop(0.45, $.LENS),
      g.addColorStop(1, "#3f8fb0"),
      _t(e, 0.592, -0.126, 0.093, 0.08, 0.025),
      (e.fillStyle = g),
      e.fill(),
      (e.fillStyle = "rgba(255,255,255,0.95)"),
      e.beginPath(),
      e.ellipse(0.618, -0.104, 0.022, 0.011, -0.6, 0, Math.PI * 2),
      e.fill(),
      e.beginPath(),
      e.arc(0.666, -0.062, 0.007, 0, Math.PI * 2),
      e.fill());
  }
  (e.beginPath(),
    e.moveTo(0.34, -0.27),
    o.regOut
      ? e.bezierCurveTo(0.6, -0.3, 0.9, 0.05, 0.74, 0.45)
      : e.bezierCurveTo(0.47, -0.33, 0.74, -0.2, 0.7, 0.02),
    (e.strokeStyle = "#0e1317"),
    (e.lineWidth = 0.03),
    e.stroke(),
    o.regOut ? _t(e, 0.69, 0.43, 0.09, 0.075, 0.02) : _t(e, 0.655, 0, 0.075, 0.075, 0.022),
    r("#2b333a"));
  const d = $.ARM_M * o.reach,
    u = Math.cos(o.arm),
    f = Math.sin(o.arm),
    p = { x: pn.x + u * d, y: pn.y + f * d };
  xo(n) ||
    (e.beginPath(),
    e.moveTo(p.x, p.y),
    e.quadraticCurveTo(0.05, 0.3, -0.25, 0.14),
    (e.strokeStyle = "#0b1014"),
    (e.lineWidth = 0.014),
    e.stroke());
  const y = { x: pn.x + u * d * 0.5 - f * 0.035, y: pn.y + f * d * 0.5 + u * 0.035 };
  (l([pn, y, p], 0.088, $.SUIT), Ml(e, n, r, p, o.arm), e.restore());
}
function gl(e, t, n) {
  ((e.globalAlpha = 1), (e.globalCompositeOperation = "source-over"));
  const o = Math.max(0.008, ($.OUTLINE_PX * t.dpr) / n);
  return (
    (e.lineJoin = "round"),
    (e.lineCap = "round"),
    {
      ol: o,
      fillOutline: (a) => {
        ((e.fillStyle = a), e.fill(), (e.strokeStyle = $.OUTLINE), (e.lineWidth = o), e.stroke());
      },
      limb: (a, r, l) => {
        (e.beginPath(),
          a.forEach((h, c) => (c === 0 ? e.moveTo(h.x, h.y) : e.lineTo(h.x, h.y))),
          (e.strokeStyle = $.OUTLINE),
          (e.lineWidth = r + o * 2),
          e.stroke(),
          (e.strokeStyle = l),
          (e.lineWidth = r),
          e.stroke());
      },
    }
  );
}
const xo = (e) => {
  const t = In(e);
  return t === "spare" || t === "spareHi";
};
function Ml(e, t, n, o, s) {
  const i = In(t),
    a = xo(t),
    r = Math.cos(s),
    l = Math.sin(s),
    h = yl(t),
    c = o.x + r * h,
    d = o.y + l * h,
    u = -l,
    f = r,
    p = a ? 0.024 : 0.03;
  (e.beginPath(),
    e.moveTo(o.x - r * 0.02 + u * p * 0.8, o.y - l * 0.02 + f * p * 0.8),
    e.lineTo(c + u * p * 1.15, d + f * p * 1.15),
    e.lineTo(c - u * p * 1.15, d - f * p * 1.15),
    e.lineTo(o.x - r * 0.02 - u * p * 0.8, o.y - l * 0.02 - f * p * 0.8),
    e.closePath(),
    n(a ? I.amber : $.TORCH),
    e.beginPath(),
    e.moveTo(o.x + r * 0.05 + u * p, o.y + l * 0.05 + f * p),
    e.lineTo(o.x + r * 0.05 - u * p, o.y + l * 0.05 - f * p),
    (e.strokeStyle = "#3a434a"),
    (e.lineWidth = 0.018),
    e.stroke(),
    e.beginPath(),
    e.ellipse(c, d, 0.014, p * 1.05, s, 0, Math.PI * 2),
    (e.fillStyle = i === "dead" ? Zn.DEAD_LENS : $.LENS_GLOW),
    e.fill(),
    e.beginPath(),
    e.arc(o.x, o.y, 0.045, 0, Math.PI * 2),
    n("#151b21"));
}
function bd(e, t, n, o, s) {
  const i = $.DIVER_SCALE * t.zoom,
    a = o.m;
  (e.save(),
    e.setTransform(a.a * i, a.b * i, a.c * i, a.d * i, (o.x - t.ox) * t.zoom, (o.y - t.oy) * t.zoom),
    e.transform(0, 1, -1, 0, 0, 0));
  const { fillOutline: r, limb: l } = gl(e, t, i),
    h = Math.sin(s),
    c = Math.cos(s),
    d = (y, _ = 0) => Pi(s, y, _),
    u = c > 0.3,
    f = (y) => {
      const _ = y > 0 ? 0 : 0.35,
        S = 1 - o.amp * (0.5 - 0.5 * Math.cos(o.kick + _)),
        A = y < 0 && u,
        E = { x: d(y * 0.085), y: 0.16 },
        b = { x: d(y * (0.15 + 0.13 * S), -0.03), y: 0.41 - 0.05 * S },
        T = { x: d(y * (0.09 + 0.15 * S), 0.22 * S), y: 0.66 - 0.07 * S };
      l([E, b, T], 0.12, A ? "#18222c" : $.SUIT);
      const k = Math.PI / 2 - y * (0.12 + 0.38 * S + 0.1 * o.amp * Math.sin(o.kick + _)),
        w = Math.cos(k),
        L = Math.sin(k),
        R = 0.55 * S,
        P = Math.hypot(w, L, R),
        v = (w * h - R * c) / P,
        N = L / P,
        O = Math.hypot(v, N) || 1,
        C = v / O,
        W = N / O,
        V = -W,
        K = C,
        B = 0.44 * O,
        Y = { x: T.x + C * B, y: T.y + W * B };
      (e.beginPath(),
        e.moveTo(T.x + V * 0.05, T.y + K * 0.05),
        e.quadraticCurveTo(
          T.x + C * B * 0.55 + V * 0.09,
          T.y + W * B * 0.55 + K * 0.09,
          Y.x + V * 0.1,
          Y.y + K * 0.1,
        ),
        e.lineTo(Y.x - V * 0.1, Y.y - K * 0.1),
        e.quadraticCurveTo(
          T.x + C * B * 0.55 - V * 0.09,
          T.y + W * B * 0.55 - K * 0.09,
          T.x - V * 0.05,
          T.y - K * 0.05,
        ),
        e.closePath(),
        r(A ? "#0b0f13" : $.FIN),
        e.beginPath(),
        e.moveTo(Y.x + V * 0.095, Y.y + K * 0.095),
        e.lineTo(Y.x - V * 0.095, Y.y - K * 0.095),
        (e.strokeStyle = A ? "#a8862f" : $.FIN_TIP),
        (e.lineWidth = 0.04),
        e.stroke(),
        e.beginPath(),
        e.arc(T.x, T.y, 0.06, 0, Math.PI * 2),
        r(A ? "#0d1216" : "#151c22"));
    };
  (f(-1), f(1));
  const p = (y) => {
    for (const _ of n.tanks) {
      if (_.id === "back" || !_.carried) continue;
      const g = _.id === "stage" ? -1 : 1;
      if ((u && y !== g > 0) || (!u && y)) continue;
      const S = d(g * 0.255, -0.03) - 0.055;
      (_t(e, S, -0.14, 0.11, 0.56, 0.05),
        r(_.id === "deco" ? I.ean50 : I.stage),
        (e.fillStyle = "rgba(255,255,255,0.35)"),
        e.fillRect(S + 0.02, -0.1, 0.018, 0.46),
        _t(e, S + 0.02, -0.2, 0.07, 0.065, 0.015),
        r($.VALVE));
    }
  };
  p(!1);
  const m = () => {
    const y = { x: d(Jt.REEL.x, -0.05), y: Jt.REEL.y };
    (l(
      [{ x: d(Jt.SHOULDER_L.x, -0.03), y: Jt.SHOULDER_L.y }, { x: d(-0.31, -0.02), y: -0.1 }, y],
      0.085,
      u ? "#1a2430" : $.SUIT,
    ),
      n.line.reel === "live" &&
        (e.beginPath(),
        e.arc(y.x, y.y + 0.04, 0.058, 0, Math.PI * 2),
        r("#2a3138"),
        e.beginPath(),
        e.arc(y.x, y.y + 0.04, 0.034, 0, Math.PI * 2),
        (e.fillStyle = Ke(n) <= q.EMPTY_M ? "#2a3138" : I.ownLine),
        e.fill()),
      e.beginPath(),
      e.arc(y.x, y.y, 0.045, 0, Math.PI * 2),
      r("#151b21"));
  };
  u && m();
  {
    const y = Math.hypot(0.235 * h, 0.16 * c) / 0.235,
      _ = e.createLinearGradient(-0.24 * y, 0, 0.24 * y, 0);
    (_.addColorStop(0, $.SUIT_HI),
      _.addColorStop(0.5, $.SUIT),
      _.addColorStop(1, "#1a2530"),
      e.beginPath(),
      e.moveTo(-0.16 * y, 0.2),
      e.quadraticCurveTo(-0.2 * y, -0.05, -0.235 * y, -0.3),
      e.quadraticCurveTo(-0.22 * y, -0.4, -0.1 * y, -0.41),
      e.lineTo(0.1 * y, -0.41),
      e.quadraticCurveTo(0.22 * y, -0.4, 0.235 * y, -0.3),
      e.quadraticCurveTo(0.2 * y, -0.05, 0.16 * y, 0.2),
      e.quadraticCurveTo(0, 0.26, -0.16 * y, 0.2),
      e.closePath(),
      r(_));
  }
  u || m();
  {
    const y = d(Jt.HEAD.x, -0.02),
      _ = Jt.HEAD.y;
    c > 0.05 &&
      (_t(e, y + 0.02 + 0.06 * c, _ - 0.16, 0.1, 0.09, 0.03),
      r($.MASK),
      _t(e, y + 0.035 + 0.06 * c, _ - 0.15, 0.07, 0.06, 0.02),
      (e.fillStyle = $.LENS),
      e.fill());
    const g = e.createRadialGradient(y - 0.03, _ - 0.04, 0.01, y, _, 0.15);
    (g.addColorStop(0, "#3a4b5c"),
      g.addColorStop(1, $.HOOD),
      e.beginPath(),
      e.arc(y, _, 0.135, 0, Math.PI * 2),
      r(g),
      e.beginPath(),
      e.moveTo(y - 0.13 * h, _ - 0.02),
      e.quadraticCurveTo(y, _ + 0.02, y + 0.13, _ - 0.02),
      (e.strokeStyle = "#0c1115"),
      (e.lineWidth = 0.03),
      e.stroke());
  }
  if (n.tanks.find((y) => y.id === "back")?.carried !== !1) {
    for (const _ of [-1, 1]) {
      const g = d(_ * 0.08, 0.17) - 0.07,
        S = e.createLinearGradient(g, 0, g + 0.14, 0);
      (S.addColorStop(0, $.TANK[0]),
        S.addColorStop(0.45, $.TANK[1]),
        S.addColorStop(1, $.TANK[2]),
        _t(e, g, -0.43, 0.14, 0.6, 0.07),
        r(S),
        (e.fillStyle = "#2b333a"),
        e.fillRect(g, -0.27, 0.14, 0.035),
        e.fillRect(g, 0, 0.14, 0.035));
    }
    const y = d(0, 0.17);
    (_t(e, y - 0.115 * h, -0.485, 0.075, 0.065, 0.02),
      r($.VALVE),
      _t(e, y + 0.04 * h, -0.485, 0.075, 0.065, 0.02),
      r($.VALVE),
      e.beginPath(),
      e.moveTo(y - 0.05 * h, -0.455),
      e.lineTo(y + 0.05 * h, -0.455),
      (e.strokeStyle = $.VALVE),
      (e.lineWidth = 0.03),
      e.stroke());
  } else
    ((e.strokeStyle = "rgba(8,12,16,0.8)"),
      (e.lineWidth = 0.035),
      e.beginPath(),
      e.moveTo(d(-0.1, 0.12), -0.4),
      e.lineTo(d(-0.08, 0.12), 0.18),
      e.moveTo(d(0.1, 0.12), -0.4),
      e.lineTo(d(0.08, 0.12), 0.18),
      e.stroke());
  if (o.regOut) {
    const y = d(0.05, 0.17);
    (e.beginPath(),
      e.moveTo(y, -0.47),
      e.bezierCurveTo(y + 0.28, -0.55, d(0.34, 0), -0.2, d(0.3, -0.05), 0.02),
      (e.strokeStyle = "#0e1317"),
      (e.lineWidth = 0.03),
      e.stroke(),
      _t(e, d(0.3, -0.05) - 0.04, 0, 0.08, 0.075, 0.02),
      r("#2b333a"));
  }
  p(!0);
  {
    const y = $.ARM_M * o.reach,
      _ = Math.cos(o.arm),
      g = Math.sin(o.arm),
      S = { x: d(Jt.SHOULDER_R.x, -0.03), y: Jt.SHOULDER_R.y },
      A = { x: S.x + _ * y, y: S.y + g * y };
    xo(n) ||
      (e.beginPath(),
      e.moveTo(A.x, A.y),
      e.quadraticCurveTo(d(0.3, -0.05), 0.1, d(0.12, -0.1), 0.17),
      (e.strokeStyle = "#0b1014"),
      (e.lineWidth = 0.014),
      e.stroke());
    const E = { x: S.x + _ * y * 0.5 + Math.abs(g) * 0.05, y: S.y + g * y * 0.5 };
    (l([S, E, A], 0.088, $.SUIT), Ml(e, n, r, A, o.arm));
  }
  e.restore();
}
function Sl(e) {
  return e === "back"
    ? { L: $.TANK_L_M * 1.12, D: tt.TANK_R_M.back * 2 }
    : { L: $.TANK_L_M, D: $.TANK_D_M };
}
function Ad(e, t, n, o, s, i) {
  const a = Math.cos(o),
    r = Math.sin(o);
  let l = 0;
  for (let h = 0; h <= 12; h++) {
    const c = -s / 2 + (s * h) / 12;
    for (const d of [-i / 2, i / 2]) l = Math.max(l, -z(e, t + a * c - r * d, n + r * c + a * d));
  }
  return l;
}
function Tl(e, t) {
  const { L: n, D: o } = Sl(t.id),
    { x: s, y: i } = t,
    a = (l, h, c, d) => {
      const u = n / 2 - 0.2;
      return {
        cx: l,
        cy: h,
        ang: c,
        hanging: d,
        strip: { x: l + Math.cos(c) * u, y: h + Math.sin(c) * u },
        L: n,
        D: o,
      };
    };
  if (t.falling) return a(s, i, -Math.PI / 2 + 0.75 + 0.18 * Math.sin(t.fallT * 2.4), !1);
  if (t.onLine) {
    const l = i + n / 2 + 0.1;
    if (z(e, s, i + 0.1 + n) >= o * 0.5 && z(e, s, l) >= o * 0.5) return a(s, l, -Math.PI / 2, !0);
    const h = Ge(e, s, i, 0, 1, 2.5);
    return a(
      s,
      i + Math.max(0, h - o / 2 - 0.02),
      z(e, s - 0.6, i) < z(e, s + 0.6, i) ? 0 : Math.PI,
      !1,
    );
  }
  const r = Ed(e, t.id, s, i, n, o);
  return a(s, r.cy, r.ang, !1);
}
const Na = new WeakMap();
function Ed(e, t, n, o, s, i) {
  let a = Na.get(e);
  a || Na.set(e, (a = new Map()));
  const r = `${t}:${n}:${o}`,
    l = a.get(r);
  if (l) return l;
  const h = $t(e, n, o),
    c = $.TANK_LIE_TILT_DEG * Un;
  let d = Math.atan2(h.x, -h.y);
  (d > Math.PI / 2 && (d -= Math.PI),
    d < -Math.PI / 2 && (d += Math.PI),
    (d = Math.max(-c, Math.min(c, d))));
  const u = [d];
  for (let g = 1; g * $.TANK_LIE_STEP_DEG <= 2 * $.TANK_LIE_TILT_DEG; g++)
    for (const S of [d + g * $.TANK_LIE_STEP_DEG * Un, d - g * $.TANK_LIE_STEP_DEG * Un])
      Math.abs(S) <= c + 1e-9 && u.push(S);
  let f = { pen: 1 / 0, cy: o, tilt: d };
  for (let g = 0; g <= $.TANK_LIE_LIFT_M + 1e-9 && f.pen > 0.005; g += 0.01)
    for (const S of u) {
      const A = Ad(e, n, o - g, S, s, i);
      if ((A < f.pen - 0.002 && (f = { pen: A, cy: o - g, tilt: S }), f.pen <= 0.005)) break;
    }
  const p = Math.cos(f.tilt),
    m = Math.sin(f.tilt),
    y =
      z(e, n - p * 0.6, f.cy - m * 0.6) < z(e, n + p * 0.6, f.cy + m * 0.6) ? f.tilt : f.tilt + Math.PI,
    _ = { cy: f.cy, ang: y };
  return (a.size > 64 && a.clear(), a.set(r, _), _);
}
function kd(e, t, n, o, style = {}) {
  const s = Tl(n, o),
    { L: i, D: a } = s,
    r = t.zoom,
    l = Math.max(0.01, ($.OUTLINE_PX * t.dpr) / r);
  (e.save(), (e.lineJoin = "round"), (e.lineCap = "round"));
  const h = s.cx + Math.cos(s.ang) * (i / 2 + 0.03),
    c = s.cy + Math.sin(s.ang) * (i / 2 + 0.03);
  o.onLine &&
    Math.hypot(h - o.x, c - o.y) < 1.2 &&
    ((e.strokeStyle = "#d9dcd6"),
    (e.lineWidth = Math.max(1.2 * t.dpr, 0.025 * r)),
    e.beginPath(),
    e.moveTo((o.x - t.ox) * r, (o.y - t.oy) * r),
    e.lineTo((h - t.ox) * r, (c - t.oy) * r),
    e.stroke());
  const d = Math.cos(s.ang),
    u = Math.sin(s.ang);
  e.setTransform(d * r, u * r, -u * r, d * r, (s.cx - t.ox) * r, (s.cy - t.oy) * r);
  const f = style.bodyColor ?? (o.id === "deco" ? I.ean50 : o.id === "back" ? $.TANK[1] : I.stage),
    p = (_, g) => {
      const S = e.createLinearGradient(0, _ - g / 2, 0, _ + g / 2);
      (S.addColorStop(0, "#ffffff"),
        S.addColorStop(0.18, f),
        S.addColorStop(0.7, f),
        S.addColorStop(1, "#4a5248"),
        _t(e, -i / 2, _ - g / 2, i - 0.07, g, g / 2),
        (e.fillStyle = S),
        e.fill(),
        (e.strokeStyle = $.OUTLINE),
        (e.lineWidth = l),
        e.stroke(),
        (e.fillStyle = Wn[o.mix]),
        e.fillRect(-i / 2 + 0.07, _ - g / 2, 0.05, g),
        (e.fillStyle = "#e4ecef"),
        e.fillRect(i / 2 - 0.2 - 0.025, _ - g / 2, 0.05, g));
    };
  o.id === "back"
    ? (p(-a / 4, a / 2),
      p(a / 4, a / 2),
      (e.fillStyle = "#2b333a"),
      e.fillRect(-i * 0.22, -a / 2, 0.035, a),
      e.fillRect(i * 0.18, -a / 2, 0.035, a),
      _t(e, i / 2 - 0.08, -a * 0.4, 0.1, a * 0.8, 0.02),
      (e.fillStyle = $.VALVE),
      e.fill(),
      e.stroke())
    : (p(0, a),
      _t(e, i / 2 - 0.08, -a * 0.22, 0.1, a * 0.44, 0.02),
      (e.fillStyle = $.VALVE),
      e.fill(),
      e.stroke(),
      e.beginPath(),
      e.arc(i / 2 + 0.03, -a * 0.34, 0.035, 0, Math.PI * 2),
      e.fill(),
      e.stroke());
  const m = style.label ?? String(Math.floor(ye(Bt[o.mix]))),
    y = o.id === "back" ? a / 2 : a;
  return (
    (e.fillStyle = "#111518"),
    (e.font = `800 ${(y * 0.66).toFixed(3)}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`),
    (e.textAlign = "center"),
    (e.textBaseline = "middle"),
    d < -0.1 && e.rotate(Math.PI),
    e.fillText(
      m,
      -0.06 * Math.sign(d || 1),
      (o.id === "back" ? -a / 4 : 0) * Math.sign(d < -0.1 ? -1 : 1) + y * 0.04,
    ),
    e.restore(),
    s
  );
}
const Oe = {
  BURY_M: 0.07,
  BODY: ["#c2b9a3", "#77705f", "#3d3a33"],
  RUST: "#8d4b25",
  STAMP: "#d7cfb6",
  SILT: "176,156,122",
  SILT_A: 0.95,
  DUST_A: 0.35,
};
function Ca(e, t, n, o, s) {
  const { L: i, D: a } = Sl("stage"),
    r = Tl(n, { id: "stage", x: o, y: s - a / 2 - 0.01, onLine: !1, falling: !1, fallT: 0 }),
    l = s - a / 2 + Oe.BURY_M,
    h = t.zoom,
    c = Math.cos(r.ang),
    d = Math.sin(r.ang),
    u = Math.max(0.01, ($.OUTLINE_PX * t.dpr) / h);
  (e.save(),
    (e.lineJoin = "round"),
    (e.lineCap = "round"),
    e.setTransform(c * h, d * h, -d * h, c * h, (o - t.ox) * h, (l - t.oy) * h));
  const [f, p, m] = Oe.BODY;
  ((e.fillStyle = "#4a4740"),
    (e.strokeStyle = $.OUTLINE),
    (e.lineWidth = u),
    _t(e, i / 2 - 0.09, -a * 0.2, 0.12, a * 0.4, 0.02),
    e.fill(),
    e.stroke(),
    e.beginPath(),
    e.arc(i / 2 + 0.035, -a * 0.36, 0.05, 0, Math.PI * 2),
    (e.fillStyle = "#5b574d"),
    e.fill(),
    e.stroke(),
    (e.strokeStyle = "#2b2924"),
    (e.lineWidth = u * 0.8));
  for (let g = 0; g < 3; g++) {
    const S = (g * Math.PI) / 3;
    (e.beginPath(),
      e.moveTo(i / 2 + 0.035 - Math.cos(S) * 0.04, -a * 0.36 - Math.sin(S) * 0.04),
      e.lineTo(i / 2 + 0.035 + Math.cos(S) * 0.04, -a * 0.36 + Math.sin(S) * 0.04),
      e.stroke());
  }
  const y = e.createLinearGradient(0, -a / 2, 0, a / 2);
  (y.addColorStop(0, f),
    y.addColorStop(0.22, p),
    y.addColorStop(0.75, p),
    y.addColorStop(1, m),
    _t(e, -i / 2, -a / 2, i - 0.07, a, a / 2),
    (e.fillStyle = y),
    e.fill(),
    e.save(),
    e.clip(),
    (e.fillStyle = Oe.RUST));
  for (const [g, S, A, E] of [
    [-0.28, 0.13, 0.07, 0.75],
    [-0.05, 0.08, 0.05, 0.6],
    [0.12, 0.16, 0.06, 0.7],
    [-0.36, 0.06, 0.1, 0.55],
  ])
    ((e.globalAlpha = E),
      e.beginPath(),
      e.ellipse(g, -a * 0.12, S / 2, A / 2, 0.2, 0, Math.PI * 2),
      e.fill());
  e.globalAlpha = 1;
  const _ = i / 2 - 0.24;
  ((e.fillStyle = Oe.STAMP),
    e.fillRect(_, -a / 2, 0.07, a),
    (e.strokeStyle = "rgba(40,36,28,0.85)"),
    (e.lineWidth = u * 0.7));
  for (let g = 0; g < 4; g++) {
    const S = -a * 0.36 + g * a * 0.17;
    (e.beginPath(), e.moveTo(_ + 0.015, S), e.lineTo(_ + 0.055, S), e.stroke());
  }
  (e.restore(),
    _t(e, -i / 2, -a / 2, i - 0.07, a, a / 2),
    (e.strokeStyle = $.OUTLINE),
    (e.lineWidth = u),
    e.stroke(),
    e.save(),
    _t(e, -i / 2, -a / 2, i - 0.07, a, a / 2),
    e.clip(),
    (e.fillStyle = `rgba(${Oe.SILT},${Oe.DUST_A})`),
    e.fillRect(-i / 2, -a / 2, i, a * 0.16),
    e.restore(),
    (e.fillStyle = `rgba(${Oe.SILT},${Oe.SILT_A})`),
    e.beginPath(),
    e.moveTo(-i / 2 - 0.22, a / 2 + 0.1),
    e.bezierCurveTo(-i / 2 - 0.1, a * 0.12, -i / 2 + 0.02, -a * 0.1, -i / 2 + 0.12, a * 0),
    e.bezierCurveTo(-i * 0.2, a * 0.06, -i * 0.05, a * 0, i * 0.08, a * 0.05),
    e.bezierCurveTo(i * 0.22, a * 0.09, i / 2 - 0.16, a * 0, i / 2 - 0.08, -a * 0.04),
    e.bezierCurveTo(i / 2, a * 0.12, i / 2 + 0.1, a * 0.3, i / 2 + 0.24, a / 2 + 0.1),
    e.closePath(),
    e.fill(),
    (e.strokeStyle = "rgba(70,58,40,0.35)"),
    (e.lineWidth = u * 0.8),
    e.stroke(),
    e.restore());
}
const be = Math.PI / 180;
function us(e, t) {
  const n = Math.abs(t),
    o = Math.abs(e),
    s = n > o ? n : o;
  if (s === 0) return 0;
  const i = (n > o ? o : n) / s,
    a = i * i;
  let r = ((-0.0464964749 * a + 0.15931422) * a - 0.327622764) * a * i + i;
  return (o > n && (r = Math.PI / 2 - r), t < 0 && (r = Math.PI - r), e < 0 ? -r : r);
}
function ps(e, t) {
  const n = e[0];
  if (t <= n[0]) return n[1];
  for (let o = 1; o < e.length; o++) {
    const s = e[o];
    if (t <= s[0]) {
      const i = e[o - 1];
      return i[1] + ((s[1] - i[1]) * (t - i[0])) / (s[0] - i[0]);
    }
  }
  return e[e.length - 1][1];
}
const bl = [
  [0, 1],
  [F.BEAM_CORE_DEG * be, 1],
  [F.BEAM_MID_DEG * be, F.BEAM_MID_A],
  [F.BEAM_WIDE_DEG * be, F.BEAM_WIDE_A],
  [F.BEAM_HALO_DEG * be, 0],
];
const xa = (e) => ps(bl, Math.abs(e));
const Da = (e) => ps(F.BEAM_FALLOFF, e);
function Do(e, t) {
  const n = (e + t) / (1 + t);
  return n > 0 ? (n < 1 ? n : 1) : 0;
}
function Fo(e, t, n, o, s, i) {
  const a = o - t,
    r = s - n,
    l = Math.sqrt(a * a + r * r);
  if (l < 0.02) return 1;
  const h = a / l,
    c = r / l,
    d = i / l,
    u = F.SHADOW_TAPER;
  let f = 1,
    p = 0.03;
  for (; p < l; ) {
    const m = z(e, t + h * p, n + c * p),
      y = d * p,
      _ = u * (l - p),
      g = y < _ ? y : _;
    if (m < g) {
      const S = g > 1e-4 ? 0.5 + (0.5 * m) / g : m > 0 ? 1 : 0;
      if (S <= 0) return 0;
      S < f && (f = S);
    }
    p += m > 0.25 ? 0.25 : m > 0.03 ? m : 0.03;
  }
  return f * f * (3 - 2 * f);
}
class Ho {
  constructor(t, n, o = F.RAY_GAP_M, s = F.RAY_DEPTH) {
    M(this, "n");
    M(this, "half");
    M(this, "gap");
    M(this, "depth");
    M(this, "ox", 0);
    M(this, "oy", 0);
    M(this, "aim", 0);
    M(this, "range", 0);
    M(this, "count", 0);
    M(this, "step");
    M(this, "cap", 0);
    M(this, "A", new Float64Array(0));
    M(this, "C", new Float64Array(0));
    M(this, "S", new Float64Array(0));
    M(this, "D", new Float64Array(0));
    M(this, "gap2");
    M(this, "ang", 0);
    ((this.n = t),
      (this.half = n),
      (this.gap = o),
      (this.depth = s),
      (this.step = (2 * n) / t),
      (this.gap2 = o * o),
      this.grow(t + 3));
  }
  get mask() {
    return this.D.subarray(0, this.count);
  }
  get angles() {
    return this.A.subarray(0, this.count);
  }
  grow(t) {
    if (t <= this.cap) return;
    const n = Math.max(t, this.cap * 2),
      o = (s) => {
        const i = new Float64Array(n);
        return (i.set(s.subarray(0, this.count)), i);
      };
    ((this.A = o(this.A)),
      (this.C = o(this.C)),
      (this.S = o(this.S)),
      (this.D = o(this.D)),
      (this.cap = n));
  }
  push(t, n, o, s) {
    this.count >= this.cap && this.grow(this.count + 1);
    const i = this.count++;
    ((this.A[i] = t), (this.C[i] = n), (this.S[i] = o), (this.D[i] = s));
  }
  hit(t, n, o) {
    const s = this.range;
    return s <= 0 ? 0 : Math.min(s, Ge(t, this.ox, this.oy, n, o, s) + F.MASK_PEN_M);
  }
  refine(t, n, o, s, i, a, r, l, h, c) {
    if (c >= this.depth) return;
    const d = this.range - 1e-6;
    if (i >= d && h >= d) return;
    const u = r - o,
      f = l - s;
    if (u * u + f * f <= this.gap2) return;
    const p = (n + a) * 0.5,
      m = Math.cos(p),
      y = Math.sin(p),
      _ = this.hit(t, m, y),
      g = m * _,
      S = y * _;
    (this.refine(t, n, o, s, i, p, g, S, _, c + 1),
      this.push(p, m, y, _),
      this.refine(t, p, g, S, _, a, r, l, h, c + 1));
  }
  cast(t, n, o, s, i) {
    ((this.ox = n), (this.oy = o), (this.aim = s), (this.range = i), (this.count = 0));
    const a = s - this.half,
      r = s + this.half,
      l = this.step,
      h = l * 0.02;
    let c = Math.ceil((a + h) / l),
      d = a,
      u = Math.cos(a),
      f = Math.sin(a),
      p = this.hit(t, u, f);
    for (this.push(d, u, f, p); ; ) {
      let m = c * l;
      m > r - h && (m = r);
      const y = Math.cos(m),
        _ = Math.sin(m),
        g = this.hit(t, y, _);
      if ((this.refine(t, d, u * p, f * p, p, m, y * g, _ * g, g, 0), this.push(m, y, _, g), m === r))
        break;
      ((d = m), (u = y), (f = _), (p = g), c++);
    }
  }
  bounds() {
    let t = this.ox,
      n = this.ox,
      o = this.oy,
      s = this.oy;
    for (let i = 0; i < this.count; i++) {
      const a = this.ox + this.C[i] * this.D[i],
        r = this.oy + this.S[i] * this.D[i];
      (a < t && (t = a), a > n && (n = a), r < o && (o = r), r > s && (s = r));
    }
    return { x0: t, y0: o, x1: n, y1: s };
  }
  path(t, n, o, s = -this.half, i = this.half) {
    const a = new Path2D();
    a.moveTo((this.ox - t) * o, (this.oy - n) * o);
    const r = this.aim + s - 1e-9,
      l = this.aim + i + 1e-9;
    for (let h = 0; h < this.count; h++) {
      const c = this.A[h];
      if (c < r || c > l) continue;
      const d = this.D[h];
      a.lineTo((this.ox + this.C[h] * d - t) * o, (this.oy + this.S[h] * d - n) * o);
    }
    return (a.closePath(), a);
  }
  reach(t, n) {
    const o = t - this.ox,
      s = n - this.oy,
      i = o * o + s * s,
      a = this.range;
    if (i >= a * a || this.count < 2) return -1;
    let r = us(s, o) - this.aim;
    if (
      (r > Math.PI ? (r -= Math.PI * 2) : r < -Math.PI && (r += Math.PI * 2),
      r <= -this.half || r >= this.half)
    ) {
      if (this.half < Math.PI) return -1;
      r = Math.max(-this.half, Math.min(this.half, r));
    }
    this.ang = r;
    const l = this.aim + r,
      h = this.A;
    let c = 0,
      d = this.count - 1;
    for (; d - c > 1; ) {
      const g = (c + d) >> 1;
      h[g] <= l ? (c = g) : (d = g);
    }
    const u = this.C[c] * this.D[c],
      f = this.S[c] * this.D[c],
      p = this.C[d] * this.D[d],
      m = this.S[d] * this.D[d],
      y = p - u,
      _ = m - f;
    return o * _ - s * y > u * m - f * p + 1e-12 ? -1 : Math.sqrt(i);
  }
}
class wd extends Ho {
  constructor(n = F.RAY_GAP_M, o = F.RAY_DEPTH) {
    super(F.BEAM_RAYS, F.BEAM_HALO_DEG * be, n, o);
    M(this, "gain", 1);
    this.range = F.BEAM_RANGE_M;
  }
  compute(n, o, s, i, a = F.BEAM_RANGE_M, r = 1) {
    ((this.gain = r), this.cast(n, o, s, i, a));
  }
  at(n, o) {
    const s = this.reach(n, o);
    return s < 0 ? 0 : xa(this.ang) * Da(Math.min(1, s / this.range)) * this.gain;
  }
  onRock(n, o, s, i, a) {
    const r = this.range;
    if (r <= 0 || this.gain <= 0) return 0;
    const l = o - this.ox,
      h = s - this.oy,
      c = l * l + h * h;
    if (c >= r * r) return 0;
    let d = us(h, l) - this.aim;
    if (
      (d > Math.PI ? (d -= Math.PI * 2) : d < -Math.PI && (d += Math.PI * 2),
      d <= -this.half || d >= this.half)
    )
      return 0;
    const u = Math.sqrt(c),
      f = xa(d) * Da(u / r) * this.gain * Do(-(l * i + h * a) / Math.max(u, 0.001), F.ROCK_WRAP_BEAM);
    return f < 1 / 512 ? 0 : f * Fo(n, o, s, this.ox, this.oy, F.SHADOW_SRC_BEAM_M);
  }
}
class Al extends Ho {
  constructor() {
    super(F.GLOW_RAYS, Math.PI);
    M(this, "r", 0);
    M(this, "a", 0);
  }
  compute(n, o, s, i, a) {
    ((this.r = i), (this.a = a), this.cast(n, o, s, 0, a > 0 ? i : 0));
  }
  at(n, o) {
    if (this.a <= 0) return 0;
    const s = this.reach(n, o);
    return s < 0 ? 0 : this.a * Wa(s / this.r);
  }
  onRock(n, o, s, i, a) {
    if (this.a <= 0) return 0;
    const r = this.r * F.GLOW_EDGE_K,
      l = o - this.ox,
      h = s - this.oy,
      c = l * l + h * h;
    if (c >= r * r) return 0;
    const d = Math.sqrt(c),
      u = this.a * Wa(d / r) * Do(-(l * i + h * a) / Math.max(d, 0.001), F.ROCK_WRAP_GLOW);
    return u < 1 / 512 ? 0 : u * Fo(n, o, s, this.ox, this.oy, F.SHADOW_SRC_GLOW_M);
  }
  fill(n, o, s, i, a, r = this.a) {
    this.a <= 0 ||
      r <= 0 ||
      ((n.fillStyle = mn(n, (this.ox - o) * i, (this.oy - s) * i, this.r * i, a, r)),
      n.fill(this.path(o, s, i)));
  }
}
function Ld(e, t, n, o, s, i = "255,255,255", a = t.gain) {
  El(e, t, bl, F.BEAM_FALLOFF, n, o, s, i, a);
}
function El(e, t, n, o, s, i, a, r, l) {
  const h = e.canvas.width,
    c = e.canvas.height;
  (e.setTransform(1, 0, 0, 1, 0, 0),
    (e.globalAlpha = 1),
    (e.globalCompositeOperation = "source-over"),
    e.clearRect(0, 0, h, c));
  const d = (t.ox - s) * a,
    u = (t.oy - i) * a;
  if (typeof e.createConicGradient == "function") {
    const m = e.createConicGradient(t.aim - Math.PI, d, u),
      y = (_, g) => {
        m.addColorStop(Math.min(1, Math.max(0, 0.5 + _ / (Math.PI * 2))), `rgba(${r},${g})`);
      };
    for (let _ = n.length - 1; _ >= 0; _--) y(-n[_][0], n[_][1]);
    for (let _ = 1; _ < n.length; _++) y(n[_][0], n[_][1]);
    ((e.fillStyle = m), e.fill(t.path(s, i, a)));
  } else {
    e.globalCompositeOperation = "lighter";
    let m = 0;
    for (let y = n.length - 2; y >= 0; y--) {
      const _ = Math.max(n[y + 1][0] * 0.5 + n[y][0] * 0.5, 0.001),
        g = n[y][1];
      ((e.fillStyle = `rgba(${r},${Math.max(0, g - m)})`), e.fill(t.path(s, i, a, -_, _)), (m = g));
    }
    e.globalCompositeOperation = "source-over";
  }
  e.globalCompositeOperation = "destination-in";
  const f = t.range * a,
    p = e.createRadialGradient(d, u, 0, d, u, f);
  for (const [m, y] of o) p.addColorStop(m, `rgba(255,255,255,${y * Math.max(0, Math.min(1, l))})`);
  ((e.fillStyle = p), e.fillRect(0, 0, h, c), (e.globalCompositeOperation = "source-over"));
}
const kl = [
  [0, 1],
  [Q.FLASH_FLAT_DEG * be, 1],
  [(Q.FLASH_CONE_DEG / 2) * be, Q.FLASH_EDGE_A],
  [Q.FLASH_HALF_MAX_DEG * be, 0],
];
const Fa = (e) => ps(kl, Math.abs(e));
const Ha = (e) => ps(Q.FLASH_FALLOFF, e);
class Rd extends Ho {
  constructor() {
    super(Q.FLASH_RAYS, Q.FLASH_HALF_MAX_DEG * be);
  }
  compute(t, n, o, s, i = Q.FLASH_RANGE_M) {
    this.cast(t, n, o, s, i);
  }
  at(t, n) {
    const o = this.reach(t, n);
    return o < 0 ? 0 : Fa(this.ang) * Ha(Math.min(1, o / this.range));
  }
  onRock(t, n, o, s, i) {
    const a = this.range;
    if (a <= 0) return 0;
    const r = n - this.ox,
      l = o - this.oy,
      h = r * r + l * l;
    if (h >= a * a) return 0;
    let c = us(l, r) - this.aim;
    if (
      (c > Math.PI ? (c -= Math.PI * 2) : c < -Math.PI && (c += Math.PI * 2),
      c <= -this.half || c >= this.half)
    )
      return 0;
    const d = Math.sqrt(h),
      u = Fa(c) * Ha(d / a) * Do(-(r * s + l * i) / Math.max(d, 0.001), F.ROCK_WRAP_BEAM);
    return u < 1 / 512 ? 0 : u * Fo(t, n, o, this.ox, this.oy, F.SHADOW_SRC_BEAM_M);
  }
}
class Id {
  constructor() {
    M(this, "cone", new Rd());
    M(this, "glow", new Al());
    M(this, "k", 0);
    M(this, "ready", !1);
  }
  compute(t, n, o, s) {
    (this.cone.compute(t, n, o, s),
      this.glow.compute(t, n, o, Q.FLASH_GLOW_R_M, Q.FLASH_GLOW_A),
      (this.ready = !0));
  }
  at(t, n) {
    if (!this.ready) return 0;
    const o = this.cone.at(t, n),
      s = this.glow.at(t, n);
    return 1 - (1 - o) * (1 - s);
  }
  onRock(t, n, o, s, i) {
    return this.ready
      ? Math.min(1, this.cone.onRock(t, n, o, s, i) + F.GLOW_EDGE_A * this.glow.onRock(t, n, o, s, i))
      : 0;
  }
  bounds() {
    const t = this.cone.bounds(),
      n = this.glow.bounds();
    return {
      x0: Math.min(t.x0, n.x0),
      y0: Math.min(t.y0, n.y0),
      x1: Math.max(t.x1, n.x1),
      y1: Math.max(t.y1, n.y1),
    };
  }
  fill(t, n, o, s, i) {
    (El(t, this.cone, kl, Q.FLASH_FALLOFF, n, o, s, Q.FLASH_RGB, i),
      (t.globalCompositeOperation = "lighter"),
      this.glow.fill(t, n, o, s, Q.FLASH_RGB, this.glow.a * i),
      (t.globalCompositeOperation = "source-over"));
  }
}
function mn(e, t, n, o, s, i) {
  const a = e.createRadialGradient(t, n, 0, t, n, Math.max(0.001, o));
  return (
    a.addColorStop(0, `rgba(${s},${i})`),
    a.addColorStop(0.3, `rgba(${s},${i * 0.72})`),
    a.addColorStop(0.6, `rgba(${s},${i * 0.3})`),
    a.addColorStop(1, `rgba(${s},0)`),
    a
  );
}
function Wa(e) {
  return e >= 1
    ? 0
    : e <= 0.3
      ? 1 - (0.28 * e) / 0.3
      : e <= 0.6
        ? 0.72 - (0.42 * (e - 0.3)) / 0.3
        : 0.3 - (0.3 * (e - 0.6)) / 0.4;
}
function Wo(e) {
  const t = F.DARK_COLORS,
    n = (s) => {
      const i = parseInt(s.slice(1), 16);
      return [(i >> 16) & 255, (i >> 8) & 255, i & 255];
    };
  let o = t[0];
  for (const s of t) {
    if (e <= s[0]) {
      if (s === o) return n(s[1]);
      const i = (e - o[0]) / (s[0] - o[0]),
        a = n(o[1]),
        r = n(s[1]);
      return [0, 1, 2].map((l) => Math.round(a[l] + (r[l] - a[l]) * i));
    }
    o = s;
  }
  return n(t[t.length - 1][1]);
}
