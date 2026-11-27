// This layer lives outside the boat and the game frame, so it survives the
// change of scene. Simulation and input remain held until the reveal is over.
class DiveTransition {
  constructor(game, boat) {
    this.game = game;
    this.boat = boat;
    this.active = false;
    this.timers = new Set();
    this.root = surveyElement("div", "", "dive-transition");
    this.root.hidden = true;
    this.root.setAttribute("aria-hidden", "true");
    this.root.innerHTML = '<div class="dive-transition-veil"></div><div class="dive-transition-water">' +
      Array.from({length: 9}, (_, i) => '<i style="--bubble:' + i + '"></i>').join("") + '</div>';
    document.body.append(this.root);
    window.addEventListener("pagehide", () => this.cancel());
  }

  after(delay, callback) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (this.active) callback();
    }, delay);
    this.timers.add(timer);
  }

  begin(plan) {
    if (this.active) return false;
    // begin() is called synchronously by the player's click, before any timer.
    this.game.sound.init();
    this.active = true;
    this.started = false;
    this.previousPaused = this.game.paused;
    this.game.paused = true;
    this.game.input.enabled = false;
    this.game.input.reset();
    this.game.frameEl.inert = true;
    this.boat.root.inert = true;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fadeOut = reduced ? 120 : 480;
    const hold = reduced ? 70 : 180;
    const fadeIn = reduced ? 160 : 760;
    this.root.classList.toggle("reduced-motion", reduced);
    this.root.style.setProperty("--dive-fade-out", fadeOut + "ms");
    this.root.style.setProperty("--dive-fade-in", fadeIn + "ms");
    this.root.dataset.phase = "ready";
    this.root.hidden = false;
    // Commit the clear starting state before beginning the fade.
    this.root.getBoundingClientRect();
    this.root.dataset.phase = "closing";
    this.after(fadeOut + 32, () => {
      this.root.dataset.phase = "submerged";
      try {
        this.game.startDive(plan);
        this.holdDive();
        this.stopSound = this.game.sound.plunge?.();
      } catch (error) {
        this.cancel();
        throw error;
      }
      this.after(hold, () => {
        this.root.dataset.phase = "opening";
        this.after(fadeIn + 32, () => this.finish());
      });
    });
    return true;
  }

  holdDive() {
    if (!this.active) return;
    this.started = true;
    this.game.paused = true;
    this.game.clock.acc = 0;
    this.game.input.enabled = false;
    this.game.input.reset();
    this.game.frameEl.inert = true;
  }

  finish() {
    if (!this.active) return;
    this.cancel();
    if(document.hidden)this.game.pauseUI?.show("Игра приостановлена при сворачивании.");
  }

  cancel() {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    this.stopSound?.();
    this.stopSound = null;
    this.root.hidden = true;
    this.root.dataset.phase = "ready";
    if (!this.active) return;
    this.active = false;
    this.boat.busy = false;
    this.boat.root.inert = false;
    this.game.paused = this.started ? false : this.previousPaused;
    this.game.clock.acc = 0;
    this.game.input.reset();
    this.game.input.enabled = this.game.mode === "dive" && this.boat.root.hidden;
    this.game.frameEl.inert = !this.boat.root.hidden;
    this.started = false;
  }
}
