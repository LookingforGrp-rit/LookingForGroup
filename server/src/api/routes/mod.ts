import { Router } from 'express';
import requiresModerator from '../middleware/requires-mod.ts';

const router = Router();

//the mod routes all require mod
router.use(requiresModerator);
