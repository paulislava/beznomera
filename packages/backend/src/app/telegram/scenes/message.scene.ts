import { Scene, SceneEnter, Ctx, On } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from '../../entities/car/car.entity';
import { ChatService } from '../../chat/chat.service';
import { Message } from 'telegraf/types';
import { User } from '../../entities/user/user.entity';
interface SessionData extends Scenes.SceneSessionData {
  car: Car;
}

type Context = Scenes.SceneContext<SessionData>;

@Scene('message')
export class MessageScene {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly chatService: ChatService,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: Context) {
    const car = this.getCar(ctx);
    await ctx.reply(`Сообщение для водителя автомобиля ${car.no}:`);
  }

  @On('text')
  async onMessage(@Ctx() ctx: Context) {
    const message = ctx.message as Message.TextMessage;
    if (!message.text) return;

    const car = this.getCar(ctx);

    const user = await this.userRepository.findOne({
      where: { telegramID: ctx.from.id.toString() },
    });

    if (!user) {
      await ctx.reply('Вы не зарегистрированы в системе');
      return;
    }

    await this.chatService.sendMessageWithUser(
      car,
      {
        text: message.text,
      },
      user.id,
      'Telegram',
    );

    await ctx.reply('Сообщение отправлено');
    await ctx.scene.leave();
  }

  private getCar(ctx: Context) {
    return (ctx.scene.state as any).car as Car;
  }
}
