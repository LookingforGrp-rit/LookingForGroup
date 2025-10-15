import { Readable } from 'stream';
import type { AuthenticatedRequest, FilterRequest } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { vi } from 'vitest';
import {
  uidHeaderKey,
  firstNameHeaderKey,
  lastNameHeaderKey,
  emailHeaderKey,
} from '#config/constants.ts';

//dummy image file
export const blankFile = {
  fieldname: '',
  originalname: '',
  encoding: '',
  mimetype: '',
  size: 0,
  stream: {} as unknown as Readable,
  destination: '',
  filename: '',
  path: '',
  buffer: {} as unknown as Buffer,
};

export const validFilters = {
  strictness: 'any',
  mentor: false,
  skills: [],
  majors: [],
  academicYear: [],
  socials: [],
} as unknown as FilterRequest;

export const blankFilters = {} as unknown as FilterRequest;

export const fullFilterRequest = {
  query: blankFilters,
} as unknown as Request;

export const blankRequest = {} as unknown as Request;

export const blankIdRequest = {
  params: {
    id: '1',
    picId: '1',
    userId: '1',
  },
} as unknown as Request;

export const blankResponse = {
  json: vi.fn(() => blankResponse),
  status: vi.fn(() => blankResponse),
} as unknown as Response;

//these two should probably go into their respective files...
//but i already did the imports solike
export const blankProjectRequest = {
  params: {
    id: '1',
  },
  body: {
    title: "James Testguy's Great Game",
    hook: "James Testguy's Great Hook",
    description: 'The first game ever created by James Testguy',
    status: 'Planning',
  },
  currentUser: '1',
} as unknown as AuthenticatedRequest;

export const blankUserRequest = {
  headers: {
    [uidHeaderKey]: '000000001',
    [firstNameHeaderKey]: 'firstname',
    [lastNameHeaderKey]: 'lastname',
    [emailHeaderKey]: 'email@rit.edu',
  },
  body: {
    username: 'username',
  },
  query: {},
} as unknown as Request;

export const blankAuthUserRequest = {
  headers: {
    [uidHeaderKey]: '000000001',
    [firstNameHeaderKey]: 'firstname',
    [lastNameHeaderKey]: 'lastname',
    [emailHeaderKey]: 'email@rit.edu',
  },
  body: {
    username: 'username',
  },
  query: {},
  currentUser: '1',
} as unknown as AuthenticatedRequest;

export const blankUpdateUserRequest = {
  //kept anthony fantano
  headers: {
    [uidHeaderKey]: '000000001',
    [firstNameHeaderKey]: 'firstname',
    [lastNameHeaderKey]: 'lastname',
    [emailHeaderKey]: 'email@rit.edu',
  },
  body: {
    firstName: 'anthony',
    lastName: 'fantano',
    headline: 'hi im anthony fantano',
    pronouns: 'he/him',
    title: 'the internets busiest music nerd',
    academicYear: 'Senior',
    location: 'idk california probably',
    funFact: 'got sued by ronnie radke',
    bio: "hi i'm lawthony suitano the internets legalest music nerd",
    visibility: 1,
    phoneNumber: '1234567890',
  },
  file: blankFile,
  currentUser: '1',
} as unknown as AuthenticatedRequest;

export const blankGetUserRequest = {
  params: {
    id: '1',
    username: 'username',
    email: 'email@email.email',
  },
} as unknown as Request;

export const blankMediumsRequest = {
  params: {
    id: '1',
  },
  body: {
    mediumIds: [1, 2, 3],
  },
} as unknown as AuthenticatedRequest;

export const blankMemberRequest = {
  params: {
    id: '1',
    userId: '1',
  },
  currentUser: '1',
  body: {
    roleId: 1,
    userId: 1,
  },
} as unknown as AuthenticatedRequest;

export const blankImageRequest = {
  params: {
    id: '1',
    imageId: '1',
  },
  body: {
    image: '',
    altText: 'sample text',
  },
  currentUser: '1',
} as unknown as AuthenticatedRequest;

export const blankSocialRequest = {
  params: {
    id: '1',
  },
  body: {
    websiteId: 1,
    url: '',
  },
} as unknown as AuthenticatedRequest;

export const blankTagsRequest = {
  params: {
    id: '1',
  },
  body: {
    tagIds: [1, 2, 3],
  },
} as unknown as AuthenticatedRequest;

export const blankUploadImage = { location: `` };
