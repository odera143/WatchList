import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyTokenFromHeader = (auth?: string) => {
  if (!auth) return null;
  const token = auth.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || '') as any;
  } catch (err) {
    return null;
  }
};
