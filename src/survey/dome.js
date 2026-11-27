// The pocket is part of the cave art. The normal lamp, flash, silt and
// darkness passes light it before the camera takes its picture.
function drawSurveyDome(ctx, view, bell, seconds, cellsPerMetre) {
  const columns = bell.cols;
  const cell = 1 / cellsPerMetre;
  const surface = bell.f.y;
  ctx.save();
  ctx.translate(-view.ox * view.zoom, -view.oy * view.zoom);
  ctx.scale(view.zoom, view.zoom);

  const air = ctx.createLinearGradient(0, surface - 1, 0, surface + 0.04);
  air.addColorStop(0, "#17242d");
  air.addColorStop(0.42, "#475657");
  air.addColorStop(0.76, "#869b94");
  air.addColorStop(0.88, "#dde6d5");
  air.addColorStop(1, "#668995");

  // Follow the sampled roof all the way to each contact with the rock.
  // Where the roof divides the pocket, the mirror must break as well.
  let start = 0;
  while (start < columns.length) {
    let end = start + 1;
    while (end < columns.length && columns[end].i === columns[end - 1].i + 1) end++;
    const left = columns[start].i * cell;
    const right = (columns[end - 1].i + 1) * cell;
    const width = right - left;
    const ripple = x => surface
      + 0.035 * Math.sin((x - left) * 3.2 + seconds * 0.75)
      + 0.018 * Math.sin((x - left) * 6.8 - seconds * 1.15);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(left, ripple(left));
    for (let j = start; j < end; j++) {
      ctx.lineTo((columns[j].i + 0.5) * cell, columns[j].j0 * cell);
    }
    ctx.lineTo(right, ripple(right));
    for (let j = end - 1; j >= start; j--) {
      const x = columns[j].i * cell;
      ctx.lineTo(x, ripple(x));
    }
    ctx.closePath();
    ctx.fillStyle = air;
    ctx.fill();
    ctx.clip();

    if (width > 1) {
      // Broken reflections sit inside the mirror. Their widths contract and
      // expand while the lower edge stays nearly horizontal.
      for (let j = 0; j < 5; j++) {
        const phase = seconds * 0.65 + j * 2.3;
        const x = left + width * (j + 0.6) / 5;
        const y = surface - 0.18 - 0.07 * Math.sin(phase);
        ctx.fillStyle = j % 2 === 0 ? "#e2e6d7" : "#77959a";
        ctx.beginPath();
        ctx.ellipse(x, y, width * (0.07 + 0.025 * Math.sin(phase)), 0.035, -0.045, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(left, ripple(left));
    for (let j = start; j < end; j++) {
      const x = (columns[j].i + 1) * cell;
      ctx.lineTo(x, ripple(x));
    }
    ctx.strokeStyle = "#19343c";
    ctx.lineWidth = 0.22;
    ctx.stroke();
    ctx.strokeStyle = "#f5f1dc";
    ctx.lineWidth = 0.07;
    ctx.stroke();

    // A small train of bubbles flattens into the interface, so the silver
    // strip reads as trapped gas even when the diver holds the lamp still.
    if (width > 2) {
      const sourceX = left + width * 0.62;
      for (let j = 0; j < 3; j++) {
        const rise = (seconds / 3 + j / 3) % 1;
        const x = sourceX + 0.12 * Math.sin(rise * 5 + j);
        const y = ripple(x) + 2.25 * (1 - rise);
        const contact = Math.max(0, (rise - 0.82) / 0.18);
        const radius = (0.07 + 0.07 * rise) * Math.min(1, rise * 8);
        ctx.beginPath();
        ctx.ellipse(x, y, radius * (1 + contact), radius * (1 - 0.75 * contact), 0, 0, Math.PI * 2);
        ctx.fillStyle = "#476e79";
        ctx.fill();
        ctx.strokeStyle = "#c6e1de";
        ctx.lineWidth = 0.025;
        ctx.stroke();
      }
    }
    start = end;
  }
  ctx.restore();
}
