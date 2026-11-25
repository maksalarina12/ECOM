import crypto from 'node:crypto';
import defaults from '../../server/products.json' with { type: 'json' };
import catalog from '../../server/catalog.json' with { type: 'json' };
import { json, requireRole, sameOrigin } from '../../server/auth.js';
import { readDatabase, writeDatabase } from '../../server/db.js';

const STATUSES = ['Pending', 'Confirmed', 'Processing', 'Completed', 'Cancelled'];
const TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Processing', 'Cancelled'],
  Processing: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

function itemTotal(items, products) {
  return items.reduce((sum, item) => {
    const price = item.id === 'rest'
      ? catalog.variants.find((variant) => variant.id === item.variant)?.price
      : products.find((product) => product.id === item.id)?.price;
    if (!price) throw new Error('Produk atau varian tidak dikenal');
    return sum + price * item.qty;
  }, 0);
}

export default async function handler(request, response) {
  try {
    const session = await requireRole(request, ['customer', 'merchant', 'admin']);
    if (!session) return json(response, 401, { error: 'Masuk terlebih dahulu' });
    if (!sameOrigin(request)) return json(response, 403, { error: 'Invalid origin' });

    if (request.method === 'GET') {
      const { data } = await readDatabase();
      const orders = session.role === 'customer'
        ? data.orders.filter((order) => order.userId === session.sub)
        : data.orders;
      return json(response, 200, { orders });
    }

    if (request.method === 'POST') {
      const items = Array.isArray(request.body?.items) ? request.body.items : [];
      if (!items.length || items.length > 30) return json(response, 400, { error: 'Keranjang tidak valid' });
      const clean = items.map((item) => ({
        id: String(item.id || ''),
        variant: String(item.variant || ''),
        qty: Number(item.qty),
      }));
      if (clean.some((item) => !Number.isSafeInteger(item.qty) || item.qty < 1 || item.qty > 20)) {
        return json(response, 400, { error: 'Jumlah produk tidak valid' });
      }
      const name = String(request.body?.customer || '').trim().slice(0, 120);
      const email = String(request.body?.email || '').trim().toLowerCase().slice(0, 160);
      const address = String(request.body?.address || '').trim().slice(0, 500);
      const payment = ['transfer', 'qris', 'cod'].includes(request.body?.payment) ? request.body.payment : 'transfer';
      if (name.length < 2 || !email.includes('@') || address.length < 12) {
        return json(response, 400, { error: 'Data pengiriman tidak lengkap' });
      }
      const order = {
        id: 'EC-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
        userId: session.sub,
        date: new Date().toISOString(),
        customer: name,
        email,
        address,
        payment,
        items: clean,
        total: 0,
        status: 'Pending',
        inventoryReserved: true,
      };
      const updated = await writeDatabase((database) => {
        database.products = Array.isArray(database.products) ? database.products : structuredClone(defaults);
        database.orders = Array.isArray(database.orders) ? database.orders : [];
        const counts = new Map();
        for (const item of clean) counts.set(item.id, (counts.get(item.id) || 0) + item.qty);
        for (const [id, qty] of counts) {
          const product = database.products.find((candidate) => candidate.id === id);
          if (!product) throw new Error('Produk tidak ditemukan');
          if (product.stock < qty) throw new Error('Stok produk tidak mencukupi');
        }
        order.total = itemTotal(clean, database.products);
        for (const [id, qty] of counts) {
          database.products.find((product) => product.id === id).stock -= qty;
        }
        database.orders.unshift(order);
        return database;
      }, 'Create order and reserve inventory');
      return json(response, 201, { order: updated.orders.find((item) => item.id === order.id), products: updated.products });
    }

    if (request.method === 'PATCH') {
      if (!['merchant', 'admin'].includes(session.role)) return json(response, 403, { error: 'Akses ditolak' });
      const id = String(request.body?.id || '');
      const status = String(request.body?.status || '');
      if (!STATUSES.includes(status)) return json(response, 400, { error: 'Status tidak valid' });
      const updated = await writeDatabase((database) => {
        const order = database.orders.find((item) => item.id === id);
        if (!order) throw new Error('Pesanan tidak ditemukan');
        if (!TRANSITIONS[order.status]?.includes(status)) throw new Error('Perubahan status tidak diizinkan');
        if (status === 'Cancelled' && order.inventoryReserved) {
          for (const item of order.items) {
            const product = database.products.find((candidate) => candidate.id === item.id);
            if (product) product.stock += item.qty;
          }
          order.inventoryReserved = false;
        }
        order.status = status;
        return database;
      }, 'Update order status');
      return json(response, 200, { order: updated.orders.find((item) => item.id === id), products: updated.products });
    }

    return json(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const clientErrors = ['Produk atau varian tidak dikenal', 'Produk tidak ditemukan', 'Stok produk tidak mencukupi', 'Pesanan tidak ditemukan', 'Perubahan status tidak diizinkan'];
    if (clientErrors.includes(message)) return json(response, 400, { error: message });
    return json(response, 503, { error: 'Tidak dapat memproses pesanan' });
  }
}
