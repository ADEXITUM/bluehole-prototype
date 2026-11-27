// The surface journey is separate from the simulation and from chapter content.
// Stations reuse the live map, loadout and album, so there is one source of truth.
class ExpeditionBoat {
  constructor(game) {
    this.game = game;
    this.progress = game.expedition;
    this.screen = "menu";
    this.busy = false;
    this.surfaceHintSeen = !!Me(qt("boat-objects-seen"));
    this.root = surveyElement("main", "", "expedition");
    this.root.id = "expedition";
    this.root.innerHTML = `
      <canvas class="boat-scene" aria-hidden="true"></canvas>
      <div class="boat-shade" aria-hidden="true"></div>
      <section class="exp-menu" aria-labelledby="exp-title">
        <p class="exp-eyebrow">Подводные экспедиции · ${ho.STAGE}</p>
        <h1 id="exp-title">БЛЮ-ХОЛ</h1>
        <p class="exp-premise">Старая линия уходит под камень.<br>Узнай, куда она ведёт. Вернись и расскажи.</p>
        <nav class="exp-menu-actions" aria-label="Главное меню">
          <button data-boat="continue" class="exp-primary">Начать Блю-хол</button>
          <button data-boat="abandon-dive" hidden>Вернуться на лодку</button>
          <button data-boat="expeditions"><span>Выбрать экспедицию<small>Блю-хол · Подо льдом</small></span><span aria-hidden="true">↗</span></button>
          <button data-boat="chapters">Журнал и планы <span aria-hidden="true">↗</span></button>
          <button data-boat="guide">Управление <span>↗</span></button>
          <button data-boat="settings">Настройки <span>↗</span></button>
        </nav>
        <p class="exp-resume"></p>
      </section>
      <section class="boat-home" hidden aria-label="На лодке">
        <header class="boat-top"><button data-boat="menu" class="boat-menu-button" aria-label="Меню">☰</button><button data-boat="chapters" class="boat-chapter"></button></header>
        <nav class="boat-objects" aria-label="Предметы на лодке">
          <button class="boat-object object-album" data-boat="album" aria-label="Открыть альбом"><i aria-hidden="true"></i><span aria-hidden="true">Альбом</span></button>
          <button class="boat-object object-map" data-boat="map" aria-label="Развернуть карту на столе"><i aria-hidden="true"></i><span aria-hidden="true">Карта</span></button>
          <button class="boat-object object-gear" data-boat="gear" aria-label="Осмотреть снаряжение"><i aria-hidden="true"></i><span aria-hidden="true">Снаряжение</span></button>
        </nav>
        <p class="boat-touch-hint">Коснись карты, баллонов или альбома</p>
        <footer class="boat-launch"><div><p class="boat-task"></p><button data-boat="next" class="boat-next" hidden>Обсудить находки →</button></div><button data-boat="dive" class="exp-primary">Нырнуть <span>↘</span></button></footer>
      </section>
      <section class="exp-chapters exp-paper" hidden aria-labelledby="chapter-title">
        <header class="station-header"><div><p class="exp-eyebrow">Полевой дневник</p><h2 id="chapter-title" tabindex="-1">Журнал Блю-хола</h2></div><button data-boat="close" aria-label="Закрыть журнал">×</button></header>
        <section class="journal-question"></section>
        <h3 class="journal-label journal-plans-title">Планы погружений</h3>
        <div class="chapter-list"></div>
        <h3 class="journal-label">Привезённые свидетельства</h3>
        <div class="journal-evidence"></div>
        <p class="chapter-foot"></p>
      </section>
      <section class="exp-story" hidden aria-labelledby="story-title">
        <p class="exp-eyebrow story-number"></p><h2 id="story-title" tabindex="-1"></h2>
        <p class="story-speaker"></p><p class="story-text"></p><div class="story-actions"><button data-boat="story-next" class="exp-primary">Дальше →</button><button data-boat="story-skip">К карте</button></div><p class="story-count"></p>
      </section>
      <section class="boat-station exp-paper" hidden aria-labelledby="station-title">
        <header class="station-header"><div><p class="exp-eyebrow station-kicker">На лодке</p><h2 id="station-title" tabindex="-1"></h2></div><button data-boat="close" aria-label="Закрыть и вернуться">×</button></header>
        <nav class="station-tabs" aria-label="Предметы на столе"><button data-boat="map">Карта</button><button data-boat="gear">Комплект</button><button data-boat="album">Альбом</button></nav>
        <div class="station-content"></div>
        <footer class="station-footer"><button data-boat="close" class="station-back">← На лодку</button><button data-boat="dive" class="exp-primary">Нырнуть ↘</button></footer>
      </section>`;
    document.body.append(this.root);
    this.transition = new DiveTransition(game, this);
    this.preflight = new SurveyPreflight(this);
    this.ending = new SurveyEnding(this);
    this.library = new SurveyExpeditions(this);
    for (const name of ["menu", "chapters", "story"]) this[name + "El"] = this.root.querySelector(".exp-" + name);
    this.homeEl = this.root.querySelector(".boat-home");
    this.homeEl.tabIndex = -1;
    this.stationEl = this.root.querySelector(".boat-station");
    this.root.querySelector(".station-content").append(game.planScreen.root);
    this.root.append(game.resultScreen.root);
    this.surface = new SurfaceScene(this.root.querySelector(".boat-scene"), anchors => {
      for (const [id,point] of Object.entries(anchors)) {
        const button = this.root.querySelector(".object-"+id);
        button.style.left = point.x+"px";
        button.style.top = point.y+"px";
        button.style.width = point.width+"px";
        button.style.height = point.height+"px";
      }
    });
    this.root.addEventListener("pointermove", event => {
      this.surface.pointer = {x:event.clientX/window.innerWidth-.5,y:event.clientY/window.innerHeight-.5};
    });
    this.root.addEventListener("click", event => {
      const button = event.target.closest("[data-boat]");
      if (button && !button.disabled) this.act(button.dataset.boat);
    });
    window.addEventListener("keydown", event => {
      if (event.key !== "Escape" || this.root.hidden || this.busy || this.game.boatMap.isOpen || document.querySelector("dialog[open]")) return;
      if (this.screen === "station" && this.stationEl.dataset.station === "gear" && this.game.planScreen.equipmentUI?.closeInfo()) return;
      if (this.screen === "briefing") this.showBoat();
      else if (this.screen === "station" || this.screen === "chapters") this.close();
      else if (this.screen === "expeditions") this.showMenu();
      else if (this.screen === "boat") this.showMenu();
    }, true);
    this.showMenu();
  }

  setScreen(name) {
    this.preflight?.cancelTimer();
    if (name !== "plunge") this.transition?.cancel();
    this.root.hidden = false;
    this.screen = name;
    this.root.dataset.screen = name;
    this.root.dataset.light = this.progress.activeChapter.surface?.light ?? "day";
    this.game.frameEl.inert = true;
    this.game.input.enabled = false;
    this.game.input.reset();
    for (const [key, element] of Object.entries({menu: this.menuEl, boat: this.homeEl,
      chapters: this.chaptersEl, story: this.storyEl, station: this.stationEl, briefing:this.preflight?.root, ending:this.ending?.root, expeditions:this.library?.root, ice:this.library?.iceHost})) if(element)element.hidden = key !== name;
    this.game.planScreen.hide();
    this.game.resultScreen.hide();
    this.root.scrollTop = 0;
    this.surface?.setEnvironment(this.progress.activeChapter.surface);
    this.surface?.setView(name);
  }

  act(action) {
    if (this.busy) return;
    if (this.screen === "boat" && ["map","gear","album"].includes(action)) {
      this.surfaceHintSeen = true;
      de(qt("boat-objects-seen"),true);
    }
    if (action === "continue") this.library.open(this.library.lastWasIce ? "ice" : "hub");
    else if(action==='abandon-dive')this.abandonSavedDive();
    else if (action === "menu") this.showMenu();
    else if (action === "chapters") this.showChapters();
    else if (action === "expeditions") this.showExpeditions();
    else if (action === "close") this.close();
    else if (action === "dive") this.dive();
    else if (action === "story-next") this.nextStory();
    else if (action === "story-skip") this.endStory();
    else if (action === "next") {
      const next = expeditionChapters.find(chapter => this.progress.canEnter(chapter.id) && !this.progress.isComplete(chapter.id));
      if (next && this.progress.select(next.id)) { this.game.updateAssignment(); this.enterChapter(); }
    } else this.openStation(action);
  }

  showMenu() {
    this.setScreen("menu");
    this.root.querySelector(".exp-premise").textContent = this.library?.lastWasIce
      ? "Подо льдом остались приборы зимнего акустического поста."
      : "Старая линия уходит под камень. Узнай, куда она ведёт. Вернись и расскажи.";
    const hasProgress = Bn().dives > 0 || this.progress.hasSeenIntro();
    this.root.querySelector('[data-boat="continue"]').textContent = hasProgress ? "Продолжить экспедицию · Блю-хол" : "Начать Блю-хол";
    const chapter = this.progress.activeChapter;
    const place=this.game.firstDive?.active?"У спуска":chapter.title;
    this.root.querySelector(".exp-resume").textContent = hasProgress ? `Блю-хол · ${place}` : "Исследование пещеры · фотографии · путь обратно";
    if(this.game.session?.interrupted)this.root.querySelector(".exp-resume").textContent="Последний нырок прерван. Продолжение — с подготовки на лодке. Прежние находки сохранены; недоставленные кадры и линия не засчитаны.";
    else if(this.progress.isFinished)this.root.querySelector(".exp-resume").textContent="История завершена · альбом и свободное исследование";
    const pending=this.game.session?.available(this.game.world);
    this.root.querySelector('[data-boat="abandon-dive"]').hidden=!pending;
    if(pending){
      const finished=this.game.session.saved.snapshot.state.phase==='end';
      this.root.querySelector('[data-boat="continue"]').textContent=finished?'Открыть итог нырка':'Продолжить погружение';
      this.root.querySelector('[data-boat="abandon-dive"]').hidden=finished;
      this.root.querySelector('.exp-resume').textContent=finished?'Нырок завершён. Осталось открыть итог.':'Сохранённый нырок. Продолжение откроется на паузе; газ и время не изменятся.';
    }else if(this.game.session?.saved?.snapshot&&this.game.session.interrupted){
      this.root.querySelector('.exp-resume').textContent='Этот нырок сохранён в несовместимом или повреждённом формате. Прежние находки на лодке сохранены; продолжение — с подготовки.';
    }
    if (this.library?.lastWasIce) {
      this.root.querySelector('[data-boat="continue"]').textContent = "Продолжить · Подо льдом";
      this.root.querySelector('[data-boat="abandon-dive"]').hidden = true;
      const ice = Me(iceProgressKey);
      this.root.querySelector('.exp-resume').textContent = pending ? "Нырок в Блю-холе сохранён отдельно." : ice?.fieldRecord ?? "";
    }
  }

  resumeDive(){
    try{if(this.game.session.resume(this.game))return;}
    catch{showDiveStorageProblem(()=>window.location.reload(),'Не удалось открыть сохранённый нырок. Он оставлен без изменений; повторная загрузка позволит попробовать снова.');return;}
    showDiveStorageProblem(()=>this.resumeDive(),'Не удалось открыть сохранённый нырок. Проверь доступность хранилища браузера и повтори попытку.');
  }
  abandonSavedDive(){
    const dialog=surveyElement('dialog','','save-dialog');dialog.setAttribute('aria-label','Прервать сохранённый нырок');
    dialog.append(surveyElement('h2','Вернуться на лодку?'),surveyElement('p','Сохранённый нырок будет прерван. Его новые кадры, записи и линия не будут доставлены; прежние находки останутся.'));
    const stay=surveyElement('button','Остаться в нырке','exp-primary');stay.addEventListener('click',()=>{dialog.close();this.resumeDive();});
    const leave=surveyElement('button','Прервать и вернуться');leave.addEventListener('click',()=>{
      if(!this.game.session.discard()){dialog.append(surveyElement('p','Не удалось записать прерывание. Сохранённый нырок оставлен.'));return;}
      dialog.close();this.showBoat();
    });
    dialog.append(stay,leave);dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();stay.focus();
  }

  showBoat() {
    this.setScreen("boat");
    this.refresh();
    this.root.querySelector(".boat-touch-hint").hidden = this.surfaceHintSeen;
    this.homeEl.focus?.({preventScroll: true});
  }

  refresh() {
    const chapter = this.progress.activeChapter;
    if(this.game.firstDive?.active){
      this.root.querySelector(".boat-chapter").replaceChildren(surveyElement("small","Блю-хол · журнал и планы"),surveyElement("span","У спуска"));
      this.root.querySelector(".boat-task").textContent="Сфотографировать жёлтую метку под буем";
      this.root.querySelector(".boat-next").hidden=true;return;
    }
    this.root.querySelector(".boat-chapter").replaceChildren(surveyElement("small","Блю-хол · журнал и планы"),surveyElement("span",chapter.title));
    const next=this.progress.nextPlan();
    const intent=this.progress.intention();
    this.root.querySelector(".boat-task").textContent=intent.question??intent.title;
    this.root.querySelector(".boat-next").hidden=!this.progress.isComplete(chapter.id)||this.progress.isFinished||next.id===chapter.id;
  }

  enterChapter() {
    if (this.library) de(lastExpeditionKey, 'hub');
    this.game.updateAssignment();
    if(this.progress.isFinished&&!this.progress.endingReviewed){this.showEnding();return;}
    if (this.progress.hasSeenIntro()) this.showBoat();
    else { this.storyStep = 0; this.setScreen("story"); this.renderStory(); }
  }
  showEnding(){this.ending.show();}
  showExpeditions(){this.library.show();}

  renderStory() {
    const chapter = this.progress.activeChapter;
    const intro=this.game.firstDive?.active?firstDiveIntro:chapter.intro;
    const beat = intro[this.storyStep];
    this.root.querySelector(".story-number").textContent = "Блю-хол · на лодке";
    this.root.querySelector("#story-title").textContent = this.game.firstDive?.active?"У спуска":chapter.title;
    this.root.querySelector(".story-speaker").textContent = beat.speaker;
    this.root.querySelector(".story-text").textContent = beat.text;
    this.root.querySelector(".story-count").textContent = `${this.storyStep + 1} / ${intro.length}`;
    this.root.querySelector('[data-boat="story-next"]').textContent = this.storyStep + 1 === intro.length ? this.game.firstDive?.active?"К погружению →":"Развернуть карту →" : "Дальше →";
    this.root.querySelector('[data-boat="story-skip"]').hidden = this.storyStep + 1 === intro.length;
    this.root.querySelector('[data-boat="story-skip"]').textContent=this.game.firstDive?.active?"На лодку":"К карте";
    this.root.querySelector("#story-title").focus({preventScroll:true});
  }

  nextStory() {
    const intro=this.game.firstDive?.active?firstDiveIntro:this.progress.activeChapter.intro;
    if (++this.storyStep < intro.length) this.renderStory();
    else this.endStory();
  }

  endStory() {
    this.progress.markIntroSeen();
    if(this.game.firstDive?.active)this.showBoat();
    else this.openStation("map", "boat");
  }

  showChapters() {
    this.returnTo = this.screen === "menu" ? "menu" : "boat";
    this.setScreen("chapters");
    const intent=this.progress.intention(this.progress.nextPlan().id);
    const question=this.root.querySelector(".journal-question");
    question.replaceChildren(surveyElement("small",this.progress.isFinished?"Итог экспедиции":"Следующий вопрос"),surveyElement("h3",this.game.firstDive?.active?"Освоиться под буем":intent.question??intent.title),surveyElement("p",this.game.firstDive?.active?"Первый снимок поможет освоиться с камерой. Метка находится под буем, на 6 м.":intent.why));
    if(this.progress.isFinished){const ending=surveyElement('button','Перечитать итог','journal-more');ending.addEventListener('click',()=>this.showEnding());question.append(ending);}
    const list = this.root.querySelector(".chapter-list");
    list.replaceChildren();
    const availablePlans=expeditionChapters.filter(chapter=>this.progress.canEnter(chapter.id));
    this.root.querySelector(".journal-plans-title").textContent=`Открытые планы · ${availablePlans.length} из ${expeditionChapters.length}`;
    for (const chapter of availablePlans) {
      const complete = this.progress.isComplete(chapter.id);
      const button = surveyElement("button", "", "chapter-card");
      button.type = "button";
      button.setAttribute("aria-current", chapter.id === this.progress.chapterId ? "step" : "false");
      button.append(surveyElement("span", complete ? "✓" : "○", "chapter-index"));
      const copy = surveyElement("span", "", "chapter-copy");
      copy.append(surveyElement("strong", chapter.title));
      copy.append(surveyElement("span", this.progress.intention(chapter.id).title));
      copy.append(surveyElement("small", complete ? "Вернуться на знакомый маршрут" : chapter.id===this.progress.chapterId?"Текущий план · открыть":"Выбрать этот план"));
      button.append(copy, surveyElement("span", "↗", "chapter-arrow"));
      button.addEventListener("click", () => {
        if (this.progress.select(chapter.id)) { this.game.updateAssignment(); this.enterChapter(); }
      });
      list.append(button);
    }
    const evidence=this.root.querySelector(".journal-evidence"),entries=this.progress.journal().slice().reverse();
    let shown=3;
    const renderEntries=()=>{
      evidence.replaceChildren();
      for(const entry of entries.slice(0,shown)){
        const card=surveyElement("article","","journal-entry");
        card.append(surveyElement("small",entry.source),surveyElement("h4",entry.title),surveyElement("p",entry.text));evidence.append(card);
      }
      if(shown<entries.length){const more=surveyElement("button",`Ранние записи · ещё ${entries.length-shown}`,"journal-more");more.addEventListener("click",()=>{shown+=3;renderEntries();});evidence.append(more);}
    };renderEntries();
    this.root.querySelector(".chapter-foot").textContent = "Планы помогают подготовиться. Пещера открыта для исследования; прежние снимки, записи и маршруты сохраняются.";
    this.root.querySelector("#chapter-title").focus({preventScroll:true});
  }

  openStation(station, returnTo) {
    const titles = {map:"Карта погружения", gear:"Твой комплект", reserve:"План возвращения", album:"Альбом экспедиции", guide:"Под водой", settings:"Настройки"};
    if (!titles[station]) return;
    this.returnTo = returnTo ?? (this.screen === "menu" || this.screen === "station" && this.returnTo === "menu" ? "menu" : "boat");
    this.setScreen("station");
    this.stationEl.dataset.station = station;
    this.surface.setView("station",station);
    this.root.querySelector("#station-title").textContent = titles[station];
    this.root.querySelector(".station-kicker").textContent = station === "map" ? this.progress.activeChapter.title : "На лодке";
    this.root.querySelector(".station-tabs").hidden = ["settings", "guide"].includes(station);
    for (const button of this.root.querySelectorAll(".station-tabs button")) button.setAttribute("aria-current", String(button.dataset.boat === station));
    for (const page of this.game.planScreen.root.querySelectorAll("[data-station-page]")) page.hidden = page.dataset.stationPage !== station;
    this.game.planScreen.show();
    this.root.querySelector(".station-footer [data-boat=dive]").hidden = ["settings", "guide", "album"].includes(station);
    this.root.querySelector(".station-back").textContent = this.returnTo === "menu" ? "← В меню" : "← На лодку";
    this.root.querySelector("#station-title").focus({preventScroll:true});
    requestAnimationFrame(() => this.game.boatMap.refresh());
  }

  close() {
    if (this.returnTo === "menu") this.showMenu();
    else this.showBoat();
  }

  dive() {
    if (this.busy || this.game.mode !== "plan") return;
    if(this.game.session?.interrupted&&this.game.session.available(this.game.world)){this.abandonSavedDive();return;}
    if(this.preflight?.open())return;
    this.busy = true;
    this.progress.markIntroSeen();
    this.setScreen("plunge");
    this.transition.begin(this.game.planScreen.current);
  }

  hide() {
    this.busy = !!this.transition?.active;
    this.root.hidden = true;
    this.surface.stop();
    this.game.frameEl.inert = this.busy;
  }

  showResult() {
    this.setScreen("result");
    this.game.resultScreen.root.classList.remove("hidden");
    this.game.resultScreen.heading.focus({preventScroll:true});
  }
}
