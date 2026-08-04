import { Router } from 'express';
import createSkill from '#controllers/admin/create-skill.ts';
import createTag from '#controllers/admin/create-tag.ts';
import deleteSkill from '#controllers/admin/delete-skill.ts';
import deleteTag from '#controllers/admin/delete-tag.ts';
import demoteMod from '#controllers/admin/demote-from-mod.ts';
import editSkill from '#controllers/admin/edit-skill.ts';
import editTag from '#controllers/admin/edit-tag.ts';
import { getAccessLevel } from '#controllers/admin/get-mod-status.ts';
import promoteUserToMod from '#controllers/admin/promote-to-mod.ts';
import requiresAdmin from '#middleware/authorization/requires-admin.ts';
import requiresLogin from '#middleware/authorization/requires-login.ts';
import injectCurrentUser from '#middleware/inject-current-user.ts';
import { sendNotificationAfterAll } from '#middleware/send-notification-after-all.ts';
import { skillExistsAt } from '#middleware/validators/skill-exists-at.ts';
import { tagExistsAt } from '#middleware/validators/tag-exists-at.ts';
import { userExistsAt } from '#middleware/validators/user-exists-at.ts';
import { DemotionFromModNotificationBuilder } from '#notification-templates/demotion-from-mod.ts';
import { PromotionToModNotificationBuilder } from '#notification-templates/promotion-to-mod-notification.ts';
import { authenticated } from './me.ts';

const router = Router();

router.get('/status/:id', requiresLogin, authenticated(getAccessLevel));

router.use(requiresLogin, injectCurrentUser, authenticated(requiresAdmin));

router.patch(
  '/promote',
  userExistsAt('body', 'userId'),
  sendNotificationAfterAll(new PromotionToModNotificationBuilder(), false),
  authenticated(promoteUserToMod),
);
router.patch(
  '/demote',
  userExistsAt('body', 'userId'),
  sendNotificationAfterAll(new DemotionFromModNotificationBuilder(), false),
  authenticated(demoteMod),
);

router.post('/tags', authenticated(createTag));
router.patch('/tags/:id', authenticated(tagExistsAt('path', 'id')), authenticated(editTag));
router.delete('/tags/:id', authenticated(tagExistsAt('path', 'id')), authenticated(deleteTag));

router.post('/skills', authenticated(createSkill));
router.patch('/skills/:id', authenticated(skillExistsAt('path', 'id')), authenticated(editSkill));
router.delete(
  '/skills/:id',
  authenticated(skillExistsAt('path', 'id')),
  authenticated(deleteSkill),
);

export default router;
