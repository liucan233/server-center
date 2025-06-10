import { Router } from 'express';
import { prismaClient } from '../../libraries/prisma';
import { logError, logger } from '../../logger';
import { jwtMiddleware } from '../../libraries/jwt';
import { ErrCode } from '../../constant/errorCode';
import { saveUploadFile } from '../../utils';
import path from 'node:path';
import { getWordSyllables } from 'src/service/dict';
import { catchError } from 'src/middleware/catchError';

export const dictRouter: Router = Router();

dictRouter.get('/syllables', async (req, res) => {
  let word = req.query.word;
  try {
    if (typeof word === 'string') {
      const beginTime = Date.now();
      word = word.trim();
      const result = await getWordSyllables(word.trim());
      res.json({ ...result, costMs: Date.now() - beginTime });
    } else {
      throw new Error('需要word query');
    }
  } catch (error) {
    logError(error);
    res.json({
      err: '1',
    });
  }
});
