import { Router } from 'express';
import demoteMod from '#controllers/admin/demote-from-mod.ts';
import promoteUserToMod from '#controllers/admin/promote-to-mod.ts';
import requiresAdmin from '#middleware/authorization/requires-admin.ts';
import requiresLogin from '#middleware/authorization/requires-login.ts';
import injectCurrentUser from '#middleware/inject-current-user.ts';
import { userExistsAt } from '#middleware/validators/user-exists-at.ts';
import { authenticated } from './me.ts';

const router = Router();

router.use(requiresLogin, injectCurrentUser, authenticated(requiresAdmin));

router.patch('/promote', userExistsAt('body', 'id'), authenticated(promoteUserToMod));

router.patch('/demote', userExistsAt('body', 'id'), authenticated(demoteMod));

export default router;
