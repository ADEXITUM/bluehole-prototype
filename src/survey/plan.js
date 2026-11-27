class SurveyPlanScreen extends Wf {
  constructor(...args) {
    super(...args);
    const card = this.root.querySelector(".card");
    const map = this.mapSlot;
    const rule = card.querySelector('[data-sec="rule"]');
    const gear = card.querySelector('[data-sec="gear"]');
    const deck = card.querySelector('[data-sec="deck"]');
    const bottom = card.querySelector('[data-sec="bottom"]');
    const actions = card.querySelector(".pbtns");
    const season = card.querySelector(".season");
    const footer = card.querySelector(".pfoot");
    card.querySelector('[data-sec="help"]').remove();

    this.routeSlot = surveyElement("div");
    this.routeSlot.dataset.surveyRoute = "";
    this.galleryHelp = surveyElement("details", "", "help");
    this.galleryHelp.hidden = true;
    this.galleryHelp.append(surveyElement("summary", upperGalleryHelp.label), surveyElement("p", upperGalleryHelp.answer));
    rule.querySelector("h3").textContent = "Когда повернуть к выходу?";
    this.ruleExample = surveyElement("p", "", "rule-example");
    rule.querySelector('[data-k="rule"]').before(this.ruleExample);
    this.allowance = surveyElement("div", "", "gas-budget");
    rule.querySelector('[data-k="rule"]').after(this.allowance);
    rule.querySelector('[data-n="rule"]').setAttribute("aria-live", "polite");
    this.equipmentUI = new VisualEquipmentStation(this, gear);

    const album = surveyElement("details", "", "help survey-album");
    album.append(surveyElement("summary", "Альбом экспедиции"), season);
    const settings = surveyElement("details", "", "help survey-settings");
    settings.append(surveyElement("summary", "Настройки"), footer);
    footer.querySelector('[data-a="freq"]').closest("label").after(deck);
    const repeat = actions.querySelector('[data-a="repeat"]');
    repeat.textContent = "Нырнуть с сохранённым планом";
    settings.append(repeat);
    const help = surveyElement("section", "", "dock-help");
    this.helpUI=new SurveyHelp(help);
    card.append(this.routeSlot, map, rule, gear, bottom, actions, help, album, settings);

    // Each station has its own page, with the original controls and listeners.
    // The boat shell chooses the page; the plan still owns loadout validation.
    for (const [station, nodes] of Object.entries({
      map: [this.routeSlot, map, this.galleryHelp], gear: [gear, bottom], reserve: [rule],
      album: [album], guide: [help], settings: [settings],
    })) {
      const page = surveyElement("div", "", "station-page");
      page.dataset.stationPage = station;
      page.append(...nodes);
      card.append(page);
    }
    album.open = true;
    settings.open = true;
    actions.hidden = true;
    card.querySelector(".phead").hidden = true;
    const testing = surveyElement("details", "", "dock-testing");
    testing.append(surveyElement("summary", "Проверка прототипа"),
      footer.querySelector('[data-a="diver"]').closest("label"),
      footer.querySelector('[data-a="freq"]').closest("label"), deck,
      footer.querySelector('[data-n="log"]'), footer.querySelector('[data-n="tm"]'),
      footer.querySelector(".ver"));
    settings.append(testing);
    testing.hidden=!he.has("dbg");
    repeat.hidden = true;
    this.resetSlot = surveyElement("div", "", "expedition-reset");
    settings.append(this.resetSlot);
    const restore=surveyElement('button','Вернуть предыдущее прохождение','link');
    restore.hidden=!Me(qt('previous-expedition'));restore.addEventListener('click',()=>showExpeditionReset(true));settings.append(restore);

    this.render();
  }

  render() {
    const focused = document.activeElement?.closest("[data-v],[data-slot]");
    const restore = focused && this.root.contains(focused) ? {
      slot: focused.dataset.slot,
      group: focused.parentElement?.dataset.k,
      value: focused.dataset.v,
    } : null;
    super.render();
    // The base constructor renders once before the dock controls exist.
    if (!this.routeSlot) return;
    this.renderRule();
    if (restore) {
      const selector = restore.slot ? `[data-slot="${restore.slot}"]`
        : `[data-k="${restore.group}"] [data-v="${restore.value}"]`;
      this.root.querySelector(selector)?.focus({ preventScroll: true });
    }
  }

  renderRule() {
    const rule = this.plan.rule;
    const recorded = Number.isFinite(this.lastEntryBar) && this.lastEntryBar > 0;
    const entryBar = recorded ? this.lastEntryBar : 180;
    const exampleBar = Math.round(entryBar);
    const [turnBar, reserveBar] = Rh(entryBar, rule).map(Math.round);
    const legBar = exampleBar - turnBar;
    this.ruleExample.textContent = "Выбери, какую долю газа потратить по пути в пещеру. Остаток нужен для выхода и задержек. " +
      (recorded ? `В прошлый раз у входа было ${exampleBar} бар.` : `Пример для ${exampleBar} бар на входе.`);
    for (const button of this.root.querySelectorAll('[data-k="rule"] button')) {
      const denominator = Number(button.dataset.v);
      button.replaceChildren(
        surveyElement("b", `${exampleBar - Math.round(Rh(entryBar, denominator)[0])} бар`),
        surveyElement("small", `на поиск · 1/${denominator}`),
      );
      button.setAttribute("aria-pressed", String(denominator === rule));
    }
    this.allowance.replaceChildren();
    for (const [name, bar, type] of [
      ["поиск", legBar, "out"], ["выход", turnBar - reserveBar, "home"], ["запас", reserveBar, "spare"],
    ]) {
      const part = surveyElement("span", "", "budget-" + type);
      part.style.flexGrow = String(bar);
      part.append(surveyElement("b", String(bar)), surveyElement("small", name));
      this.allowance.append(part);
    }
    this.root.querySelector('[data-n="rule"]').textContent =
      `Разворот ≈ ${turnBar} бар. Первую отметку на шкале газа прибор поставит по давлению при входе под свод.`;
  }

  renderLoadout() {
    if (!this.equipmentUI) return super.renderLoadout();
    this.root.querySelector('[data-sec="gear"]').classList.remove("hidden");
    this.root.querySelector('[data-sec="bottom"]').classList.add("hidden");
    this.equipmentUI.render();
  }

  // Boat instructions now live directly on the controls. Progress a legacy
  // instructor card only when the player actually uses its corresponding choice.
  showTip(tip, onRead) {
    const controls = {
      planBoat: '[data-a="dive"],[data-a="repeat"],[data-survey-route] button,[data-v],[data-slot]',
      planThirds: '[data-k="rule"] button',
      planTanks: '[data-k="back"] button,[data-slot]',
    };
    this.pendingAdvice = { selector: controls[tip.id], onRead };
  }

  setTips(enabled, seen, total) {
    super.setTips(enabled, seen, total);
    if (!enabled) this.pendingAdvice = null;
  }

  click(event) {
    const button = event.target.closest("button");
    if(button?.dataset.a==="season-reset"){showExpeditionReset();return;}
    if (button?.closest(".equipment-station")) return;
    if (button?.dataset.slot) {
      this.lastSlot = this.plan.slots.includes(button.dataset.slot) ? null : button.dataset.slot;
    }
    const advice = this.pendingAdvice;
    if (advice?.selector && button?.matches(advice.selector)) {
      this.pendingAdvice = null;
      advice.onRead();
    }
    super.click(event);
  }

  setPlan(plan) {
    this.lastSlot = null;
    super.setPlan(plan);
  }

  setSeason(season) {
    this.seasonArmed = 0;
    const album = this.root.querySelector(".survey-album");
    const content = album.querySelector(".season");
    const count = season.found.length;
    album.querySelector("summary").textContent = count
      ? "Альбом · " + count + " " + Gl(count, ["находка", "находки", "находок"])
      : "Альбом экспедиции";
    content.replaceChildren();
    if (count) {
      const frames = ji().frames;
      const gallery = surveyElement("div", "", "dock-album-grid");
      for (const id of season.found) {
        const button = surveyElement("button");
        button.dataset.album = id;
        if (frames[id]) {
          const image = new Image();
          image.src = frames[id];
          image.alt = "";
          button.append(image);
        }
        button.append(surveyElement("span", Eu(id)));
        gallery.append(button);
      }
      content.append(gallery);
    } else content.append(surveyElement("p", "Здесь появятся находки, которые ты привезёшь со съёмки.", "note"));
    if(readDeliveredFilm()){
      const film=surveyElement('button','Привезённая плёнка · выбрать снимки','saved-film-open');
      film.type='button';film.addEventListener('click',()=>openDeliveredFilm(()=>this.setSeason(Bn())));content.append(film);
    }
    const reset = surveyElement("button", "Начать экспедицию заново", "link");
    reset.dataset.a = "season-reset";
    (this.resetSlot ?? content).replaceChildren(reset);
  }

  show() {
    super.show();
    const saved = Me(qt("expedition"));
    const notes = eo().notes;
    this.galleryHelp.open = false;
    this.galleryHelp.hidden = saved?.chapterId !== "survey" || notes.includes("n3") || Bn().found.includes("cache") ||
      !(notes.includes("n2") || saved.observed?.includes("cache"));
    this.root.scrollTop = 0;
  }
}
