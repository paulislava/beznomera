import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '../config/config.module';
import { File } from '../entities/file.entity';

import { FileController } from './file.controller';
import { FileService } from './file.service';
import { ScheduleModule } from '@nestjs/schedule';
import { FileSerializer } from './file.serializer';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([File]),
  ],
  controllers: [FileController],
  providers: [FileService, FileSerializer],
  exports: [FileService],
})
export class FileModule {}
