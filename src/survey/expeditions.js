const lastExpeditionKey = 'bluehole-photo-survey:last-expedition';
const iceProgressKey = 'bluehole-photo-survey:ice:progress';

class SurveyExpeditions {
  constructor(boat) {
    this.boat = boat;
    this.root = surveyElement('section', '', 'exp-library exp-paper');
    this.root.hidden = true;
    this.root.setAttribute('aria-label', 'Экспедиции');
    this.iceHost = surveyElement('section');
    this.iceHost.id = 'ice-expedition';
    this.iceHost.hidden = true;
    this.saveNotice = surveyElement('p', '', 'ice-save-notice');
    this.saveNotice.hidden = true;
    this.saveNotice.setAttribute('role', 'status');
    boat.root.append(this.root, this.iceHost);
  }

  get lastWasIce() {
    return Me(lastExpeditionKey) === 'ice';
  }

  open(id) {
    if (id === 'ice') {
      this.openIce();
      return;
    }
    de(lastExpeditionKey, 'hub');
    const {game} = this.boat;
    if (game.session?.available(game.world)) this.boat.resumeDive();
    else this.boat.enterChapter();
  }

  openIce() {
    if (this.ice) return;
    const boat = this.boat;
    const progress = this.transientIce ?? Me(iceProgressKey) ?? {};
    let revision = progress.revision ?? 0;
    let saveError = false;
    boat.game.mode = 'plan';
    boat.setScreen('ice');
    boat.surface.stop();
    de(lastExpeditionKey, 'ice');
    this.iceHost.append(this.saveNotice);

    const onSave = snapshot => {
      if (saveError) return false;
      try {
        const stored = Me(iceProgressKey);
        if ((stored?.revision ?? 0) !== revision) throw new Error('conflict');
        const next = {...snapshot, completed: !!(stored?.completed || snapshot.completed), revision: revision + 1};
        try {
          localStorage.setItem(iceProgressKey, JSON.stringify(next));
        } catch {
          this.transientIce = {...next, revision};
          this.saveNotice.textContent = 'Выход сохранён в этой вкладке. Запись на устройство будет повторена.';
          this.saveNotice.hidden = false;
          return false;
        }
        revision = next.revision;
        this.transientIce = null;
        this.saveNotice.hidden = true;
        return true;
      } catch (error) {
        saveError = true;
        this.transientIce = null;
        this.saveNotice.hidden = true;
        // Leave the last successful checkpoint intact. Destroy after the current
        // game handler finishes so its final render cannot cover the error.
        queueMicrotask(() => {
          this.show();
          const message = error.message === 'conflict'
            ? 'Другая вкладка обновила подлёдную экспедицию. Открой её снова, чтобы продолжить сохранённый выход.'
            : 'Не удалось сохранить подлёдный выход. Последнее успешное сохранение можно продолжить из экспедиций.';
          const alert = surveyElement('p', message);
          alert.setAttribute('role', 'alert');
          this.root.prepend(alert);
        });
        return false;
      }
    };
    this.ice = new IceDive({host: this.iceHost, progress, onSave, onExit: () => this.show()});
    this.ice.start();
  }

  show() {
    if (this.ice) {
      this.ice.destroy();
      this.ice = null;
      this.iceHost.replaceChildren();
    }
    this.boat.game.mode = 'plan';
    this.boat.setScreen('expeditions');
    this.root.replaceChildren();
    const header = surveyElement('header', '', 'station-header');
    const title = surveyElement('h2', 'Экспедиции');
    title.tabIndex = -1;
    const back = surveyElement('button', '×');
    back.setAttribute('aria-label', 'В главное меню');
    back.addEventListener('click', () => this.boat.showMenu());
    header.append(title, back);
    this.root.append(header);
    const hub = this.boat.progress;
    const season = Bn();
    const checkpoint = this.boat.game.session?.available(this.boat.game.world);
    const hubStarted = checkpoint || season.dives > 0 || hub.hasSeenIntro();
    const hubStatus = checkpoint ? 'Сохранён нырок под водой'
      : hub.isFinished ? 'Установлен последний маршрут пропавшего дайвера'
      : hubStarted ? hub.intention(hub.nextPlan().id).title : 'Первая разведка у буя';
    const record = Me(qt('field-record')) ?? hub.journal().slice(1).at(-1);
    this.addCard('hub', 'Блю-хол', 'Старая линия уходит под камень. Выясни, куда она вела.', hubStatus, hubStarted, record?.text);
    const ice = this.transientIce ?? Me(iceProgressKey);
    this.addCard('ice', 'Подо льдом', 'Под ледяной крышей обратно на поверхность ведёт одна майна.', this.iceStatus(ice), !!ice, ice?.fieldRecord);
    if (this.transientIce) this.root.append(this.saveNotice);
    title.focus({preventScroll: true});
  }

  iceStatus(ice) {
    if (['diving', 'paused'].includes(ice?.dive?.phase)) return 'Сохранён нырок подо льдом';
    if (ice?.dive?.phase === 'lost') return 'У майны · подготовиться к повторному выходу';
    if (ice?.completed && ice.westRecovered) return 'Обе записи в архиве полярного поста';
    if (ice?.westRecovered) return 'Гидрофон доставлен · на востоке остался самописец';
    if (ice?.completed) return 'Работа на востоке завершена · на западе доступен гидрофон';
    if (ice?.charted) return 'Пеленг доставлен · доступна катушка';
    return 'Первый выход под лёд';
  }

  addCard(id, name, premise, status, started, fieldRecord) {
    const card = surveyElement('article', '', 'expedition-card');
    card.dataset.place = id;
    const art = surveyElement('div', '', 'expedition-map-art');
    art.dataset.place = id;
    art.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 3; i++) art.append(surveyElement('i'));
    const enter = surveyElement('button', started ? 'Продолжить' : 'Начать', 'exp-primary');
    enter.dataset.enter = id;
    enter.setAttribute('aria-label', enter.textContent + ' · ' + name);
    enter.addEventListener('click', () => this.open(id));
    card.append(art, surveyElement('h3', name), surveyElement('p', premise));
    if (typeof fieldRecord === 'string' && fieldRecord) {
      card.append(surveyElement('p', fieldRecord, 'library-record'));
    }
    card.append(surveyElement('p', status, 'library-status'), enter);
    this.root.append(card);
  }
}
