import axios from 'axios';

let spotifyToken = null;
let tokenExpirationTime = 0;

export async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpirationTime) {
    return spotifyToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials are not set');
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      }
    );

    spotifyToken = response.data.access_token;
    tokenExpirationTime = Date.now() + response.data.expires_in * 1000;
    return spotifyToken;
  } catch (error) {
    console.error('Error getting Spotify token:', error.response ? error.response.data : error.message);
    throw error;
  }
}
