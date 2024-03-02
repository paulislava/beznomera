import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested
} from 'class-validator'

import { AuthMode } from '../auth/auth.types'

export class DatabaseConfig {
  @IsString()
  @IsNotEmpty()
  readonly host: string

  @IsPositive()
  @IsInt()
  @IsNotEmpty()
  readonly port: number = 5432

  @IsString()
  @IsNotEmpty()
  readonly database: string = 'postgres'

  @IsString()
  @IsNotEmpty()
  readonly username: string = 'postgres'

  @IsString()
  @IsDefined()
  readonly password: string = ''
}

export class SmsConfig {
  @IsString()
  @IsDefined()
  readonly login: string

  @IsString()
  @IsDefined()
  readonly password: string

  @IsString()
  @IsDefined()
  readonly baseUrl: string
}

export class AuthConfig {
  @IsIn(Object.values(AuthMode))
  @IsDefined()
  readonly mode: AuthMode

  @IsDefined()
  @IsPositive()
  readonly codeLength: number

  @IsDefined()
  @IsString()
  readonly jwtCookie: string

  @IsDefined()
  @IsString()
  readonly jwtSecret: string

  @IsDefined()
  @IsString()
  readonly passwordSalt: string

  @IsDefined()
  @IsNumber()
  readonly passwordSaltRounds: number
}

export class MailConfig {
  @IsString()
  @IsDefined()
  readonly host: string

  @IsNumber()
  readonly port: number = 465

  @IsBoolean()
  readonly secure: boolean = true

  @IsString()
  @IsDefined()
  readonly login: string

  @IsString()
  @IsDefined()
  readonly password: string

  @IsDefined()
  @IsString()
  readonly defaultFrom: string
}

export class WebdavConfig {
  @IsString()
  @IsDefined()
  readonly username: string

  @IsString()
  @IsDefined()
  readonly password: string
}

export class ApplicationConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => DatabaseConfig)
  readonly database: DatabaseConfig

  @IsDefined()
  @ValidateNested()
  @Type(() => SmsConfig)
  readonly sms: SmsConfig

  @IsDefined()
  @ValidateNested()
  @Type(() => AuthConfig)
  readonly auth: AuthConfig

  @IsDefined()
  @ValidateNested()
  @Type(() => MailConfig)
  readonly mail: MailConfig

  @IsDefined()
  @ValidateNested()
  @Type(() => WebdavConfig)
  readonly webdav: WebdavConfig
}

export interface Version {
  version: string | null

  branch: string | null

  commit: string | null

  buildTime: string | null
}
