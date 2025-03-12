import { APIRoutes, apiInfo } from '../api-routes';
import { FileFolder, FileInfo } from './file.types';

export interface FileApi {
  upload(data: any, folder: FileFolder, ...args: any[]): Promise<FileInfo>;
}

export const FOLDER_PARAM = 'folder';

export const FILE_NAME_PARAM = 'file';

const FILE_ROUTES: APIRoutes<FileApi> = {
  upload: {
    path: folder => `${folder || `:${FOLDER_PARAM}`}`,
    method: 'POST',
    formData: true
  }
};

const FILE_API = apiInfo(FILE_ROUTES, 'file');
export default FILE_API;
