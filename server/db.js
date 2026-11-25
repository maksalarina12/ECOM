const owner = process.env.DB_REPO_OWNER;
const repo = process.env.DB_REPO_NAME;
const token = process.env.DB_GITHUB_TOKEN;
const path = 'db.json';

function configuration() {
  if (!owner || !repo || !token) throw new Error('Database environment is not configured');
  return { owner, repo, token };
}

async function request(method, body) {
  configuration();
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ECOM-Server',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = new Error(`Database request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function readDatabase() {
  const file = await request('GET');
  const json = Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8');
  return { data: JSON.parse(json), sha: file.sha };
}

export async function writeDatabase(data, message = 'Update application data') {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readDatabase();
    const next = typeof data === 'function' ? data(structuredClone(current.data)) : data;
    try {
      await request('PUT', {
        message,
        content: Buffer.from(JSON.stringify(next, null, 2)).toString('base64'),
        sha: current.sha,
      });
      return next;
    } catch (error) {
      // Only retry optimistic-lock conflicts. Retrying auth, network, or
      // validation failures can hide the real problem and repeat side effects.
      if (error.status !== 409 || attempt === 2) throw error;
    }
  }
}
