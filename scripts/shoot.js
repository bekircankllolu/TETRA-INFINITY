/* Web sürümünü başsız chromium ile yakalar: her ekranın PNG'sini /tmp/shots'a yazar.
 * Kullanım: node scripts/shoot.js  (önce: npx expo export --platform web) */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const DIST = path.join(__dirname, '..', 'dist');
const OUT = '/tmp/shots';
const PORT = 8099;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.wav': 'audio/wav',
  '.map': 'application/json', '.svg': 'image/svg+xml',
};

function serve() {
  return http.createServer((req, res) => {
    let url = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(DIST, url === '/' ? 'index.html' : url);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
    const ext = path.extname(file);
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = serve();
  await new Promise((r) => server.listen(PORT, r));

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // bundle + font yüklenmesi

  const shot = async (name) => {
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    console.log('shot:', name);
  };

  // Koleksiyon için biraz coin + bir skin aç (daha dolu görünsün)
  await page.evaluate(() => {
    const prefs = globalThis.__prefs;
    if (prefs) {
      prefs.setState((s) => ({
        profile: { ...s.profile, coins: 1850, gems: 12, xp: 12450, unlockedSkins: ['crystal', 'retro'] },
      }));
    }
  });

  const nav = async (status) => {
    await page.evaluate((st) => globalThis.__gameStore.getState().navigate(st), status);
  };

  await nav('menu'); await shot('01-menu');
  await nav('modeSelect'); await shot('02-mode-select');
  await nav('settings'); await shot('03-settings');
  await nav('collection'); await shot('04-collection');
  await nav('leaderboard'); await shot('05-leaderboard');

  // Oyun ekranı: başlat ve board'u biraz doldur
  await page.evaluate(() => {
    const g = globalThis.__gameStore.getState();
    g.startGame('marathon');
    const d = (a) => globalThis.__gameStore.getState().dispatch(a);
    const moves = [-4, 3, -2, 4, 0, -3, 2, -1, 4, -4];
    for (const m of moves) {
      for (let i = 0; i < Math.abs(m); i++) d({ type: 'MOVE', dir: m < 0 ? -1 : 1 });
      d({ type: 'ROTATE', dir: 'cw' });
      d({ type: 'HARD_DROP' });
    }
  });
  await shot('06-game');

  // Duraklatma
  await page.evaluate(() => globalThis.__gameStore.getState().pause());
  await shot('07-pause');

  // Oyun bitti (board dolu kalsın)
  await page.evaluate(() => globalThis.__gameStore.setState({ status: 'gameover' }));
  await shot('08-gameover');

  await browser.close();
  server.close();
  console.log('Bitti →', OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
