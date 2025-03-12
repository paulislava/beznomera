import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../users/user.decorator';
import { RequestUser } from '../users/user.types';
import { FileFolder, FileInfo } from '@paulislava/shared/file/file.types';

import { WrongMimetypeException } from './file.exceptions';
import { FileSerializer } from './file.serializer';
import FILE_API, {
  FileApi,
  FILE_NAME_PARAM,
} from '@paulislava/shared/file/file.api';
@Controller(FILE_API.path)
export class FileController implements FileApi {
  constructor(
    private readonly fileService: FileService,
    private readonly fileSerializer: FileSerializer,
  ) {}

  @Post(FILE_API.backendRoutes.upload)
  @UseInterceptors(
    FileInterceptor(FILE_NAME_PARAM, {
      fileFilter: (req, file, callback) => {
        if (
          file.mimetype !== 'image/png' ||
          !file.originalname.endsWith('.png')
        ) {
          return callback(new WrongMimetypeException(), false);
        }
        callback(null, true);
      },
    }),
  )
  @UseGuards(JwtAuthGuard)
  async upload(
    @UploadedFile(FILE_NAME_PARAM) file: Express.Multer.File,
    @Param('folder', new ParseEnumPipe(FileFolder)) folder: FileFolder,
    @CurrentUser() user: RequestUser,
  ): Promise<FileInfo> {
    const fileEntity = await this.fileService.uploadFile(file, folder, user);
    return this.fileSerializer.info(fileEntity);
  }
}
