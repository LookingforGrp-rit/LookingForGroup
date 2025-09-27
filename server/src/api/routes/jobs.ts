import { Router } from 'express';
import addJobController from '#controllers/projects/jobs/add-job.ts';
import deleteJobController from '#controllers/projects/jobs/delete-job.ts';
import getJobsController from '#controllers/projects/jobs/get-job.ts';
import updtJobController from '#controllers/projects/jobs/update-job.ts';

const router = Router();

router.post('/', addJobController);
router.get('/:jobId', getJobsController);
router.put('/:jobId', updtJobController);
router.delete('/:jobId', deleteJobController);
export default router;
