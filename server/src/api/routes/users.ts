import { Router } from 'express';
import { getAllUsers } from '#controllers/users/get-all.ts';
import { getUserByEmail } from '#controllers/users/get-by-email.ts';
import { getUsernameById } from '#controllers/users/get-by-id.ts';
import { getUserByUsername } from '#controllers/users/get-by-username.ts';
import { getProjectsFollowing } from '#controllers/users/get-proj-following.ts';
import { getUserFollowing } from '#controllers/users/get-user-following.ts';
import { getOtherUserProjects } from '#controllers/users/get-user-proj.ts';
import { getUsernameByShib } from '#controllers/users/get-username-shib.ts';
import requiresLogin from '../middleware/requires-login.ts';

const router = Router();

//Gets username by shib ID
router.get('/get-username', requiresLogin, getUsernameByShib);
//formerly get-username-session

//Gets users
router.get('/', getAllUsers);

//Gets users by id
router.get('/:id', getUsernameById);

//Gets users by username
router.get('/search-username/:username', getUserByUsername);

// Gets users by email
router.get('/search-email/:email', getUserByEmail);

//Updates users profile images
//router.put('/:id/profile-picture', requiresLogin, checkImageFile, updateProfilePicture);

//Gets another user's projects
router.get('/:id/projects/profile', getOtherUserProjects);

//Gets projects user is following
router.get('/:id/followings/projects', requiresLogin, getProjectsFollowing);

//Gets users user is following
router.get('/:id/followings/people', requiresLogin, getUserFollowing);

export default router;
