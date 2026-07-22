import type { BugReport } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { BugReportSelector } from '#services/selectors/mod/bug-report.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleBugReport = prisma.reportBug.findMany({
  select: BugReportSelector,
});

type BugReportGetPayload = Awaited<typeof sampleBugReport>[number];

//map to shared type
export const transformBugReport = ({
  reportId,
  userId,
  reportText,
  createdAt,
  isResolved,
  modNotes,
}: BugReportGetPayload): BugReport => {
  return {
    apiUrl: `api/mod/bug-report/${reportId.toString()}`,
    reportId,
    userId,
    reportText,
    createdAt,
    isResolved,
    modNotes,
  };
};
