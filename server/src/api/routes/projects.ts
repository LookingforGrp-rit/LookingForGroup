import type { AuthenticatedRequest } from '@looking-for-group/shared';
import { Router, type NextFunction, type Request, type Response } from 'express';
import { upload } from '#config/multer.ts';
import PROJECT from '#controllers/projects/index.ts';
import { isUserBlocked } from '#middleware/validators/is-user-blocked.ts';
//import { BodyParameterLocation } from '#middleware/validators/parameter-location/body-param-location.ts';
import { MeParameterLocation } from '#middleware/validators/parameter-location/me-param-location.ts';
import { ProjectInPathParameterLocation } from '#middleware/validators/parameter-location/project-in-path-param-location.ts';
import requiresLogin from '../middleware/authorization/requires-login.ts';
import requiresModerator from '../middleware/authorization/requires-mod.ts';
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

//#region Static/Root Level Routes
// Receive all projects
router.get('/', PROJECT.getProjects);

// Create a new project
router.post('/', requiresLogin, injectCurrentUser, authenticated(PROJECT.createProject));

// Receive paginated projects
router.get('/paginated/:count/:id/:method', PROJECT.getPaginatedProjects);

//#region Member routes
// Get all invitations for a user
router.get(
  '/members/invitations',
  requiresLogin,
  injectCurrentUser,
  authenticated(PROJECT.getInvitations),
);

// Get a member request
router.get(
  '/members/requests',
  requiresLogin,
  injectCurrentUser,
  authenticated(PROJECT.getMemberRequest),
);

// Delete a member request
router.delete(
  '/members/requests/:id',
  requiresLogin,
  injectCurrentUser,
  authenticated(PROJECT.deleteMemberRequest),
);

// Update the status of a member request
router.patch(
  '/members/requests/:id',
  requiresLogin,
  injectCurrentUser,
  authenticated(PROJECT.updateMemberRequest),
);
//#endregion

//#region Unapproved projects routes
// Get all unapproved projects
router.get(
  '/unapproved',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresModerator),
  authenticated(PROJECT.getUnapprovedProjects),
);

// Get a specific unapproved project
router.get(
  '/unapproved/:id',
  requiresLogin,
  projectExistsAt('path', 'id'),
  authenticated(PROJECT.getUnapprovedProjectById),
);

// Place a project on the list of projects awaiting approval
router.post(
  '/unapproved/:id',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(PROJECT.requestApproval),
);

// Remove a project from approval waiting list without approving it
router.delete(
  '/unapproved/:id',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresModerator),
  projectExistsAt('path', 'id'),
  authenticated(PROJECT.rejectProject),
);
//#endregion
//#endregion

//#region Project ID routes (/:id)
// Get a specific project
router.get('/:id', PROJECT.getProjectByID);

// Approve a project
router.patch(
  '/:id/approve',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresModerator),
  projectExistsAt('path', 'id'),
  authenticated(PROJECT.approveProject),
);

// Unapprove a project
router.patch(
  '/:id/unapprove',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresModerator),
  projectExistsAt('path', 'id'),
  authenticated(PROJECT.unapproveProject),
);

//Receive all projects
router.get('/', PROJECT.getProjects);

//Receive paginated projects
router.get('/paginated/:count/:id/:method', PROJECT.getPaginatedProjects);

//Create a new project
router.post('/', requiresLogin, injectCurrentUser, authenticated(PROJECT.createProject));

//Get a specific project
router.get(
  '/:id',
  isUserBlocked(new ProjectInPathParameterLocation(), 'id', new MeParameterLocation(), ''),
  PROJECT.getProjectByID,
);

//Get a specific project's members
router.get(
  '/:id/members',
  projectExistsAt('path', 'id'),
  // isUserBlocked(new ProjectInPathParameterLocation(), 'id', new MeParameterLocation(), ''),
  PROJECT.getMembers,
);

//Edits a project through a specific id
router.patch(
  '/:id',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  authenticated(PROJECT.updateProject),
);

// Deletes project through a specific id
router.delete(
  '/:id',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  PROJECT.deleteProject,
);

// Gets the followers of a project
router.get('/:id/followers', projectExistsAt('path', 'id'), PROJECT.getProjectFollowers);
//#endregion

//#region Project Specific Routes (/:id/..)

//#region Image routes
// Receives pictures from project through id
router.get('/:id/images', projectExistsAt('path', 'id'), PROJECT.getProjectImages);

// Creates a new picture for a project
router.post(
  '/:id/images',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  upload.single('image'),
  PROJECT.addImage,
);

// Reorders a project's images (Moved UP so it doesn't clash with /:id/images/:imageId)
router.put(
  '/:id/images/reorder',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  PROJECT.reorderImages,
);

// Changes a picture for a project
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

// Removes picture from a project
router.delete(
  '/:id/images/:imageId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt('image', { type: 'path', key: 'id' }, { type: 'path', key: 'imageId' }),
  authenticated(requiresProjectOwner),
  PROJECT.removeImage,
);
//#endregion

//#region Video routes
router.post(
  '/:id/videos',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  PROJECT.addVideo,
);

router.get(
  '/:id/videos',
  projectExistsAt('path', 'id'),
  // isUserBlocked(new ProjectInPathParameterLocation(), 'id', new MeParameterLocation(), ''),
  PROJECT.getVideos,
);

router.delete(
  '/:id/videos/:videoId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  PROJECT.deleteVideo,
);
//#endregion

//#region Thumbnail routes
// Gets a project's thumbnail
router.get('/:id/thumbnail', projectExistsAt('path', 'id'), PROJECT.getThumbnail);

// Updates a project's thumbnail
router.put(
  '/:id/thumbnail',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  PROJECT.updateThumbnail,
);

// Deletes a project's thumbnail
router.delete(
  '/:id/thumbnail',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  authenticated(PROJECT.removeThumbnail),
);
//#endregion

//#region Mediums routes
// Gets a project's mediums
router.get('/:id/mediums', projectExistsAt('path', 'id'), PROJECT.getProjectMediums);

// Adds mediums to a project
router.post(
  '/:id/mediums',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  attributeExistsAt('medium', 'body', 'mediumId'),
  authenticated(requiresProjectOwner),
  PROJECT.addMediums,
);

// Removes mediums from a project
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
//#endregion

//#region Members routes
// Get all applications to a project (Must precede /:id/members/:userId)
router.get(
  '/:id/members/applications',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  PROJECT.getApplications,
);

// Sends an invite to a prospective member (Must precede /:id/members/:userId)
router.post(
  '/:id/members/send-invite',
  requiresLogin,
  injectCurrentUser,
  authenticated(requiresProjectOwner),
  projectExistsAt('path', 'id'),
  userExistsAt('body', 'prospectiveMemberId'),
  userExistsAt('body', 'ownerUserId'),
  skipIfEmpty('body', 'roleId', attributeExistsAt('role', 'body', 'roleId')),
  // isUserBlocked(
  //   new BodyParameterLocation(),
  //   'prospectiveMemberId',
  //   new BodyParameterLocation(),
  //   'ownerUserId',
  // ),
  PROJECT.sendInvite,
);

// Request to join a prospective member (Must precede /:id/members/:userId)
router.post(
  '/:id/members/request-to-join',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  userExistsAt('body', 'prospectiveMemberId'),
  userExistsAt('body', 'ownerUserId'),
  skipIfEmpty('body', 'roleId', attributeExistsAt('role', 'body', 'roleId')),
  // isUserBlocked(
  //   new BodyParameterLocation(),
  //   'ownerUserId',
  //   new BodyParameterLocation(),
  //   'prospectiveMemberId',
  // ),
  PROJECT.requestToJoin,
);

// Get a specific project's members
router.get('/:id/members', projectExistsAt('path', 'id'), PROJECT.getMembers);

// Adds member to a specific project through id
router.post(
  '/:id/members',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  userExistsAt('body', 'inviterUserId'),
  userExistsAt('body', 'inviteeUserId'),
  skipIfEmpty('body', 'roleId', attributeExistsAt('role', 'body', 'roleId')),
  authenticated(requiresProjectOwner),
  PROJECT.addMember,
);

// Edits a member of a specific project through id
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

// Removes a member from a specific project through project and user ID
router.delete(
  '/:id/members/:userId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  userExistsAt('path', 'userId'),
  projectAttributeExistsAt('member', { type: 'path', key: 'id' }, { type: 'path', key: 'userId' }),
  authenticated(PROJECT.deleteMember),
);

// Changes the owner of a project
router.patch(
  '/:id/change-owner/:userId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  userExistsAt('path', 'userId'),
  projectAttributeExistsAt('member', { type: 'path', key: 'id' }, { type: 'path', key: 'userId' }),
  authenticated(requiresProjectOwner),
  PROJECT.changeOwner,
);
//#endregion

//#region Socials routes
// Gets all project socials
router.get('/:id/socials', projectExistsAt('path', 'id'), PROJECT.getProjectSocials);

// Adds a project social
router.post(
  '/:id/socials',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  attributeExistsAt('social', 'body', 'websiteId'),
  authenticated(requiresProjectOwner),
  PROJECT.addProjectSocial,
);

// Updates a project social
router.patch(
  '/:id/socials/:socialId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt(
    'social',
    { type: 'path', key: 'id' },
    { type: 'path', key: 'socialId' },
  ),
  authenticated(requiresProjectOwner),
  PROJECT.updateProjectSocial,
);

// Deletes a project social
router.delete(
  '/:id/socials/:socialId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt(
    'social',
    { type: 'path', key: 'id' },
    { type: 'path', key: 'socialId' },
  ),
  authenticated(requiresProjectOwner),
  PROJECT.deleteProjectSocial,
);
//#endregion

//#region Tags routes
// Get a project's tags
router.get('/:id/tags', projectExistsAt('path', 'id'), PROJECT.getTags);

// Adds a project tag
router.post(
  '/:id/tags',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  attributeExistsAt('tag', 'body', 'tagId'),
  authenticated(requiresProjectOwner),
  PROJECT.addTag,
);

// Updates order of a project's tags
router.patch(
  '/:id/tags/:tagId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt('tag', { type: 'path', key: 'id' }, { type: 'path', key: 'tagId' }),
  authenticated(requiresProjectOwner),
  PROJECT.updateTag,
);

// Deletes a project tag
router.delete(
  '/:id/tags/:tagId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt('tag', { type: 'path', key: 'id' }, { type: 'path', key: 'tagId' }),
  authenticated(requiresProjectOwner),
  PROJECT.deleteTag,
);
//#endregion

//#region Jobs routes
// Gets all of a project's jobs
router.get('/:id/jobs', projectExistsAt('path', 'id'), PROJECT.getJobsController);

// Creates a new project job
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

// Updates an existing project job
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

// Deletes an existing project job
router.delete(
  '/:id/jobs/:jobId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt('job', { type: 'path', key: 'id' }, { type: 'path', key: 'jobId' }),
  authenticated(requiresProjectOwner),
  PROJECT.deleteJobController,
);

// Gets all of a project job's skills
router.get('/:id/jobs/:jobId/skills', projectExistsAt('path', 'id'), PROJECT.getJobSkills);

// Adds a skill to a job
router.post(
  '/:id/jobs/:jobId/skills',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  PROJECT.addJobSkill,
);

// Updates a job skill's proficiency or other parameters
router.patch(
  '/:id/jobs/:jobId/skills/:skillId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt('job', { type: 'path', key: 'id' }, { type: 'path', key: 'jobId' }),
  authenticated(requiresProjectOwner),
  PROJECT.updateJobSkill,
);

// Deletes a skill from a job
router.delete(
  '/:id/jobs/:jobId/skills/:skillId',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  projectAttributeExistsAt('job', { type: 'path', key: 'id' }, { type: 'path', key: 'jobId' }),
  authenticated(requiresProjectOwner),
  PROJECT.deleteJobSkill,
);
//#endregion

//#region Visbility routes
// Changes the visibility of a project
router.patch(
  '/:id/visibility',
  requiresLogin,
  injectCurrentUser,
  projectExistsAt('path', 'id'),
  authenticated(requiresProjectOwner),
  authenticated(PROJECT.updateProjectGlobalVisibility),
);
//#endregion

//#endregion

export default router;
