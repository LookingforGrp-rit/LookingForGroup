import type { AuthenticatedRequest } from '@looking-for-group/shared';
import { Router, type Request, type Response, type NextFunction } from 'express';
import { banUser } from '#controllers/mod/ban-user.ts';
import { clearProfile } from '#controllers/mod/clear-profile.ts';
import { deleteProjectReport } from '#controllers/mod/delete-project-report.ts';
import { deleteProject } from '#controllers/mod/delete-project.ts';
import { deleteUserReport } from '#controllers/mod/delete-user-report.ts';
import { getProjectReports } from '#controllers/mod/get-project-reports.ts';
import { getUserReports } from '#controllers/mod/get-user-reports.ts';
import { sendWarning } from '#controllers/mod/send-warning.ts';
import { unbanUser } from '#controllers/mod/unban-user.ts';
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

router.patch('/clear-profile/:id/', authenticated(clearProfile));
router.delete('/delete-project/:id/', authenticated(deleteProject));
router.put('/ban-user/:googleId/:reason', authenticated(banUser));
router.delete('/unban-user/:googleId/', authenticated(unbanUser));
router.get('/project-report/', authenticated(getProjectReports));
router.get('/user-report/', authenticated(getUserReports));
router.delete('/project-report/:id', authenticated(deleteProjectReport));
router.delete('/user-report/:id', authenticated(deleteUserReport));
router.put('/warn-user/:id/', authenticated(sendWarning));
export default router;
