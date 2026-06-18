import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT' | 'NOT_FOUND'>;
type GetServiceSuccess = ServiceSuccessSubset<'OK'>;

//POST api/me/projects/report/{id}/{report}
export const reportProjectService = async (
  userId: number,
  projectId: number,
  reportText: string,
): Promise<GetServiceSuccess | GetServiceError> => {
  try {
    //Check if report already exists
    const report = await prisma.reportProject.findFirst({
      where: {
        userId,
        projectId,
      },
    });
    if (report) return 'CONFLICT';

    //Create report
    await prisma.reportProject.create({
      data: {
        userId,
        projectId,
        reportText,
      },
    });

    return 'OK';
  } catch (e) {
    console.error(`Error in reportProjectService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};
