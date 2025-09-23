import { Readable } from 'stream';
import type { AuthenticatedRequest } from '@looking-for-group/shared';
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

export const blankMediumsRequest = {
  params: {
    id: '1',
  },
  body: {
    mediumIds: [1, 2, 3],
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

export const blankUploadImage = { location: `` };
