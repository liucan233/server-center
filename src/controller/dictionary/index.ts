import { Router } from 'express';
import { prismaClient } from '../../libraries/prisma';
import { logError } from '../../logger';
import { getErrMsg } from '../../utils';
import { getWordSyllables, TParseSyllableResult } from 'src/service/dict';

export const dictRouter: Router = Router();

dictRouter.get('/syllables', async (req, res) => {
  let tmpWord = req.query.word;
  let word = '';
  if (typeof tmpWord === 'string') {
    word = tmpWord.trim();
  }

  if (word) {
    let result: TParseSyllableResult | undefined;
    try {
      if (typeof tmpWord === 'string') {
        const beginTime = Date.now();
        const word = tmpWord.trim();
        const sqlRow = await prismaClient.word.findFirst({
          where: {
            spell: word,
            syllable: { isNot: null },
          },
          include: {
            syllable: true,
          },
        });
        if (sqlRow && sqlRow.syllable) {
          const { jsonList, pronounceId, spidersText } = sqlRow.syllable;
          res.json({
            syllables: jsonList,
            pronounce: pronounceId,
            costMs: Date.now() - beginTime,
            remoteRes: spidersText,
          });
        } else {
          result = await getWordSyllables(word.trim());
          res.json({ ...result, costMs: Date.now() - beginTime });
        }
      } else {
        res.status(400).json({ errMsg: '缺少word query' });
      }
    } catch (error) {
      logError(error);
      res.status(502).json({
        errMsg: getErrMsg(error),
      });
    }

    if (result) {
      prismaClient.$transaction(async t => {
        const wordRow = await t.word.upsert({
          where: { spell: word },
          create: { spell: word },
          update: {},
        });
        await t.wordSyllable.create({
          data: {
            jsonList: result.syllables,
            spidersText: result.remoteRes || '',
            pronounceId: result.pronounce,
            wordId: wordRow.id,
          },
        });
      });
    }
  }
});
