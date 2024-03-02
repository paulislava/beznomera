import striptags from 'striptags'

import { MessageMode, TemplateMessage } from './templates.types'

export function getMessageContent(
  message: TemplateMessage,
  mode: MessageMode = MessageMode.CORE
): string {
  switch (mode) {
    case MessageMode.HTML:
      return message.html ?? message.content
    case MessageMode.PLAIN:
      return message.plain ?? striptags(message.content)
    case MessageMode.SMS:
      return message.plain ?? striptags(message.content)
    default:
      return message.content
  }
}
