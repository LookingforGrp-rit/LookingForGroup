import { PrismaClient } from '../src/models/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    //Datasets
    await prisma.mediums.createMany({
        data: [
            { label: 'Video Game' },
            { label: 'Analog Game' },
            { label: 'Mobile Application' },
        ],
    });

    await prisma.roles.createMany({
        data: [
            { label: 'Full-Stack Developer' },
            { label: 'Front-End Developer' },
            { label: 'Back-End Developer' },
        ],
    });

    await prisma.majors.createMany({
        data: [
            { label: 'Animation' },
            { label: 'Computer Engineering' },
            { label: 'Computing Engineering Technology' },
        ],
    });

    await prisma.socials.createMany({
        data: [
            { label: 'Instagram' },
            { label: 'Twitter' },
            { label: 'Facebook' },
        ],
    });

    await prisma.tags.createMany({
        data: [
            { label: 'Indie', type: 'Creative' },
            { label: 'Abstract', type: 'Creative' },
            { label: 'Horror', type: 'Creative' },
        ],
    });

    await prisma.skills.createMany({
        data: [
            { label: 'C++', type: 'Developer' },
            { label: 'CSS', type: 'Developer' },
            { label: 'C#', type: 'Developer' },
        ],
    });

    //Users
    await prisma.users.createMany({
        data: [
            {
                username: 'mhr2964',
                ritEmail: 'mhr2964@rit.edu',
                firstName: 'Michael',
                lastName: 'Robinson',
                headline: 'Hello world',
                pronouns: 'they/them',
                title: 'Student',
                location: 'Rochester, NY',
                funFact: 'Loves Prisma',
                bio: 'This is an example user.',
                universityId: '11111111',
                academicYear: 'Freshman',
            },
            {
                username: 'anw7643',
                ritEmail: 'anw7643@rit.edu',
                firstName: 'Ashley',
                lastName: 'Whigam',
                headline: 'Hello world',
                pronouns: 'they/them',
                title: 'Student',
                location: 'Rochester, NY',
                funFact: 'Loves Prisma',
                bio: 'This is an example user.',
                universityId: '11111111',
                academicYear: 'Freshman',
            },
            {
                username: 'anw7643',
                ritEmail: 'anw7643@rit.edu',
                firstName: 'Ashley',
                lastName: 'Whigam',
                headline: 'Hello world',
                pronouns: 'they/them',
                title: 'Student',
                location: 'Rochester, NY',
                funFact: 'Loves cheez-its',
                bio: 'This is an example user.',
                universityId: '222222222',
                academicYear: 'Freshman',
            },
            {
                username: 'swc3333',
                ritEmail: 'swc3333@rit.edu',
                firstName: 'Stephen',
                lastName: 'Curry',
                headline: 'Hello world',
                pronouns: 'they/them',
                title: 'Student',
                location: 'Rochester, NY',
                funFact: 'Loves shooting',
                bio: 'This is an example user.',
                universityId: '33333333',
                academicYear: 'Senior',
            },
            {
                username: 'swc3333',
                ritEmail: 'swc3333@rit.edu',
                firstName: 'Stephen',
                lastName: 'Curry',
                headline: 'Hello world',
                pronouns: 'they/them',
                title: 'Student',
                location: 'Rochester, NY',
                funFact: 'Loves shooting',
                bio: 'This is an example user.',
                universityId: '33333333',
                academicYear: 'Senior',
            },
        ],
    });

    //Projects
    await prisma.projects.createMany({
        data: [
            {
                title: 'Looking For Group',
                hook: 'You can LOOK for a GROUP',
                description: 'Have you ever needed a project or a group?',
                audience: 'Everybody',
                purpose: 'Personal',
                userId: 1,
                status: "Development",
            },
            {
                title: 'Changeling',
                hook: 'You can CHANGE a LING',
                description: 'Have you ever needed a Changeling?',
                audience: 'Everybody',
                purpose: 'Personal',
                userId: 2,
                status: "Development",
            },
            {
                title: 'Manhattan Project',
                hook: 'You can make an ATOMIC BOMB',
                description: 'Have you ever needed to nuke a country?',
                audience: 'Everybody',
                purpose: 'Personal',
                userId: 3,
                status: "Development",
            },
            {
                title: 'Changeling',
                hook: 'You can CHANGE a LING',
                description: 'Have you ever needed a Changeling?',
                audience: 'Everybody',
                purpose: 'Personal',
                userId: 2,
                status: "Development",
            },
            {
                title: 'Manhattan Project',
                hook: 'You can make an ATOMIC BOMB',
                description: 'Have you ever needed to nuke a country?',
                audience: 'Everybody',
                purpose: 'Personal',
                userId: 3,
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
            {
                image: 'example.jpg',
                altText: 'An example image',
                position: 1,
                projectId: 2,
            },
            {
                image: 'example.jpg',
                altText: 'An example image',
                position: 1,
                projectId: 3,
            },
            {
                image: 'example.jpg',
                altText: 'An example image',
                position: 1,
                projectId: 2,
            },
            {
                image: 'example.jpg',
                altText: 'An example image',
                position: 1,
                projectId: 3,
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

    //Members
    await prisma.members.createMany({
        data: [
            {
                projectId: 1,
                userId: 1,
                roleId: 1,
                profileVisibility: 'public',
            },
            {
                projectId: 2,
                userId: 2,
                roleId: 1,
                profileVisibility: 'public',
            },
            {
                projectId: 3,
                userId: 3,
                roleId: 1,
                profileVisibility: 'public',
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
            {
                projectId: 2,
                userId: 2,
                roleId: 1,
                profileVisibility: 'public',
            },
            {
                projectId: 3,
                userId: 3,
                roleId: 1,
                profileVisibility: 'public',
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
                description: 'One example job',
                contactUserId: 1
            },
            {
                projectId: 2,
                roleId: 1,
                availability: 'Flexible',
                duration: 'ShortTerm',
                location: 'Remote',
                compensation: 'Unpaid',
                description: 'One example job',
                contactUserId: 2
            },
            {
                projectId: 3,
                description: 'One example job',
                contactUserId: 1,
                roleId: 0,
                availability: 'Flexible',
                duration: 'ShortTerm',
                location: 'Remote',
                compensation: 'Unpaid'
            },
            {
                projectId: 2,
                roleId: 1,
                availability: 'Flexible',
                duration: 'ShortTerm',
                location: 'Remote',
                compensation: 'Unpaid',
                description: 'One example job',
                contactUserId: 2
            },
            {
                projectId: 3,
                roleId: 1,
                availability: 'Flexible',
                duration: 'ShortTerm',
                location: 'Remote',
                compensation: 'Unpaid',
                description: 'One example job',
                contactUserId: 3,
            },
        ],
    });

    //ProjectFollowings
    await prisma.projectFollowings.createMany({
        data: [
            {
                userId: 1,
                projectId: 3,
            },
            {
                userId: 2,
                projectId: 3,
            },
            {
                userId: 2,
                projectId: 1,
            },
            {
                userId: 3,
                projectId: 2,
            },
            {
                userId: 3,
                projectId: 2,
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
            {
                userId: 2,
                websiteId: 2,
                url: 'https://example.com/u/example_user',
            },
            {
                userId: 3,
                websiteId: 3,
                url: 'https://example.com/u/example_user',
            },
            {
                userId: 2,
                websiteId: 2,
                url: 'https://example.com/u/example_user',
            },
            {
                userId: 3,
                websiteId: 3,
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
            {
                userId: 2,
                skillId: 2,
                position: 1,
                proficiency: 'Intermediate',
            },
            {
                userId: 3,
                skillId: 3,
                position: 1,
                proficiency: 'Intermediate',
            },
            {
                userId: 2,
                skillId: 2,
                position: 1,
                proficiency: 'Intermediate',
            },
            {
                userId: 3,
                skillId: 3,
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
                receiverId: 2,
            },
            {
                senderId: 2,
                receiverId: 3,
            },
            {
                senderId: 3,
                receiverId: 2,
            },
            {
                senderId: 2,
                receiverId: 3,
            },
            {
                senderId: 3,
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