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

const parseSyllableResult = (htmlText: string, word: string) => {
  const result: {
    syllables: Array<{ text: string; stress?: boolean }>;
    pronounce: string;
    errRemoteRes?: string;
    statusMsg?: string;
  } = {
    syllables: [],
    errRemoteRes: htmlText,
    pronounce: `https://www.howmanysyllables.com/pronounce/${word}.mp3`,
  };
  let statusMsg = '开始解析';
  if (htmlText) {
    statusMsg = '读取到服务内容';
    const contentRegExp = /<p id="SyllableC(.|\S)+?<\/p>/;
    // 得到音节内容
    const contentResult = contentRegExp.exec(htmlText)?.[0];
    if (contentResult) {
      statusMsg = '读取到音节内容';
      result.errRemoteRes = contentResult;
      const stressRegExp = /tress.+?nbsp;.+?data-nosnippet>(.+?)<\/span><br/;
      // 有重读标注的音节
      const stressResult = stressRegExp.exec(contentResult)?.[1];
      if (stressResult) {
        statusMsg = '读取到重音内容';
        const spanArr = stressResult.split('-');
        const spanRegExp = />(.+?)</;

        if (spanArr.length) {
          statusMsg = '解析重音内容';
          for (const s of spanArr) {
            const text = s.trim();
            if (text.startsWith('<')) {
              spanRegExp.lastIndex = 0;
              result.syllables.push({
                text: spanRegExp.exec(text)?.[1] || text,
                stress: true,
              });
            } else {
              result.syllables.push({ text });
            }
          }
          result.errRemoteRes = '';
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
        sqlRow = await prismaClient.upload.create({
          data: {
            fileName: `${word}.mp3`,
            savePath: savedPath,
            uploadUserId: systemUserId.dictSyllablePronounce,
          },
        });
      } else {
        throw new Error('获取发音mp3文件失败');
      }
    }
    result.pronounce = sqlRow.id;
  }
  return result;
};
