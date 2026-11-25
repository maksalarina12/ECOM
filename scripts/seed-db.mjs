import crypto from 'node:crypto';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import products from '../server/products.json' with { type: 'json' };

const [owner, repo] = (process.env.DB_REPO || '').split('/');
if (!/^[\w.-]+$/.test(owner || '') || !/^[\w.-]+$/.test(repo || '')) {
  throw new Error('Set DB_REPO to OWNER/PRIVATE_REPO before seeding.');
}
const token = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();

const api = async (path, options = {}) => {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ECOM-Seed',
      ...options.headers,
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const error = new Error(`${path}: GitHub returned ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
};

let repository;
try {
  repository = await api(`/repos/${owner}/${repo}`);
} catch (error) {
  if (error.status !== 404) throw error;
  repository = await api('/user/repos', {
    method: 'POST',
    body: JSON.stringify({ name: repo, private: true, description: 'Private demo database for ECOM' }),
  });
}
if (repository.private !== true) throw new Error('Refusing to seed: repository must be private.');

const passwordHash = (value) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.scryptSync(value, salt, 64).toString('hex');
  return `scrypt$${salt}$${key}`;
};

let sha;
let database;
try {
  const file = await api(`/repos/${owner}/${repo}/contents/db.json`);
  sha = file.sha;
  database = JSON.parse(Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8'));
  database.products = Array.isArray(database.products) ? database.products : products;
  database.users = Array.isArray(database.users) ? database.users : [];
  database.orders = Array.isArray(database.orders) ? database.orders : [];
  console.log('Existing users, passwords, and orders preserved. Product catalog initialized if missing.');
} catch (error) {
  if (error.status !== 404) throw error;
  const accounts = [
    { id: 'usr_customer', name: 'Rina', email: 'customer@ecom.local', role: 'customer' },
    { id: 'usr_merchant', name: 'Ari', email: 'merchant@ecom.local', role: 'merchant' },
    { id: 'usr_admin', name: 'ECOM Admin', email: 'admin@ecom.local', role: 'admin' },
  ];
  const credentials = [];
  const users = accounts.map((account) => {
    const password = crypto.randomBytes(18).toString('base64url');
    credentials.push(`${account.role.padEnd(8)} ${account.email}  ${password}`);
    return { ...account, passwordHash: passwordHash(password), active: true };
  });
  database = { version: 1, users, orders: [], products };
  fs.writeFileSync('accounts.local.txt', `ECOM demo accounts (gitignored)\n${credentials.join('\n')}\n`, { mode: 0o600 });
  console.log('Created demo accounts and saved credentials to accounts.local.txt.');
}

await api(`/repos/${owner}/${repo}/contents/db.json`, {
  method: 'PUT',
  body: JSON.stringify({
    message: 'Initialize ECOM demo database',
    content: Buffer.from(JSON.stringify(database, null, 2)).toString('base64'),
    ...(sha ? { sha } : {}),
  }),
});
console.log(`Database initialized in private repository ${owner}/${repo}.`);
