import axios from 'axios';
import Fuse from 'fuse.js';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com/api';

let spotifyToken = null;
let tokenExpirationTime = 0;

async function getSpotifyToken() {
  console.log('Entering getSpotifyToken function');
  if (spotifyToken && Date.now() < tokenExpirationTime) {
    console.log('Using existing Spotify token');
    return spotifyToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Spotify credentials are not set');
    throw new Error('Spotify credentials are not set');
  }

  try {
    console.log('Requesting new Spotify token...');
    const response = await axios.post(
      `${SPOTIFY_ACCOUNTS_BASE}/token`,
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
    console.log('New Spotify token obtained successfully');
    return spotifyToken;
  } catch (error) {
    console.error('Error getting Spotify token:', error.response ? JSON.stringify(error.response.data) : error.message);
    throw error;
  }
}

async function searchSpotifyArtist(artistName) {
  console.log(`Searching for artist: ${artistName}`);
  const token = await getSpotifyToken();
  try {
    const response = await axios.get(`${SPOTIFY_API_BASE}/search`, {
      params: {
        q: artistName,
        type: 'artist',
        limit: 20, // Increased limit to get more results for fuzzy matching
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`Search response for ${artistName}:`, JSON.stringify(response.data));

    if (response.data.artists.items.length > 0) {
      const artists = response.data.artists.items;
      
      // Configure Fuse options
      const options = {
        keys: ['name'],
        threshold: 0.4, // Lower threshold for more lenient matching
        includeScore: true
      };

      const fuse = new Fuse(artists, options);
      const results = fuse.search(artistName);

      if (results.length > 0) {
        const bestMatch = results[0].item;
        console.log(`Best match found: ${bestMatch.name} (Score: ${results[0].score})`);
        return bestMatch.id;
      }
    }
    console.log(`No results found for artist: ${artistName}`);
    return null;
  } catch (error) {
    console.error('Error searching for Spotify artist:', error.response ? JSON.stringify(error.response.data) : error.message);
    return null;
  }
}

async function getSpotifyArtist(artistId) {
  console.log(`Fetching details for artist ID: ${artistId}`);
  const token = await getSpotifyToken();
  try {
    const [artistResponse, topTracksResponse] = await Promise.all([
      axios.get(`${SPOTIFY_API_BASE}/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${SPOTIFY_API_BASE}/artists/${artistId}/top-tracks?market=US`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const artist = artistResponse.data;
    const topTracks = topTracksResponse.data.tracks.slice(0, 5);

    console.log(`Artist details fetched successfully for: ${artist.name}`);
    return {
      name: artist.name,
      spotifyUrl: artist.external_urls.spotify,
      images: artist.images,
      genres: artist.genres,
      popularity: artist.popularity,
      followers: artist.followers.total,
      topTracks: topTracks.map(track => ({
        name: track.name,
        spotifyUrl: track.external_urls.spotify,
        previewUrl: track.preview_url,
      })),
    };
  } catch (error) {
    console.error('Error getting Spotify artist details:', error.response ? JSON.stringify(error.response.data) : error.message);
    return null;
  }
}

function isValidArtistName(name) {
  // Allow spaces and some special characters, but ensure there are some letters
  return /[a-zA-Z]/.test(name) && !/^[^a-zA-Z]*$/.test(name);
}

export default async function handler(req, res) {
  console.log('Entering handler function');
  console.log(`Spotify Client ID: ${process.env.SPOTIFY_CLIENT_ID}`);
  console.log(`Spotify Client Secret: ${process.env.SPOTIFY_CLIENT_SECRET ? '*'.repeat(process.env.SPOTIFY_CLIENT_SECRET.length) : 'Not set'}`);
  
  const { artist } = req.query;

  if (!artist) {
    console.log('No artist provided in query');
    return res.status(400).json({ error: 'Artist name is required' });
  }

  console.log(`Processing request for artist: ${artist}`);

  if (!isValidArtistName(artist)) {
    console.log(`Invalid artist name: ${artist}`);
    return res.status(200).json({
      name: artist,
      spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(artist)}`,
      images: [],
      genres: [],
      isCustom: true
    });
  }

  try {
    const artistId = await searchSpotifyArtist(artist);
    
    if (artistId) {
      const artistDetails = await getSpotifyArtist(artistId);
      if (artistDetails) {
        console.log(`Sending response for ${artist}:`, JSON.stringify(artistDetails));
        res.status(200).json(artistDetails);
      } else {
        console.log(`No details found for ${artist}`);
        res.status(200).json({
          name: artist,
          spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(artist)}`,
          images: [],
          genres: [],
          notFound: true
        });
      }
    } else {
      console.log(`No results found for ${artist}`);
      res.status(200).json({
        name: artist,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(artist)}`,
        images: [],
        genres: [],
        notFound: true
      });
    }
  } catch (error) {
    console.error('Error processing artist search:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
  console.log('Exiting handler function');
}
