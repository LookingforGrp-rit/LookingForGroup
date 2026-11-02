/**
 * Checks text against a list of blocked words and phrases. Shared so the
 * server (which enforces it) and the editors (which warn before saving) always
 * agree. The lists themselves are blocked-words.en.txt and
 * blocked-words.custom.txt in this folder; each side loads them and passes
 * them to createBlockedWordFinder.
 *
 * Matching is by whole word or phrase, never by a few letters inside a longer
 * word, so "classic", "analysis" and "Scunthorpe" are fine. It still catches the
 * usual ways around a filter:
 * - case, accents and zero-width characters
 * - look-alike characters inside a word: "a$$", "h3ll0"
 * - letters split up: "b.a.d", "b a d", "b-a-d"
 * - stretched letters: "baaad"
 * - plural and simple endings: "bads", "badder"
 *
 * It is English only, and it doesn't catch look-alike letters from other
 * alphabets (e.g. a Cyrillic "а" in place of an "a").
 */

/**
 * Turns the contents of a list file into its entries: one word or phrase per
 * line, ignoring blank lines and lines starting with #.
 *
 * @param fileContents - The text of a list file
 */
export const parseWordList = (fileContents: string): string[] =>
  fileContents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));

// Characters people swap in for letters
const LOOKALIKES: Record<string, string> = {
  '@': 'a',
  $: 's',
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
};

// Endings that are dropped to find the base word ("asses" -> "ass")
const ENDINGS = ['ers', 'ing', 'er', 'es', 'ed', 's'];

// Lowercases, and removes accents (\p{M}) and invisible characters such as
// zero-width spaces (\p{Cf})
const clean = (text: string): string =>
  text
    .normalize('NFKD')
    .replace(/[\p{M}\p{Cf}]/gu, '')
    .toLowerCase();

const isLetter = (character: string): boolean => character >= 'a' && character <= 'z';

// Splits text into words made of letters and digits
const splitWords = (text: string): string[] => text.split(/[^a-z0-9]+/).filter(Boolean);

// Joins runs of single letters back into one word: ["b", "a", "d"] -> ["bad"]
const joinSingleLetters = (words: string[]): string[] => {
  const joined: string[] = [];
  let run = '';
  for (const word of words) {
    if (word.length === 1 && isLetter(word)) {
      run += word;
      continue;
    }
    if (run) joined.push(run);
    run = '';
    joined.push(word);
  }
  if (run) joined.push(run);
  return joined;
};

// "baaad" -> "baad" (keep = 2) or "bad" (keep = 1); only runs of 3+ are shortened
const shortenRepeats = (word: string, keep: number): string =>
  word.replace(/(.)\1{2,}/g, (_, character: string) => character.repeat(keep));

// Every form of a word that could be on the list
const forms = (word: string): string[] => {
  const results = new Set<string>();
  for (const base of [word, shortenRepeats(word, 2), shortenRepeats(word, 1)]) {
    results.add(base);
    for (const ending of ENDINGS) {
      if (base.endsWith(ending) && base.length - ending.length >= 3) {
        results.add(base.slice(0, -ending.length));
      }
    }
  }
  return [...results];
};

// Words that could be what the text says, with and without look-alikes swapped back
const readText = (text: string): string[][] => {
  const cleaned = clean(text);
  // Only swap look-alikes in words that have a letter in them, so plain
  // numbers like "300" and "$5" are left alone
  const decoded = cleaned.replace(/[a-z0-9@$]+/g, (chunk) =>
    /[a-z]/.test(chunk) ? chunk.replace(/[@$013457]/g, (c) => LOOKALIKES[c]) : chunk,
  );

  return [cleaned, decoded].flatMap((version) => {
    const words = splitWords(version);
    return [words, joinSingleLetters(words)];
  });
};

/**
 * Builds a function that finds the first blocked word or phrase in some text.
 *
 * @param entries - The blocked words and phrases (see parseWordList)
 * @returns a function that takes some text and returns the entry that matched,
 *   or null if the text is fine
 */
export const createBlockedWordFinder = (entries: readonly string[]) => {
  // The list, as single words and as phrases grouped by their first word
  const single = new Map<string, string>();
  const phrases = new Map<string, { words: string[]; entry: string }[]>();

  for (const entry of entries) {
    const words = splitWords(clean(entry));
    if (words.length === 0) continue;

    if (words.length === 1) {
      single.set(words[0], entry);
    } else {
      const group = phrases.get(words[0]) ?? [];
      group.push({ words, entry });
      phrases.set(words[0], group);
    }
  }

  return (text: string): string | null => {
    for (const words of readText(text)) {
      const options = words.map(forms);

      for (let index = 0; index < words.length; index++) {
        for (const form of options[index]) {
          const entry = single.get(form);
          if (entry) return entry;

          for (const phrase of phrases.get(form) ?? []) {
            const matches = phrase.words.every((word, offset) =>
              options[index + offset]?.includes(word),
            );
            if (matches) return phrase.entry;
          }
        }
      }
    }

    return null;
  };
};
