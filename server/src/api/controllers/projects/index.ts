import addImage from './add-image.ts';
import addMember from './add-member.ts';
import { addProjectSocial } from './add-social.ts';
import addTags from './add-tags.ts';
import createProject from './create-project.ts';
import deleteMember from './delete-member.ts';
import deleteProject from './delete-project.ts';
import deleteTags from './delete-tags.ts';
import getProjectImages from './get-proj-images.ts';
import getProjectByID from './get-project-id.ts';
import getProjects from './get-projects.ts';
import removeImage from './remove-image.ts';
import reorderImages from './reorder-images.ts';
import updateImage from './update-image.ts';
import updateMember from './update-member.ts';
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
  deleteTags,
  addProjectSocial,
};
