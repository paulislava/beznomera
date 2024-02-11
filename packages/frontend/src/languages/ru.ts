import { AuthErrorCodes } from '@paulislava/shared/auth/auth.constants'

const messagesWithPrefix = (
  messages: Record<string, string>,
  prefix: string
): Record<string, string> => {
  const newMessages: Record<string, string> = {}
  Object.keys(messages).map(key => {
    newMessages[key] = `${prefix}.${messages[key]}`
  })
  return newMessages
}

export const ERROR_MESSAGES_PREFIX = 'errors.codes'

export const errorMessages: Record<string, string> = {
  [AuthErrorCodes.USER_OR_DRAFT_NOT_FOUND]:
    'Пользователь не зарегистрирован в клинике, проверьте корректность введенных данных или обратитесь в регистратуру.',
  [AuthErrorCodes.WRONG_AUTH_CODE]:
    'Введён неверный код для авторизации.\nПроверьте код и повторите попытку'
}

export default { ...messagesWithPrefix(errorMessages, ERROR_MESSAGES_PREFIX) }
