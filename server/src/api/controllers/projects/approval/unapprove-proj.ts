import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { ProjectUnapprovedNotificationBuilder } from '#notification-templates/project-unapproved-notification-buildier.ts';
import sendNotificationService from '#services/notifications/send-notification.ts';
import { unapproveProjectService } from '#services/projects/approval/unapprove-project.ts';

const unapproveProjectController = async (request: AuthenticatedRequest, response: Response) => {
  const projectId = parseInt(request.params.id as string);
  const result = await unapproveProjectService(projectId);

  if (result === 'INTERNAL_ERROR') {
    const res: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    response.status(500).json(res);
    return;
  }

  if (result === 'NOT_FOUND') {
    const res: ApiResponse = {
      status: 404,
      error: 'Project Not Found',
      data: null,
    };
    response.status(404).json(res);
    return;
  }

  const res: ApiResponse = {
    status: 200,
    error: null,
    data: 'Project unapproved',
  };
  response.status(200).json(res);

  sendNotificationService(new ProjectUnapprovedNotificationBuilder(), request).catch(() => {});
};

export default unapproveProjectController;
