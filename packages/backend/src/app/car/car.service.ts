import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '../entities/car/car.entity';
import { Repository } from 'typeorm';
import { CarInfo } from '@paulislava/shared/car/car.types';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
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
}
