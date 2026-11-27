// Photos and the log are views of the completed dive. The simulation owns
// delivery, discoveries, equipment and the expedition's saved state.
class SurveyResultScreen extends Lu {
  constructor(root) {
    super(root);
    const card = root.querySelector(".card");
    card.classList.add("survey-result");
    this.sheet = surveyElement("div", "", "result-return-sheet");
    this.receipt = surveyElement("header", "", "survey-receipt");
    this.heading = surveyElement("h2");
    this.heading.tabIndex = -1;
    this.summary = surveyElement("p", "", "result-explanation");
    this.receipt.append(this.heading, this.summary);
    this.discovery=surveyElement('section','','result-discovery');this.discovery.hidden=true;
    this.returnReview=surveyElement('section','','result-return-review');
    this.returnReview.hidden=true;
    this.contact = surveyElement("section", "", "result-contact");
    this.sheet.append(this.receipt, this.discovery, this.contact, this.returnReview);

    this.film = surveyElement("ol", "", "result-film");
    this.film.setAttribute("aria-label", "Все кадры этого нырка");
    this.gear = surveyElement("section", "", "result-gear");
    this.next = surveyElement("p", "", "result-chapter");
    this.evidence = surveyElement("section", "", "result-evidence");
    this.evidence.hidden=true;
    this.albumPage = surveyElement("div", "", "result-album-page");
    this.albumPage.append(this.sheet, this.film, this.gear, this.evidence, this.next);

    const actions = card.querySelector(".btns");
    this.planButton = actions.querySelector('[data-a="plan"]');
    this.planButton.textContent = "На лодку";
    this.repeatButton = actions.querySelector('[data-a="again"]');
    this.repeatButton.hidden = true;
    this.repeatButton.tabIndex = -1;
    this.journalButton = surveyElement("button", "Профиль нырка", "result-journal-button");
    this.journalButton.type = "button";
    this.journalButton.hidden=!he.has("dbg");
    this.journalButton.setAttribute("aria-controls", "survey-result-journal");
    this.journalButton.setAttribute("aria-expanded", "false");
    this.journalButton.addEventListener("click", () => this.showJournal(this.journal.hidden));
    actions.replaceChildren(this.planButton, this.journalButton, this.repeatButton);

    this.journal = surveyElement("section", "", "result-journal");
    this.journal.id = "survey-result-journal";
    this.journal.hidden = true;
    this.journalTitle = surveyElement("h2");
    this.journalTitle.tabIndex = -1;
    this.record = surveyElement("div", "", "result-record");
    this.profile = surveyElement("div", "", "result-profile");
    this.chart = card.querySelector('[data-n="chart"]');
    this.chart.setAttribute("role", "img");
    this.legend = surveyElement("div", "", "result-chart-legend");
    this.turn = surveyElement("p", "", "result-turn");
    this.profile.append(surveyElement("p", "Глубина, м", "result-chart-label"), this.chart,
      surveyElement("p", "Время под водой, мин:с", "result-chart-time"), this.legend);
    const tools = card.querySelector(".tm");
    tools.querySelector("span").remove();
    tools.querySelector('[data-a="tm-copy"]').textContent = "Скопировать запись JSON";
    tools.querySelector('[data-a="tm-all"]').textContent = "Скачать все записи";
    this.journal.append(this.journalTitle, this.profile, this.turn, this.record, tools,
      card.querySelector('[data-n="tm-msg"]'), card.querySelector('[data-n="tm-text"]'));
    card.replaceChildren(this.albumPage, this.journal, actions);
    new ResizeObserver(() => this.drawProfile()).observe(this.profile);
  }

  showJournal(open) {
    this.journal.hidden = !open;
    this.albumPage.hidden = open;
    this.journalButton.setAttribute("aria-expanded", String(open));
    this.journalButton.textContent = open ? "К плёнке" : "Профиль нырка";
    this.root.scrollTop = 0;
    this.drawProfile();
    (open ? this.journalTitle : this.heading).focus({ preventScroll: true });
  }

  drawProfile() {
    if (!this.state || this.journal.hidden || this.root.classList.contains("hidden")) return;
    const style = getComputedStyle(this.profile);
    const width = this.profile.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    if (width >= 100) Jf(this.chart, this.state, Math.floor(width), Math.max(145, Math.round(width * 0.52)));
  }

  show(state, log, chain = [], dive, notes = []) {
    this.state = state;
    this.evidence.hidden=true;
    this.evidence.replaceChildren();
    this.discovery.hidden=true;this.contact.hidden=false;
    this.msg("");
    this.root.querySelector('[data-n="tm-text"]').classList.add("hidden");
    const lost = state.outcome?.kind === "dead";
    this.shots = lost ? [] : dive.shots ?? [];
    this.scoutingGain = !lost && !this.shots.length ? dive.survey?.routeMarksAdded ?? 0 : 0;
    const target = this.assignment;
    const delivered = !lost && target && dive.finds.includes(target.id);
    const outcome = Au(state, false);
    let title = "Снова на лодке";
    let explanation = "";
    if (lost) {
      title = "Дайвер погиб";
      explanation = outcome.title;
    } else if (state.outcome?.kind === "dcs") {
      title = "Понадобилась помощь";
      explanation = outcome.text;
    } else if (state.outcome?.cesa) {
      title = "Аварийное всплытие";
      explanation = outcome.text;
    } else if (delivered) {
      title = "Задание выполнено";
    } else if (dive.season.newFinds.length) {
      title = "Новые находки на плёнке";
    } else if (this.shots.length) {
      title = "Плёнка на лодке";
    } else if (dive.keptM >= 1) {
      title = "Линия закреплена";
      explanation = "В пещере осталось " + Math.round(dive.keptM) + " м твоей линии. По ней можно вернуться к месту разведки.";
    } else if (this.scoutingGain) {
      title = "Разведан участок старой линии";
    }
    if (!lost && target && !delivered && this.shots.length && !explanation) {
      explanation = "Ориентир «" + target.short + "» ещё предстоит снять.";
    }
    this.heading.textContent = title;
    this.summary.textContent = explanation;
    this.summary.hidden = !explanation;
    const review=surveyReturnReview(state,dive);
    this.returnReview.replaceChildren();this.returnReview.hidden=!review;
    if(review){
      this.returnReview.append(surveyElement('h3',review.title),surveyElement('p',review.text));
      if(review.next)this.returnReview.append(surveyElement('p',review.next,'return-advice'));
    }
    this.renderFrames(dive, lost);
    this.renderGear(dive, lost);
    this.renderRecord(state, log, chain, notes, dive);
    this.next.textContent = this.chapterNote || "";
    this.next.hidden = !this.chapterNote;
    this.root.classList.toggle("dead", lost);
    this.root.classList.remove("hidden");
    this.showJournal(false);
  }

  showEvidence(entries=[],finished=false){
    this.evidence.replaceChildren();this.evidence.hidden=entries.length<2&&!finished;
    if(finished){
      this.evidence.append(surveyElement("small","Последнее свидетельство"),surveyElement("p","Записи и находка у стены теперь на лодке. Можно сопоставить их и подвести итог экспедиции."));
      if(this.state.outcome?.kind==="clean"&&!this.state.outcome?.cesa)this.heading.textContent="Вернулся с ответом";
    }else if(entries.length>1){
      this.evidence.append(surveyElement("h3","Что узнали за этот выход"));
      const list=surveyElement("ul");
      for(const entry of entries.slice(-3)){const item=surveyElement("li");item.append(surveyElement("strong",entry.title),surveyElement("span",entry.source));list.append(item);}
      this.evidence.append(list);
    }
  }

  showDiscovery(debrief){
    this.discovery.replaceChildren(surveyElement('small','Следующий вопрос'),surveyElement('h3',debrief.question));
    this.discovery.hidden=false;
    // Keep a scouting gain below the answer, but hide a bare empty-film message.
    if(debrief.changed&&!this.shots.length&&!this.scoutingGain)this.contact.hidden=true;
    if(debrief.changed&&(this.state.outcome?.kind!=='clean'||this.state.outcome?.cesa))this.discovery.prepend(surveyElement('p',debrief.text));
  }

  renderFrames(dive, lost) {
    this.contact.replaceChildren();
    this.film.replaceChildren();
    this.film.hidden = !this.shots.length;
    this.frameButtons = [];
    if (!this.shots.length) {
      const count = dive.shots?.length ?? 0;
      let text = "Плёнка осталась пустой.";
      if (lost) {
        text = count
          ? "Плёнка потеряна. " + count + " " + Gl(count, ["кадр остался", "кадра остались", "кадров остались"]) + " внизу."
          : "Снимков этого нырка нет.";
      } else if (this.scoutingGain) {
        text = `На карте ещё около ${this.scoutingGain} м знакомой линии. Кружками отмечены границы пройденных участков.`;
      } else if (dive.survey?.kept && dive.survey.added > 0) {
        text += " Разведанный участок появился на карте.";
      }
      this.contact.append(surveyElement("p", text, "result-empty"));
      return;
    }

    this.print = surveyElement("figure", "", "result-print");
    this.preview = surveyElement("button", "", "result-photo");
    this.preview.type = "button";
    this.caption = surveyElement("figcaption", "", "result-print-caption");
    this.fact = surveyElement("p", "", "result-photo-fact");
    this.detail=surveyElement('div','','result-object-detail');
    this.detailArt=surveyElement('figure','','result-detail-art');
    this.detailCanvas=surveyElement('canvas');this.detailCanvas.width=160;this.detailCanvas.height=160;
    this.detailCanvas.setAttribute('role','img');this.detailCanvas.setAttribute('aria-label','Деталь метки: цифры 96 и стёртые знаки под ними');
    this.detailArt.append(this.detailCanvas,surveyElement('figcaption','Деталь метки'));
    this.detail.append(this.detailArt,this.fact);
    this.albumChoices=surveyElement('div','','album-choices');
    this.print.append(this.preview, this.caption, this.detail,this.albumChoices);
    this.contact.append(this.print);

    this.shots.forEach((shot, index) => {
      const item = surveyElement("li");
      const button = surveyElement("button", "", "result-film-frame");
      button.type = "button";
      button.setAttribute("aria-label", "Выбрать кадр " + shot.n +
        (shot.finds.length ? " · " + shot.finds.map(Eu).join(", ") : ""));
      button.addEventListener("click", () => this.selectFrame(index));
      const source = shot.img || shot.big;
      if (source) {
        const image = new Image();
        image.alt = "";
        image.src = source;
        button.append(image);
      } else button.append(surveyElement("span", "Нет изображения", "result-no-image"));
      const label = surveyElement("span", "", "result-film-caption");
      label.append(surveyElement("span", "Кадр " + shot.n, "result-frame-no"));
      for (const id of shot.finds) label.append(surveyElement("span", Eu(id), "result-frame-name"));
      if (!shot.finds.length) label.append(surveyElement("span", surveyShotCaption(shot), "result-frame-name"));
      button.append(label);
      item.append(button);
      this.film.append(item);
      this.frameButtons.push(button);
    });
    this.selectFrame(Math.max(0, this.shots.findIndex(shot => shot.fresh?.length)));
    this.film.scrollLeft = 0;
  }

  selectFrame(index) {
    const shot = this.shots[index];
    if (!shot) return;
    this.selectedFrame = index;
    this.frameButtons.forEach((button, number) => button.setAttribute("aria-pressed", String(number === index)));
    this.preview.dataset.shot = String(index);
    this.preview.setAttribute("aria-label", "Открыть кадр " + shot.n + " крупно");
    const source = shot.big || shot.img;
    this.preview.replaceChildren();
    if (source) {
      const image = new Image();
      image.src = source;
      image.alt = shot.finds.length ? shot.finds.map(Eu).join(", ") : "Подводный снимок";
      this.preview.append(image);
    } else this.preview.append(surveyElement("span", "Изображение не сохранилось", "result-no-image"));
    this.caption.replaceChildren(surveyElement("span", "Кадр " + shot.n + " из " + this.shots.length, "result-print-number"));
    const subjects = surveyElement("span", "", "result-print-subjects");
    for (const id of shot.finds) {
      const name = surveyElement("span", Eu(id));
      if (shot.fresh?.includes(id)) name.append(surveyElement("small", "Впервые"));
      subjects.append(name);
    }
    if (!shot.finds.length) subjects.append(surveyElement("span", surveyShotCaption(shot)));
    this.caption.append(subjects);
    const subject = shot.finds.find(id => shot.fresh?.includes(id)) ?? shot.finds[0];
    this.fact.textContent = subject ? $l(subject)?.fact ?? ""
      : surveyShotExplanation(shot);
    this.fact.hidden = !this.fact.textContent;
    this.detailArt.hidden=subject!=='entry-tag';this.detail.classList.toggle('has-detail',!this.detailArt.hidden);
    if(!this.detailArt.hidden){
      // A clearly labelled object illustration, using the same asset as the
      // cave. The photograph above remains the actual captured frame.
      const ctx=this.detailCanvas.getContext('2d'),find=$l(subject);ctx.clearRect(0,0,160,160);
      drawSurveyArtifact(ctx,{ox:find.x-.65,oy:find.y-.75,zoom:120},null,find);
    }
    renderAlbumChoice(this.albumChoices,shot,this.deliveredFilm,()=>this.onAlbumChange?.());
  }

  renderGear(dive, lost) {
    const lines = dive.gear ?? [];
    const rewards = dive.gearIds?.length
      ? [...new Set(dive.gearIds)].filter(id => id !== "single12")
        .map(id => ({ id, line: Zi.find(gear => gear.id === id)?.line }))
      : lines.map(line => ({ id: Zi.find(gear => gear.line === line)?.id, line }));
    this.gear.replaceChildren();
    this.gear.hidden = lost || !rewards.length;
    if (this.gear.hidden) return;
    this.gear.append(surveyElement("h3", "На лодке приготовили"));
    for (const { id, line } of rewards) {
      const guide = surveyGearGuidance[id];
      if (guide) this.gear.append(surveyElement("h4", guide.label), surveyElement("p", guide.when));
      else if (line) this.gear.append(surveyElement("p", line));
    }
  }

  renderRecord(state, log, chain, notes, dive) {
    this.journalTitle.textContent = "Нырок №" + log.n;
    this.record.replaceChildren();
    if (chain.length) this.record.append(surveyElement("p", chain.join(" → "), "result-cause"));
    for (const note of notes) this.record.append(surveyElement("p", note));
    if (this.shotBar != null && state.outcome?.kind !== "dead") {
      const surface = Math.round(state.tanks.find(tank => tank.id === "back").bar);
      this.record.append(surveyElement("p", "При съёмке цели было " + this.shotBar + " бар. На поверхности — " + surface + " бар."));
    }
    const mapped = Math.round((dive.survey?.added ?? 0) * Ne.CELL_M * Ne.CELL_M);
    if (dive.survey?.kept && mapped > 0) this.record.append(surveyElement("p", "На карте +" + mapped + " м² разведанного."));
    const readings = surveyElement("ul", "", "result-log-entry");
    for (const field of log.line.split(" · ")) readings.append(surveyElement("li", field));
    this.record.append(readings);
    const turningTank = dive.turn?.state === "ok" && dive.turn.tanks.find(tank => tank.id === "back");
    this.turn.hidden = !turningTank;
    if (turningTank) {
      const bar = turningTank.bar.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
      const mark = turningTank.mark.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
      this.turn.textContent = "Разворот при " + bar + " бар. Отметка по плану — " + mark + " бар.";
    }
    this.chart.setAttribute("aria-label", "Профиль глубины за " + me(state.t) +
      ". Максимум " + state.maxDepth.toFixed(1).replace(".", ",") + " м.");
    this.legend.replaceChildren();
    for (const tank of state.tanks) {
      const item = surveyElement("span", tank.id === "deco" ? "EAN50" : Yt[tank.id].label);
      const swatch = surveyElement("i");
      swatch.style.background = Ja[tank.id];
      item.prepend(swatch);
      this.legend.append(item);
    }
    if (state.stats.decoT > 0) this.legend.append(surveyElement("span", "┄ Потолок декомпрессии"));
    if (state.log.some(event => event.type === "gas")) this.legend.append(surveyElement("span", "◆ Смена газа"));
    if (state.log.some(event => ["pickup", "drop", "clip"].includes(event.type))) this.legend.append(surveyElement("span", "◇ Баллон"));
    if (state.log.some(event => event.type === "alarm")) this.legend.append(surveyElement("span", "▼ Тревога"));
    if (state.fail.list.some(failure => failure.warnT >= 0)) this.legend.append(surveyElement("span", "П — подача · Ф — фонарь · Л — линия"));
  }
}
