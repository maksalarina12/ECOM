import { readDatabase } from '../../server/db.js';
import { createSession, json, publicUser, sameOrigin, sessionCookie, verifyPassword } from '../../server/auth.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return json(response, 405, { error: 'Method not allowed' });
  if (!sameOrigin(request)) return json(response, 403, { error: 'Invalid origin' });
  const email = String(request.body?.email || '').trim().toLowerCase();
  const password = String(request.body?.password || '');
  if (!email || password.length < 8) return json(response, 400, { error: 'Email atau password tidak valid' });
  try {
    const { data } = await readDatabase();
    const user = data.users.find((item) => item.email === email && item.active !== false);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return json(response, 401, { error: 'Email atau password salah' });
    }
    response.setHeader('Set-Cookie', sessionCookie(createSession(user)));
    return json(response, 200, { user: publicUser(user) });
  } catch {
    return json(response, 503, { error: 'Layanan autentikasi tidak tersedia' });
  }
}
