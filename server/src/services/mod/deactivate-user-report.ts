import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type PatchServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;
type PatchServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//PATCH api/mod/user-report/{id}/deactivate
const deactivateUserReport = async (
  id: number,
): Promise<PatchServiceSuccess | PatchServiceError> => {
  try {
    // no need to check for existence of report here, since the middleware already did it
    await prisma.reportUser.update({
      where: {
        reportId: id,
      },
      data: {
        active: false,
      },
    });

    return 'NO_CONTENT';
  } catch (e) {
    console.error(`Error in deactivateUserReport: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default deactivateUserReport;
