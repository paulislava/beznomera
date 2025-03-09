import { CDN_URL } from '@/constants/site';

export const cdnFileUrl = (path: string) => {
  return `${CDN_URL}/${path}`;
};
