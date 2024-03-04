import { Module } from '@nestjs/common';
import { CarController } from './car.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from '../entities/car/car.entity';
import { CarService } from './car.service';
import { Call } from '../entities/call.entity';
import { TelegramModule } from '../telegram/telegram.module';
import { TelegramService } from '../telegram/telegram.service';

@Module({
  imports: [TypeOrmModule.forFeature([Car, Call]), TelegramModule],
  controllers: [CarController],
  providers: [CarService, TelegramService],
})
export class CarModule {}
