import prisma from '#config/prisma.ts';
import { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteTagServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;
type DeleteTagServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

export const deleteTagFromSiteService = async (
  tagId: number,
): Promise<DeleteTagServiceSuccess | DeleteTagServiceError> => {
  try {
    await prisma.tags.delete({
      where: { tagId },
    });

    return 'NO_CONTENT';
  } catch (e) {
    console.error('There was an internal error in deleteTagFromSiteService: ', e);
    return 'INTERNAL_ERROR';
  }
};
