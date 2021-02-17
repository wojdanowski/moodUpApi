import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import path from 'path';
import { CONTENT_SECURITY_POLICY } from './../utils/headers';

const getApiDocumentation = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.sendFile(path.join(__dirname, '../public/index.html'), { headers: CONTENT_SECURITY_POLICY });
  },
);

export { getApiDocumentation };
