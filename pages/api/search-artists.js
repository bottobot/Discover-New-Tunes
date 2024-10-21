import { getSpotifyToken } from '../../utils/spotify';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { artists } = req.body;

  if (!Array.isArray(artists)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const token = await getSpotifyToken();
    const artistLinks = {};

    for (const artist of artists) {
      try {
        const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!searchResponse.ok) {
          throw new Error(`Spotify API error: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();

        if (searchData.artists.items.length > 0) {
          const spotifyArtist = searchData.artists.items[0];
          artistLinks[artist] = {
            name: spotifyArtist.name,
            spotifyUrl: spotifyArtist.external_urls.spotify,
            images: spotifyArtist.images,
            genres: spotifyArtist.genres,
          };
        } else {
          artistLinks[artist] = {
            error: true,
            message: 'Artist not found on Spotify',
            name: artist,
            spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(artist)}`,
          };
        }
      } catch (error) {
        console.error(`Error searching for artist ${artist}:`, error);
        artistLinks[artist] = {
          error: true,
          message: error.message,
          name: artist,
          spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(artist)}`,
        };
      }
    }

    res.status(200).json(artistLinks);
  } catch (error) {
    console.error('Error in search-artists handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
