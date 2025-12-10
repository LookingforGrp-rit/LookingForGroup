import { randomUUID } from 'crypto';
import path from 'path';
import { PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import type { ImageUploadResult } from '@looking-for-group/shared';
import envConfig from '#config/env.ts';
import s3 from '#config/s3.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type UploadImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONTENT_TOO_LARGE'>;

//POST api/images
//not routed, only used for testing
export const uploadImageService = async (
  buffer: Buffer,
  filename: string,
  filetype: string,
): Promise<ImageUploadResult | UploadImageServiceError> => {
  try {
    // transform filename
    const ext = path.extname(filename);
    const base = path.basename(filename, ext).substring(0, 20);
    const uniqueKey = base + randomUUID() + ext;

    // configure s3 upload parameters
    const uploadParameters = {
      Bucket: envConfig.s3Bucket,
      Key: uniqueKey,
      ContentType: filetype,
      Body: buffer,
    };

    const command = new PutObjectCommand(uploadParameters);
    await s3.send(command);

    return { location: `/api/images/${uniqueKey}` };
  } catch (error) {
    // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
    if (error instanceof S3ServiceException && error.name === 'EntityTooLarge') {
      console.error(`Error while uploading image: ${error.name}: ${error.message}`);
      return 'CONTENT_TOO_LARGE';
    } else {
      console.error(error);
      return 'INTERNAL_ERROR';
    }
  }
};
