import { parseSession, json, publicUser } from '../../server/auth.js';
import { readDatabase } from '../../server/db.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return json(response, 405, { error: 'Method not allowed' });
  const session = parseSession(request);
  if (!session) return json(response, 401, { user: null });
  try {
    const { data } = await readDatabase();
    const user = data.users.find((item) => item.id === session.sub && item.active !== false);
    if (!user || user.role !== session.role) return json(response, 401, { user: null });
    return json(response, 200, { user: publicUser(user) });
  } catch {
    return json(response, 503, { error: 'Layanan autentikasi tidak tersedia' });
  }
}
