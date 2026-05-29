import { EventEmitter } from 'events';

export interface LogEntry {
  time: number;
  message: string;
}

const MAX_BUFFER = 500;
const buffer: LogEntry[] = [];
export const logEvents = new EventEmitter();
logEvents.setMaxListeners(100);

export function pushLog(message: string): void {
  const trimmed = message.trimEnd();
  if (!trimmed) return;
  const entry: LogEntry = { time: Date.now(), message: trimmed };
  buffer.push(entry);
  if (buffer.length > MAX_BUFFER) buffer.shift();
  logEvents.emit('log', entry);
}

export function getLogHistory(): LogEntry[] {
  return [...buffer];
}
