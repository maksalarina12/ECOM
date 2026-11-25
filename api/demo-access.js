import { json } from '../server/auth.js';

const values = [
  ['Customer', 'DEMO_CUSTOMER_EMAIL', 'DEMO_CUSTOMER_PASSWORD'],
  ['Merchant', 'DEMO_MERCHANT_EMAIL', 'DEMO_MERCHANT_PASSWORD'],
  ['Admin', 'DEMO_ADMIN_EMAIL', 'DEMO_ADMIN_PASSWORD'],
];

export default function handler(request, response) {
  if (request.method !== 'GET') return json(response, 405, { error: 'Method not allowed' });
  const accounts = values.map(([role, emailKey, passwordKey]) => ({
    role,
    email: process.env[emailKey],
    password: process.env[passwordKey],
  })).filter((account) => account.email && account.password);

  return json(response, 200, { accounts });
}
