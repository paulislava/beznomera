import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { File } from '../entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository, Not } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { ConfigService } from '../config/config.service';
import { RequestUser } from '../users/user.types';
import { FileFolder } from '@paulislava/shared/file/file.types';

import { TEMP_FILE_LIFETIME } from './file.constant';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class FileService {
  private s3Client: S3Client;

  constructor(
    private configService: ConfigService,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.s3.accessKeyId,
        secretAccessKey: this.configService.s3.secretAccessKey,
      },
      endpoint: this.configService.s3.endpoint,
      region: this.configService.s3.region,
      forcePathStyle: true, // Добавлено для совместимости с S3-совместимыми хранилищами
    });
  }

  @Transactional()
  async uploadFile(
    file: Express.Multer.File,
    folder: FileFolder,
    { userId }: RequestUser,
  ): Promise<File> {
    const extension = file.originalname.split('.').pop();

    const fileEntity = this.fileRepository.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      userId,
      folder,
      extension,
    });

    await fileEntity.save();

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.s3.bucket,
        Key: fileEntity.fileKey(),
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    await this.checkPrevFile(fileEntity);

    return fileEntity;
  }

  async deleteFile(fileId: string): Promise<void> {
    const file = await this.fileRepository.findOneOrFail({
      where: { id: fileId },
    });

    await this.deleteFileFromS3(file);

    await file.remove();
  }

  @Cron('*/5 * * * *')
  async deleteTempFiles(): Promise<void> {
    const files = await this.fileRepository.find({
      where: {
        folder: FileFolder.Temp,
        createdAt: LessThan(new Date(Date.now() - TEMP_FILE_LIFETIME)),
      },
    });

    for (const file of files) {
      await this.deleteFile(file.id);
    }
  }

  private async checkPrevFile(file: File): Promise<void> {
    if (file.folder !== FileFolder.Temp) {
      return;
    }

    const prevFiles = await this.fileRepository.find({
      where: {
        folder: file.folder,
        userId: file.userId,
        id: Not(file.id),
      },
    });

    await Promise.all(
      prevFiles.map(async (prevFile) => {
        await this.deleteFile(prevFile.id);
      }),
    );
  }

  private async deleteFileFromS3(file: File) {
    return this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.configService.s3.bucket,
        Key: file.fileKey(),
      }),
    );
  }
}
