const fs = require('fs');
const path = require('path');
const mineflayer = require('mineflayer');

function readTextFileLines(file) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, 'utf8');
  return raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
}

function readJSONFile(file, fallback) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return fallback;
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function parseServers() {
  const lines = readTextFileLines('servers.txt');
  return lines
    .map(l => l.split('#')[0].trim())
    .filter(Boolean)
    .map(s => {
      const parts = s.split(':');
      const host = (parts[0] || '').trim();
      const port = Number((parts[1] || '').trim()) || 25565;
      return { host, port };
    })
    .filter(x => x.host.length > 0);
}

function parseActivities() {
  const lines = readTextFileLines('atividades.txt');
  const acts = [];
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      acts.push(obj);
    } catch {
    }
  }
  return acts;
}

function normalizePrefixes(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(x => {
    if (typeof x === 'string') return { value: x, position: 'start' };
    const v = (x && x.value) ? String(x.value) : '';
    const pos = (x && x.position === 'end') ? 'end' : 'start';
    return { value: v, position: pos };
  }).filter(x => x.value.length > 0);
}

function randomBaseName() {
  const syllables = ['lu', 'zi', 'pro', 'tek', 'no', 'ra', 'go', 'mi', 'cha', 'lo', 'ax', 've', 'do', 'qu'];
  const pick = () => syllables[Math.floor(Math.random() * syllables.length)];
  const base = pick() + pick() + pick();
  const num = Math.floor(100 + Math.random() * 900);
  return base.charAt(0).toUpperCase() + base.slice(1) + num;
}

function makeUsername(prefixes, idx, baseOverride) {
  const base = baseOverride || randomBaseName();
  if (!prefixes.length) return base;
  const p = prefixes[idx % prefixes.length];
  const suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  if (p.position === 'end') return base + p.value + suffix;
  return p.value + base + suffix;
}

function matchesItem(item, act) {
  if (!item) return false;
  if (act.item) {
    const name = String(act.item).toLowerCase();
    const iname = String(item.name || '').toLowerCase();
    if (iname.includes(name)) return true;
  }
  if (act.itemId) {
    const parts = String(act.itemId).split(/[/:]/);
    const id = Number(parts[0]);
    const meta = parts[1] !== undefined ? Number(parts[1]) : undefined;
    if (item.type === id) {
      if (meta === undefined) return true;
      if (item.metadata === meta) return true;
    }
  }
  return false;
}

function clickMatchingSlot(bot, act) {
  const win = bot.currentWindow;
  if (!win) return;
  for (let i = 0; i < win.slots.length; i++) {
    const it = win.slots[i];
    if (matchesItem(it, act)) {
      bot.clickWindow(i, 0, 0);
      break;
    }
  }
}

function applyAction(bot, act, config) {
  if (!act || !bot) return;
  if (act.type === 'register_on_join') {
    const pwd = config.registerPassword || '123456';
    bot.chat(`/register ${pwd} ${pwd}`);
    return;
  }
  if (act.type === 'command' && act.text) {
    bot.chat(String(act.text));
    return;
  }
  if (act.type === 'menu_select') {
    clickMatchingSlot(bot, act);
    return;
  }
  if (act.type === 'walk') {
    const dur = Number(act.durationMs || 1000);
    bot.setControlState('forward', true);
    setTimeout(() => bot.setControlState('forward', false), dur);
    return;
  }
}

function scheduleOn(bot, acts, trigger, config) {
  for (const a of acts) {
    if (a.trigger === trigger) {
      const d = Number(a.delay || 0);
      setTimeout(() => applyAction(bot, a, config), d);
    }
  }
}

function scheduleAfter(bot, acts, config) {
  for (const a of acts) {
    if (a.afterMs !== undefined) {
      const d = Number(a.afterMs || 0);
      setTimeout(() => applyAction(bot, a, config), d);
    }
  }
}

function createAndWireBot(server, username, config, activities) {
  const bot = mineflayer.createBot({
    host: server.host,
    port: server.port,
    username,
    version: config.version || false
  });
  bot.once('spawn', () => {
    const regActAuto = { type: 'register_on_join', delay: Math.floor(Math.random() * 5000) };
    setTimeout(() => applyAction(bot, regActAuto, config), regActAuto.delay);
    scheduleOn(bot, activities, 'on_join', config);
    scheduleAfter(bot, activities, config);
  });
  bot.on('windowOpen', () => {
    scheduleOn(bot, activities, 'on_window_open', config);
  });
  bot.on('kicked', r => {
    try { console.log('Kicked:', r); } catch {}
  });
  bot.on('error', e => {
    try { console.log('Error:', e && e.message ? e.message : String(e)); } catch {}
  });
  return bot;
}

function main() {
  const servers = parseServers();
  const activities = parseActivities();
  const config = readJSONFile('config.txt', {});
  const totalBots = Number(config.bots || 1);
  const prefixes = normalizePrefixes(config.namePrefixes || []);
  const baseOverride = typeof config.baseName === 'string' ? config.baseName : undefined;
  if (!servers.length) {
    console.log('Nenhum servidor em servers.txt');
    return;
  }
  for (const srv of servers) {
    for (let i = 0; i < totalBots; i++) {
      const uname = makeUsername(prefixes, i, baseOverride);
      createAndWireBot(srv, uname, config, activities);
    }
  }
}

main();
