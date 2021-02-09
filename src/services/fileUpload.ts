import aws from 'aws-sdk';
import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';
import AppError from './../utils/appError';
import { StatusCodes } from 'http-status-codes';

aws.config.update({
  secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new AppError('Invalid Mime Type, only JPEG and PNG', StatusCodes.BAD_REQUEST));
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: 'moodup',
    metadata: function (req: Request, file: Express.Multer.File, cb: (error: any, metadata?: any) => void): void {
      cb(null, { fieldName: 'testing metadata' });
    },
    key: function (req: Request, file: Express.Multer.File, cb: (error: any, key?: string) => void): void {
      cb(null, Date.now().toString() + '/' + file.originalname);
    },
  }),
});

export { upload };
