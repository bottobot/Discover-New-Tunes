import axios from 'axios'

let accessToken: string | null = null
let tokenExpirationTime: number | null = null

async function getAccessToken(): Promise<string> {
  if (accessToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
    return accessToken
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Spotify client ID or secret is not set')
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      }
    )

    accessToken = response.data.access_token
    tokenExpirationTime = Date.now() + response.data.expires_in * 1000

    if (!accessToken) {
      throw new Error('Failed to obtain Spotify access token')
    }

    return accessToken
  } catch (error) {
    console.error('Error getting Spotify access token:', error)
    throw new Error('Failed to get Spotify access token')
  }
}

export { getAccessToken }
