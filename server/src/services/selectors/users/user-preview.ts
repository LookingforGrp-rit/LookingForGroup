export const UserPreviewSelector = Object.freeze({
  userId: true,
  firstName: true,
  lastName: true,
  username: true,
  profileImage: true,
  privacy: true,
  displayPhone: true,
  phoneNumber: true,
  userSkills: {
    select: {
      skills: {
        select: {
          type: true,
        },
      },
    },
  },
  pronouns: true,
  title: true,
  headline: true,
  location: true,
  majors: true,
});
