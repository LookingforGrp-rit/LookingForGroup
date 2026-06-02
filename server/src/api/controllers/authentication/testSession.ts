import type { Request, Response } from 'express';

export const testSessions = (req: Request, res: Response) => {
  console.log(`data: ${JSON.stringify(req.session)}`);
  return res.status(200).json(`SID: ${req.session.id}`);
};
