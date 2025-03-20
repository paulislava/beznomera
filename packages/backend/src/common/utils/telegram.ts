import { Message } from 'telegraf/typings/core/types/typegram';

export function isTextMessage(
  message: Message,
): message is Message.TextMessage {
  return 'text' in message && message.text !== undefined;
}
