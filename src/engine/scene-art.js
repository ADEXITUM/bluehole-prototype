class Od {
  constructor() {
    M(this, "n", j.SHADE_RAYS);
    M(this, "dr", j.SHADE_STEP_M);
    M(this, "m", Math.ceil(j.SHADE_MAX_M / j.SHADE_STEP_M) + 1);
    M(this, "tauD", new Float32Array(this.n * this.m));
    M(this, "tauF", new Float32Array(this.n * this.m));
    M(this, "kTab", new Float32Array(this.n * this.m));
    M(this, "cos", new Float32Array(this.n));
    M(this, "sin", new Float32Array(this.n));
    M(this, "col", new Float32Array(this.n));
    M(this, "pre", new Float32Array(this.n + 1));
    M(this, "active", !1);
    M(this, "envTau", 0);
    M(this, "ox", 0);
    M(this, "oy", 0);
    M(this, "imgs", {});
    M(this, "img", { x0: 0, y0: 0, ppm: j.SHADE_PPM, w: 0, h: 0 });
    M(this, "ci0", 0);
    M(this, "ci1", 0);
    M(this, "ck0", 0);
    M(this, "cu", 0);
    M(this, "cv", 0);
    M(this, "t2", { td: 1, tf: 1 });
    for (let t = 0; t < this.n; t++) {
      const n = (t / this.n) * Math.PI * 2;
      ((this.cos[t] = Math.cos(n)), (this.sin[t] = Math.sin(n)));
    }
  }
  compute(t, n, o, s) {
    ((this.ox = o), (this.oy = s), (this.active = !1));
    const { n: i, m: a, dr: r, tauD: l, tauF: h, kTab: c } = this,
      d = (a - 1) * r;
    if (t.bx1 < t.bx0) return;
    const u = U.CELL_M,
      f = (t.bx0 - 1) * u,
      p = (t.bx1 + 2) * u,
      m = (t.by0 - 1) * u,
      y = (t.by1 + 2) * u;
    if (p < o - d || f > o + d || y < s - d || m > s + d) return;
    let _ = !1;
    for (let w = 0; w < i; w++) {
      const L = this.cos[w],
        R = this.sin[w];
      let P = 0,
        v = d;
      const N = (W, V, K, B) => {
        if (Math.abs(V) < 1e-9) {
          (W < K || W > B) && (v = -1);
          return;
        }
        let Y = (K - W) / V,
          x = (B - W) / V;
        (Y > x && ([Y, x] = [x, Y]), (P = Math.max(P, Y)), (v = Math.min(v, x)));
      };
      (N(o, L, f, p), N(s, R, m, y));
      const O = w * a;
      ((l[O] = 0), (c[O] = 0));
      let C = 0;
      for (let W = 1; W < a; W++) {
        const V = W * r;
        let K = 0;
        if (V > P && V - r < v) {
          const B = V - r * 0.5;
          ((K = bo(Qn(t, o + L * B, s + R * B))), K > 0 && (_ = !0));
        }
        ((c[O + W] = K), (C += K * r), (l[O + W] = C));
      }
    }
    if (((this.active = _), !_)) return;
    const g = Math.min(a - 1, Math.round(j.SHADE_ENV_M / r));
    let S = 0,
      A = 0;
    for (let w = 0; w < i; w++) {
      const L = Ge(n, o, s, this.cos[w], this.sin[w], j.SHADE_ENV_M) / j.SHADE_ENV_M + 0.001;
      ((S += Math.exp(-l[w * a + g]) * L), (A += L));
    }
    const E = -Math.log(Math.max(1e-6, S / A));
    this.envTau = E;
    const b = Math.exp(-r / j.SHADE_LEAK_M);
    for (let w = 0; w < i; w++) {
      const L = w * a;
      h[L] = 0;
      let R = 0;
      for (let P = 1; P < a; P++) ((R += c[L + P] * r), R > E && (R = E + (R - E) * b), (h[L + P] = R));
    }
    const T = this.col,
      k = this.pre;
    for (let w = 1; w < a; w++) {
      const L = Math.min(i >> 4, Math.round(j.SHADE_PENUMBRA_M / ((w * r * Math.PI * 2) / i)));
      if (L < 1) continue;
      for (let v = 0; v < i; v++) T[v] = h[v * a + w];
      k[0] = 0;
      for (let v = 0; v < i; v++) k[v + 1] = k[v] + T[v];
      const R = k[i],
        P = 2 * L + 1;
      for (let v = 0; v < i; v++) {
        const N = v - L,
          O = v + L + 1;
        let C = 0;
        (N < 0 ? (C = k[O] + (R - k[i + N])) : O > i ? (C = R - k[N] + k[O - i]) : (C = k[O] - k[N]),
          (h[v * a + w] = C / P));
      }
    }
  }
  place(t, n) {
    const o = t - this.ox,
      s = n - this.oy;
    let i = (us(s, o) / (Math.PI * 2)) * this.n;
    i < 0 && (i += this.n);
    const a = Math.floor(i);
    ((this.ci0 = (a % this.n) * this.m), (this.ci1 = ((a + 1) % this.n) * this.m), (this.cu = i - a));
    const r = Math.min(this.m - 1, Math.sqrt(o * o + s * s) / this.dr);
    ((this.ck0 = Math.min(this.m - 2, Math.floor(r))), (this.cv = r - this.ck0));
  }
  sample(t) {
    const n = this.ck0,
      o = this.cv,
      s = t[this.ci0 + n],
      i = t[this.ci1 + n],
      a = s + (t[this.ci0 + n + 1] - s) * o,
      r = i + (t[this.ci1 + n + 1] - i) * o;
    return a + (r - a) * this.cu;
  }
  look(t, n, o) {
    return this.active ? (this.place(n, o), this.sample(t)) : 0;
  }
  depth(t, n) {
    return this.look(this.tauF, t, n);
  }
  depthBeam(t, n) {
    return this.look(this.tauD, t, n);
  }
  both(t, n) {
    return (
      this.active
        ? (this.place(t, n),
          (this.t2.td = Math.exp(-this.sample(this.tauD))),
          (this.t2.tf = Math.exp(-this.sample(this.tauF))))
        : ((this.t2.td = 1), (this.t2.tf = 1)),
      this.t2
    );
  }
  at(t, n) {
    return this.active ? Math.exp(-this.depth(t, n)) : 1;
  }
  beamAt(t, n) {
    return this.active ? Math.exp(-this.depthBeam(t, n)) : 1;
  }
  nearLoss(t, n, o) {
    if (!this.active) return 0;
    const s = Math.max(1, Math.min(this.m - 1, Math.round(o / this.dr)));
    let i = 0,
      a = 0;
    for (let r = 0; r < this.n; r++) {
      let l = (r / this.n) * Math.PI * 2 - t;
      ((l = Math.atan2(Math.sin(l), Math.cos(l))),
        !(Math.abs(l) > n) && ((i += 1 - Math.exp(-this.tauD[r * this.m + s])), a++));
    }
    return a ? i / a : 0;
  }
  scatter(t, n) {
    return this.active ? Math.exp(-this.depthBeam(t, n) * j.SILT_SCATTER_Q) : 1;
  }
  paint(t) {
    if (!this.active) return;
    const n = j.SHADE_PPM,
      o = t.ox - 1 / n,
      s = t.oy - 1 / n,
      i = Math.ceil((t.W / t.zoom) * n) + 2,
      a = Math.ceil((t.H / t.zoom) * n) + 2,
      l = ["occ", "beam", "sc"].map((f) => {
        let p = this.imgs[f];
        (p || (this.imgs[f] = p = document.createElement("canvas")),
          (p.width !== i || p.height !== a) && ((p.width = i), (p.height = a)));
        const m = p.getContext("2d");
        return { cx: m, d: m.createImageData(i, a) };
      });
    this.img = { x0: o, y0: s, ppm: n, w: i, h: a };
    const [h, c, d] = l.map((f) => f.d.data),
      u = j.SILT_SCATTER_Q;
    for (let f = 0; f < a; f++) {
      const p = s + (f + 0.5) / n,
        [m, y, _] = Wo(p);
      for (let g = 0; g < i; g++) {
        const S = (f * i + g) * 4;
        ((h[S] = m), (h[S + 1] = y), (h[S + 2] = _), this.place(o + (g + 0.5) / n, p));
        const A = this.sample(this.tauF),
          E = this.sample(this.tauD);
        (A > 1e-4 && (h[S + 3] = Math.round(255 * (1 - Math.exp(-A)))),
          E > 1e-4 &&
            ((c[S + 3] = Math.round(255 * (1 - Math.exp(-E)))),
            (d[S + 3] = Math.round(255 * (1 - Math.exp(-E * u))))));
      }
    }
    for (const f of l) f.cx.putImageData(f.d, 0, 0);
  }
  draw(t, n, o, s, i) {
    const a = this.imgs[n];
    if (!this.active || !a) return;
    const { x0: r, y0: l, ppm: h, w: c, h: d } = this.img,
      u = i / h,
      f = t.imageSmoothingEnabled;
    ((t.imageSmoothingEnabled = !0),
      t.drawImage(a, 0, 0, c, d, (r - o) * i, (l - s) * i, c * u, d * u),
      (t.imageSmoothingEnabled = f));
  }
}
const Ut = (e, t) => (t - e.ox) * e.ppm;
const Vt = (e, t) => (t - e.oy) * e.ppm;
const Ct = (e, t, n = 1) => Math.max(n * e.dpr, t * e.ppm);
function Pd(e, t) {
  if (!t.laid.length) return;
  const n = e.ctx;
  (n.save(), (n.lineCap = "round"), (n.lineJoin = "round"));
  for (const o of t.laid)
    o.pts.length < 2 ||
      (n.beginPath(),
      o.pts.forEach((s, i) =>
        i === 0 ? n.moveTo(Ut(e, s.x), Vt(e, s.y)) : n.lineTo(Ut(e, s.x), Vt(e, s.y)),
      ),
      (n.strokeStyle = "rgba(40,20,4,0.5)"),
      (n.lineWidth = Ct(e, 0.06, 2.4)),
      n.stroke(),
      (n.globalAlpha = q.LAID_A),
      (n.strokeStyle = I.ownLine),
      (n.lineWidth = Ct(e, 0.035, 1.5)),
      n.stroke(),
      (n.globalAlpha = 1),
      o.pts.forEach((s, i) => {
        if (An(o, i)) return;
        const a = Ct(e, i === 0 ? 0.07 : 0.055, 2.1);
        (n.beginPath(),
          n.arc(Ut(e, s.x), Vt(e, s.y), a, 0, Math.PI * 2),
          (n.fillStyle = I.ownKnot),
          (n.globalAlpha = q.LAID_A),
          n.fill(),
          (n.globalAlpha = 1),
          (n.strokeStyle = "rgba(40,20,4,0.8)"),
          (n.lineWidth = Math.max(1, 0.012 * e.ppm)),
          n.stroke());
      }));
  n.restore();
}
function vd(e, t, n, o = 0, s = 0) {
  const i = t.line,
    a = e.ctx;
  if ((a.save(), (a.lineCap = "round"), (a.lineJoin = "round"), i.pts.length)) {
    const r = i.reel === "live" ? [...i.pts, ...i.run.map((c) => ({ x: c.x, y: c.y }))] : i.pts;
    let l = i.reel === "live" ? [...r, n] : r;
    const h = r[r.length - 1];
    if (i.reel === "live" && o > 0.002) {
      const c = n.x - h.x,
        d = n.y - h.y,
        u = Math.hypot(c, d) || 1,
        f = -d / u,
        p = c / u,
        m = [],
        y = 24;
      for (let _ = 1; _ <= y; _++) {
        const g = _ / y,
          S = o * Math.sin(Math.PI * g) * Math.pow(g, 2) * Math.sin(g * Math.PI * 6 - s * 60);
        m.push({ x: h.x + c * g + f * S, y: h.y + d * g + p * S });
      }
      l = [...r, ...m];
    }
    (l.length >= 2 &&
      (a.beginPath(),
      l.forEach((c, d) =>
        d === 0 ? a.moveTo(Ut(e, c.x), Vt(e, c.y)) : a.lineTo(Ut(e, c.x), Vt(e, c.y)),
      ),
      (a.strokeStyle = "rgba(40,20,4,0.55)"),
      (a.lineWidth = Ct(e, 0.06, 2.4)),
      a.stroke(),
      (a.strokeStyle = I.ownLine),
      (a.lineWidth = Ct(e, 0.035, 1.5)),
      a.stroke()),
      i.pts.forEach((c, d) => {
        if (An(i, d)) return;
        const u = Ut(e, c.x),
          f = Vt(e, c.y);
        if (
          ((a.fillStyle = I.ownKnot),
          (a.strokeStyle = "rgba(40,20,4,0.8)"),
          (a.lineWidth = Math.max(1, 0.012 * e.ppm)),
          d === 0)
        ) {
          const p = Ct(e, 0.075, 2.6);
          (a.beginPath(), a.arc(u, f, p, 0, Math.PI * 2), a.fill(), a.stroke());
        } else {
          const p = Ct(e, 0.06, 2.2);
          (a.beginPath(),
            a.ellipse(u, f + p * 0.6, p * 2.1, p * 0.75, 0, 0, Math.PI * 2),
            (a.strokeStyle = I.ownLine),
            (a.lineWidth = Ct(e, 0.03, 1.3)),
            a.stroke(),
            a.beginPath(),
            a.arc(u, f, p, 0, Math.PI * 2),
            (a.fillStyle = I.ownKnot),
            a.fill(),
            (a.strokeStyle = "rgba(40,20,4,0.8)"),
            (a.lineWidth = Math.max(1, 0.012 * e.ppm)),
            a.stroke());
        }
      }));
  }
  (i.cut && i.pts.length && Cd(e, i.pts[i.pts.length - 1]), a.restore());
  for (const r of t.arrows) r.own && Bo(e, r.x, r.y, r.dx, r.dy, I.ownArrow);
}
function Nd(e, t, n) {
  const o = [],
    s = e[t],
    i = (l, h) => {
      const c = [];
      let d = 0,
        u = s;
      for (let f = l; f >= 0 && f < e.length && d < n; f += h) {
        const p = e[f],
          m = Math.hypot(p.x - u.x, p.y - u.y);
        if (m < 1e-6) continue;
        const y = -(p.y - u.y) / m,
          _ = (p.x - u.x) / m;
        for (let g = 0.1; g <= 1.0001; g += 0.1) {
          const S = d + m * g;
          if (S > n) break;
          c.push({ p: { x: u.x + (p.x - u.x) * g, y: u.y + (p.y - u.y) * g }, d: S, nx: y, ny: _ });
        }
        ((d += m), (u = p));
      }
      return c;
    },
    a = i(t - 1, -1).reverse(),
    r = i(t + 1, 1);
  return (o.push(...a, { p: s, d: 0, nx: 0, ny: 0 }, ...r), o);
}
function Ba(e, t, n, o, s, i = 0, a = "under") {
  for (const r of t.fail.list) {
    if (r.kind !== "entangle" || (r.phase !== "warn" && r.phase !== "active")) continue;
    const l = e.ctx,
      h = r.line === "explorer" ? I.oldLineLit : I.ownLine,
      c = r.phase === "active",
      d = j.TANGLE_SHAKE_M * (c ? 0.6 : 1) + j.TANGLE_SHAKE_M * 1.5 * i,
      u = Math.sin(s * Math.PI * 2 * j.TANGLE_SHAKE_HZ);
    (l.save(), (l.lineCap = "round"), (l.lineJoin = "round"));
    const f = (R, P, v) => {
        R.length < 2 ||
          (l.beginPath(),
          R.forEach((N, O) =>
            O === 0 ? l.moveTo(Ut(e, N.x), Vt(e, N.y)) : l.lineTo(Ut(e, N.x), Vt(e, N.y)),
          ),
          (l.strokeStyle = "rgba(20,12,4,0.6)"),
          (l.lineWidth = Ct(e, P * 1.8, v + 1.2)),
          l.stroke(),
          (l.strokeStyle = h),
          (l.lineWidth = Ct(e, P, v)),
          l.stroke());
      },
      p =
        r.line === "own"
          ? t.line.pts
          : r.line === "explorer"
            ? (n.olds.find((R) => R.pts.some((P) => Math.hypot(P.x - r.x, P.y - r.y) < 1e-6))?.pts ??
              n.explorer)
            : null;
    if (a === "under" && p && p.length >= 2) {
      let R = 0,
        P = 1 / 0;
      p.forEach((O, C) => {
        const W = Math.hypot(O.x - r.x, O.y - r.y);
        W < P && ((P = W), (R = C));
      });
      const v = j.TANGLE_SPAN_M,
        N = Nd(p, R, v).map((O) => {
          const C = Math.sin((Math.PI * O.d) / v) * d * u;
          return { x: O.p.x + O.nx * C, y: O.p.y + O.ny * C };
        });
      f(N, 0.032, 1.4);
    }
    if (a === "under") {
      l.restore();
      continue;
    }
    const m = $.DIVER_SCALE,
      y = o.m,
      _ = (R, P) => ({ x: o.x + (y.a * R + y.c * P) * m, y: o.y + (y.b * R + y.d * P) * m }),
      g = _(0.2, -0.17),
      S = _(-0.72, 0.02),
      A = c ? g : Math.hypot(S.x - r.x, S.y - r.y) < Math.hypot(g.x - r.x, g.y - r.y) ? S : g,
      E = A.x - r.x,
      b = A.y - r.y,
      T = Math.hypot(E, b) || 1,
      k = -b / T,
      w = E / T,
      L = [];
    for (let R = 0; R <= 16; R++) {
      const P = R / 16,
        v =
          Math.sin(Math.PI * P) *
          (d * 0.8 * Math.sin(s * Math.PI * 2 * j.TANGLE_SHAKE_HZ * 1.3 + P * 5) + (c ? 0 : 0.05));
      L.push({ x: r.x + E * P + k * v, y: r.y + b * P + w * v });
    }
    if ((f(L, 0.028, 1.3), c)) {
      const R = [
        [0.18, -0.08, 1],
        [-0.12, 0.02, 0.9],
        [-0.5, 0.06, 0.8],
      ];
      for (let P = 0; P < Math.min(j.TANGLE_LOOPS, R.length); P++) {
        const [v, N, O] = R[P],
          C = _(v, N),
          W = j.TANGLE_LOOP_R_M * O * m;
        (l.beginPath(),
          l.ellipse(
            Ut(e, C.x),
            Vt(e, C.y),
            W * 0.42 * e.ppm,
            W * e.ppm,
            o.ang + (P - 1) * 0.25 * Math.sign(o.fs || 1) + u * 0.04,
            0,
            Math.PI * 2,
          ),
          (l.strokeStyle = "rgba(20,12,4,0.6)"),
          (l.lineWidth = Ct(e, 0.05, 2.6)),
          l.stroke(),
          (l.strokeStyle = h),
          (l.lineWidth = Ct(e, 0.026, 1.4)),
          l.stroke());
      }
    }
    (l.beginPath(),
      l.arc(Ut(e, r.x), Vt(e, r.y), Ct(e, 0.065, 2.4), 0, Math.PI * 2),
      (l.fillStyle = I.ownKnot),
      l.fill(),
      (l.strokeStyle = "rgba(40,20,4,0.85)"),
      (l.lineWidth = Math.max(1, 0.012 * e.ppm)),
      l.stroke(),
      l.restore());
  }
}
function Cd(e, t) {
  const n = e.ctx,
    o = Ut(e, t.x),
    s = Vt(e, t.y + 0.16),
    i = Ct(e, 0.085, 3);
  ((n.strokeStyle = "rgba(40,20,4,0.8)"),
    (n.lineWidth = Ct(e, 0.02, 1)),
    n.beginPath(),
    n.moveTo(Ut(e, t.x), Vt(e, t.y)),
    n.lineTo(o, s - i),
    n.stroke(),
    (n.fillStyle = "#2a3138"),
    n.beginPath(),
    n.arc(o, s, i, 0, Math.PI * 2),
    n.fill(),
    (n.strokeStyle = "rgba(234,247,249,0.85)"),
    (n.lineWidth = Ct(e, 0.018, 1)),
    n.stroke(),
    n.beginPath());
  for (let a = 0; a < 3; a++) {
    const r = (a * Math.PI * 2) / 3 + 0.5;
    (n.moveTo(o, s), n.lineTo(o + Math.cos(r) * i * 0.8, s + Math.sin(r) * i * 0.8));
  }
  n.stroke();
}
function Bo(e, t, n, o, s, i) {
  const a = e.ctx,
    r = Ut(e, t),
    l = Vt(e, n),
    h = -s,
    c = o,
    d = 0.56 * e.ppm,
    u = 0.25 * e.ppm;
  (a.save(),
    (a.lineJoin = "round"),
    a.beginPath(),
    a.moveTo(r + o * d * 0.6, l + s * d * 0.6),
    a.lineTo(r - o * d * 0.4 + h * u, l - s * d * 0.4 + c * u),
    a.lineTo(r - o * d * 0.4 - h * u, l - s * d * 0.4 - c * u),
    a.closePath(),
    (a.fillStyle = i),
    a.fill(),
    (a.strokeStyle = "rgba(24,18,8,0.9)"),
    (a.lineWidth = Ct(e, 0.04, 1.4)),
    a.stroke(),
    a.beginPath(),
    a.arc(r, l, Ct(e, 0.04, 1.4), 0, Math.PI * 2),
    (a.fillStyle = "rgba(24,18,8,0.9)"),
    a.fill(),
    a.restore());
}
function xd(e, t) {
  const n = document.createElement("canvas");
  ((n.width = e), (n.height = e));
  const o = n.getContext("2d"),
    s = o.createImageData(e, e),
    i = (r) => r * r * (3 - 2 * r),
    a = (r, l, h, c) => {
      const d = (r / e) * h,
        u = (l / e) * h,
        f = Math.floor(d),
        p = Math.floor(u),
        m = i(d - f),
        y = i(u - p),
        _ = (A, E) => dt(((A % h) + h) % h, ((E % h) + h) % h, c),
        g = _(f, p) + (_(f + 1, p) - _(f, p)) * m,
        S = _(f, p + 1) + (_(f + 1, p + 1) - _(f, p + 1)) * m;
      return g + (S - g) * y;
    };
  for (let r = 0; r < e; r++)
    for (let l = 0; l < e; l++) {
      const h = a(l, r, 4, 211) * 0.65 + a(l, r, 9, 212) * 0.35,
        c = (r * e + l) * 4;
      ((s.data[c] = 255),
        (s.data[c + 1] = 255),
        (s.data[c + 2] = 255),
        (s.data[c + 3] = Math.round(255 * (1 - t + t * h))));
    }
  return (o.putImageData(s, 0, 0), n);
}
class Dd {
  constructor() {
    M(this, "buf", document.createElement("canvas"));
    M(this, "bctx", this.buf.getContext("2d"));
    M(this, "tmp", document.createElement("canvas"));
    M(this, "tctx", this.tmp.getContext("2d"));
    M(this, "cells", document.createElement("canvas"));
    M(this, "cctx", this.cells.getContext("2d"));
    M(this, "noise", xd(j.SILT_NOISE_PX, j.SILT_NOISE_A));
    M(this, "noisePat", null);
    M(this, "sr", ee.SILT_RES);
    M(this, "empty", !0);
    M(this, "lastT", -1);
    M(this, "lastOx", 0);
    M(this, "lastOy", 0);
    M(this, "lastZoom", 0);
    M(this, "offX", 0);
    M(this, "offY", 0);
    M(this, "bx0", 0);
    M(this, "by0", 0);
    M(this, "bx1", 0);
    M(this, "by1", 0);
  }
  resize(t, n, o = ee.SILT_RES) {
    ((this.sr = o), (this.lastT = -1));
    const s = Math.max(1, Math.ceil(t * this.sr)),
      i = Math.max(1, Math.ceil(n * this.sr));
    for (const a of [this.buf, this.tmp]) ((a.width = s), (a.height = i));
  }
  render(t, n, o) {
    if (n.bx1 < n.bx0) {
      ((this.empty = !0), (this.lastT = -1));
      return;
    }
    if (
      this.lastT >= 0 &&
      o - this.lastT < 1 / ee.SILT_FPS &&
      o >= this.lastT &&
      t.zoom === this.lastZoom
    ) {
      ((this.offX = (this.lastOx - t.ox) * t.zoom), (this.offY = (this.lastOy - t.oy) * t.zoom));
      return;
    }
    ((this.lastT = o),
      (this.lastOx = t.ox),
      (this.lastOy = t.oy),
      (this.lastZoom = t.zoom),
      (this.offX = 0),
      (this.offY = 0),
      (this.empty = !0));
    const s = U.CELL_M,
      i = Math.max(n.bx0, Math.floor(t.ox / s) - 2),
      a = Math.min(n.bx1, Math.ceil((t.ox + t.W / t.zoom) / s) + 2),
      r = Math.max(n.by0, Math.floor(t.oy / s) - 2),
      l = Math.min(n.by1, Math.ceil((t.oy + t.H / t.zoom) / s) + 2);
    if (a < i || l < r) return;
    const h = a - i + 3,
      c = l - r + 3;
    (this.cells.width !== h || this.cells.height !== c) &&
      ((this.cells.width = h), (this.cells.height = c));
    const d = this.cctx.createImageData(h, c),
      [u, f, p] = I.siltLit;
    let m = !1;
    for (let A = r; A <= l; A++)
      for (let E = i; E <= a; E++) {
        const b = ((A - r + 1) * h + (E - i + 1)) * 4;
        ((d.data[b] = u), (d.data[b + 1] = f), (d.data[b + 2] = p));
        const T = Fr(n.d[A * n.gw + E]);
        T <= 0.004 || ((d.data[b + 3] = Math.round(255 * T)), (m = !0));
      }
    if (!m) return;
    for (let A = 0; A < d.data.length; A += 4)
      ((d.data[A] = u), (d.data[A + 1] = f), (d.data[A + 2] = p));
    this.cctx.putImageData(d, 0, 0);
    const y = this.bctx,
      _ = t.zoom * this.sr;
    (y.setTransform(1, 0, 0, 1, 0, 0),
      (y.globalCompositeOperation = "source-over"),
      (y.globalAlpha = 1),
      y.clearRect(0, 0, this.buf.width, this.buf.height),
      (y.imageSmoothingEnabled = !0));
    const g = ((i - 1) * s - t.ox) * _,
      S = ((r - 1) * s - t.oy) * _;
    y.drawImage(this.cells, g, S, h * s * _, c * s * _);
    {
      this.noisePat || (this.noisePat = y.createPattern(this.noise, "repeat"));
      const A = this.noisePat;
      if (A) {
        const E = (j.SILT_NOISE_M * _) / j.SILT_NOISE_PX,
          b = o * j.SILT_NOISE_DRIFT_MPS;
        (A.setTransform(new DOMMatrix([E, 0, 0, E, (-t.ox + b) * _, (-t.oy + b * 0.4) * _])),
          (y.globalCompositeOperation = "destination-in"),
          (y.fillStyle = A),
          y.fillRect(g, S, h * s * _, c * s * _),
          (y.globalCompositeOperation = "source-over"));
      }
    }
    this.setBox(g, S, g + h * s * _, S + c * s * _);
  }
  setBox(t, n, o, s) {
    ((this.bx0 = Math.max(0, Math.floor(t))),
      (this.by0 = Math.max(0, Math.floor(n))),
      (this.bx1 = Math.min(this.buf.width, Math.ceil(o))),
      (this.by1 = Math.min(this.buf.height, Math.ceil(s))),
      (this.empty = this.bx1 <= this.bx0 || this.by1 <= this.by0));
  }
  blit(t, n) {
    const o = this.bx1 - this.bx0,
      s = this.by1 - this.by0;
    t.drawImage(
      n,
      this.bx0,
      this.by0,
      o,
      s,
      this.bx0 / this.sr + this.offX,
      this.by0 / this.sr + this.offY,
      o / this.sr,
      s / this.sr,
    );
  }
  drawShade(t) {
    if (this.empty) return;
    const n = this.tctx;
    (n.setTransform(1, 0, 0, 1, 0, 0),
      (n.globalAlpha = 1),
      (n.globalCompositeOperation = "copy"),
      n.drawImage(this.buf, 0, 0),
      (n.globalCompositeOperation = "source-in"));
    const o = this.lastZoom * this.sr,
      s = n.createLinearGradient(0, -this.lastOy * o, 0, (48 - this.lastOy) * o);
    for (const [i, a] of F.DARK_COLORS) s.addColorStop(Math.min(1, Math.max(0, i / 48)), a);
    ((n.fillStyle = s),
      n.fillRect(this.bx0, this.by0, this.bx1 - this.bx0, this.by1 - this.by0),
      (n.globalCompositeOperation = "source-over"),
      t.save(),
      t.setTransform(1, 0, 0, 1, 0, 0),
      (t.imageSmoothingEnabled = !0),
      this.blit(t, this.tmp),
      t.restore());
  }
  drawLit(t, n, o) {
    if (this.empty) return;
    const s = this.tctx;
    (s.setTransform(1, 0, 0, 1, 0, 0),
      (s.globalAlpha = 1),
      (s.globalCompositeOperation = "copy"),
      s.drawImage(this.buf, 0, 0),
      (s.globalCompositeOperation = "destination-in"),
      (s.imageSmoothingEnabled = !0));
    const i = this.sr / o;
    (s.drawImage(n, -this.offX * this.sr, -this.offY * this.sr, n.width * i, n.height * i),
      (s.globalCompositeOperation = "source-over"),
      t.save(),
      t.setTransform(1, 0, 0, 1, 0, 0),
      (t.imageSmoothingEnabled = !0),
      (t.globalCompositeOperation = "lighter"));
    for (let a = j.SILT_LIT_A; a > 0.01; a -= 1)
      ((t.globalAlpha = Math.min(1, a)), this.blit(t, this.tmp));
    t.restore();
  }
}
function Fd(e, t, n, o, s) {
  const i = Fr(t.siltHere) * j.SILT_FRONT_A;
  if (i <= 0.01) return;
  const a = e.ctx,
    [r, l, h] = Wo(o),
    [c, d, u] = I.siltLit,
    f = Math.min(1, s * j.SILT_LIT_A),
    p = `${Math.round(r + (c - r) * f)},${Math.round(l + (d - l) * f)},${Math.round(h + (u - h) * f)}`,
    m = Ut(e, n),
    y = Vt(e, o),
    _ = j.SILT_FRONT_R_M * e.ppm,
    g = a.createRadialGradient(m, y, 0, m, y, _);
  (g.addColorStop(0, `rgba(${p},${i.toFixed(3)})`),
    g.addColorStop(0.55, `rgba(${p},${(i * 0.7).toFixed(3)})`),
    g.addColorStop(1, `rgba(${p},0)`),
    (a.fillStyle = g),
    a.fillRect(m - _, y - _, _ * 2, _ * 2));
}
function $a(e, t, n, o, s) {
  const i = ls(t);
  if (i <= 0.05 || t.phase !== "dive") return;
  const a = cs(t, n);
  if (!a) return;
  const r = q.HIGHLIGHT_M / 2,
    l = a.running ? o : { x: a.x - a.ex * r, y: a.y - a.ey * r },
    h = a.running
      ? { x: o.x + a.ex * q.HIGHLIGHT_M, y: o.y + a.ey * q.HIGHLIGHT_M }
      : { x: a.x + a.ex * r, y: a.y + a.ey * r },
    c = e.ctx,
    d = Ut(e, l.x),
    u = Vt(e, l.y),
    f = Ut(e, h.x),
    p = Vt(e, h.y),
    m = (_, g) => {
      const S = c.createLinearGradient(d, u, f, p);
      return (
        S.addColorStop(0, `rgba(${_},0)`),
        S.addColorStop(a.running ? 0.12 : 0.2, `rgba(${_},${g})`),
        S.addColorStop(a.running ? 0.6 : 0.8, `rgba(${_},${g})`),
        S.addColorStop(1, `rgba(${_},0)`),
        S
      );
    },
    y = (_, g) => {
      ((c.strokeStyle = _),
        (c.lineWidth = g),
        c.beginPath(),
        c.moveTo(d, u),
        c.lineTo(f, p),
        c.stroke());
    };
  if ((c.save(), (c.globalAlpha = Math.min(1, i * 1.25)), (c.lineCap = "round"), s === "glow")) {
    c.globalCompositeOperation = "lighter";
    for (const _ of [1, 0.62, 0.34]) y(m("255,226,160", 0.13), Ct(e, j.TOUCH_GLOW_M * _, 5 * _));
  } else {
    y(m("20,14,6", 0.55), Ct(e, 0.035, 1.6) + 1.6 * e.dpr);
    const _ = parseInt(I.lineTouch.slice(1), 16);
    y(m(`${(_ >> 16) & 255},${(_ >> 8) & 255},${_ & 255}`, 1), Ct(e, 0.035, 1.6));
  }
  c.restore();
}
function Hd(e, t) {
  const n = ls(t);
  if (n <= 0.05 || t.phase !== "dive") return;
  const o = e.ctx;
  for (const s of t.arrows) {
    if (!s.near) continue;
    const i = Ut(e, s.x),
      a = Vt(e, s.y),
      r = j.TOUCH_ARROW_GLOW_M * e.ppm;
    (o.save(), (o.globalAlpha = Math.min(1, n * 1.25)), (o.globalCompositeOperation = "lighter"));
    const l = o.createRadialGradient(i, a, 0, i, a, r);
    (l.addColorStop(0, "rgba(255,226,160,0.45)"),
      l.addColorStop(1, "rgba(255,226,160,0)"),
      (o.fillStyle = l),
      o.fillRect(i - r, a - r, r * 2, r * 2),
      o.restore(),
      o.save(),
      (o.globalAlpha = Math.min(1, n * 1.25)),
      Bo(e, s.x, s.y, s.dx, s.dy, s.own ? I.ownArrow : "#e8e2cf"),
      o.restore());
  }
}
const Wd = (e) => (e < 0 ? 0 : e > 1 ? 1 : e);
const Ka = F.EDGE_BAND_PX / st.ROCK_PPM;
class Bd {
  constructor(t) {
    M(this, "world");
    M(this, "gw");
    M(this, "gh");
    M(this, "seen");
    M(this, "kind");
    this.world = t;
    const n = Ne.CELL_M;
    ((this.gw = Math.ceil(t.w / n)),
      (this.gh = Math.ceil(t.h / n)),
      (this.seen = new Uint8Array(this.gw * this.gh)),
      (this.kind = new Uint8Array(this.gw * this.gh)));
  }
  get top() {
    return -this.world.airRows;
  }
  reset() {
    this.seen.fill(0);
  }
  cellAt(t, n) {
    const o = Ne.CELL_M,
      s = Math.floor(t / o),
      i = Math.floor((n - this.top) / o);
    return s < 0 || i < 0 || s >= this.gw || i >= this.gh ? -1 : i * this.gw + s;
  }
  litAt(t, n) {
    const o = this.cellAt(t, n);
    return o < 0 ? 0 : this.seen[o] / 255;
  }
  count() {
    let t = 0;
    for (const n of this.seen) n && t++;
    return t;
  }
  cellKind(t, n, o) {
    let s = this.kind[t];
    if (s) return s;
    const i = z(this.world, n, o);
    return ((s = i >= 0 ? 1 : -i < Ka ? 2 : 3), (this.kind[t] = s), s);
  }
  observe(t, n, o = 0) {
    const s = Ne.CELL_M,
      i = this.top,
      a = Math.max(0, Math.floor(n.ox / s)),
      r = Math.max(0, o > 0 ? Math.ceil((n.oy + o / n.zoom - i) / s - 0.5) : Math.floor((n.oy - i) / s)),
      l = Math.min(this.gw - 1, Math.floor((n.ox + n.W / n.zoom) / s)),
      h = Math.min(this.gh - 1, Math.floor((n.oy + n.H / n.zoom - i) / s)),
      c = Ka,
      d = t.sky.y0 + t.sky.gh * t.sky.cell,
      u = t.beam.range > 0 && t.beam.gain > 0 ? t.beam.bounds() : null,
      f = t.glow.a > 0 ? t.glow.bounds() : null,
      p = t.flash.k > 0 && t.flash.ready ? t.flash.bounds() : null,
      { LIT_MIN: m, LIT_FULL: y } = Ne;
    for (let _ = r; _ <= h; _++) {
      const g = i + (_ + 0.5) * s,
        S = g < d,
        A = !!u && g > u.y0 - c && g < u.y1 + c,
        E = !!f && g > f.y0 - c && g < f.y1 + c,
        b = !!p && g > p.y0 - c && g < p.y1 + c;
      if (!(!S && !A && !E && !b))
        for (let T = a; T <= l; T++) {
          const k = (T + 0.5) * s;
          if (
            !S &&
            !(A && k > u.x0 - c && k < u.x1 + c) &&
            !(E && k > f.x0 - c && k < f.x1 + c) &&
            !(b && k > p.x0 - c && k < p.x1 + c)
          )
            continue;
          const w = _ * this.gw + T,
            L = this.cellKind(w, k, g);
          if (L === 3) continue;
          const R = L === 2 ? t.rock(k, g) : t.light(k, g);
          if (R < m) continue;
          const P = Math.round(255 * Wd((R - m) / (y - m)));
          P > this.seen[w] && (this.seen[w] = P);
        }
    }
  }
  serialize() {
    return wl(this.gw, this.gh, this.seen);
  }
  load(t) {
    const n = $o(t, this.gw, this.gh);
    return n ? (this.seen.set(n), !0) : !1;
  }
}
function wl(e, t, n) {
  let o = "";
  for (let s = 0; s < n.length; ) {
    const i = n[s];
    let a = 1;
    for (; s + a < n.length && n[s + a] === i && a < 255; ) a++;
    ((o += String.fromCharCode(a, i)), (s += a));
  }
  return `${e}x${t}:${btoa(o)}`;
}
function $o(e, t, n) {
  const o = /^(\d+)x(\d+):(.*)$/.exec(e);
  if (!o || Number(o[1]) !== t || Number(o[2]) !== n) return null;
  let s;
  try {
    s = atob(o[3]);
  } catch {
    return null;
  }
  const i = new Uint8Array(t * n);
  let a = 0;
  for (let r = 0; r + 1 < s.length; r += 2) {
    const l = s.charCodeAt(r),
      h = s.charCodeAt(r + 1);
    if (l === 0 || a + l > i.length) return null;
    (i.fill(h, a, a + l), (a += l));
  }
  return a === i.length ? i : null;
}
function $d(e) {
  if (e < Mt.SEEN_MIN) return 0;
  const t = Mt.LEVELS - 1;
  return Math.min(255, Math.round((Math.ceil((e / 255) * t - 1e-9) * 255) / t));
}
function Kd(e, t) {
  let n = 0;
  for (let o = 0; o < e.length; o++) {
    const s = $d(t[o] ?? 0);
    s > e[o] && (e[o] || n++, (e[o] = s));
  }
  return n;
}
const at = st.ROCK_PPM;
function Gd(e, t, n, o = 0) {
  const s = co.FRAME_MARGIN_M;
  return (
    t >= e.ox + s &&
    t <= e.ox + e.W / e.zoom - s &&
    n >= e.oy + o / e.zoom + s &&
    n <= e.oy + e.H / e.zoom - s
  );
}
function findPhotoPoint(light, view, find, topMargin) {
  const visible = find.pts.filter(([x, y]) => Gd(view, x, y, topMargin) && light.flashLight(x, y) >= co.LIT_MIN);
  if (!visible.length) return null;
  const [x, y] = visible[Math.floor(visible.length / 2)];
  return [(x - view.ox) * view.zoom / view.W, (y - view.oy) * view.zoom / view.H];
}
class Vd {
  constructor() {
    M(this, "found", new Set());
    M(this, "known", new Set());
  }
  reset(t = []) {
    (this.found.clear(), (this.known = new Set(t)));
  }
  isNew(t) {
    return !this.known.has(t) && !this.found.has(t);
  }
  shoot(light, view, topMargin = 0, white = false, number = 0, backscatter = 0, subjects = xt().finds) {
    const marks = {};
    if (!white) {
      for (const subject of subjects) {
        const point = findPhotoPoint(light, view, subject, topMargin);
        if (point) marks[subject.id] = point;
      }
    }
    const finds = Object.keys(marks);
    const fresh = finds.filter(id => this.isNew(id));
    for (const id of finds) this.found.add(id);
    return { n: number, finds, fresh, marks, white, backscatter };
  }
}
function Xd(e, t, n, o = 0, s = 0.25) {
  const i = { x: e.flash.cone.ox, y: e.flash.cone.oy };
  let a = 0,
    r = 0,
    l = 0;
  const h = n.ox,
    c = n.ox + n.W / n.zoom,
    d = n.oy + o / n.zoom,
    u = n.oy + n.H / n.zoom;
  for (let f = d + s / 2; f < u; f += s)
    for (let p = h + s / 2; p < c; p += s)
      z(t, p, f) <= 0.02 ||
        (a++, Ir(t, i, { x: p, y: f }, 0) && r++, e.flashLight(p, f) >= co.LIT_MIN && l++);
  return { water: a, sight: r, lit: l, frac: a ? l / a : 0, fracSight: r ? l / r : 0 };
}
const Gi = { W_M: 0.26, H_M: 0.34, HANG_M: 0.06 };
function Ll(e, t, n, o) {
  const s = (n - t.ox) * t.zoom,
    i = (o - t.oy) * t.zoom,
    a = Gi.W_M * t.zoom,
    r = Gi.H_M * t.zoom;
  ((e.fillStyle = "#f6f1dc"),
    (e.strokeStyle = "rgba(30,24,10,0.8)"),
    (e.lineWidth = Math.max(1, 0.015 * t.zoom)),
    e.beginPath(),
    e.rect(s, i, a, r),
    e.fill(),
    e.stroke(),
    (e.strokeStyle = "rgba(60,50,30,0.6)"));
  for (let l = 1; l <= 3; l++)
    (e.beginPath(),
      e.moveTo(s + a * 0.18, i + (r * l) / 4.2),
      e.lineTo(s + a * 0.82, i + (r * l) / 4.2),
      e.stroke());
}
const Ye = { h: "#cdc1a1", m: "#a5987a", s: "#73695a", t: "#e6ddc6" };
const jd = {
  bones: {
    rows: ["    cCcCcCc      ", "   cHcHcHcHc     ", "  ccccccccccc hh ", "  b  b    b  hhh "],
    pal: { c: "#9d8c66", C: "#75674a", H: "#c4b28a", h: "#dcd0b3", b: "#d6cbb0" },
    ax: 8,
    ay: 4,
  },
  reel: {
    rows: [" yyy      ", "yLLLy     ", "yLkLy     ", "yLLLyllll ", " yyy    ll"],
    pal: { y: "#b9a35a", L: "#e8e2cf", k: "#3b3a36", l: "#d2c9ae" },
    ax: 2,
    ay: 5,
  },
  slate: {
    rows: ["wwww ", "wkkw ", "wwww ", "wkkw ", "wwwwp"],
    pal: { w: "#e7e2d0", k: "#57524b", p: "#c98a3c" },
    ax: 2,
    ay: 5,
  },
  fossils: {
    rows: [
      "    cCcCcCc                    ",
      "   cHcHcHcHc        ssss       ",
      "  ccccccccccc hh   sSSSSsssssss",
      "  b  b    b  hhh   sSoSSsztztzs",
      "                    ssss ssssss",
    ],
    pal: {
      c: "#9d8c66",
      C: "#75674a",
      H: "#c4b28a",
      h: "#dcd0b3",
      b: "#d6cbb0",
      s: "#cbbf9f",
      S: "#a99b7c",
      o: "#3a352c",
      z: "#efe8d6",
      t: "#8a7d62",
    },
    ax: 12,
    ay: 5,
  },
  cache: {
    rows: [
      "            v       ",
      " aaaaaaaaaaaVv wwww ",
      "aAAAAAAAAAAAa  wkkw ",
      "aAAAAAAAAAAAa  wwww ",
      " aaaaaaaaaaa   wkkw ",
      "               wwww ",
    ],
    pal: { a: "#8f969b", A: "#c4cacd", V: "#3f3d39", v: "#5c5850", w: "#e7e2d0", k: "#57524b" },
    ax: 10,
    ay: 6,
  },
  body: {
    rows: [
      "       TTTTTTTTTTT            ",
      "  HH  TtttttttttttTv          ",
      " HhhH  vvvvvvvvvv             ",
      " HohH rrrrrrrrr  bbbbbbbbb ff ",
      "  HH  r r r r r bb       bfff ",
      "        bbbbb            ffff ",
    ],
    pal: {
      T: "#5a5f64",
      t: "#7b8186",
      v: "#3a3631",
      H: "#cfc4a6",
      h: "#e6dcc3",
      o: "#2a2622",
      r: "#d8cdb2",
      b: "#cdbf9f",
      f: "#26313a",
    },
    ax: 15,
    ay: 6,
  },
};
const qd = [
  [49.2, 3, 5],
  [49.8, 4, 8],
  [50.5, 2, 4],
  [51.1, 4, 9],
  [51.8, 3, 6],
  [52.4, 3, 4],
];
const _i = [150.5, 8, 17];
const zd = [
  [145.2, 3, 7],
  [146.1, 4, 11],
  [150, 3, 6],
  [151, 4, 9],
  [152.6, 3, 5],
];
function gi(e, t, n) {
  for (let o = 0; o < 4; o += 0.02) if (z(e, t, n - o) <= 0) return n - o;
  return NaN;
}
function Mi(e, t, n) {
  for (let o = 0; o < 4; o += 0.02) if (z(e, t, n + o) <= 0) return n + o;
  return NaN;
}
