import { Router } from 'express';
import { addProjectFollowing } from '#controllers/me/add-follow-proj.ts';
import { addUserFollowing } from '#controllers/me/add-follow-user.ts';
import { deleteProjectFollowing } from '#controllers/me/delete-follow-proj.ts';
import { deleteUserFollowing } from '#controllers/me/delete-follow-user.ts';
import { deleteUser } from '#controllers/me/delete-user.ts';
import { getMyProjects } from '#controllers/me/get-my-proj.ts';
import { updateUserInfo } from '#controllers/me/update-info.ts';
import requiresLogin from '../middleware/requires-login.ts';

const router = Router();

//Updates users information
router.put('/', requiresLogin, updateUserInfo);

//Delete user
router.delete('/', requiresLogin, deleteUser);

//Updates users profile images
//router.put('/profile-picture', requiresLogin, checkImageFile, updateProfilePicture);

//Gets current user's projects
router.get('/projects', requiresLogin, getMyProjects);

//Follows a project
router.post('/followings/projects/:followId', requiresLogin, addProjectFollowing);

//Unfollows a project
router.delete('/followings/projects/:followId', requiresLogin, deleteProjectFollowing);

//Follows a user
router.post('/followings/people/:followId', requiresLogin, addUserFollowing);

//Unfollows a user
router.delete('/followings/people/:followId', requiresLogin, deleteUserFollowing);

export default router;
