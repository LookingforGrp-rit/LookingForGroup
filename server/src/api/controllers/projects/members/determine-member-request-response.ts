import type {
  AuthenticatedRequest,
  MembershipRequestResponseType,
  UpdateMemberRequestInput,
} from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MemberRequestStatus } from '#prisma-models/index.js';

// Not an endpoint, but a helper function
// Since there is only one endpoint (PATCH api/projects/members/requests)
//  for accepting and rejecting invites and accepting and rejecting join requests
//  this method is here to determine which scenario the endpoint is handling.
export const determineMembershipRequestResponse = async (
  request: AuthenticatedRequest,
): Promise<MembershipRequestResponseType> => {
  let response: string = '';
  const body = request.body as UpdateMemberRequestInput;
  const responderID = request.currentUser.userId;
  const requestId = parseInt(request.params.id as string);

  // determine if it was a request or invite
  const memberRequestData = await prisma.memberRequests.findFirst({
    where: { requestId },
    select: { prospectiveMemberId: true },
  });

  console.log(
    `responder: ${String(responderID)}, prospective member: ${String(memberRequestData?.prospectiveMemberId)}`,
  );

  if (responderID === memberRequestData?.prospectiveMemberId) response = 'INVITE-';
  else response = 'REQUEST-';

  // determine if it was rejected or accepted
  if (body.requestStatus === MemberRequestStatus.Accepted) response += 'ACCEPTED';
  else response += 'REJECTED';

  return response as MembershipRequestResponseType;
};
