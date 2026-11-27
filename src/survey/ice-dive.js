// Autonomous shelf transect. Distances are in game metres, depth increases down.
;(() => {
  const lead = {x: 0, y: 0, name: 'Майна'};
  const relay = {x: 18, y: 6, name: 'Репер'};
  const recorder = {x: 48, y: 14, name: 'Самописец'};
  const drum = {x:0,y:3.2,name:'Барабан майны'};
  const hydrophone = {x:-22,y:9,name:'Западный гидрофон'};
  const routes = {east:{left:-7,right:57}, west:{left:-27,right:3}};
  const range = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const leadWidth = 2.4;
  const tank = 130;
  const reelLength = 32;
  const pointSpacing = .45;
  const phases = ['brief', 'diving', 'paused', 'surfaced', 'lost'];
  const roof = [[-30,4.5],[-23,5.2],[-19,5.6],[-16,8.8],[-13,10.1],[-11,9.6],[-9,5],[-7,2.02],[-5,2],[-2.4,1.3],[2.4,1.3],[9,2.1],[16,1.7],[22,2.6],
    [26,3.2],[29,6.8],[30,6.3],[33,10.6],[35,8.4],[36,9],[39,3.4],[46,2],[58,3.1],[68,2.8]];
  function iceDepth(x) {
    if (Math.abs(x) < leadWidth) return 0;
    for (let i = 1; i < roof.length; i++) {
      const [right, y] = roof[i];
      if (x <= right) {
        const [left, start] = roof[i - 1];
        return start + (y - start) * clamp((x - left) / (right - left), 0, 1);
      }
    }
    return roof[roof.length - 1][1];
  }
  const bed = x => 17.1 + 1.4 * Math.sin(x * .13) + .6 * Math.cos(x * .24);
  const emptyLine = () => ({mode:'packed', points:[], used:0, cursor:0});
  const fresh = (tool = 'sounder', route = 'east') => ({
    phase: 'brief', route, x: 0, y: 3.2, vx: 0, vy: 0, facing: route === 'west' ? -1 : 1, gas: tank, elapsed: 0,
    fast: false, pings: tool === 'sounder' ? 3 : 0, pulse: 0, reading: false, cargo: false,
    tool, ...(tool === 'reel' ? {line:emptyLine()} : {})
  });
  function restoreLine(raw, route) {
    const line = emptyLine();
    if (!['laying','full','return','home',...(route === 'west' ? ['haul'] : [])].includes(raw?.mode) ||
        !Array.isArray(raw.points) || !raw.points.length || raw.points.length > 2 + reelLength / pointSpacing) return line;
    for (const p of raw.points) {
      if (!Number.isFinite(p?.x) || !Number.isFinite(p?.y) || p.x < routes[route].left || p.x > routes[route].right ||
          p.y < iceDepth(p.x) || p.y > bed(p.x)) return emptyLine();
      if (line.points.length) line.used += range(line.points.at(-1), p);
      line.points.push({x:p.x, y:p.y});
    }
    if (line.used > reelLength + .001) return emptyLine();
    line.used = Math.min(line.used, reelLength);
    line.mode = raw.mode;
    line.cursor = Number.isInteger(raw.cursor) ? clamp(raw.cursor, 0, line.points.length - 1) : line.points.length - 1;
    return line;
  }
  function onLine(line, metres) {
    let previous = line.points[0];
    for (let i=1; i<line.points.length; i++) {
      const next = line.points[i], length = range(previous,next);
      if (length > 0 && metres <= length) {
        const t = metres / length;
        return {x:previous.x+(next.x-previous.x)*t, y:previous.y+(next.y-previous.y)*t};
      }
      metres -= length;
      previous = next;
    }
    return previous;
  }
  function restore(raw, unlocked) {
    const route = unlocked && raw?.route === 'west' ? 'west' : 'east';
    const d = fresh(unlocked && (raw?.tool === 'reel' || route === 'west') ? 'reel' : 'sounder',route);
    if (!raw || !phases.includes(raw.phase) || raw.phase === 'brief') return d;
    for (const key of ['x','y','vx','vy','gas','elapsed','pulse','pings']) {
      if (!Number.isFinite(raw[key])) return d;
    }
    d.x = clamp(raw.x, routes[route].left, routes[route].right);
    d.y = clamp(raw.y, iceDepth(d.x) + .4, bed(d.x) - .45);
    d.vx = clamp(raw.vx, -5, 5);
    d.vy = clamp(raw.vy, -5, 5);
    d.facing = raw.facing === -1 ? -1 : 1;
    d.gas = clamp(raw.gas, 0, tank);
    d.elapsed = Math.max(0, raw.elapsed);
    d.pings = clamp(Math.floor(raw.pings), 0, 3);
    d.pulse = clamp(raw.pulse, 0, 7);
    if (d.tool === 'reel') {
      d.pings = 0;
      d.pulse = 0;
      d.line = restoreLine(raw.line,route);
      if (d.line.mode === 'haul') {
        if (range(d.line.points[0],drum)<.01 && range(d.line.points.at(-1),hydrophone)<.01 &&
            Number.isFinite(raw.pod?.at) && Number.isFinite(raw.pod?.to)) {
          const at = clamp(raw.pod.at,0,d.line.used);
          d.pod = {at,to:clamp(raw.pod.to,0,at)};
        } else d.line = emptyLine();
      }
    }
    d.fast = raw.fast === true;
    for (const key of ['reading','cargo']) d[key] = route === 'east' && raw[key] === true;
    d.phase = raw.phase === 'diving' ? 'paused' : raw.phase;
    if (!d.gas && d.phase === 'paused') d.phase = 'lost';
    return d;
  }
  const moves = {ArrowLeft:'left', KeyA:'left', ArrowRight:'right', KeyD:'right',
    ArrowUp:'up', KeyW:'up', ArrowDown:'down', KeyS:'down'};
  const duration = t => Math.floor(t / 60) + ' мин ' + Math.floor(t % 60) + ' с';

  class IceDive {
    constructor({host, progress = {}, onSave = () => {}, onExit = () => {}}) {
      this.host = host;
      this.onSave = onSave;
      this.onExit = onExit;
      this.completed = progress?.completed === true;
      this.charted = progress?.charted === true;
      this.westRecovered = progress?.westRecovered === true;
      this.selectedTool = this.reelUnlocked && progress?.selectedTool === 'reel' ? 'reel' : 'sounder';
      this.fieldRecord = this.reelUnlocked && typeof progress?.fieldRecord === 'string' ? progress.fieldRecord : '';
      this.dive = restore(progress?.version === 1 && progress.dive, this.reelUnlocked);
      this.keys = new Map();
      this.pointers = new Map();
      this.untilSave = 1;
      this.message = '';
      this.messageUntil = 0;
    }
    get reelUnlocked() { return this.charted || this.completed || this.westRecovered; }
    save() {
      const dive = {...this.dive};
      if (dive.line) dive.line = {...dive.line, points:dive.line.points.map(p => ({...p}))};
      if (dive.pod) dive.pod = {...dive.pod};
      const snapshot = {version:1, completed:this.completed, charted:this.charted, westRecovered:this.westRecovered, selectedTool:this.selectedTool, dive};
      if (this.fieldRecord) snapshot.fieldRecord = this.fieldRecord;
      this.onSave(snapshot);
      this.untilSave = 1;
    }
    start() {
      if (this.root) return;
      const root = this.root = document.createElement('div');
      root.className = 'ice-dive';
      root.lang = 'ru';
      root.tabIndex = -1;
      root.innerHTML = `
        <header class="ice-top"><div><small>Полярная станция · 04</small><h2 data-val="title">Подлёдный пост</h2></div>
          <button type="button" data-ice="pause">Пауза</button></header>
        <div class="ice-instruments" aria-label="Приборы">
          <div><small>Баллон</small><b data-val="gas"></b><i><i data-val="bar"></i></i></div>
          <div><small>Глубина</small><b data-val="depth"></b></div>
          <div><small>От майны</small><b data-val="east"></b></div>
          <div><small>В воде</small><b data-val="time"></b></div></div>
        <div class="ice-water"><canvas aria-label="Разрез льда. Восток справа, глубина вниз."></canvas>
          <div class="ice-hint" data-val="hint" role="status"></div></div>
        <div class="ice-controls" aria-label="Управление">
          <div class="ice-pad" aria-label="Плыть"><button data-move="left" aria-label="Плыть влево">←</button>
            <button data-move="up" aria-label="Всплывать">↑</button><button data-move="down" aria-label="Погружаться">↓</button>
            <button data-move="right" aria-label="Плыть вправо">→</button></div>
          <div class="ice-tools"><button data-ice="fin"></button><button data-ice="ping"></button>
            <button data-ice="work">Осмотреть · E</button></div></div>
        <div class="ice-overlay" hidden><div class="ice-sheet" role="group" aria-label="Журнал поста"></div></div>`;
      this.host.append(root);
      this.coarse = window.matchMedia('(pointer: coarse)');
      this.canvas = root.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.overlay = root.querySelector('.ice-overlay');
      this.sheet = root.querySelector('.ice-sheet');
      this.vals = Object.fromEntries([...root.querySelectorAll('[data-val]')].map(el => [el.dataset.val, el]));
      this.buttons = Object.fromEntries([...root.querySelectorAll('[data-ice]')].map(el => [el.dataset.ice, el]));
      this.abort = new AbortController();
      const listen = (target, type, fn, capture = false) =>
        target.addEventListener(type, fn, {signal:this.abort.signal, capture});
      // Swimming uses pointer capture. Suppress the extra tap Chromium can
      // dispatch to a shore button that appears underneath a held finger.
      root.querySelector('.ice-pad').addEventListener('touchstart', event => event.preventDefault(),
        {passive:false, signal:this.abort.signal});
      listen(root, 'change', event => {
        if (event.target.matches('[data-ice-tool]')) this.selectTool(event.target.value);
      });
      listen(root, 'click', event => {
        const button = event.target.closest('button');
        if (!button || !root.contains(button)) return;
        if (button.dataset.ice) this.action(button.dataset.ice);
        // Switch control and keyboard activation on a direction give one fin stroke.
        if (button.dataset.move && event.detail === 0 && this.dive.phase === 'diving') {
          this.keys.set('stroke', button.dataset.move);
          for (let i = 0; i < 12; i++) this.step(1 / 30);
          this.keys.delete('stroke');
        }
      });
      listen(root, 'pointerdown', event => {
        const button = event.target.closest('[data-move]');
        if (!button || event.button !== 0 || this.dive.phase !== 'diving') return;
        event.preventDefault();
        this.pointers.set(event.pointerId, button.dataset.move);
        button.setPointerCapture(event.pointerId);
      });
      for (const type of ['pointerup','pointercancel','lostpointercapture']) {
        listen(root, type, event => this.pointers.delete(event.pointerId));
      }
      listen(window, 'keydown', event => this.key(event, true), true);
      listen(window, 'keyup', event => this.key(event, false), true);
      const suspend = () => {
        if (this.dive.phase === 'diving') this.action('pause');
      };
      listen(window, 'blur', suspend);
      listen(window, 'pagehide', suspend);
      listen(document, 'visibilitychange', () => { if (document.hidden) suspend(); });
      this.observer = new ResizeObserver(() => { if (this.root) this.draw(); });
      this.observer.observe(this.canvas);
      this.animate = now => {
        if (!this.root) return;
        const delta = this.lastTime == null ? 0 : clamp((now - this.lastTime) / 1000, 0, .15);
        this.lastTime = now;
        if (this.dive.phase === 'diving') {
          this.step(delta);
          if (this.dive.phase === 'diving' && (this.untilSave -= delta) <= 0) this.save();
        }
        if (!this.root || this.dive.phase !== 'diving') return;
        this.refresh();
        this.draw();
        this.frame = requestAnimationFrame(this.animate);
      };
      this.showPhase();
    }
    key(event, down) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const code = event.code;
      const live = this.dive.phase === 'diving';
      if (code === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (down && !event.repeat) {
          if (live || this.dive.phase === 'paused') this.action(live ? 'pause' : 'resume');
          else this.action('exit');
        }
        return;
      }
      if (!live) return;
      if (code === 'Space' && event.target.closest?.('button')) return;
      const act = {ShiftLeft:'fin', ShiftRight:'fin', Space:this.dive.tool === 'reel' ? 'reel' : 'ping', KeyE:'work'}[code];
      if (!act && !moves[code]) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (moves[code]) {
        if (down) this.keys.set(code, moves[code]);
        else this.keys.delete(code);
      } else if (down && !event.repeat) this.action(act);
    }
    destroy() {
      if (!this.root) return;
      this.abort.abort();
      this.observer.disconnect();
      cancelAnimationFrame(this.frame);
      this.clearInput();
      this.stopAudio();
      this.root.remove();
      this.root = null;
      this.save();
    }
    clearInput() {
      this.keys.clear();
      this.pointers.clear();
    }
    inform(message) {
      this.message = message;
      this.messageUntil = this.dive.elapsed + 3;
    }
    selectTool(tool) {
      if (!this.reelUnlocked || !['sounder','reel'].includes(tool) ||
          !['brief','surfaced','lost'].includes(this.dive.phase)) return;
      this.selectedTool = tool;
      this.save();
    }
    action(name) {
      const d = this.dive;
      if (name === 'exit') {
        this.destroy();
        this.onExit();
        return;
      }
      if (name === 'listen' && this.completed) { this.playRecording(); return; }
      if (name === 'listen-west' && this.westRecovered) { this.playRecording('west'); return; }
      const launch = name === 'start' || (name === 'start-west' && this.reelUnlocked);
      if (launch && ['brief','surfaced','lost'].includes(d.phase)) {
        this.dive = {...(name === 'start-west' ? fresh('reel','west') : fresh(this.selectedTool)), phase:'diving'};
        this.message = '';
      } else if (name === 'pause' && d.phase === 'diving') d.phase = 'paused';
      else if (name === 'resume' && d.phase === 'paused') d.phase = 'diving';
      else if (name === 'fin' && d.phase === 'diving') {
        d.fast = !d.fast;
        this.inform(d.fast ? 'Сильный гребок · расход газа повышен' : 'Мерный гребок · экономный ход');
      } else if (name === 'reel' && d.phase === 'diving' && d.tool === 'reel') {
        if (d.line.mode === 'packed') {
          if (d.route === 'west' && range(d,drum)>1.6) {
            this.inform('Крепление на барабане прямо под майной, глубина 3 м.');
            return;
          }
          d.line.mode = 'laying';
          const anchor = d.route === 'west' ? drum : d;
          d.line.points.push({x:anchor.x,y:anchor.y});
          this.inform('Линь закреплён. Он ляжет по твоему следу.');
        } else if (d.pod) {
          if (d.pod.at !== d.pod.to || d.pod.at === 0) return;
          const to = Math.max(0,d.pod.at-4);
          if (range(d,onLine(d.line,to))>1.6) {
            this.inform('Для тяги подплыви к кольцу на лине. ' + this.bearing());
            return;
          }
          d.pod.to = to;
          this.inform('Линь натянут. Датчик идёт к кольцу.');
        } else if (d.route === 'west') {
          this.inform(this.westHint());
          return;
        } else if (['full','laying'].includes(d.line.mode)) this.followLine();
        else return;
      } else if (name === 'ping' && d.phase === 'diving' && d.tool === 'sounder') {
        if (d.pulse > 0 || d.pings <= 0) return;
        d.pings--;
        d.pulse = 7;
        this.inform(this.bearing() + ' · проход под килем от 11 м');
      } else if (name === 'work' && d.phase === 'diving') {
        const station = this.nearby();
        if (station === hydrophone) {
          if (!this.canClip()) {
            this.inform('Нужен линь от майны до датчика. Если линя не хватило, вернись за новой катушкой.');
            return;
          }
          const line = d.line;
          line.used += range(line.points.at(-1),hydrophone);
          line.points.push({x:hydrophone.x,y:hydrophone.y});
          line.mode = 'haul';
          d.pod = {at:line.used,to:line.used};
          this.inform('Датчик на лине. Плыви к кольцу и нажми «Тянуть».');
        } else if (station === relay) {
          d.reading = true;
          this.message = '';
        } else if (station === recorder) {
          d.cargo = true;
          if (d.line && ['laying','full'].includes(d.line.mode)) {
            this.followLine();
            this.inform('Кассета в сумке. Обратно по своему линю.');
          } else this.inform('Кассета в сумке. На запад, к свету майны.');
        } else {
          this.inform('Подплыви к прибору на расстояние вытянутой руки.');
          return;
        }
      } else return;
      if (launch || name === 'resume' || name === 'pause') {
        this.clearInput();
        this.stopAudio();
        this.lastTime = null;
        this.showPhase();
      }
      this.save();
    }
    followLine() {
      const line = this.dive.line;
      line.mode = 'return';
      line.cursor = line.points.length - 1;
      this.inform('Возврат по линю. Стрелки ведут к месту крепления.');
    }
    advanceLine() {
      const d = this.dive, line = d.line;
      if (line.mode === 'return') {
        while (range(d, line.points[line.cursor]) <= 1.5) {
          if (line.cursor === 0) {
            line.mode = 'home';
            this.inform('Начало линя. Теперь к майне на отметке 0 м.');
            break;
          }
          line.cursor--;
        }
      } else if (line.mode === 'laying') {
        const prev = line.points.at(-1), distance = range(d, prev);
        if (distance < pointSpacing) return;
        const remaining = reelLength - line.used;
        const fraction = Math.min(1, remaining / distance);
        line.points.push({x:prev.x + (d.x - prev.x) * fraction, y:prev.y + (d.y - prev.y) * fraction});
        line.used += Math.min(remaining, distance);
        if (line.used >= reelLength) {
          line.mode = 'full';
          this.inform(d.route === 'west' ? 'Линь кончился. Возвращайся в майну, чтобы повторить выход.' : 'Катушка пуста. Конец линя остался здесь. «По линю» покажет путь назад.');
        }
      }
    }
    nearby() {
      const d = this.dive;
      if (d.route === 'west') return !d.pod && range(d,hydrophone)<=1.5 ? hydrophone : null;
      if (!d.reading && range(d, relay) <= 2.2) return relay;
      if (!d.cargo && range(d, recorder) <= 2.2) return recorder;
      return null;
    }
    canClip() {
      const d=this.dive, line=d.line;
      if (d.route!=='west' || line?.mode!=='laying') return false;
      const gap=range(line.points.at(-1),hydrophone);
      return range(d,hydrophone)<=1.5 && gap<=2 && line.used+gap<=reelLength;
    }
    end(phase) {
      const d = this.dive;
      d.phase = phase;
      if (phase === 'surfaced') {
        const newWest = d.route === 'west' && d.pod?.at === 0 && !this.westRecovered;
        const newEast = d.cargo && !this.completed;
        const newReading = d.reading && !this.charted;
        if (d.cargo && !this.completed) this.fieldRecord = 'На кассете зимнего поста сохранилась подлёдная трель нерпы.';
        else if (d.reading && !this.charted) this.fieldRecord = 'По координатам жёлтого репера зимний пост нанесён на карту.';
        if (d.reading) this.charted = true;
        if (d.cargo) this.completed = true;
        if (newWest) this.westRecovered = true;
        if (this.westRecovered && (newEast || newWest || newReading)) this.fieldRecord = this.completed
          ? 'В архиве трель нерпы с восточной кассеты и двойной удар льда с западного гидрофона.'
          : 'На записи поднятого западного гидрофона слышен двойной удар льда.';
      }
      this.clearInput();
      this.save();
      this.showPhase();
    }
    step(dt) {
      const d = this.dive;
      if (d.phase !== 'diving' || dt <= 0) return;
      const held = new Set([...this.keys.values(), ...this.pointers.values()]);
      const dx = Number(held.has('right')) - Number(held.has('left'));
      const dy = Number(held.has('down')) - Number(held.has('up'));
      const norm = Math.max(1, Math.hypot(dx, dy));
      const speed = d.fast ? 4.1 : 2.65;
      const blend = 1 - Math.exp(-dt * 4);
      // Meltwater moves toward the lead under the ice; the deeper layer sets east.
      const flow = clamp((d.y - 8) / 4, -1, 1) * .43;
      d.vx += ((dx / norm * speed + flow) - d.vx) * blend;
      d.vy += ((dy / norm * speed * .88) - d.vy) * blend;
      if (dx) d.facing = dx;
      const bounds = routes[d.route];
      const x = clamp(d.x + d.vx * dt, bounds.left, bounds.right);
      // A fin stroke glances along gentle slopes. Steep faces and the lip
      // of the lead require changing depth before swimming past them.
      const glide = Math.abs(x - d.x) * .5;
      if (iceDepth(x) + .4 <= d.y + glide && bed(x) - .45 >= d.y - glide) d.x = x;
      else d.vx = 0;
      const y = d.y + d.vy * dt;
      d.y = clamp(y, iceDepth(d.x) + .4, bed(d.x) - .45);
      if (d.y !== y) d.vy = 0;
      if (d.pod && d.pod.at > d.pod.to) {
        d.pod.at = Math.max(d.pod.to,d.pod.at-dt*2.4);
        if (d.pod.at === 0) this.inform('Датчик у барабана. Всплывай в майне.');
      } else if (d.line && !d.pod) this.advanceLine();
      d.elapsed += dt;
      d.pulse = Math.max(0, d.pulse - dt);
      d.gas = Math.max(0, d.gas - dt * (.74 + d.y * .028 + (dx || dy ? (d.fast ? 2.6 : .61) : 0)));
      if (!d.gas) this.end('lost');
      else if (dy < 0 && Math.abs(d.x) < leadWidth && d.y <= .45) this.end('surfaced');
    }
    target() {
      const d = this.dive;
      if (d.route === 'west') {
        if (d.pod?.at===0 || d.line.mode==='full') return lead;
        if (d.pod) return {...onLine(d.line,Math.max(0,d.pod.to-4)),name:'Кольцо тяги'};
        return d.line.mode==='packed' ? drum : hydrophone;
      }
      if ((d.reading || d.cargo) && Math.abs(d.x) < leadWidth) return lead;
      if (d.line?.mode === 'return') return {...d.line.points[d.line.cursor], name:'По линю'};
      if (d.cargo || d.line?.mode === 'home') return lead;
      return this.charted || d.reading || d.pulse > 0 ? recorder : relay;
    }
    bearing() {
      const d = this.dive, target = this.target();
      const dx = target.x - d.x, dy = target.y - d.y;
      const tolerance = d.pod ? .5 : 1.3;
      const horizontal = Math.abs(dx) < tolerance ? '' : dx > 0 ? 'вправо' : 'влево';
      const vertical = Math.abs(dy) < tolerance ? '' : dy > 0 ? 'вниз' : 'вверх';
      return target.name + ' · ' + Math.round(range(d, target)) + ' м ' + [horizontal,vertical].filter(Boolean).join(' и ');
    }
    readingHint() {
      const d = this.dive;
      const offset = Math.abs(d.x);
      let opening = 'Майна на 0 м — по стрелкам жёлтого линя.';
      if (offset < leadWidth) opening = 'Майна над тобой.';
      else if (offset <= 6) opening = 'Майна рядом. Сместись ' + (d.x > 0 ? 'влево' : 'вправо') + ' к 0 м.';
      const bank = this.charted ? 'Всплытие в майне завершит выход с показанием.' :
        this.reelUnlocked ? 'Всплыви в майне, чтобы сохранить пеленг.' : 'Всплыви в майне, чтобы сохранить пеленг и получить катушку.';
      const home = opening + ' ' + bank;
      const atPost = this.nearby() === recorder;
      const post = atPost ? 'Самописец рядом. Нажми «Забрать» и доставь кассету в майну.' :
        'Самописец · 48 м В, глубина 14 м. Привези кассету для архива.';
      const returning = !atPost && (d.x <= relay.x + 2 || d.facing < 0 || d.line?.mode === 'return');
      const choices = returning ? home + '\n' + post : post + '\n' + home;
      if (offset <= 6 || atPost) return choices;
      if (d.line?.mode === 'return') return choices + '\n' + this.bearing();
      if (d.pulse > 0) return choices + '\nЭхо · проход под килем от 11 м.';
      if (this.message && d.elapsed < this.messageUntil) return choices + '\n' + this.message;
      return choices;
    }
    hint() {
      const d = this.dive;
      if (d.route === 'east' && d.reading && !d.cargo) return this.readingHint();
      if (d.route === 'east' && d.cargo && Math.abs(d.x) < leadWidth) return 'Майна над тобой. Всплыви, чтобы доставить кассету.';
      if (this.message && d.elapsed < this.messageUntil) return this.message;
      if (d.route === 'west') return this.westHint();
      const near = this.nearby();
      if (near) return near === recorder ? 'Кассета в гнезде. Нажми «Забрать».' : 'Жёлтый репер. Нажми «Считать», чтобы снять координаты.';
      if (Math.abs(d.x) < leadWidth && (d.reading || d.cargo || d.elapsed > 6)) return 'Свет майны. Плыви вверх для выхода.';
      if (d.y <= iceDepth(d.x) + .55 && Math.abs(d.x) >= leadWidth) return 'Над головой лёд. Выход в майне на отметке 0 м.';
      if (d.line?.mode === 'return' || d.line?.mode === 'home') return this.bearing();
      if (d.pulse > 0) return this.bearing() + ' · проход под килем от 11 м';
      if (d.reading || this.charted || d.cargo) return this.bearing();
      if (d.gas < 45) return 'Малый запас. Майна на отметке 0 м.';
      if (d.x > 24) return 'Киль тороса. Обойди остриё снизу.';
      return 'Репер справа, на глубине 6 м. Стрелки на жёлтом лине ведут обратно к майне.';
    }
    westHint() {
      const d=this.dive;
      if (d.pod?.at===0) return 'Датчик у барабана. Поднимись через майну.';
      if (d.pod) {
        if (d.pod.at>d.pod.to) return 'Лебёдка тянет датчик · до барабана ' + Math.ceil(d.pod.at) + ' м';
        return range(d,this.target())<=1.6 ? 'Кольцо рядом. Нажми «Тянуть».' : this.bearing();
      }
      if (d.line.mode==='packed') return 'Нажми «Крепить» у барабана под майной.';
      if (d.line.mode==='full') return 'Линь исчерпан. Вернись в майну для новой попытки.';
      if (this.nearby()) return this.canClip() ? 'Гидрофон рядом. Нажми «Зацепить».' : 'Дотяни линь до скобы гидрофона.';
      return 'На запад под полку · проход на 12 м · гидрофон на 22 м З, глубина 9 м';
    }
    refresh() {
      const d = this.dive, v = this.vals;
      const set = (el, s) => { if (el.textContent !== s) el.textContent = s; };
      set(v.gas, Math.ceil(d.gas) + ' бар');
      v.gas.dataset.low = String(d.gas < 45);
      v.bar.style.width = (100 * d.gas / tank).toFixed(1) + '%';
      set(v.depth, d.y.toFixed(1) + ' м');
      set(v.east, Math.round(Math.abs(d.x)) + ' м ' + (d.x < -.5 ? 'З' : 'В'));
      set(v.time, Math.floor(d.elapsed / 60) + '∶' + String(Math.floor(d.elapsed % 60)).padStart(2, '0'));
      set(v.hint, this.hint());
      const touch = this.coarse.matches;
      set(this.buttons.fin, (d.fast ? 'Быстро' : 'Мерно') + (touch ? '' : ' · ⇧'));
      this.buttons.fin.setAttribute('aria-pressed', String(d.fast));
      const toolButton = this.buttons.ping;
      toolButton.dataset.ice = d.tool === 'reel' ? 'reel' : 'ping';
      if (d.line) {
        const remaining = Math.ceil(reelLength - d.line.used);
        if (d.route==='west') {
          const westLabel = d.pod ? (d.pod.at===0 ? 'У майны' : d.pod.at>d.pod.to ? 'Тянем…' : 'Тянуть') :
            d.line.mode==='packed' ? 'Крепить · 32 м' : 'Линь · ' + remaining + ' м';
          set(toolButton,westLabel);
          toolButton.disabled = d.pod ? d.pod.at===0 || d.pod.at>d.pod.to : d.line.mode!=='packed';
        } else {
          const labels = {packed:'Крепить · 32 м', laying:'По линю · ' + remaining + ' м', full:'По линю · 0 м', return:'По линю', home:'Линь пройден'};
          set(toolButton, labels[d.line.mode]);
          toolButton.disabled = ['return','home'].includes(d.line.mode);
        }
      } else {
        set(toolButton, 'Эхо · ' + d.pings);
        toolButton.disabled = !d.pings || d.pulse > 0;
      }
      const near = this.nearby();
      set(this.buttons.work, (near === hydrophone ? 'Зацепить' : near === relay ? 'Считать' : near === recorder ? 'Забрать' : 'Осмотреть') + (touch ? '' : ' · E'));
      this.buttons.work.dataset.ready = String(!!near);
    }
    showPhase() {
      const d = this.dive, live = d.phase === 'diving';
      this.vals.title.textContent = d.route==='west' ? 'Западная полка' : 'Подлёдный пост';
      cancelAnimationFrame(this.frame);
      this.overlay.hidden = live;
      for (const selector of ['.ice-top','.ice-instruments','.ice-controls','.ice-water']) {
        this.root.querySelector(selector).inert = !live;
      }
      this.refresh();
      this.draw();
      if (live) {
        this.root.focus({preventScroll:true});
        this.frame = requestAnimationFrame(this.animate);
        return;
      }
      let title, body, primary, label;
      if (d.phase === 'paused') {
        title = 'Погружение на паузе';
        body = 'Баллон ' + Math.ceil(d.gas) + ' бар. ' + (d.cargo ? 'Кассета в сумке.' : this.hint()) + ' Положение и запас газа сохранены.';
        primary = 'resume'; label = 'Продолжить';
      } else if (d.phase === 'brief') {
        title = 'Голоса подо льдом';
        body = 'На востоке зимовал акустический пост. Плыви вправо по жёлтому линю до репера на 6 м. Стрелки на лине ведут обратно к майне. Можно всплыть с пеленгом или пройти за торос и вернуться с кассетой.';
        primary = 'start'; label = 'Войти в майну';
      } else {
        const lost = d.phase === 'lost';
        title = lost ? 'Газ исчерпан' : d.cargo ? 'Кассета поднята' : d.reading ? 'Пеленг на карте' : 'Снова у майны';
        body = lost ? 'Выход завершён подо льдом. Попробуй мерный ход или вернись сначала с координатами репера.' :
          d.cargo ? 'На дорожке зимнего поста слышна трель нерпы. Запись теперь в архиве экспедиции.' :
          d.reading ? 'Координаты поста нанесены на планшет. В следующих выходах прибор ведёт прямо к самописцу.' :
          'Ты вернулся с пустой сумкой. Репер висит на восточном конце жёлтого линя.';
        body += ' Время в воде — ' + duration(d.elapsed) + ', остаток — ' + Math.ceil(d.gas) + ' бар.';
        if (d.route==='west') {
          const landed = !lost && d.pod?.at===0;
          title = landed ? 'Западный гидрофон поднят' : lost ? 'Газ исчерпан на западе' : 'Возврат с западной полки';
          body = landed ? 'В наушниках два глухих удара: под полкой сошлись плиты льда. Дорожка гидрофона сохранена.' :
            'Гидрофон остался под полкой. На новом выходе хватит 32 м линя, если пройти под краем полки на глубине 12 м.';
          body += ' В воде — ' + duration(d.elapsed) + '.';
        }
        primary = 'start'; label = 'Новый выход';
      }
      const selector = this.reelUnlocked && d.phase !== 'paused' ? `<fieldset class="ice-loadout"><legend>Восточный пост · снаряжение</legend>
        <p>За доставку с поста станция выдала личную катушку. Возьми один прибор.</p>
        <label><input type="radio" name="ice-tool" data-ice-tool="sounder" value="sounder" ${this.selectedTool === 'sounder' ? 'checked' : ''}>
          <span><b>Эхолот</b><small>Три импульса показывают цель и глубину прохода.</small></span></label>
        <label><input type="radio" name="ice-tool" data-ice-tool="reel" value="reel" ${this.selectedTool === 'reel' ? 'checked' : ''}>
          <span><b>Личная катушка · 32 м</b><small>Закрепи у репера. На обратном пути кнопка «По линю» или поднятая кассета укажет твой след.</small></span></label></fieldset>` : '';
      const reel = d.phase === 'paused' ? d.tool === 'reel' : this.reelUnlocked;
      const keyTool = d.route==='west' ? 'Пробел — закрепить линь или подтянуть груз у кольца. E — зацепить гидрофон.' :
        reel ? 'Пробел — использовать выбранный прибор.' : 'Пробел — один из трёх импульсов эхолота.';
      const touchTool = d.route==='west' ? 'У барабана нажми «Крепить», у гидрофона — «Зацепить», у каждого кольца — «Тянуть».' :
        reel ? 'Кнопка прибора даёт эхо или крепит линь. «По линю» ведёт обратно.' : '«Эхо» даёт три пеленга.';
      this.sheet.innerHTML = `<small>Ледовая разведка / акустический пост</small>
        <h3>${title}</h3><p>${body}</p>
        ${selector ? '<div class="ice-west-brief"><b>Западная полка · подъём груза</b><p id="ice-west-objective">Гидрофон висит в 22 м к западу. Проложи 32-метровый линь от барабана майны под краем полки на глубине 12 м. Зацепи датчик и подтяни его к каждому следующему кольцу.</p><button data-ice="start-west" aria-describedby="ice-west-objective">На запад с катушкой</button></div>' : ''}
        ${d.phase === 'brief' || d.phase === 'paused' ? `<p class="ice-guide"><span class="ice-key-guide">Стрелки / WASD — ласты. Shift — сильный гребок с повышенным расходом. ${keyTool} E — работа с прибором. Esc — пауза.</span><span class="ice-touch-guide">Удерживай стрелки, чтобы плыть. «Мерно» переключает силу гребка. Быстрый ход тратит больше газа. ${touchTool} У прибора нажми «Считать» или «Забрать».</span></p>` : ''}
        ${this.charted ? '<p class="ice-log">✓ На планшете сохранён пеленг поста.</p>' : (d.phase === 'brief' ? '<p class="ice-log">Короткий выход с показанием репера откроет пеленг для следующих погружений.</p>' : '')}
        ${this.completed ? '<div class="ice-record"><div aria-hidden="true" class="ice-track"></div><button data-ice="listen">▶ Запись нерпы</button></div>' : ''}
        ${this.westRecovered ? '<div class="ice-record ice-west-record"><div aria-hidden="true" class="ice-track"></div><button data-ice="listen-west">▶ Двойной удар льда</button></div>' : ''}
        ${selector}
        <div class="ice-actions"><button data-ice="${primary}">${primary==='start' && this.reelUnlocked ? 'К восточному посту' : label}</button><button data-ice="exit">К экспедициям</button></div>`;
      this.sheet.querySelector('[data-ice="' + primary + '"]').focus({preventScroll:true});
    }
    stopAudio() {
      if (this.audio && this.audio.state !== 'closed') this.audio.close().catch(() => {});
      this.audio = null;
    }
    playRecording(route='east') {
      this.stopAudio();
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      const audio = this.audio = new Audio();
      const voice = audio.createOscillator(), gain = audio.createGain(), t = audio.currentTime;
      voice.connect(gain).connect(audio.destination);
      gain.gain.setValueAtTime(.0001, t);
      if (route==='west') {
        voice.type='triangle';
        for (const [offset,frequency] of [[.18,280],[1.28,205]]) {
          voice.frequency.setValueAtTime(frequency,t+offset);
          voice.frequency.exponentialRampToValueAtTime(65,t+offset+.78);
          gain.gain.setValueAtTime(.0001,t+offset);
          gain.gain.linearRampToValueAtTime(.13,t+offset+.015);
          gain.gain.exponentialRampToValueAtTime(.0001,t+offset+1);
        }
      } else for (let i = 0; i <= 88; i++) {
        const sec = i * .045;
        voice.frequency.setValueAtTime(890 * Math.exp(-sec * .35) + 85 * Math.sin(sec * 15), t + sec);
        gain.gain.linearRampToValueAtTime(.047 * Math.sin(i / 88 * Math.PI) ** 2 * (.65 + .35 * Math.cos(i)), t + sec + .005);
      }
      voice.onended = () => { if (this.audio === audio) this.stopAudio(); };
      voice.start(t); voice.stop(t + 4.05);
    }
    draw() {
      drawShelf(this);
    }
  }

  // Project the same shelf profile used by the collision solver into a side view.
  function drawShelf(view) {
    const c = view.ctx, canvas = view.canvas, w = canvas.clientWidth, h = canvas.clientHeight;
    if (!c || !w || !h) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const bw = Math.round(w * ratio), bh = Math.round(h * ratio);
    if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
    const d = view.dive, t = d.elapsed;
    const scale = Math.max(10, Math.min(w / 20, h / 14, 54));
    const across = w / scale, high = h / scale;
    const left = d.route==='west' ? d.x-across*.52 : clamp(d.x - across * .46, -across * .46, Math.max(58 - across * .54, 0));
    const top = high > 20 ? -(high - 20) * .28 - 1.6 : clamp(d.y - high * .5, -1.8, 19.8 - high);
    const right = left + across, bottom = top + high;
    const min = Math.floor(left) - 2, max = Math.ceil(right) + 2;
    c.setTransform(ratio * scale, 0, 0, ratio * scale, -left * ratio * scale, -top * ratio * scale);
    const gradient = (y1, y2, stops) => {
      const g = c.createLinearGradient(0, y1, 0, y2);
      for (const [pos, color] of stops) g.addColorStop(pos, color);
      return g;
    };
    function path(points) {
      c.beginPath(); c.moveTo(...points[0]);
      for (let i = 1; i < points.length; i++) c.lineTo(...points[i]);
    }
    function poly(points, color) { path(points); c.closePath(); c.fillStyle = color; c.fill(); }
    function line(points, color, width) {
      path(points); c.strokeStyle = color; c.lineWidth = width; c.stroke();
    }
    function oval(x,y,rx,ry,color,angle = 0) {
      c.beginPath(); c.ellipse(x,y,rx,ry,angle,0,Math.PI*2); c.fillStyle = color; c.fill();
    }
    const noise = i => { const n = Math.sin(i * 51.76 + 1.2) * 9345.61; return n - Math.floor(n); };
    const water = gradient(0, 19, [[0,'#86bcbe'],[.15,'#427f8a'],[.45,'#225767'],[.78,'#123645'],[1,'#08202d']]);
    c.fillStyle = water; c.fillRect(left, top, across, high);
    // Distant, translucent keels and refracted stripes give the ice thickness.
    for (let i = Math.floor(min / 5); i < max / 5; i++) {
      const x = i * 5, depth = 3 + noise(i) * 4;
      poly([[x-3,.5],[x+6,.7],[x+4,depth*.67],[x+1,depth],[x-.8,depth*.51]], '#92c4c42b');
      poly([[x+1,depth],[x+2.4,1],[x+6,.7],[x+4,depth*.67]], '#c0e1d51c');
    }
    const ray = gradient(0, 17, [[0,'#d2f4df81'],[.45,'#b3e8d722'],[1,'#a0ddda00']]);
    poly([[-2.3,0],[2.3,0],[8.6,17],[-3.7,17]], ray);
    for (let i = Math.floor(min / 6); i < max / 6; i++) {
      const x = i * 6 + noise(i+8), sway = Math.sin(t*.26+i)*.3;
      poly([[x,0],[x+.45,0],[x+5+sway,14],[x+2.5+sway,14]], '#a6daca0b');
    }
    const floor = [];
    for (let i = min; i <= max; i += .5) floor.push([i,bed(i)]);
    poly([...floor,[max,Math.max(bottom,25)],[min,Math.max(bottom,25)]],gradient(15,21,[[0,'#456267'],[.45,'#263e47'],[1,'#12252e']]));
    line(floor, '#6c909080', .06);
    for (let i = min; i < max; i++) {
      const a = noise(i), x = i + a * .5, y = bed(x) + .2 + noise(i+20)*1.2;
      poly([[x-.5,y],[x-.2,y-.14-a*.25],[x+.1,y-.17],[x+.3+a*.5,y+.08]], '#526a6a77');
    }
    const ice = gradient(-1, 9, [[0,'#d8e9dc'],[.21,'#accfcb'],[.53,'#87b6bd'],[1,'#527f94']]);
    for (const [begin,end] of [[min, Math.min(max,-leadWidth)],[Math.max(min,leadWidth),max]]) {
      if (end <= begin) continue;
      const outline = [[begin,iceDepth(begin)],...roof.filter(p => p[0] > begin && p[0] < end),[end,iceDepth(end)]];
      c.save();
      poly([[begin,-.8],[end,-.8],...outline.slice().reverse()], ice);
      c.clip();
      for (let i = Math.floor(begin / 1.8); i <= end / 1.8; i++) {
        const x = i*1.8, base = iceDepth(x), offset = noise(i);
        poly([[x-1,-.8],[x+1.2,-.8],[x+.3,base*.55],[x+offset,base+.08]], '#f0f6e925');
        line([[x+1.4,-.65],[x+.35,.24],[x+.6,base*.48],[x+.1,base*.6]],'#507f8f44',.035);
      }
      c.restore();
      line(outline, '#e2f6e5bd', .08);
      line([[begin,-.83],[end,-.83]], '#eff4e6', .14);
    }
    // A flagged, open lead and a physical survey line that ends at the near relay.
    line([[-2.4,.04],[-1.4,.1],[.6,.02],[1.5,.08],[2.4,.04]], '#e0f7e9', .075);
    line([[-3.1,-.85],[-3.1,-2.15]], '#705044', .08);
    poly([[-3.1,-2.12],[-2.25,-1.89],[-3.1,-1.64]], '#cf6844');
    if (d.route==='west') {
      // The winch and hydrophone have separate positions. The sensor hangs in
      // its cradle until the diver clips it, then travels along the laid line.
      line([[-.6,0],[-.6,3.5],[.6,3.5],[.6,0]],'#244953',.09);
      oval(0,3.2,.43,.36,'#b98e51'); oval(0,3.2,.22,.2,'#31474c');
      line([[-22.85,iceDepth(-22.85)],[-22.85,9.6],[-21.3,9.6],[-21.3,iceDepth(-21.3)]],'#7eafa9',.11);
      line([[-22.85,8.75],[-22.5,9.35],[-21.65,9.35],[-21.3,8.75]],'#a2b5a7',.12);
    } else {
      c.beginPath(); c.moveTo(-2.5,1.4); c.quadraticCurveTo(4,6,10,6.2); c.quadraticCurveTo(14,6.7,18,6);
      c.strokeStyle='#dbbb6c'; c.lineWidth=.055; c.stroke();
      for (const [x,y] of [[4,4.63],[10,6.2],[15,6.27]]) {
        poly([[x-.28,y],[x+.18,y-.2],[x+.16,y+.18]], '#f0d596');
      }
      line([[18,iceDepth(18)],[18,5.6]], '#1e4d55', .05);
      c.fillStyle='#142d35'; c.fillRect(17.64,5.55,.72,.95);
      c.fillStyle=d.reading?'#b8d0bf':'#e5b956'; c.fillRect(17.72,5.68,.56,.68);
      line([[17.8,5.95],[18.17,5.95]], '#614d35', .09);
      const foot = bed(48);
      line([[47.1,foot],[47.6,14.5],[48.5,14.45],[49.2,bed(49.2)]],'#91a9a2',.14);
      line([[46.8,foot],[47.7,foot],[48.6,bed(48.6)],[49.5,bed(49.5)]],'#52696e',.19);
      c.fillStyle='#273f45'; c.fillRect(47.25,13.7,1.7,1);
      c.fillStyle='#b6a57f'; c.fillRect(47.28,13.72,1.62,.16);
      c.fillStyle=d.cargo?'#0f2d3a':'#dc8c4e'; c.fillRect(47.6,13.97,.88,.44);
      line([[48.75,13.7],[48.9,13],[48.65,12.5]], '#b4c7c0', .07);
      oval(48.65,12.45,.12,.24,'#cfba8a');
    }
    if (d.line?.points.length) {
      const points = d.line.points.map(p => [p.x,p.y]);
      if (d.line.mode === 'laying') points.push([d.x,d.y]);
      line(points, '#183e49', .16);
      line(points, '#b1edcd', .075);
      const anchor = points[0];
      oval(...anchor, .21,.21,'#204946');
      oval(...anchor, .12,.12,'#e7f8cf');
      // Homeward chevrons follow the actual turns made under the keel.
      for (let i=1; i<points.length; i+=8) {
        const [x,y] = points[i], prev = points[i-1];
        c.save(); c.translate(x,y); c.rotate(Math.atan2(prev[1]-y,prev[0]-x));
        line([[-.16,-.15],[.13,0],[-.16,.15]], '#edffda',.085); c.restore();
      }
      if (d.line.mode === 'return') {
        const p = d.line.points[d.line.cursor];
        c.beginPath(); c.arc(p.x,p.y,.37,0,Math.PI*2); c.lineWidth=.08; c.strokeStyle='#e5ffb8'; c.stroke();
      }
    }
    if (d.route==='west') {
      const p = d.pod ? onLine(d.line,d.pod.at) : hydrophone;
      oval(p.x,p.y,.55,.29,'#edab6a');
      line([[p.x-.35,p.y-.16],[p.x-.34,p.y+.16]],'#795540',.09);
      line([[p.x+.28,p.y-.18],[p.x+.28,p.y+.17]],'#795540',.09);
      oval(p.x,p.y+.33,.25,.16,'#344953');
      if (d.pod && d.pod.at>0) {
        const mark=view.target();
        c.beginPath(); c.arc(mark.x,mark.y,.5,0,Math.PI*2);
        c.lineWidth=.1; c.strokeStyle='#f6d98f'; c.stroke();
      }
    }
    // Suspended flecks ride the two layers at different speeds.
    for (let i = 0; i < 90; i++) {
      const y = noise(i + 149) * 19;
      let x = (noise(i + 71) * 80 + t * clamp((y-8)/4,-1,1) * .27) % 80;
      x = (x + 80) % 80 - 11;
      if (x >= left && x <= right && y > iceDepth(x) && y < bed(x)) {
        line([[x,y],[x+.085,y-.01]],'#d5e8d854',.03);
      }
    }
    // Lamp, tank, regulator hose and two independently beating fins.
    c.save(); c.translate(d.x,d.y); c.scale(d.facing,1); c.rotate(clamp(d.vy*.09,-.34,.34));
    const beam = c.createLinearGradient(.45,0,7,0);
    beam.addColorStop(0,'#fbefc480'); beam.addColorStop(.3,'#f8edb533'); beam.addColorStop(1,'#e5efbd00');
    poly([[.55,-.19],[7,-1.2],[7,1.65],[.55,-.07]], beam);
    for (let i=0; i<2; i++) {
      const beat = Math.sin(t*(d.fast?8.2:5.4)+i*Math.PI)*.21;
      line([[-.37,.08],[-.7,.22+beat],[-1,.12+beat]], i?'#172f38':'#34525a', .16);
      poly([[-.91,.05+beat],[-1.45,.02+beat*1.7],[-1.55,.17+beat*1.8],[-.98,.23+beat]], i?'#9d8859':'#c3ab78');
    }
    oval(-.03,.02,.61,.24,'#122c37',-.08);
    oval(-.17,-.23,.51,.17,'#abbbb2',-.05);
    line([[-.22,-.37],[-.18,-.09]], '#354d54',.13);
    oval(.43,-.14,.255,.24,'#26393b');
    c.fillStyle='#a3c9be'; c.fillRect(.48,-.24,.22,.13);
    line([[.13,.04],[.33,.27],[.69,.17]],'#203c46',.12);
    oval(.71,.16,.1,.075,'#c69a65');
    if (d.cargo) { c.fillStyle='#c68452'; c.fillRect(-.26,.17,.4,.23); }
    c.restore();
    for (let i=0; i<6; i++) {
      const phase = (t*.53+i/6)%1;
      const x = d.x + .56*d.facing - d.vx*phase*.72 + Math.sin(i+t)*.08;
      const y = d.y - .24 - phase*2.3;
      if (y > iceDepth(x) + .08) {
        c.beginPath(); c.arc(x,y,.035+phase*.067,0,Math.PI*2);
        c.strokeStyle='#d7ece799'; c.lineWidth=.025; c.stroke();
      }
    }
    if (d.pulse > 0) {
      c.beginPath(); c.arc(d.x,d.y, .5+((7-d.pulse)*6)%11,0,Math.PI*2);
      c.lineWidth=.045; c.strokeStyle='#a6e5ce80'; c.stroke();
    }
    // Small plate labels keep a consistent pixel size at both viewport scales.
    c.setTransform(ratio,0,0,ratio,0,0);
    function plate(x,y,title) {
      const px=(x-left)*scale, py=(y-top)*scale;
      c.font='600 11px ui-monospace, monospace'; c.textAlign='center';
      const width=c.measureText(title).width+14;
      if (px < -width/2 || px > w+width/2 || py < 10 || py > h-10) return;
      c.fillStyle='#092833d6'; c.fillRect(px-width/2,py-11,width,18);
      c.fillStyle='#e5ebe0'; c.fillText(title,px,py+2);
    }
    plate(0,1.1,'МАЙНА');
    if (d.route==='west') {
      plate(-13,6.4,'ЗАПАДНАЯ ПОЛКА');
      plate(-22,7.9,'ГИДРОФОН');
      if (!d.line.points.length) plate(0,4.5,'БАРАБАН');
    } else {
      plate(18,7.45,'РЕПЕР');
      if (range(d,recorder)<11 || d.reading || view.charted || d.cargo) plate(48,11.5,'ПОСТ 04');
      if (left < 33 && right > 33) plate(32,5.6,'ТОРОС');
      if (d.pulse > 0) plate(33,11.55,'ПРОХОД · 11 М');
    }
    if (d.line?.points.length) plate(d.line.points[0].x,d.line.points[0].y-.75,'УЗЕЛ');
  }

  globalThis.IceDive = IceDive;
})();
