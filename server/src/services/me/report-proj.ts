import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT' | 'NOT_FOUND'>;
type GetServiceSuccess = ServiceSuccessSubset<'OK'>;

//PUT api/me/report-project/{id}
export const reportProjectService = async (
  userId: number,
  projectId: number,
  reportText: string,
): Promise<GetServiceSuccess | GetServiceError> => {
  try {
    //Check if project exists
    //Because this is being called by api/me, there is no need to validate the id of the user
    const project = await prisma.reportProject.findFirst({
      where: {
        projectId,
      },
    });
    if (!project) return 'NOT_FOUND';

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
    console.error(`Error in reportProjectService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};
