class nd {
  constructor() {
    M(this, "ax", 0);
    M(this, "ay", 0);
    M(this, "zoom", 48);
    M(this, "zoomFrom", 48);
    M(this, "zoomTo", 48);
    M(this, "zoomT", 1);
    M(this, "leadX", 0);
    M(this, "leadY", 0);
  }
  left(t) {
    return this.ax - t / this.zoom / 2;
  }
  top(t) {
    return this.ay - (t / this.zoom) * st.CAM_ANCHOR_Y;
  }
  clamped(t, n, o, s, i) {
    const a = o / this.zoom,
      r = s / this.zoom,
      l = Math.max(0, i.w - a),
      h = Math.max(st.CAM_TOP_M, i.h - i.airRows - r),
      c = Math.min(l, Math.max(0, t - a / 2)),
      d = Math.min(h, Math.max(st.CAM_TOP_M, n - r * st.CAM_ANCHOR_Y));
    return { x: c + a / 2, y: d + r * st.CAM_ANCHOR_Y };
  }
  stepZoom(t, n) {
    if (
      (t !== this.zoomTo && ((this.zoomFrom = this.zoom), (this.zoomTo = t), (this.zoomT = 0)),
      this.zoomT >= 1)
    ) {
      this.zoom = this.zoomTo;
      return;
    }
    ((this.zoomT = Math.min(1, this.zoomT + n / st.ZOOM_S)),
      (this.zoom =
        this.zoomT >= 1
          ? this.zoomTo
          : this.zoomFrom * Math.pow(this.zoomTo / this.zoomFrom, ed(this.zoomT))));
  }
  update(t, n, o, s, i, a, r, l, h) {
    this.stepZoom(h, l);
    const c = st.CAM_LEAD_M / Math.max(Math.hypot(o, s), st.CAM_LEAD_VREF) + 1 / st.CAM_FOLLOW,
      d = Math.min(1, l * st.CAM_LEAD_RATE);
    ((this.leadX += (o * c - this.leadX) * d), (this.leadY += (s * c - this.leadY) * d));
    const u = this.clamped(t + this.leadX, n + this.leadY, i, a, r),
      f = Math.min(1, l * st.CAM_FOLLOW),
      p = this.clamped(this.ax + (u.x - this.ax) * f, this.ay + (u.y - this.ay) * f, i, a, r);
    ((this.ax = p.x), (this.ay = p.y));
  }
  snap(t, n, o, s, i, a) {
    ((this.zoom = this.zoomFrom = this.zoomTo = a), (this.zoomT = 1), (this.leadX = this.leadY = 0));
    const r = this.clamped(t, n, o, s, i);
    ((this.ax = r.x), (this.ay = r.y));
  }
}
const At = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace';
const pt = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
function me(e) {
  if (!Number.isFinite(e)) return "—";
  const t = Math.max(0, Math.floor(e));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function ba(e, t, n, o) {
  (e.save(), (e.lineCap = "round"), (e.strokeStyle = "#efe7d2"), (e.lineWidth = o * 0.32));
  for (const s of [1, -1]) {
    (e.beginPath(),
      e.moveTo(t - o * 1.25 * s, n - o * 0.9),
      e.lineTo(t + o * 1.25 * s, n + o * 1.25),
      e.stroke());
    for (const [i, a] of [
      [t - o * 1.25 * s, n - o * 0.9],
      [t + o * 1.25 * s, n + o * 1.25],
    ])
      ((e.fillStyle = "#efe7d2"), e.beginPath(), e.arc(i, a, o * 0.2, 0, Math.PI * 2), e.fill());
  }
  ((e.strokeStyle = "#17140f"),
    (e.lineWidth = Math.max(1, o * 0.08)),
    (e.fillStyle = "#efe7d2"),
    e.beginPath(),
    e.arc(t, n - o * 0.1, o * 0.85, Math.PI * 0.9, Math.PI * 2.1),
    e.lineTo(t + o * 0.62, n + o * 0.55),
    e.lineTo(t - o * 0.62, n + o * 0.55),
    e.closePath(),
    e.fill(),
    e.stroke(),
    e.beginPath(),
    e.rect(t - o * 0.42, n + o * 0.5, o * 0.84, o * 0.35),
    e.fill(),
    e.stroke(),
    (e.fillStyle = "#17140f"));
  for (const s of [-1, 1])
    (e.beginPath(),
      e.ellipse(t + s * o * 0.33, n - o * 0.05, o * 0.22, o * 0.27, 0, 0, Math.PI * 2),
      e.fill());
  (e.beginPath(),
    e.moveTo(t, n + o * 0.2),
    e.lineTo(t - o * 0.1, n + o * 0.42),
    e.lineTo(t + o * 0.1, n + o * 0.42),
    e.closePath(),
    e.fill());
  for (let s = -1; s <= 1; s++)
    e.fillRect(t + s * o * 0.22 - o * 0.02, n + o * 0.55, o * 0.04, o * 0.28);
  e.restore();
}
function et(e, t, n, o, s, i) {
  const a = Math.max(0, Math.min(i, o / 2, s / 2));
  (e.beginPath(),
    e.moveTo(t + a, n),
    e.arcTo(t + o, n, t + o, n + s, a),
    e.arcTo(t + o, n + s, t, n + s, a),
    e.arcTo(t, n + s, t, n, a),
    e.arcTo(t, n, t + o, n, a),
    e.closePath());
}
const Qt = (e) => Math.max(0, Math.min(1, e));
const id = {
  face: 1,
  tieKind: "off",
  autoAng: 0,
  autoOn: !1,
  time: 0,
  pickupTank: "deco",
  cameraReady: !0,
  waitOn: !1,
};
const Aa = {
  auto: mt.auto,
  dash: mt.dash,
  tie: mt.tie,
  arrow: mt.arrow,
  valve: mt.valve,
  torch: mt.torch,
  untangle: mt.untangle,
  leave: mt.rows["leave:deco"],
  pickup: mt.pickup,
  read: mt.read,
  camera: mt.camera,
  wait: mt.wait,
  gas: mt.gas,
};
function fl(e) {
  const t = e.ox;
  return t.phase === "convulse"
    ? 1
    : t.phase !== "symptoms" || t.limit <= 0
      ? 0
      : j.OX_VIS_MIN + (1 - j.OX_VIS_MIN) * Qt(t.t / t.limit);
}
const sd = [
  "auto",
  "dash",
  "tie",
  "arrow",
  "valve",
  "torch",
  "untangle",
  "leave",
  "pickup",
  "read",
  "camera",
  "wait",
];
const Ea = (e) => ({
  auto: e,
  dash: e,
  tie: e,
  arrow: e,
  valve: e,
  torch: e,
  untangle: e,
  leave: e,
  pickup: e,
  read: e,
  camera: e,
  wait: e,
});
const od = { in: "НАЧАТЬ ЛИНИЮ", off: "ЗАКРЕПИТЬ", end: "ОБРЕЗАТЬ" };
function ad(e) {
  return e < H.GAS_RED_BAR ? I.red : e < H.GAS_AMBER_BAR ? I.amber : null;
}
class rd {
  constructor() {
    M(this, "jitter", { t: 0, v: [0, 0, 0, 0, 0, 0, 0, 0] });
    M(this, "zones", []);
    M(this, "vis", Ea(0));
    M(this, "want", {
      auto: !1,
      dash: !1,
      tie: !1,
      arrow: !1,
      valve: !1,
      torch: !1,
      untangle: !1,
      leave: !1,
      pickup: !1,
      read: !1,
      camera: !1,
      wait: !1,
    });
    M(this, "pulse", Ea(9));
    M(this, "tieKind", "off");
    M(this, "pickupTank", "deco");
    M(this, "lastIcon", null);
    M(this, "anchors", new Map());
    M(this, "holdLast", null);
    M(this, "drain", null);
    M(this, "ui", null);
    M(this, "layer", null);
  }
  buttonZones() {
    return this.zones;
  }
  anchorOf(t) {
    return this.anchors.get(t) ?? null;
  }
  has(t) {
    return !this.ui || this.ui.diver || this.ui.has(t);
  }
  get jargon() {
    return !this.ui || this.ui.diver;
  }
  uiLayer(t) {
    if (typeof document > "u") return null;
    this.layer || (this.layer = document.createElement("canvas").getContext("2d"));
    const n = this.layer;
    return n
      ? ((n.canvas.width !== t.canvas.width || n.canvas.height !== t.canvas.height) &&
          ((n.canvas.width = t.canvas.width), (n.canvas.height = t.canvas.height)),
        n.setTransform(1, 0, 0, 1, 0, 0),
        (n.globalAlpha = 1),
        (n.globalCompositeOperation = "source-over"),
        n.clearRect(0, 0, n.canvas.width, n.canvas.height),
        n.setTransform(t.getTransform()),
        n)
      : null;
  }
  drawDeathVignette(t, n, o) {
    if (o <= 0.001) return;
    const s = n.layout,
      i = Math.max(
        Math.hypot(n.diverX, n.diverY),
        Math.hypot(s.cssW - n.diverX, n.diverY),
        Math.hypot(n.diverX, s.cssH - n.diverY),
        Math.hypot(s.cssW - n.diverX, s.cssH - n.diverY),
      ),
      a = Math.hypot(s.cssW, s.cssH) / 2,
      r = Math.max(0, a * Rt.OPEN_R * (1 - o)),
      l = r + a * Rt.SOFT_R * (1 - 0.6 * o),
      h = Rt.VIGNETTE_RGB;
    if (r < i) {
      const d = t.createRadialGradient(n.diverX, n.diverY, r, n.diverX, n.diverY, Math.max(r + 1, l));
      (d.addColorStop(0, `rgba(${h},0)`),
        d.addColorStop(0.6, `rgba(${h},0.75)`),
        d.addColorStop(1, `rgba(${h},1)`),
        (t.fillStyle = d),
        t.fillRect(0, 0, s.cssW, s.cssH));
    }
    const c = Qt((o - 0.82) / 0.18);
    c > 0 && ((t.fillStyle = `rgba(${h},${c.toFixed(3)})`), t.fillRect(0, 0, s.cssW, s.cssH));
  }
  draw(t, n, o, s, i) {
    const a = s.layout,
      r = a.u;
    ((this.zones = []), this.anchors.clear(), (this.ui = s.ui ?? null));
    const l = Math.floor(s.time * H.BLINK_HZ * 2) % 2 === 0;
    if (((this.jitter.t -= i), this.jitter.t <= 0)) {
      this.jitter.t = 1 / j.NARC_JITTER_HZ;
      const d = j.NARC_JITTER_PX * o.narc * r;
      this.jitter.v = this.jitter.v.map(() => (Math.random() * 2 - 1) * d);
    }
    const h = (d) => this.jitter.v[d % this.jitter.v.length];
    (this.drawVignette(t, a, o.narc), this.drawOx(t, n, s));
    const c = kn(n);
    if ((this.drawDeathVignette(t, s, c.close), c.ui > 0.002)) {
      const d = c.ui < 0.998 ? this.uiLayer(t) : null,
        u = d ?? t;
      (this.has("ruler") && this.drawRuler(u, n, o, s, r),
        this.has("deco") && this.drawStopWindow(u, n, o, s, r),
        this.has("ascent") && this.drawAscent(u, n, s, r, l),
        this.drawPanel(u, n, o, s, r, l, h),
        n.phase === "dive" && s.menuOpen && this.drawGasMenu(u, n, s, r),
        n.phase === "dive" && s.note && this.drawNote(u, s, s.note, r),
        this.drawHoldRing(u, n, s, r),
        this.drawLineHoldRing(u, n, s, r),
        this.drawFailHoldRing(u, n, s, r),
        this.drawCameraHoldRing(u, n, s, r),
        this.drawHoldDrain(u, n, s, r, i),
        this.drawButtons(u, n, s, r, i),
        n.phase === "dive" && s.line && !s.tip && this.drawLine(u, s, s.line, r),
        n.phase === "dive" && s.shotBadge && this.drawShotBadge(u, s, s.shotBadge, r),
        this.drawJoystick(u, s.joy),
        d &&
          (t.save(),
          t.setTransform(1, 0, 0, 1, 0, 0),
          (t.globalAlpha = c.ui),
          t.drawImage(d.canvas, 0, 0),
          t.restore()));
    }
    (this.drawStage(t, n, s, r),
      s.fade > 0 &&
        ((t.fillStyle = `rgba(0,0,0,${s.fade.toFixed(3)})`), t.fillRect(0, 0, a.cssW, a.cssH)),
      s.tip && n.phase === "dive" && this.drawTip(t, n, s, s.tip, r));
  }
  panelRect(t, n) {
    const o = t.u,
      s = H.PANEL_TOP * o;
    return { x: s, y: s, w: t.cssW - 2 * s, h: (n.tanks.length >= 3 ? H.PANEL_H3 : H.PANEL_H) * o };
  }
  drawPanel(t, n, o, s, i, a, r) {
    const { x: l, y: h, w: c, h: d } = this.panelRect(s.layout, n);
    ((t.fillStyle = I.hudBg),
      et(t, l, h, c, d, 10 * i),
      t.fill(),
      (t.strokeStyle = I.hudLine),
      (t.lineWidth = 1),
      t.stroke(),
      (t.textBaseline = "alphabetic"));
    const u = this.jargon;
    ((t.textAlign = "left"), (t.fillStyle = I.hudText), (t.font = `700 ${31 * i}px ${At}`));
    const f = n.depth.toFixed(1);
    t.fillText(f, l + 12 * i + r(0), h + 38 * i + r(1));
    const p = t.measureText(f).width;
    ((t.font = `600 ${12 * i}px ${pt}`),
      (t.fillStyle = I.hudDim),
      t.fillText("м", l + 15 * i + p, h + 38 * i),
      this.anchors.set("depth", { kind: "rect", x: l + 8 * i, y: h + 8 * i, w: p + 20 * i, h: 36 * i }));
    const m = l + 124 * i;
    (this.label(t, "ВРЕМЯ", m, h + 15 * i, i),
      (t.fillStyle = I.hudText),
      (t.font = `600 ${16 * i}px ${At}`));
    const y = me(n.t);
    if (
      (t.fillText(y, m + r(2), h + 36 * i + r(3)),
      this.anchors.set("time", { kind: "rect", x: m - 4 * i, y: h + 5 * i, w: 62 * i, h: 36 * i }),
      n.timeScale > 1)
    ) {
      const K = t.measureText(y).width;
      t.font = `700 ${11 * i}px ${At}`;
      const B = `×${n.timeScale}`,
        Y = t.measureText(B).width + 6 * i,
        x = n.auto.on;
      ((t.fillStyle = x ? "rgba(143,224,240,0.08)" : "rgba(143,224,240,0.18)"),
        et(t, m + K + 6 * i, h + 24 * i, Y, 15 * i, 4 * i),
        t.fill(),
        (t.globalAlpha = x ? 0.55 : 1),
        (t.fillStyle = I.teal),
        t.fillText(B, m + K + 9 * i, h + 35.5 * i),
        (t.globalAlpha = 1));
    }
    const _ = l + c - 12 * i,
      g = o.stop > 0,
      S = n.alarms.ceiling,
      A = l + c - 158 * i,
      E = g ? this.has("deco") : this.has("ndl");
    if (
      (S && E && this.alarmBox(t, A, h + 5 * i, 150 * i, 40 * i, i, a), (t.textAlign = "right"), E && !g)
    ) {
      this.label(t, u ? "NDL" : "БЕЗ СТОПА", _, h + 15 * i, i, "right");
      const K = o.ndl,
        B = Number.isFinite(K) && K <= ut.NDL_SHOW_MAX_S;
      ((t.fillStyle = B && K < H.NDL_WARN_S ? I.amber : I.hudText),
        (t.font = `700 ${23 * i}px ${At}`),
        t.fillText(B ? me(K) : "—", _ + r(4), h + 38 * i + r(5)),
        this.anchors.set("ndl", { kind: "rect", x: _ - 70 * i, y: h + 5 * i, w: 74 * i, h: 38 * i }));
    } else if (E) {
      const K = S && a ? "#ffffff" : I.amber,
        B = `${u ? "TTS" : "ПОДЪЁМ"} ${Number.isFinite(o.tts) ? "≈" + me(o.tts) : "—"}`,
        Y = u ? `СТОП · ПОТ ${o.ceiling.toFixed(1)}` : `ПОТОЛОК ${o.ceiling.toFixed(1)}`;
      let x = 9;
      t.font = `600 ${x * i}px ${pt}`;
      const G = t.measureText(B).width + t.measureText(Y).width + 10 * i;
      (G > 142 * i && (x = Math.max(7, (x * 142 * i) / G)),
        (t.fillStyle = I.hudDim),
        (t.font = `600 ${x * i}px ${pt}`),
        t.fillText(B, _, h + 15 * i),
        (t.textAlign = "left"),
        t.fillText(Y, A + 8 * i, h + 15 * i),
        (t.textAlign = "right"),
        (t.fillStyle = K),
        (t.font = `700 ${15 * i}px ${At}`));
      const J = Number.isFinite(o.stopTime) ? me(Math.max(1, o.stopTime)) : "—";
      t.fillText(J, _ + r(4), h + 38 * i + r(5));
      const ot = t.measureText(J).width;
      ((t.font = `700 ${23 * i}px ${At}`),
        t.fillText(`${o.stop}м`, _ - ot - 8 * i + r(6), h + 38 * i + r(7)),
        this.anchors.set("deco", { kind: "rect", x: A, y: h + 5 * i, w: 150 * i, h: 40 * i }));
    }
    S && E && this.bang(t, A - 4 * i, h + 25 * i, i);
    const b = h + 46 * i,
      T = h + d - 4 * i,
      w = (b + T) / 2 - 5.5 * i,
      L = w - 3.5 * i,
      R = n.tanks[n.breathing],
      P = Bt[R.mix],
      v = Wn[R.mix],
      N = (P.tag.length > 2 ? 52 : 38) * i,
      O = N + 14 * i,
      C = l + 12 * i;
    let W = C;
    if (this.has("gasMenu")) {
      (this.label(t, "ГАЗ", C, L, i),
        s.keyboard && this.keyBadge(t, mt.gas, C + 26 * i, L - 7 * i, i),
        (t.fillStyle = s.menuOpen ? "rgba(143,224,240,0.16)" : "rgba(255,255,255,0.04)"),
        et(t, C, w, O, 21 * i, 5 * i),
        t.fill(),
        (t.strokeStyle = v),
        (t.lineWidth = (s.menuOpen ? 2.2 : 1.5) * i),
        t.stroke(),
        (t.fillStyle = v),
        (t.textAlign = "center"),
        (t.font = `700 ${13 * i}px ${At}`),
        t.fillText(P.tag, C + N / 2 + 1 * i, w + 15.5 * i));
      const K = C + O - 8 * i,
        B = w + 10.5 * i;
      (t.beginPath(),
        s.menuOpen
          ? (t.moveTo(K - 3.5 * i, B + 2 * i),
            t.lineTo(K + 3.5 * i, B + 2 * i),
            t.lineTo(K, B - 2.5 * i))
          : (t.moveTo(K - 3.5 * i, B - 2 * i),
            t.lineTo(K + 3.5 * i, B - 2 * i),
            t.lineTo(K, B + 2.5 * i)),
        t.closePath(),
        t.fill());
      const Y = H.TILE_PAD * i;
      (n.phase === "dive" &&
        this.zones.push({
          id: "gasTile",
          kind: "rect",
          x: C - Y,
          y: w - Y,
          w: O + Y * 2,
          h: Math.min(21 * i + Y * 2, h + d + Y - (w - Y)),
        }),
        this.anchors.set("gasTile", { kind: "rect", x: C, y: w, w: O, h: 21 * i }),
        (W = C + O + 10 * i));
    }
    let V = W;
    if (this.has("ppo2")) {
      const K = n.alarms.ppo2High || n.alarms.ppo2Low,
        B = n.t - n.gasT;
      (!K &&
        B >= 0 &&
        B < H.PO2_FLASH_S &&
        ((t.globalAlpha = 1 - B / H.PO2_FLASH_S),
        (t.strokeStyle = v),
        (t.lineWidth = 2 * i),
        et(t, W - 5 * i, L - 10 * i, 48 * i, w + 23 * i - (L - 10 * i), 6 * i),
        t.stroke(),
        (t.globalAlpha = 1)),
        K && this.alarmBox(t, W - 4 * i, L - 10 * i, 46 * i, w + 23 * i - (L - 10 * i), i, a),
        this.anchors.set("ppo2", {
          kind: "rect",
          x: W - 4 * i,
          y: L - 10 * i,
          w: 46 * i,
          h: w + 23 * i - (L - 10 * i),
        }),
        (t.textAlign = "left"),
        this.label(t, u ? "PO2" : "O2", W, L, i));
      const Y = K ? "alarm" : Ih(o.ppo2),
        x = B >= 0 && B < H.PO2_FLASH_S,
        G = Y !== "normal" || x;
      ((t.fillStyle =
        Y === "alarm" ? (a ? "#ffffff" : I.red) : Y !== "normal" ? I.amber : x ? I.hudText : I.hudDim),
        (t.font = `${G ? 700 : 600} ${(G ? H.PO2_BRIGHT_PX : H.PO2_DIM_PX) * i}px ${At}`),
        t.fillText(o.ppo2.toFixed(2), W + r(0) * 0.5, w + 16 * i + r(2) * 0.5),
        K && this.bang(t, W + 44 * i, w + 6 * i, i),
        (V = W + 56 * i));
    }
    (this.drawTanks(t, n, V, l + c - 10 * i, b, T, i, a, r), (t.textAlign = "left"));
  }
  drawTanks(t, n, o, s, i, a, r, l, h) {
    const c = n.tanks.length,
      d = (a - i) / c;
    this.anchors.set("tanks", { kind: "rect", x: o - 4 * r, y: i, w: s - o + 8 * r, h: a - i });
    const u = 50 * r,
      f = 38 * r;
    (n.tanks.forEach((p, m) => {
      const y = m === n.breathing,
        _ = i + m * d,
        g = _ + d / 2,
        S = Wn[p.mix],
        A = !p.carried;
      (y &&
        c > 1 &&
        ((t.fillStyle = "rgba(143,224,240,0.08)"),
        et(t, o - 4 * r, _ + 1 * r, s - o + 8 * r, d - 2 * r, 4 * r),
        t.fill(),
        (t.fillStyle = S),
        et(t, o - 4 * r, _ + 3 * r, 2.5 * r, d - 6 * r, 1.2 * r),
        t.fill()),
        (t.textAlign = "left"),
        (t.textBaseline = "middle"),
        (t.font = `700 ${(c === 1 ? 9 : 8) * r}px ${pt}`),
        (t.fillStyle = y ? S : A ? "rgba(127,163,173,0.75)" : I.hudDim));
      const E = c === 1 && !this.has("gasMenu") ? "ГАЗ" : Yt[p.id].label.toUpperCase();
      t.fillText(E, o + 1 * r, g);
      let b = o + u;
      if (A) {
        const P = p.x - n.diver.x,
          v = p.y - n.diver.y,
          N = Math.hypot(P, v),
          O = o + u + 1 * r;
        (this.clipIcon(t, O, g, r * 0.75, I.amber),
          (t.font = `700 ${8.5 * r}px ${At}`),
          (t.fillStyle = I.amber));
        const W = `${v < -2 ? "↑" : v > 2 ? "↓" : ""}${N < 10 ? N.toFixed(1) : Math.round(N)}м`;
        (t.fillText(W, O + 5 * r, g + 0.5 * r), (b = O + 5 * r + t.measureText(W).width + 5 * r));
      }
      const T = c === 1 ? 9 * r : Math.max(3 * r, Math.min(7 * r, d * 0.4)),
        k = y && n.alarms.gasOut,
        w = this.has("turnMarks") ? p.marks : [],
        L = y ? ad(p.bar) : null;
      (this.pressureBar(
        t,
        p.bar,
        p.startBar,
        w,
        b,
        s - f,
        g - T / 2,
        T,
        r,
        k && l,
        y ? 1 : A ? 0.45 : 0.6,
        L,
      ),
        (t.textAlign = "right"));
      const R = y ? (c === 1 ? 17 : 13.5) : 11;
      ((t.font = `${y ? 700 : 600} ${R * r}px ${At}`),
        k &&
          this.alarmBox(
            t,
            s - f + 4 * r,
            g - R * 0.62 * r - 2 * r,
            f - 2 * r,
            R * 1.24 * r + 4 * r,
            r,
            l,
          ),
        (t.fillStyle = k
          ? l
            ? "#ffffff"
            : I.red
          : L || (y ? I.hudText : A ? "rgba(127,163,173,0.7)" : I.hudDim)),
        t.fillText(
          String(Math.max(0, Math.round(p.bar))),
          s + (y ? h(1) * 0.5 : 0),
          g + (y ? h(3) * 0.5 : 0) + 0.5 * r,
        ),
        k && this.bang(t, s - f - 4 * r, g, r));
    }),
      (t.textBaseline = "alphabetic"));
  }
  pressureBar(t, n, o, s, i, a, r, l, h, c, d, u = null) {
    const f = a - i;
    ((t.fillStyle = "rgba(255,255,255,0.09)"), t.fillRect(i, r, f, l));
    const p = Math.max(0, Math.min(1, n / o));
    ((t.fillStyle = c ? I.red : (u ?? `rgba(214,236,240,${(0.85 * d).toFixed(3)})`)),
      t.fillRect(i, r, f * p, l),
      s.forEach((m, y) => {
        const _ = Math.round(i + (f * m) / o);
        t.fillStyle = `rgba(255,255,255,${Math.min(1, 0.4 + d).toFixed(3)})`;
        const g = y === 0,
          S = g ? 3 * h : 1.5 * h;
        (t.fillRect(_ - (g ? 1 : 0.5) * h, r - S, (g ? 2 : 1) * h, l + S * 2),
          g &&
            l > 5 * h &&
            (t.beginPath(),
            t.moveTo(_ - 4 * h, r - S - 4 * h),
            t.lineTo(_ + 4 * h, r - S - 4 * h),
            t.lineTo(_, r - S),
            t.closePath(),
            t.fill()));
      }));
  }
  label(t, n, o, s, i, a = "left") {
    ((t.textAlign = a),
      (t.fillStyle = I.hudDim),
      (t.font = `600 ${9 * i}px ${pt}`),
      t.fillText(n, o, s));
  }
  keyBadge(t, n, o, s, i) {
    (t.save(), (t.font = `700 ${8 * i}px ${At}`));
    const a = Math.max(9 * i, t.measureText(n).width + 6 * i);
    ((t.fillStyle = "rgba(230,245,248,0.9)"),
      et(t, o - a / 2, s - 6 * i, a, 12 * i, 3 * i),
      t.fill(),
      (t.fillStyle = "#06141c"),
      (t.textAlign = "center"),
      (t.textBaseline = "middle"),
      t.fillText(n, o, s + 0.5 * i),
      t.restore());
  }
  alarmBox(t, n, o, s, i, a, r) {
    (r && ((t.fillStyle = "rgba(200,40,50,0.55)"), et(t, n, o, s, i, 6 * a), t.fill()),
      (t.strokeStyle = I.red),
      (t.lineWidth = 2 * a),
      et(t, n, o, s, i, 6 * a),
      t.stroke());
  }
  bang(t, n, o, s) {
    const i = t.textBaseline;
    ((t.textBaseline = "alphabetic"),
      (t.fillStyle = I.red),
      t.beginPath(),
      t.moveTo(n, o - 7 * s),
      t.lineTo(n + 7 * s, o + 6 * s),
      t.lineTo(n - 7 * s, o + 6 * s),
      t.closePath(),
      t.fill(),
      (t.fillStyle = "#ffffff"),
      (t.font = `800 ${9 * s}px ${pt}`),
      (t.textAlign = "center"),
      t.fillText("!", n, o + 5 * s),
      (t.textBaseline = i));
  }
  drawGasMenu(t, n, o, s) {
    const i = this.panelRect(o.layout, n),
      a = H.MENU_GAP * s,
      r = i.x,
      l = i.y + i.h + 6 * s,
      h = Math.min(H.MENU_W * s, i.w),
      c = o.options.filter((E) => E.kind !== "drop"),
      d = o.options.filter((E) => E.kind === "drop"),
      u = H.MENU_ROW_H * s,
      f = H.MENU_SUB_H * s,
      p = a + c.length * (u + a);
    ((t.fillStyle = H.MENU_BG),
      et(t, r, l, h, p, 10 * s),
      t.fill(),
      (t.strokeStyle = I.hudLine),
      (t.lineWidth = 1),
      t.stroke(),
      (t.textBaseline = "alphabetic"));
    let m = l + a;
    for (const E of c)
      (this.drawGasRow(t, n, o, s, E, r + a, m, h - a * 2, u),
        this.zones.push({ id: `row:${E.row}`, kind: "rect", x: r + a, y: m, w: h - a * 2, h: u }),
        (m += u + a));
    if (!d.length) return;
    const y = r + H.MENU_DROP_INDENT * s,
      _ = h - H.MENU_DROP_INDENT * s,
      g = l + p + H.MENU_DROP_GAP * s,
      S = a + d.length * (f + a);
    ((t.fillStyle = H.MENU_DROP_BG),
      et(t, y, g, _, S, 9 * s),
      t.fill(),
      t.save(),
      t.setLineDash([4 * s, 3 * s]),
      (t.strokeStyle = H.MENU_DROP_LINE),
      (t.lineWidth = 1.2 * s),
      t.stroke(),
      t.restore());
    let A = g + a;
    for (const E of d)
      (this.drawLeaveRow(t, n, o, s, E, y + a, A, _ - a * 2, f),
        this.zones.push({ id: `row:${E.row}`, kind: "rect", x: y + a, y: A, w: _ - a * 2, h: f }),
        (A += f + a));
  }
  rowHold(t, n, o) {
    return !o.current && o.enabled && n.pickHeld === o.row && t.hold && t.hold.row === o.row
      ? Qt(t.hold.t / Ii(t.hold.kind))
      : 0;
  }
  drawGasRow(t, n, o, s, i, a, r, l, h) {
    const c = Wn[i.mix],
      d = !i.current && o.pickHeld === i.row,
      u = this.rowHold(n, o, i);
    ((t.fillStyle = i.current ? "rgba(143,224,240,0.08)" : "rgba(255,255,255,0.05)"),
      et(t, a, r, l, h, 7 * s),
      t.fill(),
      u > 0 &&
        (t.save(),
        et(t, a, r, l, h, 7 * s),
        t.clip(),
        (t.fillStyle = "rgba(255,194,74,0.32)"),
        t.fillRect(a, r, l * u, h),
        t.restore()),
      (t.strokeStyle = d ? I.amber : i.current ? c : "rgba(140,220,230,0.22)"),
      (t.lineWidth = (d ? 2.2 : i.current ? 1.5 : 1) * s),
      et(t, a, r, l, h, 7 * s),
      t.stroke(),
      i.current &&
        ((t.fillStyle = c), et(t, a + 3 * s, r + 7 * s, 3.5 * s, h - 14 * s, 2 * s), t.fill()),
      o.keyboard && this.rowKey(t, i.row, a + 13 * s, r + h / 2, s));
    const f = a + 22 * s,
      p = (Bt[i.mix].tag.length > 2 ? 50 : 40) * s;
    ((t.strokeStyle = c),
      (t.lineWidth = 1.6 * s),
      et(t, f, r + 9 * s, p, h - 18 * s, 5 * s),
      t.stroke(),
      (t.fillStyle = c),
      (t.textAlign = "center"),
      (t.font = `700 ${13 * s}px ${At}`),
      t.fillText(Bt[i.mix].tag, f + p / 2, r + h / 2 + 4.5 * s),
      i.carried || this.clipIcon(t, f + p / 2, r + 6 * s, s * 0.8, c));
    const m = f + p + 10 * s;
    if (((t.textAlign = "left"), i.kind === "pickup"))
      ((t.fillStyle = I.hudText),
        (t.font = `800 ${12 * s}px ${pt}`),
        t.fillText("ПОДОБРАТЬ", m, r + 21 * s),
        (t.fillStyle = I.hudDim),
        (t.font = `600 ${8.5 * s}px ${pt}`),
        t.fillText(
          this.jargon ? `MOD ${Math.floor(i.mod)} м` : `до ${Math.floor(i.mod)} м`,
          m,
          r + h - 9 * s,
        ));
    else {
      ((t.fillStyle = I.hudDim),
        (t.font = `700 ${8.5 * s}px ${pt}`),
        t.fillText(this.jargon ? "MOD" : "ПРЕДЕЛ", m, r + 15 * s),
        (t.fillStyle = I.hudText),
        (t.font = `800 ${21 * s}px ${At}`));
      const _ = String(Math.floor(i.mod));
      t.fillText(_, m, r + h - 8 * s);
      const g = t.measureText(_).width;
      ((t.fillStyle = I.hudDim),
        (t.font = `600 ${10 * s}px ${pt}`),
        t.fillText("м", m + g + 2 * s, r + h - 8 * s),
        i.minDepth > 0 &&
          ((t.fillStyle = I.amber),
          (t.font = `700 ${8.5 * s}px ${pt}`),
          t.fillText(
            this.jargon ? `MIN ${Math.ceil(i.minDepth)}` : `ОТ ${Math.ceil(i.minDepth)}`,
            m + g + 14 * s,
            r + 15 * s,
          )));
    }
    const y = a + l - 9 * s;
    ((t.textAlign = "right"),
      (t.fillStyle = I.hudText),
      (t.font = `700 ${14 * s}px ${At}`),
      t.fillText(String(Math.max(0, Math.round(i.bar))), y, r + 20 * s),
      (t.fillStyle = I.hudDim),
      (t.font = `600 ${8.5 * s}px ${pt}`),
      t.fillText(Yt[i.id].label.toUpperCase(), y, r + h - 9 * s));
  }
  drawLeaveRow(t, n, o, s, i, a, r, l, h) {
    const c = i.enabled && o.pickHeld === i.row,
      d = this.rowHold(n, o, i);
    (t.save(),
      (t.globalAlpha = i.enabled ? 1 : 0.38),
      (t.fillStyle = "rgba(255,194,74,0.05)"),
      et(t, a, r, l, h, 6 * s),
      t.fill(),
      d > 0 &&
        (t.save(),
        et(t, a, r, l, h, 6 * s),
        t.clip(),
        (t.fillStyle = "rgba(255,194,74,0.32)"),
        t.fillRect(a, r, l * d, h),
        t.restore()),
      (t.strokeStyle = c ? I.amber : "rgba(255,194,74,0.22)"),
      (t.lineWidth = (c ? 2.2 : 1) * s),
      et(t, a, r, l, h, 6 * s),
      t.stroke());
    const u = a + 22 * s,
      f = r + h / 2 - 3 * s;
    (i.onLine
      ? ((t.strokeStyle = I.guideLine),
        (t.lineWidth = 1.6 * s),
        t.beginPath(),
        t.moveTo(u - 15 * s, f + 9 * s),
        t.lineTo(u + 15 * s, f + 9 * s),
        t.stroke())
      : ((t.fillStyle = I.rock), t.fillRect(u - 15 * s, f + 9 * s, 30 * s, 4 * s)),
      (t.fillStyle = i.id === "deco" ? I.ean50 : i.id === "back" ? $.TANK[1] : I.stage),
      et(t, u - 11 * s, f - 4 * s, 22 * s, 7.5 * s, 3.5 * s),
      t.fill(),
      i.onLine
        ? this.clipIcon(t, u, f + 6 * s, s * 0.6, I.amber)
        : ((t.strokeStyle = I.amber),
          (t.lineWidth = 1.4 * s),
          t.beginPath(),
          t.moveTo(u, f + 4 * s),
          t.lineTo(u, f + 9 * s),
          t.moveTo(u - 2.5 * s, f + 6.5 * s),
          t.lineTo(u, f + 9 * s),
          t.lineTo(u + 2.5 * s, f + 6.5 * s),
          t.stroke()),
      o.keyboard && this.rowKey(t, i.row, a + l - 14 * s, r + h / 2, s),
      (t.textAlign = "left"),
      (t.fillStyle = I.hudText),
      (t.font = `700 ${9.5 * s}px ${pt}`),
      t.fillText("ОСТАВИТЬ ЗДЕСЬ", a + 44 * s, r + h / 2 - 1.5 * s),
      (t.fillStyle = I.hudDim),
      (t.font = `600 ${7.5 * s}px ${pt}`),
      t.fillText(
        `${Yt[i.id].label.toUpperCase()} · ${i.onLine ? "НА ЛИНИЮ" : "НА ДНО"}`,
        a + 44 * s,
        r + h / 2 + 8.5 * s,
      ),
      t.restore());
  }
  rowKey(t, n, o, s, i) {
    ((t.fillStyle = I.hudDim),
      (t.font = `700 ${10 * i}px ${At}`),
      (t.textAlign = "center"),
      t.fillText(mt.rows[n], o, s + 3.5 * i));
  }
  clipIcon(t, n, o, s, i) {
    ((t.strokeStyle = i),
      (t.lineWidth = 1.4 * s),
      t.beginPath(),
      t.ellipse(n, o, 3 * s, 4.5 * s, 0, 0, Math.PI * 2),
      t.stroke());
  }
  ringR(t, n) {
    return Math.max(22 * n, H.HOLD_RING_M * t.ppm);
  }
  drawHoldDrain(t, n, o, s, i) {
    const a = this.holdNow(n);
    if (a) {
      ((this.holdLast = a), (this.drain = null));
      return;
    }
    if (this.holdLast) {
      const h = this.holdLast.kind,
        c =
          this.holdLast.p >= H.HOLD_DONE ||
          (h === "gas" && n.holdLock !== null) ||
          (h === "line" && n.lineHoldLock) ||
          (h === "fail" && n.fail.holdLock) ||
          (h === "camera" && n.camera.lock);
      (this.holdLast.p > 0.04 &&
        !c &&
        n.phase === "dive" &&
        !n.dying &&
        (this.drain = { p: this.holdLast.p, t: 0 }),
        (this.holdLast = null));
    }
    const r = this.drain;
    if (!r) return;
    r.t += i;
    const l = r.t / H.HOLD_DRAIN_S;
    if (l >= 1) {
      this.drain = null;
      return;
    }
    (t.save(),
      (t.globalAlpha = 1 - l * 0.6),
      this.ring(t, o, s, r.p * (1 - l) * (1 - l), "rgba(255,110,110,0.95)"),
      t.restore());
  }
  holdNow(t) {
    return t.phase !== "dive"
      ? null
      : t.hold
        ? { p: Qt(t.hold.t / Ii(t.hold.kind)), col: I.amber, kind: "gas" }
        : t.lineHold
          ? { p: Qt(t.lineHold.t / t.lineHold.need), col: I.ownLine, kind: "line" }
          : t.fail.hold
            ? { p: Qt(t.fail.hold.t / t.fail.hold.need), col: I.amber, kind: "fail" }
            : t.camera.hold > 0
              ? { p: Qt(t.camera.hold / Q.HOLD_S), col: H.CAMERA_RING, kind: "camera" }
              : null;
  }
  drawHoldRing(t, n, o, s) {
    n.phase !== "dive" || !n.hold || this.ring(t, o, s, Qt(n.hold.t / Ii(n.hold.kind)), I.amber);
  }
  drawLineHoldRing(t, n, o, s) {
    if (n.phase !== "dive" || !n.lineHold) return;
    const i = n.lineHold;
    this.ring(t, o, s, Qt(i.t / i.need), i.kind === "tie" ? I.ownLine : I.ownArrow);
  }
  drawFailHoldRing(t, n, o, s) {
    const i = n.fail.hold;
    n.phase !== "dive" ||
      !i ||
      this.ring(
        t,
        o,
        s,
        Qt(i.t / i.need),
        i.kind === "freeflow" ? I.amber : i.kind === "entangle" ? I.ownLine : "#fff4cf",
      );
  }
  drawCameraHoldRing(t, n, o, s) {
    n.phase !== "dive" ||
      n.camera.hold <= 0 ||
      this.ring(t, o, s, Qt(n.camera.hold / Q.HOLD_S), H.CAMERA_RING);
  }
  drawShotBadge(t, n, o, s) {
    const i = Q.NEW_BADGE_S;
    if (o.t >= i) return;
    const a = o.t < 0.15 ? o.t / 0.15 : o.t > i - 0.4 ? Math.max(0, (i - o.t) / 0.4) : 1,
      r = n.layout,
      l = r.cssW / 2,
      h = r.cssH * H.SHOT_BADGE_TOP,
      c = 26 * s,
      d = 112 * s;
    (t.save(),
      (t.globalAlpha = a),
      (t.fillStyle = "rgba(6,22,32,0.72)"),
      (t.strokeStyle = "rgba(223,243,255,0.85)"),
      (t.lineWidth = 1.4 * s),
      et(t, l - d / 2, h, d, c, c / 2),
      t.fill(),
      t.stroke());
    const u = l - d / 2 + 8 * s,
      f = h + 5 * s;
    ((t.strokeStyle = H.CAMERA_RING),
      (t.lineWidth = 1.6 * s),
      et(t, u, f, 26 * s, 16 * s, 2.5 * s),
      t.stroke(),
      (t.fillStyle = "#eaf7fa"),
      (t.font = `700 ${10.5 * s}px ${At}`),
      (t.textAlign = "center"),
      (t.textBaseline = "middle"),
      t.fillText(String(o.n), u + 13 * s, f + 8.5 * s));
    const p = u + 38 * s,
      m = h + c / 2;
    ((t.fillStyle = I.amber), t.beginPath());
    for (let y = 0; y < 10; y++) {
      const _ = (y % 2 ? 2.4 : 5.6) * s,
        g = -Math.PI / 2 + (y * Math.PI) / 5;
      y === 0
        ? t.moveTo(p + Math.cos(g) * _, m + Math.sin(g) * _)
        : t.lineTo(p + Math.cos(g) * _, m + Math.sin(g) * _);
    }
    (t.closePath(),
      t.fill(),
      (t.font = `700 ${11 * s}px ${pt}`),
      (t.textAlign = "left"),
      t.fillText("НОВОЕ", p + 9 * s, m + 0.5 * s),
      t.restore());
  }
  ring(t, n, o, s, i) {
    const a = this.ringR(n, o);
    ((t.lineWidth = 3 * o),
      (t.strokeStyle = "rgba(0,0,0,0.4)"),
      t.beginPath(),
      t.arc(n.diverX, n.diverY, a, 0, Math.PI * 2),
      t.stroke(),
      (t.strokeStyle = i),
      (t.lineCap = "round"),
      t.beginPath(),
      t.arc(n.diverX, n.diverY, a, -Math.PI / 2, -Math.PI / 2 + s * Math.PI * 2),
      t.stroke(),
      (t.lineCap = "butt"));
  }
  drawButtons(t, n, o, s, i) {
    const a = o.layout,
      r = o.buttons,
      l = n.phase === "dive",
      h = {
        auto: l && r.auto,
        dash: l && r.dash,
        tie: l && r.tie !== null,
        arrow: l && r.arrow,
        valve: l && r.valve,
        torch: l && r.torch,
        untangle: l && r.untangle,
        leave: l && r.leave,
        pickup: l && r.pickup !== null,
        read: l && r.read,
        camera: l && !!r.camera,
        wait: l && !!r.wait,
      };
    (r.tie && (this.tieKind = r.tie), r.pickup && (this.pickupTank = r.pickup));
    for (const g of sd) {
      (h[g] && !this.want[g] && (this.pulse[g] = 0), (this.want[g] = h[g]), (this.pulse[g] += i));
      const S = i / H.BTN_FADE_S;
      this.vis[g] = h[g] ? Math.min(1, this.vis[g] + S) : Math.max(0, this.vis[g] - S);
    }
    const c = jt.BUTTON_R_PX * s,
      d = (g) => ({ x: a.cssW * g[0], y: a.cssH * g[1] }),
      u = r.autoDir,
      f = {
        face: n.diver.face,
        tieKind: this.tieKind,
        autoAng: Math.atan2(u.y, u.x) - Math.PI / 2,
        autoOn: n.auto.on,
        time: o.time,
        pickupTank: this.pickupTank,
        cameraReady: pa(n) >= 1,
        waitOn: n.wait.on,
      };
    ((this.lastIcon = f),
      this.button(
        t,
        "dash",
        d(H.SLOT_CORNER),
        c,
        s,
        o.dashHeld || n.dash,
        "РЫВОК",
        mt.dash,
        o.keyboard,
        () => this.drawIcon(t, "dash", f),
      ));
    const p = this.tieKind,
      m = d(H.SLOT_UP),
      y = od[p];
    if (
      (this.button(t, "tie", m, c, s, o.tieHeld, y, mt.tie, o.keyboard, () =>
        this.drawIcon(t, "tie", f),
      ),
      this.vis.tie > 0.01)
    ) {
      const g = n.line.reel === "live" && o.reelLeft <= q.EMPTY_M;
      (t.save(), (t.globalAlpha = this.vis.tie));
      const S = c + 4.5 * s;
      ((t.lineWidth = 2.6 * s),
        (t.strokeStyle = g ? I.amber : "rgba(255,255,255,0.12)"),
        g && t.setLineDash([5 * s, 3.5 * s]),
        t.beginPath(),
        t.arc(m.x, m.y, S, 0, Math.PI * 2),
        t.stroke(),
        t.setLineDash([]),
        o.reelFrac > 0.001 &&
          ((t.strokeStyle = o.reelFrac < 0.15 ? I.amber : I.ownLine),
          (t.globalAlpha = this.vis.tie * (n.line.reel === "live" ? 1 : 0.6)),
          t.beginPath(),
          t.arc(m.x, m.y, S, -Math.PI / 2, -Math.PI / 2 + o.reelFrac * Math.PI * 2),
          t.stroke()),
        t.restore());
    }
    const _ = d(H.SLOT_LEFT);
    if (
      (this.button(t, "arrow", _, c, s, o.arrowHeld, "СТРЕЛКА", mt.arrow, o.keyboard, () =>
        this.drawIcon(t, "arrow", f),
      ),
      this.vis.arrow > 0.01)
    ) {
      (t.save(), (t.globalAlpha = this.vis.arrow), (t.fillStyle = I.ownArrow));
      const g = n.arrowsLeft;
      for (let S = 0; S < g; S++) {
        const A = _.x + (S - (g - 1) / 2) * 8 * s,
          E = _.y - c - 7 * s;
        (t.beginPath(),
          t.moveTo(A - 3 * s, E),
          t.lineTo(A + 2.2 * s, E - 2.6 * s),
          t.lineTo(A + 2.2 * s, E + 2.6 * s),
          t.closePath(),
          t.fill());
      }
      t.restore();
    }
    (this.button(
      t,
      "auto",
      d(o.cave ? H.SLOT_LEFT2 : H.SLOT_CORNER),
      c,
      s,
      n.auto.on || o.autoHeld,
      "АВТОПЛЫВ",
      mt.auto,
      o.keyboard,
      () => this.drawIcon(t, "auto", f),
    ),
      this.button(
        t,
        "leave",
        d(H.SLOT_LEAVE),
        c,
        s,
        o.leaveHeld,
        "ОСТАВИТЬ",
        mt.rows["leave:deco"],
        o.keyboard,
        () => this.drawIcon(t, "leave", f),
      ),
      this.button(
        t,
        "pickup",
        d(H.SLOT_PICKUP),
        c,
        s,
        o.pickupHeld,
        "ПОДОБРАТЬ",
        mt.pickup,
        o.keyboard,
        () => this.drawIcon(t, "pickup", f),
      ),
      this.button(
        t,
        "read",
        d(H.SLOT_READ),
        c,
        s,
        o.note !== null,
        o.note ? "ЗАКРЫТЬ" : "ЧИТАТЬ",
        mt.read,
        o.keyboard,
        () => this.drawIcon(t, "read", f),
      ),
      this.drawCameraButton(t, n, o, s, c, d(H.SLOT_CAMERA), f),
      this.button(
        t,
        "wait",
        d(H.SLOT_WAIT),
        c,
        s,
        n.wait.on || !!o.waitHeld,
        n.wait.on ? `ЖДУ ×${ro.SCALE}` : "ЖДАТЬ",
        mt.wait,
        o.keyboard,
        () => this.drawIcon(t, "wait", f),
      ),
      this.drawFailButtons(t, o, s, c, d, f));
  }
  drawIcon(t, n, o) {
    switch (n) {
      case "dash": {
        const s = o.face;
        ((t.strokeStyle = "#eaf7f9"), (t.lineWidth = 3.2));
        for (let i = 0; i < 2; i++) {
          const a = s * (i * 8 - 3);
          (t.beginPath(),
            t.moveTo(a - s * 5, -8),
            t.lineTo(a + s * 4, 0),
            t.lineTo(a - s * 5, 8),
            t.stroke());
        }
        ((t.lineWidth = 1.7), (t.strokeStyle = "rgba(234,247,249,0.6)"));
        for (const [i, a] of [
          [-6, 7],
          [0, 9],
          [6, 7],
        ])
          (t.beginPath(), t.moveTo(-s * (12 + a), i), t.lineTo(-s * 12, i), t.stroke());
        return;
      }
      case "tie":
        return o.tieKind === "in"
          ? this.iconTieIn(t)
          : o.tieKind === "end"
            ? this.iconReelEnd(t)
            : this.iconTieOff(t);
      case "arrow":
        ((t.strokeStyle = I.ownLine),
          (t.lineWidth = 2.2),
          t.beginPath(),
          t.moveTo(-19, 2),
          t.lineTo(19, 2),
          t.stroke(),
          (t.fillStyle = I.ownArrow),
          (t.strokeStyle = "rgba(24,18,8,0.9)"),
          (t.lineWidth = 1.4),
          t.beginPath(),
          t.moveTo(-11, 2),
          t.lineTo(8, -8),
          t.lineTo(8, 12),
          t.closePath(),
          t.fill(),
          t.stroke());
        return;
      case "auto": {
        const s = o.autoOn;
        (t.save(),
          t.rotate(o.autoAng),
          (t.strokeStyle = I.guideLine),
          (t.lineWidth = 2),
          t.beginPath(),
          t.moveTo(-10, -16),
          t.lineTo(-10, 16),
          t.stroke(),
          (t.fillStyle = I.guideLine),
          t.beginPath(),
          t.arc(-10, -4, 2.2, 0, Math.PI * 2),
          t.fill());
        const i = s ? (o.time * 1.6) % 1 : 0;
        ((t.strokeStyle = s ? I.teal : "#eaf7f9"), (t.lineWidth = 3));
        for (let a = 0; a < 2; a++) {
          const r = -9 + (a + i) * 8;
          (t.beginPath(),
            t.moveTo(-3, r - 4.5),
            t.lineTo(4, r + 2.5),
            t.lineTo(11, r - 4.5),
            t.stroke());
        }
        t.restore();
        return;
      }
      case "leave":
        ((t.strokeStyle = I.guideLine),
          (t.lineWidth = 2),
          t.beginPath(),
          t.moveTo(-4, -20),
          t.lineTo(-4, 20),
          t.stroke(),
          (t.strokeStyle = I.amber),
          (t.lineWidth = 2),
          t.beginPath(),
          t.ellipse(-4, -9, 3, 4.5, 0, 0, Math.PI * 2),
          t.stroke(),
          (t.fillStyle = I.ean50),
          (t.strokeStyle = "rgba(10,16,20,0.9)"),
          (t.lineWidth = 1.2),
          et(t, -1, -5, 9, 22, 4.5),
          t.fill(),
          t.stroke(),
          (t.fillStyle = "#39424a"),
          t.fillRect(1, -7.5, 5, 3));
        return;
      case "pickup": {
        const s = o.pickupTank;
        ((t.fillStyle = I.rock),
          t.fillRect(-19, 15, 38, 4),
          (t.fillStyle = s === "deco" ? I.ean50 : s === "back" ? $.TANK[1] : I.stage),
          (t.strokeStyle = "rgba(10,16,20,0.9)"),
          (t.lineWidth = 1.2),
          et(t, -14, 5, 23, 9, 4.5),
          t.fill(),
          t.stroke(),
          (t.fillStyle = "#39424a"),
          t.fillRect(9, 7, 3.5, 5),
          (t.strokeStyle = I.amber),
          (t.lineWidth = 2),
          t.beginPath(),
          t.ellipse(-2.5, -0.5, 3, 4.5, 0, 0, Math.PI * 2),
          t.stroke(),
          (t.strokeStyle = "#eaf7f9"),
          (t.lineWidth = 2.6),
          t.beginPath(),
          t.moveTo(-2.5, -7),
          t.lineTo(-2.5, -19),
          t.moveTo(-8, -13.5),
          t.lineTo(-2.5, -19),
          t.lineTo(3, -13.5),
          t.stroke());
        return;
      }
      case "read":
        ((t.fillStyle = H.NOTE_BG),
          (t.strokeStyle = "rgba(10,16,20,0.9)"),
          (t.lineWidth = 1.4),
          et(t, -11, -14, 22, 28, 3),
          t.fill(),
          t.stroke(),
          (t.strokeStyle = "rgba(60,52,40,0.85)"),
          (t.lineWidth = 1.8));
        for (const s of [-7, -1, 5])
          (t.beginPath(), t.moveTo(-6, s), t.lineTo(s === 5 ? 2 : 6, s), t.stroke());
        ((t.strokeStyle = I.amber),
          (t.lineWidth = 2.4),
          t.beginPath(),
          t.moveTo(8, 12),
          t.lineTo(16, 2),
          t.stroke());
        return;
      case "camera": {
        const s = o.cameraReady;
        ((t.globalAlpha *= s ? 1 : 0.55),
          (t.fillStyle = "#c9d6dc"),
          (t.strokeStyle = "rgba(10,16,20,0.9)"),
          (t.lineWidth = 1.4),
          et(t, -15, -8, 30, 19, 4),
          t.fill(),
          t.stroke(),
          (t.fillStyle = "#9fb0b8"),
          et(t, -9, -12, 9, 5, 1.5),
          t.fill(),
          t.stroke(),
          (t.fillStyle = "#26323a"),
          t.beginPath(),
          t.arc(0, 1.5, 6.5, 0, Math.PI * 2),
          t.fill(),
          (t.strokeStyle = "#dff3ff"),
          (t.lineWidth = 1.2),
          t.beginPath(),
          t.arc(0, 1.5, 4, 0, Math.PI * 2),
          t.stroke(),
          (t.fillStyle = s ? "#fff8d8" : "#56636a"),
          t.fillRect(7, -11, 7, 4));
        return;
      }
      case "valve":
        ((t.fillStyle = "#9aa6ae"),
          t.fillRect(-4, 2, 8, 15),
          (t.fillStyle = "#5b666e"),
          t.fillRect(-9, 4, 18, 5),
          (t.strokeStyle = I.amber),
          (t.lineWidth = 3),
          t.beginPath(),
          t.arc(0, -6, 10, 0, Math.PI * 2),
          t.stroke(),
          (t.lineWidth = 2.2),
          t.beginPath());
        for (let s = 0; s < 3; s++) {
          const i = (s * Math.PI) / 3 + 0.3;
          (t.moveTo(Math.cos(i) * -10, -6 + Math.sin(i) * -10),
            t.lineTo(Math.cos(i) * 10, -6 + Math.sin(i) * 10));
        }
        (t.stroke(),
          (t.strokeStyle = "rgba(234,247,249,0.85)"),
          (t.lineWidth = 1.8),
          t.beginPath(),
          t.arc(0, -6, 15, -Math.PI * 0.85, -Math.PI * 0.2),
          t.stroke(),
          t.beginPath(),
          t.moveTo(15 * Math.cos(-Math.PI * 0.2) - 4, -6 + 15 * Math.sin(-Math.PI * 0.2) - 1),
          t.lineTo(15 * Math.cos(-Math.PI * 0.2), -6 + 15 * Math.sin(-Math.PI * 0.2)),
          t.lineTo(15 * Math.cos(-Math.PI * 0.2) + 0.5, -6 + 15 * Math.sin(-Math.PI * 0.2) - 4.5),
          t.stroke());
        return;
      case "torch":
        ((t.fillStyle = "rgba(255,240,200,0.28)"),
          t.beginPath(),
          t.moveTo(4, -4),
          t.lineTo(20, -13),
          t.lineTo(20, 13),
          t.lineTo(4, 4),
          t.closePath(),
          t.fill(),
          (t.fillStyle = "#d3dbe0"),
          (t.strokeStyle = "rgba(10,16,20,0.9)"),
          (t.lineWidth = 1.2),
          et(t, -16, -5, 20, 10, 3),
          t.fill(),
          t.stroke(),
          (t.fillStyle = "#fff4cf"),
          t.fillRect(2, -5, 3, 10),
          (t.fillStyle = "#39424a"),
          t.fillRect(-10, -5, 2, 10));
        return;
      case "untangle":
        ((t.fillStyle = I.rock),
          t.beginPath(),
          t.arc(14, 15, 7, Math.PI, 0),
          t.closePath(),
          t.fill(),
          (t.strokeStyle = I.ownLine),
          (t.lineWidth = 2.3),
          t.beginPath(),
          t.moveTo(14, 8),
          t.bezierCurveTo(4, 0, 12, -14, 0, -10),
          t.bezierCurveTo(-12, -6, -4, 8, -10, 4),
          t.bezierCurveTo(-18, 0, -12, -16, -19, -14),
          t.stroke(),
          t.beginPath(),
          t.ellipse(-3, -3, 7, 5, 0.5, 0, Math.PI * 2),
          t.stroke(),
          (t.fillStyle = I.ownKnot),
          t.beginPath(),
          t.arc(14, 8, 2.5, 0, Math.PI * 2),
          t.fill());
        return;
      case "wait": {
        ((t.strokeStyle = "#eaf7f9"),
          (t.lineWidth = 2.2),
          t.beginPath(),
          t.moveTo(-9, -14),
          t.lineTo(9, -14),
          t.moveTo(-9, 14),
          t.lineTo(9, 14),
          t.stroke(),
          t.beginPath(),
          t.moveTo(-7, -13),
          t.quadraticCurveTo(-7, -3, 0, 0),
          t.quadraticCurveTo(-7, 3, -7, 13),
          t.moveTo(7, -13),
          t.quadraticCurveTo(7, -3, 0, 0),
          t.quadraticCurveTo(7, 3, 7, 13),
          t.stroke(),
          (t.fillStyle = I.amber));
        const s = o.waitOn ? (o.time * 0.8) % 1 : 0.5;
        (t.beginPath(),
          t.moveTo(-5 + 4 * s, -10 + 9 * s),
          t.lineTo(5 - 4 * s, -10 + 9 * s),
          t.lineTo(0, -1),
          t.closePath(),
          t.fill(),
          t.beginPath(),
          t.moveTo(-6, 12),
          t.lineTo(6, 12),
          t.lineTo(0, 12 - 8 * s),
          t.closePath(),
          t.fill());
        return;
      }
      case "gas":
        ((t.strokeStyle = I.teal),
          (t.lineWidth = 2),
          et(t, -17, -10, 34, 20, 5),
          t.stroke(),
          (t.fillStyle = I.teal),
          (t.font = `700 11px ${At}`),
          (t.textAlign = "center"),
          (t.textBaseline = "middle"),
          t.fillText("ГАЗ", -4, 0.5),
          t.beginPath(),
          t.moveTo(8, -2),
          t.lineTo(14, -2),
          t.lineTo(11, 2.5),
          t.closePath(),
          t.fill());
        return;
      default:
        return;
    }
  }
  drawCameraButton(t, n, o, s, i, a, r) {
    const l = pa(n),
      h = l >= 1;
    if (
      (this.button(t, "camera", a, i, s, !!o.cameraHeld && h, "КАМЕРА", mt.camera, o.keyboard, () =>
        this.drawIcon(t, "camera", r),
      ),
      this.vis.camera <= 0.01)
    )
      return;
    (t.save(), (t.globalAlpha = this.vis.camera));
    const c = i + 4.5 * s;
    ((t.lineWidth = 2.6 * s),
      (t.strokeStyle = "rgba(255,255,255,0.12)"),
      t.beginPath(),
      t.arc(a.x, a.y, c, 0, Math.PI * 2),
      t.stroke(),
      (t.strokeStyle = H.CAMERA_RING),
      (t.globalAlpha = this.vis.camera * (h ? 0.9 : 0.7)),
      t.beginPath(),
      t.arc(a.x, a.y, c, -Math.PI / 2, -Math.PI / 2 + l * Math.PI * 2),
      t.stroke());
    const d = el(n),
      u = a.x - i * 0.82,
      f = a.y - i * 0.82;
    ((t.globalAlpha = this.vis.camera),
      (t.fillStyle = "rgba(6,22,32,0.85)"),
      (t.strokeStyle = H.CAMERA_RING),
      (t.lineWidth = 1.3 * s),
      t.beginPath(),
      t.arc(u, f, 8.5 * s, 0, Math.PI * 2),
      t.fill(),
      t.stroke(),
      (t.fillStyle = d <= 2 ? I.amber : "#eaf7fa"),
      (t.font = `700 ${10 * s}px ${At}`),
      (t.textAlign = "center"),
      (t.textBaseline = "middle"),
      t.fillText(String(d), u, f + 0.5 * s),
      t.restore());
  }
  drawNote(t, n, o, s) {
    if (o.kind === "sign") return this.drawSignCard(t, n, o, s);
    const i = n.layout,
      a = Math.min(H.NOTE_W * s, i.cssW - 28 * s),
      r = (i.cssW - a) / 2,
      l = i.cssH * H.NOTE_TOP,
      h = 12 * s,
      c = H.NOTE_PX * s,
      d = c * 1.3;
    (t.save(), (t.font = `italic ${c}px Georgia, "Times New Roman", serif`));
    const u = [];
    o.text.forEach((y, _) => {
      const g = y.split(" ");
      let S = "",
        A = !0;
      for (const E of g) {
        const b = S ? `${S} ${E}` : E;
        S && t.measureText(b).width > a - h * 2
          ? (u.push({ t: S, gap: A && _ > 0 }), (A = !1), (S = E))
          : (S = b);
      }
      S && u.push({ t: S, gap: A && _ > 0 });
    });
    const f = 12 * s + 8 * s,
      p = h * 2 + f + u.length * d + u.filter((y) => y.gap).length * d * 0.4;
    ((t.fillStyle = "rgba(0,0,0,0.45)"),
      et(t, r + 3 * s, l + 4 * s, a, p, 6 * s),
      t.fill(),
      (t.fillStyle = H.NOTE_BG),
      et(t, r, l, a, p, 6 * s),
      t.fill(),
      (t.strokeStyle = "rgba(90,78,56,0.6)"),
      (t.lineWidth = 1.2 * s),
      t.stroke(),
      (t.fillStyle = "rgba(80,68,50,0.85)"),
      (t.font = `700 ${11 * s}px ${pt}`),
      (t.textAlign = "left"),
      (t.textBaseline = "top"),
      t.fillText(o.title.toUpperCase(), r + h, l + h),
      (t.fillStyle = H.NOTE_INK),
      (t.font = `italic ${c}px Georgia, "Times New Roman", serif`));
    let m = l + h + f;
    for (const y of u) (y.gap && (m += d * 0.4), t.fillText(y.t, r + h, m), (m += d));
    (t.restore(), this.zones.push({ id: "noteCard", kind: "rect", x: r, y: l, w: a, h: p }));
  }
  drawSignCard(t, n, o, s) {
    const i = n.layout,
      a = Math.min(H.SIGN_W * s, i.cssW - 24 * s),
      r = (i.cssW - a) / 2,
      l = i.cssH * H.NOTE_TOP,
      [h, ...c] = o.text,
      d = (h ?? "").split(/[.!]/)[0].trim(),
      u = [(h ?? "").slice(d.length).replace(/^[.!]\s*/, ""), ...c].filter(Boolean);
    t.save();
    const f = a * 0.052;
    t.font = `800 ${f}px ${pt}`;
    const p = u.flatMap((A) => this.wrap(t, A.toUpperCase(), a * 0.8)),
      m = a * 0.36 + p.length * f * 1.3 + a * 0.08;
    ((t.fillStyle = "rgba(0,0,0,0.5)"),
      et(t, r + 4 * s, l + 6 * s, a, m, 5 * s),
      t.fill(),
      (t.fillStyle = "#d6ac2f"),
      et(t, r, l, a, m, 5 * s),
      t.fill());
    for (let A = 0; A < 9; A++) {
      const E = r + a * (0.07 + A * 0.105 + ((A * 37) % 5) * 0.006),
        b = m * (0.15 + ((A * 53) % 7) * 0.05),
        T = t.createLinearGradient(0, l, 0, l + b);
      (T.addColorStop(0, "rgba(120,58,20,0.5)"),
        T.addColorStop(1, "rgba(120,58,20,0)"),
        (t.fillStyle = T),
        t.fillRect(E, l + a * 0.02, a * 0.018, b));
    }
    ((t.fillStyle = "rgba(70,60,40,0.35)"),
      t.fillRect(r, l + m * 0.88, a, m * 0.12),
      (t.strokeStyle = "#17140f"),
      (t.lineWidth = a * 0.03),
      et(t, r + a * 0.03, l + a * 0.03, a - a * 0.06, m - a * 0.06, 3 * s),
      t.stroke(),
      (t.fillStyle = "#5b5040"));
    for (const [A, E] of [
      [0.012, 0.012],
      [0.988, 0.012],
      [0.012, 0.988],
      [0.988, 0.988],
    ])
      (t.beginPath(),
        t.arc(
          r + a * A + (A < 0.5 ? 5 : -5) * s,
          l + m * E + (E < 0.5 ? 5 : -5) * s,
          2.6 * s,
          0,
          Math.PI * 2,
        ),
        t.fill());
    const y = a * 0.095;
    (ba(t, r + a * 0.155, l + a * 0.17, y),
      ba(t, r + a * 0.845, l + a * 0.17, y),
      (t.fillStyle = "#9b1d16"),
      (t.textAlign = "center"),
      (t.textBaseline = "middle"));
    let _ = a * 0.15;
    t.font = `900 ${_}px ${pt}`;
    const g = a * 0.4,
      S = t.measureText(d.toUpperCase()).width;
    (S > g && ((_ *= g / S), (t.font = `900 ${_}px ${pt}`)),
      t.fillText(d.toUpperCase(), r + a / 2, l + a * 0.18),
      (t.fillStyle = "#17140f"),
      t.fillRect(r + a * 0.1, l + a * 0.31, a * 0.8, a * 0.012),
      (t.font = `800 ${f}px ${pt}`),
      (t.textBaseline = "top"),
      p.forEach((A, E) => t.fillText(A, r + a / 2, l + a * 0.35 + E * f * 1.3)),
      t.restore(),
      this.zones.push({ id: "noteCard", kind: "rect", x: r, y: l, w: a, h: m }));
  }
  drawFailButtons(t, n, o, s, i, a) {
    (this.button(t, "valve", i(H.SLOT_VALVE), s, o, n.valveHeld, "ВЕНТИЛЬ", mt.valve, n.keyboard, () =>
      this.drawIcon(t, "valve", a),
    ),
      this.button(t, "torch", i(H.SLOT_TORCH), s, o, n.torchHeld, "ФОНАРЬ", mt.torch, n.keyboard, () =>
        this.drawIcon(t, "torch", a),
      ),
      this.button(
        t,
        "untangle",
        i(H.SLOT_UNTANGLE),
        s,
        o,
        n.untangleHeld,
        "РАСПУТАТЬ",
        mt.untangle,
        n.keyboard,
        () => this.drawIcon(t, "untangle", a),
      ));
  }
  drawTip(t, n, o, s, i) {
    const a = o.layout,
      r = a.cssW,
      l = a.cssH,
      h = Qt(s.t / vt.FADE_S),
      c = 1 - (1 - h) * (1 - h),
      d = s.def,
      u = d.ring ? (this.anchors.get(d.ring) ?? null) : null;
    t.save();
    const f = 7 * i;
    if (
      ((t.fillStyle = `rgba(2,8,12,${(vt.DIM_A * c).toFixed(3)})`),
      t.beginPath(),
      t.rect(0, 0, r, l),
      u && this.anchorPath(t, u, f, !0),
      t.fill("evenodd"),
      u)
    ) {
      const x = 0.5 + 0.5 * Math.sin(s.t * Math.PI * 2 * 1.1),
        G = f + (2 + 3 * x) * i;
      ((t.lineWidth = 5 * i),
        (t.strokeStyle = `rgba(0,0,0,${(0.45 * c).toFixed(3)})`),
        t.beginPath(),
        this.anchorPath(t, u, G, !1),
        t.stroke(),
        (t.lineWidth = 2.6 * i),
        (t.strokeStyle = d.urgent ? I.amber : I.teal),
        (t.globalAlpha = c * (0.7 + 0.3 * x)),
        t.beginPath(),
        this.anchorPath(t, u, G, !1),
        t.stroke(),
        (t.globalAlpha = 1));
    }
    const p = Math.min(H.TIP_W * i, r - 24 * i),
      m = 14 * i,
      y = H.TIP_ICON_R * i,
      _ = y * 2 + 10 * i,
      g = H.TIP_PX * i,
      S = g * 1.32,
      A = g * 0.95,
      E = A * 1.3,
      b = `500 ${g}px ${pt}`,
      T = `italic ${A}px Georgia, "Times New Roman", serif`;
    t.font = b;
    const k = d.lines.map((x) => ({
      icon: x.icon ?? null,
      lines: this.wrap(t, x.text, p - m * 2 - (x.icon ? _ : 0)),
    }));
    t.font = T;
    const w = d.joke ? this.wrap(t, d.joke, p - m * 2) : [],
      L = 11 * i + 22 * i;
    let R = 0;
    for (const x of k) R += Math.max(x.lines.length * S, x.icon ? y * 2 + 2 * i : 0) + 7 * i;
    const P = w.length ? 3 * i + w.length * E : 0,
      v = 18 * i,
      N = m + L + 6 * i + R + P + v + m * 0.6,
      O = this.panelRect(a, n);
    let C = O.y + O.h + 16 * i;
    if (u) {
      const x = u.kind === "circle" ? u.y - u.r : u.y,
        G = u.kind === "circle" ? u.y + u.r : u.y + u.h;
      G + f > C &&
        x - f < C + N &&
        ((C = G + f + 18 * i), C + N > l - 10 * i && (C = Math.max(8 * i, x - f - 18 * i - N)));
    }
    C += (1 - c) * 14 * i;
    const W = (r - p) / 2;
    ((t.globalAlpha = c),
      (t.fillStyle = "rgba(0,0,0,0.5)"),
      et(t, W + 3 * i, C + 5 * i, p, N, 9 * i),
      t.fill(),
      (t.fillStyle = H.TIP_BG),
      et(t, W, C, p, N, 9 * i),
      t.fill(),
      (t.strokeStyle = "rgba(20,40,50,0.55)"),
      (t.lineWidth = 1.2 * i),
      t.stroke(),
      (t.fillStyle = d.urgent ? I.amber : "#4fb3c8"),
      et(t, W + 10 * i, C + 5 * i, p - 20 * i, 3 * i, 1.5 * i),
      t.fill(),
      (t.textAlign = "left"),
      (t.textBaseline = "top"),
      (t.fillStyle = H.TIP_DIM),
      (t.font = `700 ${9 * i}px ${pt}`),
      t.fillText("ИНСТРУКТОР", W + m, C + m),
      (t.fillStyle = H.TIP_INK),
      (t.font = `700 ${16.5 * i}px ${pt}`),
      t.fillText(d.title, W + m, C + m + 12 * i));
    let V = C + m + L + 6 * i;
    const K = this.lastIcon ?? id;
    for (const x of k) {
      const G = Math.max(x.lines.length * S, x.icon ? y * 2 + 2 * i : 0);
      let J = W + m;
      if (x.icon) {
        const D = J + y,
          Z = V + Math.min(G / 2, y + 1 * i);
        ((t.fillStyle = "rgba(6,22,32,0.94)"),
          t.beginPath(),
          t.arc(D, Z, y, 0, Math.PI * 2),
          t.fill(),
          (t.strokeStyle = "rgba(180,238,247,0.9)"),
          (t.lineWidth = 1.3 * i),
          t.stroke(),
          t.save(),
          t.translate(D, Z));
        const rt = y / 25;
        (t.scale(rt, rt),
          (t.lineCap = "round"),
          (t.lineJoin = "round"),
          this.drawIcon(t, x.icon, x.icon === "tie" ? { ...K, tieKind: "off" } : K),
          t.restore(),
          o.keyboard && Aa[x.icon] && this.keyBadge(t, Aa[x.icon], D + y * 0.8, Z - y * 0.85, i),
          (J += _));
      }
      ((t.fillStyle = H.TIP_INK), (t.font = b), (t.textBaseline = "top"), (t.textAlign = "left"));
      const ot = V + (x.icon && x.lines.length * S < G ? (G - x.lines.length * S) / 2 : 0);
      (x.lines.forEach((D, Z) => t.fillText(D, J, ot + Z * S + g * 0.08)), (V += G + 7 * i));
    }
    w.length &&
      ((V += 3 * i),
      (t.fillStyle = H.TIP_JOKE),
      (t.font = T),
      w.forEach((x, G) => t.fillText(x, W + m, V + G * E)));
    const B = C + N - m * 0.6 - 10 * i,
      Y = Qt(s.t / vt.CLOSE_MIN_S);
    (s.closable
      ? ((t.fillStyle = H.TIP_DIM),
        (t.font = `600 ${10.5 * i}px ${pt}`),
        (t.textAlign = "right"),
        t.fillText(o.keyboard ? "Enter — дальше" : "коснись — дальше", W + p - m, B - 1 * i))
      : ((t.fillStyle = "rgba(20,40,50,0.15)"),
        t.fillRect(W + m, B + 4 * i, p - m * 2, 2 * i),
        (t.fillStyle = "rgba(20,40,50,0.45)"),
        t.fillRect(W + m, B + 4 * i, (p - m * 2) * Y, 2 * i)),
      t.restore());
  }
  anchorPath(t, n, o, s) {
    if (n.kind === "circle") {
      const c = n.r + o;
      (t.moveTo(n.x + c, n.y), t.arc(n.x, n.y, c, 0, Math.PI * 2, s));
      return;
    }
    const i = n.x - o,
      a = n.y - o,
      r = n.x + n.w + o,
      l = n.y + n.h + o,
      h = Math.min(n.q !== void 0 ? n.q + o : 8, (r - i) / 2, (l - a) / 2);
    (s
      ? (t.moveTo(i + h, a),
        t.arcTo(i, a, i, l, h),
        t.arcTo(i, l, r, l, h),
        t.arcTo(r, l, r, a, h),
        t.arcTo(r, a, i, a, h))
      : (t.moveTo(i + h, a),
        t.arcTo(r, a, r, l, h),
        t.arcTo(r, l, i, l, h),
        t.arcTo(i, l, i, a, h),
        t.arcTo(i, a, r, a, h)),
      t.closePath());
  }
  wrap(t, n, o) {
    const s = [];
    let i = "";
    for (const a of Ws(n).split(" ")) {
      const r = i ? `${i} ${a}` : a;
      i && t.measureText(r).width > o ? (s.push(i), (i = a)) : (i = r);
    }
    return (i && s.push(i), s);
  }
  button(t, n, o, s, i, a, r, l, h, c) {
    const d = this.vis[n];
    if (d <= 0.01) return;
    const f = 0.8 + 0.2 * (1 - (1 - d) * (1 - d)),
      p = s * f;
    (t.save(),
      (t.globalAlpha = d),
      t.beginPath(),
      t.arc(o.x, o.y, p, 0, Math.PI * 2),
      (t.fillStyle = a ? "rgba(28,80,96,0.66)" : `rgba(6,22,32,${H.BTN_BG_A})`),
      t.fill(),
      (t.lineWidth = (a ? 2.4 : 1.5) * i),
      (t.strokeStyle = a ? I.teal : "rgba(180,238,247,0.8)"),
      t.stroke());
    const m = this.pulse[n] / H.BTN_PULSE_S;
    (m < 1 &&
      (t.save(),
      (t.globalCompositeOperation = "lighter"),
      (t.globalAlpha = d * Math.pow(1 - m, 1.5)),
      (t.strokeStyle = I.teal),
      (t.lineWidth = 2.6 * i),
      t.beginPath(),
      t.arc(o.x, o.y, p * (1 + 0.4 * m), 0, Math.PI * 2),
      t.stroke(),
      t.restore()),
      t.save(),
      t.translate(o.x, o.y));
    const y = p / 25;
    (t.scale(y, y),
      (t.lineCap = "round"),
      (t.lineJoin = "round"),
      c(),
      t.restore(),
      (t.font = `700 ${H.BTN_CAPTION_PX * i}px ${pt}`),
      (t.textAlign = "center"),
      (t.textBaseline = "top"));
    const _ = o.y + p + 4 * i;
    ((t.lineJoin = "round"),
      (t.lineWidth = 3 * i),
      (t.strokeStyle = "rgba(2,10,16,0.65)"),
      t.strokeText(r, o.x, _),
      (t.fillStyle = "rgba(234,247,250,0.95)"),
      t.fillText(r, o.x, _));
    const g = t.measureText(r).width,
      S = Math.max(2 * p, g + 6 * i);
    (this.anchors.set(n, {
      kind: "rect",
      x: o.x - S / 2,
      y: o.y - p,
      w: S,
      h: 2 * p + 4 * i + H.BTN_CAPTION_PX * i * 1.15,
      q: S / 2,
    }),
      h && this.keyBadge(t, l, o.x + p * 0.78, o.y - p * 0.82, i),
      t.restore(),
      this.want[n] && this.zones.push({ id: n, kind: "circle", x: o.x, y: o.y, r: s }));
  }
  iconTieOff(t) {
    ((t.fillStyle = I.rock),
      t.beginPath(),
      t.arc(0, 10, 9, Math.PI, 0),
      t.closePath(),
      t.fill(),
      (t.fillStyle = I.rockLight),
      t.fillRect(-3, 2, 6, 8),
      (t.strokeStyle = I.ownLine),
      (t.lineWidth = 2.4),
      t.beginPath(),
      t.moveTo(-19, -7),
      t.lineTo(-5, -1),
      t.arc(0, 3, 5.5, Math.PI * 1.15, Math.PI * 2.05, !1),
      t.lineTo(19, -9),
      t.stroke(),
      (t.fillStyle = I.ownKnot),
      t.beginPath(),
      t.arc(5, 1, 2.4, 0, Math.PI * 2),
      t.fill());
  }
  iconReelEnd(t) {
    ((t.fillStyle = I.rock),
      t.beginPath(),
      t.arc(12, 13, 8, Math.PI, 0),
      t.closePath(),
      t.fill(),
      (t.strokeStyle = I.ownLine),
      (t.lineWidth = 2.4),
      t.beginPath(),
      t.moveTo(-19, -12),
      t.lineTo(12, 5),
      t.stroke(),
      (t.fillStyle = I.ownKnot),
      t.beginPath(),
      t.arc(12, 5, 2.8, 0, Math.PI * 2),
      t.fill(),
      (t.strokeStyle = "rgba(234,247,249,0.9)"),
      (t.lineWidth = 1.6),
      t.beginPath(),
      t.arc(-6, 8, 8, 0, Math.PI * 2),
      t.stroke(),
      t.beginPath());
    for (let n = 0; n < 3; n++) {
      const o = (n * Math.PI * 2) / 3 + 0.4;
      (t.moveTo(-6, 8), t.lineTo(-6 + Math.cos(o) * 7, 8 + Math.sin(o) * 7));
    }
    (t.stroke(),
      (t.strokeStyle = I.amber),
      (t.lineWidth = 1.8),
      t.beginPath(),
      t.arc(-6, -6, 3.5, Math.PI * 0.2, Math.PI * 1.75),
      t.stroke());
  }
  iconTieIn(t) {
    ((t.strokeStyle = I.guideLine),
      (t.lineWidth = 2.2),
      t.beginPath(),
      t.moveTo(-19, -8),
      t.lineTo(19, -8),
      t.stroke(),
      (t.strokeStyle = I.ownLine),
      (t.lineWidth = 2.4),
      t.beginPath(),
      t.moveTo(-4, 4),
      t.lineTo(5, -8),
      t.stroke(),
      (t.fillStyle = "#2a3138"),
      (t.strokeStyle = "rgba(234,247,249,0.85)"),
      (t.lineWidth = 1.4),
      t.beginPath(),
      t.arc(-7, 9, 7.5, 0, Math.PI * 2),
      t.fill(),
      t.stroke(),
      (t.fillStyle = I.ownLine),
      t.beginPath(),
      t.arc(-7, 9, 4, 0, Math.PI * 2),
      t.fill(),
      (t.fillStyle = I.ownKnot),
      t.beginPath(),
      t.arc(5, -8, 2.8, 0, Math.PI * 2),
      t.fill());
  }
  drawRuler(t, n, o, s, i) {
    const a = s.layout,
      r = this.panelRect(a, n),
      l = (d) => (d - s.oy) * s.ppm,
      h = r.y + r.h + 8 * i,
      c = a.cssH - 8 * i;
    (this.anchors.set("ruler", {
      kind: "rect",
      x: 0,
      y: h + (c - h) * 0.08,
      w: H.RULER_W * i,
      h: (c - h) * 0.22,
    }),
      t.save(),
      t.beginPath(),
      t.rect(0, h, H.RULER_W * i + 30 * i, c - h),
      t.clip(),
      (t.textAlign = "left"),
      (t.textBaseline = "middle"),
      (t.font = `600 ${9 * i}px ${At}`));
    for (let d = 3; d <= 66; d += 3) {
      const u = l(d);
      u < h - 10 ||
        u > c + 10 ||
        ((t.fillStyle = "rgba(255,255,255,0.4)"),
        t.fillRect(0, Math.round(u), (d % 6 === 0 ? 7 : 5) * i, Math.max(1, i * 0.8)),
        (t.fillStyle = "rgba(220,235,240,0.6)"),
        t.fillText(String(d), 9 * i, u));
    }
    if (this.has("narcLine")) {
      const d = ln(n.tanks[0].mix),
        u = (ce.END_ONSET_M + 10) / Math.max(0.05, 1 - d.fHe) - 10,
        f = l(u);
      ((t.strokeStyle = "rgba(190,120,230,0.9)"),
        (t.lineWidth = 1.6 * i),
        t.setLineDash([3 * i, 2 * i]),
        t.beginPath(),
        t.moveTo(0, Math.round(f)),
        t.lineTo(22 * i, Math.round(f)),
        t.stroke(),
        t.setLineDash([]),
        (t.fillStyle = "rgba(205,150,240,0.95)"),
        (t.font = `700 ${8 * i}px ${pt}`),
        t.fillText(this.jargon ? "END" : "азот", 26 * i, f),
        (t.font = `600 ${9 * i}px ${At}`));
    }
    if (this.has("ppo2")) {
      const d = [...new Set(n.tanks.map((u) => u.mix))];
      for (const u of d) {
        const f = l(Math.floor(ye(Bt[u])));
        ((t.fillStyle = Wn[u]),
          t.fillRect(0, Math.round(f), 14 * i, 2 * i),
          (t.font = `700 ${9 * i}px ${At}`),
          t.fillText(Bt[u].tag, 16 * i, f),
          (t.font = `600 ${9 * i}px ${At}`));
      }
    }
    if (o.stop > 0 && this.has("deco")) {
      const d = l(o.stop - ut.BAND_ABOVE_M),
        u = l(o.stop + ut.BAND_BELOW_M);
      ((t.fillStyle = "rgba(255,194,74,0.18)"),
        t.fillRect(0, d, 22 * i, u - d),
        (t.strokeStyle = I.amber),
        (t.lineWidth = 2 * i),
        t.beginPath(),
        t.moveTo(22 * i, d),
        t.lineTo(3 * i, d),
        t.lineTo(3 * i, u),
        t.lineTo(22 * i, u),
        t.stroke());
    }
    if (o.ceiling > 0 && this.has("deco")) {
      const d = l(o.ceiling);
      ((t.strokeStyle = I.red), (t.lineWidth = 1.5 * i), t.beginPath());
      for (let u = 0, f = 0; u <= 28 * i; u += 4 * i, f++) {
        const p = d + (f % 2 ? -3 * i : 0);
        f === 0 ? t.moveTo(u, p) : t.lineTo(u, p);
      }
      t.stroke();
    }
    (t.restore(), (t.textBaseline = "alphabetic"));
  }
  drawStopWindow(t, n, o, s, i) {
    if (n.phase !== "dive" || o.stop <= 0 || n.dying) return;
    const a = s.layout,
      r = this.panelRect(a, n),
      l = (_) => (_ - s.oy) * s.ppm,
      h = l(o.stop - ut.BAND_ABOVE_M),
      c = l(o.stop + ut.BAND_BELOW_M),
      d = s.diverX - H.STOP_WIN_DX_M * s.ppm,
      u = H.STOP_WIN_W * i,
      f = o.inBand,
      p = f ? I.teal : I.amber,
      m = r.y + r.h + 10 * i,
      y = a.cssH - 10 * i;
    if ((t.save(), c < m || h > y)) {
      const _ = c < m,
        g = _ ? m + 8 * i : y - 8 * i;
      ((t.fillStyle = p),
        (t.globalAlpha = 0.85),
        t.beginPath(),
        t.moveTo(d - 6 * i, g + (_ ? 4 : -4) * i),
        t.lineTo(d, g + (_ ? -4 : 4) * i),
        t.lineTo(d + 6 * i, g + (_ ? 4 : -4) * i),
        t.closePath(),
        t.fill(),
        t.restore());
      return;
    }
    if (
      ((t.fillStyle = f ? "rgba(143,224,240,0.16)" : "rgba(255,194,74,0.16)"),
      t.fillRect(d - u, h, u, c - h),
      (t.strokeStyle = p),
      (t.lineWidth = 2 * i),
      t.beginPath(),
      t.moveTo(d, h),
      t.lineTo(d - u, h),
      t.lineTo(d - u, c),
      t.lineTo(d, c),
      t.stroke(),
      o.ceiling > 0)
    ) {
      const _ = l(o.ceiling);
      ((t.strokeStyle = I.red), (t.lineWidth = 1.4 * i), t.beginPath());
      for (let g = 0; g <= 4; g++) {
        const S = d - u - 2 * i + g * 3 * i,
          A = _ + (g % 2 ? -2.5 * i : 0);
        g === 0 ? t.moveTo(S, A) : t.lineTo(S, A);
      }
      t.stroke();
    }
    (t.restore(),
      this.anchors.set(
        "deco",
        this.anchors.get("deco") ?? { kind: "rect", x: d - u, y: h, w: u, h: c - h },
      ));
  }
  drawLine(t, n, o, s) {
    const i = this.anchors.get(o.at);
    if (!i) return;
    const a = n.layout,
      r = a.cssW,
      l = a.cssH,
      h = Math.max(0, Math.min(1, o.t / H.LINE_FADE_S, (o.dur - o.t) / H.LINE_FADE_S));
    if (h <= 0) return;
    const c = H.LINE_PX * s,
      d = c * 1.28,
      u = 9 * s,
      f = Math.min(H.LINE_W * s, r - 20 * s);
    (t.save(), (t.font = `500 ${c}px ${pt}`));
    const p = this.wrap(t, o.text, f - u * 2),
      m = u * 2 + p.length * d,
      y = i.kind === "circle" ? i.x : i.x + i.w / 2,
      _ = i.kind === "circle" ? i.y : i.y + i.h / 2,
      g = i.kind === "circle" ? i.y - i.r : i.y,
      S = i.kind === "circle" ? i.y + i.r : i.y + i.h,
      A = i.kind === "circle" ? i.x - i.r : i.x,
      E = i.kind === "circle" ? i.x + i.r : i.x + i.w;
    let b, T, k;
    const w = (P) => Math.max(8 * s, Math.min(r - 8 * s - f, P)),
      L = (P) => Math.max(8 * s, Math.min(l - 8 * s - m, P));
    (o.at === "ruler"
      ? ((b = E + 12 * s), (T = L(_ - m / 2)), (k = { x: E + 2 * s, y: T + m / 2, side: "left" }))
      : S < l * 0.3
        ? ((b = w(y - f / 2)),
          (T = S + 12 * s),
          (k = { x: Math.max(b + 12 * s, Math.min(b + f - 12 * s, y)), y: S + 3 * s, side: "up" }))
        : y > r * 0.55
          ? ((b = w(A - 12 * s - f)),
            (T = L(_ - m / 2)),
            (k = { x: A - 3 * s, y: Math.max(T + 10 * s, Math.min(T + m - 10 * s, _)), side: "right" }))
          : ((b = w(y - f / 2)),
            (T = L(g - 12 * s - m)),
            (k = { x: Math.max(b + 12 * s, Math.min(b + f - 12 * s, y)), y: g - 3 * s, side: "down" })),
      (t.globalAlpha = h),
      (t.fillStyle = "rgba(0,0,0,0.45)"),
      et(t, b + 2 * s, T + 3 * s, f, m, 8 * s),
      t.fill(),
      (t.fillStyle = H.TIP_BG),
      et(t, b, T, f, m, 8 * s),
      t.fill(),
      t.beginPath());
    const R = 7 * s;
    (k.side === "up"
      ? (t.moveTo(k.x - R, T + 1), t.lineTo(k.x, k.y), t.lineTo(k.x + R, T + 1))
      : k.side === "down"
        ? (t.moveTo(k.x - R, T + m - 1), t.lineTo(k.x, k.y), t.lineTo(k.x + R, T + m - 1))
        : k.side === "right"
          ? (t.moveTo(b + f - 1, k.y - R), t.lineTo(k.x, k.y), t.lineTo(b + f - 1, k.y + R))
          : (t.moveTo(b + 1, k.y - R), t.lineTo(k.x, k.y), t.lineTo(b + 1, k.y + R)),
      t.closePath(),
      t.fill(),
      (t.fillStyle = "#4fb3c8"),
      et(t, b + 6 * s, T + 3 * s, 3 * s, m - 6 * s, 1.5 * s),
      t.fill(),
      (t.fillStyle = H.TIP_INK),
      (t.textAlign = "left"),
      (t.textBaseline = "top"),
      p.forEach((P, v) => t.fillText(P, b + u + 4 * s, T + u + v * d)),
      t.restore());
  }
  drawAscent(t, n, o, s, i) {
    if (n.phase !== "dive" || n.ascRate < tn.SHOW_MIN_MPS) return;
    const a = n.ascRate / tn.LIMIT_MPS,
      r = Math.min(5, Math.ceil(a * 4 - 0.05)),
      l = n.alarms.ascent,
      h = o.diverX - n.diver.face * 0.2 * o.ppm,
      c = o.diverY - Math.max(22 * s, 0.6 * o.ppm);
    (this.anchors.set("ascent", { kind: "rect", x: h - 8 * s, y: c - 36 * s, w: 16 * s, h: 41 * s }),
      l &&
        ((t.strokeStyle = I.red),
        (t.lineWidth = 1.5 * s),
        et(t, h - 8 * s, c - 36 * s, 16 * s, 41 * s, 6 * s),
        t.stroke(),
        i && ((t.fillStyle = "rgba(200,40,50,0.35)"), t.fill())));
    for (let d = 0; d < 5; d++) {
      const u = d < r,
        f = c - d * 7 * s;
      let p;
      (u
        ? l
          ? (p = i ? I.red : "rgba(255,255,255,0.85)")
          : (p = d >= 4 ? I.red : d === 3 ? I.amber : I.teal)
        : (p = "rgba(255,255,255,0.14)"),
        (t.fillStyle = p),
        t.beginPath(),
        t.moveTo(h - 5 * s, f),
        t.lineTo(h, f - 4.5 * s),
        t.lineTo(h + 5 * s, f),
        t.lineTo(h + 5 * s, f + 1.5 * s),
        t.lineTo(h, f - 3 * s),
        t.lineTo(h - 5 * s, f + 1.5 * s),
        t.closePath(),
        t.fill());
    }
    l && this.bang(t, h + 16 * s, c - 28 * s, s);
  }
  drawStage(t, n, o, s) {
    const i = this.panelRect(o.layout, n);
    (t.save(),
      (t.font = `600 ${H.STAGE_PX * s}px ${At}`),
      (t.textAlign = "right"),
      (t.textBaseline = "top"),
      (t.fillStyle = `rgba(220,235,240,${H.STAGE_A})`),
      t.fillText(ho.STAGE, i.x + i.w - 4 * s, i.y + i.h + 4 * s),
      t.restore());
  }
  drawJoystick(t, n) {
    if (!n.active) return;
    const o = jt.JOY_RADIUS_PX;
    ((t.fillStyle = "rgba(255,255,255,0.07)"),
      (t.strokeStyle = "rgba(255,255,255,0.28)"),
      (t.lineWidth = 2),
      t.beginPath(),
      t.arc(n.ox, n.oy, o, 0, Math.PI * 2),
      t.fill(),
      t.stroke(),
      (t.strokeStyle = "rgba(255,255,255,0.12)"),
      (t.lineWidth = 1),
      t.beginPath(),
      t.arc(n.ox, n.oy, o * jt.LOOK_ZONE, 0, Math.PI * 2),
      t.stroke(),
      (t.fillStyle = "rgba(255,255,255,0.33)"),
      t.beginPath(),
      t.arc(n.ox + n.jx * o, n.oy + n.jy * o, jt.KNOB_R_PX, 0, Math.PI * 2),
      t.fill());
  }
  drawVignette(t, n, o) {
    if (o <= 0) return;
    const s = n.cssW / 2,
      i = n.cssH / 2,
      a = Math.hypot(s, i),
      r = t.createRadialGradient(s, i, a * (0.6 - 0.25 * o), s, i, a);
    (r.addColorStop(0, "rgba(150,60,170,0)"),
      r.addColorStop(1, `rgba(150,60,170,${(j.NARC_VIGNETTE_A * o).toFixed(3)})`),
      t.save(),
      (t.globalCompositeOperation = "screen"),
      (t.fillStyle = r),
      t.fillRect(0, 0, n.cssW, n.cssH),
      t.restore());
  }
  drawOx(t, n, o) {
    const s = fl(n);
    if (s <= 0) return;
    const i = o.layout,
      a = 1 + 0.07 * Math.sin(o.time * Math.PI * 2 * j.OX_PULSE_HZ),
      r = o.ppm * (j.OX_TUNNEL_FROM_M + (j.OX_TUNNEL_TO_M - j.OX_TUNNEL_FROM_M) * s) * a,
      l = r + o.ppm * j.OX_TUNNEL_SOFT_M,
      h = t.createRadialGradient(o.diverX, o.diverY, r, o.diverX, o.diverY, l),
      c = j.OX_TUNNEL_A * (0.7 + 0.3 * s),
      d = n.ox.phase === "convulse";
    (h.addColorStop(0, d ? "rgba(60,0,8,0)" : "rgba(0,0,0,0)"),
      h.addColorStop(1, d ? `rgba(40,0,6,${c.toFixed(3)})` : `rgba(0,0,0,${c.toFixed(3)})`),
      (t.fillStyle = h),
      t.fillRect(0, 0, i.cssW, i.cssH));
  }
}
