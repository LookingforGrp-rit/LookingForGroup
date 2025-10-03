import type { AuthenticatedRequest } from '@looking-for-group/shared';
import { Router, type NextFunction, type Request, type Response } from 'express';
import { upload } from '#config/multer.ts';
import PROJECT from '#controllers/projects/index.ts';
import injectCurrentUser from '../middleware/inject-current-user.ts';
import requiresLogin from '../middleware/requires-login.ts';
import requiresProjectOwner from '../middleware/requires-project-owner.ts';

const router = Router();

export const authenticated = (
  controller: (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => void | Promise<void>,
) =>
  controller as unknown as (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void | Promise<void>;

//Receive all projects
router.get('/', PROJECT.getProjects);

//Create a new project
router.post(
  '/',
  requiresLogin,
  injectCurrentUser,
  upload.single('thumbnail'),
  authenticated(PROJECT.createProject),
);

//Get a specific project
router.get('/:id', PROJECT.getProjectByID);

//Edits a project through a specific id
router.patch(
  '/:id',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  upload.single('thumbnail'),
  authenticated(PROJECT.updateProject),
);

//Deletes project through a specific id
router.delete(
  '/:id',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  PROJECT.deleteProject,
);

//Gets the followers of a project
router.get('/:id/followers', PROJECT.getProjectFollowers);

// IMAGE ROUTES

//Receives pictures from project through id
router.get('/:id/images', PROJECT.getProjectImages);
//Creates a new picture for a project
router.post(
  '/:id/images',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  upload.single('image'),
  PROJECT.addImage,
);
//Changes a picture for a project
router.patch(
  '/:id/images/:imageId',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  upload.single('image'),
  PROJECT.updateImage,
);
//Removes picture from a project
router.delete(
  '/:id/images/:imageId',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  PROJECT.removeImage,
);
//Reorders a project's images
router.put(
  '/:id/images/reorder',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  PROJECT.reorderImages,
);

// MEDIUMS ROUTES

//Gets a project's mediums
router.get('/:id/mediums', PROJECT.getProjectMediums);
//Adds mediums to a project
router.post(
  '/:id/mediums',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  PROJECT.addMediums,
);
//Removes mediums from a project
router.delete(
  '/:id/mediums/',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  PROJECT.deleteMediums,
);

// MEMBERS ROUTES

//Adds member to a specific project through id
router.post(
  '/:id/members',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  PROJECT.addMember,
);
//Edits a member of a specific project through id
router.put(
  '/:id/members/:userId',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  PROJECT.updateMember,
);
//Removes a member from a specific project through project and user ID
router.delete(
  '/:id/members/:userId',
  requiresLogin,
  injectCurrentUser,
  authenticated(PROJECT.deleteMember),
);

// SOCIALS ROUTES

//Adds a project social
router.post(
  '/:id/socials',
  requiresLogin,
  authenticated(requiresProjectOwner),
  PROJECT.addProjectSocial,
);
//Gets all project socials
router.get('/:id/socials', PROJECT.getProjectSocials);
//Updates a project social
router.put(
  '/:id/socials/:websiteId',
  requiresLogin,
  authenticated(requiresProjectOwner),
  PROJECT.updateProjectSocial,
);
//Deletes a project social
router.delete(
  '/:id/socials/:websiteId',
  requiresLogin,
  authenticated(requiresProjectOwner),
  PROJECT.deleteProjectSocial,
);

// TAGS ROUTES

//Get a project's tags
router.get('/:id/tags', PROJECT.getTags);
//Deletes the tags in a project
router.delete(
  '/:id/tags/',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  PROJECT.deleteTags,
);
//Adds a project tag
router.post(
  '/:id/tags',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  PROJECT.addTags,
);

export default router;
