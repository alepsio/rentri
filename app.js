const STORAGE_KEYS = {
  products: 'rentri_products_v1',
  orders: 'rentri_orders_v1'
};

const defaultProducts = [
  {
    id: crypto.randomUUID(),
    title: 'Guida PDF RENTRI Operativo 2026',
    type: 'PDF',
    price: 79,
    description:
      'Manuale step-by-step su iscrizione, anagrafica aziendale, registri cronologici e controlli interni.'
  },
  {
    id: crypto.randomUUID(),
    title: 'Video Corso: FIR Digitale e gestione trasporti',
    type: 'Video Corso',
    price: 129,
    description:
      'Lezioni brevi mobile-friendly su compilazione FIR, deleghe, ruoli e casi pratici multi-sede.'
  },
  {
    id: crypto.randomUUID(),
    title: 'Documentazione Audit RENTRI',
    type: 'Documentazione',
    price: 99,
    description:
      'Checklist verifiche ispettive, KPI ambientali e modelli procedurali per conformità interna.'
  },
  {
    id: crypto.randomUUID(),
    title: 'Pacchetto FAQ Normative RENTRI',
    type: 'FAQ Pack',
    price: 49,
    description:
      'Risposte sintetiche su obblighi soggettivi, scadenze a scaglioni e interoperabilità software.'
  }
];

const qs = (sel) => document.querySelector(sel);

function loadData(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

let products = loadData(STORAGE_KEYS.products, defaultProducts);
let orders = loadData(STORAGE_KEYS.orders, []);
let adminLogged = false;

function saveProducts() {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

function saveOrders() {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}

function currency(value) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
}

function renderProducts(filterText = '') {
  const grid = qs('#product-grid');
  const selector = qs('#checkout-product');
  const text = filterText.trim().toLowerCase();

  const filtered = products.filter((p) =>
    [p.title, p.type, p.description].some((field) => field.toLowerCase().includes(text))
  );

  grid.innerHTML = filtered
    .map(
      (p) => `
      <article class="product-card">
        <span class="badge">${p.type}</span>
        <h4>${p.title}</h4>
        <p>${p.description}</p>
        <p class="price">${currency(p.price)}</p>
        <button class="btn buy-now" data-id="${p.id}">Acquista subito</button>
      </article>
    `
    )
    .join('');

  selector.innerHTML = products
    .map((p) => `<option value="${p.id}">${p.title} — ${currency(p.price)}</option>`)
    .join('');
}

function renderOrders() {
  const list = qs('#orders-list');
  if (!orders.length) {
    list.innerHTML = '<p class="small">Nessun ordine ricevuto.</p>';
    return;
  }
  list.innerHTML = orders
    .slice()
    .reverse()
    .map(
      (o) => `
      <article class="order-card">
        <div class="order-row">
          <strong>${o.customer.name}</strong>
          <span class="badge">${o.status}</span>
        </div>
        <p>${o.customer.email} • ${o.customer.company || 'Privato'}</p>
        <p>Prodotto: ${o.productTitle} (${currency(o.price)})</p>
        <div class="order-row">
          <small>${new Date(o.createdAt).toLocaleString('it-IT')}</small>
          <button class="btn mark-shipped" data-id="${o.id}" ${o.status === 'Evaso' ? 'disabled' : ''}>
            ${o.status === 'Evaso' ? 'Ordine evaso' : 'Segna come evaso'}
          </button>
        </div>
      </article>
    `
    )
    .join('');
}

function processCheckout(formData) {
  const product = products.find((p) => p.id === formData.productId);
  if (!product) {
    qs('#checkout-status').textContent = 'Prodotto non trovato.';
    return;
  }

  const order = {
    id: crypto.randomUUID(),
    status: 'In attesa',
    createdAt: new Date().toISOString(),
    productId: product.id,
    productTitle: product.title,
    price: product.price,
    customer: {
      name: formData.name,
      email: formData.email,
      company: formData.company
    }
  };

  orders.push(order);
  saveOrders();
  renderOrders();
  qs('#checkout-status').textContent = `Ordine completato: ${product.title}. Riceverai conferma via email.`;
  qs('#checkout-status').style.color = '#0f8a34';
}

function switchToAdmin(showAdmin) {
  qs('#store-view').classList.toggle('hidden', showAdmin);
  qs('#admin-view').classList.toggle('hidden', !showAdmin);
}

function initEvents() {
  qs('#search').addEventListener('input', (e) => renderProducts(e.target.value));

  qs('#product-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.buy-now');
    if (!btn) return;
    qs('#checkout-product').value = btn.dataset.id;
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });

  qs('#checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    processCheckout({
      name: f.get('name').toString().trim(),
      email: f.get('email').toString().trim(),
      company: f.get('company').toString().trim(),
      productId: qs('#checkout-product').value
    });
    e.currentTarget.reset();
    renderProducts(qs('#search').value);
  });

  qs('#go-admin').addEventListener('click', () => switchToAdmin(true));

  qs('#admin-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const username = f.get('username');
    const password = f.get('password');
    if (username === 'admin' && password === 'rentri2026') {
      adminLogged = true;
      qs('#admin-panel').classList.remove('hidden');
      qs('#admin-login-status').textContent = 'Accesso effettuato.';
      qs('#admin-login-status').style.color = '#0f8a34';
      e.currentTarget.classList.add('hidden');
    } else {
      qs('#admin-login-status').textContent = 'Credenziali non valide.';
      qs('#admin-login-status').style.color = '#bd1f2d';
    }
  });

  qs('#admin-logout').addEventListener('click', () => {
    adminLogged = false;
    qs('#admin-panel').classList.add('hidden');
    qs('#admin-login').classList.remove('hidden');
    qs('#admin-login').reset();
    qs('#admin-login-status').textContent = 'Logout completato.';
    qs('#admin-login-status').style.color = '#1f58c9';
    switchToAdmin(false);
  });

  qs('#add-product').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!adminLogged) return;
    const f = new FormData(e.currentTarget);
    const product = {
      id: crypto.randomUUID(),
      title: f.get('title').toString().trim(),
      type: f.get('type').toString(),
      price: Number(f.get('price')),
      description: f.get('description').toString().trim()
    };
    products.push(product);
    saveProducts();
    renderProducts(qs('#search').value);
    e.currentTarget.reset();
    qs('#add-product-status').textContent = `Prodotto "${product.title}" salvato.`;
    qs('#add-product-status').style.color = '#0f8a34';
  });

  qs('#orders-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.mark-shipped');
    if (!btn) return;
    const target = orders.find((o) => o.id === btn.dataset.id);
    if (!target) return;
    target.status = 'Evaso';
    saveOrders();
    renderOrders();
  });
}

renderProducts();
renderOrders();
initEvents();
