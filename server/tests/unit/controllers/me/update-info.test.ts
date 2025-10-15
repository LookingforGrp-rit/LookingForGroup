import type { AuthenticatedRequest, MePrivate } from '@looking-for-group/shared';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { updateUserInfo } from '#controllers/me/update-info.ts';
import { uploadImageService } from '#services/images/upload-image.ts';
import { updateUserInfoService } from '#services/me/update-info.ts';
import {
  blankUpdateUserRequest,
  blankFile,
  blankResponse,
  blankUploadImage,
} from '#tests/resources/blanks/extra.ts';
import { blankMePrivate } from '#tests/resources/blanks/me.ts';

vi.mock('#services/me/update-info.ts');
vi.mock('#services/users/get-user/get-by-username.ts');
vi.mock('#services/images/upload-image.ts');

describe('Update my info', () => {
  const req = blankUpdateUserRequest;

  // clear mocks
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // restore mocks
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should be using the mocked service', () => {
    expect(updateUserInfoService).toBe(vi.mocked(updateUserInfoService));
    expect(uploadImageService).toBe(vi.mocked(uploadImageService));
  });

  test('should return 200 normally', async () => {
    // setup
    vi.mocked(uploadImageService).mockResolvedValue(blankUploadImage);
    vi.mocked(updateUserInfoService).mockResolvedValue(blankMePrivate);

    const responseBody = {
      status: 200,
      error: null,
      data: blankMePrivate,
    };

    await updateUserInfo(req, blankResponse);

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

    expect(uploadImageService).not.toHaveBeenCalled();
    expect(updateUserInfoService).toHaveBeenCalledOnce();
    expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);
  });

  test('should return 500 if updating user errors internally', async () => {
    // setup
    vi.mocked(uploadImageService).mockResolvedValue(blankUploadImage);
    vi.mocked(updateUserInfoService).mockResolvedValue('INTERNAL_ERROR');

    const responseBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await updateUserInfo(req, blankResponse);

    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(updateUserInfoService).toHaveBeenCalledOnce();
    expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(500);
    expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);
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

      vi.mocked(uploadImageService).mockResolvedValue('CONTENT_TOO_LARGE');

      const responseBody = {
        status: 413,
        error: 'Image too large',
        data: null,
      };

      await updateUserInfo(updateRequest, blankResponse);

      expect(updateUserInfoService).not.toHaveBeenCalled();
      expect(uploadImageService).toHaveBeenCalledOnce();
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

      vi.mocked(uploadImageService).mockResolvedValue('INTERNAL_ERROR');

      const responseBody = {
        status: 500,
        error: 'Internal Server Error',
        data: null,
      };

      await updateUserInfo(updateRequest, blankResponse);

      expect(updateUserInfoService).not.toHaveBeenCalled();
      expect(uploadImageService).toHaveBeenCalledOnce();
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

      vi.mocked(updateUserInfoService).mockResolvedValue(updatedUser);

      const responseBody = {
        status: 200,
        error: null,
        data: updatedUser,
      };

      await updateUserInfo(updateRequest, blankResponse);

      expect(uploadImageService).not.toHaveBeenCalled();
      expect(updateUserInfoService).toHaveBeenCalledOnce();
      expect(blankResponse.status).toHaveBeenCalledExactlyOnceWith(200);
      expect(blankResponse.json).toHaveBeenCalledExactlyOnceWith(responseBody);
    });
  });
});
