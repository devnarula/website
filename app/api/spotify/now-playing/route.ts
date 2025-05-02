// app/api/spotify/now-playing/route.ts
export const runtime = 'nodejs'; // ensure Buffer works in dev

import { NextResponse } from 'next/server';

let cachedToken = '';
let expiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < expiresAt) return cachedToken;

  const creds = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
  const basic = Buffer.from(creds).toString('base64');

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.REFRESH_TOKEN!,
    }),
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Token refresh failed: ${tokenRes.status} ${err}`);
  }
  const tok = await tokenRes.json();
  cachedToken = tok.access_token;
  expiresAt = Date.now() + tok.expires_in * 1000;
  return cachedToken;
}

export async function GET() {
  try {
    const token = await getAccessToken();

    // 1) Try “currently playing”
    let r = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
    });

    // If we didn’t get a good 200, or we got 204/no-item, fall back:
    let useFallback = r.status !== 200;
    let curr: any = null;

    if (!useFallback) {
      curr = await r.json();
      if (!curr?.item) {
        useFallback = true;
      }
    }

    if (useFallback) {
      // 2) Fall back to “recently played”
      r = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        const err = await r.text();
        throw new Error(`Recently-played failed: ${r.status} ${err}`);
      }
      const data = await r.json();
      const t = data.items?.[0]?.track;
      if (!t) {
        return NextResponse.json({ error: 'No current or recent track found' }, { status: 204 });
      }
      return NextResponse.json({
        isPlaying: false,
        title: t.name,
        artist: t.artists.map((a: any) => a.name).join(', '),
        albumArt: t.album.images[0]?.url,
        url: t.external_urls.spotify,
      });
    }

    // 3) We have a valid `curr.item`
    const t = curr.item;
    return NextResponse.json({
      isPlaying: curr.is_playing,
      title: t.name,
      artist: t.artists.map((a: any) => a.name).join(', '),
      albumArt: t.album.images[0]?.url,
      url: t.external_urls.spotify,
    });
  } catch (err: any) {
    console.error('Spotify API error:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
