import axios from 'axios';

const CLIENT_ID = '3dd6c48419e64c338f5c5ceaef378e00';
const CLIENT_SECRET = '74ec0eb574bb419a867d4c2f92f8e752';

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
  async getAccessToken(): Promise<string> {
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

  async searchArtist(artist: string, accessToken: string): Promise<SpotifySearchResponse> {
    const response = await axios.get<SpotifySearchResponse>(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    return response.data;
  }
}

export const spotifyClient = new SpotifyClient();
