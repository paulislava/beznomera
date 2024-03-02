export enum MessageMode {
  PLAIN = 'plain',
  HTML = 'html',
  SMS = 'sms',
  CORE = 'core'
}

export interface TemplateMessage {
  content: string
  html?: string
  sms?: string
  plain?: string
}
