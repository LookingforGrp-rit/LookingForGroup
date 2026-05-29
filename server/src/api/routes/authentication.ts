import { Router } from 'express';
//import { authenticate } from '#middleware/authentication/authenticate.ts'; // TODO: figure this out
import { login } from '../controllers/authentication/login.ts';

const router = Router();

// Checks if the token given to the server is valid
router.post('/', login);

export default router;
