import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
try { process.loadEnvFile(new URL('./.env', import.meta.url)); } catch (e) {}

const BASE_URL = 'https://open-api.guesty.com/v1';

let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 300_000) return cachedToken;
  const res = await fetch('https://open-api.guesty.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.GUESTY_CLIENT_ID,
      client_secret: process.env.GUESTY_CLIENT_SECRET,
      scope: 'open-api',
    }),
  });
  if (!res.ok) throw new Error(`Guesty auth failed: ${await res.text()}`);
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

async function api(path, params = {}) {
  const token = await getToken();
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Guesty API ${res.status}: ${await res.text()}`);
  return res.json();
}

const server = new McpServer({ name: 'guesty-mcp', version: '1.0.0' });

server.tool('list-reservations', 'List reservations from Guesty.', {
  limit: z.number().min(1).max(100).optional(),
  status: z.string().optional(),
  skip: z.number().min(0).optional(),
  fields: z.string().optional(),
  checkInFrom: z.string().optional(),
  checkInTo: z.string().optional(),
}, async ({ limit = 25, status, skip = 0, fields, checkInFrom, checkInTo }) => {
  try {
    let filters;
    if (checkInFrom && checkInTo) filters = JSON.stringify([{ field: 'checkIn', operator: '$between', from: checkInFrom, to: checkInTo }]);
    else if (checkInFrom) filters = JSON.stringify([{ field: 'checkIn', operator: '$gte', value: checkInFrom }]);
    else if (checkInTo) filters = JSON.stringify([{ field: 'checkIn', operator: '$lte', value: checkInTo }]);
    const data = await api('/reservations', { limit, status, skip, filters, fields: fields || 'confirmationCode status checkIn checkOut listingId listing.title listing.nickname guest.fullName money invoiceItems accounting nightsCount source' });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (e) { return { content: [{ type: 'text', text: `Error: ${e.message}` }] }; }
});

server.tool('list-listings', 'List all Guesty listings.', {
  limit: z.number().optional(),
}, async ({ limit = 25 }) => {
  try {
    return { content: [{ type: 'text', text: JSON.stringify(await api('/listings', { limit }), null, 2) }] };
  } catch (e) { return { content: [{ type: 'text', text: `Error: ${e.message}` }] }; }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Boostly Guesty MCP server running');
