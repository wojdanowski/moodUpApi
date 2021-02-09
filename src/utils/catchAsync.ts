import { NextFunction, Request, Response, RequestHandler } from 'express';

export interface AsyncRequestHandler<T = any> {
  (...[req, res, next]: Parameters<RequestHandler>): Promise<T>;
}

export const catchAsync = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
