import { json, publicUser, requireRole, sameOrigin } from '../../server/auth.js';
import { readDatabase, writeDatabase } from '../../server/db.js';

export default async function handler(request, response) {
  const session = await requireRole(request, ['admin']);
  if (!session) return json(response, 403, { error: 'Akses ditolak' });
  if (!sameOrigin(request)) return json(response, 403, { error: 'Invalid origin' });
  try {
    if (request.method === 'GET') {
      const { data } = await readDatabase();
      return json(response, 200, { users: data.users.map(publicUser) });
    }
    if (request.method === 'PATCH') {
      const id = String(request.body?.id || '');
      const role = String(request.body?.role || '');
      if (!id || !['customer', 'merchant', 'admin'].includes(role) || id === session.sub) {
        return json(response, 400, { error: 'Perubahan tidak valid' });
      }
      const updated = await writeDatabase((database) => {
        const user = database.users.find((item) => item.id === id);
        if (!user) throw new Error('User not found');
        user.role = role;
        return database;
      }, 'Update user role');
      return json(response, 200, { users: updated.users.map(publicUser) });
    }
    return json(response, 405, { error: 'Method not allowed' });
  } catch {
    return json(response, 500, { error: 'Tidak dapat memperbarui user' });
  }
}
