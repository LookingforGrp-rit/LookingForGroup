import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';

type ParameterLocation = 'path' | 'body';

export const skipIfEmpty = (
  type: ParameterLocation,
  key: string,
  validator: RequestHandler,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    let rawValue;

    switch (type) {
      case 'path':
        rawValue = req.params[key];
        break;
      case 'body':
        rawValue = (req.body as Record<string, unknown>)[key];
        break;
    }

    if (rawValue === undefined) {
      next();
      return;
    }

    validator(req, res, next);
    return;
  };
};
