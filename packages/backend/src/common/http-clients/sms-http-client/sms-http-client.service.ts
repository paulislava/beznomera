import { URLSearchParams } from 'url';

import { Injectable } from '@nestjs/common';
import { RequestInit } from 'node-fetch';

import { BaseHttpClient } from '../base-http-client';
import { ConfigService } from '../../../app/config/config.service';

@Injectable()
export class SmsHttpClientService extends BaseHttpClient {
  protected readonly host: string;

  private readonly login: string;

  private readonly password: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.host = this.configService.sms.baseUrl;
    this.login = this.configService.sms.login;
    this.password = this.configService.sms.password;
  }

  async sendMessage(phones: string[] | string, message: string): Promise<void> {
    await this.get('', {
      phones: Array.isArray(phones) ? phones.join(';') : phones,
      mes: message,
    });
  }

  protected async httpBase<T>(path: string, init?: RequestInit): Promise<T> {
    const searchParams = new URLSearchParams();
    searchParams.append('login', this.login);
    searchParams.append('psw', this.password);
    const symbol = path.includes('?') ? '&' : '&';
    const url = path + symbol + searchParams.toString();
    return super.httpBase(url, init);
  }
}
