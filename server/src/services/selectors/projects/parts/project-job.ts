export const ProjectJobSelector = Object.freeze({
  jobId: true,
  role: {
    select: {
      roleId: true,
      label: true,
    },
  },
  availability: true,
  duration: true,
  location: true,
  compensation: true,
  description: true,
  createdAt: true,
  updatedAt: true,
});
