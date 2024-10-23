import { normalizeArtistName, isExactMatch } from './src/utils/artistMatching';

describe('Spotify Artist Name Matching', () => {
  describe('normalizeArtistName', () => {
    test('should normalize artist names correctly', () => {
      const testCases = [
        ['A$AP Rocky', 'asaprocky'],
        ['P!nk', 'pink'],
        ['Deadmau5', 'deadmau5'],
        ['  The Artist  ', 'theartist'],
        ['DJ Snake!', 'djsnake']
      ];

      testCases.forEach(([input, expected]) => {
        expect(normalizeArtistName(input)).toBe(expected);
      });
    });
  });

  describe('isExactMatch', () => {
    test('should match exact names', () => {
      const testCases = [
        ['A$AP Rocky', 'ASAP Rocky'],
        ['P!nk', 'Pink'],
        ['The Artist!', 'The Artist'],
        ['  DJ Snake  ', 'DJ Snake']
      ];

      testCases.forEach(([input, compare]) => {
        expect(isExactMatch(input, compare)).toBe(true);
      });
    });

    test('should not match different names', () => {
      const testCases = [
        ['A$AP Rocky', 'ASAP Ferg'],
        ['P!nk', 'Pink Floyd'],
        ['The Artist', 'The Artists'],
        ['DJ Snake', 'Snake']
      ];

      testCases.forEach(([input, compare]) => {
        expect(isExactMatch(input, compare)).toBe(false);
      });
    });
  });
});
