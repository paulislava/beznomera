import { TemplateMessage } from './templates.types'

export const authMessage = (code: string): TemplateMessage => ({
  content: `<b>${code}</b>: ваш код для входа в Depomed`
})
