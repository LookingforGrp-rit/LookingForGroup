import { Router } from 'express';
import { addProjectFollowing } from '#controllers/me/add-follow-proj.ts';
import { addUserFollowing } from '#controllers/me/add-follow-user.ts';
import { deleteProjectFollowing } from '#controllers/me/delete-follow-proj.ts';
import { deleteUserFollowing } from '#controllers/me/delete-follow-user.ts';
import { deleteUser } from '#controllers/me/delete-user.ts';
import { getMyProjects } from '#controllers/me/get-my-proj.ts';
import { updateUserInfo } from '#controllers/me/update-info.ts';
import { getAccount } from '#controllers/users/get-acc.ts';
import injectCurrentUser from '../middleware/inject-current-user.ts';
import requiresLogin from '../middleware/requires-login.ts';

const router = Router();

//All routes use requiresLogin and injectCurrentUser
router.use(requiresLogin, injectCurrentUser);

//Gets user's account
router.get('/', getAccount);

//Updates users information
router.put('/', updateUserInfo);

//Delete user
router.delete('/', deleteUser);

//Updates users profile images
//router.put('/profile-picture', checkImageFile, updateProfilePicture);

//Gets current user's projects
router.get('/projects', getMyProjects);

//Follows a project
router.post('/followings/projects/:id', addProjectFollowing);

//Unfollows a project
router.delete('/followings/projects/:id', deleteProjectFollowing);

//Follows a user
router.post('/followings/people/:id', addUserFollowing);

//Unfollows a user
router.delete('/followings/people/:id', deleteUserFollowing);

export default router;
