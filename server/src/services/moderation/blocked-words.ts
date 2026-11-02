import { readFileSync } from 'node:fs';
import { createBlockedWordFinder, parseWordList } from '@looking-for-group/shared/blocked-words.ts';

/**
 * Checks text against the blocked word list: blocked-words.en.txt plus the
 * team's own additions in blocked-words.custom.txt, both in the shared folder so
 * the editors can warn about the same words before saving. How matching works is
 * described in shared/blocked-words.ts.
 */

const readList = (fileName: string): string[] =>
  parseWordList(readFileSync(new URL(`../../../../shared/${fileName}`, import.meta.url), 'utf8'));

/**
 * Finds the first blocked word or phrase in some text.
 *
 * @param text - The text to check
 * @returns the entry from the list that matched, or null if the text is fine
 */
export const findBlockedWord = createBlockedWordFinder([
  ...readList('blocked-words.en.txt'),
  ...readList('blocked-words.custom.txt'),
]);

/**
 * Whether some text contains a blocked word or phrase.
 *
 * @param text - The text to check
 */
export const containsBlockedWord = (text: string): boolean => findBlockedWord(text) !== null;
