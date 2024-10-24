import { describe, it, expect } from '@jest/globals';
import { performOCR } from '../../utils/googleVision';
import path from 'path';
import fs from 'fs/promises';
import { spotifyClient } from '../../utils/spotifyClient';

interface ArtistMatch {
  detected: string;
  matched: string;
  spotifyUrl: string;
  confidence: number;
}

function cleanArtistName(name: string): string {
  return name
    .replace(/[⚫•·∙.●○◦◎◉]/g, '')  // Remove all types of dots
    .replace(/\bLIVE\b/gi, '')  // Remove "LIVE" suffix
    .replace(/\bPRESENTS\b/gi, '')  // Remove "PRESENTS"
    .replace(/\bSHOWCASE\b/gi, '')  // Remove "SHOWCASE"
    .replace(/\d+\/\d+\s+\w+/g, '')  // Remove patterns like "20/20 LDN"
    .replace(/[^\w\s\-&]/g, ' ')  // Replace special chars with space, keep & and -
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim()
    .toUpperCase();  // Normalize case for comparison
}

function calculateMatchConfidence(detected: string, matched: string): number {
  const detectedWords = new Set(detected.toUpperCase().split(/\s+/));
  const matchedWords = new Set(matched.toUpperCase().split(/\s+/));
  
  const intersection = new Set([...detectedWords].filter(x => matchedWords.has(x)));
  const union = new Set([...detectedWords, ...matchedWords]);
  
  const exactMatchBonus = detected.toUpperCase() === matched.toUpperCase() ? 0.2 : 0;
  const lengthDiff = Math.abs(detected.length - matched.length);
  const lengthBonus = lengthDiff === 0 ? 0.1 : lengthDiff < 3 ? 0.05 : 0;
  
  return Math.min(1, (intersection.size / union.size) + exactMatchBonus + lengthBonus);
}

function filterNonArtistText(line: string): boolean {
  const nonArtistPatterns = [
    /^(JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE)\s+\d+/i,
    /^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)/i,
    /^(STAGE|TENT|ARENA|GROUND|FIELD)/i,
    /^(MERRITT|BC|CANADA|BRITISH|COLUMBIA)/i,
    /^(BASS COAST|BASSCOAST)/i,
    /^Supported by/i,
    /^creative/i,
    /\.(com|ca|org|net)$/i,
    /^\d{4}$/,
    /^\d{1,2}-\d{1,2}$/,
    /^\d{1,2}:\d{2}$/
  ];

  return !nonArtistPatterns.some(pattern => pattern.test(line));
}

// Known multi-word artist names that should be kept together
const knownArtists = new Map([
  ['CLAUDE VONSTROKE', 'Claude VonStroke'],
  ['JUSTIN MARTIN', 'Justin Martin'],
  ['SOUL CLAP', 'Soul Clap'],
  ['LAZY SYRUP ORCHESTRA', 'Lazy Syrup Orchestra'],
  ['FORT KNOX FIVE', 'Fort Knox Five'],
  ['MAT THE ALIEN', 'Mat the Alien'],
  ['THE FUNK HUNTERS', 'The Funk Hunters'],
  ['GALCHER LUSTWERK', 'Galcher Lustwerk'],
  ['JACQUES GREENE', 'Jacques Greene']
]);

function findKnownArtist(text: string): string | null {
  const normalized = text.toUpperCase().trim();
  for (const [known] of knownArtists) {
    if (normalized.includes(known)) {
      return known;
    }
  }
  return null;
}

function isLikelyArtistName(text: string): boolean {
  // Check for known artists first
  if (findKnownArtist(text)) {
    return true;
  }

  // Common patterns that indicate an artist name
  const artistPatterns = [
    /^[A-Z][A-Za-z]+\s+[A-Z][A-Za-z]+$/,  // First Last format
    /^[A-Z][A-Za-z]+\s+[A-Z][A-Za-z]+\s+[A-Z][A-Za-z]+$/,  // Three word names
    /^The\s+[A-Z][A-Za-z\s]+$/i,  // Names starting with "The"
    /^DJ\s+[A-Z][A-Za-z\s]+$/i,   // DJ names
    /^MC\s+[A-Z][A-Za-z\s]+$/i,   // MC names
    /^[A-Z][A-Za-z]+$/,           // Single capitalized word
    /^[A-Z]+$/,                   // All caps names
    /^[A-Z][A-Za-z]+\s*&\s*[A-Z][A-Za-z]+$/  // Collaborations
  ];

  return artistPatterns.some(pattern => pattern.test(text));
}

function extractArtistsFromLine(line: string): string[] {
  // First split by explicit separators (dots, bullets)
  const parts = line.split(/\s*[⚫•·∙.●○◦◎◉]\s*/)
    .map(part => part.trim())
    .filter(part => part.length > 0);

  const artists: string[] = [];

  for (let part of parts) {
    // Skip non-artist text
    if (!filterNonArtistText(part)) continue;

    // Check for known artists first
    const knownArtist = findKnownArtist(part);
    if (knownArtist) {
      artists.push(knownArtist);
      // Remove the found artist from the text to avoid double-matching
      part = part.replace(knownArtist, '').trim();
      if (!part) continue;
    }

    // Handle collaborations with &
    if (part.includes('&')) {
      // Try the whole collaboration first
      if (isLikelyArtistName(part)) {
        artists.push(part);
        continue;
      }
      // If not, split and check individual artists
      const collabArtists = part.split(/\s*&\s*/)
        .map(a => a.trim())
        .filter(a => a.length > 2 && isLikelyArtistName(a));
      artists.push(...collabArtists);
      continue;
    }

    // Split by multiple spaces and look for potential artist names
    const spaceSeparated = part.split(/\s{2,}/)
      .map(a => a.trim())
      .filter(a => a.length > 2);

    for (const potential of spaceSeparated) {
      // For each potential artist name, try to identify multi-word artists
      const words = potential.split(/\s+/);
      let currentName = '';
      let bestMatch = '';
      let maxWords = 0;

      for (let i = 0; i < words.length; i++) {
        currentName += (i > 0 ? ' ' : '') + words[i];
        
        if (isLikelyArtistName(currentName)) {
          if (currentName.split(/\s+/).length > maxWords) {
            maxWords = currentName.split(/\s+/).length;
            bestMatch = currentName;
          }
        }
      }

      if (bestMatch) {
        artists.push(bestMatch);
        // Remove matched words from potential
        const remaining = potential.replace(bestMatch, '').trim();
        if (remaining && isLikelyArtistName(remaining)) {
          artists.push(remaining);
        }
      } else if (isLikelyArtistName(potential)) {
        artists.push(potential);
      }
    }
  }

  return artists.map(cleanArtistName);
}

describe('OCR Tests', () => {
  // Increase timeout to 30 seconds
  jest.setTimeout(30000);

  it('should process 2022 lineup image and match artists', async () => {
    const imagePath = path.join(process.cwd(), '2022.webp');
    const buffer = await fs.readFile(imagePath);
    const text = await performOCR(buffer);
    
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(filterNonArtistText);
    
    const accessToken = await spotifyClient.getAccessToken();
    const artistResults: ArtistMatch[] = [];
    const processedArtists = new Set<string>();
    
    // Process all lines
    for (const line of lines) {
      const artists = extractArtistsFromLine(line);
      
      for (const artistName of artists) {
        const cleanedName = cleanArtistName(artistName);
        if (processedArtists.has(cleanedName)) continue;
        
        try {
          const result = await spotifyClient.searchArtist(cleanedName, accessToken);
          if (result.artists.items.length > 0) {
            const confidence = calculateMatchConfidence(cleanedName, result.artists.items[0].name);
            if (confidence > 0.4) {
              artistResults.push({
                detected: cleanedName,
                matched: result.artists.items[0].name,
                spotifyUrl: result.artists.items[0].external_urls.spotify,
                confidence
              });
            }
          }
          processedArtists.add(cleanedName);
        } catch (error) {
          console.error(`Failed to search for artist: ${artistName}`);
        }
      }
    }
    
    // Log results
    console.log('OCR Text:', text);
    console.log('Artist Matches:', artistResults);
    
    // Validate results
    expect(artistResults.length).toBeGreaterThan(0);
    expect(artistResults.some(result => result.confidence > 0.8)).toBe(true);
    
    // Check for specific known artists
    const knownArtists = ['Claude VonStroke', 'Justin Martin', 'Soul Clap'];
    for (const artist of knownArtists) {
      const found = artistResults.some(result => 
        result.matched.toUpperCase() === artist.toUpperCase() &&
        result.confidence > 0.8
      );
      if (!found) {
        console.log(`Failed to find known artist: ${artist}`);
      }
      expect(found).toBe(true);
    }

    // Verify dot recognition
    expect(text).toMatch(/\s[•·∙.●○◦◎◉]\s/); // Should find at least one dot separator
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
