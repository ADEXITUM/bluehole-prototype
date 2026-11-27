const photoRoutes = [
  { id: "curtain", short: "Занавес", leg: "Ближний", clue: "Вход справа на 18 м. За знаком посмотри на зубчатый свод, примерно в 12 м от входа." },
  { id: "dome", short: "Купол", leg: "Дальний", clue: "От входа на 18 м следуй по старой линии до белой стрелки. Посвети вверх и посмотри, где под сводом собираются пузырьки." }
];

function drawPhotoMark(ctx, x, y, small) {
  ctx.save();
  const radius = small ? 6 : 10;
  ctx.strokeStyle = "#9a4531";
  ctx.lineWidth = small ? 1.5 : 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.font = "bold " + (small ? 10 : 13) + "px Georgia, serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ede3ca";
  ctx.strokeText("цель", x + radius, y - 2);
  ctx.fillStyle = "#853b2b";
  ctx.fillText("цель", x + radius, y - 2);
  ctx.restore();
}

function surveyElement(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}
