import type { AuthenticatedRequest } from '@looking-for-group/shared';
import { Router, type NextFunction, type Request, type Response } from 'express';
import { upload } from '#config/multer.ts';
import PROJECT from '#controllers/projects/index.ts';
import requiresLogin from '../middleware/authorization/requires-login.ts';
import requiresProjectOwner from '../middleware/authorization/requires-project-owner.ts';
import injectCurrentUser from '../middleware/inject-current-user.ts';
import { attributeExistsAt } from '../middleware/validators/attribute-exists-at.ts';
import { projectAttributeExistsAt } from '../middleware/validators/project-attribute-exists-at.ts';
import { projectExistsAt } from '../middleware/validators/project-exists-at.ts';
import { skipIfEmpty } from '../middleware/validators/skip-if-empty.ts';
import { userExistsAt } from '../middleware/validators/user-exists-at.ts';

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

//Get a specific project's members
router.get('/:id', projectExistsAt('path', 'id'), PROJECT.getMembers);

//Edits a project through a specific id
router.patch(
  '/:id',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  upload.single('thumbnail'),
  authenticated(PROJECT.updateProject),
);

//Deletes project through a specific id
router.delete(
  '/:id',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  PROJECT.deleteProject,
);

//Gets the followers of a project
router.get('/:id/followers', projectExistsAt('path', 'id'), PROJECT.getProjectFollowers);

// IMAGE ROUTES

//Receives pictures from project through id
router.get('/:id/images', projectExistsAt('path', 'id'), PROJECT.getProjectImages);
//Creates a new picture for a project
router.post(
  '/:id/images',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  upload.single('image'),
  PROJECT.addImage,
);
//Changes a picture for a project
router.patch(
  '/:id/images/:imageId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt('image', { type: 'path', key: 'id' }, { type: 'path', key: 'imageId' }),
  authenticated(requiresProjectOwner),
  upload.single('image'),
  PROJECT.updateImage,
);
//Removes picture from a project
router.delete(
  '/:id/images/:imageId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt('image', { type: 'path', key: 'id' }, { type: 'path', key: 'imageId' }),
  authenticated(requiresProjectOwner),
  PROJECT.removeImage,
);
//Reorders a project's images
//is this really even needed...
router.put(
  '/:id/images/reorder',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  PROJECT.reorderImages,
);

// MEDIUMS ROUTES

//Gets a project's mediums
router.get('/:id/mediums', projectExistsAt('path', 'id'), PROJECT.getProjectMediums);
//Adds mediums to a project
router.post(
  '/:id/mediums',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  attributeExistsAt('medium', 'body', 'mediumId'),
  authenticated(requiresProjectOwner),
  PROJECT.addMediums,
);
//Removes mediums from a project
router.delete(
  '/:id/mediums/:mediumId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt(
    'medium',
    { type: 'path', key: 'id' },
    { type: 'path', key: 'mediumId' },
  ),
  authenticated(requiresProjectOwner),
  PROJECT.deleteMediums,
);

// MEMBERS ROUTES

//Adds member to a specific project through id
router.post(
  '/:id/members',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  userExistsAt('body', 'userId'),
  skipIfEmpty('body', 'roleId', attributeExistsAt('role', 'body', 'roleId')),
  authenticated(requiresProjectOwner),
  PROJECT.addMember,
);
//Edits a member of a specific project through id
router.patch(
  '/:id/members/:userId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  userExistsAt('path', 'userId'),
  projectAttributeExistsAt('member', { type: 'path', key: 'id' }, { type: 'path', key: 'userId' }),
  skipIfEmpty('body', 'roleId', attributeExistsAt('role', 'body', 'roleId')),
  authenticated(requiresProjectOwner),
  PROJECT.updateMember,
);
//Removes a member from a specific project through project and user ID
router.delete(
  '/:id/members/:userId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  userExistsAt('path', 'userId'),
  projectAttributeExistsAt('member', { type: 'path', key: 'id' }, { type: 'path', key: 'userId' }),
  authenticated(PROJECT.deleteMember),
);

// SOCIALS ROUTES

//Adds a project social
router.post(
  '/:id/socials',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  attributeExistsAt('social', 'body', 'websiteId'),
  authenticated(requiresProjectOwner),
  PROJECT.addProjectSocial,
);
//Gets all project socials
router.get('/:id/socials', projectExistsAt('path', 'id'), PROJECT.getProjectSocials);
//Updates a project social
router.patch(
  '/:id/socials/:websiteId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt(
    'social',
    { type: 'path', key: 'id' },
    { type: 'path', key: 'websiteId' },
  ),
  authenticated(requiresProjectOwner),
  PROJECT.updateProjectSocial,
);
//Deletes a project social
router.delete(
  '/:id/socials/:websiteId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt(
    'social',
    { type: 'path', key: 'id' },
    { type: 'path', key: 'websiteId' },
  ),
  authenticated(requiresProjectOwner),
  PROJECT.deleteProjectSocial,
);

// TAGS ROUTES

//Get a project's tags
router.get('/:id/tags', projectExistsAt('path', 'id'), PROJECT.getTags);
//Deletes a project tag
router.delete(
  '/:id/tags/:tagId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt('tag', { type: 'path', key: 'id' }, { type: 'path', key: 'tagId' }),
  authenticated(requiresProjectOwner),
  PROJECT.deleteTags,
);
//Adds a project tag
router.post(
  '/:id/tags',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  attributeExistsAt('tag', 'body', 'tagId'),
  authenticated(requiresProjectOwner),
  PROJECT.addTags,
);

// JOBS ROUTES

// creates a new project job
router.get('/:id/jobs', projectExistsAt('path', 'id'), PROJECT.getJobsController);
// creates a new project job
router.post(
  '/:id/jobs',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  attributeExistsAt('role', 'body', 'roleId'),
  userExistsAt('body', 'contactUserId'),
  projectAttributeExistsAt(
    'member',
    { type: 'path', key: 'id' },
    { type: 'body', key: 'contactUserId' },
  ),
  authenticated(requiresProjectOwner),
  PROJECT.addJobController,
);
// updates an existing project job
router.patch(
  '/:id/jobs/:jobId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt('job', { type: 'path', key: 'id' }, { type: 'path', key: 'jobId' }),
  skipIfEmpty('body', 'roleId', attributeExistsAt('role', 'body', 'roleId')),
  skipIfEmpty('body', 'contactUserId', userExistsAt('body', 'contactUserId')),
  skipIfEmpty(
    'body',
    'contactUserId',
    projectAttributeExistsAt(
      'member',
      { type: 'path', key: 'id' },
      { type: 'body', key: 'contactUserId' },
    ),
  ),
  authenticated(requiresProjectOwner),
  PROJECT.updateJobController,
);
// deletes an existing project job
router.delete(
  '/:id/jobs/:jobId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt('job', { type: 'path', key: 'id' }, { type: 'path', key: 'jobId' }),
  authenticated(requiresProjectOwner),
  PROJECT.deleteJobController,
);

export default router;
