//this service ensures that a user exists in our database based on Shibboleth attributes

import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

export type UpsertFromShibError = ServiceErrorSubset<'INTERNAL_ERROR'>;

export interface ShibAttributes {
  universityId: string; // uid
  givenName: string; // givenName
  sn: string; // sn (surname)
  mail: string; // mail (RIT email)
}

// Ensures a user exists and is updated with the latest RIT-provided attributes.
export const upsertUserFromShib = async (
  attrs: ShibAttributes,
): Promise<{ userId: number } | UpsertFromShibError> => {
  try {
    // Choose app-visible name: first + last (RIT name). If you have a separate displayName field, map there.
    const displayName = `${attrs.givenName} ${attrs.sn}`.trim();

    const user = await prisma.users.upsert({
      where: { universityId: attrs.universityId },
      update: {
        firstName: attrs.givenName,
        lastName: attrs.sn,
        ritEmail: attrs.mail,
      },
      create: {
        universityId: attrs.universityId,
        username: displayName, // If username must be unique and stable, consider slugifying and de-duping here.
        firstName: attrs.givenName,
        lastName: attrs.sn,
        ritEmail: attrs.mail,
      },
      select: { userId: true },
    });

    return { userId: user.userId };
  } catch (e) {
    console.error(`Error in upsertUserFromShib: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
