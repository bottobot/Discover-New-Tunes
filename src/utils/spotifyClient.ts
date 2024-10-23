import axios from 'axios';
import logger from './logger';

export interface SpotifyArtist {
  name: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifySearchResponse {
  artists: {
    items: SpotifyArtist[];
  };
}

class SpotifyClient {
  private validateCredentials() {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      throw new Error('Missing Spotify credentials in environment variables');
    }
  }

  async getAccessToken(): Promise<string> {
    try {
      this.validateCredentials();

      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': 'Basic ' + Buffer.from(
              process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
            ).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      return response.data.access_token;
    } catch (error) {
      logger.error('Failed to get Spotify access token:', {
        error: error instanceof Error ? error.message : String(error),
        hasClientId: !!process.env.SPOTIFY_CLIENT_ID,
        hasClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET
      });
      throw new Error('Failed to authenticate with Spotify. Check your credentials.');
    }
  }

  async searchArtist(artist: string, accessToken: string): Promise<SpotifySearchResponse> {
    try {
      const response = await axios.get<SpotifySearchResponse>(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to search Spotify artist:', {
        error: error instanceof Error ? error.message : String(error),
        artist
      });
      throw new Error(`Failed to search for artist "${artist}" on Spotify`);
    }
  }
}

export const spotifyClient = new SpotifyClient();
