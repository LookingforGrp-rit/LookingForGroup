export const MePreviewSelector = Object.freeze({
  userId: true,
  firstName: true,
  lastName: true,
  username: true,
  profileImage: true,
  mentor: true,
  userSkills: {
    select: {
      skills: {
        select: {
          type: true,
        },
      },
    },
  },
});
