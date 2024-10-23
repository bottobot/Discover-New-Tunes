import { describe, it, expect } from '@jest/globals';
import { performOCR } from '../../utils/googleVision';
import path from 'path';
import fs from 'fs/promises';
import logger from '../../utils/logger';
import { spotifyClient } from '../../utils/spotifyClient';

interface ArtistMatch {
  detected: string;
  matched: string;
  spotifyUrl: string;
  confidence: number;
}

function cleanArtistName(name: string): string {
  return name
    .replace(/[⚫•]/g, '')  // Remove bullet points
    .replace(/\bLIVE\b/gi, '')  // Remove "LIVE" suffix
    .replace(/\bPRESENTS\b/gi, '')  // Remove "PRESENTS"
    .replace(/\bSHOWCASE\b/gi, '')  // Remove "SHOWCASE"
    .replace(/\d+\/\d+\s+\w+/g, '')  // Remove patterns like "20/20 LDN"
    .replace(/[^\w\s-]/g, ' ')  // Replace special chars with space
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim();
}

function splitArtistNames(line: string): string[] {
  // First split on obvious separators
  const names = line
    .split(/[&,•⚫]/)
    .flatMap(part => {
      // Further split on space if part is too long (likely multiple artists)
      if (part.trim().length > 25) {
        return part.split(/\s+/);
      }
      return [part];
    })
    .map(name => cleanArtistName(name))
    .filter(name => {
      // Filter out non-artist text
      if (name.length < 3) return false;
      if (/^(MC|DJ)$/.test(name)) return false;
      if (/^(THE|AND|WITH)$/i.test(name)) return false;
      return true;
    });

  return [...new Set(names)];  // Remove duplicates
}

function calculateMatchConfidence(detected: string, matched: string): number {
  const detectedWords = new Set(detected.toLowerCase().split(/\s+/));
  const matchedWords = new Set(matched.toLowerCase().split(/\s+/));
  
  // Calculate word overlap
  const intersection = new Set([...detectedWords].filter(x => matchedWords.has(x)));
  const union = new Set([...detectedWords, ...matchedWords]);
  
  return intersection.size / union.size;
}

describe('OCR Tests', () => {
  it('should process 2022 lineup image and find artists on Spotify', async () => {
    const imagePath = path.join(process.cwd(), '2022.webp');
    
    // First check if file exists
    const fileExists = await fs.access(imagePath)
      .then(() => true)
      .catch(() => false);
    
    if (!fileExists) {
      throw new Error('Test image 2022.webp not found');
    }

    // Read file into buffer
    const buffer = await fs.readFile(imagePath);
    const text = await performOCR(buffer);
    
    expect(text).toBeDefined();
    expect(typeof text).toBe('string');
    
    // Split into lines and filter out empty ones
    const lines = text.split('\n')
      .filter(line => line.trim().length > 0)
      // Skip header lines and footer
      .filter(line => !line.match(/^(JULY|MERRITT|BASS COAST|creative|BRITISH|COLUMBIA|Supported)/i));
    
    expect(Array.isArray(lines)).toBe(true);
    
    // Get Spotify access token
    const accessToken = await spotifyClient.getAccessToken();
    
    // Process artists
    const artistResults: ArtistMatch[] = [];
    const processedArtists = new Set<string>();
    
    // Process first 5 lines that likely contain headliners
    for (const line of lines.slice(0, 5)) {
      const artists = splitArtistNames(line);
      
      for (const artistName of artists) {
        // Skip if already processed
        if (processedArtists.has(artistName)) continue;
        
        try {
          const result = await spotifyClient.searchArtist(artistName, accessToken);
          if (result.artists.items.length > 0) {
            const confidence = calculateMatchConfidence(artistName, result.artists.items[0].name);
            // Only include matches with decent confidence
            if (confidence > 0.3) {
              artistResults.push({
                detected: artistName,
                matched: result.artists.items[0].name,
                spotifyUrl: result.artists.items[0].external_urls.spotify,
                confidence
              });
            }
          }
          processedArtists.add(artistName);
        } catch (error) {
          logger.error(`Failed to search for artist: ${artistName}`, { error });
        }
      }
    }
    
    console.log('OCR Results:', text);
    console.log('Artist Matches:', artistResults);
    
    expect(artistResults.length).toBeGreaterThan(0);
    // Verify we have at least one high confidence match
    expect(artistResults.some(result => result.confidence > 0.8)).toBe(true);
  });

  it('should handle invalid buffer input', async () => {
    const invalidBuffer = Buffer.from('not an image');
    
    await expect(performOCR(invalidBuffer)).rejects.toThrow('Invalid image format');
  });

  it('should handle empty buffer', async () => {
    const emptyBuffer = Buffer.alloc(0);
    
    await expect(performOCR(emptyBuffer)).rejects.toThrow('Invalid image: empty buffer');
  });
});
