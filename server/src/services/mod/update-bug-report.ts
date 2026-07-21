import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type GetServiceSuccess = ServiceSuccessSubset<'OK'>;
type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//PATCH api/mod/bug-reports/{reportId}
//Gets a bug report
const updateBugReportService = async (
  reportId: number,
  isResolved: boolean,
  modNotes: string,
): Promise<GetServiceSuccess | GetServiceError> => {
  try {
    const report = await prisma.reportBug.findFirst({
      where: {
        reportId,
      },
    });

    if (!report) return 'NOT_FOUND';

    await prisma.reportBug.update({
      data: {
        isResolved,
        modNotes,
      },
      where: {
        reportId,
      },
    });

    return 'OK';
  } catch (e) {
    console.error(`Error in getBugReportByIdService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default updateBugReportService;
