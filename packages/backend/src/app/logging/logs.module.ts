import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogBufferService } from './log-buffer.service';

@Module({
  providers: [LogBufferService],
  controllers: [LogsController],
  exports: [LogBufferService],
})
export class LogsModule {}
