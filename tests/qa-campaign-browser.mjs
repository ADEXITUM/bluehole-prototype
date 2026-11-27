// Shared real-browser fixture for qa-campaign.mjs. All storage belongs to a
// disposable BrowserContext. Input is sent through Chromium's input devices.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);

export async function launchBrowser(preferredPackage = process.env.QA_PLAYWRIGHT) {
  const env = process.env;
  const cache = env.PLAYWRIGHT_BROWSERS_PATH || (process.platform === 'win32'
    ? path.join(env.LOCALAPPDATA, 'ms-playwright')
    : process.platform === 'darwin' ? path.join(homedir(), 'Library/Caches/ms-playwright')
    : path.join(env.XDG_CACHE_HOME || path.join(homedir(), '.cache'), 'ms-playwright'));
  const links = path.join(cache, '.links');
  const candidates = ['playwright', 'playwright-core'];
  for (const name of (await readdir(links).catch(() => [])).sort()) {
    const directory = (await readFile(path.join(links, name), 'utf8')).trim();
    if (existsSync(directory)) candidates.push(directory);
  }
  const errors = [];
  for (const candidate of preferredPackage ? [preferredPackage] : candidates) {
    try {
      const { chromium } = require(candidate);
      return await chromium.launch({ headless: true, executablePath: env.QA_CHROMIUM || undefined });
    } catch (error) {
      errors.push(candidate + ' — ' + error.message.split('\n')[0]);
    }
  }
  throw Error('Provide QA_PLAYWRIGHT (absolute Playwright package directory) and optionally QA_CHROMIUM (Chromium executable).\n' + errors.join('\n'));
}

// Pin the exact self-contained release bytes for both devices and all reloads.
export async function serveBuild(filename) {
  const html = await readFile(filename);
  const hash = createHash('sha256').update(html).digest('hex');
  const server = createServer((req, res) => {
    if (req.url === '/index.html' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(html);
    } else {
      res.writeHead(req.url === '/favicon.ico' ? 204 : 404);
      res.end();
    }
  });
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  console.log('Build', filename, 'SHA-256', hash);
  return { server, url: 'http://127.0.0.1:' + server.address().port + '/index.html' };
}

export async function runDevice(browser, url, device, scenario) {
  const mobile = device === 'mobile';
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1100, height: 760 },
    hasTouch: mobile, isMobile: mobile, deviceScaleFactor: mobile ? 2 : 1,
    reducedMotion: 'reduce',
  });
  try {
    assert.deepEqual((await context.storageState()).origins, []);
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const cdp = mobile && await context.newCDPSession(page);
    const errors = [];
    const iceTouches = [];
    if (mobile) {
      // Observe trusted browser input across the dive-to-shore transition.
      // Chromium can hit-test the compatibility click after a new sheet opens.
      page.on('console', message => {
        const prefix = 'QA Ice input ';
        if (!message.text().startsWith(prefix)) return;
        iceTouches.push(message.text().slice(prefix.length));
        if (iceTouches.length > 8) iceTouches.shift();
      });
      await page.addInitScript(() => {
        const name = el => {
          const node = el?.closest('[data-ice],[data-move],[data-ice-tool]');
          return node?.dataset.move || node?.dataset.ice || node?.dataset.iceTool || el?.tagName;
        };
        for (const type of ['pointerdown', 'pointerup', 'touchend', 'click']) {
          document.addEventListener(type, event => {
            if (!event.target.closest?.('#ice-expedition')) return;
            const p = event.changedTouches?.[0] || event;
            console.debug('QA Ice input ' + JSON.stringify({
              type, trusted: event.isTrusted, ms: Math.round(event.timeStamp), target: name(event.target),
              x: Math.round(p.clientX), y: Math.round(p.clientY), hit: name(document.elementFromPoint(p.clientX, p.clientY)),
            }));
          }, { capture: true, passive: true });
        }
      });
    }
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
    const act = locator => mobile ? locator.tap() : locator.click();
    const touch = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
    async function holdControl(locator, key, action) {
      if (mobile) {
        await locator.scrollIntoViewIfNeeded();
        const box = await locator.boundingBox();
        assert.ok(box, 'Touch control must be visible: ' + locator);
        await touch('touchStart', [{ x: box.x + box.width / 2, y: box.y + box.height / 2, id: 1 }]);
      } else await page.keyboard.down(key);
      try { await action(); } finally {
        if (mobile) await touch('touchEnd', []);
        else await page.keyboard.up(key);
      }
    }
    async function swim(vertical, action, {gentle=false}={}) {
      const key = vertical > 0 ? 'ArrowDown' : 'ArrowUp';
      if (mobile) {
        const box = await page.locator('#game').boundingBox();
        const point = { x: box.x + box.width * .32, y: box.y + box.height * .54, id: 1 };
        await touch('touchStart', [point]);
        await touch('touchMove', [{ ...point, y: point.y + vertical * (gentle ? 24 : 55) }]);
      } else {
        if (gentle) await page.keyboard.down('Shift');
        await page.keyboard.down(key);
      }
      try { await action(); } finally {
        if (mobile) await touch('touchEnd', []);
        else {
          await page.keyboard.up(key);
          if (gentle) await page.keyboard.up('Shift');
        }
      }
    }
    async function camera(action) {
      if (mobile) {
        const box = await page.locator('#game').boundingBox();
        // Camera is painted on the game canvas at this normalized HUD slot.
        await touch('touchStart', [{ x: box.x + box.width * .665, y: box.y + box.height * .905, id: 1 }]);
      } else await page.keyboard.down('x');
      try { await action(); } finally {
        if (mobile) await touch('touchEnd', []);
        else await page.keyboard.up('x');
      }
    }
    await page.goto(url);
    try {
      await scenario({ page, act, swim, camera, holdControl, device, mobile });
      assert.deepEqual(errors, [], 'Browser errors');
    } catch (error) {
      console.error(device, 'visible screen:', (await page.locator('body').innerText()).slice(-1600), errors);
      if (iceTouches.length) console.error('Recent Ice input:\n' + iceTouches.join('\n'));
      throw error;
    }
  } finally {
    await context.close();
  }
}
