import { Router } from 'express';
//import { authenticate } from '#middleware/authentication/authenticate.ts'; // TODO: figure this out
import { authenticate } from '../middleware/authentication/authenticate.ts';

const router = Router();

// Checks if the token given to the server is valid
router.get('/google-login', authenticate);
