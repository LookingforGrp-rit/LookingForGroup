import { createBlockedWordFinder, parseWordList } from '@looking-for-group/shared/blocked-words';
import customWords from '@looking-for-group/shared/blocked-words.custom.txt?raw';
import englishWords from '@looking-for-group/shared/blocked-words.en.txt?raw';

// The same list and matcher the server uses to reject text when saving, so the
// editors can point out the problem before anything is sent.
const findBlockedWord = createBlockedWordFinder([
  ...parseWordList(englishWords),
  ...parseWordList(customWords),
]);

type LabeledText = [label: string, text: string | null | undefined];

/**
 * Finds the first field that contains a blocked word or phrase.
 *
 * @param fields - Each field's name as the user knows it, and its text
 * @returns the name of the first field with a blocked word, or null if none do
 */
export const firstBlockedField = (fields: LabeledText[]): string | null => {
  for (const [label, text] of fields) {
    if (text && findBlockedWord(text) !== null) return label;
  }
  return null;
};

/**
 * The message shown when a field contains a blocked word or phrase.
 *
 * @param label - The field's name as the user knows it
 */
export const blockedFieldMessage = (label: string): string =>
  `The ${label} contains a word or phrase that isn't allowed!`;
