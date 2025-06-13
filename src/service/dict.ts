import { systemUserId } from 'src/constant/userId';
import { fetch } from 'src/libraries/fetch';
import { prismaClient } from 'src/libraries/prisma';
import { saveUploadFile } from 'src/utils';

const howManySyllableUrl = 'https://www.howmanysyllables.com';

const howManySyllableHeaders = {
  accept: 'text/html',
  'accept-language': 'en;q=0.9',
  'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
};

export type TParseSyllableResult = {
  syllables: Array<{ span: string; stress?: boolean; pronounce: string }>;
  pronounce: string;
  remoteRes?: string;
  statusMsg?: string;
};

const parseSyllableResult = (htmlText: string, word: string) => {
  const result: TParseSyllableResult = {
    syllables: [],
    remoteRes: htmlText,
    pronounce: `${howManySyllableUrl}/pronounce/${word}.mp3`,
  };
  let statusMsg = '开始解析';
  if (htmlText) {
    statusMsg = '读取到服务内容';
    const contentRegExp = /<p id="SyllableC(.|\S)+?<\/p>/;
    // 得到音节内容
    const contentResult = contentRegExp.exec(htmlText)?.[0];
    if (contentResult) {
      statusMsg = '读取到音节内容';
      result.remoteRes = contentResult;
      const stressRegExp = /tress.+?nbsp;.+?data-nosnippet>(.+?)<\/span><br/;
      const pronounceRegExp = /pronounce.+?nbsp;.+?data-nosnippet>(.+?)<\/span>/;
      // 有重读标注的音节
      const stressResult = stressRegExp.exec(contentResult)?.[1];
      const stressArr = stressResult?.split('-') || [];
      // 音节发音
      const pronounceResult = pronounceRegExp.exec(contentResult)?.[1];
      const pronounceArr = pronounceResult?.split('-') || [];
      if (
        (stressArr.length !== 0 && pronounceArr.length !== 0) ||
        (stressArr.length === 0 && pronounceArr.length !== 0) ||
        (stressArr.length !== 0 && pronounceArr.length === 0)
      ) {
        statusMsg = '读取到重音内容';
        const maxLen = Math.max(stressArr.length, pronounceArr.length);
        const spanRegExp = />(.+?)</;

        statusMsg = '解析重音内容';
        for (let i = 0; i < maxLen; i++) {
          const span = stressArr[i]?.trim() || '';
          const pronounce = pronounceArr[i]?.trim() || '';
          if (span.startsWith('<')) {
            spanRegExp.lastIndex = 0;
            result.syllables.push({
              span: spanRegExp.exec(span)?.[1] || span,
              stress: true,
              pronounce,
            });
          } else {
            result.syllables.push({ span, pronounce });
          }
        }
      }
    }
  }
  result.statusMsg = statusMsg;
  return result;
};

export const getWordSyllables = async (word: string) => {
  let res = await fetch(`${howManySyllableUrl}/syllables/${word}`, {
    headers: howManySyllableHeaders,
    referrer: howManySyllableUrl,
    method: 'GET',
  });
  const result = parseSyllableResult(res.textResult || '', word);
  if (result.pronounce) {
    const fileName = `${word}.mp3`;
    let sqlRow = await prismaClient.upload.findFirst({
      where: {
        fileName,
        uploadUserId: systemUserId.dictSyllablePronounce,
      },
    });
    if (!sqlRow) {
      res = await fetch(result.pronounce);
      if (res.arrayBufferResult) {
        const savedPath = await saveUploadFile(Buffer.from(res.arrayBufferResult));
        sqlRow = await prismaClient.upload.upsert({
          create: {
            fileName: `${word}.mp3`,
            savePath: savedPath,
            uploadUserId: systemUserId.dictSyllablePronounce,
          },
          where: {
            uploadUserId_savePath: {
              savePath: savedPath,
              uploadUserId: systemUserId.dictSyllablePronounce,
            },
          },
          update: {},
        });
      } else {
        throw new Error('获取发音mp3文件失败');
      }
    }
    result.pronounce = sqlRow.id;
  }
  return result;
};
