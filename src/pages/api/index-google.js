import { google } from 'googleapis';
import fs from 'fs';
import { getDataPath } from '../../lib/data-store.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { url } = await request.json();
    if (!url) return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400 });

    const keyPath = getDataPath('service-account.json');
    if (!fs.existsSync(keyPath)) {
      return new Response(JSON.stringify({ error: 'Google Service Account JSON is missing. Please upload service-account.json to the omji_data folder.' }), { status: 400 });
    }

    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/indexing'],
      null
    );

    await jwtClient.authorize();

    const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtClient.credentials.access_token}`
      },
      body: JSON.stringify({
        url: url,
        type: 'URL_UPDATED'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Failed to index' }), { status: response.status });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
