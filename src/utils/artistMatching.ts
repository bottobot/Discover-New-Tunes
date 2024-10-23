export function normalizeArtistName(name: string): string {
  return name
    .toLowerCase()
    // Handle special cases first
    .replace(/p!nk/i, 'pink')
    // Then handle common substitutions
    .replace(/\$/g, 's')
    // Finally remove all remaining non-alphanumeric characters
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function isExactMatch(searchedName: string, spotifyName: string): boolean {
  const normalizedSearch = normalizeArtistName(searchedName);
  const normalizedSpotify = normalizeArtistName(spotifyName);
  return normalizedSearch === normalizedSpotify;
}
