import { describe, it, expect, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { normalizeArtistName, isExactMatch } from '@/utils/artistMatching';
import { GET } from '@/app/api/search-spotify/route';
import { spotifyClient } from '@/utils/spotifyClient';

// Mock the spotifyClient methods
const mockGetAccessToken = jest.spyOn(spotifyClient, 'getAccessToken');
const mockSearchArtist = jest.spyOn(spotifyClient, 'searchArtist');

describe('Spotify Search Utils', () => {
  describe('normalizeArtistName', () => {
    it('should remove special characters and spaces', () => {
      const testCases: [string, string][] = [
        ['The Artist!', 'theartist'],
        ['DJ Snake', 'djsnake'],
        ['A$AP Rocky', 'asaprocky'],
        ['Deadmau5', 'deadmau5'],
        ['The Weekend', 'theweekend'],
        ['Ty Dolla $ign', 'tydollasign'],
        ['P!nk', 'pink'],
        ['Blink-182', 'blink182']
      ];

      testCases.forEach(([input, expected]) => {
        expect(normalizeArtistName(input)).toBe(expected);
      });
    });

    it('should handle different cases', () => {
      const testCases: [string, string][] = [
        ['DEADMAU5', 'deadmau5'],
        ['DeadMau5', 'deadmau5'],
        ['deadMAU5', 'deadmau5'],
        ['A$AP ROCKY', 'asaprocky'],
        ['a$ap rocky', 'asaprocky'],
        ['P!NK', 'pink'],
        ['p!nk', 'pink']
      ];

      testCases.forEach(([input, expected]) => {
        expect(normalizeArtistName(input)).toBe(expected);
      });
    });

    it('should handle whitespace', () => {
      const testCases: [string, string][] = [
        ['  The Artist  ', 'theartist'],
        [' DJ Snake ', 'djsnake'],
        ['The  Weekend', 'theweekend'],
        ['   A$AP   Rocky   ', 'asaprocky'],
        ['  P!nk  ', 'pink']
      ];

      testCases.forEach(([input, expected]) => {
        expect(normalizeArtistName(input)).toBe(expected);
      });
    });
  });

  describe('isExactMatch', () => {
    it('should match exact names regardless of case and special characters', () => {
      const testCases: [string, string][] = [
        ['The Artist', 'The Artist'],
        ['The Artist!', 'The Artist'],
        ['THE ARTIST', 'The Artist'],
        ['  The Artist  ', 'The Artist'],
        ['The-Artist', 'The Artist'],
        ['A$AP Rocky', 'ASAP Rocky'],
        ['A$AP ROCKY', 'Asap Rocky'],
        ['Ty Dolla $ign', 'Ty Dolla Sign'],
        ['P!nk', 'Pink']
      ];

      testCases.forEach(([input, compare]) => {
        expect(isExactMatch(input, compare)).toBe(true);
      });
    });

    it('should not match different names', () => {
      const testCases: [string, string][] = [
        ['The Artist', 'The Artists'],
        ['DJ Snake', 'Snake'],
        ['The Weekend', 'The Weeknd'],
        ['Deadmau5', 'Deadmouse'],
        ['A$AP Rocky', 'ASAP Rocky Jr'],
        ['Ty Dolla $ign', 'Ty Dollar Sign'],
        ['Blink-182', 'Blink 183'],
        ['P!nk', 'Pink Jr']
      ];

      testCases.forEach(([input, compare]) => {
        expect(isExactMatch(input, compare)).toBe(false);
      });
    });
  });

  describe('GET endpoint', () => {
    beforeEach(() => {
      mockGetAccessToken.mockReset();
      mockSearchArtist.mockReset();
    });

    it('should return exact match when found', async () => {
      const mockArtist = 'A$AP Rocky';
      const mockSpotifyUrl = 'https://open.spotify.com/artist/123';

      mockGetAccessToken.mockResolvedValue('mock-token');
      mockSearchArtist.mockResolvedValue({
        artists: {
          items: [
            { 
              name: 'ASAP Rocky', 
              external_urls: { spotify: mockSpotifyUrl } 
            }
          ]
        }
      });

      const request = new NextRequest(
        new URL(`http://localhost/api/search-spotify?artist=${encodeURIComponent(mockArtist)}`)
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.exactMatch).toBe(true);
      expect(data.spotifyUrl).toBe(mockSpotifyUrl);
      expect(data.artistName).toBe('ASAP Rocky');
      expect(mockSearchArtist).toHaveBeenCalledTimes(1);
    });

    it('should return no match when artist not found', async () => {
      const mockArtist = 'Nonexistent Artist';

      mockGetAccessToken.mockResolvedValue('mock-token');
      mockSearchArtist.mockResolvedValue({
        artists: {
          items: []
        }
      });

      const request = new NextRequest(
        new URL(`http://localhost/api/search-spotify?artist=${encodeURIComponent(mockArtist)}`)
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.exactMatch).toBe(false);
      expect(data.spotifyUrl).toBeNull();
      expect(data.searchedName).toBe(mockArtist);
      expect(mockSearchArtist).toHaveBeenCalledTimes(1);
    });

    it('should handle missing artist parameter', async () => {
      const request = new NextRequest(
        new URL('http://localhost/api/search-spotify')
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Artist parameter is required');
      expect(mockSearchArtist).not.toHaveBeenCalled();
    });
  });
});
