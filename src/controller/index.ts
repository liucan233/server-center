import { Router } from 'express';
import { logger } from '../logger';
import { commentRouter } from './comment';
import { jwtMiddleware } from '../libraries/jwt';
import { userRouter } from './user';
import { uploadRouter } from './upload';
import express from 'express';
import { dictRouter } from './dictionary';
// import { wxRouter } from './wechat';

export const apiRouter: Router = Router();

apiRouter.use((req, res, next) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-method', '*');
  res.setHeader('access-control-headers', '*');
  res.setHeader('access-control-allow-headers', '*');
  if (req.method === 'OPTIONS') {
    res.end();
  } else {
    next();
  }
});

apiRouter.use(express.json());

apiRouter.use('/comment', commentRouter);

apiRouter.use('/user', userRouter);

apiRouter.use('/upload', uploadRouter);

apiRouter.use('/dict', dictRouter);

// servicesRouter.use('/wx', wxRouter);
