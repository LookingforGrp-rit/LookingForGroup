import { Router } from 'express';
//import { authenticate } from '#middleware/authentication/authenticate.ts'; // TODO: figure this out
import { login } from '../controllers/authentication/login.ts';
import { testSessions } from '../controllers/authentication/testSession.ts';

const router = Router();

// Checks if the token given to the server is valid
router.post('/', login);

// Test endpoint. Remove once it is confirmed sessions are implemented.
router.get('/test', testSessions);

export default router;
