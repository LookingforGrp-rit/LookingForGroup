export const UserPreviewSelector = Object.freeze({
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
  funFact: true,
  pronouns: true,
  title: true,
  headline: true,
  location: true,
  majors: true,
});
