import { Module } from '@nestjs/common';

import { ConfigModule } from '../../app/config/config.module';

import { SmsHttpClientService } from './sms-http-client/sms-http-client.service';

@Module({
  imports: [ConfigModule],
  providers: [SmsHttpClientService],
  exports: [SmsHttpClientService],
})
export class HttpClientsModule {}
