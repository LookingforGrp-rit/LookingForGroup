import type { AuthenticatedRequest, MePrivate, UserPreview } from '@looking-for-group/shared';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { updateUserInfo } from '#controllers/me/update-info.ts';
import { uploadImageService } from '#services/images/upload-image.ts';
import { updateUserInfoService } from '#services/me/update-info.ts';
import { getUserByUsernameService } from '#services/users/get-user/get-by-username.ts';
import {
  blankFile,
  blankResponse,
  blankUploadImage,
  blankUserRequest,
} from '#tests/resources/blanks/extra.ts';
import { blankMePrivate } from '#tests/resources/blanks/me.ts';
import { blankUserPreview } from '#tests/resources/blanks/users.ts';

vi.mock('#services/me/update-info.ts');
vi.mock('#services/users/get-user/get-by-username.ts');
vi.mock('#services/images/upload-image.ts');

describe('Update my info', () => {
  const req = {
    ...blankUserRequest,
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
      username: 'theneedledrop',
      phoneNumber: '1234567890',
    },
    currentUser: '1',
  } as AuthenticatedRequest;

  // clear mocks
  beforeEach(() => {
    vi.mocked(blankResponse.status).mockClear();
    vi.mocked(blankResponse.json).mockClear();
    vi.mocked(getUserByUsernameService).mockClear();
    vi.mocked(uploadImageService).mockClear();
    vi.mocked(updateUserInfoService).mockClear();
  });

  // clear mocks
  afterEach(() => {
    vi.mocked(blankResponse.status).mockClear();
    vi.mocked(blankResponse.json).mockClear();
    vi.mocked(getUserByUsernameService).mockClear();
    vi.mocked(uploadImageService).mockClear();
    vi.mocked(updateUserInfoService).mockClear();
  });

  test('should be using the mocked service', () => {
    expect(updateUserInfoService).toBe(vi.mocked(updateUserInfoService));
    expect(getUserByUsernameService).toBe(vi.mocked(getUserByUsernameService));
    expect(uploadImageService).toBe(vi.mocked(uploadImageService));
  });

  test('should return 200 normally', async () => {
    // setup
    const updatedUser = {
      ...blankMePrivate,
      ...req.body,
    } as MePrivate;

    vi.mocked(getUserByUsernameService).mockResolvedValue('NOT_FOUND');
    vi.mocked(uploadImageService).mockResolvedValue(blankUploadImage);
    vi.mocked(updateUserInfoService).mockResolvedValue(updatedUser);

    const updateRequest = {
      ...req,
      body: {
        ...(req.body as Record<string, string | number>),
        username: 'thisUsernameIsNotTaken',
      },
      currentUser: '0',
      file: blankFile,
    } as AuthenticatedRequest;

    const responseBody = {
      status: 200,
      error: null,
      data: updatedUser,
    };

    await updateUserInfo(updateRequest, blankResponse);

    expect(getUserByUsernameService).toHaveBeenCalledOnce();
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(updateUserInfoService).toHaveBeenCalledOnce();
    expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);
  });

  test('should still work with no updates', async () => {
    // setup
    const noUpdateRequest = {
      ...req,
      body: {},
      file: undefined,
    } as AuthenticatedRequest;

    const responseBody = {
      status: 200,
      error: null,
      data: blankMePrivate,
    };

    vi.mocked(updateUserInfoService).mockResolvedValue(blankMePrivate);

    await updateUserInfo(noUpdateRequest, blankResponse);

    expect(getUserByUsernameService).not.toHaveBeenCalled();
    expect(uploadImageService).not.toHaveBeenCalled();
    expect(updateUserInfoService).toHaveBeenCalledOnce();
    expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);
  });

  test("should return 400 if userId doesn't parse", async () => {
    // setup
    const badRequest = {
      ...req,
      currentUser: 'not a number',
    } as AuthenticatedRequest;

    const responseBody = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };

    await updateUserInfo(badRequest, blankResponse);

    expect(updateUserInfoService).not.toHaveBeenCalled();
    expect(uploadImageService).not.toHaveBeenCalled();
    expect(getUserByUsernameService).not.toHaveBeenCalled();
    expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(400);
    expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);
  });

  test('should return 500 if updating user errors internally', async () => {
    // setup
    vi.mocked(getUserByUsernameService).mockResolvedValue('NOT_FOUND');
    vi.mocked(updateUserInfoService).mockResolvedValue('INTERNAL_ERROR');

    const responseBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await updateUserInfo(req, blankResponse);

    expect(updateUserInfoService).toHaveBeenCalledOnce();
    expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(500);
    expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getUserByUsernameService);
  });

  describe('when changing username', () => {
    test('should return 409 if username is already taken', async () => {
      // setup
      const updateRequest = {
        ...req,
        body: {
          ...(req.body as Record<string, string | number>),
          username: 'thisUsernameIsTaken',
        },
        currentUser: '0',
      } as AuthenticatedRequest;

      const collidingUser: UserPreview = {
        ...blankUserPreview,
        userId: 500,
        username: 'thisUsernameIsTaken',
      };

      vi.mocked(getUserByUsernameService).mockResolvedValue(collidingUser);

      const responseBody = {
        status: 409,
        error: 'Username already taken',
        data: null,
      };

      await updateUserInfo(updateRequest, blankResponse);

      expect(updateUserInfoService).not.toHaveBeenCalled();
      expect(getUserByUsernameService).toHaveBeenCalledOnce();
      expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(409);
      expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);
    });

    // #FIXME service should be fixed so that this error passes
    test.skip('should return 500 if username service errors internally', async () => {
      // setup
      vi.mocked(getUserByUsernameService).mockResolvedValue('INTERNAL_ERROR');

      const responseBody = {
        status: 500,
        error: 'Internal Server Error',
        data: null,
      };

      await updateUserInfo(req, blankResponse);

      expect(updateUserInfoService).not.toHaveBeenCalled();
      expect(getUserByUsernameService).toHaveBeenCalledOnce();
      expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(500);
      expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);
    });

    test('should skip username if not being changed', async () => {
      // setup
      const updateRequest = {
        ...req,
        body: {
          ...(req.body as Record<string, string | number>),
          username: undefined,
        },
        currentUser: '0',
      } as AuthenticatedRequest;

      const updatedUser = {
        ...blankMePrivate,
        ...req.body,
      } as MePrivate;

      const responseBody = {
        status: 200,
        error: null,
        data: updatedUser,
      };

      vi.mocked(updateUserInfoService).mockResolvedValue(updatedUser);

      await updateUserInfo(updateRequest, blankResponse);

      expect(getUserByUsernameService).not.toHaveBeenCalled();
      expect(updateUserInfoService).toHaveBeenCalledOnce();
      expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(200);
      expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);
    });
  });

  describe('when changing profile image', () => {
    test('should return 413 if image is too big', async () => {
      // setup
      const updateRequest = {
        ...req,
        body: {
          ...(req.body as Record<string, string | number>),
        },
        file: blankFile,
      } as AuthenticatedRequest;

      vi.mocked(getUserByUsernameService).mockResolvedValue('NOT_FOUND');
      vi.mocked(uploadImageService).mockResolvedValue('CONTENT_TOO_LARGE');

      const responseBody = {
        status: 413,
        error: 'Image too large',
        data: null,
      };

      await updateUserInfo(updateRequest, blankResponse);

      expect(updateUserInfoService).not.toHaveBeenCalled();
      expect(uploadImageService).toHaveBeenCalledOnce();
      expect(getUserByUsernameService).toHaveBeenCalledOnce();
      expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(413);
      expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);
    });

    test('should return 500 if image upload errors internally', async () => {
      // setup
      const updateRequest = {
        ...req,
        body: {
          ...(req.body as Record<string, string | number>),
        },
        file: blankFile,
      } as AuthenticatedRequest;

      vi.mocked(getUserByUsernameService).mockResolvedValue('NOT_FOUND');
      vi.mocked(uploadImageService).mockResolvedValue('INTERNAL_ERROR');

      const responseBody = {
        status: 500,
        error: 'Internal Server Error',
        data: null,
      };

      await updateUserInfo(updateRequest, blankResponse);

      expect(updateUserInfoService).not.toHaveBeenCalled();
      expect(uploadImageService).toHaveBeenCalledOnce();
      expect(getUserByUsernameService).toHaveBeenCalledOnce();
      expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(500);
      expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);
    });

    test('should skip image upload if no image provided', async () => {
      // setup
      const updateRequest = {
        ...req,
        body: {
          ...(req.body as Record<string, string | number>),
        },
        file: undefined,
      } as AuthenticatedRequest;

      const updatedUser = {
        ...blankMePrivate,
        ...updateRequest.body,
      } as MePrivate;

      vi.mocked(getUserByUsernameService).mockResolvedValue('NOT_FOUND');
      vi.mocked(updateUserInfoService).mockResolvedValue(updatedUser);

      const responseBody = {
        status: 200,
        error: null,
        data: updatedUser,
      };

      await updateUserInfo(updateRequest, blankResponse);

      expect(uploadImageService).not.toHaveBeenCalled();
      expect(getUserByUsernameService).toHaveBeenCalledOnce();
      expect(updateUserInfoService).toHaveBeenCalledOnce();
      expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(200);
      expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);
    });
  });
});
