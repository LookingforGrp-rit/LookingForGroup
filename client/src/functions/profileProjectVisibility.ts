import type { ProjectDetail, ProjectPreview } from '@looking-for-group/shared';

export const canViewProjectOnProfile = (
  project: ProjectDetail | ProjectPreview,
  viewerUserId: number,
  isOwnProfile: boolean,
): boolean => {
  if (isOwnProfile) {
    return true;
  }

  if ('approved' in project && project.approved) {
    return true;
  }

  if (viewerUserId <= 0) {
    return false;
  }

  const isCreator = 'owner' in project && project.owner?.userId === viewerUserId;
  const isTeamMember = 'members' in project
    && Array.isArray(project.members)
    && project.members.some((member) => member.user?.userId === viewerUserId);

  return isCreator || isTeamMember;
};
