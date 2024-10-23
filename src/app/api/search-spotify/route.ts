import { NextRequest, NextResponse } from 'next/server';
import { spotifyClient } from '@/utils/spotifyClient';
import { isExactMatch } from '@/utils/artistMatching';

// Route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10; // 10 seconds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');

  if (!artist) {
    return NextResponse.json({ 
      success: false,
      error: 'Artist parameter is required' 
    }, { status: 400 });
  }

  try {
    const accessToken = await spotifyClient.getAccessToken();
    const searchResult = await spotifyClient.searchArtist(artist, accessToken);
    const exactMatch = searchResult.artists.items.find(a => isExactMatch(artist, a.name));

    if (exactMatch) {
      return NextResponse.json({ 
        success: true,
        spotifyUrl: exactMatch.external_urls.spotify,
        exactMatch: true,
        artistName: exactMatch.name
      });
    } else {
      return NextResponse.json({ 
        success: true,
        spotifyUrl: null,
        exactMatch: false,
        searchedName: artist,
        possibleMatches: searchResult.artists.items.map(a => ({
          name: a.name
        }))
      });
    }
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error searching Spotify',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
