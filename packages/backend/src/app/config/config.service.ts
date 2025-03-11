import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

import { validateSync, ValidationError } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { EventEmitter2 } from 'eventemitter2';
import { load } from 'js-yaml';

import {
  ApplicationConfig,
  AuthConfig,
  DatabaseConfig,
  MailConfig,
  S3Config,
  SmsConfig,
  TelegramConfig,
  Version,
  WebdavConfig,
} from './config.schema';

@Injectable()
export class ConfigService implements ApplicationConfig {
  private config: ApplicationConfig;

  constructor(private readonly configEvents: EventEmitter2) {
    this.loadConfig();
    process.on('SIGHUP', () => this.loadConfig());
  }

  get database(): DatabaseConfig {
    return this.config.database;
  }

  get sms(): SmsConfig {
    return this.config.sms;
  }

  get auth(): AuthConfig {
    return this.config.auth;
  }

  get mail(): MailConfig {
    return this.config.mail;
  }

  get webdav(): WebdavConfig {
    return this.config.webdav;
  }

  get telegram(): TelegramConfig {
    return this.config.telegram;
  }

  get s3(): S3Config {
    return this.config.s3;
  }

  get version(): Version {
    return {
      version: process.env['APP_VERSION'] ? process.env['APP_VERSION'] : null,
      branch: process.env['APP_SOURCE_BRANCH']
        ? process.env['APP_SOURCE_BRANCH']
        : null,
      commit: process.env['APP_SOURCE_COMMIT']
        ? process.env['APP_SOURCE_COMMIT']
        : null,
      buildTime: process.env['APP_BUILD_TIME']
        ? process.env['APP_BUILD_TIME']
        : null,
    };
  }

  private loadConfig(): void {
    let filename: string;
    const root: string = resolve(dirname(require.main?.filename ?? ''), '..');
    if (existsSync(join(root, 'config.yaml'))) {
      filename = resolve(join(root, 'config.yaml'));
    } else if (existsSync(join(root, 'config.yml'))) {
      filename = join(root, 'config.yml');
    } else {
      throw new Error(
        `Unable to find config file, please create config.yml or config.yaml in an ${root} dir`,
      );
    }
    this.config = plainToClass(
      ApplicationConfig,
      load(readFileSync(filename, 'utf-8')),
      {
        exposeDefaultValues: true,
        enableImplicitConversion: false,
      },
    );
    const cfgErrors: ValidationError[] = validateSync(this.config, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (cfgErrors.length > 0) {
      throw new Error(
        `Error validating config object: ${JSON.stringify(cfgErrors, null, 2)}`,
      );
    }
    this.configEvents.emit('config', this.config);
  }
}
