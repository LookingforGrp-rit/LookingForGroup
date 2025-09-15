import { Router } from 'express';
import { upload } from '#config/multer.ts';
import { deleteUser } from '#controllers/me/delete-user.ts';
import { addProjectFollowing } from '#controllers/me/followings/add-follow-proj.ts';
import { addUserFollowing } from '#controllers/me/followings/add-follow-user.ts';
import { deleteProjectFollowing } from '#controllers/me/followings/delete-follow-proj.ts';
import { deleteUserFollowing } from '#controllers/me/followings/delete-follow-user.ts';
import { getAccount } from '#controllers/me/get-acc.ts';
import { getMyProjects } from '#controllers/me/get-my-proj.ts';
import { getUsernameByShib } from '#controllers/me/get-username-shib.ts';
import addSkills from '#controllers/me/skills/add-skills.ts';
import { deleteSkills } from '#controllers/me/skills/delete-skills.ts';
import { getSkills } from '#controllers/me/skills/get-skills.ts';
import updateSkills from '#controllers/me/skills/update-skills.ts';
import { addSocial } from '#controllers/me/socials/add-social.ts';
import { deleteSocial } from '#controllers/me/socials/delete-social.ts';
import { getSocials } from '#controllers/me/socials/get-socials.ts';
import { updateSocial } from '#controllers/me/socials/update-social.ts';
import { updateUserInfo } from '#controllers/me/update-info.ts';
import injectCurrentUser from '../middleware/inject-current-user.ts';
import requiresLogin from '../middleware/requires-login.ts';

const router = Router();

//All routes use requiresLogin and injectCurrentUser
router.use(requiresLogin, injectCurrentUser);

// FOLLOW ROUTES

//Follows a project
router.post('/followings/projects/:id', addProjectFollowing);
//Unfollows a project
router.delete('/followings/projects/:id', deleteProjectFollowing);
//Follows a user
router.post('/followings/people/:id', addUserFollowing);
//Unfollows a user
router.delete('/followings/people/:id', deleteUserFollowing);

// SKILLS ROUTES

//Gets a user's skills
router.get('/skills', getSkills);
//Adds skills
router.post('/skills', addSkills);
//Deletes a skill
router.delete('/skills/:id', deleteSkills);
//Updates a skill's proficiency (or position if it ever becomes useful)
router.patch('/skills/:id', updateSkills);

// SOCIALS ROUTES

//Gets a user's socials
router.get('/socials', getSocials);
//Adds a social
router.post('/socials', addSocial);
//Updates a social
router.put('/socials/:websiteId', updateSocial);
//Deletes a social
router.delete('/socials/:websiteId', deleteSocial);

//Gets user's account
router.get('/', getAccount);
//Updates users information
router.patch('/', upload.single('profileImage'), updateUserInfo);
//Delete user
router.delete('/', deleteUser);

//Gets username by shib ID
router.get('/get-username', getUsernameByShib);
//Gets current user's projects
router.get('/projects', getMyProjects);

export default router;
