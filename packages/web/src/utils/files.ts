import { CDN_URL } from '@/constants/site';
import { fileService } from '@/services';
import { FileFolder } from '@shared/file/file.types';
import { FILE_NAME_PARAM } from '@shared/file/file.api';

export const cdnFileUrl = (path: string) => {
  return `${CDN_URL}/${path}`;
};

export const uploadFile = async (file: File, folder: FileFolder) => {
  const formData = new FormData();
  formData.set(FILE_NAME_PARAM, file);
  return fileService.upload(formData, folder);
};

export const cdnIconUrl = (path: string) => {
  return `${CDN_URL}/icons/${path}`;
};
