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
import { RequestUser } from '@paulislava/shared/user/user.types';
import { FileFolder, FileInfo } from '@paulislava/shared/file/file.types';

import { WrongMimetypeException } from './file.exceptions';
import FILE_API, {
  FileApi,
  FILE_NAME_PARAM,
} from '@paulislava/shared/file/file.api';

enum AllowedImageMimeType {
  Png = 'image/png',
  Webp = 'image/webp',
  Avif = 'image/avif',
}

enum AllowedImageExtension {
  Png = '.png',
  Webp = '.webp',
  Avif = '.avif',
}

const ALLOWED_IMAGE_MIMETYPES = Object.values(AllowedImageMimeType);
const ALLOWED_IMAGE_EXTENSIONS = Object.values(AllowedImageExtension);
@Controller(FILE_API.path)
export class FileController implements FileApi {
  constructor(private readonly fileService: FileService) {}

  @Post(FILE_API.backendRoutes.upload)
  @UseInterceptors(
    FileInterceptor(FILE_NAME_PARAM, {
      fileFilter: (req, file, callback) => {
        const hasAllowedMimeType = ALLOWED_IMAGE_MIMETYPES.includes(
          file.mimetype as AllowedImageMimeType,
        );
        const hasAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.some((extension) =>
          file.originalname.toLowerCase().endsWith(extension),
        );
        if (!hasAllowedMimeType || !hasAllowedExtension) {
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
    return fileEntity.info();
  }
}
