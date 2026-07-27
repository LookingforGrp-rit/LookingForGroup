import type { ApiResponse } from '@looking-for-group/shared';
import type { Request } from 'express';
import getProjectReportByIdService from '#services/mod/get-project-report-by-id.ts';
import getProjectByIdService from '#services/projects/get-proj-id.ts';
import type { ParameterLocation } from './parameter-location.ts';

/**
 * Looks in a project report for the reported's id.
 */
export class ProjectReportedInPathParameterLocation implements ParameterLocation {
  async getId(_key: string, request: Request): Promise<number | ApiResponse> {
    const res: ApiResponse = { status: 0 };
    const reportId = parseInt(request.params.id as string);

    if (isNaN(reportId)) {
      res.status = 400;
      res.error = 'Invalid project id.';
      return res;
    }

    const result = await getProjectReportByIdService(reportId);

    if (result === 'INTERNAL_ERROR') {
      res.status = 500;
      res.error = 'There was an internal error.';
      return res;
    } else if (result === 'NOT_FOUND') {
      res.status = 404;
      res.error = 'Report not found.';
      return res;
    }

    const projectResult = await getProjectByIdService(result.projectId);

    if (projectResult === 'INTERNAL_ERROR') {
      res.status = 500;
      res.error = 'There was an internal error.';
      return res;
    } else if (projectResult === 'NOT_FOUND') {
      res.status = 404;
      res.error = 'Report not found.';
      return res;
    }

    return projectResult.owner.userId;
  }
}
