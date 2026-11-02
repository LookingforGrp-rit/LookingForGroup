import type { ApiResponse } from '@looking-for-group/shared';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * What a body field may hold:
 * - 'string': text
 * - 'integer': a whole number
 * - a list of strings: exactly one of those values (e.g. an enum)
 */
export type BodyFieldRule = 'string' | 'integer' | readonly string[];

const matchesRule = (value: unknown, rule: BodyFieldRule): boolean => {
  if (rule === 'string') return typeof value === 'string';
  if (rule === 'integer') return Number.isInteger(value);
  return typeof value === 'string' && rule.includes(value);
};

const reject = (res: Response, error: string) => {
  const resBody: ApiResponse = { status: 400, error, data: null };
  res.status(400).json(resBody);
};

/**
 * Only lets a request through if its body is an object whose fields are all
 * listed in `rules`, and each holds the kind of value its rule allows. Fields
 * that are left out are fine.
 *
 * Use it on routes that hand the body to the database as-is. Without it, a
 * caller could send fields the route was never meant to change (for example
 * `userId` or `projectId`, to move something onto another user's page), or send
 * Prisma's own update syntax in place of a plain value (for example
 * `{ "set": "..." }`, or `{ "update": { ... } }` to write to a related record).
 *
 * @param rules - The fields the route accepts and what each may hold
 */
export const validateBody = (rules: Record<string, BodyFieldRule>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const body: unknown = req.body ?? {};

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      reject(res, 'The request body must be an object');
      return;
    }

    const unknownFields = Object.keys(body).filter((field) => !Object.hasOwn(rules, field));
    if (unknownFields.length > 0) {
      reject(res, `Invalid fields: ${JSON.stringify(unknownFields)}`);
      return;
    }

    for (const [field, rule] of Object.entries(rules)) {
      const value = (body as Record<string, unknown>)[field];
      if (value !== undefined && !matchesRule(value, rule)) {
        reject(res, `Invalid value for ${field}`);
        return;
      }
    }

    next();
  };
};
