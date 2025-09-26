import prisma from '../src/config/prisma.ts';

async function main() {
    //Datasets
    await prisma.mediums.createMany({
        data: [{ label: 'Poster' }],
    });

    await prisma.roles.createMany({
        data: [{ label: 'Developer' }],
    });

    await prisma.majors.createMany({
        data: [{ label: 'Game Design & Development' }],
    });

    await prisma.socials.createMany({
        data: [{ label: 'Website' }],
    });

    await prisma.tags.createMany({
        data: [{ label: 'Web', type: 'General' }],
    });

    await prisma.skills.createMany({
        data: [{ label: 'TypeScript', type: 'Language' }],
    });

    //Users
    await prisma.users.createMany({
        data: [
            {
                username: 'example_user',
                ritEmail: 'abc1234@rit.edu',
                firstName: 'Example',
                lastName: 'User',
                headline: 'Hello world',
                pronouns: 'they/them',
                title: 'Student',
                location: 'Rochester, NY',
                funFact: 'Loves seeding',
                bio: 'This is a simple seed user.',
                universityId: '123456789',
                academicYear: 'Freshman',
            },
        ],
    });

    //Projects
    await prisma.projects.createMany({
        data: [
            {
                title: 'Example Project',
                hook: 'A tiny seed project',
                description: 'Seeded via prisma/seed.ts',
                audience: 'Everybody',
                purpose: 'Personal',
                userId: 1,
                status: "Development",
            },
        ],
    });

    //ProjectImages
    await prisma.projectImages.createMany({
        data: [
            {
                image: 'example.jpg',
                altText: 'An example image',
                position: 1,
                projectId: 1,
            },
        ],
    });

    //ProjectSocials
    await prisma.projectSocials.createMany({
        data: [
            {
                projectId: 1,
                websiteId: 1,
                url: 'https://example.com',
            },
        ],
    });

    //Jobs
    await prisma.jobs.createMany({
        data: [
            {
                projectId: 1,
                roleId: 1,
                availability: 'Flexible',
                duration: 'ShortTerm',
                location: 'Remote',
                compensation: 'Unpaid',
                description: 'One simple seeded job',
            },
        ],
    });

    //Members
    await prisma.members.createMany({
        data: [
            {
                projectId: 1,
                userId: 1,
                roleId: 1,
                profileVisibility: 'public',
            },
        ],
    });

    //ProjectFollowings
    await prisma.projectFollowings.createMany({
        data: [
            {
                userId: 1,
                projectId: 1,
            },
        ],
    });

    //UserSocials
    await prisma.userSocials.createMany({
        data: [
            {
                userId: 1,
                websiteId: 1,
                url: 'https://example.com/u/example_user',
            },
        ],
    });

    //UserSkills
    await prisma.userSkills.createMany({
        data: [
            {
                userId: 1,
                skillId: 1,
                position: 1,
                proficiency: 'Intermediate',
            },
        ],
    });

    //UserFollowings
    await prisma.userFollowings.createMany({
        data: [
            {
                senderId: 1,
                receiverId: 1,
            },
        ],
    });

    console.log('Seed complete');
}

main()
  .catch((e: unknown) => {
    if (e instanceof Error) {
      console.error('seed error:', e.message, e.stack);
    } else {
      console.error('seed error (non-Error):', e);
    }
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });