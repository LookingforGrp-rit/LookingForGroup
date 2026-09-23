import { randomUUID } from 'crypto';
import path from 'path';
import { PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import type { ImageUploadResult } from '@looking-for-group/shared';
import sharp from 'sharp';
import envConfig from '#config/env.ts';
import s3 from '#config/s3.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type UploadImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONTENT_TOO_LARGE'>;

// Every upload is re-encoded to WebP before it's stored, regardless of the
// original format: it compresses meaningfully better than raw JPEG/PNG,
// and unlike JPEG it still supports transparency, so there's no need to
// branch logic on whether the source image is a photo or has an alpha
// channel. This also caps how large a stored image can be dimension-wise,
// since uploads otherwise come through exactly as the browser sent them
// (e.g. a full-resolution phone photo).
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 80;

//POST api/images
//not routed, only used for testing
export const uploadImageService = async (
  buffer: Buffer,
  filename: string,
): Promise<ImageUploadResult | UploadImageServiceError> => {
  try {
    const compressedBuffer = await sharp(buffer)
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    // transform filename - always .webp now, regardless of what was uploaded
    const ext = path.extname(filename);
    const base = path.basename(filename, ext).substring(0, 20);
    const uniqueKey = `${base}${randomUUID()}.webp`;

    // configure s3 upload parameters
    const uploadParameters = {
      Bucket: envConfig.s3Bucket,
      Key: uniqueKey,
      ContentType: 'image/webp',
      Body: compressedBuffer,
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
