import { Router } from 'express';
import { createUser } from '#controllers/users/create-user.ts';
import { getProjectsFollowing } from '#controllers/users/followings/get-proj-following.ts';
import { getUserFollowers } from '#controllers/users/followings/get-user-followers.ts';
import { getUserFollowing } from '#controllers/users/followings/get-user-following.ts';
import { getAllUsers } from '#controllers/users/get-all.ts';
import { getUserByEmail } from '#controllers/users/get-user/get-by-email.ts';
import { getUserByGoogleId } from '#controllers/users/get-user/get-by-google-id.ts';
import { getUserById } from '#controllers/users/get-user/get-by-id.ts';
import { getUserByUsername } from '#controllers/users/get-user/get-by-username.ts';
import { getOtherUserProjects } from '#controllers/users/get-user-proj.ts';
import { getBlacklistedUsers } from '../controllers/users/get-blacklisted-users.ts';
import requiresLogin from '../middleware/authorization/requires-login.ts';
import { userExistsAt } from '../middleware/validators/user-exists-at.ts';

const router = Router();

//Gets users
router.get('/all/:method', getAllUsers);

//Creates a new user
router.post('/', createUser);

//Gets another user's projects
router.get('/:id/projects/', getOtherUserProjects);

// FOLLOW ROUTES

//Gets projects user is following
router.get(
  '/:id/followings/projects',
  userExistsAt('path', 'id'),
  requiresLogin,
  getProjectsFollowing,
);
//Gets users user is following
router.get('/:id/followings/people', userExistsAt('path', 'id'), requiresLogin, getUserFollowing);
//Gets users that follow this user
router.get('/:id/followers', userExistsAt('path', 'id'), requiresLogin, getUserFollowers);

// GET BLACKLIST ROUTES

//Gets users on the blacklist
router.get('/blacklist', requiresLogin, getBlacklistedUsers);

// GET USER ROUTES

//Gets users by id
router.get('/:id', getUserById);
//Gets users by username
router.get('/search-username/:username', getUserByUsername);
// Gets users by email
router.get('/search-email/:email', getUserByEmail);
//Get ysers by google id
router.get('/search-google/:id', getUserByGoogleId);

export default router;
