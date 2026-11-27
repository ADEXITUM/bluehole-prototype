class Zd {
  constructor(t, n) {
    M(this, "world");
    M(this, "sky");
    M(this, "beam", new wd());
    M(this, "glow", new Al());
    M(this, "shade", new Od());
    M(this, "flash", new Id());
    M(this, "look", qo.main);
    M(this, "flick", 1);
    M(this, "rgb", F.HAZE_RGB.join(","));
    M(this, "self", 1);
    ((this.world = t), (this.sky = n));
  }
  setup(t, n, o, s, i, a) {
    const r = rn(t, "light"),
      l = r && r.phase === "warn" ? Ro(r.t, r.warnS) : 1,
      h = 1 - l;
    ((this.flick = l),
      (this.rgb = F.HAZE_RGB.map((c, d) =>
        Math.round(c + (Zn.FLICKER_TINT[d] - c) * Math.min(1, h * 1.3)),
      ).join(",")),
      (this.look = qo[In(t)]),
      this.beam.compute(this.world, s, i, a, oi(t), this.look.gain * l),
      this.glow.compute(this.world, n, o, this.look.glowR, this.look.glowA * (0.12 + 0.88 * l)),
      this.shade.compute(t.silt, this.world, n, o),
      (this.self = Math.max(this.look.self * (0.3 + 0.7 * l), this.flash.k)));
  }
  flashNow(t, n) {
    const o = this.flash.k;
    return o > 0 ? this.flash.at(t, n) * o : 0;
  }
  flashLight(t, n) {
    const o = this.flash.at(t, n);
    if (o <= 0) return 0;
    const s = this.shade.both(t, n);
    return o * s.td * s.tf;
  }
  backscatter(t) {
    return this.shade.nearLoss(t, ((Q.FLASH_CONE_DEG / 2) * Math.PI) / 180, Q.BACKSCATTER_M);
  }
  day(t, n) {
    return ml(this.sky, t, n);
  }
  light(t, n) {
    const o = this.beam.at(t, n),
      s = this.glow.at(t, n),
      i = this.flashNow(t, n),
      a = this.day(t, n);
    if (o <= 0 && s <= 0 && i <= 0) return a;
    const r = this.shade.both(t, n),
      l = 1 - (1 - o * r.td) * (1 - s) * (1 - i * r.td);
    return 1 - (1 - a) * (1 - l * r.tf);
  }
  surface(t, n, o, s) {
    const i = this.day(t, n) * F.DAY_EDGE_A;
    let a =
      this.beam.onRock(this.world, t, n, o, s) +
      F.GLOW_EDGE_A * this.glow.onRock(this.world, t, n, o, s);
    (this.flash.k > 0 && (a += this.flash.k * this.flash.onRock(this.world, t, n, o, s)),
      a > 0 && this.shade.active && (a *= this.shade.beamAt(t, n)));
    const r = a + i;
    return r > 1 ? 1 : r;
  }
  rock(t, n) {
    const o = z(this.world, t, n);
    if (o >= 0) return this.light(t, n);
    const s = -o * st.ROCK_PPM + 0.5;
    if (s > F.EDGE_BAND_PX) return 0;
    const i = Zs(s),
      a = $t(this.world, t, n),
      r = -o + F.ROCK_SAMPLE_M,
      l = t + a.x * r,
      h = n + a.y * r,
      c = ul(this.world, l, h);
    return this.surface(l, h, c.x, c.y) * i;
  }
}
const Ui = [8, 16, 32, 64];
function Rl(e) {
  const t = document.createElement("canvas");
  return ((t.width = e), (t.height = e), [t, t.getContext("2d")]);
}
function Rs(e, t) {
  return Ui.map((n) => {
    const [o, s] = Rl(n),
      i = n / 2,
      a = s.createRadialGradient(i, i, 0, i, i, i),
      r = (l) => `rgba(${t[0]},${t[1]},${t[2]},${l})`;
    return (
      e === 0
        ? (a.addColorStop(0, r(1)),
          a.addColorStop(0.32, r(0.95)),
          a.addColorStop(0.55, r(0.35)),
          a.addColorStop(1, r(0)))
        : e === 1
          ? (a.addColorStop(0, r(1)),
            a.addColorStop(0.2, r(0.8)),
            a.addColorStop(0.5, r(0.3)),
            a.addColorStop(1, r(0)))
          : (a.addColorStop(0, r(0.55)),
            a.addColorStop(0.62, r(0.6)),
            a.addColorStop(0.8, r(0.85)),
            a.addColorStop(0.92, r(0.35)),
            a.addColorStop(1, r(0))),
      (s.fillStyle = a),
      s.fillRect(0, 0, n, n),
      o
    );
  });
}
function Jd() {
  return Ui.map((e) => {
    const [t, n] = Rl(e),
      o = e / 2,
      s = Math.max(1, e * 0.09),
      i = n.createRadialGradient(o * 0.85, o * 0.8, 0, o, o, o);
    return (
      i.addColorStop(0, "rgba(230,248,255,0.1)"),
      i.addColorStop(0.75, "rgba(210,240,255,0.18)"),
      i.addColorStop(1, "rgba(235,250,255,0.35)"),
      (n.fillStyle = i),
      n.beginPath(),
      n.arc(o, o, o - s / 2, 0, Math.PI * 2),
      n.fill(),
      (n.strokeStyle = "rgba(236,250,255,0.92)"),
      (n.lineWidth = s),
      n.stroke(),
      (n.fillStyle = "rgba(255,255,255,0.95)"),
      n.beginPath(),
      n.ellipse(o * 0.68, o * 0.62, o * 0.22, o * 0.15, -0.6, 0, Math.PI * 2),
      n.fill(),
      t
    );
  });
}
function Js(e, t) {
  for (let n = 0; n < Ui.length; n++) if (Ui[n] >= t) return e[n];
  return e[e.length - 1];
}
const Qe = (e, t) => e[0] + (e[1] - e[0]) * t;
function Qd(e, t, n, o) {
  const s = Math.hypot(n, o);
  if (!(s > gt.FLOW_MIN_MPS)) return { dx: 0, dy: 0, fade: 1, speed: 0 };
  const i = gt.FLOW_LIFE_S,
    a = (((e / i + t) % 1) + 1) % 1,
    r = Math.min(1, s / 0.05);
  return {
    dx: n * (a - 0.5) * i,
    dy: o * (a - 0.5) * i,
    fade: 1 - r + r * Math.min(1, a / gt.FLOW_FADE, (1 - a) / gt.FLOW_FADE),
    speed: s,
  };
}
function tf(e) {
  const t = Math.min(1, e / gt.FLOW_CALM_MPS);
  return 1 - (1 - gt.FLOW_WOBBLE_MIN) * t;
}
class ef {
  constructor(t) {
    M(this, "world");
    M(
      this,
      "cool",
      [0, 1, 2].map((t) => Rs(t, gt.RGB_COOL)),
    );
    M(
      this,
      "warm",
      [0, 1, 2].map((t) => Rs(t, gt.RGB_WARM)),
    );
    M(this, "speck", Rs(0, I.siltSpeck));
    M(this, "drawn", 0);
    M(this, "fv", { x: 0, y: 0 });
    this.world = t;
  }
  draw(t, n, o, s, i = null, a = 0) {
    ((this.drawn = 0), t.save(), (t.globalCompositeOperation = "lighter"));
    const r = gt.MIN_PX * n.dpr,
      l = gt.FLOW_MPS[0] * s,
      h = gt.FLOW_MPS[1] * s,
      c = gt.FLOW_LIFE_S,
      d = gt.WOBBLE_M[1] + (i ? a * c * 0.5 : 0),
      u = this.fv;
    (gt.LAYERS.forEach((f, p) => {
      const m = f.tileM / Math.sqrt(ee.PARTICLES),
        y = f.parallax,
        _ = n.ox * y - l - d,
        g = n.oy * y - h - d,
        S = _ + n.W / n.zoom + d * 2,
        A = g + n.H / n.zoom + d * 2,
        E = Math.floor(_ / m),
        b = Math.floor(S / m),
        T = Math.floor(g / m),
        k = Math.floor(A / m),
        w = 101 + p * 37;
      for (let L = T; L <= k; L++)
        for (let R = E; R <= b; R++)
          for (let P = 0; P < f.perTile; P++) {
            const v = w + P * 11,
              N = dt(R, L, v),
              O = dt(R, L, v + 1),
              C = dt(R, L, v + 2),
              W = dt(R, L, v + 3);
            let V = Qe(gt.WOBBLE_M, C);
            const K = Qe(gt.WOBBLE_HZ, W) * Math.PI * 2;
            let B = (R + N) * m + l,
              Y = (L + O) * m + h,
              x = 1,
              G = 0;
            if (i) {
              i(n.ox + (B - n.ox * y), n.oy + (Y - n.oy * y), u);
              const oe = Qd(s, dt(R, L, v + 6), u.x, u.y);
              ((G = oe.speed), (B += oe.dx), (Y += oe.dy), (x = oe.fade), (V *= tf(G)));
            }
            ((B += Math.sin(s * K + O * 6.28) * V), (Y += Math.cos(s * K * 0.8 + N * 6.28) * V * 0.7));
            const J = (B - n.ox * y) * n.zoom,
              ot = (Y - n.oy * y) * n.zoom;
            if (J < -20 || ot < -20 || J > n.W + 20 || ot > n.H + 20) continue;
            const D = n.ox + J / n.zoom,
              Z = n.oy + ot / n.zoom;
            if (Z < 0.15) continue;
            const rt = Qe(f.sizeM, dt(R, L, v + 4));
            if (z(this.world, D, Z) < rt + 0.02) continue;
            const lt = o.ambient(D, Z),
              It = o.beam(D, Z),
              Ft = lt * gt.DAY_GAIN + It * gt.BEAM_GAIN,
              Ot = 1 - f.twinkle + f.twinkle * (0.5 + 0.5 * Math.sin(s * (0.8 + C * 2.2) + W * 6.28)),
              Xe = Qe(f.alpha, dt(R, L, v + 5)) * Math.min(1.6, Ft) * Ot * x * o.view(D, Z);
            if (Xe < gt.CULL_A) continue;
            const Pt = Math.max(r, rt * n.zoom * (1 + gt.BEAM_GROW * Math.min(1, It))),
              _s = It > lt * 0.6 ? this.warm : this.cool;
            t.globalAlpha = Math.min(1, Xe);
            const Pn = Js(_s[f.sprite], Pt * 2);
            if (G > 0) {
              const oe = Math.min(Pt * gt.FLOW_STREAK_MAX, G * gt.FLOW_STREAK_S * n.zoom * y),
                ci = u.x / G,
                Se = u.y / G;
              (t.setTransform(ci, Se, -Se, ci, J, ot),
                t.drawImage(Pn, -Pt - oe, -Pt, Pt * 2 + oe, Pt * 2),
                t.setTransform(1, 0, 0, 1, 0, 0));
            } else t.drawImage(Pn, J - Pt, ot - Pt, Pt * 2, Pt * 2);
            this.drawn++;
          }
    }),
      t.restore());
  }
  drawSiltSpecks(t, n, o, s, i) {
    if (o.bx1 < o.bx0) return;
    const a = U.CELL_M,
      r = Math.max(o.bx0, Math.floor(n.ox / a) - 1),
      l = Math.min(o.bx1, Math.ceil((n.ox + n.W / n.zoom) / a) + 1),
      h = Math.max(o.by0, Math.floor(n.oy / a) - 1),
      c = Math.min(o.by1, Math.ceil((n.oy + n.H / n.zoom) / a) + 1);
    if (l < r || c < h) return;
    (t.save(), (t.globalCompositeOperation = "lighter"));
    const d = gt.MIN_PX * n.dpr * 0.9,
      u = j.SILT_SPECKS * a * a;
    for (let f = h; f <= c; f++)
      for (let p = r; p <= l; p++) {
        const m = o.d[f * o.gw + p];
        if (m <= U.CLEAR_RHO) continue;
        const y = Math.min(4, Math.floor(m * u + dt(p, f, 9)));
        for (let _ = 0; _ < y; _++) {
          const g = dt(p, f, _ * 5 + 11),
            S = dt(p, f, _ * 5 + 12),
            A = dt(p, f, _ * 5 + 13),
            E = (p + g) * a + Math.sin(i * (0.3 + A * 0.3) + S * 6.28) * 0.1,
            b = (f + S) * a + Math.cos(i * (0.25 + g * 0.3) + g * 6.28) * 0.08;
          if (z(this.world, E, b) < 0.02) continue;
          const T = s.silt(E, b),
            k = Math.min(
              1,
              T * 1.6 * (0.35 + Math.min(0.65, m)) * (0.6 + 0.4 * Math.sin(i * (1.5 + A * 3) + A * 9)),
            );
          if (k < gt.CULL_A) continue;
          const w = Math.max(d, Qe(j.SILT_SPECK_R_M, A) * n.zoom);
          ((t.globalAlpha = k),
            t.drawImage(
              Js(this.speck, w * 2),
              (E - n.ox) * n.zoom - w,
              (b - n.oy) * n.zoom - w,
              w * 2,
              w * 2,
            ));
        }
      }
    t.restore();
  }
}
class nf {
  constructor() {
    M(this, "list", []);
    M(this, "sprite", Jd());
    M(this, "pending", -1);
    M(this, "selfT", 1.2);
    M(this, "hookAge", 99);
    M(this, "burstDone", !1);
    M(this, "streamAcc", 0);
    M(this, "flow", null);
    M(this, "fv", { x: 0, y: 0 });
  }
  onBreath(t) {
    ((this.hookAge = 0), (this.pending = t * Lt.EXHALE_DELAY));
  }
  puff(t, n, o, s) {
    for (let i = 0; i < o; i++)
      this.list.push({
        x: t + (Math.random() - 0.5) * s,
        y: n + (Math.random() - 0.5) * s * 0.6,
        r: Qe(Lt.R_M, Math.pow(Math.random(), 1.6)),
        rise: 0,
        ph: Math.random() * 6.28,
        ceil: 0,
        nx: 0,
      });
  }
  stream(t, n, o, s) {
    if (o <= 0 || n <= 0) {
      this.streamAcc = 0;
      return;
    }
    this.streamAcc += o * n;
    const i = s ? Lt.FREEFLOW_BIG_SPREAD_M : Lt.FREEFLOW_SPREAD_M;
    for (; this.streamAcc >= 1; ) {
      this.streamAcc -= 1;
      const a = s && Math.random() < 0.35 ? Lt.FREEFLOW_BIG_R_M : Lt.FREEFLOW_R_M;
      this.list.push({
        x: t.x + (Math.random() - 0.5) * i,
        y: t.y + (Math.random() - 0.5) * i * 0.6,
        r: Qe(a, Math.random()),
        rise: 0,
        ph: Math.random() * 6.28,
        ceil: 0,
        nx: 0,
      });
    }
  }
  update(t, n, o, s, i, a, r, l = 0, h = !1, c = null) {
    if (
      ((this.flow = c),
      this.stream(n, o, l, h),
      r && !this.burstDone && ((this.burstDone = !0), this.puff(n.x, n.y, j.OX_BURST_BUBBLES, 0.6)),
      r || (this.burstDone = !1),
      o > 0)
    ) {
      const d = o / Math.max(1, s);
      ((this.hookAge += d),
        i
          ? this.hookAge < 6
            ? this.pending >= 0 && ((this.pending -= d), this.pending < 0 && this.exhale(n))
            : ((this.selfT -= d), this.selfT <= 0 && ((this.selfT = a), this.exhale(n)))
          : (this.pending = -1));
    }
    this.advance(t, o);
  }
  simulate(t, n, o, s, i = 0, a = !1, r = null) {
    const l = 0.016666666666666666;
    this.flow = r;
    let h = s * 0.5;
    for (let c = 0; c < Math.round(o / l); c++)
      ((h -= l), h <= 0 && ((h = s), this.exhale(n)), this.stream(n, l, i, a), this.advance(t, l));
  }
  exhale(t) {
    const [n, o] = Lt.PER_BREATH;
    this.puff(t.x, t.y, n + Math.floor(Math.random() * (o - n + 1)), 0.12);
  }
  advance(t, n) {
    if (n <= 0) return;
    const o = [];
    for (const s of this.list) {
      const i = s.r * (1 + Lt.GROW_PER_M * s.rise);
      if (s.ceil > 0) {
        ((s.ceil += n), (s.x += s.nx * 0.25 * n), s.ceil < Lt.CEIL_S && o.push(s));
        continue;
      }
      const a = Lt.RISE_MPS * (0.75 + (s.r / Lt.R_M[1]) * 0.45);
      if (((s.y -= a * n), this.flow)) {
        const r = this.flow(s.x, s.y, this.fv);
        ((s.x += r.x * Lt.FLOW_K * n), (s.y += r.y * Lt.FLOW_K * n));
      }
      if (
        ((s.rise += a * n),
        (s.ph += n * Lt.WOBBLE_HZ * Math.PI * 2),
        (s.x += Math.cos(s.ph) * Lt.WOBBLE_M * Lt.WOBBLE_HZ * Math.PI * 2 * n),
        !(s.y <= 0.02))
      ) {
        if (z(t, s.x, s.y - i) < 0.01) {
          const r = $t(t, s.x, s.y - i);
          ((s.ceil = 0.001),
            (s.nx = Math.abs(r.x) > 0.05 ? Math.sign(r.x) : Math.random() < 0.5 ? -1 : 1),
            o.push(s));
          continue;
        }
        o.push(s);
      }
    }
    this.list = o.length > Lt.MAX ? o.slice(-420) : o;
  }
  draw(t, n, o) {
    if (!this.list.length) return;
    t.save();
    const s = 1.2 * n.dpr;
    for (const i of this.list) {
      const a = Math.max(s, i.r * (1 + Lt.GROW_PER_M * i.rise) * n.zoom),
        r = (i.x - n.ox) * n.zoom,
        l = (i.y - n.oy) * n.zoom;
      if (r < -a || l < -a || r > n.W + a || l > n.H + a) continue;
      const h =
          Math.min(1, o.ambient(i.x, i.y) * Lt.LIGHT_GAIN + o.beam(i.x, i.y) * 1.5) * o.view(i.x, i.y),
        c = i.ceil > 0 ? 1 - i.ceil / Lt.CEIL_S : 1,
        d = i.ceil > 0 ? 1 + Math.min(1, i.ceil * 3) * 0.6 : 1;
      ((t.globalAlpha = h * c),
        t.drawImage(Js(this.sprite, a * 2 * d), r - a * d, l - a / d, a * 2 * d, (a * 2) / d));
    }
    t.restore();
  }
}
const ae = (e, t) => (t - e.ox) * e.zoom;
const wt = (e, t) => (t - e.oy) * e.zoom;
const re = (e, t, n) => (e < t ? t : e > n ? n : e);
function Ga(e, t) {
  const n = parseInt(e.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${t})`;
}
function fe() {
  const e = document.createElement("canvas");
  return [e, e.getContext("2d")];
}
class sf {
  constructor(t) {
    M(this, "L");
    this.L = t;
  }
  ambient(t, n) {
    const o = this.L,
      s = o.glow.at(t, n);
    return 1 - (1 - o.day(t, n)) * (1 - (s > 0 ? s * o.shade.at(t, n) : 0));
  }
  beam(t, n) {
    const o = this.L;
    let s = o.beam.at(t, n);
    return (
      o.flash.k > 0 && (s = 1 - (1 - s) * (1 - o.flash.at(t, n) * o.flash.k)),
      s > 0 ? s * o.shade.beamAt(t, n) : 0
    );
  }
  silt(t, n) {
    const o = this.L;
    let s = 1 - (1 - o.beam.at(t, n)) * (1 - o.glow.at(t, n));
    return (
      o.flash.k > 0 && (s = 1 - (1 - s) * (1 - o.flash.at(t, n) * o.flash.k)),
      1 - (1 - o.day(t, n) * j.SILT_DAY_K) * (1 - (s > 0 ? s * o.shade.scatter(t, n) : 0))
    );
  }
  view(t, n) {
    return 1 - U.SIGHT_HARDNESS * (1 - this.L.shade.at(t, n));
  }
}
class of {
  constructor(t, n) {
    M(this, "world");
    M(this, "rock");
    M(this, "sky");
    M(this, "opening");
    M(this, "lit");
    M(this, "explored");
    M(this, "finds", new Vd());
    M(this, "flashT", null);
    M(this, "flashVeil", 0);
    M(this, "findsArt");
    M(this, "exploreT", 0);
    M(this, "lf");
    M(this, "anim", new Sd());
    M(this, "particles");
    M(this, "bubbles", new nf());
    M(this, "silt", new Dd());
    M(this, "sunRay", md());
    M(this, "caustics", yd(F.CAUSTICS_TILE_PX));
    M(this, "causticsPat", null);
    M(this, "lightBuf");
    M(this, "lctx");
    M(this, "darkBuf");
    M(this, "dctx");
    M(this, "flashBuf");
    M(this, "fctx");
    M(this, "siltLightBuf");
    M(this, "sctx");
    M(this, "lr", ee.LIGHT_RES);
    M(this, "rockBuf");
    M(this, "rctx");
    M(this, "rockTmp");
    M(this, "tctx");
    M(this, "rockUp");
    M(this, "uctx");
    M(this, "edgeImg", null);
    M(this, "edgeWork", cd());
    M(this, "rockBase");
    M(this, "surf");
    M(this, "diverBuf");
    M(this, "bctx");
    M(this, "twitchWait", 0.5);
    M(this, "twitchLeft", 0);
    M(this, "twitchDx", 0);
    M(this, "twitchDy", 0);
    M(this, "jerk", null);
    M(this, "prof", { water: 0, light: 0, rock: 0, fx: 0, diver: 0 });
    M(this, "profT", 0);
    M(this, "pose", null);
    M(this, "flash", new Map());
    M(this, "dieT", null);
    M(this, "placed", []);
    ((this.world = t),
      (this.rock = n),
      (this.sky = ud(t)),
      (this.opening = pd(t)),
      (this.lit = new Zd(t, this.sky)),
      (this.surf = (o, s, i, a) => this.lit.surface(o, s, i, a)),
      (this.rockBase = this.bakeRockBase()),
      (this.explored = new Bd(t)),
      (this.findsArt = new Yd(t)),
      (this.lf = new sf(this.lit)),
      (this.particles = new ef(t)),
      ([this.lightBuf, this.lctx] = fe()),
      ([this.darkBuf, this.dctx] = fe()),
      ([this.flashBuf, this.fctx] = fe()),
      ([this.siltLightBuf, this.sctx] = fe()),
      ([this.rockBuf, this.rctx] = fe()),
      ([this.rockTmp, this.tctx] = fe()),
      ([this.rockUp, this.uctx] = fe()),
      ([this.diverBuf, this.bctx] = fe()));
  }
  lap(t) {
    const n = performance.now();
    ((this.prof[t] += (n - this.profT - this.prof[t]) * 0.05), (this.profT = n));
  }
  resize(t, n, o, s) {
    const i = Math.min(1, ee.SOFT_MAX_DPR / Math.max(1, s));
    this.lr = ee.LIGHT_RES * i;
    const a = Math.max(1, Math.ceil(t * this.lr)),
      r = Math.max(1, Math.ceil(n * this.lr));
    for (const u of [this.lightBuf, this.siltLightBuf, this.flashBuf]) ((u.width = a), (u.height = r));
    const l = ee.DARK_PAD_PX;
    ((this.darkBuf.width = a + l * 2), (this.darkBuf.height = r + l * 2));
    const h = o / st.ROCK_PPM,
      c = Math.ceil(t / h) + 3,
      d = Math.ceil(n / h) + 3;
    for (const u of [this.rockBuf, this.rockTmp]) ((u.width = c), (u.height = d));
    ((this.edgeImg = this.tctx.createImageData(c, d)),
      (this.causticsPat = null),
      this.silt.resize(t, n, ee.SILT_RES * i));
  }
  get shade() {
    return this.lit.shade;
  }
  resetFx(t = []) {
    (this.flash.clear(),
      (this.jerk = null),
      (this.dieT = null),
      (this.bubbles.list = []),
      this.explored.reset(),
      this.finds.reset(t),
      (this.exploreT = 0),
      (this.flashT = null),
      (this.flashVeil = 0),
      (this.lit.flash.k = 0),
      (this.lit.flash.ready = !1));
  }
  photoExposure(state,view,frame,light) {
    const diver = state.diver;
    const pose = this.anim.pose(state, diver.x, diver.y, this.world, { dx: 0, dy: 0, rot: 0 });
    light.flash.compute(this.world, pose.torch.x, pose.torch.y, diver.aim);
    light.flash.k = 1;
    light.setup(state, diver.x, diver.y, pose.torch.x, pose.torch.y, diver.aim);
    const backscatter = light.backscatter(diver.aim);
    const photoView = {
      ox: view.ox + frame.x / view.zoom,
      oy: view.oy + frame.y / view.zoom,
      W: frame.size,
      H: frame.size,
      zoom: view.zoom,
    };
    return {light,view:photoView,backscatter};
  }
  previewPhoto(state,view,frame){
    this.previewLight??=new Zd(this.world,this.sky);
    return this.photoExposure(state,view,frame,this.previewLight);
  }
  shoot(state, view, number, frame) {
    const {light,view:photoView,backscatter}=this.photoExposure(state,view,frame,this.lit);
    const shot = this.finds.shoot(light, photoView, 0, backscatter >= Q.WHITE_MIN, number, backscatter, this.world.site.finds);
    this.explored.observe(light, view, Oi(view.W, state.tanks.length));
    this.flashT = 0;
    this.flashVeil = backscatter;
    return shot;
  }
  flashEnv(t) {
    return t <= Q.FLASH_S ? 1 : Math.max(0, 1 - (t - Q.FLASH_S) / Q.FLASH_FADE_S);
  }
  get flashing() {
    return this.lit.flash.k > 0;
  }
  drawAfterglow(t, n) {
    const o = this.flashT;
    if (o === null || o >= Q.AFTERGLOW_S) return;
    const s = 1 - o / Q.AFTERGLOW_S,
      i = Q.AFTERGLOW_A * s * s,
      a = n.W / 2,
      r = n.H / 2,
      l = Math.hypot(a, r);
    (t.save(), t.setTransform(1, 0, 0, 1, 0, 0), (t.globalCompositeOperation = "source-over"));
    const h = t.createRadialGradient(a, r, l * (0.25 + 0.2 * (1 - s)), a, r, l);
    (h.addColorStop(0, "rgba(248,252,255,0)"),
      h.addColorStop(0.55, `rgba(248,252,255,${(i * 0.45).toFixed(3)})`),
      h.addColorStop(1, `rgba(248,252,255,${i.toFixed(3)})`),
      (t.fillStyle = h),
      t.fillRect(0, 0, n.W, n.H),
      t.restore());
  }
  drawUntruth(t, n, o) {}
  onEvent(t) {
    t.type === "drop"
      ? this.flash.set(t.tank, 0)
      : t.type === "fail" && t.kind === "light" && t.phase === "active"
        ? (this.dieT = 0)
        : t.type === "pickup"
          ? this.flash.set(t.tank, 0)
          : t.type === "reelTug"
            ? (this.jerk = { t: 0, dx: t.dx, dy: t.dy, k: re(0.45 + t.speed, 0.5, 1) })
            : t.type === "failTug" &&
              (this.jerk = {
                t: 0,
                dx: t.dx,
                dy: t.dy,
                k: re(0.5 + t.speed, 0.6, 1) * (j.FAIL_JERK_M / j.REEL_JERK_M),
              });
  }
  flowSampler(t) {
    const n = Wi(t.env);
    return xr(n) ? (o, s, i) => So(this.world, n, o, s, i) : null;
  }
  freeflowStream(t) {
    const n = t.phase === "dive" && !t.dying ? rn(t, "freeflow") : null;
    return n
      ? n.phase === "active"
        ? { rate: Lt.FREEFLOW_PER_S, big: !0 }
        : { rate: Lt.FREEFLOW_WARN_PER_S, big: !1 }
      : { rate: 0, big: !1 };
  }
  observe(t, n, o = t.diver.x, s = t.diver.y) {
    const i = this.anim.pose(t, o, s, this.world, { dx: 0, dy: 0, rot: 0 });
    this.lit.setup(t, o, s, i.torch.x, i.torch.y, t.diver.aim);
    const a = Oi(n.W, t.tanks.length);
    this.explored.observe(this.lit, n, a);
  }
  jerkEnv() {
    const t = this.jerk;
    if (!t) return 0;
    const n = t.t / j.REEL_JERK_S;
    return n >= 1
      ? 0
      : (n < 0.22 ? Math.sin((n / 0.22) * Math.PI * 0.5) : Math.pow(1 - (n - 0.22) / 0.78, 2)) * t.k;
  }
  get particleCount() {
    return this.particles.drawn + this.bubbles.list.length;
  }
  warm(t, n, o, s) {
    this.anim.snap(t);
    const i = this.anim.pose(t, n, o, this.world, { dx: 0, dy: 0, rot: 0 }),
      a = this.freeflowStream(t);
    this.bubbles.simulate(
      this.world,
      i.mouth,
      s,
      this.breathPeriod(t),
      a.rate,
      a.big,
      this.flowSampler(t),
    );
  }
  breathPeriod(t) {
    const [n, o] = j.BREATH_PERIOD_S;
    return (n + (o - n) * t.diver.effort) / (t.dash ? X.DASH_BREATH : 1);
  }
  draw(t, n, o, s, i, a, r, l) {
    ((this.profT = performance.now()), this.anim.update(n, a, r));
    const h = this.anim.pose(n, s, i, this.world, this.shake(n, r));
    this.pose = h;
    const c = this.lit;
    if (
      (this.flashT !== null &&
        ((this.flashT += r), (c.flash.k = c.flash.ready ? this.flashEnv(this.flashT) : 0)),
      c.setup(n, s, i, h.torch.x, h.torch.y, n.diver.aim),
      (this.exploreT += r),
      this.exploreT >= Ne.EVERY_S)
    ) {
      this.exploreT = 0;
      const b = Oi(o.W, n.tanks.length);
      this.explored.observe(c, o, b);
    }
    const d = this.lf,
      u = this.flowSampler(n),
      f = { ctx: t, ppm: o.zoom, ox: o.ox, oy: o.oy, dpr: o.dpr };
    (t.setTransform(1, 0, 0, 1, 0, 0),
      (t.globalCompositeOperation = "source-over"),
      (t.globalAlpha = 1),
      (t.imageSmoothingEnabled = !0),
      this.drawWater(t, o, l),
      drawDiveBoat(t, o, this.world, l),
      this.drawLines(t, o, f),
      this.findsArt.draw(t, o, l, n.diver.aim),
      Pd(f, n),
      vd(f, n, h.reel, j.REEL_TWANG_M * this.jerkEnv(), l),
      Ba(f, n, this.world, h, l, this.jerkEnv(), "under"),
      (this.placed = []));
    for (const b of n.tanks) b.carried || this.placed.push({ id: b.id, pl: kd(t, o, this.world, b) });
    (this.silt.render(o, n.silt, l), this.lap("water"));
    const p = c.shade,
      m = o.zoom * this.lr;
    (Ld(this.lctx, c.beam, o.ox, o.oy, m, c.rgb),
      c.flash.k > 0 &&
        (c.flash.fill(this.fctx, o.ox, o.oy, m, c.flash.k),
        (this.lctx.globalCompositeOperation = "lighter"),
        this.lctx.drawImage(this.flashBuf, 0, 0),
        (this.lctx.globalCompositeOperation = "source-over")),
      p.paint(o),
      this.silt.empty || this.buildSiltLight(o),
      p.active &&
        ((this.lctx.globalCompositeOperation = "destination-out"),
        p.draw(this.lctx, "beam", o.ox, o.oy, m),
        (this.lctx.globalCompositeOperation = "source-over")),
      this.buildDark(o),
      this.drawSunRays(t, o, l));
    const y = ee.DARK_PAD_PX,
      _ = this.darkBuf.width - y * 2,
      g = this.darkBuf.height - y * 2;
    if (
      (t.drawImage(this.darkBuf, y, y, _, g, 0, 0, _ / this.lr, g / this.lr),
      this.silt.drawShade(t),
      this.silt.drawLit(t, this.siltLightBuf, this.lr),
      this.lap("light"),
      this.drawRock(t, o, l),
      this.lap("rock"),
      (t.globalCompositeOperation = "lighter"),
      this.blitHaze(t, o),
      (t.globalAlpha = 1),
      c.glow.a > 0)
    ) {
      const b = F.HALO_R_M * o.zoom;
      ((t.fillStyle = mn(
        t,
        ae(o, s),
        wt(o, i),
        b,
        F.HAZE_RGB.join(","),
        (F.HALO_A * c.glow.a) / F.GLOW_A,
      )),
        t.fill(c.glow.path(o.ox, o.oy, o.zoom)));
    }
    ((t.globalCompositeOperation = "source-over"),
      this.particles.draw(t, o, d, l, u, rs(Wi(n.env)) * Re),
      this.drawTankFx(t, o, h, r),
      this.particles.drawSiltSpecks(t, o, n.silt, d, l),
      this.lap("fx"),
      $a(f, n, this.world, h.reel, "glow"),
      this.drawDiverLit(t, o, n, h, i));
    const S = n.tanks[n.breathing],
      A = n.phase === "dive" && n.started && S.bar > 0 && !n.cesa && !n.dying,
      E = this.freeflowStream(n);
    (this.bubbles.update(
      this.world,
      h.mouth,
      a,
      n.timeScale,
      A,
      this.breathPeriod(n),
      h.regOut,
      E.rate,
      E.big,
      u,
    ),
      this.bubbles.draw(t, o, d),
      this.drawTorchGlow(t, o, h, c.look.lens * c.flick, r),
      Fd(f, n, s, i, d.silt(s, i)),
      Ba(f, n, this.world, h, l, this.jerkEnv(), "over"),
      $a(f, n, this.world, h.reel, "line"),
      Hd(f, n),
      this.drawVignette(t, o, n.depth),
      c.flash.k > 0 &&
        this.flashVeil > 0.02 &&
        ((t.fillStyle = `rgba(${Q.FLASH_RGB},${Math.min(1, this.flashVeil * c.flash.k * Q.WHITE_VEIL_A).toFixed(3)})`),
        t.fillRect(0, 0, o.W, o.H)),
      (t.globalCompositeOperation = "source-over"),
      (t.globalAlpha = 1),
      this.lap("diver"));
  }
  drawDiverLit(t, n, o, s, i) {
    const a = this.lit,
      r = 1 - (1 - a.self) * (1 - a.day(s.x, s.y));
    if (r > 0.99) {
      va(t, n, o, s);
      return;
    }
    const l = 1.7 * $.DIVER_SCALE,
      h = Math.ceil(l * n.zoom),
      c = this.diverBuf;
    (c.width < h * 2 || c.height < h * 2) && ((c.width = h * 2), (c.height = h * 2));
    const d = Math.floor((s.x - n.ox) * n.zoom) - h,
      u = Math.floor((s.y - n.oy) * n.zoom) - h,
      f = { ...n, ox: n.ox + d / n.zoom, oy: n.oy + u / n.zoom },
      p = this.bctx;
    (p.setTransform(1, 0, 0, 1, 0, 0),
      (p.globalCompositeOperation = "source-over"),
      (p.globalAlpha = 1),
      p.clearRect(0, 0, h * 2, h * 2),
      va(p, f, o, s),
      p.setTransform(1, 0, 0, 1, 0, 0),
      (p.globalCompositeOperation = "source-atop"));
    const [m, y, _] = Wo(i);
    ((p.fillStyle = `rgba(${m},${y},${_},${(1 - r).toFixed(3)})`),
      p.fillRect(0, 0, h * 2, h * 2),
      (p.globalCompositeOperation = "source-over"),
      t.drawImage(c, 0, 0, h * 2, h * 2, d, u, h * 2, h * 2));
  }
  drawTankFx(t, n, o, s) {
    (t.save(), (t.globalCompositeOperation = "lighter"));
    for (const { pl: i } of this.placed) {
      const a = this.lf.beam(i.strip.x, i.strip.y),
        r = Math.min(1, a * 3 + this.lf.ambient(i.strip.x, i.strip.y) * 0.22);
      if (r < 0.03) continue;
      const l = ae(n, i.strip.x),
        h = wt(n, i.strip.y),
        c = $.TANK_GLINT_R_M * n.zoom * (0.55 + 0.45 * Math.min(1, a * 2));
      ((t.fillStyle = mn(t, l, h, c, "255,252,236", $.TANK_GLINT_A * r * 0.75)),
        t.fillRect(l - c, h - c, c * 2, c * 2),
        (t.strokeStyle = `rgba(255,255,248,${($.TANK_GLINT_A * r).toFixed(3)})`),
        (t.lineWidth = Math.max(1, 0.018 * n.zoom)),
        t.beginPath(),
        t.moveTo(l - c * 1.4, h),
        t.lineTo(l + c * 1.4, h),
        t.moveTo(l, h - c * 0.9),
        t.lineTo(l, h + c * 0.9),
        t.stroke());
    }
    t.restore();
    for (const [i, a] of [...this.flash]) {
      const r = a + s;
      if (r > $.TANK_FLASH_S) {
        this.flash.delete(i);
        continue;
      }
      this.flash.set(i, r);
      const l = 1 - r / $.TANK_FLASH_S,
        h = this.placed.find((m) => m.id === i),
        c = h ? h.pl.cx : o.x,
        d = h ? h.pl.cy : o.y + 0.12,
        u = ae(n, c),
        f = wt(n, d);
      (t.save(), (t.globalCompositeOperation = "lighter"));
      const p = (0.55 + 0.9 * (1 - l)) * n.zoom;
      if (
        ((t.strokeStyle = `rgba(143,224,240,${(0.9 * l).toFixed(3)})`),
        (t.lineWidth = Math.max(2 * n.dpr, 0.05 * n.zoom)),
        t.beginPath(),
        t.arc(u, f, p, 0, Math.PI * 2),
        t.stroke(),
        (t.fillStyle = mn(t, u, f, 0.8 * n.zoom, "200,245,255", 0.45 * l)),
        t.fillRect(u - 0.8 * n.zoom, f - 0.8 * n.zoom, 1.6 * n.zoom, 1.6 * n.zoom),
        h)
      ) {
        const m = Math.cos(h.pl.ang),
          y = Math.sin(h.pl.ang),
          _ = n.zoom;
        (t.setTransform(m * _, y * _, -y * _, m * _, u, f),
          (t.strokeStyle = `rgba(220,250,255,${l.toFixed(3)})`),
          (t.lineWidth = Math.max(0.03, (2.2 * n.dpr) / _)));
        const g = h.pl.L + 0.08,
          S = h.pl.D + 0.08;
        (t.beginPath(),
          t.moveTo(-g / 2 + S / 2, -S / 2),
          t.lineTo(g / 2 - S / 2, -S / 2),
          t.arc(g / 2 - S / 2, 0, S / 2, -Math.PI / 2, Math.PI / 2),
          t.lineTo(-g / 2 + S / 2, S / 2),
          t.arc(-g / 2 + S / 2, 0, S / 2, Math.PI / 2, Math.PI * 1.5),
          t.closePath(),
          t.stroke());
      }
      t.restore();
    }
  }
  shake(t, n) {
    const o = Md(t) ?? this.oxShake(t, n);
    if (this.jerk) {
      this.jerk.t += n;
      const s = this.jerkEnv();
      if (this.jerk.t >= j.REEL_JERK_S) this.jerk = null;
      else
        return {
          dx: o.dx + this.jerk.dx * j.REEL_JERK_M * s,
          dy: o.dy + this.jerk.dy * j.REEL_JERK_M * s,
          rot: o.rot,
        };
    }
    return o;
  }
  oxShake(t, n) {
    const o = t.ox;
    if (o.phase !== "symptoms") return ((this.twitchLeft = 0), { dx: 0, dy: 0, rot: 0 });
    if (this.twitchLeft > 0)
      return (
        (this.twitchLeft -= n),
        { dx: this.twitchDx, dy: this.twitchDy, rot: this.twitchDx * 0.6 }
      );
    if (((this.twitchWait -= n), this.twitchWait <= 0)) {
      const [s, i] = j.OX_TWITCH_EVERY_S,
        a = o.limit > 0 ? Math.min(1, o.t / o.limit) : 0;
      ((this.twitchWait = (s + Math.random() * (i - s)) * (1 - 0.5 * a)),
        (this.twitchLeft = j.OX_TWITCH_S),
        (this.twitchDx = (Math.random() < 0.5 ? -1 : 1) * j.OX_TWITCH_M),
        (this.twitchDy = (Math.random() * 2 - 1) * j.OX_TWITCH_M * 0.6));
    }
    return { dx: 0, dy: 0, rot: 0 };
  }
  drawWater(t, n, o) {
    const a = t.createLinearGradient(0, wt(n, -6), 0, wt(n, 48)),
      r = (m) => re((m - -6) / 54, 0, 1);
    (a.addColorStop(0, I.sky[0]), a.addColorStop(r(-0.01), I.sky[1]));
    for (const [m, y] of I.water) a.addColorStop(r(m), y);
    ((t.fillStyle = a), t.fillRect(0, 0, n.W, n.H), this.tintWaters(t, n));
    const l = wt(n, 0);
    if (l < -30 || l > n.H + 30) return;
    const h = 0.9 * n.zoom,
      c = t.createLinearGradient(0, l, 0, l + h);
    (c.addColorStop(0, "rgba(236,252,255,0.5)"),
      c.addColorStop(1, "rgba(236,252,255,0)"),
      (t.fillStyle = c),
      t.fillRect(0, l, n.W, h));
    const d = Math.max(3, 4 * n.dpr),
      u = (m) => {
        const y = n.ox + m / n.zoom;
        return l + (Math.sin(y * 2.1 + o * 1.7) * 0.04 + Math.sin(y * 5.3 - o * 2.3) * 0.015) * n.zoom;
      };
    (t.beginPath(), t.moveTo(0, u(0)));
    for (let m = d; m <= n.W + d; m += d) t.lineTo(m, u(m));
    ((t.strokeStyle = "rgba(246,254,255,0.95)"),
      (t.lineWidth = 1.6 * n.dpr),
      t.stroke(),
      t.save(),
      (t.globalCompositeOperation = "lighter"));
    const { x0: f, x1: p } = this.opening;
    for (let m = 0; m < F.SURFACE_SPARKLES; m++) {
      const y = dt(m, 3, 91),
        _ = dt(m, 4, 91),
        g = Math.max(0, Math.sin(o * (1.3 + _ * 2.5) + y * 20));
      if (g < 0.25) continue;
      const S = f + (p - f) * y + Math.sin(o * 0.4 + m) * 0.3,
        A = ae(n, S),
        E = u(A) + (0.05 + _ * 0.35) * n.zoom,
        b = (0.12 + _ * 0.3) * n.zoom;
      ((t.strokeStyle = `rgba(255,255,255,${(g * 0.6).toFixed(3)})`),
        (t.lineWidth = Math.max(1, 0.025 * n.zoom)),
        t.beginPath(),
        t.moveTo(A - b / 2, E),
        t.lineTo(A + b / 2, E),
        t.stroke());
    }
    t.restore();
  }
  tintWaters(t, n) {
    const o = this.world.site.halocline;
    if (o === null) return;
    const s = n.oy;
    if (n.oy + n.H / n.zoom < o - 14 || s > o + 22) return;
    const a = wt(n, o),
      r = zt.STEP_M * n.zoom,
      [l, h, c] = zt.ABOVE_RGB,
      [d, u, f] = zt.BELOW_RGB,
      p = t.createLinearGradient(0, wt(n, o - 14), 0, a + r);
    (p.addColorStop(0, `rgba(${l},${h},${c},0)`),
      p.addColorStop(
        Math.max(0, 1 - (2 * r) / Math.max(1, a + r - wt(n, o - 14))),
        `rgba(${l},${h},${c},${zt.ABOVE_A})`,
      ),
      p.addColorStop(1, `rgba(${l},${h},${c},0)`),
      (t.fillStyle = p),
      t.fillRect(0, wt(n, o - 14), n.W, a + r - wt(n, o - 14)));
    const m = t.createLinearGradient(0, a - r, 0, wt(n, o + 22));
    (m.addColorStop(0, `rgba(${d},${u},${f},0)`),
      m.addColorStop(
        Math.min(1, (2 * r) / Math.max(1, wt(n, o + 22) - a + r)),
        `rgba(${d},${u},${f},${zt.BELOW_A})`,
      ),
      m.addColorStop(1, `rgba(${d},${u},${f},${zt.BELOW_A * 0.7})`),
      (t.fillStyle = m),
      t.fillRect(0, a - r, n.W, wt(n, o + 22) - a + r));
  }
  polyline(t, n, o, s, i, a) {
    if (o.length < 2) return;
    (t.beginPath(),
      o.forEach((l, h) =>
        h === 0 ? t.moveTo(ae(n, l.x), wt(n, l.y)) : t.lineTo(ae(n, l.x), wt(n, l.y)),
      ));
    const r = Math.max(a * n.dpr, i * n.zoom);
    ((t.strokeStyle = "rgba(10,16,20,0.4)"),
      (t.lineWidth = r + 1.2 * n.dpr),
      t.stroke(),
      (t.strokeStyle = s),
      (t.lineWidth = r),
      t.stroke());
  }
  knot(t, n, o, s, i, a) {
    const r = Math.max(1.5 * n.dpr, i * n.zoom);
    (t.beginPath(),
      t.arc(ae(n, o), wt(n, s), r, 0, Math.PI * 2),
      (t.fillStyle = a),
      t.fill(),
      (t.strokeStyle = "rgba(10,16,20,0.6)"),
      (t.lineWidth = Math.max(1, 0.012 * n.zoom)),
      t.stroke());
  }
  drawLines(t, n, o) {
    const s = this.world;
    (t.save(),
      (t.lineCap = "round"),
      (t.lineJoin = "round"),
      this.polyline(t, n, s.guide, I.guideLine, 0.03, 1.2));
    for (const a of s.guide) this.knot(t, n, a.x, a.y, 0.05, "#ffffff");
    const i = s.guide[0];
    if (i) {
      const a = ae(n, i.x),
        r = wt(n, 0),
        l = 0.42 * n.zoom,
        h = 0.26 * n.zoom;
      ((t.fillStyle = "#ff7a2f"),
        (t.strokeStyle = "rgba(40,14,0,0.8)"),
        (t.lineWidth = Math.max(1, 0.02 * n.zoom)),
        t.beginPath(),
        t.ellipse(a, r - h * 0.15, l / 2, h / 2, 0, 0, Math.PI * 2),
        t.fill(),
        t.stroke(),
        (t.fillStyle = "rgba(255,220,180,0.85)"),
        t.beginPath(),
        t.ellipse(a - l * 0.15, r - h * 0.35, l * 0.16, h * 0.12, -0.3, 0, Math.PI * 2),
        t.fill());
    }
    for (const a of s.olds) {
      const r = a.year < en.DARK_BEFORE ? en.OLD : I.oldLine;
      this.polyline(t, n, a.pts, r, a.year < en.DARK_BEFORE ? 0.02 : 0.025, 1.1);
      const l = a.pts[a.pts.length - 1];
      if (l && a.arrow) {
        const h = ae(n, l.x),
          c = wt(n, l.y),
          d = n.zoom;
        (t.beginPath(),
          t.moveTo(h, c),
          t.bezierCurveTo(
            h + 0.25 * d,
            c + 0.2 * d,
            h + 0.05 * d,
            c + 0.45 * d,
            h + 0.18 * d,
            c + 0.7 * d,
          ),
          (t.strokeStyle = r),
          (t.lineWidth = Math.max(1.1 * n.dpr, 0.025 * d)),
          t.stroke());
      }
      for (const h of a.pts) this.knot(t, n, h.x, h.y, 0.04, r);
      if (l && a.arrow) {
        const h = ol(a);
        (Bo(o, l.x, l.y, h.dx, h.dy, "#e8e2cf"), a.end && Ll(t, n, l.x + 0.36, l.y - 0.12));
      }
    }
    t.restore();
  }
  buildDark(t) {
    const n = this.dctx,
      o = this.darkBuf.width,
      s = this.darkBuf.height,
      i = t.zoom * this.lr,
      a = ee.DARK_PAD_PX;
    (n.setTransform(1, 0, 0, 1, a, a),
      (n.globalAlpha = 1),
      (n.imageSmoothingEnabled = !0),
      (n.globalCompositeOperation = "copy"));
    const r = n.createLinearGradient(0, -t.oy * i, 0, (48 - t.oy) * i);
    for (const [l, h] of F.DARK_COLORS) r.addColorStop(re(l / 48, 0, 1), Ga(h, F.DARK_A));
    ((n.fillStyle = r),
      n.fillRect(-a, -a, o, s),
      (n.globalCompositeOperation = "destination-out"),
      n.drawImage(this.lightBuf, 0, 0),
      this.lit.glow.fill(n, t.ox, t.oy, i, "0,0,0"),
      this.shade.active &&
        U.SIGHT_HARDNESS > 0 &&
        ((n.globalCompositeOperation = "source-over"),
        (n.globalAlpha = re(U.SIGHT_HARDNESS, 0, 1)),
        this.shade.draw(n, "occ", t.ox, t.oy, i),
        (n.globalAlpha = 1),
        (n.globalCompositeOperation = "destination-out")),
      this.drawSky(n, t, i),
      (n.globalCompositeOperation = "source-over"),
      n.setTransform(1, 0, 0, 1, 0, 0));
  }
  drawSky(t, n, o) {
    const s = this.sky,
      i = (s.y0 - n.oy) * o;
    if (i > 0) {
      const a = ee.DARK_PAD_PX;
      ((t.fillStyle = "#000"), t.fillRect(-a, -a, t.canvas.width + a, Math.ceil(i) + a));
    }
    t.drawImage(s.canvas, 0, 0, s.gw, s.gh, -n.ox * o, i, s.gw * s.cell * o, s.gh * s.cell * o);
  }
  buildSiltLight(t) {
    const n = this.sctx,
      o = t.zoom * this.lr;
    (n.setTransform(1, 0, 0, 1, 0, 0),
      (n.globalAlpha = 1),
      (n.imageSmoothingEnabled = !0),
      (n.globalCompositeOperation = "copy"),
      n.drawImage(this.lightBuf, 0, 0),
      (n.globalCompositeOperation = "source-over"),
      this.lit.glow.fill(n, t.ox, t.oy, o, "0,0,0"),
      this.shade.active &&
        ((n.globalCompositeOperation = "destination-out"), this.shade.draw(n, "sc", t.ox, t.oy, o)),
      (n.globalCompositeOperation = "source-over"),
      (n.globalAlpha = j.SILT_DAY_K),
      this.drawSky(n, t, o),
      (n.globalAlpha = 1));
  }
  blitHaze(t, n) {
    const o = this.world.site.halocline,
      s = o === null ? NaN : wt(n, o);
    if (!(s > 0 && s < n.H)) {
      ((t.globalAlpha = F.HAZE_A * (o === null ? 1 : n.oy > o ? zt.HAZE_BELOW_K : zt.HAZE_ABOVE_K)),
        this.blitBeam(t, n));
      return;
    }
    for (const [i, a, r] of [
      [0, s, zt.HAZE_ABOVE_K],
      [s, n.H, zt.HAZE_BELOW_K],
    ])
      (t.save(),
        t.beginPath(),
        t.rect(0, i, n.W, a - i),
        t.clip(),
        (t.globalAlpha = F.HAZE_A * r),
        this.blitBeam(t, n),
        t.restore());
  }
  blitBeam(t, n) {
    let { x0: o, y0: s, x1: i, y1: a } = this.lit.beam.bounds();
    if (this.lit.flash.k > 0) {
      const u = this.lit.flash.bounds();
      ((o = Math.min(o, u.x0)),
        (s = Math.min(s, u.y0)),
        (i = Math.max(i, u.x1)),
        (a = Math.max(a, u.y1)));
    }
    const r = n.zoom * this.lr,
      l = re(Math.floor((o - n.ox) * r) - 2, 0, this.lightBuf.width),
      h = re(Math.floor((s - n.oy) * r) - 2, 0, this.lightBuf.height),
      c = re(Math.ceil((i - n.ox) * r) + 2, 0, this.lightBuf.width),
      d = re(Math.ceil((a - n.oy) * r) + 2, 0, this.lightBuf.height);
    c <= l ||
      d <= h ||
      t.drawImage(
        this.lightBuf,
        l,
        h,
        c - l,
        d - h,
        l / this.lr,
        h / this.lr,
        (c - l) / this.lr,
        (d - h) / this.lr,
      );
  }
  drawSunRays(t, n, o) {
    if (n.oy > F.SUN_RAYS_MAX_M) return;
    const { x0: s, x1: i } = this.opening;
    if (i <= s) return;
    const a = F.SUN_RAYS,
      r = (F.SKY_TILT_DEG * Math.PI) / 180;
    (t.save(), (t.globalCompositeOperation = "lighter"));
    for (let l = 0; l < a; l++) {
      const h = dt(l, 1, 57),
        c = dt(l, 2, 57),
        d = dt(l, 3, 57),
        u = dt(l, 4, 57),
        f =
          s + ((i - s) * (l + 0.5)) / a + (h - 0.5) * 1.6 + Math.sin(o * 0.23 + l * 1.9) * F.SUN_SWAY_M,
        p = (F.SUN_RAY_LEN_M[0] + (F.SUN_RAY_LEN_M[1] - F.SUN_RAY_LEN_M[0]) * c) * n.zoom,
        m = (F.SUN_RAY_W_M[0] + (F.SUN_RAY_W_M[1] - F.SUN_RAY_W_M[0]) * d) * n.zoom,
        y = -r + (u - 0.5) * 0.14 + Math.sin(o * 0.17 + l) * 0.025;
      t.globalAlpha = F.SUN_RAY_A * (0.6 + 0.4 * Math.sin(o * (0.3 + h * 0.4) + l * 2.1));
      const _ = Math.cos(y),
        g = Math.sin(y),
        S = m / this.sunRay.width,
        A = p / this.sunRay.height;
      (t.setTransform(_ * S, g * S, -g * A, _ * A, ae(n, f), wt(n, 0)),
        t.drawImage(this.sunRay, -this.sunRay.width / 2, 0));
    }
    t.restore();
  }
  drawTorchGlow(t, n, o, s = 1, i = 0) {
    let a = s;
    if (this.dieT !== null) {
      this.dieT += i;
      const d = this.dieT / Zn.DIE_FLASH_S;
      d >= 1 ? (this.dieT = null) : (a = Math.max(a, Zn.DIE_FLASH_A * (1 - d) * (1 - d)));
    }
    if (a <= 0.01) return;
    const r = ae(n, o.torch.x),
      l = wt(n, o.torch.y),
      h = F.TORCH_GLOW_R_M * n.zoom * (0.5 + 0.5 * a);
    (t.save(),
      (t.globalCompositeOperation = "lighter"),
      (t.fillStyle = mn(t, r, l, h, F.HAZE_RGB.join(","), F.TORCH_GLOW_A * 0.55 * a)),
      t.fillRect(r - h, l - h, h * 2, h * 2));
    const c = Math.max(2 * n.dpr, 0.09 * n.zoom);
    ((t.fillStyle = mn(t, r, l, c, "255,255,245", F.TORCH_GLOW_A * Math.max(0.25, a))),
      t.fillRect(r - c, l - c, c * 2, c * 2),
      t.restore());
  }
  drawVignette(t, n, o) {
    const s = re((o - F.VIGNETTE_FROM_M) / (F.VIGNETTE_FULL_M - F.VIGNETTE_FROM_M), 0, 1);
    if (s <= 0) return;
    const i = n.W / 2,
      a = n.H * st.CAM_ANCHOR_Y,
      r = Math.hypot(Math.max(i, n.W - i), Math.max(a, n.H - a)),
      l = t.createRadialGradient(i, a, r * 0.42, i, a, r);
    (l.addColorStop(0, "rgba(1,5,10,0)"),
      l.addColorStop(0.55, `rgba(1,5,10,${(F.VIGNETTE_A * s * 0.45).toFixed(3)})`),
      l.addColorStop(1, `rgba(1,5,10,${(F.VIGNETTE_A * s).toFixed(3)})`),
      (t.fillStyle = l),
      t.fillRect(0, 0, n.W, n.H));
  }
  drawRock(t, n, o) {
    const s = st.ROCK_PPM,
      i = n.zoom / s,
      a = this.rock,
      r = Math.floor(n.ox * s),
      l = Math.floor((n.oy - a.originY) * s),
      h = Math.min(this.rockBuf.width, Math.ceil(n.W / i) + 2),
      c = Math.min(this.rockBuf.height, Math.ceil(n.H / i) + 2),
      d = r / s,
      u = l / s + a.originY,
      f = this.rctx;
    (f.setTransform(1, 0, 0, 1, 0, 0),
      (f.globalAlpha = 1),
      (f.globalCompositeOperation = "source-over"),
      (f.imageSmoothingEnabled = !1),
      f.clearRect(0, 0, this.rockBuf.width, this.rockBuf.height),
      Is(f, this.rockBase, r, l, h, c));
    const p = this.tctx;
    (p.setTransform(1, 0, 0, 1, 0, 0), (p.globalAlpha = 1));
    const m = this.edgeImg;
    (dd(a.data, this.surf, r, l, h, c, m.data, m.width, this.edgeWork),
      (p.globalCompositeOperation = "source-over"),
      p.clearRect(0, 0, this.rockTmp.width, this.rockTmp.height),
      p.putImageData(m, 0, 0, 0, 0, h, c),
      (p.globalCompositeOperation = "source-in"),
      (p.imageSmoothingEnabled = !1),
      Is(p, a.edge, r, l, h, c),
      (p.globalCompositeOperation = "source-over"),
      (f.globalCompositeOperation = "source-over"),
      (f.imageSmoothingEnabled = !1),
      f.drawImage(this.rockTmp, 0, 0),
      (f.globalCompositeOperation = "lighter"),
      (f.globalAlpha = F.EDGE_GLOW_A),
      f.drawImage(this.rockTmp, 0, 0),
      (f.globalAlpha = 1),
      n.oy < F.CAUSTICS_MAX_M && this.drawCaustics(r, l, h, c, d, u, o),
      (f.globalCompositeOperation = "source-over"));
    const y = r * i - n.ox * n.zoom,
      _ = (l + a.originY * s) * i - n.oy * n.zoom;
    if (Math.abs(i - Math.round(i)) < 1e-6) {
      ((t.imageSmoothingEnabled = !1),
        t.drawImage(this.rockBuf, 0, 0, h, c, Math.round(y), Math.round(_), h * i, c * i),
        (t.imageSmoothingEnabled = !0));
      return;
    }
    const S = Math.ceil(i),
      A = this.rockUp;
    (A.width < h * S || A.height < c * S) &&
      ((A.width = Math.max(A.width, h * S)), (A.height = Math.max(A.height, c * S)));
    const E = this.uctx;
    (E.setTransform(1, 0, 0, 1, 0, 0),
      (E.globalCompositeOperation = "copy"),
      (E.imageSmoothingEnabled = !1),
      E.drawImage(this.rockBuf, 0, 0, h, c, 0, 0, h * S, c * S),
      (E.globalCompositeOperation = "source-over"),
      (t.imageSmoothingEnabled = !0),
      (t.imageSmoothingQuality = "low"),
      t.drawImage(A, 0, 0, h * S, c * S, y, _, h * i, c * i));
  }
  bakeRockBase() {
    const t = this.rock.rock,
      n = st.ROCK_PPM,
      [o, s] = fe(),
      [i, a] = fe();
    ((o.width = i.width = t.width), (o.height = i.height = t.height), s.drawImage(t, 0, 0));
    const r = this.rock.originY,
      l = a.createLinearGradient(0, -r * n, 0, (48 - r) * n);
    for (const [c, d] of F.DARK_COLORS) l.addColorStop(re(c / 48, 0, 1), Ga(d, F.DARK_A));
    ((a.fillStyle = l), a.fillRect(0, 0, i.width, i.height));
    const h = this.sky;
    return (
      (a.globalCompositeOperation = "destination-out"),
      (a.imageSmoothingEnabled = !0),
      a.drawImage(h.canvas, 0, 0, h.gw, h.gh, 0, (h.y0 - r) * n, h.gw * h.cell * n, h.gh * h.cell * n),
      (s.globalCompositeOperation = "source-atop"),
      s.drawImage(i, 0, 0),
      o
    );
  }
  drawCaustics(t, n, o, s, i, a, r) {
    const l = this.tctx,
      h = st.ROCK_PPM;
    this.causticsPat || (this.causticsPat = l.createPattern(this.caustics, "repeat"));
    const c = this.causticsPat;
    if (!c) return;
    const d = F.CAUSTICS_TILE_PX;
    (l.setTransform(1, 0, 0, 1, 0, 0),
      (l.globalAlpha = 1),
      (l.imageSmoothingEnabled = !0),
      F.CAUSTICS_SPEED.forEach(([p, m], y) => {
        const _ = (((-t + r * p * h + y * 31) % d) + d) % d,
          g = (((-n + r * m * h + y * 17) % d) + d) % d;
        (c.setTransform(new DOMMatrix([1, 0, 0, 1, _, g])),
          (l.fillStyle = c),
          (l.globalCompositeOperation = y === 0 ? "copy" : "lighter"),
          l.fillRect(0, 0, o, s));
      }),
      (l.globalCompositeOperation = "destination-in"),
      (l.imageSmoothingEnabled = !0));
    const u = this.sky;
    (l.drawImage(
      u.canvas,
      0,
      0,
      u.gw,
      u.gh,
      -i * h,
      (u.y0 - a) * h,
      u.gw * u.cell * h,
      u.gh * u.cell * h,
    ),
      (l.globalCompositeOperation = "destination-in"),
      (l.imageSmoothingEnabled = !1),
      Is(l, this.rock.edge, t, n, o, s),
      (l.globalCompositeOperation = "source-over"));
    const f = this.rctx;
    ((f.globalCompositeOperation = "lighter"),
      (f.globalAlpha = F.CAUSTICS_A),
      f.drawImage(this.rockTmp, 0, 0, o, s, 0, 0, o, s),
      (f.globalAlpha = 1));
  }
}
