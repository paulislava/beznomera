import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '../entities/car/car.entity';
import { Repository } from 'typeorm';
import { CarInfo } from '@paulislava/shared/car/car.types';
import { Call } from '../entities/call.entity';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
    @InjectRepository(Call) private readonly callRepository: Repository<Call>,
    @Inject(TelegramService) private readonly telegramService: TelegramService,
  ) {}

  async getInfo(code: string): Promise<CarInfo> {
    const { no, model, brand, year, version, color, owner } =
      await this.carRepository.findOneOrFail({
        where: { code },
        relations: ['owner'],
      });

    return {
      no,
      brand,
      model,
      year,
      version,
      color,
      owner: {
        firstName: owner.firstName,
        lastName: owner.lastName,
        nickname: owner.nickname,
      },
    };
  }

  async call(code: string): Promise<void> {
    const { no, owner } = await this.carRepository.findOneOrFail({
      where: { code },
      relations: ['owner'],
    });

    await this.telegramService.sendMessage(`${no}: позвали водителя`, owner);
  }
}
