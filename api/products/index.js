import defaults from '../../server/products.json' with { type: 'json' };
import { json, requireRole, sameOrigin } from '../../server/auth.js';
import { readDatabase, writeDatabase } from '../../server/db.js';

const CATEGORIES = ['Sleep', 'Living', 'Craft'];
const MODELS = ['mattress', 'lamp', 'wardrobe', 'bedframe', 'side', 'sofa', 'chair', 'coffee', 'rattan', 'vase', 'craft'];
const text = (value, max) => String(value ?? '').trim().slice(0, max);

function cleanProduct(input) {
  const product = {
    id: text(input?.id, 48).toLowerCase(),
    name: text(input?.name, 100),
    category: text(input?.category, 20),
    subtitle: text(input?.subtitle, 120),
    price: Number(input?.price),
    stock: Number(input?.stock),
    material: text(input?.material, 240),
    dimensions: text(input?.dimensions, 120),
    description: text(input?.description, 1000),
    image: text(input?.image || input?.id, 120),
  };
  const model = text(input?.model, 24);
  if (model) product.model = model;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(product.id) || product.name.length < 2 || !CATEGORIES.includes(product.category)
    || !Number.isSafeInteger(product.price) || product.price < 1 || product.price > 1_000_000_000
    || !Number.isSafeInteger(product.stock) || product.stock < 0 || product.stock > 1_000_000
    || !product.subtitle || !product.description || (model && !MODELS.includes(model))) {
    throw new Error('Data produk tidak valid');
  }
  return product;
}

export default async function handler(request, response) {
  try {
    if (request.method === 'GET') {
      const { data } = await readDatabase();
      return json(response, 200, { products: Array.isArray(data.products) ? data.products : defaults });
    }
    if (!['POST', 'PATCH', 'DELETE'].includes(request.method)) return json(response, 405, { error: 'Method not allowed' });
    if (!sameOrigin(request)) return json(response, 403, { error: 'Invalid origin' });
    const session = await requireRole(request, ['merchant', 'admin']);
    if (!session) return json(response, 403, { error: 'Akses ditolak' });

    const updated = await writeDatabase((database) => {
      database.products = Array.isArray(database.products) ? database.products : structuredClone(defaults);
      if (request.method === 'DELETE') {
        const id = text(request.body?.id, 48).toLowerCase();
        const length = database.products.length;
        database.products = database.products.filter((product) => product.id !== id);
        if (length === database.products.length) throw new Error('Produk tidak ditemukan');
      } else {
        const product = cleanProduct(request.body);
        const index = database.products.findIndex((item) => item.id === product.id);
        if (request.method === 'POST') {
          if (index !== -1) throw new Error('ID produk sudah digunakan');
          database.products.push(product);
        } else {
          if (index === -1) throw new Error('Produk tidak ditemukan');
          database.products[index] = product;
        }
      }
      return database;
    }, 'Update product catalog');
    return json(response, 200, { products: updated.products });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const clientError = ['Data produk tidak valid', 'ID produk sudah digunakan', 'Produk tidak ditemukan'].includes(message);
    return json(response, clientError ? 400 : 503, { error: clientError ? message : 'Tidak dapat memperbarui katalog' });
  }
}
