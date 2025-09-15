import createProject from './create-project.ts';
import deleteProject from './delete-project.ts';
import getProjectByID from './get-project-id.ts';
import getProjects from './get-projects.ts';
import addImage from './images/add-image.ts';
import getProjectImages from './images/get-proj-images.ts';
import removeImage from './images/remove-image.ts';
import reorderImages from './images/reorder-images.ts';
import updateImage from './images/update-image.ts';
import addMediums from './mediums/add-project-mediums.ts';
import deleteMediums from './mediums/delete-project-mediums.ts';
import getProjectMediums from './mediums/get-project-mediums.ts';
import addMember from './members/add-member.ts';
import deleteMember from './members/delete-member.ts';
import getMembers from './members/get-members.ts';
import updateMember from './members/update-member.ts';
import { addProjectSocial } from './socials/add-social.ts';
import { deleteProjectSocial } from './socials/delete-project-social.ts';
import getProjectSocials from './socials/get-project-socials.ts';
import { updateProjectSocial } from './socials/update-project-social.ts';
import addTags from './tags/add-tags.ts';
import deleteTags from './tags/delete-tags.ts';
import getTags from './tags/get-proj-tags.ts';
import updateProject from './update-project.ts';

export default {
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
  getMembers,
};
