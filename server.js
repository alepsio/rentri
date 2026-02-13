import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT || 3000);
const ROOT = process.cwd();
const DB_PATH = path.join(ROOT, 'data', 'store.json');

const WORLD = {
  aircraftCatalog: [
    { id: 'atr72', name: 'ATR 72-600', seats: 70, rangeKm: 1528, fuelBurnPerKm: 2.3, price: 14500000 },
    { id: 'a320', name: 'Airbus A320neo', seats: 186, rangeKm: 6300, fuelBurnPerKm: 3.9, price: 111000000 },
    { id: 'b787', name: 'Boeing 787-9', seats: 290, rangeKm: 14140, fuelBurnPerKm: 5.7, price: 292000000 }
  ],
  airports: [
    { code: 'MXP', city: 'Milano', country: 'IT' },
    { code: 'FCO', city: 'Roma', country: 'IT' },
    { code: 'JFK', city: 'New York', country: 'US' },
    { code: 'LHR', city: 'Londra', country: 'UK' },
    { code: 'DXB', city: 'Dubai', country: 'AE' },
    { code: 'HND', city: 'Tokyo', country: 'JP' }
  ],
  routes: [
    { id: 'mxp-fco', from: 'MXP', to: 'FCO', distanceKm: 510, demand: 0.88, baseTicket: 125 },
    { id: 'mxp-lhr', from: 'MXP', to: 'LHR', distanceKm: 990, demand: 0.83, baseTicket: 190 },
    { id: 'fco-jfk', from: 'FCO', to: 'JFK', distanceKm: 6880, demand: 0.91, baseTicket: 940 },
    { id: 'lhr-dxb', from: 'LHR', to: 'DXB', distanceKm: 5500, demand: 0.79, baseTicket: 760 },
    { id: 'dxb-hnd', from: 'DXB', to: 'HND', distanceKm: 7930, demand: 0.8, baseTicket: 880 },
    { id: 'jfk-hnd', from: 'JFK', to: 'HND', distanceKm: 10870, demand: 0.74, baseTicket: 1230 }
  ]
};

function randomId() { return crypto.randomBytes(16).toString('hex'); }
function sendJson(res, code, data, headers = {}) {
  res.writeHead(code, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(data));
}
function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(raw.split(';').map((p) => p.trim()).filter(Boolean).map((p) => {
    const idx = p.indexOf('=');
    return [p.slice(0, idx), decodeURIComponent(p.slice(idx + 1))];
  }));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', (c) => { b += c; if (b.length > 1e6) req.destroy(); });
    req.on('end', () => {
      if (!b) return resolve({});
      try { resolve(JSON.parse(b)); } catch { reject(new Error('JSON non valido')); }
    });
  });
}
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const compare = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(compare, 'hex'));
}
function bootstrapDb() {
  if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], sessions: {}, airlines: [], flights: [], market: { fuelPricePerUnit: 2.45, demandModifier: 1, updatedAt: new Date().toISOString() } }, null, 2));
  }
}
function readDb() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function writeDb(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
function getAirline(db, userId) { return db.airlines.find((a) => a.userId === userId); }
function auth(req) {
  const sid = parseCookies(req).sid;
  if (!sid) return null;
  const db = readDb();
  const session = db.sessions[sid];
  if (!session) return null;
  return { db, sid, userId: session.userId };
}
function calculateFlight(route, aircraft, market) {
  const seatsSold = Math.floor(aircraft.seats * (route.demand * market.demandModifier));
  const ticketRevenue = seatsSold * route.baseTicket;
  const fuelUsed = route.distanceKm * aircraft.fuelBurnPerKm;
  const fuelCost = fuelUsed * market.fuelPricePerUnit;
  const serviceCost = seatsSold * 19;
  const profit = Math.max(-25000, Math.round(ticketRevenue - fuelCost - serviceCost));
  const durationMin = Math.round((route.distanceKm / 780) * 60 + 25);
  return { seatsSold, ticketRevenue, fuelUsed, fuelCost, serviceCost, profit, durationMin };
}
function refreshWorld() {
  const db = readDb();
  const swing = 1 + (Math.random() * 0.08 - 0.04);
  db.market.fuelPricePerUnit = Number(Math.max(1.7, Math.min(4.2, db.market.fuelPricePerUnit * swing)).toFixed(3));
  db.market.demandModifier = Number(Math.max(0.8, Math.min(1.15, db.market.demandModifier + (Math.random() * 0.04 - 0.02))).toFixed(3));
  db.market.updatedAt = new Date().toISOString();
  writeDb(db);
}

bootstrapDb();
setInterval(refreshWorld, 15000);

const clients = new Set();
setInterval(() => {
  const db = readDb();
  const payload = JSON.stringify({ market: db.market, topAirlines: db.airlines.map((a) => ({ name: a.name, cash: a.cash })).sort((a, b) => b.cash - a.cash).slice(0, 5) });
  for (const res of clients) res.write(`data: ${payload}\n\n`);
}, 5000);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/api/stream') {
    const session = auth(req);
    if (!session) return sendJson(res, 401, { error: 'Non autenticato' });
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/register') {
    try {
      const { email, password, airlineName, hub } = await readBody(req);
      if (!email || !password || !airlineName || !hub) return sendJson(res, 400, { error: 'Dati mancanti' });
      if (password.length < 8) return sendJson(res, 400, { error: 'Password troppo corta' });
      const db = readDb();
      if (db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) return sendJson(res, 409, { error: 'Email già registrata' });
      if (!WORLD.airports.find((a) => a.code === hub)) return sendJson(res, 400, { error: 'Hub non valido' });

      const userId = randomId();
      db.users.push({ id: userId, email, passwordHash: hashPassword(password), createdAt: new Date().toISOString() });
      db.airlines.push({ id: randomId(), userId, name: airlineName, hub, cash: 85000000, reputation: 50, aircraft: [{ id: randomId(), modelId: 'atr72', health: 100, status: 'available' }], stats: { completedFlights: 0, totalProfit: 0 } });
      const sid = randomId();
      db.sessions[sid] = { userId, createdAt: new Date().toISOString() };
      writeDb(db);
      return sendJson(res, 201, { ok: true }, { 'Set-Cookie': `sid=${sid}; HttpOnly; Path=/; SameSite=Lax` });
    } catch {
      return sendJson(res, 400, { error: 'Richiesta non valida' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    try {
      const { email, password } = await readBody(req);
      const db = readDb();
      const user = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
      if (!user || !verifyPassword(String(password || ''), user.passwordHash)) return sendJson(res, 401, { error: 'Credenziali non valide' });
      const sid = randomId();
      db.sessions[sid] = { userId: user.id, createdAt: new Date().toISOString() };
      writeDb(db);
      return sendJson(res, 200, { ok: true }, { 'Set-Cookie': `sid=${sid}; HttpOnly; Path=/; SameSite=Lax` });
    } catch {
      return sendJson(res, 400, { error: 'Richiesta non valida' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
    const session = auth(req);
    if (!session) return sendJson(res, 401, { error: 'Non autenticato' });
    delete session.db.sessions[session.sid];
    writeDb(session.db);
    return sendJson(res, 200, { ok: true }, { 'Set-Cookie': 'sid=; Path=/; Max-Age=0' });
  }

  if (req.method === 'GET' && url.pathname === '/api/world') {
    const session = auth(req);
    if (!session) return sendJson(res, 401, { error: 'Non autenticato' });
    return sendJson(res, 200, { ...WORLD, market: session.db.market });
  }

  if (req.method === 'GET' && url.pathname === '/api/me') {
    const session = auth(req);
    if (!session) return sendJson(res, 401, { error: 'Non autenticato' });
    const airline = getAirline(session.db, session.userId);
    const flights = session.db.flights.filter((f) => f.airlineId === airline.id).slice(-25).reverse();
    const value = airline.aircraft.reduce((sum, ac) => {
      const model = WORLD.aircraftCatalog.find((m) => m.id === ac.modelId);
      return sum + (model?.price || 0) * (ac.health / 100);
    }, 0);
    return sendJson(res, 200, { airline, flights, active: flights.filter((f) => f.status === 'in_flight').length, companyValue: Math.round(value + airline.cash) });
  }

  if (req.method === 'POST' && url.pathname === '/api/aircraft/purchase') {
    const session = auth(req);
    if (!session) return sendJson(res, 401, { error: 'Non autenticato' });
    const { modelId } = await readBody(req);
    const airline = getAirline(session.db, session.userId);
    const model = WORLD.aircraftCatalog.find((m) => m.id === modelId);
    if (!model) return sendJson(res, 404, { error: 'Modello non trovato' });
    if (airline.cash < model.price) return sendJson(res, 400, { error: 'Liquidità insufficiente' });
    airline.cash -= model.price;
    airline.aircraft.push({ id: randomId(), modelId: model.id, health: 100, status: 'available' });
    writeDb(session.db);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'POST' && url.pathname === '/api/flights/launch') {
    const session = auth(req);
    if (!session) return sendJson(res, 401, { error: 'Non autenticato' });
    const { routeId, aircraftId } = await readBody(req);
    const airline = getAirline(session.db, session.userId);
    const route = WORLD.routes.find((r) => r.id === routeId);
    if (!route) return sendJson(res, 404, { error: 'Tratta non trovata' });
    const aircraft = airline.aircraft.find((a) => a.id === aircraftId && a.status === 'available');
    if (!aircraft) return sendJson(res, 400, { error: 'Aereo non disponibile' });
    const model = WORLD.aircraftCatalog.find((m) => m.id === aircraft.modelId);
    if (model.rangeKm < route.distanceKm) return sendJson(res, 400, { error: 'Autonomia insufficiente' });

    const snapshot = calculateFlight(route, model, session.db.market);
    const depart = Date.now();
    const arrive = depart + snapshot.durationMin * 60000;

    aircraft.status = 'in_flight';
    aircraft.health = Math.max(70, aircraft.health - 1.2);
    const flight = {
      id: randomId(), airlineId: airline.id, routeLabel: `${route.from} → ${route.to}`,
      aircraftId: aircraft.id, modelName: model.name, status: 'in_flight',
      departAt: new Date(depart).toISOString(), arriveAt: new Date(arrive).toISOString(), snapshot
    };
    session.db.flights.push(flight);
    writeDb(session.db);

    setTimeout(() => {
      const db = readDb();
      const f = db.flights.find((x) => x.id === flight.id);
      const a = db.airlines.find((x) => x.id === airline.id);
      if (!f || !a || f.status === 'completed') return;
      f.status = 'completed';
      a.cash = Math.round(a.cash + f.snapshot.profit);
      a.stats.completedFlights += 1;
      a.stats.totalProfit += f.snapshot.profit;
      const ac = a.aircraft.find((x) => x.id === f.aircraftId);
      if (ac) ac.status = 'available';
      writeDb(db);
    }, snapshot.durationMin * 60000);

    return sendJson(res, 200, { ok: true, flight });
  }

  if (req.method === 'GET' && url.pathname === '/api/leaderboard') {
    const session = auth(req);
    if (!session) return sendJson(res, 401, { error: 'Non autenticato' });
    const ranked = session.db.airlines.map((a) => ({ name: a.name, hub: a.hub, cash: a.cash, reputation: a.reputation, flights: a.stats.completedFlights, totalProfit: a.stats.totalProfit })).sort((a, b) => b.cash - a.cash).slice(0, 20);
    return sendJson(res, 200, ranked);
  }

  const staticPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const full = path.join(ROOT, 'public', staticPath);
  if (full.startsWith(path.join(ROOT, 'public')) && fs.existsSync(full) && fs.statSync(full).isFile()) {
    const ext = path.extname(full);
    const type = ext === '.css' ? 'text/css' : ext === '.js' ? 'text/javascript' : 'text/html';
    res.writeHead(200, { 'Content-Type': type });
    return fs.createReadStream(full).pipe(res);
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`SkyLedger server running on http://localhost:${PORT}`);
});
