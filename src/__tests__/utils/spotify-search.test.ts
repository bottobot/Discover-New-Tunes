import { describe, it, expect } from '@jest/globals';
import { normalizeArtistName, isExactMatch } from '@/utils/artistMatching';

describe('Spotify Artist Name Matching', () => {
  describe('normalizeArtistName', () => {
    it('should normalize artist names correctly', () => {
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
    it('should match exact names', () => {
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

    it('should not match different names', () => {
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
