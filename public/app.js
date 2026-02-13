const authBox = document.querySelector('#auth');
const gameBox = document.querySelector('#game');
const authStatus = document.querySelector('#auth-status');
const kpi = document.querySelector('#kpi');
const market = document.querySelector('#market');
const routeSelect = document.querySelector('#route-select');
const aircraftSelect = document.querySelector('#aircraft-select');
const flightsBox = document.querySelector('#flights');
const leaderboard = document.querySelector('#leaderboard');
const catalog = document.querySelector('#catalog');
const liveFeed = document.querySelector('#live-feed');

let world;
let me;
let stream;

const euro = (v) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

async function api(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Errore API');
  return data;
}

function renderKpis() {
  kpi.innerHTML = [
    `Compagnia: <strong>${me.airline.name}</strong>`,
    `Hub: <strong>${me.airline.hub}</strong>`,
    `Cash: <strong>${euro(me.airline.cash)}</strong>`,
    `Reputazione: <strong>${me.airline.reputation.toFixed(1)}</strong>`,
    `Valore stimato: <strong>${euro(me.companyValue)}</strong>`
  ].map((t) => `<div class="kpi-chip">${t}</div>`).join('');
}

function renderWorld() {
  routeSelect.innerHTML = world.routes.map((r) => `<option value="${r.id}">${r.from}→${r.to} • ${r.distanceKm}km • ticket €${r.baseTicket}</option>`).join('');
  market.textContent = `Carburante: €${world.market.fuelPricePerUnit.toFixed(3)} /unit • Domanda globale: ${(world.market.demandModifier * 100).toFixed(1)}%`;
  catalog.innerHTML = world.aircraftCatalog.map((a) => `
    <div class="item">
      <strong>${a.name}</strong><br>
      <small>${a.seats} posti • autonomia ${a.rangeKm}km • burn ${a.fuelBurnPerKm}/km</small>
      <p>${euro(a.price)}</p>
      <button data-buy="${a.id}">Acquista</button>
    </div>`).join('');
}

function renderMe() {
  aircraftSelect.innerHTML = me.airline.aircraft
    .filter((a) => a.status === 'available')
    .map((a) => {
      const model = world.aircraftCatalog.find((m) => m.id === a.modelId);
      return `<option value="${a.id}">${model.name} (${a.health.toFixed(0)}% health)</option>`;
    })
    .join('') || '<option value="">Nessun aereo disponibile</option>';

  flightsBox.innerHTML = me.flights.map((f) => `
    <div class="item">
      <strong>${f.routeLabel}</strong> • ${f.modelName}<br>
      <small>Stato: ${f.status} | Profitto atteso: ${euro(f.snapshot.profit)} | Pax: ${f.snapshot.seatsSold}</small>
    </div>
  `).join('') || '<small>Nessun volo al momento.</small>';

  renderKpis();
}

async function refresh() {
  world = await api('/api/world');
  me = await api('/api/me');
  const lb = await api('/api/leaderboard');
  renderWorld();
  renderMe();
  leaderboard.innerHTML = lb.map((x) => `<li>${x.name} (${x.hub}) — ${euro(x.cash)}</li>`).join('');
}

function showGame() {
  authBox.classList.add('hidden');
  gameBox.classList.remove('hidden');
}

function showAuth() {
  authBox.classList.remove('hidden');
  gameBox.classList.add('hidden');
}

async function bootstrap() {
  try {
    await refresh();
    showGame();
    if (stream) stream.close();
    stream = new EventSource('/api/stream', { withCredentials: true });
    stream.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      liveFeed.innerHTML = `
      <div class="item">Fuel live: €${payload.market.fuelPricePerUnit.toFixed(3)}</div>
      ${payload.topAirlines.map((x) => `<div class="item">${x.name}: ${euro(x.cash)}</div>`).join('')}`;
    };
  } catch {
    showAuth();
  }
}


document.querySelector('#register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.currentTarget);
  try {
    await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: f.get('email'),
        password: f.get('password'),
        airlineName: f.get('airlineName'),
        hub: f.get('hub')
      })
    });
    authStatus.textContent = 'Registrazione completata.';
    await bootstrap();
  } catch (err) {
    authStatus.textContent = err.message;
  }
});

document.querySelector('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.currentTarget);
  try {
    await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: f.get('email'), password: f.get('password') })
    });
    authStatus.textContent = 'Login effettuato.';
    await bootstrap();
  } catch (err) {
    authStatus.textContent = err.message;
  }
});

document.querySelector('#launch-flight-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.querySelector('#launch-status');
  try {
    await api('/api/flights/launch', {
      method: 'POST',
      body: JSON.stringify({ routeId: routeSelect.value, aircraftId: aircraftSelect.value })
    });
    status.textContent = 'Volo pianificato e in corso.';
    await refresh();
  } catch (err) {
    status.textContent = err.message;
  }
});

catalog.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-buy]');
  if (!btn) return;
  try {
    await api('/api/aircraft/purchase', { method: 'POST', body: JSON.stringify({ modelId: btn.dataset.buy }) });
    await refresh();
  } catch (err) {
    alert(err.message);
  }
});

document.querySelector('#logout').addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' });
  if (stream) stream.close();
  showAuth();
});

bootstrap();
setInterval(() => {
  if (!gameBox.classList.contains('hidden')) refresh();
}, 12000);
