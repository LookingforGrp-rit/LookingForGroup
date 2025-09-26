// import type { PrismaClient } from '@prisma/client';
// import prisma from '#config/prisma.ts';

// type ServiceOutcome<T> = T | 'NOT_FOUND' | 'INTERNAL_ERROR';

// type Job = Awaited<ReturnType<PrismaClient['jobs']['create']>>;

// type CreateJobData = {
//   roleId: number;
//   availability: 'FullTime' | 'PartTime' | 'Flexible';
//   duration: 'ShortTerm' | 'LongTerm';
//   location: 'OnSite' | 'Remote' | 'Hybrid';
//   compensation: 'Unpaid' | 'Paid';
//   description: string;
// };

// const addJobService = async (
//   projectId: number,
//   data: CreateJobData
// ): Promise<ServiceOutcome<Job>> => {
//   try {
//     const project = await prisma.projects.findUnique({
//       where: { projectId },
//     });

//     if (!project) {
//       return 'NOT_FOUND';
//     }

//     const job = await prisma.jobs.create({
//       data: {
//         projectId,
//         roleId: data.roleId,
//         availability: data.availability,
//         duration: data.duration,
//         location: data.location,
//         compensation: data.compensation,
//         description: data.description,
//       },
//     });

//     return job;
//   } catch (error) {
//     console.error('Error in addJobService:', error);
//     return 'INTERNAL_ERROR';
//   }
// };

// export default addJobService;
