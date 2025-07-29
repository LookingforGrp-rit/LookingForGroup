import { Router } from 'express';
import { addProjectFollowing } from '#controllers/users/add-follow-proj.ts';
import { addUserFollowing } from '#controllers/users/add-follow-user.ts';
import { deleteProjectFollowing } from '#controllers/users/delete-follow-proj.ts';
import { deleteUserFollowing } from '#controllers/users/delete-follow-user.ts';
import { deleteUser } from '#controllers/users/delete-user.ts';
import { getAccount } from '#controllers/users/get-acc.ts';
import { getAllUsers } from '#controllers/users/get-all.ts';
import { getUserByEmail } from '#controllers/users/get-by-email.ts';
import { getUsernameById } from '#controllers/users/get-by-id.ts';
import { getUserByUsername } from '#controllers/users/get-by-username.ts';
import { getMyProjects } from '#controllers/users/get-my-proj.ts';
import { getProjectsFollowing } from '#controllers/users/get-proj-following.ts';
import { getUserFollowing } from '#controllers/users/get-user-following.ts';
import { getOtherUserProjects } from '#controllers/users/get-user-proj.ts';
import { getUsernameByShib } from '#controllers/users/get-username-shib.ts';
import { updateUserInfo } from '#controllers/users/update-info.ts';
import { updateUsername } from '#controllers/users/update-username.ts';
import { updateVisibility } from '#controllers/users/update-vis.ts';
import requiresLogin from '../middleware/requires-login.ts';

const router = Router();

//Gets username by shib ID
router.get('/get-username', requiresLogin, getUsernameByShib);
//formerly get-username-session

//Gets users
router.get('/', getAllUsers);

//Gets users by id
router.get('/:id', getUsernameById);

//Updates users information
router.put('/:id', requiresLogin, updateUserInfo);

//Delete user
router.delete('/:id', deleteUser);

//Gets users by username
router.get('/search-username/:username', getUserByUsername);

// Gets users by email
router.get('/search-email/:email', getUserByEmail);

//Updates users profile images
//router.put('/:id/profile-picture', requiresLogin, checkImageFile, updateProfilePicture);

//Gets user's account
router.get('/:id/account', requiresLogin, getAccount);

//Updates users username
router.put('/:id/username', requiresLogin, updateUsername);

//Updates users visibility
router.put('/:id/visibility', requiresLogin, updateVisibility);

//Gets current user's projects
router.get('/:id/projects', requiresLogin, getMyProjects);

//Gets another user's projects
router.get('/:id/projects/profile', getOtherUserProjects);

//Gets projects user is following
router.get('/:id/followings/projects', requiresLogin, getProjectsFollowing);

//Adds users following project
router.post('/:id/followings/projects/:followId', requiresLogin, addProjectFollowing);

//Delete users following projects
router.delete('/:id/followings/projects/:followId', requiresLogin, deleteProjectFollowing);

//Gets users user is following
router.get('/:id/followings/people', requiresLogin, getUserFollowing);

//Adds users following users
router.post('/:id/followings/people/:followId', requiresLogin, addUserFollowing);

//Delete users following users
router.delete('/:id/followings/people/:followId', requiresLogin, deleteUserFollowing);

export default router;
