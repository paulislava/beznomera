import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PushSubscription } from '../entities/push-subscription.entity';
import { Car } from '../entities/car/car.entity';
import { CarDriver } from '../entities/car/car-driver.entity';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushSubscription, Car, CarDriver]),
    ConfigModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
