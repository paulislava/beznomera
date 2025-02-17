import { join } from 'path';

import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService): TypeOrmModuleOptions {
        return {
          type: 'postgres',
          host: config.database.host,
          port: config.database.port,
          database: config.database.database,
          username: config.database.username,
          password: config.database.password,
          synchronize: true,
          entities: [join(__dirname, '../', 'entities', '**')],
          migrationsRun: true,
          migrations: [join(__dirname, '../', 'migrations', '**')],
          namingStrategy: new SnakeNamingStrategy(),
        };
      },
    }),
  ],
})
export class DatabaseModule {}
