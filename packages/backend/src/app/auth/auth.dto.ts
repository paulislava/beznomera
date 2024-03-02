import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import {
  AuthCheckData,
  AuthStartData,
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
