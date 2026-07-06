import type {
  RequestToJoinInput,
  EmailInput,
  MemberRequestStatus,
} from '@looking-for-group/shared';
import { createElement } from 'react';
import { pretty, render, toPlainText } from 'react-email';
import prisma from '#config/prisma.ts';
import ApplyEmail from '#email-templates/apply-email.ts';
import getRolesService from '#services/datasets/get-roles.ts';
import { sendEmail } from '#services/mailer.ts';
import { UserEmailSelector } from '#services/selectors/users/parts/user-email.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import getProjectByIdService from '../get-proj-id.ts';

type RequestToJoinServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type RequestToJoinServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

// POST api/projects/:id/members/request-to-join
export const requestToJoinService = async (
  projectId: number,
  data: RequestToJoinInput,
): Promise<RequestToJoinServiceSuccess | RequestToJoinServiceError> => {
  try {
    //check if request exists
    const req = await prisma.memberRequests.findFirst({
      where: {
        projectId,
        roleId: data.roleId,
        prospectiveMemberId: data.prospectiveMemberId,
      },
    });
    // if the request exist and it's currently open
    if (req && (req.requestStatus === 'Accepted' || req.requestStatus === 'Pending'))
      return 'CONFLICT';

    // grabbing the requested role
    const roles = await getRolesService();

    if (roles === 'INTERNAL_ERROR') return roles;

    const role = roles.find((r) => r.roleId === data.roleId);

    if (!role) return 'NOT_FOUND';

    // grabbing the requester
    const requester = await prisma.users.findUnique({
      where: { userId: data.prospectiveMemberId },
      select: UserEmailSelector,
    });

    if (!requester) return 'NOT_FOUND';

    // grabbing the project owner
    const owner = await prisma.users.findUnique({
      where: { userId: data.ownerUserId },
      select: UserEmailSelector,
    });

    if (!owner) return 'NOT_FOUND';

    // grabbing the project
    const project = await getProjectByIdService(projectId);

    if (project === 'NOT_FOUND' || project === 'INTERNAL_ERROR') return project;

    let result: {
      requestId: number;
      prospectiveMemberId: number;
      projectId: number;
      roleId: number;
      sentFromProject: boolean;
      requestStatus: MemberRequestStatus;
    };
    // if there was a request exist before, update that
    if (req) {
      result = await prisma.memberRequests.update({
        where: {
          requestId: req.requestId,
        },
        data: {
          requestStatus: 'Pending',
        },
      });
      // if not, create a new request
    } else {
      result = await prisma.memberRequests.create({
        data: {
          roleId: data.roleId,
          prospectiveMemberId: data.prospectiveMemberId,
          sentFromProject: false,
          requestStatus: 'Pending',
          projectId,
        },
      });
    }

    //Set up email
    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';

    const inviteUrl = `${clientUrl}/acceptApplication/${String(result.requestId)}`;

    const profileUrl = `${clientUrl}/profile?userID=${String(requester.userId)}`;

    const senderImg = requester.profileImage
      ? `https://lookingforgrp.com${requester.profileImage}`
      : 'https://lookingforgrp.com/api/images/blue_frog.png';

    const projectImg = project.thumbnail
      ? `https://lookingforgrp.com${project.thumbnail.image}`
      : 'https://lookingforgrp.com/api/images/project_temp.png';

    const msg = data.message ? data.message : '';

    const html = await pretty(
      await render(
        createElement(ApplyEmail, {
          receiverName: {
            firstName: owner.firstName,
            lastName: owner.lastName,
          },
          senderImage: senderImg,
          senderName: {
            firstName: requester.firstName,
            lastName: requester.lastName,
          },
          senderProfileLink: profileUrl,
          senderEmail: requester.ritEmail,
          senderMessage: msg,
          projectName: project.title,
          projectImage: projectImg,
          applyLink: inviteUrl,
        }),
      ),
    );

    const text = toPlainText(html);

    const email: EmailInput = {
      sender: requester,
      receiver: owner,
      subject: `Request to join ${project.title}`,
      textBody: text,
      HTMLBody: html,
    };

    //send email
    const emailResult = await sendEmail(email);
    if (emailResult === 'INTERNAL_ERROR') {
      // failed to send email -> rollback request
      try {
        await prisma.memberRequests.delete({
          where: {
            requestId: result.requestId,
          },
        });
      } catch (rollbackError) {
        console.error('Failed to rollback member request:', rollbackError);
      }

      return emailResult;
    }

    return 'NO_CONTENT';
  } catch (e) {
    console.error(`There was an error in requestToJoinService: `, e);
    return 'INTERNAL_ERROR';
  }
};
