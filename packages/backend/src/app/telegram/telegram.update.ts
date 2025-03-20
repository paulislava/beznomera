import { Update, Ctx, Start, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TelegramService } from './telegram.service';
import { isTextMessage } from '../../common/utils/telegram';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat/message.entity';
import { MessageSource } from '@paulislava/shared/chat/chat.types';

@Update()
export class TelegramUpdate {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly telegramService: TelegramService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply('Добро пожаловать!');
  }

  @On('text')
  async onMessage(@Ctx() ctx: Context) {
    const message = ctx.message;

    if (isTextMessage(message) && message.reply_to_message) {
      const messageText = message.text;

      const forwardedMessage = await this.chatMessageRepository.findOne({
        where: {
          telegramId: message.reply_to_message.message_id,
        },
        relations: ['user', 'car'],
      });

      if (!forwardedMessage) {
        await ctx.reply('Не удалось найти сообщение');
        return;
      }

      if (!forwardedMessage.user) {
        await ctx.reply('Не удалось найти пользователя');
        return;
      }

      const tgMessage = await this.telegramService.sendMessage(
        `Вам ответили по автомобилю ${forwardedMessage.car.no}:\n${messageText}`,
        forwardedMessage.user,
        forwardedMessage.sourceTelegramId,
      );

      const chatMessage = await this.chatMessageRepository.save(
        this.chatMessageRepository.create({
          text: messageText,
          chatId: forwardedMessage.chatId,
          forwardedMessage,
          userId: forwardedMessage.user.id,
          telegramId: tgMessage.message_id,
          car: forwardedMessage.car,
          sourceTelegramId: message.message_id,
        }),
      );

      await ctx.reply('Сообщение отправлено', {
        reply_to_message_id: message.message_id,
      });
    }
  }
}
