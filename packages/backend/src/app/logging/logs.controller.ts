import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiClientAuthGuard } from '../auth/api-auth.guard';
import { LogBufferService } from './log-buffer.service';
import type { LogEntry } from './log-buffer';

@Controller('logs')
@UseGuards(ApiClientAuthGuard)
export class LogsController {
  constructor(private readonly logBuffer: LogBufferService) {}

  @Get()
  getHistory(): LogEntry[] {
    return this.logBuffer.getHistory();
  }

  @Get('stream')
  stream(@Res() res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    for (const entry of this.logBuffer.getHistory()) {
      res.write(`data: ${JSON.stringify(entry)}\n\n`);
    }

    const onLog = (entry: LogEntry): void => {
      res.write(`data: ${JSON.stringify(entry)}\n\n`);
    };

    this.logBuffer.events.on('log', onLog);
    res.on('close', () => this.logBuffer.events.off('log', onLog));
  }
}
