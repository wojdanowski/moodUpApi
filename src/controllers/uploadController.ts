import { catchAsync } from './../utils/catchAsync';
import AppError from './../utils/appError';
import { StatusMessages } from '../utils/StatusMessages';
import { NextFunction, Request, Response } from 'express';
import { upload } from './../services/fileUpload';
import { StatusCodes } from 'http-status-codes';

const singleUpload = upload.single('image');

const uploadImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    singleUpload(req, res, (err: any): void => {
      if (err) {
        return next(new AppError('File Upload Error', StatusCodes.BAD_REQUEST));
      }
      if (!req.file) {
        return next(new AppError('No file provided', StatusCodes.BAD_REQUEST));
      }

      res.status(201).json({
        status: StatusMessages.Success,
        imageUrl: req.file.destination,
      });
    });
  },
);

export { uploadImage };
