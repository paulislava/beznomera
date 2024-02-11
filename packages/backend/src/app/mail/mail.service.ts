import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

import { authMessage } from '../templates/messages'
import { subjects } from '../templates/subjects'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendAuthCode(email: string, code: string): Promise<void> {
    const message = authMessage(code)

    await this.mailerService.sendMail({
      to: email,
      subject: subjects.authCode,
      text: message.plain ?? message.content,
      html: message.html ?? message.content
    })
  }
}
