import { appPort } from './config';
import express from 'express';
import { logError, logger } from './logger';
import { apiRouter } from './controller';
import { fetch } from './libraries/fetch';
import { prismaClient } from './libraries/prisma';

const app = express();

app.use('/api', apiRouter);

app.use((req, res) => {
  if (!res.writableEnded) {
    res.json({
      code: 404,
      msg: '接口不存在',
    });
  }
});

app.listen(appPort, '0.0.0.0', () => {
  logger.info('应用启动成功localhost:' + appPort);
});

process.on('uncaughtException', reason => {
  prismaClient.$disconnect();
  logError(reason);
});

// process.on('SIGINT', () => {
//   app.
// });

export default app;
