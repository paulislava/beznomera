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
@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly fileSerializer: FileSerializer,
  ) {}

  @Post(':folder')
  @UseInterceptors(
    FileInterceptor('file', {
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
  async uploadFile(
    @Param('folder', new ParseEnumPipe(FileFolder)) folder: FileFolder,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: RequestUser,
  ): Promise<FileInfo> {
    const fileEntity = await this.fileService.uploadFile(file, folder, user);
    return this.fileSerializer.info(fileEntity);
  }
}
