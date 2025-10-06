import type { AuthenticatedRequest } from '@looking-for-group/shared';
import { Router, type Request, type Response, type NextFunction } from 'express';
import { clearProfile } from '#controllers/mod/clear-profile.ts';
import requiresLogin from '../middleware/authorization/requires-login.ts';
import requiresModerator from '../middleware/authorization/requires-mod.ts';
import injectCurrentUser from '../middleware/inject-current-user.ts';

const router = Router();

export const authenticated = (
  controller: (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => void | Promise<void>,
) =>
  controller as unknown as (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void | Promise<void>;

//All routes use requiresLogin, injectCurrentUser, and requiresModerator
router.use(requiresLogin, injectCurrentUser, authenticated(requiresModerator));

router.put('/clear-profile/:id/', authenticated(clearProfile));

export default router;
