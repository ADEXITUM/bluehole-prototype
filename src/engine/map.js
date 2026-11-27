function $f(e) {
  const t = Ne.CELL_M;
  return { gw: Math.ceil(e.w / t), gh: Math.ceil(e.h / t), top: -e.airRows, cell: t };
}
function jn(e, t) {
  return { x: ((t % e.gw) + 0.5) * e.cell, y: e.top + (Math.floor(t / e.gw) + 0.5) * e.cell };
}
function Kf(e, t, n) {
  const o = Math.floor(t / e.cell),
    s = Math.floor((n - e.top) / e.cell);
  return o < 0 || s < 0 || o >= e.gw || s >= e.gh ? -1 : s * e.gw + o;
}
function Gf(e, t) {
  const n = new Uint8Array(t.gw * t.gh);
  for (let o = 0; o < n.length; o++) {
    const s = jn(t, o);
    n[o] = s.y > 0.1 && z(e, s.x, s.y) > Mt.Q_WATER_M ? 1 : 0;
  }
  return n;
}
function Uf(e, t) {
  const n = pl(e),
    o = new Uint8Array(t.gw * t.gh);
  for (let s = 0; s < o.length; s++) {
    const i = jn(t, s);
    o[s] = ml(n, i.x, i.y) >= Mt.Q_DAY_MIN ? 1 : 0;
  }
  return o;
}
const on = (e, t) => e[t] >= Mt.SEEN_MIN;
function Vf(e, t) {
  let n = 1 / 0,
    o = -1,
    s = 1 / 0,
    i = -1;
  for (let a = 0; a < e.length; a++) {
    if (!on(e, a)) continue;
    const r = a % t.gw,
      l = Math.floor(a / t.gw);
    (r < n && (n = r), r > o && (o = r), l < s && (s = l), l > i && (i = l));
  }
  return o < 0
    ? null
    : { x0: n * t.cell, x1: (o + 1) * t.cell, y0: t.top + s * t.cell, y1: t.top + (i + 1) * t.cell };
}
const Ps = (e, t) => {
  const n = t % e.gw,
    o = [];
  return (
    n > 0 && o.push(t - 1),
    n < e.gw - 1 && o.push(t + 1),
    t >= e.gw && o.push(t - e.gw),
    t + e.gw < e.gw * e.gh && o.push(t + e.gw),
    o
  );
};
function Xf(e, t, n, o = [], s = null) {
  const i = n.gw * n.gh,
    a = new Int16Array(i).fill(-1),
    r = new Int32Array(i);
  let l = 0,
    h = 0;
  const c = (g) => t[g] === 1 && !on(e, g) && !(s && s[g]);
  for (let g = 0; g < i; g++)
    c(g) && Ps(n, g).some((S) => t[S] === 1 && on(e, S)) && ((a[g] = 1), (r[h++] = g));
  for (; l < h; ) {
    const g = r[l++];
    for (const S of Ps(n, g)) a[S] >= 0 || !c(S) || ((a[S] = a[g] + 1), (r[h++] = S));
  }
  const d = Math.max(2, Math.round(Mt.Q_DEPTH_M / n.cell)),
    u = Math.max(1, Math.min(d - 1, Math.round(Mt.Q_BACK_M / n.cell))),
    f = new Uint8Array(i),
    p = [];
  for (let g = 0; g < i; g++) {
    if (a[g] !== d || f[g]) continue;
    const S = [],
      A = [g];
    for (f[g] = 1; A.length; ) {
      const R = A.pop();
      S.push(R);
      const P = R % n.gw;
      for (let v = -1; v <= 1; v++)
        for (let N = -1; N <= 1; N++) {
          const O = P + N,
            C = R + v * n.gw + N;
          (!N && !v) ||
            O < 0 ||
            O >= n.gw ||
            C < 0 ||
            C >= i ||
            f[C] ||
            a[C] !== d ||
            ((f[C] = 1), A.push(C));
        }
    }
    let E = 0,
      b = 0;
    for (const R of S) {
      const P = jn(n, R);
      ((E += P.x), (b += P.y));
    }
    ((E /= S.length), (b /= S.length));
    let T = S[0],
      k = 1 / 0;
    for (const R of S) {
      const P = jn(n, R),
        v = (P.x - E) ** 2 + (P.y - b) ** 2;
      v < k && ((k = v), (T = R));
    }
    let w = T;
    for (let R = 0; a[w] > u && R < d; R++) {
      const P = Ps(n, w).find((v) => a[v] === a[w] - 1);
      if (P === void 0) break;
      w = P;
    }
    const L = jn(n, w);
    p.push({ x: L.x, y: L.y, w: S.length, src: "edge" });
  }
  p.sort((g, S) => S.w - g.w);
  const m = Math.ceil(1.5 / n.cell),
    y = (g, S) => {
      const A = Kf(n, g, S);
      if (A < 0) return !1;
      const E = A % n.gw,
        b = Math.floor(A / n.gw);
      for (let T = -m; T <= m; T++)
        for (let k = -m; k <= m; k++) {
          const w = E + k,
            L = b + T;
          if (w >= 0 && L >= 0 && w < n.gw && L < n.gh && on(e, L * n.gw + w)) return !0;
        }
      return !1;
    };
  for (const g of o)
    !y(g.at.x, g.at.y) &&
      !y(g.real.x, g.real.y) &&
      p.push({ x: g.at.x, y: g.at.y, w: 0, src: "sketch" });
  const _ = [];
  for (const g of p) {
    const S = _.find((A) => Math.hypot(A.x - g.x, A.y - g.y) < Mt.Q_GROUP_M);
    S ? (S.w += g.w) : _.length < Mt.Q_MAX && _.push({ ...g });
  }
  return _;
}
function jf(e, t = 0.25) {
  const n = -e.airRows,
    o = Math.ceil(e.w / t),
    s = Math.ceil(e.h / t),
    i = new Float32Array((o + 1) * (s + 1));
  for (let l = 0; l <= s; l++) for (let h = 0; h <= o; h++) i[l * (o + 1) + h] = z(e, h * t, n + l * t);
  const a = [],
    r = (l, h) => (Math.abs(l - h) < 1e-9 ? 0.5 : l / (l - h));
  for (let l = 0; l < s; l++)
    for (let h = 0; h < o; h++) {
      const c = i[l * (o + 1) + h],
        d = i[l * (o + 1) + h + 1],
        u = i[(l + 1) * (o + 1) + h + 1],
        f = i[(l + 1) * (o + 1) + h],
        p = (c < 0 ? 1 : 0) | (d < 0 ? 2 : 0) | (u < 0 ? 4 : 0) | (f < 0 ? 8 : 0);
      if (p === 0 || p === 15) continue;
      const m = h * t,
        y = n + l * t,
        _ = [m + r(c, d) * t, y],
        g = [m + t, y + r(d, u) * t],
        S = [m + r(f, u) * t, y + t],
        A = [m, y + r(c, f) * t],
        E = (b, T) => a.push(b[0], b[1], T[0], T[1]);
      switch (p) {
        case 1:
        case 14:
          E(A, _);
          break;
        case 2:
        case 13:
          E(_, g);
          break;
        case 3:
        case 12:
          E(A, g);
          break;
        case 4:
        case 11:
          E(g, S);
          break;
        case 6:
        case 9:
          E(_, S);
          break;
        case 7:
        case 8:
          E(A, S);
          break;
        case 5:
        case 10: {
          (c + d + u + f) / 4 < 0 != (p === 5) ? (E(A, _), E(g, S)) : (E(_, g), E(A, S));
          break;
        }
      }
    }
  return Float32Array.from(a);
}
function qf(e, t, n = 0.45) {
  const o = [],
    s = new Set();
  for (let i = 0; i < t.length; i += 4) {
    const a = (t[i] + t[i + 2]) / 2,
      r = (t[i + 1] + t[i + 3]) / 2,
      l = Math.floor(a / n),
      h = Math.floor((r + 50) / n),
      c = h * 1e5 + l;
    if (s.has(c)) continue;
    s.add(c);
    const d = $t(e, a, r),
      u = 0.45 + 0.25 * dt(l, h, 71),
      f = -(d.x * Math.cos(u) - d.y * Math.sin(u)),
      p = -(d.x * Math.sin(u) + d.y * Math.cos(u)),
      m = 0.3 + 0.45 * dt(l, h, 73);
    o.push(a + f * 0.06, r + p * 0.06, a + f * m, r + p * m);
  }
  return Float32Array.from(o);
}
function qi(e, t, n, o) {
  return { x: e + n * Jn(e / 2.2, t / 2.2, o), y: t + n * Jn(e / 2.2 + 17.3, t / 2.2 - 5.1, o + 1) };
}
function zf() {
  return hr.map((e) => {
    const t = Bt[e.mix];
    let n;
    if (e.kind === "mod") n = ye(t);
    else {
      let o = 0,
        s = 300;
      for (let i = 0; i < 50; i++) {
        const a = (o + s) / 2;
        Ln(t, a) < ce.END_ONSET_M ? (o = a) : (s = a);
      }
      n = (o + s) / 2;
    }
    return { id: e.id, label: e.label, note: e.note, color: e.color, depth: n };
  });
}
function qa(e, t, n = xt()) {
  const o = n.sketch.DRIFT;
  if (e <= o.X0) return { x: e, y: t };
  const s = e - o.X0;
  return { x: o.X0 + s * o.KX, y: t + s * o.KY };
}
function no(e = xt(), t = []) {
  const n = (i) => qa(i[0], i[1], e),
    o = e.sketch.layers.filter((i) => i.find === null || t.includes(i.find)),
    s = o.filter((i) => i.line.length >= 2).map((i) => i.line.map(n));
  return {
    walls: o.flatMap((i) => i.walls.map((a) => a.map(n))),
    line: s[0] ?? [],
    lines: s,
    dashed: o.flatMap((i) => i.dashed.map((a) => a.map(n))),
    leads: o.flatMap((i) => i.leads.map((a) => ({ at: n(a), real: { x: a[0], y: a[1] } }))),
    labels: o.flatMap((i) => i.labels.map((a) => ({ ...qa(a.x, a.y, e), text: a.text, keep: a.keep }))),
  };
}
// Each remembered metre is the rounded distance along one particular rope.
// Clip its half-metre boundaries to the rope and keep bends inside each run.
function scoutedRopeSections(lines, marks) {
  const known = new Set(marks);
  const sections = [];
  if (!known.size) return sections;
  for (const [index, {pts}] of lines.entries()) {
    if (pts.length < 2) continue;
    const distances = [0];
    for (let i = 1; i < pts.length; i++) {
      distances.push(distances[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    }
    const length = distances.at(-1);
    for (let metre = 0; metre <= Math.round(length); metre++) {
      if (!known.has(routeMark(index, metre))) continue;
      const start = Math.max(0, metre - 0.5);
      while (metre < Math.round(length) && known.has(routeMark(index, metre + 1))) metre++;
      const end = Math.min(length, metre + 0.5);
      const bends = pts.filter((point, i) => distances[i] > start && distances[i] < end);
      sections.push([an(pts, start), ...bends, an(pts, end)]);
    }
  }
  return sections;
}
function Yf(e = xt(), t = []) {
  const n = no(e, t),
    o = [...n.walls.flat(), ...n.lines.flat(), ...n.dashed.flat(), ...n.leads.map((s) => s.at)];
  return {
    x0: Math.min(...o.map((s) => s.x)),
    x1: Math.max(...o.map((s) => s.x)),
    y0: Math.min(...o.map((s) => s.y)),
    y1: Math.max(...o.map((s) => s.y)),
  };
}
const un = 30;
const vs = "Georgia, 'Times New Roman', 'Noto Serif', serif";
const Ns = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const bi = (e) =>
  e.replace(/[&<>"]/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[t]);
function gn(e = 1, t = 1) {
  const n = document.createElement("canvas");
  return ((n.width = e), (n.height = t), n);
}
function Je(e, t, n, o = new Path2D()) {
  if (e.length < 2) return o;
  const s = qi(e[0].x, e[0].y, t, n);
  o.moveTo(s.x, s.y);
  for (let i = 1; i < e.length; i++) {
    const a = e[i - 1],
      r = e[i],
      l = Math.max(1, Math.ceil(Math.hypot(r.x - a.x, r.y - a.y) / 0.5));
    for (let h = 1; h <= l; h++) {
      const c = h / l,
        d = qi(a.x + (r.x - a.x) * c, a.y + (r.y - a.y) * c, t, n);
      o.lineTo(d.x, d.y);
    }
  }
  return o;
}
function za(e, t, n) {
  const o = new Path2D();
  for (let s = 0; s < e.length; s += 4) {
    const i = qi(e[s], e[s + 1], t, n),
      a = qi(e[s + 2], e[s + 3], t, n);
    (o.moveTo(i.x, i.y), o.lineTo(a.x, a.y));
  }
  return o;
}
function Ya(e) {
  const t = e[e.length - 2],
    n = e[e.length - 1],
    o = Math.hypot(n.x - t.x, n.y - t.y) || 1;
  return { x: n.x, y: n.y, dx: (n.x - t.x) / o, dy: (n.y - t.y) / o };
}
class Za {
  constructor() {
    M(this, "sketch", gn());
    M(this, "survey", gn());
  }
  resize(t, n) {
    for (const o of [this.sketch, this.survey])
      (o.width !== t || o.height !== n) && ((o.width = t), (o.height = n));
  }
}
class Zf {
  constructor(t, n, o = document.body) {
    M(this, "world");
    M(this, "g");
    M(this, "water");
    M(this, "day");
    M(this, "refs");
    M(this, "walls");
    M(this, "hatch");
    M(this, "oldLines");
    M(this, "scoutedSections", []);
    M(this, "guide");
    M(this, "sk");
    M(this, "skKey", "");
    M(this, "skWalls", new Path2D());
    M(this, "skWalls2", new Path2D());
    M(this, "skLine", new Path2D());
    M(this, "skDashed", new Path2D());
    M(this, "cuts");
    M(this, "skLabels", []);
    M(this, "skCuts", []);
    M(this, "data");
    M(this, "qs", []);
    M(this, "ownLines", new Path2D());
    M(this, "ownKnots", []);
    M(this, "ownEnds", []);
    M(this, "maskSurvey");
    M(this, "maskSketch");
    M(this, "wash");
    M(this, "grain");
    M(this, "pvCanvas");
    M(this, "pvLayers", new Za());
    M(this, "pvView", { k: 2, ox: 0, oy: 0 });
    M(this, "pvW", 0);
    M(this, "fs");
    M(this, "fsCanvas");
    M(this, "fsLayers", new Za());
    M(this, "card");
    M(this, "fsView", { k: 6, ox: 0, oy: 0 });
    M(this, "icons", []);
    M(this, "dirty", !1);
    M(this, "raf", 0);
    M(this, "ptrs", new Map());
    M(this, "tap", null);
    M(this, "refView", null);
    ((this.world = t),
      (this.g = $f(t)),
      (this.water = Gf(t, this.g)),
      (this.day = Uf(t, this.g)),
      (this.refs = zf()));
    const s = jf(t);
    if (
      ((this.walls = za(s, 0.05, 11)),
      (this.hatch = za(qf(t, s), 0.03, 13)),
      (this.oldLines = t.olds.map((i, a) => ({
        path: Je(i.pts, 0.04, 17 + a * 5),
        color: i.year < en.DARK_BEFORE ? en.MAP_OLD : ht.oldLine,
        pts: i.pts,
      }))),
      (this.guide = Je(t.guide, 0.04, 19)),
      (this.cuts = t.olds
        .filter((i) => i.arrow && i.pts.length >= 2)
        .map((i) => ({ ...Ya(i.pts), color: i.year < en.DARK_BEFORE ? en.MAP_OLD : ht.oldLine }))),
      (this.sk = no(t.site)),
      this.buildSketch([]),
      (this.maskSurvey = gn(this.g.gw, this.g.gh)),
      (this.maskSketch = gn(this.g.gw, this.g.gh)),
      (this.wash = gn(this.g.gw, this.g.gh)),
      (this.grain = this.makeGrain()),
      (this.data = { seen: new Uint8Array(this.g.gw * this.g.gh), found: [], notes: [], dives: 0 }),
      n.classList.add("pmap"),
      (n.innerHTML =
        '<canvas class="pmap-c" aria-label="Карта разведанного: коснись, чтобы открыть"></canvas><span class="pmap-open" aria-hidden="true">карта ⤢</span>'),
      (this.pvCanvas = n.querySelector("canvas")),
      n.addEventListener("click", () => this.open()),
      typeof ResizeObserver < "u")
    ) {
      let i = 0;
      new ResizeObserver(() => {
        const a = Math.round(n.getBoundingClientRect().width);
        a && a !== i && ((i = a), this.renderPreview());
      }).observe(n);
    }
    ((this.fs = document.createElement("div")),
      (this.fs.className = "mapfs hidden"),
      (this.fs.innerHTML = `
      <div class="mapbar"><b>Разрез</b><span class="mapsub" data-n="sub"></span><button class="mapbtn" data-a="fit" aria-label="Весь разрез">весь</button><button class="mapbtn mapx" data-a="close" aria-label="Закрыть карту">✕</button></div>
      <canvas class="mapc"></canvas>
      <div class="maplegend"><span><i class="lg-wall"></i>съёмка — где был свет</span><span><i class="lg-sketch"></i>схема В. К. 1996</span><span><i class="lg-line"></i>старая линия</span><span data-n="scouted" hidden>○━○ знакомый участок</span><span><i class="lg-own"></i>своя линия</span><span><i class="lg-guide"></i>ходовая</span><span><b class="lg-q">?</b>не разведано</span></div>
      <div class="mapcard hidden" data-n="card" role="dialog"></div>`),
      o.appendChild(this.fs),
      (this.fsCanvas = this.fs.querySelector("canvas")),
      (this.card = this.fs.querySelector('[data-n="card"]')),
      this.fs.querySelector('[data-a="close"]').addEventListener("click", () => this.close()),
      this.fs.querySelector('[data-a="fit"]').addEventListener("click", () => {
        ((this.fsView = this.fitView(!0)), this.clampFs(), this.invalidate());
      }),
      this.card.addEventListener("click", (i) => {
        i.target.closest('[data-a="card-close"]') && this.closeCard();
      }),
      this.bindGestures(),
      window.addEventListener("resize", () => {
        (this.renderPreview(), this.isOpen && (this.clampFs(), this.invalidate()));
      }),
      window.addEventListener("keydown", (i) => {
        i.key === "Escape" &&
          this.isOpen &&
          (this.card.classList.contains("hidden") ? this.close() : this.closeCard());
      }));
  }
  refresh() {
    this.renderPreview();
  }
  get isOpen() {
    return !this.fs.classList.contains("hidden");
  }
  buildSketch(t) {
    const n = t.join(",");
    if (!(n === this.skKey && this.skKey !== "")) {
      ((this.skKey = n || "-"),
        (this.sk = no(this.world.site, t)),
        (this.skWalls = new Path2D()),
        (this.skWalls2 = new Path2D()));
      for (const o of this.sk.walls)
        (Je(o, Te.WOBBLE_M, 23, this.skWalls), Je(o, Te.WOBBLE_M * 0.8, 29, this.skWalls2));
      ((this.skLine = new Path2D()),
        this.sk.lines.forEach((o, s) => Je(o, Te.WOBBLE_M * 0.6, 31 + s * 3, this.skLine)),
        (this.skDashed = new Path2D()),
        this.sk.dashed.forEach((o, s) => Je(o, Te.WOBBLE_M * 0.5, 37 + s * 3, this.skDashed)),
        (this.skCuts = this.sk.lines.filter((o) => o.length >= 2).map(Ya)));
    }
  }
  setData(t) {
    this.scoutedSections = scoutedRopeSections(this.world.olds, t.routeMarks);
    this.fs.querySelector('[data-n="scouted"]').hidden = !this.scoutedSections.length;
    (this.buildSketch(t.found),
      (this.data = {
        seen: t.seen,
        found: [...t.found],
        notes: [...t.notes],
        dives: t.dives,
        ...(t.lines ? { lines: t.lines } : {}),
      }),
      (this.ownLines = new Path2D()),
      (this.ownKnots = []),
      (this.ownEnds = []),
      (t.lines?.lines ?? []).forEach((n, o) => {
        (Je(n.pts, 0.03, 41 + o * 7, this.ownLines), this.ownKnots.push(...Er(n).slice(1)));
        const s = n.pts[n.pts.length - 2],
          i = n.pts[n.pts.length - 1];
        if (s && i) {
          const a = Math.hypot(i.x - s.x, i.y - s.y) || 1;
          this.ownEnds.push({ x: i.x, y: i.y, dx: (i.x - s.x) / a, dy: (i.y - s.y) / a });
        }
      }),
      (this.qs = Xf(t.seen, this.water, this.g, this.sk.leads, this.day)),
      this.buildMasks(),
      this.renderPreview(),
      this.isOpen && this.invalidate());
  }
  open() {
    (this.fs.classList.remove("hidden"), this.closeCard());
    const t = this.data;
    ((this.fs.querySelector('[data-n="sub"]').textContent = t.dives
      ? `съёмка за сезон · нырков ${t.dives}`
      : "пока только старая схема"),
      (this.fsView = this.fitView(!1)),
      this.clampFs(),
      this.invalidate());
  }
  close() {
    (this.fs.classList.add("hidden"), this.closeCard(), this.ptrs.clear());
  }
  buildMasks() {
    const { gw: t, gh: n } = this.g,
      o = this.data.seen,
      s = (d) => {
        const u = new Uint8Array(t * n);
        for (let f = 0; f < o.length; f++) {
          if (!on(o, f)) continue;
          const p = f % t,
            m = Math.floor(f / t);
          for (let y = -d; y <= d; y++)
            for (let _ = -d; _ <= d; _++) {
              const g = p + _,
                S = m + y;
              g >= 0 && S >= 0 && g < t && S < n && (u[S * t + g] = 1);
            }
        }
        return u;
      },
      i = (d, u) => {
        const f = d.getContext("2d"),
          p = f.createImageData(t, n);
        for (let m = 0; m < t * n; m++) u(m, p.data, m * 4);
        f.putImageData(p, 0, 0);
      },
      a = s(2),
      r = s(Math.round(Mt.SKETCH_ERASE_M / this.g.cell));
    (i(this.maskSurvey, (d, u, f) => {
      u[f + 3] = a[d] ? 255 : 0;
    }),
      i(this.maskSketch, (d, u, f) => {
        u[f + 3] = r[d] ? 255 : 0;
      }),
      (this.skLabels = this.sk.labels.filter(
        (d) =>
          d.keep ||
          (!this.nearKnown(d.x, d.y, Mt.SKETCH_ERASE_M + 0.5) &&
            !this.qs.some((u) => u.src === "edge" && Math.hypot(u.x - d.x, u.y - d.y) < 3.5)),
      )));
    const [l, h, c] = ht.wash;
    i(this.wash, (d, u, f) => {
      ((u[f] = l),
        (u[f + 1] = h),
        (u[f + 2] = c),
        (u[f + 3] =
          this.water[d] && on(o, d) ? Math.round(255 * ht.washA * (0.45 + 0.55 * (o[d] / 255))) : 0));
    });
  }
  nearKnown(t, n, o) {
    const { gw: s, gh: i, cell: a, top: r } = this.g,
      l = Math.ceil(o / a),
      h = Math.floor(t / a),
      c = Math.floor((n - r) / a);
    for (let d = -l; d <= l; d++)
      for (let u = -l; u <= l; u++) {
        const f = h + u,
          p = c + d;
        if (
          f >= 0 &&
          p >= 0 &&
          f < s &&
          p < i &&
          u * u + d * d <= l * l &&
          on(this.data.seen, p * s + f)
        )
          return !0;
      }
    return !1;
  }
  makeGrain() {
    const t = gn(96, 96),
      n = t.getContext("2d"),
      o = n.createImageData(96, 96);
    let s = 12345;
    for (let i = 0; i < o.data.length; i += 4) {
      s = (Math.imul(s, 1103515245) + 12345) >>> 0;
      const a = (s >>> 16) & 255;
      ((o.data[i] = 60),
        (o.data[i + 1] = 52),
        (o.data[i + 2] = 40),
        (o.data[i + 3] = a < 40 ? 22 : a > 240 ? 10 : 0));
    }
    return (n.putImageData(o, 0, 0), t);
  }
  knownBox() {
    const t = Yf(this.world.site, this.data.found),
      n = Vf(this.data.seen, this.g);
    for (const section of this.scoutedSections) {
      for (const point of section) {
        t.x0 = Math.min(t.x0, point.x);
        t.x1 = Math.max(t.x1, point.x);
        t.y0 = Math.min(t.y0, point.y);
        t.y1 = Math.max(t.y1, point.y);
      }
    }
    return n
      ? {
          x0: Math.min(t.x0, n.x0),
          x1: Math.max(t.x1, n.x1),
          y0: Math.min(t.y0, n.y0),
          y1: Math.max(t.y1, n.y1),
        }
      : t;
  }
  renderPreview() {
    const t = this.pvCanvas,
      n = Math.round(t.parentElement?.getBoundingClientRect().width ?? 0);
    if (n < 40) return;
    const o = this.world.site.bounds,
      s = this.knownBox(),
      i = Math.max(o.x0, s.x0 - 3),
      a = Math.min(o.x1, Math.max(s.x1 + Mt.PREVIEW_PAD_M, i + Mt.PREVIEW_MIN_W_M)),
      r = o.y0 + 1,
      l = o.y1 + 2.5,
      [h, c] = this.previewHeight ?? Mt.PREVIEW_H,
      d = Math.round(Math.max(h, Math.min(c, (n * (l - r)) / (a - i)))),
      u = Math.min(n / (a - i), d / (l - r));
    ((this.pvView = { k: u, ox: this.previewHeight ? (i+a)/2-n/u/2 : i, oy: (r + l) / 2 - d / u / 2 }), (this.pvW = n));
    const f = Math.min(2.5, window.devicePixelRatio || 1);
    ((t.style.height = `${d}px`),
      (t.width = Math.round(n * f)),
      (t.height = Math.round(d * f)),
      this.draw(t, this.pvLayers, n, d, f, this.pvView, !0));
  }
  fitView(t) {
    const { W: n, H: o } = this.fsSize(),
      s = this.world.site.bounds,
      i = t ? { x0: s.x0, x1: s.x1, y0: s.y0, y1: s.y1 } : this.knownBox(),
      a = 5,
      r = n - un;
    let l = Math.min(r / (i.x1 - i.x0 + a * 2), o / (s.y1 - s.y0));
    (t || (l = Math.max(l, Mt.FS_K0)), (l = Math.max(this.kMin(), Math.min(Mt.FS_K[1], l))));
    const h = (i.x0 + i.x1) / 2;
    return { k: l, ox: h - (un + r / 2) / l, oy: (s.y0 + s.y1) / 2 - o / l / 2 };
  }
  kMin() {
    const { W: t } = this.fsSize(),
      n = this.world.site.bounds;
    return Math.max(Mt.FS_K[0], Math.min((t - un) / (n.x1 - n.x0), 4));
  }
  fsSize() {
    const t = this.fsCanvas.getBoundingClientRect();
    return { W: Math.max(1, Math.round(t.width)), H: Math.max(1, Math.round(t.height)) };
  }
  clampFs() {
    const t = this.fsView,
      { W: n, H: o } = this.fsSize(),
      s = this.world.site.bounds;
    t.k = Math.max(this.kMin(), Math.min(Mt.FS_K[1], t.k));
    const i = n / t.k,
      a = o / t.k,
      r = (l, h, c, d, u) => (d >= c - h ? u - d / 2 : Math.max(h, Math.min(c - d, l)));
    ((t.ox = r(t.ox, s.x0 - un / t.k, s.x1, i, (s.x0 + s.x1) / 2 - un / t.k / 2)),
      (t.oy = r(t.oy, s.y0, Mt.DEEP_Y1_M, a, (s.y0 + s.y1) / 2)));
  }
  zoomAt(t, n, o) {
    const s = this.fsView,
      i = s.ox + t / s.k,
      a = s.oy + n / s.k;
    ((s.k = Math.max(this.kMin(), Math.min(Mt.FS_K[1], s.k * o))),
      (s.ox = i - t / s.k),
      (s.oy = a - n / s.k),
      this.clampFs(),
      this.invalidate());
  }
  invalidate() {
    ((this.dirty = !0),
      !this.raf &&
        (this.raf = requestAnimationFrame(() => {
          if (((this.raf = 0), !this.dirty || !this.isOpen)) return;
          this.dirty = !1;
          const { W: t, H: n } = this.fsSize(),
            o = Math.min(2, window.devicePixelRatio || 1),
            s = this.fsCanvas;
          ((s.width !== Math.round(t * o) || s.height !== Math.round(n * o)) &&
            ((s.width = Math.round(t * o)), (s.height = Math.round(n * o))),
            (this.icons = this.draw(s, this.fsLayers, t, n, o, this.fsView, !1)));
        })));
  }
  local(t) {
    const n = this.fsCanvas.getBoundingClientRect();
    return { x: t.clientX - n.left, y: t.clientY - n.top };
  }
  bindGestures() {
    const t = this.fsCanvas;
    (t.addEventListener("pointerdown", (o) => {
      try {
        t.setPointerCapture(o.pointerId);
      } catch {}
      const s = this.local(o);
      (this.ptrs.set(o.pointerId, s),
        this.ptrs.size === 1
          ? (this.tap = { x: s.x, y: s.y, t: performance.now(), multi: !1 })
          : this.tap && (this.tap.multi = !0));
    }),
      t.addEventListener("pointermove", (o) => {
        const s = this.ptrs.get(o.pointerId);
        if (!s) return;
        const i = this.local(o),
          a = this.fsView;
        if (this.ptrs.size === 1)
          ((a.ox -= (i.x - s.x) / a.k),
            (a.oy -= (i.y - s.y) / a.k),
            this.ptrs.set(o.pointerId, i),
            this.clampFs(),
            this.invalidate());
        else if (this.ptrs.size === 2) {
          const r = [...this.ptrs.entries()].find(([u]) => u !== o.pointerId)[1],
            l = Math.hypot(s.x - r.x, s.y - r.y),
            h = Math.hypot(i.x - r.x, i.y - r.y),
            c = { x: (s.x + r.x) / 2, y: (s.y + r.y) / 2 },
            d = { x: (i.x + r.x) / 2, y: (i.y + r.y) / 2 };
          (this.ptrs.set(o.pointerId, i),
            (a.ox -= (d.x - c.x) / a.k),
            (a.oy -= (d.y - c.y) / a.k),
            l > 8 && h > 8 ? this.zoomAt(d.x, d.y, h / l) : (this.clampFs(), this.invalidate()));
        }
      }));
    const n = (o) => {
      if (!this.ptrs.has(o.pointerId)) return;
      const s = this.local(o);
      this.ptrs.delete(o.pointerId);
      const i = this.tap;
      (i &&
        !i.multi &&
        this.ptrs.size === 0 &&
        Math.hypot(s.x - i.x, s.y - i.y) < 8 &&
        performance.now() - i.t < 450 &&
        this.onTap(s.x, s.y),
        this.ptrs.size === 0 && (this.tap = null));
    };
    (t.addEventListener("pointerup", n),
      t.addEventListener("pointercancel", (o) => {
        (this.ptrs.delete(o.pointerId), (this.tap = null));
      }),
      t.addEventListener(
        "wheel",
        (o) => {
          o.preventDefault();
          const s = this.local(o);
          this.zoomAt(s.x, s.y, Math.exp(-o.deltaY * (o.deltaMode === 1 ? 0.05 : 0.0018)));
        },
        { passive: !1 },
      ),
      t.addEventListener("dblclick", (o) => {
        const s = this.local(o);
        this.zoomAt(s.x, s.y, 2);
      }));
  }
  onTap(t, n) {
    let o = null,
      s = Mt.TAP_PX;
    for (const i of this.icons) {
      const a = Math.hypot(i.x - t, i.y - n);
      a < s && ((s = a), (o = i));
    }
    o ? this.openCard(o) : this.closeCard();
  }
  openCard(t) {
    const n = t.find ? this.world.site.finds.find((i) => i.id === t.find) : void 0,
      o = t.note ? this.world.site.notes.find((i) => i.id === t.note) : void 0,
      s = [];
    (s.push(`<h4>${bi(o?.title ?? n?.name ?? "")}</h4>`),
      o && s.push(`<div class="mc-note">${o.text.map((i) => `<p>${bi(i)}</p>`).join("")}</div>`),
      n && s.push(`<p class="mc-fact">${o ? `<b>${bi(n.name)}.</b> ` : ""}${bi(n.fact)}</p>`),
      s.push('<button class="mc-close" data-a="card-close">закрыть</button>'),
      (this.card.innerHTML = s.join("")),
      this.card.classList.remove("hidden"));
  }
  closeCard() {
    this.card.classList.add("hidden");
  }
  draw(t, n, o, s, i, a, r) {
    const l = t.getContext("2d"),
      h = a.k,
      c = (b) => (b - a.ox) * h,
      d = (b) => (b - a.oy) * h,
      u = (b) => b.setTransform(i * h, 0, 0, i * h, -a.ox * h * i, -a.oy * h * i),
      f = (b) => b.setTransform(i, 0, 0, i, 0, 0),
      p = this.g,
      m = c(0),
      y = d(p.top),
      _ = p.gw * p.cell * h,
      g = p.gh * p.cell * h;
    (f(l),
      (l.globalCompositeOperation = "source-over"),
      (l.globalAlpha = 1),
      (l.fillStyle = ht.paper),
      l.fillRect(0, 0, o, s),
      (l.fillStyle = l.createPattern(this.grain, "repeat")),
      l.fillRect(0, 0, o, s),
      (l.strokeStyle = ht.grid),
      (l.lineWidth = 1),
      l.beginPath());
    for (let b = Math.ceil(a.ox / 10) * 10; b <= a.ox + o / h; b += 10)
      (l.moveTo(Math.round(c(b)) + 0.5, 0), l.lineTo(Math.round(c(b)) + 0.5, s));
    for (let b = Math.ceil(a.oy / 10) * 10; b <= a.oy + s / h; b += 10)
      (l.moveTo(0, Math.round(d(b)) + 0.5), l.lineTo(o, Math.round(d(b)) + 0.5));
    (l.stroke(),
      (l.imageSmoothingEnabled = !0),
      l.drawImage(this.wash, m, y, _, g),
      n.resize(t.width, t.height));
    const S = n.sketch.getContext("2d");
    (f(S),
      (S.globalCompositeOperation = "source-over"),
      S.clearRect(0, 0, o, s),
      u(S),
      (S.lineCap = "round"),
      (S.lineJoin = "round"),
      (S.strokeStyle = ht.sketch),
      (S.globalAlpha = 0.85),
      (S.lineWidth = (r ? 1 : 1.4) / h),
      S.stroke(this.skWalls),
      r || ((S.globalAlpha = 0.3), (S.lineWidth = 1 / h), S.stroke(this.skWalls2)),
      (S.globalAlpha = 0.95),
      S.setLineDash([5 / h, 3.5 / h]),
      (S.lineWidth = (r ? 1.1 : 1.5) / h),
      S.stroke(this.skLine),
      S.setLineDash([1.2 / h, 3.2 / h]),
      (S.lineWidth = (r ? 1.2 : 1.8) / h),
      S.stroke(this.skDashed),
      S.setLineDash([]));
    for (const b of this.skCuts) this.endMark(S, b, h, r ? 3.5 : 6);
    if (
      (f(S),
      (S.globalAlpha = 1),
      (S.globalCompositeOperation = "destination-out"),
      (S.imageSmoothingEnabled = !0),
      S.drawImage(this.maskSketch, m, y, _, g),
      (S.globalCompositeOperation = "source-over"),
      l.drawImage(n.sketch, 0, 0, o, s),
      !r || h > 3)
    ) {
      ((l.globalAlpha = 0.9),
        (l.fillStyle = ht.sketch),
        (l.font = `italic ${r ? 9 : 13}px ${vs}`),
        (l.textAlign = "center"),
        (l.textBaseline = "middle"));
      for (const b of this.skLabels) l.fillText(b.text, c(b.x), d(b.y));
      l.globalAlpha = 1;
    }
    const A = n.survey.getContext("2d");
    (f(A),
      (A.globalCompositeOperation = "source-over"),
      A.clearRect(0, 0, o, s),
      u(A),
      (A.lineCap = "round"),
      (A.lineJoin = "round"),
      !r && h >= 6 && ((A.strokeStyle = ht.hatch), (A.lineWidth = 0.9 / h), A.stroke(this.hatch)),
      (A.strokeStyle = ht.graphite),
      (A.globalAlpha = 0.35),
      (A.lineWidth = (r ? 1.6 : 2.4) / h),
      A.stroke(this.walls),
      (A.globalAlpha = 0.95),
      (A.lineWidth = (r ? 0.9 : 1.3) / h),
      A.stroke(this.walls),
      (A.globalAlpha = 1),
      (A.lineWidth = (r ? 0.9 : 1.2) / h));
    for (const b of this.oldLines) {
      ((A.strokeStyle = b.color), A.stroke(b.path), (A.fillStyle = b.color));
      for (const T of b.pts)
        (A.beginPath(), A.arc(T.x, T.y, (r ? 1 : 1.8) / h, 0, Math.PI * 2), A.fill());
    }
    for (const b of this.cuts) this.endMark(A, b, h, r ? 3.5 : 6, b.color);
    if (
      ((A.globalCompositeOperation = "destination-in"),
      f(A),
      (A.imageSmoothingEnabled = !0),
      A.drawImage(this.maskSurvey, m, y, _, g),
      (A.globalCompositeOperation = "source-over"),
      l.drawImage(n.survey, 0, 0, o, s),
      u(l),
      (l.lineCap = "round"),
      (l.strokeStyle = ht.guide),
      (l.globalAlpha = 0.9),
      (l.lineWidth = (r ? 1 : 1.4) / h),
      l.stroke(this.guide),
      (l.globalAlpha = 1),
      this.ownKnots.length || this.ownEnds.length)
    ) {
      ((l.strokeStyle = ht.ownLine),
        (l.lineWidth = (r ? 1.2 : 1.7) / h),
        l.setLineDash([(r ? 3 : 5) / h, (r ? 1.6 : 2.4) / h]),
        l.stroke(this.ownLines),
        l.setLineDash([]),
        (l.fillStyle = ht.ownLine));
      for (const b of this.ownKnots)
        (l.beginPath(), l.arc(b.x, b.y, (r ? 1.1 : 1.9) / h, 0, Math.PI * 2), l.fill());
      for (const b of this.ownEnds) this.endMark(l, b, h, r ? 3 : 5, ht.ownLine);
      for (const b of this.data.lines?.arrows ?? []) {
        const T = (r ? 2.6 : 4.2) / h;
        (l.beginPath(),
          l.moveTo(b.x + b.dx * T, b.y + b.dy * T),
          l.lineTo(b.x - b.dx * T * 0.6 - b.dy * T * 0.7, b.y - b.dy * T * 0.6 + b.dx * T * 0.7),
          l.lineTo(b.x - b.dx * T * 0.6 + b.dy * T * 0.7, b.y - b.dy * T * 0.6 - b.dx * T * 0.7),
          l.closePath(),
          l.fill());
      }
    }
    this.drawScoutedRope(l, h, r);
    (f(l), this.drawRefs(l, o, s, d, r));
    const E = this.drawIcons(l, c, d, h, o, s, r);
    ((l.font = `italic 700 ${r ? 13 : 21}px ${vs}`),
      (l.textAlign = "center"),
      (l.textBaseline = "middle"),
      (l.lineJoin = "round"));
    for (const b of this.qs) {
      const T = c(b.x),
        k = d(b.y);
      T < -20 ||
        k < -20 ||
        T > o + 20 ||
        k > s + 20 ||
        ((l.strokeStyle = ht.paper),
        (l.lineWidth = r ? 3 : 4),
        l.strokeText("?", T, k),
        (l.fillStyle = ht.q),
        l.fillText("?", T, k));
    }
    if (this.surveyTarget) drawPhotoMark(l, c(this.surveyTarget.x), d(this.surveyTarget.y), r);
    return (this.drawScales(l, s, a, r), E);
  }
  drawScoutedRope(ctx, zoom, preview) {
    if (!this.scoutedSections.length) return;
    ctx.save();
    ctx.strokeStyle = "#146458";
    ctx.fillStyle = ht.paper;
    ctx.lineWidth = (preview ? 1.8 : 2.4) / zoom;
    ctx.lineJoin = "round";
    const radius = (preview ? 2 : 3) / zoom;
    for (const section of this.scoutedSections) {
      const first = section[0];
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      for (const point of section.slice(1)) ctx.lineTo(point.x, point.y);
      ctx.stroke();
      for (const point of [first, section.at(-1)]) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  endMark(t, n, o, s, i) {
    const a = s / o;
    (i && (t.strokeStyle = i),
      (t.lineWidth = (s > 4 ? 1.8 : 1.2) / o),
      t.beginPath(),
      t.moveTo(n.x - n.dy * a, n.y + n.dx * a),
      t.lineTo(n.x + n.dy * a, n.y - n.dx * a),
      t.stroke());
  }
  drawRefs(t, n, o, s, i) {
    let a = 0;
    for (const r of this.refs) {
      const l = hr.find((f) => f.id === r.id);
      if (this.refView && l && !this.refView.show(l.reveal)) continue;
      const h = !!this.refView?.plain && !!l,
        c = h ? l.plain : r.label,
        d = s(r.depth),
        u =
          i || h
            ? `${c} ${r.depth.toFixed(0)} м`
            : `${c} · ${r.depth.toFixed(0)} м${r.note ? ` (${r.note})` : ""}`;
      if (
        ((t.font = `600 ${i ? 8.5 : 11.5}px ${Ns}`),
        (t.textAlign = "right"),
        (t.lineJoin = "round"),
        d > o - 2)
      ) {
        const f = o - (i ? 7 : 34) - a * (i ? 10 : 15);
        (a++,
          (t.textBaseline = "middle"),
          (t.strokeStyle = ht.paper),
          (t.lineWidth = 3),
          t.strokeText(`↓ ${u}`, n - 6, f),
          (t.fillStyle = r.color),
          t.fillText(`↓ ${u}`, n - 6, f));
        continue;
      }
      d < 0 ||
        ((t.strokeStyle = r.color),
        (t.globalAlpha = 0.75),
        (t.lineWidth = i ? 0.9 : 1.2),
        t.setLineDash(i ? [4, 3] : [8, 5]),
        t.beginPath(),
        t.moveTo(0, Math.round(d) + 0.5),
        t.lineTo(n, Math.round(d) + 0.5),
        t.stroke(),
        t.setLineDash([]),
        (t.globalAlpha = 1),
        (t.textBaseline = "bottom"),
        (t.strokeStyle = ht.paper),
        (t.lineWidth = 3),
        t.strokeText(u, n - 6, d - 1.5),
        (t.fillStyle = r.color),
        t.fillText(u, n - 6, d - 1.5));
    }
  }
  drawIcons(t, n, o, s, i, a, r) {
    const l = [],
      h = r ? 4.2 : Math.max(7, Math.min(12, s * 0.9)),
      c = (u, f) => u > -30 && f > -30 && u < i + 30 && f < a + 30,
      d = !r && s >= Mt.LABEL_K;
    for (const u of this.data.found) {
      const f = this.world.site.finds.find((_) => _.id === u);
      if (!f) continue;
      const p = n(f.x),
        m = o(f.y);
      if (!c(p, m)) continue;
      const y = this.world.site.notes.find(
        (_) =>
          (_.id === u || (_.kind === "find" && Math.hypot(_.x - f.x, _.y - f.y) < 0.6)) &&
          this.data.notes.includes(_.id),
      );
      (this.glyph(t, f.kind, p, m, h),
        y && this.noteGlyph(t, p + h * 1.1, m - h * 1.1, h * 0.75),
        l.push({ x: p, y: m, find: f.id, note: y?.id ?? null }),
        d && this.iconLabel(t, f.name, p + h * 1.7, m));
    }
    for (const u of this.data.notes) {
      if (l.some((y) => y.note === u)) continue;
      const f = this.world.site.notes.find((y) => y.id === u);
      if (!f) continue;
      const p = n(f.x),
        m = o(f.y) - h * 0.4;
      c(p, m) &&
        (this.noteGlyph(t, p, m, h),
        l.push({ x: p, y: m, find: null, note: f.id }),
        d && this.iconLabel(t, f.title, p + h * 1.3, m));
    }
    return l;
  }
  iconLabel(t, n, o, s) {
    ((t.font = `italic 12px ${vs}`),
      (t.textAlign = "left"),
      (t.textBaseline = "middle"),
      (t.lineJoin = "round"),
      (t.strokeStyle = ht.paper),
      (t.lineWidth = 3.5),
      t.strokeText(n, o, s),
      (t.fillStyle = ht.find),
      t.fillText(n, o, s));
  }
  noteGlyph(t, n, o, s) {
    const i = s * 0.8,
      a = s * 1;
    (t.save(),
      t.translate(n, o),
      t.rotate(-0.12),
      (t.fillStyle = ht.note),
      (t.strokeStyle = ht.find),
      (t.lineWidth = 1.1),
      t.beginPath(),
      t.moveTo(-i, -a),
      t.lineTo(i * 0.4, -a),
      t.lineTo(i, -a + i * 0.6),
      t.lineTo(i, a),
      t.lineTo(-i, a),
      t.closePath(),
      t.fill(),
      t.stroke(),
      s > 5 &&
        (t.beginPath(),
        t.moveTo(-i * 0.55, -a * 0.2),
        t.lineTo(i * 0.55, -a * 0.2),
        t.moveTo(-i * 0.55, a * 0.3),
        t.lineTo(i * 0.4, a * 0.3),
        t.stroke()),
      t.restore());
  }
  glyph(t, n, o, s, i) {
    const a =
      n === "curtain"
        ? "stal"
        : n === "columns"
          ? "hall"
          : n === "cache"
            ? "tank"
            : n === "fossils"
              ? "bones"
              : n;
    switch (
      (t.save(),
      t.translate(o, s),
      (t.fillStyle = ht.paper),
      (t.globalAlpha = 0.85),
      t.beginPath(),
      t.arc(0, 0, i * 1.35, 0, Math.PI * 2),
      t.fill(),
      (t.globalAlpha = 1),
      (t.strokeStyle = ht.find),
      (t.fillStyle = ht.find),
      (t.lineWidth = i > 5 ? 1.4 : 1),
      (t.lineJoin = "round"),
      (t.lineCap = "round"),
      t.beginPath(),
      a)
    ) {
      case "stal":
        (t.moveTo(-i, -i * 0.7), t.lineTo(i, -i * 0.7));
        for (const [r, l] of [
          [-0.6, 1],
          [0, 1.5],
          [0.6, 0.8],
        ])
          (t.moveTo((r - 0.22) * i, -i * 0.7),
            t.lineTo(r * i, (-0.7 + l) * i),
            t.lineTo((r + 0.22) * i, -i * 0.7));
        t.stroke();
        break;
      case "tank":
        (t.moveTo(-i * 0.45, -i * 0.42),
          t.lineTo(i * 0.6, -i * 0.42),
          t.arc(i * 0.6, 0, i * 0.42, -Math.PI / 2, Math.PI / 2),
          t.lineTo(-i * 0.45, i * 0.42),
          t.arc(-i * 0.45, 0, i * 0.42, Math.PI / 2, (Math.PI * 3) / 2),
          t.moveTo(-i * 0.87, 0),
          t.lineTo(-i * 1.25, 0),
          t.moveTo(-i * 1.25, -i * 0.3),
          t.lineTo(-i * 1.25, i * 0.3),
          t.stroke());
        break;
      case "reel":
        (t.arc(0, 0, i * 0.75, 0, Math.PI * 2),
          t.moveTo(i * 0.25, 0),
          t.arc(0, 0, i * 0.25, 0, Math.PI * 2),
          t.moveTo(i * 0.55, i * 0.55),
          t.lineTo(i * 1.05, i * 1),
          t.stroke());
        break;
      case "slate":
        (t.rect(-i * 0.6, -i * 0.85, i * 1.2, i * 1.7),
          t.moveTo(-i * 0.35, -i * 0.35),
          t.lineTo(i * 0.35, -i * 0.35),
          t.moveTo(-i * 0.35, i * 0.15),
          t.lineTo(i * 0.35, i * 0.15),
          t.stroke());
        break;
      case "bell":
        (t.arc(0, i * 0.35, i * 0.95, Math.PI, 0),
          t.moveTo(-i * 1.15, i * 0.35),
          t.lineTo(i * 1.15, i * 0.35),
          t.stroke(),
          (t.lineWidth = 0.9),
          t.beginPath(),
          t.moveTo(-i * 0.5, i * 0.05),
          t.lineTo(i * 0.2, i * 0.05),
          t.stroke());
        break;
      case "bones":
        (t.ellipse(0, i * 0.3, i * 1, i * 0.75, 0, Math.PI, 0),
          t.closePath(),
          t.moveTo(-i * 0.35, i * 0.3),
          t.lineTo(-i * 0.2, -i * 0.2),
          t.lineTo(i * 0.2, -i * 0.2),
          t.lineTo(i * 0.35, i * 0.3),
          t.moveTo(i * 1, i * 0.15),
          t.arc(i * 1.18, i * 0.1, i * 0.2, Math.PI, Math.PI * 3),
          t.stroke());
        break;
      case "hall":
        (t.moveTo(-i * 1.1, i * 0.85),
          t.quadraticCurveTo(0, i * 0.35, i * 1.1, i * 0.85),
          t.moveTo(-i * 0.35, i * 0.6),
          t.lineTo(0, -i * 1),
          t.lineTo(i * 0.35, i * 0.6),
          t.stroke());
        break;
      case "body":
        (t.moveTo(0, -i * 1),
          t.lineTo(0, i * 1),
          t.moveTo(-i * 0.6, -i * 0.35),
          t.lineTo(i * 0.6, -i * 0.35),
          t.stroke());
        break;
    }
    t.restore();
  }
  drawScales(t, n, o, s) {
    const i = o.k,
      a = (f) => (f - o.oy) * i,
      r = s ? 0 : un;
    (s ||
      ((t.fillStyle = "rgba(236, 229, 207, 0.86)"),
      t.fillRect(0, 0, r, n),
      (t.strokeStyle = ht.ruler),
      (t.lineWidth = 1),
      t.beginPath(),
      t.moveTo(r + 0.5, 0),
      t.lineTo(r + 0.5, n),
      t.stroke()),
      (t.strokeStyle = ht.ruler),
      (t.fillStyle = ht.ruler),
      (t.font = `600 ${s ? 8.5 : 10.5}px ${Ns}`),
      (t.textBaseline = "middle"),
      (t.textAlign = s ? "left" : "right"),
      (t.lineWidth = 1));
    const l = s ? 10 : 5;
    t.beginPath();
    for (
      let f = Math.max(0, Math.ceil(o.oy / l) * l);
      f <= Math.min(o.oy + n / i, Mt.DEEP_Y1_M);
      f += l
    ) {
      const p = Math.round(a(f)) + 0.5,
        m = f % 10 === 0;
      if (s) {
        if (p > n - 16) continue;
        (t.moveTo(0, p), t.lineTo(4, p), t.fillText(`${f}`, 6, p));
      } else
        (t.moveTo(r - (m ? 8 : 4), p), t.lineTo(r, p), m && p > 22 && t.fillText(`${f}`, r - 10, p));
    }
    (t.stroke(), s || ((t.textAlign = "center"), (t.textBaseline = "top"), t.fillText("м", r / 2, 4)));
    const c = [2, 5, 10, 20, 25, 50, 100].find((f) => f * i >= (s ? 36 : 56)) ?? 100,
      d = s ? 26 : r + 12,
      u = n - (s ? 7 : 14);
    ((t.strokeStyle = ht.ruler),
      (t.lineWidth = s ? 1.2 : 1.6),
      t.beginPath(),
      t.moveTo(d, u - 4),
      t.lineTo(d, u),
      t.lineTo(d + c * i, u),
      t.lineTo(d + c * i, u - 4),
      t.moveTo(d + (c * i) / 2, u - 2.5),
      t.lineTo(d + (c * i) / 2, u),
      t.stroke(),
      (t.font = `600 ${s ? 8.5 : 10.5}px ${Ns}`),
      (t.textAlign = "left"),
      (t.textBaseline = "bottom"),
      t.fillText(`${c} м`, d + c * i + (s ? 4 : 6), u + (s ? 1 : 2)));
  }
  debug() {
    return {
      icons: this.icons,
      view: { ...this.fsView },
      marks: this.qs,
      preview: { ...this.pvView },
      previewW: this.pvW,
    };
  }
  showAt(t, n, o) {
    this.isOpen || this.open();
    const { W: s, H: i } = this.fsSize();
    ((this.fsView = { k: t, ox: n - s / t / 2, oy: o - i / t / 2 }), this.clampFs(), this.invalidate());
  }
}
