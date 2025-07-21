import { Router } from 'express';
import getJobTitlesController from '#controllers/datasets/get-job-titles.ts';
import getMajorsController from '#controllers/datasets/get-majors.ts';
import getProjectTypesController from '#controllers/datasets/get-project-genres.ts';
import getSkillsController from '#controllers/datasets/get-skills.ts';
import getSocialsController from '#controllers/datasets/get-socials.ts';
import getTagsController from '#controllers/datasets/get-tags.ts';

const router = Router();

//Receives list of all job-titles
router.get('/job-titles', getJobTitlesController);

//Receives list of all skills
router.get('/skills', getSkillsController);

//Receives list of all majors
router.get('/majors', getMajorsController);

//Receives list of all possible project-types
router.get('/project-types', getProjectTypesController);

//Receives list of all tags
router.get('/tags', getTagsController);

//Receives all socials from datasets
router.get('/socials', getSocialsController);

export default router;
