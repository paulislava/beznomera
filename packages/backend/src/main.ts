import { addAlias } from 'module-alias';

addAlias('~', __dirname);

import { Encoding } from 'crypto';
import { ServerResponse } from 'http';

import { Request } from 'express';
import { NestFactory } from '@nestjs/core';
import bodyParser from 'body-parser';
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { ASSETS_FILE_PATH, ASSETS_URI_PATH } from './constants';
import { prefixPath } from './common/utils/prefixPath';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore cannot find module?
import { reload } from 'ip-location-api';

const rawBodyBuffer = (
  req: Request,
  _res: ServerResponse,
  buffer: Buffer,
  encoding: Encoding,
): void => {
  if (buffer?.length) {
    req.rawBody = buffer.toString(encoding ?? 'utf8');
  }
};

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    cors: {
      origin: true,
      credentials: true,
    },
  });

  const routePrefix = process.env.ROUTE_PREFIX;

  if (routePrefix) {
    console.info(`Global route prefix: ${routePrefix}`);
    app.setGlobalPrefix(routePrefix);
  }

  app.useGlobalPipes(new ValidationPipe());

  app.use(cookieParser());

  app.useStaticAssets(ASSETS_FILE_PATH, {
    prefix: prefixPath(`/${ASSETS_URI_PATH}`),
  });

  app.use(
    bodyParser.urlencoded({
      verify: rawBodyBuffer,
      extended: true,
      limit: '50mb',
    }),
  );
  app.use(
    bodyParser.json({
      verify: rawBodyBuffer,
      limit: '50mb',
    }),
  );

  const appPort = process.env.APP_PORT ?? 3000;
  console.log(`Listening on port ${appPort}`);
  await app.listen(appPort);

  reload();
}

bootstrap().catch((e: Error) => console.error(e));
