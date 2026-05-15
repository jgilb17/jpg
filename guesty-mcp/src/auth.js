import 'dotenv/config';

const TOKEN_URL = 'https://auth.guesty.com/oauth2/token';

let cachedToken = null;
let tokenExpiresAt = 0;

export async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 30_000) {
    return cachedToken;
  }

  const { GUESTY_CLIENT_ID, GUESTY_CLIENT_SECRET } = process.env;
  if (!GUESTY_CLIENT_ID || !GUESTY_CLIENT_SECRET) {
    throw new Error('GUESTY_CLIENT_ID and GUESTY_CLIENT_SECRET must be set');
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: GUESTY_CLIENT_ID,
    client_secret: GUESTY_CLIENT_SECRET,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Guesty auth failed ${res.status}: ${text}`);
  }

  const { access_token, expires_in } = await res.json();
  cachedToken = access_token;
  tokenExpiresAt = Date.now() + expires_in * 1000;
  return cachedToken;
}
