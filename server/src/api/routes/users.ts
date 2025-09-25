import { Router } from 'express';
import { createUser } from '#controllers/users/create-user.ts';
import { getProjectsFollowing } from '#controllers/users/followings/get-proj-following.ts';
import { getUserFollowers } from '#controllers/users/followings/get-user-followers.ts';
import { getUserFollowing } from '#controllers/users/followings/get-user-following.ts';
import { getAllUsers } from '#controllers/users/get-all-users.ts';
import { getUserByEmail } from '#controllers/users/get-user/get-by-email.ts';
import { getUsernameById } from '#controllers/users/get-user/get-by-id.ts';
import { getUserByUsername } from '#controllers/users/get-user/get-by-username.ts';
import { getUserProjects } from '#controllers/users/get-user-proj.ts';
import requiresLogin from '../middleware/requires-login.ts';

const router = Router();

//Gets users
router.get('/', getAllUsers);

//Creates a new user
router.post('/', requiresLogin, createUser);

//Gets another user's projects
router.get('/:id/projects/', getUserProjects);

// FOLLOW ROUTES

//Gets projects user is following
router.get('/:id/followings/projects', requiresLogin, getProjectsFollowing);
//Gets users user is following
router.get('/:id/followings/people', requiresLogin, getUserFollowing);
//Gets users that follow this user
router.get('/:id/followers', requiresLogin, getUserFollowers);

// GET USER ROUTES

//Gets users by id
router.get('/:id', getUsernameById);
//Gets users by username
router.get('/search-username/:username', getUserByUsername);
// Gets users by email
router.get('/search-email/:email', getUserByEmail);

export default router;
