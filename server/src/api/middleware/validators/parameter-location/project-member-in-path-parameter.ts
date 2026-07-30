import type { ApiResponse } from '@looking-for-group/shared';
import type { Request } from 'express';
import getProjectByIdService from '#services/projects/get-proj-id.ts';
import type { ParameterLocation } from './parameter-location.ts';

/**
 * Looks in a project for the owner's id.
 */
export class ProjectMemberInPathParameterLocation implements ParameterLocation {
  async getId(key: string, request: Request): Promise<number[] | ApiResponse> {
    const res: ApiResponse = { status: 0 };
    const projectId = parseInt(request.params[key] as string);

    if (isNaN(projectId)) {
      res.status = 400;
      res.error = 'Invalid project id.';
      return res;
    }

    const result = await getProjectByIdService(projectId);

    if (result === 'INTERNAL_ERROR') {
      res.status = 500;
      res.error = 'There was an internal error.';
      return res;
    } else if (result === 'NOT_FOUND') {
      res.status = 404;
      res.error = 'Project not found.';
      return res;
    }

    return result.members.map((member) => {
      return member.user.userId;
    });
  }
}
