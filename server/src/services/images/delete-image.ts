import { DeleteObjectCommand, HeadObjectCommand, NotFound } from '@aws-sdk/client-s3';
import envConfig from '#config/env.ts';
import s3 from '#config/s3.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type UploadImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

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

export const deleteImageService = async (
  location: string,
): Promise<undefined | UploadImageServiceError> => {
  try {
    if (!location.startsWith('/api/images')) return 'NOT_FOUND';
    const key = location.substring('/api/images/'.length);

    // file not found
    if (!(await isFileExists(key))) return 'NOT_FOUND';

    const deleteParams = {
      Bucket: envConfig.s3Bucket,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(deleteParams));
    return;
  } catch (error) {
    console.error(error);
    return 'INTERNAL_ERROR';
  }
};
