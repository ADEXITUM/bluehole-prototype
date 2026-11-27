class Yd {
  constructor(t) {
    M(this, "world");
    M(this, "cones", []);
    M(this, "cols", []);
    M(this, "bells", []);
    M(this, "haloCols");
    M(this, "finds");
    M(this, "notes");
    M(this, "halo");
    ((this.world = t),
      (this.finds = t.site.finds),
      (this.notes = t.site.notes),
      (this.halo = t.site.halocline));
    for (const o of this.finds) {
      if (o.kind === "stal" || o.kind === "curtain")
        for (const [s, i, a] of o.cones ?? qd) this.addCone(s, gi(t, s, o.y + 0.8), i, a, !1);
      if (o.kind === "hall") {
        this.addCone(_i[0], Mi(t, _i[0], o.y - 0.4), _i[1], _i[2], !0);
        for (const [s, i, a] of zd) this.addCone(s, gi(t, s, 39.5), i, a, !1);
      }
      if (o.kind === "columns")
        for (const [s, i] of o.columns ?? []) {
          const a = gi(t, s, o.y),
            r = Mi(t, s, o.y);
          Number.isFinite(a) &&
            Number.isFinite(r) &&
            this.cols.push({
              i: Math.round(s * at - i / 2),
              j0: Math.floor(a * at),
              j1: Math.ceil(r * at),
              w: i,
            });
        }
      if (o.kind === "bell") {
        const s = [],
          i = Math.round(o.y * at);
        for (let a = Math.floor((o.x - 5) * at); a <= Math.ceil((o.x + 5) * at); a++) {
          const r = gi(t, (a + 0.5) / at, o.y + 0.3);
          r < o.y && s.push({ i: a, j0: Math.floor(r * at), j1: i });
        }
        this.bells.push({ f: o, cols: s });
      }
    }
    const n = t.w * at;
    if (((this.haloCols = new Uint8Array(n)), this.halo !== null))
      for (let o = 0; o < n; o++) this.haloCols[o] = z(t, (o + 0.5) / at, this.halo) > 0.04 ? 1 : 0;
  }
  addCone(t, n, o, s, i) {
    Number.isFinite(n) &&
      this.cones.push({
        i: Math.round(t * at - o / 2),
        j0: i ? Math.ceil(n * at) : Math.floor(n * at),
        w: o,
        len: s,
        up: i,
      });
  }
  draw(t, n, o, s = 0) {
    const i = n.ox - 1,
      a = n.ox + n.W / n.zoom + 1,
      r = n.oy - 1,
      l = n.oy + n.H / n.zoom + 1,
      h = (f, p) => f > i - 3 && f < a + 3 && p > r - 3 && p < l + 3,
      c = (f) => Math.round((f / at - n.ox) * n.zoom),
      d = (f) => Math.round((f / at - n.oy) * n.zoom),
      u = (f, p, m) => {
        const y = c(f),
          _ = d(p);
        ((t.fillStyle = m), t.fillRect(y, _, c(f + 1) - y, d(p + 1) - _));
      };
    (t.save(), (t.globalAlpha = 1), (t.globalCompositeOperation = "source-over"));
    for (const f of this.cones)
      if (h(f.i / at, f.j0 / at))
        for (let p = 0; p < f.len; p++) {
          const m = ((f.i * 7 + p * 13) % 5 === 0 ? 1 : 0) * (p < f.len - 2 ? 1 : 0),
            y = Math.max(1, Math.round(f.w * Math.pow(1 - p / f.len, 0.85) + 0.35) + m),
            _ = f.up ? f.j0 - 1 - p : f.j0 + p,
            g = f.i + Math.floor((f.w - y) / 2);
          for (let S = 0; S < y; S++)
            u(
              g + S,
              _,
              p === f.len - 1 ? Ye.t : S === 0 && y > 1 ? Ye.h : S === y - 1 && y > 2 ? Ye.s : Ye.m,
            );
        }
    for (const f of this.cols) {
      if (!h(f.i / at, (f.j0 + f.j1) / 2 / at)) continue;
      const p = f.j1 - f.j0;
      for (let m = 0; m <= p; m++) {
        const y = Math.abs((2 * m) / Math.max(1, p) - 1),
          _ = (f.i * 5 + m * 11) % 7 === 0 ? 1 : 0,
          g = Math.max(2, Math.round(f.w * (0.42 + 0.58 * Math.pow(y, 1.6))) + _),
          S = f.i + Math.floor((f.w - g) / 2);
        for (let A = 0; A < g; A++) u(S + A, f.j0 + m, A === 0 ? Ye.h : A === g - 1 ? Ye.s : Ye.m);
      }
    }
    for (const f of this.finds) {
      if (!h(f.x, f.y)) continue;
      if (drawSurveyArtifact(t, n, this.world, f)) continue;
      const p = jd[f.kind];
      if (!p) continue;
      const m = Math.round(f.x * at - p.ax),
        y = Math.round(f.y * at - p.ay);
      p.rows.forEach((_, g) => {
        for (let S = 0; S < _.length; S++) {
          const A = p.pal[_[S]];
          A && u(m + S, y + g, A);
        }
      });
    }
    for (const f of this.finds)
      if (f.kind === "body" && h(f.x, f.y))
        Ca(t, n, this.world, f.x + 1.45, Mi(this.world, f.x + 1.45, f.y - 0.3) || f.y);
    for (const f of this.bells) if (f.cols.length && h(f.f.x, f.f.y)) drawSurveyDome(t, n, f, o, at);
    for (const f of this.notes)
      if (h(f.x, f.y))
        if (f.kind === "tag") {
          const p = f.y + Gi.HANG_M;
          (t.beginPath(),
            t.moveTo(c(f.x * at), d(f.y * at)),
            t.lineTo(c(f.x * at), d(p * at)),
            (t.strokeStyle = "rgba(60,50,30,0.85)"),
            (t.lineWidth = Math.max(1, 0.012 * n.zoom)),
            t.stroke(),
            Ll(t, n, f.x - Gi.W_M / 2, p));
        } else f.kind === "sign" && this.drawSign(u, f);
    (this.halo !== null && this.drawHalocline(t, n, s, c, d), t.restore());
  }
  drawSign(t, n) {
    const o = Mi(this.world, n.x, n.y),
      s = [
        "kkkkkkkkkkkkkkkkkkkkkkk",
        "kyyyyyyyyyyyyyyyyyyyyyk",
        "kyKKKKKKKKKKKKKKKKKKKyk",
        "kyKKWWWKKKWWWKKKWWWKKyk",
        "kyKWWWWWKWWWWWKWWWWWKyk",
        "kyKWKWKWKWKWKWKWKWKWKyk",
        "kyKWWWWWKWWWWWKWWWWWKyk",
        "kyKKWKWKKKWKWKKKWKWKKyk",
        "kyKKKKKKKKKKKKKKKKKKKyk",
        "kyyyyyyyyyyyyyyyyyyyyyk",
        "kyrwwrwrwwrwwrwrwwrwryk",
        "kyrrrrrrrrrrrrrrrrrrryk",
        "kyrrwrwwrwwwrwrwwrwrryk",
        "kyyyyyyyyyyyyyyyyyyyyyk",
        "kkkkkkkkkkkkkkkkkkkkkkk",
      ],
      i = { k: "#1d1b18", y: "#e0b934", K: "#221d18", W: "#f2ead6", r: "#a3231a", w: "#efe2d0" },
      a = 23,
      r = Math.round(n.x * at) - (a >> 1),
      l = Math.round(n.y * at) - (s.length >> 1);
    if (
      (s.forEach((h, c) => {
        for (let d = 0; d < Math.min(h.length, a); d++) {
          const u = i[h[d]];
          u && t(r + d, l + c, u);
        }
      }),
      Number.isFinite(o))
    )
      for (let h = l + s.length; h < Math.ceil(o * at); h++) t(r + (a >> 1), h, "#5a5246");
  }
  drawHalocline(t, n, o, s, i) {
    const a = this.halo;
    if (a < n.oy - 1 || a > n.oy + n.H / n.zoom + 1) return;
    const r = Math.pow(Math.abs(Math.cos(o)), zt.GLINT_POW);
    if (r < zt.GLINT_MIN) return;
    const l = Math.max(0, Math.floor(n.ox * at) - 1),
      h = Math.min(this.haloCols.length - 1, Math.ceil((n.ox + n.W / n.zoom) * at) + 1),
      c = Math.round(a * at);
    ((t.globalAlpha = zt.ALPHA * r), (t.fillStyle = "#cfe6e4"));
    for (let d = l; d <= h; d++) {
      if (!this.haloCols[d]) continue;
      const u = s(d),
        f = i(c);
      t.fillRect(u, f, s(d + 1) - u, Math.max(1, i(c + zt.LINE_PX) - f));
    }
    t.globalAlpha = 1;
  }
}
