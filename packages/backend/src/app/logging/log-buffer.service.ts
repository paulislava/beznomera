import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { LogEntry, logEvents, getLogHistory } from './log-buffer';

@Injectable()
export class LogBufferService {
  readonly events: EventEmitter = logEvents;

  getHistory(): LogEntry[] {
    return getLogHistory();
  }
}
