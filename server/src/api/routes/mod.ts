import type { AuthenticatedRequest } from '@looking-for-group/shared';
import { Router, type Request, type Response, type NextFunction } from 'express';
import { banUser } from '#controllers/mod/ban-user.ts';
import { clearProfile } from '#controllers/mod/clear-profile.ts';
import { deactivateUserReport } from '#controllers/mod/deactivate-user-report.ts';
import { deleteProjectReport } from '#controllers/mod/delete-project-report.ts';
import { deleteProject } from '#controllers/mod/delete-project.ts';
import { deleteUserReport } from '#controllers/mod/delete-user-report.ts';
import { getProjectReportById } from '#controllers/mod/get-project-report-by-id.ts';
import { getProjectReports } from '#controllers/mod/get-project-reports.ts';
import { getUserReportById } from '#controllers/mod/get-user-report-by-id.ts';
import { getUserReports } from '#controllers/mod/get-user-reports.ts';
import { unbanUser } from '#controllers/mod/unban-user.ts';
import { userExistsAt } from '#middleware/validators/user-exists-at.ts';
import { userReportExistsAt } from '#middleware/validators/user-report-exists-at.ts';
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

router.get('/project-report/', authenticated(getProjectReports));
router.get('/user-report/', authenticated(getUserReports));
router.get('/project-report/:id', authenticated(getProjectReportById));
router.get('/user-report/:id', authenticated(getUserReportById));

router.patch('/clear-profile/:id/', authenticated(clearProfile));
router.patch(
  '/user-report/:id/deactivate',
  userReportExistsAt('path', 'id'),
  authenticated(deactivateUserReport),
);

router.post('/ban-user/:id', userExistsAt('path', 'id'), authenticated(banUser));

router.delete('/delete-project/:id/', authenticated(deleteProject));
router.delete('/unban-user/:googleId/', authenticated(unbanUser));
router.delete('/project-report/:id', authenticated(deleteProjectReport));
router.delete('/user-report/:id', authenticated(deleteUserReport));

export default router;
