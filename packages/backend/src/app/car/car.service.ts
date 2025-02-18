import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '../entities/car/car.entity';
import { Repository } from 'typeorm';
import { CarInfo, ShortCarInfo } from '@paulislava/shared/car/car.types';
import { Call } from '../entities/call.entity';
import { TelegramService } from '../telegram/telegram.service';
import { RequestUser } from '../users/user.types';
import { CarCallBody } from '@paulislava/shared/car/car.api';
import { Agent } from 'useragent';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore cannot find module?
import { lookup } from 'ip-location-api';
import { CALL_TIMEOUT_S } from '~/constants';
import { CallNeedTimeoutException } from './car.exceptions';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
    @InjectRepository(Call) private readonly callRepository: Repository<Call>,
    @Inject(TelegramService) private readonly telegramService: TelegramService,
  ) {}

  async getInfo(code: string): Promise<CarInfo> {
    const {
      id,
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
      id,
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

  async call(
    code: string,
    { coords }: CarCallBody,
    userAgent: Agent,
    ip: string,
  ): Promise<void> {
    const { id, no, owner } = await this.carRepository.findOneOrFail({
      where: { code },
      relations: ['owner'],
    });

    const lastCall = await this.callRepository.findOne({
      where: { car: { id }, ip },
      order: { date: 'DESC' },
    });

    if (
      lastCall &&
      (new Date().getTime() - lastCall.date.getTime()) / 1000 < CALL_TIMEOUT_S
    ) {
      throw new CallNeedTimeoutException(id);
    }

    let text = `${no}: позвали водителя.\nОтправлено из: ${userAgent.family}, ${userAgent.os.family}`;

    const ipInfo = await lookup(ip);
    if (ipInfo?.city) {
      text += `\n${ipInfo.city}, ${ipInfo.region1_name}${ipInfo.region2_name && `, ${ipInfo.region2_name}`}, ${ipInfo.country_name}`;
    }

    await this.callRepository.save({ car: { id }, ip });

    const message = await this.telegramService.sendMessage(text, owner);

    if (coords) {
      await this.telegramService.sendLocation(coords, owner, {
        reply_to_message_id: message.message_id,
      });
    }
  }

  async list({ userId }: RequestUser): Promise<ShortCarInfo[]> {
    const cars = await this.carRepository.findBy({
      owner: { id: userId },
    });

    return cars;
  }
}
