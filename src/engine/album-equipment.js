const Xn = (e) =>
  e.replace(/[&<>"]/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[t]);
const $l = (e) => xt().finds.find((t) => t.id === e);
function If(e, t, n, o = !1) {
  if (t && o)
    return '<p class="fhead">Рассказать некому.</p><p class="dim">Нырок не засчитан — находки этого нырка не дошли до лодки.</p>';
  if (t)
    return '<p class="fhead">Камера осталась внизу.</p><p class="dim">Кадров нет — находки этого нырка не засчитаны.</p>';
  const s = `<p class="fline">Кадров <b>${e.length}</b> из ${Q.FRAMES} · новое: <b>${n}</b></p>`;
  if (!e.length) return s;
  const i = e
    .map((a, r) => {
      const l = a.fresh.length
          ? '<i class="anew" aria-label="новое"></i>'
          : a.finds.length
            ? '<i class="afind"></i>'
            : "",
        h = a.img ? `<img src="${a.img}" alt="кадр ${a.n}">` : '<span class="anone">кадр не снят</span>';
      return `<button class="athumb${a.white ? " white" : ""}" data-shot="${r}">${h}<span class="an">${a.n}</span>${l}</button>`;
    })
    .join("");
  return `${s}<div class="astrip">${i}</div>`;
}
function Of(e, t) {
  return e.length
    ? `<ul class="alist">${e
        .map((o) => {
          const s = $l(o);
          if (!s) return "";
          const i = t.frames[o];
          return `<li>${i ? `<button class="athumb small" data-album="${o}"><img src="${i}" alt="${Xn(s.name)}"></button>` : '<span class="athumb small none">кадра нет</span>'}<div><b>${Xn(s.name)}</b><br><span class="dim">${Xn(s.fact)}</span></div></li>`;
        })
        .join("")}</ul>`
    : "";
}
function Gl(e, t) {
  const n = Math.abs(e) % 100,
    o = n % 10;
  return n > 10 && n < 20 ? t[2] : o === 1 ? t[0] : o >= 2 && o <= 4 ? t[1] : t[2];
}
const Ni = (e) => `${Math.max(1, Math.round(e / 1024))} КБ`;
function Pf(e, t = new Date()) {
  const n = (o) => String(o).padStart(2, "0");
  return `${e}-${t.getFullYear()}${n(t.getMonth() + 1)}${n(t.getDate())}-${n(t.getHours())}${n(t.getMinutes())}.json`;
}
function vf(e, t, n = "application/json") {
  try {
    const o = URL.createObjectURL(new Blob([t], { type: n })),
      s = document.createElement("a");
    return (
      (s.href = o),
      (s.download = e),
      (s.rel = "noopener"),
      (s.style.display = "none"),
      document.body.appendChild(s),
      s.click(),
      s.remove(),
      setTimeout(() => URL.revokeObjectURL(o), 3e4),
      !0
    );
  } catch {
    return !1;
  }
}
function Xa(e) {
  (e.focus({ preventScroll: !0 }), e.select());
  try {
    e.setSelectionRange(0, e.value.length);
  } catch {}
}
async function Nf(e, t) {
  t.classList.add("hidden");
  try {
    if (navigator.clipboard && window.isSecureContext)
      return (await navigator.clipboard.writeText(e), "clipboard");
  } catch {}
  ((t.value = e), t.classList.remove("hidden"), Xa(t));
  let n = !1;
  try {
    n = document.execCommand("copy");
  } catch {
    n = !1;
  }
  return n ? (t.classList.add("hidden"), "exec") : (Xa(t), "manual");
}
function Cf(e, t, n) {
  return {
    found: t,
    maxDoor: n,
    deco: e.stats.stopServedS >= 1 && e.stop === 0,
    reelOut: e.line.outSeen || e.line.cut,
    lightFail: e.fail.list.some((o) => o.kind === "light" && o.phase !== "armed"),
  };
}
function xf(e, t) {
  const n = e.when;
  return !!(
    n.start ||
    (n.finds && n.finds.some((o) => t.found.includes(o))) ||
    (n.door !== void 0 && t.maxDoor >= n.door) ||
    (n.deco && t.deco) ||
    (n.reelOut && t.reelOut) ||
    (n.lightFail && t.lightFail)
  );
}
function ja(e, t, n) {
  return n ? Zi.filter((o) => !e.includes(o.id) && xf(o, t)) : [];
}
function Ci(e) {
  return e.id === "hub";
}
function Si(e, t, n) {
  if (!Ci(e)) return { backs: ["twin"], slots: ["deco50", "stage", "reel", "light"] };
  const o = new Set(n ? Zi.map((a) => a.id) : t),
    s = o.has("twin12") ? ["single", "twin"] : ["single"],
    i = [];
  return (
    o.has("ean50") && i.push("deco50"),
    o.has("spareReel") && i.push("reel"),
    o.has("spareLight") && i.push("light"),
    { backs: s, slots: i }
  );
}
function Mn(e, t) {
  const n = t.backs.includes(e.back ?? "twin")
      ? (e.back ?? "twin")
      : t.backs.includes("twin")
        ? "twin"
        : "single",
    o = equipmentSlots(e.slots, t.slots);
  return { rule: e.rule, bottom: "air", slots: o, back: n };
}
function Df(e, t, n) {
  // Newly available equipment never silently changes the selected loadout.
  return Mn({ ...e, slots: [...e.slots] }, n);
}
