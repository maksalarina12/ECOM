import crypto from 'node:crypto';

const COOKIE = 'ecom_session';
const MAX_AGE = 60 * 60 * 8;

function secret() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 characters');
  }
  return process.env.SESSION_SECRET;
}

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const sign = (value) => crypto.createHmac('sha256', secret()).update(value).digest('base64url');

export function createSession(user) {
  const payload = encode({
    sub: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  });
  return `${payload}.${sign(payload)}`;
}

export function sessionCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=${token}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=0`;
}

export function parseSession(request) {
  const cookie = request.headers.cookie || '';
  const value = cookie.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) return null;
  return session;
}

export async function verifyPassword(password, stored) {
  const [algorithm, salt, hash] = stored.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;
  const candidate = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key.toString('hex')));
  });
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'));
}

export function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function requireRole(request, roles) {
  const session = parseSession(request);
  if (!session) return null;
  // The signed cookie proves identity only. Load the current account so role
  // changes and deactivation take effect immediately on every API request.
  const { readDatabase } = await import('./db.js');
  const { data } = await readDatabase();
  const user = data.users.find((item) => item.id === session.sub && item.active !== false);
  if (!user || !roles.includes(user.role)) return null;
  return { sub: user.id, role: user.role };
}

export function json(response, status, data, headers = {}) {
  response.status(status);
  Object.entries({
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  }).forEach(([key, value]) => response.setHeader(key, value));
  response.json(data);
}

export function sameOrigin(request) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return true;
  const origin = request.headers.origin;
  const host = request.headers.host;
  return !origin || new URL(origin).host === host;
}
