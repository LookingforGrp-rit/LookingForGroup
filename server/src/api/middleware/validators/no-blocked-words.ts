import type { ApiResponse } from '@looking-for-group/shared';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { containsBlockedWord } from '#services/moderation/blocked-words.ts';

// "altText" -> "alt text"
const describeField = (field: string): string =>
  field.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();

/**
 * Rejects the request with a 400 if any of the given text fields in the request
 * body contains a word or phrase from the blocked list. Fields that are missing
 * (or null) are skipped, and a field that holds anything other than text is
 * rejected too. Put it after anything that reads the body (e.g. multer for file
 * uploads).
 *
 * The response names the field but not the word that matched, so the list can't
 * be probed one word at a time.
 *
 * @param fields - Names of the body fields to check
 */
export const noBlockedWords = (...fields: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = (req.body ?? {}) as Record<string, unknown>;

    for (const field of fields) {
      const value = body[field];

      // Anything other than text could hide a blocked word from the check (e.g.
      // Prisma's `{ "set": "..." }` syntax is accepted as a value later on)
      if (value !== undefined && value !== null && typeof value !== 'string') {
        const resBody: ApiResponse = {
          status: 400,
          error: `The ${describeField(field)} must be text.`,
          data: null,
        };
        res.status(400).json(resBody);
        return;
      }

      if (typeof value === 'string' && containsBlockedWord(value)) {
        const resBody: ApiResponse = {
          status: 400,
          error: `The ${describeField(field)} contains a word or phrase that isn't allowed. Please reword it.`,
          data: null,
        };
        res.status(400).json(resBody);
        return;
      }
    }

    next();
  };
};
