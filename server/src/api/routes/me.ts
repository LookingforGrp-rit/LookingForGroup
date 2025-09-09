import { Router } from 'express';
import { upload } from '#config/multer.ts';
import { addProjectFollowing } from '#controllers/me/add-follow-proj.ts';
import { addUserFollowing } from '#controllers/me/add-follow-user.ts';
import addSkills from '#controllers/me/add-skills.ts';
import { addSocial } from '#controllers/me/add-social.ts';
import { deleteProjectFollowing } from '#controllers/me/delete-follow-proj.ts';
import { deleteUserFollowing } from '#controllers/me/delete-follow-user.ts';
import { deleteSkills } from '#controllers/me/delete-skills.ts';
import { deleteSocial } from '#controllers/me/delete-social.ts';
import { deleteUser } from '#controllers/me/delete-user.ts';
import { getAccount } from '#controllers/me/get-acc.ts';
import { getMyProjects } from '#controllers/me/get-my-proj.ts';
import { getSocials } from '#controllers/me/get-socials.ts';
import { getUsernameByShib } from '#controllers/me/get-username-shib.ts';
import { updateUserInfo } from '#controllers/me/update-info.ts';
import updateSkills from '#controllers/me/update-skills.ts';
import { updateSocial } from '#controllers/me/update-social.ts';
import injectCurrentUser from '../middleware/inject-current-user.ts';
import requiresLogin from '../middleware/requires-login.ts';

const router = Router();

//All routes use requiresLogin and injectCurrentUser
router.use(requiresLogin, injectCurrentUser);

//Gets username by shib ID
router.get('/get-username', getUsernameByShib);

//Gets user's account
router.get('/', getAccount);

router.get('/socials', getSocials);

//Updates users information
router.patch('/', upload.single('profile-pic'), updateUserInfo);

//Delete user
router.delete('/', deleteUser);

//Gets current user's projects
router.get('/projects', getMyProjects);

//Follows a project
router.post('/followings/projects/:id', addProjectFollowing);

//Adds a social
router.post('/socials', addSocial);

//Updates a social
router.put('/socials/:websiteId', updateSocial);

//Deletes a social
router.delete('/socials/:websiteId', deleteSocial);

//Gets a user's skills
//router.post('/skills', addSkills);

//Adds skills
router.post('/skills', addSkills);

//Deletes a skill
router.delete('/skills/:id', deleteSkills);

//Updates a skill's proficiency (or position if it ever becomes useful)
router.patch('/skills/:id', updateSkills);

//Unfollows a project
router.delete('/followings/projects/:id', deleteProjectFollowing);

//Follows a user
router.post('/followings/people/:id', addUserFollowing);

//Unfollows a user
router.delete('/followings/people/:id', deleteUserFollowing);

export default router;
