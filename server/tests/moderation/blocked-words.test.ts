import type { Request, Response } from 'express';
import { describe, it, expect, vi } from 'vitest';
import { noBlockedWords } from '#middleware/validators/no-blocked-words.ts';
import { containsBlockedWord, findBlockedWord } from '#services/moderation/blocked-words.ts';

// "ass", "bastard", "sexy", "god damn" and "strip club" are on the list. They're
// used here because they're mild, and because "ass" is the classic word that
// shows up inside innocent ones.

describe('containsBlockedWord', () => {
  describe('blocks', () => {
    it.each([
      ['a listed word on its own', 'ass'],
      ['a listed word in a sentence', 'This game is sexy and fun'],
      ['any capitalization', 'What an ASS'],
      ['a word next to punctuation', 'you bastard, you'],
      ['a word on its own line', 'first line\nbastard\nlast line'],
      ['a listed phrase', 'oh god damn it'],
      ['a phrase with extra spaces', 'strip     club'],
      ['a phrase joined by a hyphen', 'God-damn'],
    ])('%s', (_description, text) => {
      expect(containsBlockedWord(text)).toBe(true);
    });

    it.each([
      ['symbols in place of letters', 'a$$'],
      ['@ in place of a letter', '@ss'],
      ['numbers in place of letters', 'b4st4rd'],
      ['numbers and symbols in a phrase', 'str1p club'],
      ['dots between the letters', 'b.a.s.t.a.r.d'],
      ['spaces between the letters', 'b a s t a r d'],
      ['dashes between the letters', 'b-a-s-t-a-r-d'],
      ['stretched letters', 'baaastard'],
      ['stretched double letters', 'assss'],
      ['accents', 'bástard'],
      ['an invisible character inside the word', 'bas​tard'],
      ['a plural', 'asses'],
      ['a plural of another word', 'bastards'],
    ])('%s', (_description, text) => {
      expect(containsBlockedWord(text)).toBe(true);
    });
  });

  describe('allows', () => {
    it.each([
      'classic',
      'analysis',
      'assassin',
      'assess',
      'bass guitar',
      'Scunthorpe',
      'Essex',
      'pass the class',
      'A game about dragons',
      'Level 300 boss',
      '$5 and 100%',
      'Plan A, plan B, plan C',
      'Hello world.',
      '',
      '   ',
    ])('"%s"', (text) => {
      expect(containsBlockedWord(text)).toBe(false);
    });
  });

  it('says which list entry matched', () => {
    expect(findBlockedWord('what an a$$')).toBe('ass');
    expect(findBlockedWord('oh god damn it')).toBe('god damn');
    expect(findBlockedWord('a perfectly nice sentence')).toBeNull();
  });
});

describe('noBlockedWords middleware', () => {
  const run = (body: unknown, ...fields: string[]) => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const next = vi.fn();
    noBlockedWords(...fields)({ body } as Request, { status } as unknown as Response, next);
    return { json, status, next };
  };

  it('lets the request through when the fields are fine', () => {
    const { next, status } = run({ title: 'Dragon Quest', hook: 'A quest' }, 'title', 'hook');

    expect(next).toHaveBeenCalledOnce();
    expect(status).not.toHaveBeenCalled();
  });

  it('rejects with a 400 when a field has a blocked word', () => {
    const { next, status, json } = run(
      { title: 'Dragon Quest', hook: 'what an ass' },
      'title',
      'hook',
    );

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      status: 400,
      error: "The hook contains a word or phrase that isn't allowed. Please reword it.",
      data: null,
    });
  });

  it("names the field in plain words but doesn't repeat the blocked word", () => {
    const { json } = run({ altText: 'a bastard' }, 'altText');
    const { error } = json.mock.calls[0][0] as { error: string };

    expect(error).toContain('alt text');
    expect(error).not.toContain('bastard');
  });

  it("ignores fields that weren't sent or are null", () => {
    const { next } = run({ headline: null }, 'title', 'headline');

    expect(next).toHaveBeenCalledOnce();
  });

  it.each([
    ['a number', 5],
    ['a boolean', true],
    ['a list', ['ass']],
    ["Prisma's { set } syntax, which would hide a blocked word from the check", { set: 'ass' }],
    ["Prisma's { update } syntax", { update: { bio: 'ass' } }],
  ])('rejects a field holding %s', (_description, value) => {
    const { next, status, json } = run({ bio: value }, 'bio');

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      status: 400,
      error: 'The bio must be text.',
      data: null,
    });
  });

  it('only checks the fields it was given', () => {
    const { next } = run({ title: 'fine', notes: 'ass' }, 'title');

    expect(next).toHaveBeenCalledOnce();
  });

  it('copes with a request that has no body', () => {
    const { next } = run(undefined, 'title');

    expect(next).toHaveBeenCalledOnce();
  });
});
