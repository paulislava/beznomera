import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '../entities/car/car.entity';
import { Repository } from 'typeorm';
import { CarInfo, ShortCarInfo } from '@paulislava/shared/car/car.types';
import { Call } from '../entities/call.entity';
import { TelegramService } from '../telegram/telegram.service';
import { RequestUser } from '../users/user.types';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
    @InjectRepository(Call) private readonly callRepository: Repository<Call>,
    @Inject(TelegramService) private readonly telegramService: TelegramService,
  ) {}

  async getInfo(code: string): Promise<CarInfo> {
    const {
      no,
      model,
      brand,
      brandRaw,
      year,
      version,
      color,
      owner,
      rawColor,
    } = await this.carRepository.findOneOrFail({
      where: { code },
      relations: ['owner', 'brand', 'color'],
    });

    return {
      no,
      brand,
      brandRaw,
      model,
      year,
      version,
      color,
      rawColor,
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

  async list({ userId }: RequestUser): Promise<ShortCarInfo[]> {
    const cars = await this.carRepository.findBy({
      owner: { id: userId },
    });

    return cars;
  }
}
