import { Controller, Get } from '@nestjs/common'

import { Version } from '../config/config.schema'
import { ConfigService } from '../config/config.service'

@Controller()
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get('/config/version')
  version(): Version {
    return this.configService.version
  }
}
