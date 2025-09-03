import { GetObjectCommand, HeadObjectCommand, NotFound } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { ImageUploadResult } from '@looking-for-group/shared';
import envConfig from '#config/env.ts';
import s3 from '#config/s3.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type GetImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

// https://mrfreelancer9.medium.com/integrate-aws-s3-with-your-node-js-project-a-step-by-step-guide-f7f160ea8d29
const isFileExists = async (key: string): Promise<boolean> => {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: envConfig.s3Bucket,
        Key: key,
      }),
    );

    return true;
  } catch (error) {
    if (error instanceof NotFound) return false;
    throw error;
  }
};

export const getImageService = async (
  key: string,
): Promise<ImageUploadResult | GetImageServiceError> => {
  try {
    // file not found
    if (!(await isFileExists(key))) return 'NOT_FOUND';

    // configure s3 upload parameters
    const getParameters = {
      Bucket: envConfig.s3Bucket,
      Key: key,
    };

    const command = new GetObjectCommand(getParameters);
    const url = await getSignedUrl(s3, command);

    return { location: url };
  } catch (error) {
    if (error instanceof NotFound) {
      return 'NOT_FOUND';
    }
    return 'INTERNAL_ERROR';
  }
};
