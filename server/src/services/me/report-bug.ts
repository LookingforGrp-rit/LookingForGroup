import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type ServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;
type ServiceSuccess = ServiceSuccessSubset<'OK'>;

//POST api/me/report-bug
export const reportBugService = async (
  userId: number,
  reportText: string,
): Promise<ServiceSuccess | ServiceError> => {
  try {
    //Create report
    await prisma.reportBug.create({
      data: {
        userId,
        reportText,
      },
    });

    return 'OK';
  } catch (e) {
    console.error(`Error in reportBugService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};
