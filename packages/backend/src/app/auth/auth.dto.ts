import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  AuthCheckData,
  AuthStartData,
  AuthTelegramData,
} from '@paulislava/shared/auth/auth.types';

import { AuthMode } from './auth.types';

export class AuthStartDto implements AuthStartData {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsEnum(AuthMode)
  authMode: AuthMode;
}

export class AuthCheckDto extends AuthStartDto implements AuthCheckData {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class AuthTelegramDto implements AuthTelegramData {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  auth_date: number;
  first_name: string;

  @IsString()
  @IsNotEmpty()
  hash: string;

  photo_url: string;
}
