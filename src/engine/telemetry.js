const Ja = { back: I.teal, stage: "#7fb3ff", deco: I.ean50 };
function Jf(e, t, n, o) {
  const s = Math.min(3, window.devicePixelRatio || 1);
  ((e.width = Math.round(n * s)),
    (e.height = Math.round(o * s)),
    (e.style.width = `${n}px`),
    (e.style.height = `${o}px`));
  const i = e.getContext("2d");
  (i.setTransform(s, 0, 0, s, 0, 0), i.clearRect(0, 0, n, o));
  const a = 30,
    r = 10,
    l = 10,
    h = 20,
    c = n - a - r,
    d = o - l - h,
    u = t.profile,
    f = Math.max(t.t, u.length ? u[u.length - 1].t : 0, 1),
    p = Math.max(10, Math.ceil((t.maxDepth + 1) / 10) * 10),
    m = f > 420 ? 120 : 60,
    y = Math.max(m, Math.ceil(f / m) * m),
    _ = (T) => a + (T / y) * c,
    g = (T) => l + (T / p) * d;
  ((i.font = "10px ui-monospace, Menlo, Consolas, monospace"), (i.textBaseline = "middle"));
  for (let T = 0; T <= p; T += 10)
    ((i.strokeStyle = T === 0 ? "rgba(160,220,235,0.45)" : "rgba(160,220,235,0.12)"),
      i.beginPath(),
      i.moveTo(a, Math.round(g(T)) + 0.5),
      i.lineTo(a + c, Math.round(g(T)) + 0.5),
      i.stroke(),
      (i.fillStyle = "rgba(200,230,240,0.6)"),
      (i.textAlign = "right"),
      i.fillText(`${T}`, a - 5, g(T)));
  i.textAlign = "center";
  for (let T = 0; T <= y; T += m)
    ((i.strokeStyle = "rgba(160,220,235,0.1)"),
      i.beginPath(),
      i.moveTo(Math.round(_(T)) + 0.5, l),
      i.lineTo(Math.round(_(T)) + 0.5, l + d),
      i.stroke(),
      (i.fillStyle = "rgba(200,230,240,0.6)"),
      (i.textAlign = T === 0 ? "left" : T >= y ? "right" : "center"),
      i.fillText(me(T), _(T) + (T === 0 ? -2 : T >= y ? 2 : 0), l + d + 11));
  ((i.textAlign = "center"),
    i.save(),
    i.setLineDash([4, 3]),
    (i.strokeStyle = I.red),
    (i.lineWidth = 1.2),
    i.beginPath());
  let S = !1;
  for (const T of u)
    T.c > 0.05 ? (S ? i.lineTo(_(T.t), g(T.c)) : i.moveTo(_(T.t), g(T.c)), (S = !0)) : (S = !1);
  (i.stroke(), i.restore(), (i.lineWidth = 2), (i.lineJoin = "round"));
  for (let T = 1; T < u.length; T++) {
    const k = u[T - 1],
      w = u[T];
    ((i.strokeStyle = Ja[w.g]),
      i.beginPath(),
      i.moveTo(_(k.t), g(k.d)),
      i.lineTo(_(w.t), g(w.d)),
      i.stroke());
  }
  const A = (T) => {
    const k = _(T.t),
      w = g(T.d);
    if (T.type === "gas" || T.type === "pickup" || T.type === "drop" || T.type === "clip") {
      const L = T.type === "clip" ? "#e8e2cf" : (Ja[T.info ?? "back"] ?? I.teal),
        R = T.type === "pickup" || T.type === "drop";
      (i.beginPath(),
        i.moveTo(k, w - 5),
        i.lineTo(k + 5, w),
        i.lineTo(k, w + 5),
        i.lineTo(k - 5, w),
        i.closePath(),
        R
          ? ((i.fillStyle = "rgba(0,0,0,0.45)"), i.fill(), (i.strokeStyle = L), (i.lineWidth = 1.6))
          : ((i.fillStyle = L), i.fill(), (i.strokeStyle = "rgba(0,0,0,0.6)"), (i.lineWidth = 1)),
        i.stroke());
    } else
      T.type === "alarm"
        ? ((i.fillStyle = I.red),
          i.beginPath(),
          i.moveTo(k, l + 1),
          i.lineTo(k + 4, l + 7),
          i.lineTo(k - 4, l + 7),
          i.closePath(),
          i.fill())
        : T.type === "dead"
          ? ((i.strokeStyle = I.red),
            (i.lineWidth = 2.5),
            i.beginPath(),
            i.moveTo(k - 6, w - 6),
            i.lineTo(k + 6, w + 6),
            i.moveTo(k + 6, w - 6),
            i.lineTo(k - 6, w + 6),
            i.stroke())
          : T.type === "surfaced" &&
            ((i.strokeStyle = "#ffffff"),
            (i.lineWidth = 1.5),
            i.beginPath(),
            i.arc(k, g(0), 4, 0, Math.PI * 2),
            i.stroke());
  };
  for (const T of t.log) A(T);
  const E = t.t;
  t.fail.list.forEach((T, k) => {
    if (T.warnT < 0) return;
    const w = l + 10 + (k % 2) * 7,
      L = T.activeT >= 0 ? T.activeT : T.fixT >= 0 ? T.fixT : E,
      R = T.fixT >= 0 ? T.fixT : E,
      P = _(T.warnT);
    (i.save(), i.setLineDash([2, 3]), (i.strokeStyle = "rgba(255,194,74,0.55)"), (i.lineWidth = 1));
    const v = u.find((N) => N.t >= T.warnT) ?? u[u.length - 1];
    (i.beginPath(),
      i.moveTo(Math.round(P) + 0.5, w),
      i.lineTo(Math.round(P) + 0.5, v ? g(v.d) : l + d),
      i.stroke(),
      i.restore(),
      (i.fillStyle = I.amber),
      i.fillRect(P, w - 2, Math.max(2, _(L) - P), 4),
      T.activeT >= 0 &&
        ((i.fillStyle = I.red), i.fillRect(_(T.activeT), w - 2, Math.max(2, _(R) - _(T.activeT)), 4)),
      T.fixT >= 0 && ((i.fillStyle = "#e6f5f7"), i.fillRect(_(T.fixT) - 1, w - 4, 2, 8)),
      (i.fillStyle = T.activeT >= 0 ? I.red : I.amber),
      (i.font = "700 9px system-ui, sans-serif"),
      (i.textAlign = "right"),
      i.fillText(T.kind === "freeflow" ? "П" : T.kind === "light" ? "Ф" : "Л", P - 2, w));
  });
  let b = u[0];
  for (const T of u) (!b || T.d > b.d) && (b = T);
  b &&
    ((i.fillStyle = "rgba(230,245,248,0.85)"),
    (i.textAlign = b.t > y * 0.6 ? "right" : "left"),
    i.fillText(
      `${t.maxDepth.toFixed(1)} м`,
      _(b.t) + (b.t > y * 0.6 ? -6 : 6),
      Math.min(l + d - 6, g(b.d) + 9),
    ));
}
const Qf = "zz32rle-v1";
const Uo = (() => {
  let e = "";
  for (let t = 33; t <= 126; t++) t !== 34 && t !== 92 && (e += String.fromCharCode(t));
  return e;
})();
const zi = Uo.slice(0, 32);
const io = Uo.slice(32, 64);
const qn = Uo.slice(64);
const tu = qn.length + 1;
const Qa = (() => {
  const e = new Int8Array(128).fill(-1),
    t = new Int16Array(128);
  for (let n = 0; n < 32; n++)
    ((e[zi.charCodeAt(n)] = 0),
      (t[zi.charCodeAt(n)] = n),
      (e[io.charCodeAt(n)] = 1),
      (t[io.charCodeAt(n)] = n));
  for (let n = 0; n < qn.length; n++) ((e[qn.charCodeAt(n)] = 2), (t[qn.charCodeAt(n)] = n + 2));
  return { kind: e, val: t };
})();
class tr {
  constructor(t) {
    M(this, "ncols");
    M(this, "prev");
    M(this, "parts", []);
    M(this, "zeros", 0);
    M(this, "frames", 0);
    M(this, "chars", 0);
    ((this.ncols = t), (this.prev = new Int32Array(t)));
  }
  push(t) {
    for (let n = 0; n < this.ncols; n++) {
      const o = t[n] | 0,
        s = o - this.prev[n];
      if (((this.prev[n] = o), s === 0)) {
        this.zeros++;
        continue;
      }
      this.flushZeros();
      let i = s >= 0 ? s * 2 : -s * 2 - 1,
        a = "";
      for (; i >= 32; ) ((a += io[i % 32]), (i = Math.floor(i / 32)));
      ((a += zi[i]), this.parts.push(a), (this.chars += a.length));
    }
    this.frames++;
  }
  flushZeros() {
    for (; this.zeros > 0; )
      if (this.zeros === 1) (this.parts.push(zi[0]), this.chars++, (this.zeros = 0));
      else {
        const t = Math.min(this.zeros, tu);
        (this.parts.push(qn[t - 2]), this.chars++, (this.zeros -= t));
      }
  }
  text() {
    this.flushZeros();
    const t = this.parts.join("");
    return ((this.parts = t ? [t] : []), t);
  }
}
function eu(e, t) {
  const n = [];
  let o = [];
  const s = new Array(t).fill(0);
  let i = 0,
    a = 1;
  const r = (l) => {
    const h = o.length,
      c = s[h] + l;
    ((s[h] = c), o.push(c), o.length === t && (n.push(o), (o = [])));
  };
  for (let l = 0; l < e.length; l++) {
    const h = e.charCodeAt(l),
      c = h < 128 ? Qa.kind[h] : -1;
    if (c < 0) throw new Error(`телеметрия: неизвестный символ «${e[l]}» в куске`);
    const d = Qa.val[h];
    if (c === 1) ((i += d * a), (a *= 32));
    else if (c === 0) {
      const u = i + d * a;
      ((i = 0), (a = 1), r(u % 2 === 0 ? u / 2 : -(u + 1) / 2));
    } else for (let u = 0; u < d; u++) r(0);
  }
  if (o.length) throw new Error("телеметрия: кусок оборван на середине кадра");
  return n;
}
function Ul(e, t) {
  const n = t.lx !== void 0 && t.ly !== void 0 ? Math.hypot(e[t.lx], e[t.ly]) : 0;
  return Math.hypot(e[t.sx], e[t.sy]) >= Tt.IDLE_STICK || n >= Tt.IDLE_STICK || e[t.btn] !== 0;
}
function ms(e) {
  const t = e.meta.cols,
    n = t.map((i) => i.name),
    o = {};
  n.forEach((i, a) => (o[i] = a));
  const s = [];
  for (const i of e.chunks) for (const a of eu(i.f, t.length)) s.push(a.map((r, l) => r / t[l].scale));
  return { names: n, col: o, rows: s };
}
function nu(e) {
  const t = ms(e);
  return t.rows.map((n) => Object.fromEntries(t.names.map((o, s) => [o, n[s]])));
}
function ys(e) {
  return e.chunks.flatMap((t) => t.e);
}
function iu(e) {
  return e > Tt.TURN_TOL_BAR ? "early" : e < -5 ? "late" : "on";
}
function su(e) {
  const t = [],
    n = new Map();
  for (const o of e)
    if (o.e === "fail") {
      const s = o.kind;
      if (o.phase === "warn") {
        const i = {
          kind: s,
          warnT: o.t,
          pressT: null,
          latency: null,
          pressedIn: null,
          activeT: null,
          fixT: null,
          early: !1,
        };
        (t.push(i), n.set(s, i));
      } else if (o.phase === "active") {
        const i = n.get(s);
        i && (i.activeT = o.t);
      } else if (o.phase === "fixed") {
        const i = n.get(s);
        i && ((i.fixT = o.t), (i.early = !!o.early), n.delete(s));
      }
    } else if (o.e === "press") {
      if (o.held) continue;
      const s = n.get(o.kind);
      s &&
        s.pressT === null &&
        o.t >= s.warnT &&
        ((s.pressT = o.t),
        (s.latency = Math.round((o.t - s.warnT) * 100) / 100),
        (s.pressedIn = o.phase === "active" ? "active" : "warn"));
    }
  return t;
}
function ou(e, t, n) {
  const o = e.filter((r) => r.e === "shot"),
    s = [];
  if (o.length)
    for (const r of o)
      for (const l of Array.isArray(r.finds) ? r.finds : [])
        s.some((h) => h.id === l) || s.push({ id: l, t: r.t, prog: Number(r.prog ?? 0) });
  else
    for (const r of e) r.e === "find" && s.push({ id: String(r.id), t: r.t, prog: Number(r.prog ?? 0) });
  const i = [];
  for (const r of e)
    if (r.e === "read")
      if (r.on) i.push({ note: String(r.note), t: r.t, dur: null });
      else {
        const l = [...i].reverse().find((h) => h.note === r.note && h.dur === null);
        l && (l.dur = Math.round((r.t - l.t) * 100) / 100);
      }
  const a = t ? t.ties : e.filter((r) => r.e === "tie" && r.kind === "off").length;
  return { finds: s, reads: i, ties: a, lineBeyondM: n === null ? null : Math.round(n * 10) / 10 };
}
function au(e) {
  const t = [];
  for (const o of e) {
    if (o.e !== "shot") continue;
    const s = (i) => (Array.isArray(i) ? i.map(String) : []);
    t.push({
      n: Number(o.n ?? t.length + 1),
      t: o.t,
      finds: s(o.finds),
      fresh: s(o.fresh),
      white: typeof o.white == "boolean" ? o.white : null,
      silt: Number(o.silt ?? 0),
    });
  }
  const n = [];
  for (const o of t) for (const s of o.fresh) n.includes(s) || n.push(s);
  return {
    shots: t.length,
    fresh: t.filter((o) => o.fresh.length > 0).length,
    freshFinds: n,
    white: t.filter((o) => o.white === !0).length,
    empty: t.filter((o) => o.white !== !0 && o.finds.length === 0).length,
    list: t,
  };
}
const ne = (e) => Math.round(e * 10) / 10;
const zn = (e) => Math.round(e * 100) / 100;
function so(e, t) {
  const { meta: n } = e,
    o = ms(e),
    s = o.rows,
    i = o.col,
    a = s.length,
    r = ys(e),
    l = (D) => 1 << n.bits.flags.indexOf(D),
    h = l("gallery"),
    c = l("stopBand"),
    d = l("auto"),
    u = l("blind"),
    f = l("line"),
    p = (D) => s[D][i.w],
    m = (D) => s[D][i.t],
    y = (D) => s[D][i.flags],
    _ = (D) => !Ul(s[D], i),
    g = r.find((D) => D.e === "rule"),
    S = [...r].reverse().find((D) => D.e === "turn");
  let A = 0,
    E = -1,
    b = 0,
    T = -1,
    k = -1,
    w = 0;
  for (let D = 0; D < a; D++) {
    const Z = s[D][i.prog];
    Z > A && ((A = Z), (E = D));
    const rt = s[D][i.d];
    (rt > b && ((b = rt), (w = D)), y(D) & h && (T < 0 && (T = D), (k = D)));
  }
  const L = g?.marks ?? {};
  let R;
  if (!g && T < 0)
    R = {
      state: "noGallery",
      t: null,
      w: null,
      x: null,
      d: null,
      p: null,
      verdict: null,
      tanks: [],
      count: 0,
    };
  else if (S) {
    const D = S.bars ?? {},
      Z = [];
    for (const lt of n.tanks) {
      const It = L[lt.id],
        Ft = D[lt.id];
      if (!It || It.length === 0 || Ft === void 0) continue;
      const Ot = ne(Ft - It[0]);
      Z.push({ id: lt.id, bar: Ft, mark: It[0], delta: Ot, verdict: iu(Ot) });
    }
    const rt = Z.find((lt) => lt.id === "back") ?? Z[0];
    R = {
      state: "ok",
      t: S.t,
      w: S.w,
      x: S.at[0],
      d: S.at[1],
      p: S.p ?? null,
      verdict: rt?.verdict ?? null,
      tanks: Z,
      count: t.turnCount ?? r.filter((lt) => lt.e === "turn").length,
    };
  } else {
    const D = E;
    R = {
      state: "noTurn",
      t: D >= 0 ? m(D) : null,
      w: D >= 0 ? p(D) : null,
      x: D >= 0 ? ne(s[D][i.x]) : null,
      d: D >= 0 ? ne(s[D][i.d]) : null,
      p: D >= 0 ? ne(A) : null,
      verdict: null,
      tanks: [],
      count: 0,
    };
  }
  const P = {
      descent: { t: 0, w: 0 },
      in: { t: 0, w: 0 },
      out: { t: 0, w: 0 },
      ascent: { t: 0, w: 0 },
      stops: { t: 0, w: 0 },
    },
    v = R.state === "ok" ? R.t : E >= 0 ? m(E) : 1 / 0,
    N = (D) =>
      T < 0
        ? D <= w
          ? "descent"
          : y(D) & c
            ? "stops"
            : "ascent"
        : D < T
          ? "descent"
          : D <= k
            ? (R.state === "noTurn" && k === a - 1) || m(D) <= v
              ? "in"
              : "out"
            : y(D) & c
              ? "stops"
              : "ascent";
  let O = 0,
    C = 0,
    W = 0,
    V = 0;
  const K = { t: 0, w: 0, noLineT: 0, noLineW: 0, episodes: 0, longestNoLineW: 0 };
  let B = 0;
  for (let D = 1; D < a; D++) {
    const Z = Math.max(0, p(D) - p(D - 1)),
      rt = Math.max(0, m(D) - m(D - 1)),
      lt = y(D - 1),
      It = P[N(D - 1)];
    ((It.t += rt), (It.w += Z));
    const Ft = _(D - 1);
    (lt & c && Ft && (O += Z),
      s[D - 1][i.ts] >= ut.ACCEL - 1e-6 && (C += Z),
      lt & d && (W += Z),
      Ft && !(lt & c) && !(lt & d) && m(D - 1) > 0 && (V += Z),
      lt & u
        ? ((K.t += rt),
          (K.w += Z),
          lt & f
            ? (B = 0)
            : ((K.noLineT += rt),
              (K.noLineW += Z),
              (B += Z),
              (K.longestNoLineW = Math.max(K.longestNoLineW, B))))
        : (B = 0));
  }
  for (let D = 0; D < a; D++) y(D) & u && (D === 0 || !(y(D - 1) & u)) && K.episodes++;
  const Y = t.stats ?? null,
    x = Y
      ? {
          stopsW: Y.waitWall,
          accelW: Y.accelWall,
          autoW: Y.autoWall,
          totalW: Y.waitWall + Y.autoWall,
          idleW: V,
          src: "stats",
        }
      : { stopsW: O, accelW: C, autoW: W, totalW: O + W, idleW: V, src: "frames" },
    G = { ruleBar: typeof g?.bar == "number" ? g.bar : null, marks: L, start: {}, end: {} };
  n.tanks.forEach((D) => {
    const Z = i[`bar.${D.id}`];
    Z === void 0 || a === 0 || ((G.start[D.id] = ne(s[0][Z])), (G.end[D.id] = ne(s[a - 1][Z])));
  });
  const J = { ...(t.counts ?? {}) };
  if (!t.counts) for (const D of r) J[D.e] = (J[D.e] ?? 0) + 1;
  const ot = (D) => Object.fromEntries(Object.entries(D).map(([Z, rt]) => [Z, zn(rt)]));
  return {
    complete: t.complete,
    frames: a,
    chars: e.chunks.reduce((D, Z) => D + Z.f.length + JSON.stringify(Z.e).length, 0),
    durT: a ? zn(m(a - 1)) : 0,
    durW: a ? zn(p(a - 1)) : 0,
    maxDepth: ne(b),
    reachM: ne(A),
    outcome: t.outcome ?? null,
    phases: Object.fromEntries(Object.entries(P).map(([D, Z]) => [D, ot(Z)])),
    waiting: {
      ...ot({ stopsW: x.stopsW, accelW: x.accelW, autoW: x.autoW, totalW: x.totalW, idleW: x.idleW }),
      src: x.src,
    },
    turn: R,
    reactions: su(r),
    blind: ot(K),
    stuck: lu(o, r, n.bits.flags, n.bits.btn),
    gas: G,
    counts: J,
    stats: Y ? { ...Y } : null,
    keyboard: t.keyboard ?? null,
    m7: { ...ou(r, Y, t.lineBeyondM ?? null), ...(t.lineTraps ? { lineTraps: t.lineTraps } : {}) },
    m9: au(r),
    tips: ru(r),
  };
}
function ru(e) {
  return e
    .filter((t) => t.e === "tip")
    .map((t) => ({
      id: String(t.id),
      t: t.t,
      pause: typeof t.pause == "number" ? t.pause : 0,
      urgent: t.urgent === !0,
    }));
}
function lu(e, t, n, o = []) {
  const { rows: s, col: i } = e,
    a = ["camera", "read"].reduce((p, m) => (o.includes(m) ? p | (1 << o.indexOf(m)) : p), 0),
    r = 1 << n.indexOf("stopBand"),
    l = 1 << n.indexOf("gallery"),
    h = 1 << n.indexOf("blind"),
    c = s.length,
    d = [],
    u = (p) => (s[p][i.flags] & r) !== 0 || s[p][i.t] <= 0;
  let f = 0;
  for (; f < c; ) {
    if (u(f)) {
      f++;
      continue;
    }
    const p = s[f][i.x],
      m = s[f][i.y];
    let y = f;
    for (; y + 1 < c && !u(y + 1) && Math.hypot(s[y + 1][i.x] - p, s[y + 1][i.y] - m) <= Tt.STUCK_R_M; )
      y++;
    const _ = s[y][i.w] - s[f][i.w];
    if (_ < Tt.STUCK_MIN_S) {
      f++;
      continue;
    }
    let g = 0,
      S = 0,
      A = 0,
      E = 0,
      b = 0;
    for (let R = f; R <= y; R++) {
      const P = s[R];
      ((g += P[i.x]),
        (S += P[i.d]),
        Ul(P, i) && !(P[i.btn] & a) && A++,
        P[i.flags] & h && E++,
        P[i.flags] & l && b++);
    }
    const T = y - f + 1,
      k = s[f][i.t],
      w = s[y][i.t],
      L = {};
    for (const R of t) R.t >= k && R.t <= w && R.e !== "accel" && (L[R.e] = (L[R.e] ?? 0) + 1);
    (d.push({
      x: ne(g / T),
      d: ne(S / T),
      t: ne(k),
      w: ne(_),
      input: zn(A / T),
      blind: zn(E / T),
      gallery: b * 2 > T,
      ev: L,
    }),
      (f = y + 1));
  }
  return d;
}
function hu(e) {
  const { w: t, h: n, airRows: o, cells: s } = e,
    i = Cr(e),
    a = new Float32Array(t * n).fill(1 / 0),
    r = (u, f) => u >= 0 && f >= 0 && u < t && f < n && s[f * t + u] === 0,
    l = [],
    h = (u) => {
      l.push(u);
      let f = l.length - 1;
      for (; f > 0; ) {
        const p = (f - 1) >> 1;
        if (a[l[p]] <= a[l[f]]) break;
        (([l[p], l[f]] = [l[f], l[p]]), (f = p));
      }
    },
    c = () => {
      const u = l[0],
        f = l.pop();
      if (l.length) {
        l[0] = f;
        let p = 0;
        for (;;) {
          const m = p * 2 + 1,
            y = m + 1;
          let _ = p;
          if (
            (m < l.length && a[l[m]] < a[l[_]] && (_ = m),
            y < l.length && a[l[y]] < a[l[_]] && (_ = y),
            _ === p)
          )
            break;
          (([l[_], l[p]] = [l[p], l[_]]), (p = _));
        }
      }
      return u;
    };
  for (const u of e.doors) {
    if (!Number.isFinite(u.x)) continue;
    const f = u.side > 0 ? Math.floor(u.x) : Math.ceil(u.x) - 1;
    for (let p = 0; p < n; p++) {
      const m = p - o + 0.5;
      m < u.yMin ||
        m > u.yMax ||
        !r(f, p) ||
        He(e.doorSet, f + 0.5, m) < 0 ||
        ((a[p * t + f] = 0), h(p * t + f));
    }
  }
  const d = new Uint8Array(t * n);
  for (; l.length; ) {
    const u = c();
    if (d[u]) continue;
    d[u] = 1;
    const f = u % t,
      p = (u - f) / t;
    for (let m = -1; m <= 1; m++)
      for (let y = -1; y <= 1; y++) {
        if (!y && !m) continue;
        const _ = f + y,
          g = p + m;
        if (!r(_, g) || (y && m && !r(f + y, p) && !r(f, p + m))) continue;
        const S = a[u] + (y && m ? Math.SQRT2 : 1),
          A = g * t + _;
        S < a[A] && ((a[A] = S), h(A));
      }
  }
  return { w: t, h: n, airRows: o, gateX: i, doors: e.doorSet, dist: a };
}
function Yi(e, t, n) {
  if (He(e.doors, t, n) < 0) return 0;
  const o = t - 0.5,
    s = n + e.airRows - 0.5,
    i = Math.floor(o),
    a = Math.floor(s),
    r = o - i,
    l = s - a;
  let h = 0,
    c = 0,
    d = 1 / 0;
  for (let u = 0; u < 4; u++) {
    const f = i + (u & 1),
      p = a + (u >> 1);
    if (f < 0 || p < 0 || f >= e.w || p >= e.h) continue;
    const m = e.dist[p * e.w + f];
    if (!Number.isFinite(m)) continue;
    const y = (u & 1 ? r : 1 - r) * (u >> 1 ? l : 1 - l);
    ((h += m * y), (c += y), (d = Math.min(d, m)));
  }
  return c > 1e-6 ? h / c : Number.isFinite(d) ? d : 0;
}
const cu = [
  "auto",
  "dash",
  "tie",
  "arrow",
  "valve",
  "torch",
  "untangle",
  "menu",
  "pick",
  "read",
  "camera",
  "wait",
];
const du = ["gallery", "stopBand", "auto", "blind", "line", "dash", "cesa", "ox"];
const Vl = ["ppo2High", "ppo2Low", "ceiling", "ascent", "gasOut"];
const Xl = ["main", "dead", "spare", "spareHi"];
const Vo = ["off", "live", "parked"];
const fu = ["cut", "out"];
const er = [
  { btn: "valve", kind: "freeflow" },
  { btn: "torch", kind: "light" },
  { btn: "untangle", kind: "entangle" },
];
function uu(e, t) {
  return [
    { name: "w", scale: 10, desc: "с — реальное время от начала нырка (часы симуляции с учётом ×4)" },
    { name: "t", scale: 10, desc: "с — время нырка (идёт с компьютера, глубже 1.2 м)" },
    { name: "x", scale: 10, desc: "м — по горизонтали" },
    { name: "y", scale: 10, desc: "м — центр дайвера, вниз от поверхности" },
    { name: "d", scale: 10, desc: "м — глубина (max(0, y))" },
    ...e.map((n) => ({ name: `bar.${n}`, scale: 10, desc: `бар — баллон ${n}` })),
    { name: "gas", scale: 1, desc: "индекс баллона, которым дышит (meta.tanks)" },
    { name: "ceil", scale: 10, desc: "м — потолок" },
    { name: "stop", scale: 1, desc: "м — стоп, который понадобится (0 — нет)" },
    {
      name: "gf",
      scale: 100,
      desc: "пересыщение: «GF на поверхности» (1.0 — на пределе M при выходе сейчас)",
    },
    ...Array.from({ length: t }, (n, o) => ({
      name: `tis${o}`,
      scale: 1e3,
      desc: `ткань ${o}, «воздушные» бар`,
    })),
    { name: "ppo2", scale: 100, desc: "бар — ppO2 газа, которым дышит" },
    { name: "sx", scale: 100, desc: "стик x, −1…1 (после кривой; то, что ушло в симуляцию)" },
    { name: "sy", scale: 100, desc: "стик y, −1…1 (+ вниз)" },
    {
      name: "lx",
      scale: 100,
      desc: "рука с фонарём x (M7c: направление стика × сила; во внутренней зоне стика — только она)",
    },
    { name: "ly", scale: 100, desc: "рука с фонарём y (+ вниз)" },
    { name: "btn", scale: 1, desc: "удерживаемые кнопки — маска meta.bits.btn" },
    { name: "asc", scale: 100, desc: "м/с — скорость подъёма (+ вверх, сглаженная, как у компьютера)" },
    { name: "silt", scale: 100, desc: "плотность мути у дайвера (0.45 — нулевая видимость)" },
    {
      name: "sight",
      scale: 10,
      desc: `м — докуда видно вдоль луча сквозь муть (свет гаснет до SILT.BEAM_CUT; не дальше ${Tt.SIGHT_MAX_M} м)`,
    },
    { name: "beam", scale: 10, desc: "м — докуда достаёт луч фонаря (камень, муть, дальность фонаря)" },
    { name: "fx", scale: 100, desc: "м/с — течение у дайвера по x" },
    { name: "fy", scale: 100, desc: "м/с — течение у дайвера по y" },
    { name: "torch", scale: 1, desc: "фонарь — индекс meta.codes.torch" },
    { name: "lnUsed", scale: 10, desc: "м — своя линия с катушки (закреплено + натянутый отрезок)" },
    { name: "lnLeft", scale: 10, desc: "м — осталось на катушке" },
    {
      name: "reel",
      scale: 1,
      desc: "катушка: младшие 2 бита — meta.codes.reel, дальше биты meta.codes.reelBits",
    },
    { name: "alarms", scale: 1, desc: "тревоги компьютера — маска meta.bits.alarms" },
    { name: "flags", scale: 1, desc: "состояние — маска meta.bits.flags (line — у линии ≤ 0.5 м)" },
    { name: "ts", scale: 10, desc: "× — ускорение времени (1, автоплыв, 4 на стопе)" },
    { name: "prog", scale: 10, desc: "м — путь по галерее от входа по воде (вне галереи 0)" },
  ];
}
const pu = (e) => (Number.isFinite(e) ? e : 0);
function mu(e, t, n, o, s = []) {
  const i = e.diver;
  ((s.length = 0), s.push(e.tWall, e.t, i.x, i.y, e.depth));
  for (const f of e.tanks) s.push(f.bar);
  s.push(e.breathing, e.ceiling, e.stop, pr(e.tissues));
  for (const f of e.tissues) s.push(f);
  s.push(es(On(e), e.depth));
  let a = 0;
  (t.auto && (a |= 1),
    t.dash && (a |= 2),
    t.tie && (a |= 4),
    t.arrow && (a |= 8),
    t.valve && (a |= 16),
    t.torch && (a |= 32),
    t.untangle && (a |= 64),
    t.menu && (a |= 128),
    t.pick !== null && (a |= 256),
    t.read && (a |= 512),
    t.camera && (a |= 1024),
    t.wait && (a |= 2048),
    s.push(t.x, t.y, t.lx ?? 0, t.ly ?? 0, a, e.ascRate, e.siltHere));
  const r = Math.cos(i.aim),
    l = Math.sin(i.aim);
  (s.push(Br(e.silt, i.x, i.y, r, l, Tt.SIGHT_MAX_M)),
    s.push(kc(e.silt, n, i.x, i.y, r, l, oi(e))),
    s.push(e.flow.x, e.flow.y, Xl.indexOf(In(e))));
  const h = e.line;
  s.push(Ie(e), Ke(e), Vo.indexOf(h.reel) | (h.cut ? 4 : 0) | (h.out ? 8 : 0));
  let c = 0;
  Vl.forEach((f, p) => {
    e.alarms[f] && (c |= 1 << p);
  });
  const d = Wt(e);
  let u = 0;
  (d && (u |= 1),
    wn(e) && (u |= 2),
    e.auto.on && (u |= 4),
    e.blind && (u |= 8),
    cs(e, n) !== null && (u |= 16),
    e.dash && (u |= 32),
    e.cesa && (u |= 64),
    e.ox.phase !== "none" && (u |= 128),
    s.push(c, u, e.timeScale, d ? Yi(o, i.x, i.y) : 0));
  for (let f = 0; f < s.length; f++) s[f] = pu(s[f]);
  return s;
}
const pe = (e) => Math.round(e * 10) / 10;
const ue = (e) => Math.round(e * 100) / 100;
function oo(e) {
  return Object.fromEntries(e.tanks.map((t) => [t.id, pe(t.bar)]));
}
class nr {
  constructor() {
    M(this, "peak", null);
    M(this, "confirmed", !1);
    M(this, "count", 0);
  }
  feed(t, n) {
    return !this.peak || t > this.peak.p
      ? (t <= 0 ||
          ((this.peak = { p: t, t: n.t, w: n.tWall, x: n.diver.x, d: n.depth, bars: oo(n) }),
          (this.confirmed = !1)),
        null)
      : !this.confirmed && t < this.peak.p - Tt.TURN_DROP_M
        ? ((this.confirmed = !0), this.count++, this.peak)
        : null;
  }
}
class yu {
  constructor(t, n, o = () => 0) {
    M(this, "world");
    M(this, "sink");
    M(this, "now");
    M(this, "field");
    M(this, "cur", null);
    M(this, "done", !0);
    M(this, "enc", null);
    M(this, "evs", []);
    M(this, "chunkK", 0);
    M(this, "sampleN", 0);
    M(this, "flushN", 1);
    M(this, "vals", []);
    M(this, "q", new Int32Array(0));
    M(this, "scales", []);
    M(this, "prevBtn", {});
    M(this, "turn", new nr());
    M(this, "inGal", !1);
    M(this, "counts", {});
    M(this, "shotInfo", null);
    M(this, "perf", { ms: 0, steps: 0, samples: 0, flushes: 0, maxMs: 0 });
    ((this.world = t), (this.sink = n), (this.now = o), (this.field = hu(t)));
  }
  begin(t, n) {
    this.abandon();
    const o = uu(
        t.tanks.map((i) => i.id),
        t.tissues.length,
      ),
      s = {
        v: Tt.VERSION,
        id: n.id,
        n: n.n,
        date: n.date,
        build: n.build,
        seed: t.seed,
        plan: { rule: t.plan.rule, bottom: t.plan.bottom, slots: [...t.plan.slots] },
        env: {
          current: t.env.current,
          currentMps: ue(t.env.current * Re),
          deck: [...t.env.deck],
          ...(t.env.flows ? { flows: t.env.flows.map(ue) } : {}),
        },
        site: this.world.site.id,
        tanks: t.tanks.map((i) => ({ id: i.id, mix: i.mix, startBar: i.startBar, volumeL: i.volumeL })),
        gateX: t.gateX,
        laid: {
          lines: t.laid.length,
          m: ue(
            t.laid.reduce(
              (i, a) =>
                i +
                a.pts.reduce(
                  (r, l, h) => (h ? r + Math.hypot(l.x - a.pts[h - 1].x, l.y - a.pts[h - 1].y) : 0),
                  0,
                ),
              0,
            ),
          ),
        },
        hz: Tt.HZ,
        enc: Qf,
        cols: o,
        bits: { btn: [...cu], flags: [...du], alarms: [...Vl] },
        codes: { torch: [...Xl], reel: [...Vo], reelBits: [...fu] },
      };
    (n.device && (s.device = n.device),
      (this.cur = { meta: s, summary: null, chunks: [] }),
      (this.done = !1),
      (this.enc = new tr(o.length)),
      (this.q = new Int32Array(o.length)),
      (this.scales = o.map((i) => i.scale)),
      (this.evs = []),
      (this.chunkK = 0),
      (this.sampleN = 0),
      (this.flushN = 1),
      (this.prevBtn = {}),
      (this.turn = new nr()),
      (this.inGal = !1),
      (this.counts = {}),
      this.sink?.begin(s));
  }
  onStep(t, n) {
    if (this.done || !this.cur) return;
    const o = this.now();
    for (const a of t.events) this.simEvent(t, a, n);
    for (const a of er) {
      const r = n[a.btn];
      if (r && !this.prevBtn[a.btn]) {
        const l = rn(t, a.kind);
        this.push(t, "press", { btn: a.btn, kind: a.kind, phase: l ? l.phase : null });
      }
      this.prevBtn[a.btn] = r;
    }
    const s = Wt(t);
    (s !== this.inGal && ((this.inGal = s), this.push(t, "gallery", { on: s })),
      t.tWall >= this.sampleN / Tt.HZ - 1e-9 &&
        (this.sample(t, n),
        (this.sampleN = Math.max(this.sampleN + 1, Math.floor(t.tWall * Tt.HZ + 1e-9) + 1))),
      t.tWall >= this.flushN * Tt.FLUSH_S - 1e-9 &&
        (this.flush(),
        (this.flushN = Math.max(this.flushN + 1, Math.floor(t.tWall / Tt.FLUSH_S + 1e-9) + 1))));
    const i = this.now() - o;
    ((this.perf.ms += i), (this.perf.maxMs = Math.max(this.perf.maxMs, i)), this.perf.steps++);
  }
  sample(t, n) {
    if (!this.enc || t.tWall > Tt.MAX_WALL_S) return;
    const o = mu(t, n, this.world, this.field, this.vals);
    for (let i = 0; i < o.length; i++) this.q[i] = Math.round(o[i] * this.scales[i]);
    (this.enc.push(this.q), this.perf.samples++);
    const s = this.turn.feed(o[o.length - 1], t);
    s &&
      this.push(
        t,
        "turn",
        { p: pe(s.p), bars: s.bars, conf: ue(t.t), n: this.turn.count },
        { t: s.t, w: s.w, x: s.x, d: s.d },
      );
  }
  mark(t, n, o) {
    this.done || !this.cur || this.push(t, n, o);
  }
  push(t, n, o, s) {
    if ((this.counts[n] = (this.counts[n] ?? 0) + 1) > Tt.EVENT_CAP && n !== "end") return;
    const a = s
      ? { t: ue(s.t), w: ue(s.w), e: n, at: [pe(s.x), pe(s.d)] }
      : { t: ue(t.t), w: ue(t.tWall), e: n, at: [pe(t.diver.x), pe(t.depth)] };
    for (const [r, l] of Object.entries(o)) a[r] = typeof l == "number" ? ue(l) : l;
    this.evs.push(a);
  }
  simEvent(t, n, o) {
    const s = {};
    for (const [i, a] of Object.entries(n)) i !== "type" && (s[i] = a);
    switch (n.type) {
      case "rule":
        ((s.marks = Object.fromEntries(
          t.tanks.filter((i) => i.marks.length).map((i) => [i.id, i.marks.map(pe)]),
        )),
          (s.bars = oo(t)));
        break;
      case "gas":
      case "drop":
      case "pickup":
        s.bars = oo(t);
        break;
      case "shot":
        (delete s.x,
          delete s.y,
          delete s.aim,
          (s.dx = Math.cos(n.aim)),
          (s.dy = Math.sin(n.aim)),
          (s.prog = ds(t.diver, this.world)),
          Object.assign(s, this.shotInfo?.(n.n) ?? {}));
        break;
      case "fail": {
        const i = [...t.fail.list].reverse().find((r) => r.kind === n.kind);
        (i && n.phase === "warn" && (s.warnS = i.warnS),
          i && n.phase === "fixed" && (s.lostBar = i.lostBar));
        const a = i ? (n.phase === "warn" ? i.warnT : n.phase === "active" ? i.activeT : i.fixT) : -1;
        if (a >= 0 && a < t.t)
          return (
            this.push(t, n.type, s, {
              t: a,
              w: t.tWall - (t.t - a) / t.timeScale,
              x: t.diver.x,
              d: t.depth,
            }),
            this.heldAtWarn(t, n, o)
          );
        break;
      }
    }
    (this.push(t, n.type, s), this.heldAtWarn(t, n, o));
  }
  heldAtWarn(t, n, o) {
    if (n.type === "fail" && n.phase === "warn") {
      const s = er.find((i) => i.kind === n.kind);
      o[s.btn] &&
        this.prevBtn[s.btn] &&
        this.push(t, "press", { btn: s.btn, kind: s.kind, phase: "warn", held: !0 });
    }
  }
  flush() {
    if (this.done || !this.cur || !this.enc || (this.enc.frames === 0 && this.evs.length === 0)) return;
    const t = { f: this.enc.text(), n: this.enc.frames, e: this.evs };
    (this.cur.chunks.push(t),
      this.sink?.chunk(this.cur.meta.id, this.chunkK++, t),
      (this.enc = new tr(this.q.length)),
      (this.evs = []),
      this.perf.flushes++);
  }
  finish(t, n = {}) {
    if (this.done || !this.cur) return this.cur;
    (this.sample(t, xi), this.push(t, "end", { outcome: t.outcome }), this.flush());
    const o = Jr(t, this.world).map((s) => {
      const i = Yi(this.field, s.x, s.y);
      return { x: pe(s.x), d: pe(s.y), p: Number.isFinite(i) ? pe(i) : null, gap: ue(s.gap) };
    });
    return (
      (this.cur.summary = so(this.cur, {
        complete: !0,
        stats: t.stats,
        outcome: t.outcome,
        counts: this.counts,
        keyboard: n.keyboard ?? null,
        turnCount: this.turn.count,
        lineBeyondM: No(t, this.world),
        lineTraps: o,
      })),
      (this.done = !0),
      this.sink?.finish(this.cur),
      this.cur
    );
  }
  abandon() {
    return this.done || !this.cur
      ? null
      : (this.flush(),
        (this.cur.summary = so(this.cur, {
          complete: !1,
          counts: this.counts,
          turnCount: this.turn.count,
        })),
        (this.done = !0),
        this.sink?.finish(this.cur),
        this.cur);
  }
  snapshot() {
    return this.cur
      ? this.done || !this.enc || (this.enc.frames === 0 && this.evs.length === 0)
        ? this.cur
        : {
            ...this.cur,
            chunks: [...this.cur.chunks, { f: this.enc.text(), n: this.enc.frames, e: [...this.evs] }],
          }
      : null;
  }
}
