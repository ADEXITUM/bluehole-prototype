function Is(e, t, n, o, s, i) {
  const a = Math.max(0, n),
    r = Math.max(0, o),
    l = Math.min(t.width, n + s),
    h = Math.min(t.height, o + i);
  if (l <= a || h <= r) {
    (e.globalCompositeOperation === "source-in" || e.globalCompositeOperation === "destination-in") &&
      e.clearRect(0, 0, e.canvas.width, e.canvas.height);
    return;
  }
  e.drawImage(t, a, r, l - a, h - r, a - n, r - o, l - a, h - r);
}
const Ve = {
  get plan(){return qt("plan");},
  get log(){return qt("log");},
  sound: "bluehole-photo-survey:sound",
  get tips(){return qt("tips");},
};
// Only Blue Hole inherits the former shared save. Other locations start with
// their own preparation and lessons; sound remains a profile preference.
function expeditionSetting(id){
  const key=qt(id),value=Me(key);
  if(value!==null||Qs(key)||xt().id!=="hub")return value;
  const legacy=Me("bluehole-photo-survey:"+id);
  if(legacy!==null)de(key,legacy);
  return legacy;
}
function qt(e) {
  const t = xt().id;
  return t === "m7" ? `bluehole-photo-survey:${e}` : `bluehole-photo-survey:${t}:${e}`;
}
// Delivery computes its complete write set before publishing one commit record.
// Reads inside that synchronous operation must see the staged values too.
let expeditionWriteBatch = null;
function collectExpeditionWrites(callback) {
  if (expeditionWriteBatch) throw new Error('Nested expedition delivery');
  const writes = new Map();
  expeditionWriteBatch = writes;
  try { callback(); return [...writes].map(([key, value]) => [key, JSON.parse(value)]); }
  finally { expeditionWriteBatch = null; }
}
function Qs(e) {
  if (expeditionWriteBatch?.has(e)) return true;
  try {
    return localStorage.getItem(e) !== null;
  } catch {
    return !1;
  }
}
function af() {
  return xt().id === "m7" || Qs(qt("intro")) ? !1 : (de(qt("intro"), !0), !Qs(qt("season")));
}
function Me(e) {
  try {
    const t = expeditionWriteBatch?.has(e) ? expeditionWriteBatch.get(e) : localStorage.getItem(e);
    return t ? JSON.parse(t) : null;
  } catch {
    return null;
  }
}
function de(e, t) {
  if (expeditionWriteBatch) { expeditionWriteBatch.set(e, JSON.stringify(t)); return; }
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {}
}
const Vi = { rule: 3, bottom: "air", slots: ["deco50", "reel"] };
const Ua = { rule: 3, slots: ["reel"], back: "single" };
function Xi(e) {
  const t = ar.includes(e?.rule) ? e.rule : Vi.rule,
    n = Hs.find((a) => a.id === e?.bottom && !a.locked),
    o = n ? n.id : "air",
    s = new Set($n.filter((a) => a.active).map((a) => a.id)),
    i = Array.isArray(e?.slots)
      ? equipmentSlots(e.slots, [...s])
      : [...Vi.slots];
  return e?.back === "single" || e?.back === "twin"
    ? { rule: t, bottom: o, slots: i, back: e.back }
    : { rule: t, bottom: o, slots: i };
}
function Vn() {
  const e = expeditionSetting("plan");
  return e ? Xi(e) : null;
}
function Va(e) {
  de(Ve.plan, e);
}
function Il() {
  return expeditionSetting("log") ?? [];
}
function rf(e) {
  const t = Il(),
    n = { n: (t[t.length - 1]?.n ?? 0) + 1, date: new Date().toLocaleDateString("ru-RU"), line: e };
  return (t.push(n), de(Ve.log, t.slice(-50)), n);
}
const Ol = new Map();
function lf() {
  const e = Me(qt("dives")),
    t = typeof e == "number" && Number.isFinite(e) && e >= 0 ? Math.floor(e) : 0;
  return Math.max(t, Ol.get(xt().id) ?? 0);
}
function Pl(e) {
  const t = Math.max(0, Math.floor(e));
  (Ol.set(xt().id, t), de(qt("dives"), t));
}
const hf = new Set(_h);
const cf = new Set($s);
function df() {
  const e = expeditionSetting("tips"),
    t = typeof e?.on == "boolean" ? e.on : vt.ENABLED_DEFAULT,
    n = Array.isArray(e?.seen)
      ? [...new Set(e.seen.filter((s) => typeof s == "string" && hf.has(s)))]
      : [],
    o = (s) =>
      Array.isArray(s) ? [...new Set(s.filter((i) => typeof i == "string" && cf.has(i)))] : [];
  return {
    on: t,
    seen: n,
    ui: o(e?.ui),
    said: o(e?.said),
    diver: e?.diver === !0,
    freq: e?.freq === !0,
  };
}
function ff(e) {
  de(Ve.tips, {
    on: e.on,
    seen: [...e.seen],
    ui: [...(e.ui ?? [])],
    said: [...(e.said ?? [])],
    diver: !!e.diver,
    freq: !!e.freq,
  });
}
const uf = new Set(Zi.map((e) => e.id));
function fn() {
  const e = Me(qt("gear")),
    t = Array.isArray(e) ? e.filter((n) => typeof n == "string" && uf.has(n)) : [];
  return [...new Set([...Zi.filter((n) => n.when.start).map((n) => n.id), ...t])];
}
function pf() {
  return !Qs(qt("gear"));
}
function to(e) {
  de(qt("gear"), [...new Set(e)]);
}
function mf() {
  return Me(Ve.sound) ?? !1;
}
function yf(e) {
  de(Ve.sound, e);
}
const vl = { found: [], bestLineM: 0, bestFinds: 0, dives: 0 };
const Ko = () => new Set(xt().finds.map((e) => e.id));
function Bn() {
  const e = Ko(),
    t = Me(qt("season"));
  if (!t || typeof t != "object") return { ...vl, found: [] };
  const n = Array.isArray(t.found)
      ? [...new Set(t.found.filter((s) => typeof s == "string" && e.has(s)))]
      : [],
    o = (s) => (typeof s == "number" && Number.isFinite(s) && s >= 0 ? s : 0);
  return {
    found: n,
    bestLineM: o(t.bestLineM),
    bestFinds: Math.floor(o(t.bestFinds)),
    dives: Math.floor(o(t.dives)),
  };
}
function Nl(e) {
  de(qt("season"), e);
}
function _f(e, t, n, o = {}, marks = {}) {
  const s = Bn();
  if (!n) return { season: s, newFinds: [], bestLine: !1, prevBestLineM: s.bestLineM, album: [] };
  const i = Ko(),
    a = [...new Set(e)].filter((c) => i.has(c) && !s.found.includes(c)),
    r = {
      found: [...s.found, ...a],
      bestLineM: Math.max(s.bestLineM, t),
      bestFinds: Math.max(s.bestFinds, new Set(e).size),
      dives: s.dives + 1,
    };
  Nl(r);
  const l = {};
  for (const c of e) o[c] && (l[c] = o[c]);
  const h = Mf(l, marks).added;
  return {
    season: r,
    newFinds: a,
    bestLine: t > s.bestLineM + 0.05,
    prevBestLineM: s.bestLineM,
    album: h,
  };
}
function gf() {
  const e = { ...vl, found: [] };
  return (
    Nl(e),
    Wl({ ...Fl, notes: [] }),
    Go(bf),
    xl({ frames: {} }),
    de(qt("film"),null),
    to([]),
    xt().id !== "m7" && Pl(0),
    e
  );
}
function Cl(e) {
  return (
    typeof e == "string" &&
    e.length < Q.THUMB_MAX_CHARS * 2 &&
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(e)
  );
}
function ji() {
  const e = Ko(),
    t = Me(qt("album")),
    n = {};
  if (t && typeof t == "object" && t.frames && typeof t.frames == "object")
    for (const [o, s] of Object.entries(t.frames)) e.has(o) && Cl(s) && (n[o] = s);
  const marks = {};
  for (const id of Object.keys(n)) {
    const point = t.marks?.[id];
    if (Array.isArray(point) && point.length === 2 && point.every(v => Number.isFinite(v) && v >= 0 && v <= 1)) marks[id] = point;
  }
  const previous={};
  for(const [id,photo] of Object.entries(t?.previous??{})){
    if(!e.has(id)||!Cl(photo?.img))continue;
    const point=photo.mark;
    previous[id]={img:photo.img,...(Array.isArray(point)&&point.length===2&&point.every(v=>Number.isFinite(v)&&v>=0&&v<=1)?{mark:point}:{})};
  }
  return { frames: n, marks, previous };
}
function xl(e) {
  de(qt("album"), e);
}
function Dl(e) {
  return JSON.stringify(e).length;
}
function Mf(e, marks = {}) {
  const t = ji(),
    n = [];
  for (const o of xt().finds) {
    const s = e[o.id];
    if (!Cl(s) || t.frames[o.id]) continue;
    const i = { ...t, frames: { ...t.frames, [o.id]: s }, marks: { ...t.marks } };
    if (marks[o.id]) i.marks[o.id] = marks[o.id];
    if (Dl(i) <= mh.MAX_CHARS) {
      t.frames = i.frames;
      t.marks = i.marks;
      n.push(o.id);
    }
  }
  return (n.length && xl(t), { album: t, added: n });
}
const Fl = { map: "", notes: [], dives: 0 };
const Hl = () => new Set(xt().notes.map((e) => e.id));
function eo() {
  const e = Hl(),
    t = Me(qt("survey"));
  if (!t || typeof t != "object") return { ...Fl, notes: [] };
  const n = typeof t.map == "string" && /^\d+x\d+:/.test(t.map) ? t.map : "",
    o = Array.isArray(t.notes)
      ? [...new Set(t.notes.filter((i) => typeof i == "string" && e.has(i)))]
      : [],
    s = typeof t.dives == "number" && Number.isFinite(t.dives) && t.dives >= 0 ? Math.floor(t.dives) : 0;
    const marks=Array.isArray(t.routeMarks)?t.routeMarks.filter(validRouteMark):[];
    return { map: n, notes: o, dives: s, ...(marks.length?{routeMarks:marks}:{}) };
}
function Wl(e) {
  de(qt("survey"), e);
}
function Sf(e) {
  const t = /^(\d+)x(\d+):/.exec(e);
  return t ? { gw: Number(t[1]), gh: Number(t[2]) } : null;
}
function Bl(e, t, n) {
  return (e.map ? $o(e.map, t, n) : null) ?? new Uint8Array(t * n);
}
function validRouteMark(mark){return Number.isSafeInteger(mark)&&mark>=0&&mark<0x80000000;}
function Tf(e, t, n, routeMarks) {
  const o = eo(),
    s = Sf(e);
  if (!n || !s) return { survey: o, added: 0, routeMarksAdded: 0, kept: !1 };
  const i = $o(e, s.gw, s.gh);
  if (!i) return { survey: o, added: 0, routeMarksAdded: 0, kept: !1 };
  const a = Bl(o, s.gw, s.gh),
    r = Kd(a, i),
    l = Hl(),
    h = {
      map: wl(s.gw, s.gh, a),
      notes: [...o.notes, ...[...new Set(t)].filter((c) => l.has(c) && !o.notes.includes(c))],
      dives: o.dives + 1,
    };
  const remembered = new Set(o.routeMarks ?? []);
  const previousCount = remembered.size;
  for (const mark of routeMarks ?? []) {
    if (validRouteMark(mark)) remembered.add(mark);
  }
  if (remembered.size) h.routeMarks = [...remembered];
  return (Wl(h), { survey: h, added: r, routeMarksAdded: remembered.size - previousCount, kept: !0 });
}
const bf = { lines: [], arrows: [] };
const Af = { guide: "g", explorer: "e", own: "o", laid: "l" };
const Ef = { g: "guide", e: "explorer", o: "own", l: "laid" };
const Ze = (e) => Math.round(e * Dt.ROUND);
const Os = (e, t, n) => typeof e == "number" && Number.isFinite(e) && e >= t && e <= n;
const xn = 1e4;
function kf(e) {
  return {
    v: 2,
    lines: e.lines.map((t) => ({
      p: t.pts.flatMap((n) => [Ze(n.x), Ze(n.y)]),
      b: t.bend && t.bend.length === t.pts.length ? t.bend.flatMap((n, o) => (n ? [o] : [])) : [],
      t: t.trap.flatMap((n, o) => (n ? [o] : [])),
      par:
        t.parent === "guide"
          ? "g"
          : t.parent === "explorer"
            ? t.parentIdx > 0
              ? `e${t.parentIdx}`
              : "e"
            : t.parentIdx,
      s: Ze(t.parentS),
    })),
    arrows: e.arrows.map((t) => [Ze(t.x), Ze(t.y), Ze(t.dx), Ze(t.dy), Af[t.line]]),
  };
}
function wf(e) {
  if (!e || typeof e != "object") return { lines: [], arrows: [] };
  const t = e,
    n = [],
    o = new Map();
  (Array.isArray(t.lines) ? t.lines : []).forEach((i, a) => {
    if (
      !i ||
      typeof i != "object" ||
      !Array.isArray(i.p) ||
      i.p.length < 4 ||
      i.p.length % 2 ||
      !i.p.every((f) => Os(f, -xn * Dt.ROUND, xn * Dt.ROUND))
    )
      return;
    const r = i.p.length / 2,
      l = Array.from({ length: r }, (f, p) => ({
        x: i.p[2 * p] / Dt.ROUND,
        y: i.p[2 * p + 1] / Dt.ROUND,
      })),
      h = new Array(r - 1).fill(!1);
    for (const f of Array.isArray(i.t) ? i.t : [])
      Number.isInteger(f) && f >= 0 && f < r - 1 && (h[f] = !0);
    let c;
    if (Array.isArray(i.b)) {
      c = new Array(r).fill(!1);
      for (const f of i.b) Number.isInteger(f) && f > 0 && f < r - 1 && (c[f] = !0);
    }
    let d,
      u = -1;
    if (i.par === "g") d = "guide";
    else if (i.par === "e") d = "explorer";
    else if (typeof i.par == "string" && /^e\d{1,2}$/.test(i.par))
      ((d = "explorer"), (u = Number(i.par.slice(1))));
    else if (typeof i.par == "number" && o.has(i.par) && i.par < a) ((d = "laid"), (u = o.get(i.par)));
    else return;
    Os(i.s, 0, xn * Dt.ROUND) &&
      (o.set(a, n.length),
      n.push(
        c
          ? { pts: l, trap: h, bend: c, parent: d, parentIdx: u, parentS: i.s / Dt.ROUND }
          : { pts: l, trap: h, parent: d, parentIdx: u, parentS: i.s / Dt.ROUND },
      ));
  });
  const s = [];
  for (const i of Array.isArray(t.arrows) ? t.arrows : []) {
    if (
      !Array.isArray(i) ||
      i.length < 5 ||
      !i.slice(0, 4).every((c) => Os(c, -xn * Dt.ROUND, xn * Dt.ROUND))
    )
      continue;
    const a = Ef[String(i[4])];
    if (!a) continue;
    const r = i[2] / Dt.ROUND,
      l = i[3] / Dt.ROUND,
      h = Math.hypot(r, l);
    h < 0.5 || s.push({ x: i[0] / Dt.ROUND, y: i[1] / Dt.ROUND, dx: r / h, dy: l / h, line: a });
  }
  return { lines: n.slice(0, Dt.MAX_LINES), arrows: s.slice(0, Dt.MAX_ARROWS) };
}
function vi(e) {
  const t = wf(Me(qt("lines")));
  if (!e || t.lines.every((o) => o.bend)) return t;
  const n = { lines: t.lines.map((o) => Fi(e, o)), arrows: t.arrows };
  return (Go(n), n);
}
function Go(e) {
  de(qt("lines"), kf(e));
}
function Lf(e, t, n, o) {
  const s = t.line,
    i = [...e.lines];
  let a = 0;
  if (s.parent && s.pts.length >= 1) {
    const h = Zr(t, n),
      { pts: c, trap: d, bend: u } = h;
    if (s.reel === "live" && c.length > s.pts.length) {
      const p = c[c.length - 1],
        m = c[c.length - 2];
      Math.hypot(p.x - m.x, p.y - m.y) < 0.5 && c.length - 1 > s.pts.length
        ? (c.pop(), d.pop(), u.pop(), (u[u.length - 1] = !1))
        : Math.hypot(p.x - m.x, p.y - m.y) < 0.5 && (c.pop(), d.pop(), u.pop());
    }
    let f = 0;
    for (let p = 1; p < c.length; p++) f += Math.hypot(c[p].x - c[p - 1].x, c[p].y - c[p - 1].y);
    c.length >= 2 &&
      f >= Dt.MIN_M &&
      i.length < Dt.MAX_LINES &&
      (i.push({
        pts: c,
        trap: d,
        bend: u,
        parent: s.parent,
        parentIdx:
          s.parent === "laid" || (s.parent === "explorer" && s.parentIdx > 0) ? s.parentIdx : -1,
        parentS: s.parentS,
      }),
      (a = 1));
  }
  const r = t.arrows
      .filter((h) => h.own && !h.prior)
      .map((h) => ({ x: h.x, y: h.y, dx: h.dx, dy: h.dy, line: h.line })),
    l = [...e.arrows, ...r].slice(0, Dt.MAX_ARROWS);
  return { lines: { lines: i, arrows: l }, added: a, arrows: l.length - e.arrows.length };
}
function Rf(e, t, n) {
  const o = Lf(vi(), e, t);
  return ((o.added || o.arrows) && Go(o.lines), o);
}
