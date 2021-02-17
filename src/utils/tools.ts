import jwt from 'jsonwebtoken';
import AppError from './appError';
import { StatusCodes } from 'http-status-codes';

export const daysToMs = (days: number): number => {
  return days * 24 * 60 * 60 * 1000;
};

export function delKey<T, U>(object: T, key: keyof T): U {
  return Object.keys(object).reduce((acc: any, currentKey: string) => {
    if (currentKey !== key) {
      acc[currentKey] = object[currentKey as keyof T];
    }
    return acc;
  }, {}) as U;
}

export type DecodedToken = {
  id: string;
  iat: number;
  exp: number;
};

export const verifyToken = (token: string, secret: string): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(new AppError(err.message, StatusCodes.UNAUTHORIZED));
      return resolve(decoded as DecodedToken);
    });
  });
};
