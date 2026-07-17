import approveProject from './approval/approve-proj.ts';
import getUnapprovedProjectById from './approval/get-unapproved-proj-id.ts';
import getUnapprovedProjects from './approval/get-unapproved-projects.ts';
import rejectProject from './approval/reject-project.ts';
import requestApproval from './approval/request-approval.ts';
import unapproveProject from './approval/unapprove-proj.ts';
import createProject from './create-proj.ts';
import deleteProject from './delete-proj.ts';
import getPaginatedProjects from './get-paginated-projects.ts';
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
import addJobSkill from './jobs/skills/add-job-skill.ts';
import deleteJobSkill from './jobs/skills/delete-job-skill.ts';
import getJobSkills from './jobs/skills/get-job-skills.ts';
import updateJobSkill from './jobs/skills/update-job-skill.ts';
import updateJobController from './jobs/update-job.ts';
import addMediums from './mediums/add-proj-mediums.ts';
import deleteMediums from './mediums/delete-proj-mediums.ts';
import getProjectMediums from './mediums/get-proj-mediums.ts';
import addMember from './members/add-member.ts';
import changeOwner from './members/change-owner.ts';
import deleteMemberRequest from './members/delete-member-request.ts';
import deleteMember from './members/delete-member.ts';
import getMemberRequest from './members/get-member-request.ts';
import getMemberRequests from './members/get-member-requests.ts';
import getMembers from './members/get-members.ts';
import getApplications from './members/get-proj-applications.ts';
import getInvitations from './members/get-user-invitations.ts';
import requestToJoin from './members/request-to-join.ts';
import sendInvite from './members/send-invite.ts';
import updateMemberRequest from './members/update-member-request.ts';
import updateMember from './members/update-member.ts';
import { addProjectSocial } from './socials/add-social.ts';
import { deleteProjectSocial } from './socials/delete-proj-social.ts';
import getProjectSocials from './socials/get-proj-socials.ts';
import { updateProjectSocial } from './socials/update-proj-social.ts';
import addTag from './tags/add-tag.ts';
import deleteTag from './tags/delete-tag.ts';
import getTags from './tags/get-proj-tags.ts';
import updateTag from './tags/update-tag.ts';
import getThumbnail from './thumbnail/get-thumbnail.ts';
import removeThumbnail from './thumbnail/remove-thumbnail.ts';
import updateThumbnail from './thumbnail/update-thumbnail.ts';
import { updateProjectGlobalVisibility } from './update-project-global-visibility.ts';
import updateProject from './update-project.ts';
import addVideo from './videos/add-video.ts';
import deleteVideo from './videos/delete-video.ts';
import getVideos from './videos/get-videos.ts';

//index file for all project routes
//no other route group has this
//why does this group have this but none of the others do

export default {
  getJobsController,
  addJobController,
  updateJobController,
  deleteJobController,
  getProjectFollowers,
  getProjects,
  getPaginatedProjects,
  getProjectByID,
  getProjectImages,
  createProject,
  addImage,
  getThumbnail,
  removeThumbnail,
  updateThumbnail,
  addMember,
  addTag,
  updateProject,
  updateMember,
  deleteProject,
  getMembers,
  updateImage,
  deleteMember,
  removeImage,
  reorderImages,
  addVideo,
  getVideos,
  deleteVideo,
  getTags,
  deleteTag,
  updateTag,
  addProjectSocial,
  getProjectSocials,
  updateProjectSocial,
  deleteProjectSocial,
  getProjectMediums,
  addJobSkill,
  getJobSkills,
  updateJobSkill,
  deleteJobSkill,
  addMediums,
  deleteMediums,
  approveProject,
  unapproveProject,
  getUnapprovedProjects,
  getUnapprovedProjectById,
  rejectProject,
  requestApproval,
  sendInvite,
  requestToJoin,
  getApplications,
  getInvitations,
  deleteMemberRequest,
  getMemberRequest,
  getMemberRequests,
  updateMemberRequest,
  updateProjectGlobalVisibility,
  changeOwner,
};
