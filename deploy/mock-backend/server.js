import express from 'express';

const app = express();
app.use(express.json());

// Simple logger
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Catalog
app.get('/api/catalog', (req, res) => {
  res.json({ items: [], page: Number(req.query.page) || 1, totalPages: 1 });
});

app.get('/api/merchants/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Comercio Demo' });
});

// Auth
function tokens() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { accessToken: 'demo-access', refreshToken: 'demo-refresh', expiresAt: exp };
}
app.post('/api/auth/register', (req, res) => {
  res.json({ tokens: tokens(), user: { id: 'u1', name: 'Demo', phone: req.body?.phone } });
});
app.post('/api/auth/verify-sms', (req, res) => {
  res.json({ tokens: tokens(), user: { id: 'u1', name: 'Demo', phone: req.body?.phone } });
});

// Wallet
let wallet = [
  {
    id: 'w1',
    title: 'Cupón Demo',
    status: 'active',
    qrToken: 'QR-DEMO',
    qrExpiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

app.get('/api/wallet', (_req, res) => res.json(wallet));
app.post('/api/wallet', (req, res) => {
  const newItem = {
    id: 'w' + (wallet.length + 1),
    title: `Cupón ${req.body?.couponId || 'Nuevo'}`,
    status: 'active',
    qrToken: 'QR-' + Math.random().toString(36).slice(2, 8),
    qrExpiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  wallet.push(newItem);
  res.json(newItem);
});
app.get('/api/wallet/:id', (req, res) => {
  const it = wallet.find((w) => w.id === req.params.id);
  if (!it) return res.status(404).end();
  res.json(it);
});
app.post('/api/wallet/:id/redeem', (req, res) => {
  const idx = wallet.findIndex((w) => w.id === req.params.id);
  if (idx === -1) return res.status(404).end();
  wallet[idx] = { ...wallet[idx], status: 'redeemed' };
  res.json(wallet[idx]);
});

// Notifications
app.post('/api/notifications/subscribe', (_req, res) => res.status(204).end());
app.delete('/api/notifications/subscribe', (_req, res) => res.status(204).end());

// Support
app.post('/api/support/tickets', (_req, res) => res.json({ ok: true }));

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Mock backend listening on ' + port));

