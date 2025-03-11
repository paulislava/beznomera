import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileService } from './file/file.service';
import { FileController } from './file/file.controller';
import { File } from './entities/file.entity';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        () => {
          return yaml.load(
            fs.readFileSync(join(__dirname, '../../config.yaml'), 'utf8'),
          );
        },
      ],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [File],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([File]),
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class AppModule {} 