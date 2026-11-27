class j0 {
  constructor() {
    M(this, "open", !1);
    M(this, "linger", null);
  }
  toggle(t = !this.open) {
    ((this.open = t), (this.linger = null));
  }
  close() {
    ((this.open = !1), (this.linger = null));
  }
  keyPressed() {
    this.open || ((this.open = !0), (this.linger = fi.LINGER_S));
  }
  acted() {
    this.open && (this.linger = fi.LINGER_S);
  }
  frame(t, n, o) {
    if (!(!this.open || this.linger === null)) {
      if (n || (o && fi.LINGER_ALARM)) {
        this.linger = fi.LINGER_S;
        return;
      }
      ((this.linger -= t), this.linger <= 0 && this.close());
    }
  }
}
const q0 = (e) => (e <= 0 ? 0 : e >= 1 ? 1 : e * e * (3 - 2 * e));
function z0(e, t) {
  const n = Math.hypot(e, t);
  if (n <= jt.DEAD_ZONE) return { x: 0, y: 0, lx: 0, ly: 0 };
  const o = e / n,
    s = t / n,
    i = q0((n - jt.DEAD_ZONE) / jt.LOOK_RAMP),
    a = n <= jt.LOOK_ZONE ? 0 : Math.pow((Math.min(1, n) - jt.LOOK_ZONE) / (1 - jt.LOOK_ZONE), jt.CURVE);
  return { x: o * a, y: s * a, lx: o * i, ly: s * i };
}
const Y0 = {
  auto: ct.auto,
  dash: ct.dash,
  tie: ct.tie,
  arrow: ct.arrow,
  valve: ct.valve,
  torch: ct.torch,
  untangle: ct.untangle,
  pickup: ct.pickup,
  camera: ct.camera,
  wait: ct.wait,
};
const qe = (e, t) => t.some((n) => e.has(n));
function Ta(e, t, n) {
  return e.kind === "circle"
    ? Math.hypot(t - e.x, n - e.y) <= e.r * jt.ZONE_PAD
    : t >= e.x && t <= e.x + e.w && n >= e.y && n <= e.y + e.h;
}
class Z0 {
  constructor(t) {
    M(this, "el");
    M(this, "joy", { active: !1, ox: 0, oy: 0, jx: 0, jy: 0 });
    M(this, "joyId", null);
    M(this, "keys", new Set());
    M(this, "gasCodes", []);
    M(this, "buttonPointers", new Map());
    M(this, "zones", []);
    M(this, "stale", new Set());
    M(this, "enabled", !1);
    M(this, "modal", null);
    M(this, "lastKeyboard", !1);
    M(this, "onMute", null);
    M(this, "onPress", null);
    M(this, "onKey", null);
    M(this, "onGasKey", null);
    M(this, "down", (t) => {
      if (this.modal) {
        t.preventDefault();
        const i = this.modal;
        if ((i(), this.modal !== null || !this.enabled || this.joyId !== null)) return;
        const [a, r] = this.local(t);
        if (this.zones.some((l) => Ta(l, a, r))) return;
        try {
          this.el.setPointerCapture(t.pointerId);
        } catch {}
        ((this.joyId = t.pointerId),
          Object.assign(this.joy, { active: !0, ox: a, oy: r, jx: 0, jy: 0 }));
        return;
      }
      if (!this.enabled) return;
      (t.preventDefault(), (this.lastKeyboard = !1));
      const [n, o] = this.local(t),
        s = this.zones.find((i) => Ta(i, n, o));
      try {
        this.el.setPointerCapture(t.pointerId);
      } catch {}
      if (s) {
        (this.buttonPointers.delete(t.pointerId),
          this.buttonPointers.set(t.pointerId, s.id),
          this.onPress?.(s.id));
        return;
      }
      this.joyId === null &&
        ((this.joyId = t.pointerId),
        Object.assign(this.joy, { active: !0, ox: n, oy: o, jx: 0, jy: 0 }));
    });
    M(this, "move", (t) => {
      if (t.pointerId !== this.joyId) return;
      t.preventDefault();
      const [n, o] = this.local(t),
        s = jt.JOY_RADIUS_PX;
      let i = n - this.joy.ox,
        a = o - this.joy.oy;
      const r = Math.hypot(i, a);
      (r > s && ((i = (i / r) * s), (a = (a / r) * s)), (this.joy.jx = i / s), (this.joy.jy = a / s));
    });
    M(this, "up", (t) => {
      (this.buttonPointers.delete(t.pointerId),
        t.pointerId === this.joyId &&
          ((this.joyId = null), (this.joy.active = !1), (this.joy.jx = this.joy.jy = 0)));
    });
    M(this, "keydown", (t) => {
      const n = t.key.toLowerCase();
      if (this.modal) {
        ((n.startsWith("arrow") || n === " ") && t.preventDefault(),
          !t.repeat && ct.mute.includes(n) && this.onMute?.(),
          !t.repeat && ct.tipClose.includes(n) && this.modal(),
          this.stale.add(n));
        return;
      }
      if (t.repeat && this.stale.has(n)) return;
      (this.stale.delete(n),
        this.enabled && (n.startsWith("arrow") || n === " ") && t.preventDefault(),
        this.enabled && (this.lastKeyboard = !0));
      const o = V0(t.code, t.shiftKey);
      (t.repeat ||
        (ct.mute.includes(n) && this.onMute?.(),
        this.enabled && ct.gas.includes(n) && this.onKey?.("gas"),
        this.enabled && ct.close.includes(n) && this.onKey?.("close"),
        this.enabled && ct.read.includes(n) && this.onKey?.("read"),
        this.enabled && o && this.onGasKey?.(o)),
        o &&
          !this.gasCodes.some((s) => s.code === t.code) &&
          this.gasCodes.push({ code: t.code, row: o }),
        this.keys.add(n));
    });
    M(this, "keyup", (t) => {
      const n = t.key.toLowerCase();
      (this.enabled && n === " " && t.preventDefault(), this.keys.delete(n), this.stale.delete(n));
      const o = this.gasCodes.findIndex((s) => s.code === t.code);
      o >= 0 && this.gasCodes.splice(o, 1);
    });
    ((this.el = t),
      t.addEventListener("pointerdown", this.down),
      t.addEventListener("pointermove", this.move),
      t.addEventListener("pointerup", this.up),
      t.addEventListener("pointercancel", this.up),
      t.addEventListener("lostpointercapture", this.up),
      window.addEventListener("keydown", this.keydown),
      window.addEventListener("keyup", this.keyup),
      window.addEventListener("blur", () => this.reset()));
  }
  setZones(t) {
    this.zones = t;
  }
  reset() {
    for (const t of this.keys) this.stale.add(t);
    ((this.joy.active = !1),
      (this.joy.jx = this.joy.jy = 0),
      (this.joyId = null),
      this.keys.clear(),
      (this.gasCodes.length = 0),
      this.buttonPointers.clear());
  }
  resetHolds() {
    const t = new Set([...ct.left, ...ct.right, ...ct.up, ...ct.down, ...ct.slow, ...ct.look]);
    for (const n of [...this.keys]) t.has(n) || (this.stale.add(n), this.keys.delete(n));
    ((this.gasCodes.length = 0), this.buttonPointers.clear());
  }
  local(t) {
    const n = this.el.getBoundingClientRect();
    return [t.clientX - n.left, t.clientY - n.top];
  }
  isHeld(t) {
    if (!this.enabled) return !1;
    for (const o of this.buttonPointers.values()) if (o === t) return !0;
    const n = Y0[t];
    return !!n && qe(this.keys, n);
  }
  heldRows() {
    if (!this.enabled) return [];
    const t = [];
    for (const n of this.buttonPointers.values()) n.startsWith("row:") && t.push(n.slice(4));
    return t;
  }
  heldGasKeys() {
    if (!this.enabled) return [];
    const t = [];
    for (const n of this.gasCodes) t.includes(n.row) || t.push(n.row);
    return t;
  }
  dropRows() {
    for (const [t, n] of [...this.buttonPointers]) n.startsWith("row:") && this.buttonPointers.delete(t);
  }
  readStick() {
    if (!this.enabled) return { x: 0, y: 0, lx: 0, ly: 0 };
    if (this.joy.active) return z0(this.joy.jx, this.joy.jy);
    let t = 0,
      n = 0;
    (qe(this.keys, ct.left) && (t -= 1),
      qe(this.keys, ct.right) && (t += 1),
      qe(this.keys, ct.up) && (n -= 1),
      qe(this.keys, ct.down) && (n += 1));
    const o = Math.hypot(t, n);
    if ((o > 0 && ((t /= o), (n /= o)), qe(this.keys, ct.look))) return { x: 0, y: 0, lx: t, ly: n };
    const s = t,
      i = n;
    return (
      qe(this.keys, ct.slow) && ((t *= jt.KEY_SLOW), (n *= jt.KEY_SLOW)),
      { x: t, y: n, lx: s, ly: i }
    );
  }
}
function ze(e) {
  try {
    const t = navigator;
    if (typeof t.vibrate != "function" || (t.userActivation && !t.userActivation.hasBeenActive)) return;
    t.vibrate(typeof e == "number" ? e : [...e]);
  } catch {}
}
function J0(e, t, n) {
  if (!t || n <= 0.02 || e.phase !== "dive" || e.dying) return null;
  const o = X.RUB,
    s = e.diver,
    i = Math.abs(s.vx * t.ex + s.vy * t.ey);
  if (i < o.MIN_MPS) return null;
  const a = Math.max(0, Math.min(1, (i - o.MIN_MPS) / (o.FULL_MPS - o.MIN_MPS))),
    [r, l] = o.GRAIN_HZ;
  return {
    vol: o.VOL * n * (0.35 + 0.65 * a),
    grainHz: r + (l - r) * a,
    grainS: o.GRAIN_S * (1 - 0.5 * a),
    band: o.BAND_HZ * (1 + o.BAND_UP * -t.ey),
    q: o.BAND_Q,
    pan: Math.max(-1, Math.min(1, t.ex * o.PAN)),
    vibrate: n >= 0.999,
    speed: i,
  };
}
const Q0 = {
  ppo2High: X.PPO2,
  ppo2Low: X.PPO2,
  ceiling: X.CEILING,
  ascent: X.ASCENT,
  gasOut: X.GAS_OUT,
};
class td {
  constructor() {
    M(this, "ctx", null);
    M(this, "master", null);
    M(this, "noise", null);
    M(this, "voices", null);
    M(this, "alarmT", new Map());
    M(this, "breathT", 0.6);
    M(this, "rubT", 0);
    M(this, "rubBuzzT", 0);
    M(this, "muted", !1);
    M(this, "duck", 1);
    M(this, "onBreath", null);
    M(this, "dyingT", -1);
    M(this, "gaspAt", 0);
    M(this, "heartAt", 0);
    M(this, "dipOn", !1);
  }
  init() {
    if (this.ctx) {
      this.ctx.resume();
      return;
    }
    try {
      const t = window.AudioContext ?? window.webkitAudioContext;
      if (!t) return;
      ((this.ctx = new t()),
        (this.master = this.ctx.createGain()),
        (this.master.gain.value = this.muted ? 0 : X.MASTER * this.duck),
        this.master.connect(this.ctx.destination));
      const n = this.ctx.sampleRate;
      this.noise = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const o = this.noise.getChannelData(0);
      for (let s = 0; s < n; s++) o[s] = Math.random() * 2 - 1;
      this.voices = this.makeVoices(this.ctx, this.master, this.noise);
    } catch {
      this.ctx = null;
    }
  }
  makeVoices(t, n, o) {
    const s = t.createGain();
    s.gain.value = 0;
    const i = t.createGain();
    i.gain.value = 0.7;
    const a = t.createOscillator();
    a.frequency.value = X.RING.tremoloHz;
    const r = t.createGain();
    ((r.gain.value = 0.3), a.connect(r).connect(i.gain));
    for (const L of X.RING.freqs) {
      const R = t.createOscillator();
      ((R.type = "sine"), (R.frequency.value = L), R.connect(i), R.start());
    }
    (i.connect(s).connect(n), a.start());
    const l = X.AMBIENT,
      h = t.createGain();
    ((h.gain.value = l.VOL), h.connect(n));
    const c = t.createBufferSource();
    ((c.buffer = o), (c.loop = !0));
    const d = t.createBiquadFilter();
    ((d.type = "lowpass"), (d.frequency.value = l.CUTOFF_SURF_HZ), (d.Q.value = 0.4));
    const u = t.createGain();
    ((u.gain.value = 0), c.connect(d).connect(u).connect(h), c.start());
    const f = t.createGain();
    ((f.gain.value = 0), f.connect(h));
    for (const L of l.DRONE_HZ) {
      const R = t.createOscillator();
      ((R.type = "sine"), (R.frequency.value = L));
      const P = t.createGain();
      ((P.gain.value = 0.5), R.connect(P).connect(f), R.start());
    }
    const p = t.createGain();
    p.gain.value = 0;
    const m = t.createOscillator();
    ((m.type = "sine"), (m.frequency.value = l.SHIMMER_HZ));
    const y = t.createGain();
    y.gain.value = 0.5;
    const _ = t.createOscillator();
    _.frequency.value = 0.37;
    const g = t.createGain();
    ((g.gain.value = 0.5),
      _.connect(g).connect(y.gain),
      m.connect(y).connect(p).connect(h),
      m.start(),
      _.start());
    const S = X.HISS,
      A = t.createBufferSource();
    ((A.buffer = o), (A.loop = !0));
    const E = t.createBiquadFilter();
    ((E.type = "bandpass"), (E.frequency.value = S.FREQ_HZ), (E.Q.value = 0.9));
    const b = t.createGain();
    ((b.gain.value = 0), A.connect(E).connect(b).connect(n), A.start(0, 0.3));
    const T = t.createBufferSource();
    ((T.buffer = o), (T.loop = !0));
    const k = t.createBiquadFilter();
    ((k.type = "lowpass"), (k.frequency.value = S.RUMBLE_HZ));
    const w = t.createGain();
    return (
      (w.gain.value = 0),
      T.connect(k).connect(w).connect(n),
      T.start(0, 0.6),
      {
        ring: s,
        ringLfo: a,
        amb: h,
        ambFilter: d,
        ambNoise: u,
        drone: f,
        shimmer: p,
        hiss: b,
        rumble: w,
      }
    );
  }
  setMuted(t) {
    ((this.muted = t),
      this.master &&
        this.ctx &&
        this.master.gain.setTargetAtTime(t ? 0 : X.MASTER * this.duck, this.ctx.currentTime, 0.02));
  }
  setDuck(t) {
    Math.abs(t - this.duck) < 0.004 ||
      ((this.duck = t),
      this.master &&
        this.ctx &&
        !this.muted &&
        this.master.gain.setTargetAtTime(X.MASTER * t, this.ctx.currentTime, 0.05));
  }
  panned(t) {
    if (!this.ctx || !this.master) return null;
    if (t === 0 || typeof this.ctx.createStereoPanner != "function") return this.master;
    const n = this.ctx.createStereoPanner();
    return ((n.pan.value = Math.max(-1, Math.min(1, t))), n.connect(this.master), n);
  }
  beep(t, n, o, s = "square", i = 0, a = 0) {
    if (!this.ctx || !this.master) return;
    const r = this.panned(a);
    if (!r) return;
    const l = this.ctx.currentTime + i,
      h = this.ctx.createOscillator(),
      c = this.ctx.createGain();
    ((h.type = s),
      (h.frequency.value = t),
      c.gain.setValueAtTime(1e-4, l),
      c.gain.linearRampToValueAtTime(o, l + 0.005),
      c.gain.setValueAtTime(o, l + Math.max(0.006, n - 0.015)),
      c.gain.exponentialRampToValueAtTime(1e-4, l + n),
      h.connect(c).connect(r),
      h.start(l),
      h.stop(l + n + 0.02));
  }
  noiseBurst(t, n, o, s, i = 0, a = 0.003) {
    if (!this.ctx || !this.master || !this.noise) return;
    const r = this.ctx.currentTime + i,
      l = this.ctx.createBufferSource();
    ((l.buffer = this.noise), (l.loop = !0));
    const h = this.ctx.createBiquadFilter();
    ((h.type = "bandpass"), (h.frequency.value = o), (h.Q.value = s));
    const c = this.ctx.createGain();
    (c.gain.setValueAtTime(1e-4, r),
      c.gain.linearRampToValueAtTime(n, r + a),
      c.gain.exponentialRampToValueAtTime(1e-4, r + t),
      l.connect(h).connect(c).connect(this.master),
      l.start(r, Math.random() * 0.5),
      l.stop(r + t + 0.05));
  }
  pattern(t, n = X.ALARM_VOL) {
    t.freqs.forEach((o, s) => this.beep(o, t.beep, n, "square", s * (t.beep + 0.06)));
  }
  plunge() {
    if (this.muted || !this.ctx || !this.master || !this.noise) return null;
    const context = this.ctx;
    const now = context.currentTime;
    const output = context.createGain();
    output.connect(this.master);
    const nodes = [output];
    const sources = [];
    const splash = context.createBufferSource();
    splash.buffer = this.noise;
    splash.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.38);
    filter.Q.value = 0.8;
    const wash = context.createGain();
    wash.gain.setValueAtTime(0.0001, now);
    wash.gain.linearRampToValueAtTime(0.24, now + 0.025);
    wash.gain.exponentialRampToValueAtTime(0.0001, now + 0.46);
    splash.connect(filter).connect(wash).connect(output);
    nodes.push(splash, filter, wash);
    sources.push(splash);
    splash.start(now);
    splash.stop(now + 0.48);
    for (const [delay, pitch, volume] of [[0.025, 240, 0.2], [0.15, 160, 0.13], [0.29, 280, 0.08]]) {
      const bubble = context.createOscillator();
      const gain = context.createGain();
      const at = now + delay;
      bubble.type = "sine";
      bubble.frequency.setValueAtTime(pitch, at);
      bubble.frequency.exponentialRampToValueAtTime(pitch * 0.42, at + 0.16);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.linearRampToValueAtTime(volume, at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.23);
      bubble.connect(gain).connect(output);
      nodes.push(bubble, gain);
      sources.push(bubble);
      bubble.start(at);
      bubble.stop(at + 0.25);
    }
    let remaining = sources.length;
    let stopped = false;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      for (const source of sources) {
        source.onended = null;
        try { source.stop(); } catch {}
      }
      for (const node of nodes) node.disconnect();
    };
    for (const source of sources) source.onended = () => { if (--remaining === 0) stop(); };
    return stop;
  }
  pluck(t, n, o) {
    if (!this.ctx || !this.master) return;
    const s = this.ctx.currentTime,
      i = this.ctx.createOscillator(),
      a = this.ctx.createGain();
    ((i.type = "triangle"),
      i.frequency.setValueAtTime(t * 1.06, s),
      i.frequency.exponentialRampToValueAtTime(t * 0.94, s + n),
      a.gain.setValueAtTime(1e-4, s),
      a.gain.linearRampToValueAtTime(o, s + 0.004),
      a.gain.exponentialRampToValueAtTime(1e-4, s + n),
      i.connect(a).connect(this.master),
      i.start(s),
      i.stop(s + n + 0.02));
  }
  carabiner() {
    const t = X.CARABINER;
    (this.noiseBurst(0.012, t.vol, t.freqs[0], 3),
      this.noiseBurst(0.01, t.vol * 0.8, t.freqs[1], 3, 0.028),
      this.beep(3100, 0.05, t.vol * 0.12, "triangle", 0.03));
  }
  shutter() {
    const t = X.SHUTTER;
    if (
      (this.noiseBurst(0.014, t.vol, t.freqs[0], 2.2),
      this.beep(900, 0.02, t.vol * 0.25, "triangle", 0.004),
      this.noiseBurst(0.012, t.vol * 0.75, t.freqs[1], 2.2, 0.06),
      !this.ctx || !this.master)
    )
      return;
    const n = this.ctx.currentTime + 0.12,
      o = this.ctx.createOscillator(),
      s = this.ctx.createGain();
    ((o.type = "sine"),
      o.frequency.setValueAtTime(2200, n),
      o.frequency.exponentialRampToValueAtTime(6200, n + 1.1),
      s.gain.setValueAtTime(1e-4, n),
      s.gain.linearRampToValueAtTime(t.whine, n + 0.1),
      s.gain.exponentialRampToValueAtTime(1e-4, n + 1.2),
      o.connect(s).connect(this.master),
      o.start(n),
      o.stop(n + 1.25));
  }
  discovery() {
    if (this.muted || !this.ctx || !this.master) return;
    const t = X.DISCOVERY,
      n = this.ctx,
      o = n.currentTime + 0.05,
      s = o + t.ATTACK_S + t.DECAY_S,
      i = n.createBiquadFilter();
    ((i.type = "lowpass"),
      (i.Q.value = 2.2),
      i.frequency.setValueAtTime(t.LP_FROM_HZ, o),
      i.frequency.exponentialRampToValueAtTime(t.LP_OPEN_HZ, o + t.ATTACK_S * 1.3),
      i.frequency.exponentialRampToValueAtTime(t.LP_END_HZ, s));
    const a = n.createGain();
    (a.gain.setValueAtTime(1e-4, o),
      a.gain.linearRampToValueAtTime(t.VOL, o + t.ATTACK_S),
      a.gain.exponentialRampToValueAtTime(1e-4, s),
      i.connect(a).connect(this.master));
    const r = n.createOscillator();
    r.frequency.value = t.VIBRATO_HZ;
    const l = n.createGain();
    ((l.gain.value = t.VIBRATO_CENTS), r.connect(l));
    const h = [
      [t.FREQ_HZ, 0, "triangle", 1],
      [t.FREQ_HZ, t.DETUNE_CENTS, "triangle", 0.8],
      [(t.FREQ_HZ * 2) / 3, -7 * 0.5, "sine", t.FIFTH],
    ];
    for (const [c, d, u, f] of h) {
      const p = n.createOscillator();
      ((p.type = u),
        p.frequency.setValueAtTime(c * t.GLIDE, o),
        p.frequency.exponentialRampToValueAtTime(c, o + t.ATTACK_S),
        (p.detune.value = d),
        l.connect(p.detune));
      const m = n.createGain();
      ((m.gain.value = f / h.length), p.connect(m).connect(i), p.start(o), p.stop(s + 0.05));
    }
    (r.start(o), r.stop(s + 0.05));
  }
  onEvent(t) {
    switch (t.type) {
      case "drop":
        (this.carabiner(),
          t.onLine
            ? (this.beep(2300, 0.12, 0.05, "sine", 0.06), this.beep(3650, 0.09, 0.03, "sine", 0.01))
            : this.noiseBurst(0.25, 0.05, 700, 0.8, 0.05, 0.05));
        break;
      case "land": {
        const n = Math.min(1, 0.35 + t.speed);
        (this.noiseBurst(0.09, X.TANK_LAND.vol * n, 420, 1.2),
          this.beep(t.tank === "back" ? 160 : 240, 0.18, X.TANK_LAND.vol * 0.4 * n, "sine", 0.01));
        break;
      }
      case "pickup":
        this.carabiner();
        break;
      case "gas":
        (this.noiseBurst(0.05, X.CLACK_VOL, 2400, 1.2),
          this.beep(140, 0.07, X.CLACK_VOL * 0.5, "sine"),
          this.noiseBurst(0.35, X.BREATH_VOL * 1.5, 900, 0.8, 0.15, 0.08));
        break;
      case "rule":
        this.pattern(X.RULE, X.ALARM_VOL * 0.6);
        break;
      case "auto":
        this.noiseBurst(0.04, X.AUTO_VOL * 3, t.on ? 1800 : 1200, 1.5);
        break;
      case "ox":
        t.phase === "convulse" && this.beep(X.CONVULSE.freq, X.CONVULSE.dur, X.CONVULSE.vol, "sawtooth");
        break;
      case "dying":
        t.stage === "sink" &&
          (this.noiseBurst(1.4, Rt.BURST_VOL, 480, 0.6, 0, 0.02),
          this.noiseBurst(0.5, Rt.BURST_VOL * 0.5, 900, 0.9, 0.25, 0.05));
        break;
      case "decoStart":
        this.pattern(X.DECO_START);
        break;
      case "stopClear":
        this.pattern(X.STOP_CLEAR, X.ALARM_VOL * 0.8);
        break;
      case "bump":
        this.noiseBurst(0.12, Math.min(0.3, 0.08 * t.speed), 300, 0.9);
        break;
      case "tie":
        (this.noiseBurst(0.22, t.kind === "end" ? X.REEL_CUT.vol : X.TIE.vol, 1500, 1.4, 0, 0.04),
          t.kind === "end"
            ? this.carabiner()
            : this.beep(t.kind === "in" ? 2300 : 520, 0.05, X.TIE.vol * 0.35, "sine", 0.2));
        break;
      case "reelTug": {
        const n = X.REEL_TUG,
          o = Math.min(1, 0.45 + t.speed);
        (this.pluck(n.freq, 0.42, n.vol * o),
          this.pluck(n.freq * 1.5, 0.22, n.vol * 0.35 * o),
          this.noiseBurst(0.1, n.vol * 0.9 * o, 240, 0.9),
          ze(n.vibrate));
        break;
      }
      case "arrow":
        (this.beep(X.ARROW_SET.freq, 0.03, X.ARROW_SET.vol, "square"),
          this.beep(X.ARROW_SET.freq * 0.75, 0.03, X.ARROW_SET.vol * 0.7, "square", 0.05));
        break;
      case "arrowTouch": {
        const n = X.ARROW_TOUCH,
          o = n.vol * (t.blind ? 1 : 0.35);
        (n.freqs.forEach((s, i) => this.beep(s, n.beep, o, "triangle", i * 0.09, t.dx * n.pan)),
          t.blind && ze(n.vibrate));
        break;
      }
      case "reelOut":
        (this.beep(X.REEL_OUT.freq, 0.25, X.REEL_OUT.vol, "sine"),
          this.noiseBurst(0.18, X.REEL_OUT.vol * 0.8, 650, 1.1),
          ze(X.REEL_OUT.vibrate));
        break;
      case "reelPark":
        this.noiseBurst(0.05, X.REEL_PARK.vol * 2, 2e3, 2);
        break;
      case "alarm":
        t.on ? this.alarmT.set(t.kind, 0) : this.alarmT.delete(t.kind);
        break;
      case "fail":
        this.onFail(t);
        break;
      case "failTug": {
        const n = X.TANGLE,
          o = Math.min(1, 0.5 + t.speed);
        (this.pluck(n.freq * 0.8, 0.3, n.vol * 0.8 * o),
          this.noiseBurst(0.08, n.vol * 0.6 * o, 300, 1),
          ze(n.vibrate));
        break;
      }
      case "shot":
        this.shutter();
        break;
      case "dead":
        break;
      case "surfaced":
        this.noiseBurst(0.6, 0.08, 700, 0.5, 0, 0.05);
        break;
    }
  }
  onFail(t) {
    if (t.kind === "freeflow") {
      if ((t.phase === "warn" && ze(X.HISS.VIBRATE), t.phase === "fixed")) {
        const n = X.VALVE;
        (this.noiseBurst(0.25, n.vol * 0.6, 900, 4, 0, 0.05),
          this.beep(240, 0.18, n.vol * 0.25, "sawtooth", 0.05),
          this.noiseBurst(0.03, n.vol, 2600, 2, 0.27));
      }
    } else if (t.kind === "light")
      if (t.phase === "active") {
        const n = X.LIGHT_DIE;
        (this.noiseBurst(0.06, n.vol * 0.7, 3e3, 2.5),
          this.noiseBurst(0.02, n.vol, 3400, 3, 0.07),
          this.beep(95, 0.15, n.vol * 0.7, "sine", 0.09));
      } else
        t.phase === "fixed" &&
          (this.carabiner(), this.beep(2900, 0.025, X.LIGHT_ON.vol * 0.5, "square", 0.12));
    else if (t.kind === "entangle")
      if (t.phase === "warn" || t.phase === "active") {
        const n = X.TANGLE,
          o = t.phase === "active" ? 1 : 0.75;
        (this.pluck(n.freq * (t.phase === "active" ? 0.7 : 1), 0.5, n.vol * o),
          this.pluck(n.freq * 1.5, 0.25, n.vol * 0.4 * o),
          ze(n.vibrate));
      } else
        (this.noiseBurst(0.3, X.UNTANGLE.vol, 1400, 1.3, 0, 0.05),
          this.pluck(X.TANGLE.freq * 1.8, 0.2, X.TANGLE.vol * 0.4));
  }
  update(t, n, o, s = { line: null, murk: 0 }) {
    const i = kn(t);
    if ((this.updateVoices(t, o, s.murk, i.quiet), !this.ctx || t.phase !== "dive")) {
      (this.alarmT.clear(), (this.dyingT = -1));
      return;
    }
    (this.updateDying(t, i), this.updateRub(t, n, s), this.updateFlicker(t));
    for (const [r, l] of this.alarmT) {
      if (!t.alarms[r] || i.regOut) {
        this.alarmT.delete(r);
        continue;
      }
      const h = l - n;
      if (h <= 0) {
        const c = Q0[r];
        (this.pattern(c, X.ALARM_VOL * i.ui), this.alarmT.set(r, c.period));
      } else this.alarmT.set(r, h);
    }
    const a = t.tanks[t.breathing];
    if (
      !(!t.started || a.bar <= 0 || t.cesa || t.dying) &&
      ((this.breathT -= n * t.timeScale), this.breathT <= 0)
    ) {
      const [r, l] = j.BREATH_PERIOD_S,
        h = (r + (l - r) * t.diver.effort) / (t.dash ? X.DASH_BREATH : 1);
      ((this.breathT = h), this.onBreath?.(h));
      const c = Math.max(0, Math.min(1, t.depth / 40));
      this.noiseBurst(h * 0.32, X.BREATH_VOL * (1 - c * 0.35), 1100 - c * 300, 0.7, 0, h * 0.12);
      for (let d = 0; d < 5; d++)
        this.beep(
          260 + Math.random() * 380,
          0.05,
          X.BREATH_VOL * 0.35,
          "sine",
          h * 0.42 + d * 0.07 + Math.random() * 0.04,
        );
    }
  }
  updateRub(t, n, o) {
    this.rubBuzzT += n;
    const s = J0(t, o.line, o.feel ?? o.murk);
    if (!s) {
      this.rubT = 0;
      return;
    }
    ((this.rubT += n * s.grainHz),
      !(this.rubT < 1) &&
        ((this.rubT -= Math.floor(this.rubT)),
        s.vibrate &&
          this.rubBuzzT >= X.RUB.VIBRATE_GAP_S &&
          ((this.rubBuzzT = 0), ze(X.RUB.VIBRATE_MS))));
  }
  noiseGrain(t, n, o, s, i) {
    if (!this.ctx || !this.noise) return;
    const a = this.panned(i);
    if (!a) return;
    const r = this.ctx.currentTime,
      l = this.ctx.createBufferSource();
    ((l.buffer = this.noise), (l.loop = !0));
    const h = this.ctx.createBiquadFilter();
    ((h.type = "bandpass"), (h.frequency.value = o), (h.Q.value = s));
    const c = this.ctx.createGain();
    (c.gain.setValueAtTime(1e-4, r),
      c.gain.linearRampToValueAtTime(n, r + t * 0.35),
      c.gain.exponentialRampToValueAtTime(1e-4, r + t),
      l.connect(h).connect(c).connect(a),
      l.start(r, Math.random() * 0.5),
      l.stop(r + t + 0.05));
  }
  updateDying(t, n) {
    const o = t.dying;
    if (!o) {
      this.dyingT = -1;
      return;
    }
    ((this.dyingT < 0 || o.total < this.dyingT) && ((this.gaspAt = 0.15), (this.heartAt = 0.05)),
      (this.dyingT = o.total));
    const s = o.firstS + Xt.SINK_S,
      i = Math.min(1, o.total / s);
    if (n.stage === "struggle" && o.total >= this.gaspAt) {
      const [a, r] = Rt.GASP_EVERY_S;
      this.gaspAt = o.total + a + (r - a) * n.u;
      const l = Rt.GASP_VOL * (1 - 0.55 * n.u);
      (this.noiseBurst(0.26, l, 560, 2.4, 0, 0.03), this.beep(170, 0.07, l * 0.5, "sawtooth", 0.02));
    }
    if (o.total >= this.heartAt && i < 0.92) {
      const [a, r] = Rt.HEART_BPM;
      this.heartAt = o.total + 60 / (a + (r - a) * i);
      const l = Rt.HEART_VOL * (1 - 0.75 * i);
      (this.beep(56, 0.1, l, "sine"), this.beep(48, 0.1, l * 0.7, "sine", 0.17));
    }
  }
  updateFlicker(t) {
    const n = rn(t, "light"),
      o = !!n && n.phase === "warn" && Ro(n.t, n.warnS) < 0.7;
    (o && !this.dipOn && this.noiseBurst(0.03, X.FLICKER.vol, X.FLICKER.freq, 2.5), (this.dipOn = o));
  }
  updateVoices(t, n, o = 0, s = 1) {
    const i = this.voices;
    if (!this.ctx || !i) return;
    const a = this.ctx.currentTime,
      r = X.AMBIENT,
      l = Math.max(0, Math.min(1, t.depth / r.DEEP_M)),
      h = Math.max(0, 1 - t.depth / r.SHIMMER_END_M),
      c = 1 - (1 - X.BLIND_MUFFLE) * (t.phase === "dive" ? o : 0),
      d = r.CUTOFF_SURF_HZ * Math.pow(r.CUTOFF_DEEP_HZ / r.CUTOFF_SURF_HZ, l) * c;
    (i.amb.gain.setTargetAtTime(r.VOL * c * s, a, s < 1 ? 0.3 : r.TAU_S),
      i.ambFilter.frequency.setTargetAtTime(d, a, r.TAU_S),
      i.ambNoise.gain.setTargetAtTime(r.NOISE_SURF + (r.NOISE_DEEP - r.NOISE_SURF) * l, a, r.TAU_S),
      i.drone.gain.setTargetAtTime(r.DRONE_DEEP * l, a, r.TAU_S),
      i.shimmer.gain.setTargetAtTime(r.SHIMMER_SURF * h, a, r.TAU_S),
      i.ring.gain.setTargetAtTime(t.phase === "dive" ? X.RING.vol * n * s : 0, a, 0.25));
    const u = t.phase === "dive" && !t.dying ? rn(t, "freeflow") : null,
      f = X.HISS;
    let p = 0,
      m = 0;
    (u?.phase === "warn"
      ? (p = f.WARN_VOL * (0.55 + 0.45 * Math.max(0, Math.sin(u.t * Math.PI * 2 * f.SPUTTER_HZ))))
      : u?.phase === "active" && ((p = f.VOL), (m = f.VOL * 0.8)),
      i.hiss.gain.setTargetAtTime(p, a, u ? 0.05 : 0.02),
      i.rumble.gain.setTargetAtTime(m, a, u ? 0.08 : 0.02));
  }
}
const ed = (e) => e * e * (3 - 2 * e);
