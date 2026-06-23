import prisma from '#config/prisma.ts';

const getMessageService = async (notificationId: string, userId: number): Promise<string> => {
  try {
    const result = await prisma.notifications.findFirst({
      select: { message: true },
      where: {
        notificationId,
        receiverId: userId,
      },
    });

    if (result === null) return 'NOT_FOUND';

    return result.message;
  } catch (e) {
    console.error('There was an error at getMessageService: ', e);
    return 'INTERNAL_ERROR';
  }
};

export default getMessageService;
