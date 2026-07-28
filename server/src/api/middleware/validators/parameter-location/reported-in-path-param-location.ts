import type { ApiResponse } from '@looking-for-group/shared';
import type { Request } from 'express';
import getUserReportByIdService from '#services/mod/get-user-report-by-id.ts';
import type { ParameterLocation } from './parameter-location.ts';

/**
 * Looks in a report for the reported's id.
 */
export class ReportedInPathParameterLocation implements ParameterLocation {
  async getId(key: string, request: Request): Promise<number[] | ApiResponse> {
    const res: ApiResponse = { status: 0 };
    const reportId = parseInt(request.params[key] as string);

    if (isNaN(reportId)) {
      res.status = 400;
      res.error = 'Invalid project id.';
      return res;
    }

    const result = await getUserReportByIdService(reportId);

    if (result === 'INTERNAL_ERROR') {
      res.status = 500;
      res.error = 'There was an internal error.';
      return res;
    } else if (result === 'NOT_FOUND') {
      res.status = 404;
      res.error = 'Report not found.';
      return res;
    }

    return [result.reportedId];
  }
}
