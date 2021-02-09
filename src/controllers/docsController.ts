import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import path from 'path';

const getApiDocumentation = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const options = {
      headers: {
        'Content-Security-Policy':
          "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'",
      },
    };

    res.sendFile(path.join(__dirname, '../public/index.html'), options);
  },
);

export { getApiDocumentation };
