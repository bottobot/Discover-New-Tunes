import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { getAccessToken } from '@/utils/spotifyAuth'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'No search query provided' }, { status: 400 })
  }

  try {
    const accessToken = await getAccessToken()

    const response = await axios.get(`https://api.spotify.com/v1/search`, {
      params: {
        q: query,
        type: 'artist',
        limit: 10
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    const artists = response.data.artists.items.map((artist: any) => ({
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url || null,
      genres: artist.genres,
      popularity: artist.popularity
    }))

    return NextResponse.json({ artists })
  } catch (error) {
    console.error('Error searching artists:', error)
    return NextResponse.json({ error: 'Error searching artists' }, { status: 500 })
  }
}
