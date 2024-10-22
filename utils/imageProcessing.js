const vision = require('@google-cloud/vision');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Set up Google Cloud credentials
const googleCloudKeyPath = path.join(process.cwd(), 'google-cloud-key.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = googleCloudKeyPath;

// Simple in-memory cache for artist validation results
const artistCache = new Map();

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}`;
  console.log(logMessage);
  // Removed file system operation
}

async function processImage(imageBuffer) {
  try {
    log('Starting image processing');
    log(`Google Cloud key path: ${googleCloudKeyPath}`);
    log(`Google Cloud key file exists: ${fs.existsSync(googleCloudKeyPath)}`);
    
    const client = new vision.ImageAnnotatorClient();
    log('Vision client created');
    
    const [result] = await client.documentTextDetection(imageBuffer);
    log('Document text detection completed');
    
    const fullText = result.fullTextAnnotation.text;
    log('Full text extracted');
    log('Full text extracted:', fullText);
    
    const potentialArtists = extractPotentialArtists(fullText);
    log(`Potential artists extracted: ${potentialArtists.length}`);
    log('Potential artists:', potentialArtists);
    
    const validatedArtists = await validateArtists(potentialArtists);
    log(`Artists validated: ${validatedArtists.length}`);
    log('Validated artists:', validatedArtists);
    
    return { 
      artists: validatedArtists,
      fullText: fullText
    };
  } catch (error) {
    log(`Error processing image: ${error.message}`);
    log(`Error stack: ${error.stack}`);
    throw error;
  }
}

function extractPotentialArtists(text) {
  log('Extracting potential artists from text');
  const lines = text.split('\n');
  const potentialArtists = new Set();
  
  for (let line of lines) {
    line = line.trim();
    if (line.length > 0) {
      // Split line by common separators
      const parts = line.split(/[•⚫,&]/);
      for (let part of parts) {
        part = part.trim();
        if (part.length > 0 && !isCommonWord(part) && !isDate(part) && !isLocation(part)) {
          // Keep multi-word artists together
          if (part.split(' ').length <= 4) {
            potentialArtists.add(part);
          } else {
            // Split longer phrases
            const words = part.split(' ');
            for (let i = 0; i < words.length; i++) {
              if (words[i].length > 1 && !isCommonWord(words[i])) {
                if (i < words.length - 1 && words[i+1].length > 1 && !isCommonWord(words[i+1])) {
                  potentialArtists.add(`${words[i]} ${words[i+1]}`);
                  i++;
                } else {
                  potentialArtists.add(words[i]);
                }
              }
            }
          }
        }
      }
    }
  }
  
  return Array.from(potentialArtists);
}

function isCommonWord(word) {
  const commonWords = ['the', 'and', 'or', 'feat', 'featuring', 'presents', 'with', 'creative', 'sc', 'dj', 'set', 'inc', 'vs', 'versus', 'live', 'special', 'guest', 'b2b', 'bass', 'coast', 'digital'];
  return commonWords.includes(word.toLowerCase()) || word.length < 2;
}

function isDate(word) {
  return /^\d{4}$/.test(word) || /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)/i.test(word);
}

function isLocation(word) {
  const locations = ['MERRITT', 'CANADA', 'BASSCOAST.CA'];
  return locations.includes(word.toUpperCase());
}

async function validateArtists(potentialArtists) {
  log('Validating artists:', potentialArtists);
  const validatedArtists = [];
  const spotifyToken = await getSpotifyToken();

  for (const artist of potentialArtists) {
    if (artistCache.has(artist)) {
      validatedArtists.push(artistCache.get(artist));
      continue;
    }

    try {
      let validatedArtist = await validateWithSpotify(artist, spotifyToken);
      if (!validatedArtist) {
        validatedArtist = await validateWithSoundCloudOrGoogle(artist);
      }
      validatedArtists.push(validatedArtist);
      artistCache.set(artist, validatedArtist);
    } catch (error) {
      log(`Error validating artist ${artist}:`, error);
      validatedArtists.push({ name: artist, confidence: 'error' });
    }
  }

  // Remove duplicates and prefer higher confidence
  const uniqueArtists = new Map();
  for (const artist of validatedArtists) {
    const existingArtist = uniqueArtists.get(artist.name.toLowerCase());
    if (!existingArtist || getConfidenceScore(artist.confidence) > getConfidenceScore(existingArtist.confidence)) {
      uniqueArtists.set(artist.name.toLowerCase(), artist);
    }
  }

  const finalArtists = Array.from(uniqueArtists.values())
    .filter(artist => artist.confidence !== 'low' || artist.name.split(' ').length > 1);

  log('Final validated artists:', finalArtists);
  return finalArtists;
}

async function validateWithSpotify(artist, token) {
  try {
    const spotifyResult = await searchSpotifyArtist(artist, token);
    if (spotifyResult && spotifyResult.artists.items.length > 0) {
      const topMatch = spotifyResult.artists.items[0];
      if (topMatch.name.toLowerCase() === artist.toLowerCase()) {
        return { name: topMatch.name, confidence: 'high' };
      } else {
        return { name: artist, confidence: 'medium' };
      }
    }
  } catch (error) {
    log(`Error searching Spotify for artist ${artist}:`, error);
  }
  return null;
}

async function validateWithSoundCloudOrGoogle(artist) {
  // Implement SoundCloud search here if you have an API key
  // For now, we'll use Google search
  try {
    const googleResult = await searchGoogle(artist + " music artist");
    if (googleResult) {
      return { name: artist, confidence: 'medium' };
    }
  } catch (error) {
    log(`Error searching Google for artist ${artist}:`, error);
  }
  return { name: artist, confidence: 'low' };
}

function getConfidenceScore(confidence) {
  const scores = { high: 3, medium: 2, low: 1, error: 0 };
  return scores[confidence] || 0;
}

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials are not set');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    log('Error getting Spotify token:', error);
    throw error;
  }
}

async function searchSpotifyArtist(artist, token) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: artist,
        type: 'artist',
        limit: 1
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    log(`Error searching Spotify for artist ${artist}:`, error);
    throw error;
  }
}

async function searchGoogle(query) {
  if (!GOOGLE_CSE_ID || !GOOGLE_API_KEY) {
    log('Google Custom Search credentials are not set. Skipping Google search.');
    return false;
  }

  try {
    const response = await axios.get(`https://www.googleapis.com/customsearch/v1`, {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CSE_ID,
        q: query
      }
    });
    return response.data.items && response.data.items.length > 0;
  } catch (error) {
    log(`Error searching Google for query ${query}:`, error);
    return false;
  }
}

module.exports = {
  processImage,
  validateArtists
};
