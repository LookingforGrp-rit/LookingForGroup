import { S3Client } from '@aws-sdk/client-s3';
import envConfig from './env.ts';

const s3 = new S3Client({
  endpoint: envConfig.s3Endpoint,
  credentials: {
    accessKeyId: envConfig.s3User,
    secretAccessKey: envConfig.s3Pass,
  },
  region: 'us-east-1',
  forcePathStyle: true,
});

export default s3;
