import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CLIENT_ID = '3dd6c48419e64c338f5c5ceaef378e00';
const CLIENT_SECRET = '74ec0eb574bb419a867d4c2f92f8e752';

async function getAccessToken() {
  const response = await axios.post('https://accounts.spotify.com/api/token', 
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return response.data.access_token;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');

  if (!artist) {
    return NextResponse.json({ error: 'Artist parameter is required' }, { status: 400 });
  }

  try {
    const accessToken = await getAccessToken();
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=1`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const artists = response.data.artists.items;
    if (artists.length > 0) {
      return NextResponse.json({ spotifyUrl: artists[0].external_urls.spotify });
    } else {
      return NextResponse.json({ spotifyUrl: null });
    }
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return NextResponse.json({ error: 'Error searching Spotify' }, { status: 500 });
  }
}
