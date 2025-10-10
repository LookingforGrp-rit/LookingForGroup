import createProject from './create-proj.ts';
import deleteProject from './delete-proj.ts';
import getProjectByID from './get-proj-id.ts';
import { getProjectFollowers } from './get-project-followers.ts';
import getProjects from './get-projects.ts';
import addImage from './images/add-image.ts';
import getProjectImages from './images/get-proj-images.ts';
import removeImage from './images/remove-image.ts';
import reorderImages from './images/reorder-images.ts';
import updateImage from './images/update-image.ts';
import addJobController from './jobs/add-job.ts';
import deleteJobController from './jobs/delete-job.ts';
import getJobsController from './jobs/get-all-jobs.ts';
import updateJobController from './jobs/update-job.ts';
import addMediums from './mediums/add-proj-mediums.ts';
import deleteMediums from './mediums/delete-proj-mediums.ts';
import getProjectMediums from './mediums/get-proj-mediums.ts';
import addMember from './members/add-member.ts';
import deleteMember from './members/delete-member.ts';
import getMembers from './members/get-members.ts';
import updateMember from './members/update-member.ts';
import { addProjectSocial } from './socials/add-proj-social.ts';
import { deleteProjectSocial } from './socials/delete-proj-social.ts';
import getProjectSocials from './socials/get-proj-socials.ts';
import { updateProjectSocial } from './socials/update-proj-social.ts';
import addTags from './tags/add-tags.ts';
import deleteTags from './tags/delete-tags.ts';
import getTags from './tags/get-proj-tags.ts';
import updateProject from './update-proj.ts';

export default {
  getJobsController,
  addJobController,
  updateJobController,
  deleteJobController,
  getProjectFollowers,
  getProjects,
  getProjectByID,
  getProjectImages,
  createProject,
  addImage,
  addMember,
  addTags,
  updateProject,
  updateMember,
  deleteProject,
  getMembers,
  updateImage,
  deleteMember,
  removeImage,
  reorderImages,
  getTags,
  deleteTags,
  addProjectSocial,
  getProjectSocials,
  updateProjectSocial,
  deleteProjectSocial,
  getProjectMediums,
  addMediums,
  deleteMediums,
};
