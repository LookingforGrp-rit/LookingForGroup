import { Router } from 'express';
import { upload } from '#config/multer.ts';
import PROJECT from '#controllers/projects/index.ts';
import injectCurrentUser from '../middleware/inject-current-user.ts';
import requiresLogin from '../middleware/requires-login.ts';
import requiresProjectOwner from '../middleware/requires-project-owner.ts';
//NOTICE: requiresProjectOwner is broken

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

//et a project's tags
router.get('/:id/tags', PROJECT.getTags);

//Edits a project through a specific id
router.patch(
  '/:id',
  requiresLogin,
  injectCurrentUser,
  //requiresProjectOwner,
  upload.single('thumbnail'),
  PROJECT.updateProject,
);

//Adds a project social
router.post(
  '/:id/socials',
  requiresLogin,
  //requiresProjectOwner,
  PROJECT.addProjectSocial,
);

//Gets all project socials
router.get('/:id/socials', PROJECT.getProjectSocials);

//Updates a project social
router.put(
  '/:id/socials/:websiteId',
  requiresLogin,
  //requiresProjectOwner,
  PROJECT.updateProjectSocial,
);

//Deletes a project social
router.delete(
  '/:id/socials/:websiteId',
  requiresLogin,
  //requiresProjectOwner,
  PROJECT.deleteProjectSocial,
);

//Deletes project through a specific id
router.delete(
  '/:id',
  requiresLogin,
  injectCurrentUser,
  //requiresProjectOwner,
  PROJECT.deleteProject,
);

//Deletes the tags in a project
router.delete(
  '/:id/tags/',
  requiresLogin,
  injectCurrentUser,
  //requiresProjectOwner,
  PROJECT.deleteTags,
);

//Receives pictures from project through id
router.get('/:id/images', PROJECT.getProjectImages);

//Reorders a project's images
router.put(
  '/:id/images/reorder',
  requiresLogin,
  injectCurrentUser,
  //requiresProjectOwner,
  PROJECT.reorderImages,
);

//Gets a project's mediums
router.get('/:id/mediums', PROJECT.getProjectMediums);

//Adds mediums to a project
router.post(
  '/:id/mediums',
  requiresLogin,
  injectCurrentUser,
  //requiresProjectOwner,
  PROJECT.addMediums,
);

//Removes mediums from a project
router.delete(
  '/:id/mediums/',
  requiresLogin,
  injectCurrentUser,
  //requiresProjectOwner,
  PROJECT.deleteMediums,
);

//Creates a new picture for a project
router.post(
  '/:id/images',
  requiresLogin,
  injectCurrentUser,
  //requiresProjectOwner,
  upload.single('image'),
  PROJECT.addImage,
);

//Changes a picture for a project
router.patch(
  '/:id/images/:imageId',
  requiresLogin,
  injectCurrentUser,
  //requiresProjectOwner,
  upload.single('image'),
  PROJECT.updateImage,
);

//Adds a project tag
router.post('/:id/tags', requiresLogin, injectCurrentUser, requiresProjectOwner, PROJECT.addTags);

//Removes picture from a project
router.delete(
  '/:id/images/:imageId',
  requiresLogin,
  injectCurrentUser,
  //requiresProjectOwner,
  PROJECT.removeImage,
);

//Adds member to a specific project through id
router.post(
  '/:id/members',
  requiresLogin,
  injectCurrentUser,
  //requiresProjectOwner,
  PROJECT.addMember,
);

//Edits a member of a specific project through id
router.put(
  '/:id/members/:userId',
  requiresLogin,
  injectCurrentUser,
  //requiresProjectOwner,
  PROJECT.updateMember,
);

//Removes a member from a specific project through project and user ID
router.delete(
  '/:id/members/:userId',
  requiresLogin,
  injectCurrentUser,
  //requiresProjectOwner,
  PROJECT.deleteMember,
);

export default router;
