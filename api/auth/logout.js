import { clearSessionCookie, json, sameOrigin } from '../../server/auth.js';

export default function handler(request, response) {
  if (request.method !== 'POST') return json(response, 405, { error: 'Method not allowed' });
  if (!sameOrigin(request)) return json(response, 403, { error: 'Invalid origin' });
  response.setHeader('Set-Cookie', clearSessionCookie());
  return json(response, 200, { ok: true });
}
