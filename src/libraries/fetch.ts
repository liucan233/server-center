import bf from 'node:buffer';
import nodeFetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { filterInvalidText } from './cookie';

export const fetch = async <JsonResult extends object = {}>(url: URL | RequestInfo, init?: RequestInit) => {
  let res: Response;
  res = await nodeFetch(url, init);
  const resContentType = res.headers.get('content-type') || '';
  let jsonResult: JsonResult | undefined;
  if (resContentType.startsWith('application/json')) {
    jsonResult = (await res.json()) as JsonResult;
  }

  let textResult: undefined | string;
  if (resContentType.startsWith('plain') || resContentType.startsWith('text')) {
    textResult = await res.text();
  }

  let arrayBufferResult: ArrayBuffer | undefined;
  if (resContentType.includes('image') || resContentType.startsWith('audio')) {
    arrayBufferResult = await res.arrayBuffer();
  }

  const cookie = res.headers.get('set-cookie');
  let cookieText = '';
  if (cookie) {
    cookieText = filterInvalidText(cookie);
    res.headers.set('cookie', cookieText);
  }
  return {
    jsonResult,
    textResult,
    arrayBufferResult,
    headers: res.headers,
    status: res.status,
    cookie: cookieText,
    contentType: resContentType,
  };
};
