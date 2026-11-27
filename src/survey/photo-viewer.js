function openDivePhoto(source, number, finds, white, fresh = [], marks = {}, feedback = null) {
  const dialog = document.createElement("dialog");
  dialog.className = "aview";
  dialog.setAttribute("aria-label", "Просмотр снимка");
  const card = surveyElement("div", "", "acard");
  const picture = surveyElement("div", "", "photo-inspect");
  const ring = surveyElement("span", "", "photo-location");
  ring.hidden = true;
  ring.setAttribute("aria-hidden", "true");
  if (source) {
    const image = new Image();
    image.src = source;
    image.alt = finds.length ? finds.map(Eu).join(", ") : "Подводный снимок";
    picture.append(image, ring);
  } else {
    picture.append(surveyElement("span", "Изображение не сохранилось", "anone big"));
  }
  card.append(picture);
  if (number != null) card.append(surveyElement("p", "Кадр " + number, "dim"));
  const pointers = [];
  for (const id of finds) {
    const subject = $l(id);
    const caption = surveyElement("p");
    caption.append(surveyElement("b", subject.name));
    if (fresh.includes(id)) caption.append(" ", surveyElement("span", "Впервые", "new"));
    const point = marks[id];
    if (source && point) {
      const locate = surveyElement("button", "Где на снимке?", "photo-locate");
      locate.type = "button";
      locate.setAttribute("aria-pressed", "false");
      pointers.push(locate);
      locate.addEventListener("click", () => {
        const show = locate.getAttribute("aria-pressed") === "false";
        for (const other of pointers) other.setAttribute("aria-pressed", String(show && other === locate));
        ring.hidden = !show;
        ring.style.left = point[0] * 100 + "%";
        ring.style.top = point[1] * 100 + "%";
      });
      caption.append(" ", locate);
    }
    caption.append(document.createElement("br"), surveyElement("span", subject.fact, "dim"));
    card.append(caption);
  }
  if (!finds.length) card.append(surveyElement("p", surveyShotExplanation({white,feedback}), "dim"));
  const close = surveyElement("button", "Закрыть снимок", "photo-close");
  close.type = "button";
  close.autofocus = true;
  close.addEventListener("click", () => dialog.close());
  card.append(close);
  dialog.append(card);
  dialog.addEventListener("click", event => {
    if (event.target === dialog || picture.contains(event.target)) dialog.close();
  });
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  document.body.append(dialog);
  dialog.showModal();
}
