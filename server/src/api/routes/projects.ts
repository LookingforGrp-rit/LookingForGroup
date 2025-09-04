import { Router } from 'express';
import { upload } from '#config/multer.ts';
import PROJECT from '#controllers/projects/index.ts';
import injectCurrentUser from '../middleware/inject-current-user.ts';
import requiresLogin from '../middleware/requires-login.ts';
import requiresProjectOwner from '../middleware/requires-project-owner.ts';

const router = Router();

//Receive all projects
router.get('/', PROJECT.getProjects);

//Create a new project
router.post(
  '/',
  requiresLogin,
  injectCurrentUser,
  upload.single('thumbnail'),
  PROJECT.createProject,
);

//Get a specific project
router.get('/:id', PROJECT.getProjectByID);

//Edits a project through a specific id
router.put(
  '/:id',
  requiresLogin,
  injectCurrentUser,
  requiresProjectOwner,
  upload.single('thumbnail'),
  PROJECT.updateProject,
);

//Deletes project through a specific id
router.delete(
  '/:id',
  requiresLogin,
  injectCurrentUser,
  requiresProjectOwner,
  PROJECT.deleteProject,
);

//Receives pictures from project through id
router.get('/:id/pictures', PROJECT.getProjectPics);

router.put(
  '/:id/pictures/reorder',
  requiresLogin,
  injectCurrentUser,
  requiresProjectOwner,
  PROJECT.reorderImages,
);

//Creates a new picture for a project
router.post(
  '/:id/pictures',
  requiresLogin,
  injectCurrentUser,
  requiresProjectOwner,
  upload.single('image'),
  PROJECT.addImage,
);

//Changes a picture for a project
router.put(
  '/:id/pictures/:picId',
  requiresLogin,
  injectCurrentUser,
  requiresProjectOwner,
  upload.single('image'),
  PROJECT.updateImage,
);

//Removes picture from a project
router.delete(
  '/:id/pictures/:picId',
  requiresLogin,
  injectCurrentUser,
  requiresProjectOwner,
  PROJECT.removeImage,
);

//Adds member to a specific project through id
router.post(
  '/:id/members',
  requiresLogin,
  injectCurrentUser,
  requiresProjectOwner,
  PROJECT.addMember,
);

//Edits a member of a specific project through id
router.put(
  '/:id/members/:userId',
  requiresLogin,
  injectCurrentUser,
  requiresProjectOwner,
  PROJECT.updateMember,
);

//Removes a member from a specific project through project and user ID
router.delete(
  '/:id/members/:userId',
  requiresLogin,
  injectCurrentUser,
  requiresProjectOwner,
  PROJECT.deleteMember,
);

export default router;
