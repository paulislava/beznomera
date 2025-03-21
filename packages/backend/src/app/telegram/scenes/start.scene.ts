import { Scene, SceneEnter, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from '../../entities/car/car.entity';
import { isTextMessage } from '../../../common/utils/telegram';

@Scene('start')
export class StartScene {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: Context) {
    const message = ctx.message;
    if (isTextMessage(message) && message.text.startsWith('/start message:')) {
      const code = message.text.replace('/start message:', '');
      const car = await this.carRepository.findOne({
        where: { code },
        relations: ['owner'],
      });

      if (car) {
        await ctx.reply(`Сообщение для водителя автомобиля ${car.no}:`);
      } else {
        await ctx.reply('Автомобиль не найден');
      }
    } else {
      await ctx.reply('Добро пожаловать!');
    }
  }
} 