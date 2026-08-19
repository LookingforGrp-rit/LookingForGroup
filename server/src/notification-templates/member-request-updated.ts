/* eslint-disable @typescript-eslint/unbound-method */
import type {
  AuthenticatedRequest,
  MembershipRequestResponseType,
  NotificationBuilderResult,
} from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import { determineMembershipRequestResponse } from '#controllers/projects/members/determine-member-request-response.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class MemberRequestUpdatedNotificationBuilder implements NotificationBuilder {
  #builders: Map<MembershipRequestResponseType, typeof this.buildNotification>;

  constructor() {
    this.#builders = new Map();
    this.#builders.set('INVITE-ACCEPTED', this.buildInviteAccepted);
    this.#builders.set('INVITE-REJECTED', this.buildInviteRejected);
    this.#builders.set('REQUEST-ACCEPTED', this.buildRequestAccepted);
    this.#builders.set('REQUEST-REJECTED', this.buildRequestRejected);
  }

  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    const membershipRequestResponse: MembershipRequestResponseType =
      await determineMembershipRequestResponse(request as AuthenticatedRequest);
    const funct = this.#builders.get(membershipRequestResponse);

    if (!funct) {
      throw new Error(
        'There was some error in sending a notification about updating a member request.',
      );
    }

    return funct(request);
  }

  private async buildInviteAccepted(request: Request): Promise<NotificationBuilderResult> {
    const notification: NotificationBuilderResult = {
      receiverId: 0,
      subjectLine: '',
      message: '',
    };
    const requestId = parseInt(request.params.id as string);

    const data = await prisma.memberRequests.findFirst({
      where: { requestId },
      select: {
        roleId: true,
        projects: {
          select: {
            userId: true,
            title: true,
            users: {
              select: { firstName: true },
            },
          },
        },
        users: {
          select: { firstName: true },
        },
      },
    });

    if (!data) {
      throw new Error('something caught fire.');
    }

    const roleData = await prisma.roles.findFirst({
      where: { roleId: data.roleId },
      select: { label: true },
    });

    const projectData = data.projects;
    const ownerData = projectData.users;
    const inviteeData = data.users;
    // BUILDING THE NOTIFICATION //
    notification.receiverId = projectData.userId;
    notification.subjectLine = `${inviteeData.firstName} has accepted your invitation to join ${projectData.title}`;

    notification.message = `Hello ${ownerData.firstName},<br /><br />`;
    notification.message += `<strong>${inviteeData.firstName}</strong> has accepted your invitation to join <strong>${projectData.title}</strong> `;
    notification.message += `as a <strong>${roleData?.label as string}</strong>. You may also assign them to other roles if need be.<br /><br />`;
    notification.message += `Happy building!<br />`;
    notification.message += `LFG Team`;
    return notification;
  }

  private async buildInviteRejected(request: Request): Promise<NotificationBuilderResult> {
    const notification: NotificationBuilderResult = {
      receiverId: 0,
      subjectLine: '',
      message: '',
    };
    const requestId = parseInt(request.params.id as string);

    const data = await prisma.memberRequests.findFirst({
      where: { requestId },
      select: {
        roleId: true,
        projects: {
          select: {
            userId: true,
            title: true,
            users: {
              select: { firstName: true },
            },
          },
        },
        users: {
          select: { firstName: true },
        },
      },
    });

    if (!data) {
      throw new Error('something caught fire.');
    }

    const roleData = await prisma.roles.findFirst({
      where: { roleId: data.roleId },
      select: { label: true },
    });

    const projectData = data.projects;
    const ownerData = projectData.users;
    const inviteeData = data.users;
    // BUILDING THE NOTIFICATION //
    notification.receiverId = projectData.userId;
    notification.subjectLine = `${inviteeData.firstName} has turned down your invitation to join ${projectData.title}`;

    notification.message = `Hello ${ownerData.firstName},<br /><br />`;
    notification.message += `<strong>${inviteeData.firstName}</strong> has turned down your invitation to join <strong>${projectData.title}</strong> `;
    notification.message += `as a <strong>${roleData?.label as string}</strong>.<br /><br />`;
    notification.message += `We wish you the best with your project!<br />`;
    notification.message += `LFG Team`;
    return notification;
  }

  private async buildRequestAccepted(request: Request): Promise<NotificationBuilderResult> {
    const notification: NotificationBuilderResult = {
      receiverId: 0,
      subjectLine: '',
      message: '',
    };
    const requestId = parseInt(request.params.id as string);

    const data = await prisma.memberRequests.findFirst({
      where: { requestId },
      select: {
        roleId: true,
        projects: {
          select: {
            title: true,
          },
        },
        users: {
          select: {
            firstName: true,
            userId: true,
          },
        },
      },
    });

    if (!data) {
      throw new Error('something caught fire.');
    }

    const roleData = await prisma.roles.findFirst({
      where: { roleId: data.roleId },
      select: { label: true },
    });

    const projectData = data.projects;
    const inviteeData = data.users;
    // BUILDING THE NOTIFICATION //
    notification.receiverId = inviteeData.userId;
    notification.subjectLine = `Your request to join ${projectData.title} has been accepted!`;

    notification.message = `Hello ${inviteeData.firstName},<br /><br />`;
    notification.message += `Your request to join <strong>${projectData.title}</strong> as a <strong>${roleData?.label as string}</strong> has been accepted. <br /><br />`;
    notification.message += `Happy building!<br />`;
    notification.message += `LFG Team`;
    return notification;
  }

  private async buildRequestRejected(request: Request): Promise<NotificationBuilderResult> {
    const notification: NotificationBuilderResult = {
      receiverId: 0,
      subjectLine: '',
      message: '',
    };
    const requestId = parseInt(request.params.id as string);

    const data = await prisma.memberRequests.findFirst({
      where: { requestId },
      select: {
        roleId: true,
        projects: {
          select: {
            title: true,
          },
        },
        users: {
          select: {
            firstName: true,
            userId: true,
          },
        },
      },
    });

    if (!data) {
      throw new Error('something caught fire.');
    }

    const roleData = await prisma.roles.findFirst({
      where: { roleId: data.roleId },
      select: { label: true },
    });

    const projectData = data.projects;
    const inviteeData = data.users;
    // BUILDING THE NOTIFICATION //
    notification.receiverId = inviteeData.userId;
    notification.subjectLine = `Your request to join ${projectData.title} has been rejected.`;

    notification.message = `Hello ${inviteeData.firstName},<br /><br />`;
    notification.message += `Your request to join <strong>${projectData.title}</strong> as a <strong>${roleData?.label as string}</strong> has been rejected.<br /><br />`;
    notification.message += `Thank you for your interest, and we wish you the best with your future projects!<br /><br />`;
    notification.message += `LFG Team`;
    return notification;
  }
}
