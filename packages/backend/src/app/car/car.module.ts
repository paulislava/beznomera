import { Module } from '@nestjs/common';
import { CarController } from './car.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from '../entities/car/car.entity';
import { CarService } from './car.service';
import { Call } from '../entities/call.entity';
import { AnonymousUser } from '../entities/user/anonymous-user.entity';
import { User } from '../entities/user/user.entity';
import { Chat } from '../entities/chat/chat.entity';
import { ChatMessage } from '../entities/chat/message.entity';
import { ConfigModule } from '../config/config.module';
import { ChatModule } from '../chat/chat.module';
import { Brand } from '../entities/car/brand.entity';
import { Model } from '../entities/car/model.entity';
import { CarDriver } from '../entities/car/car-driver.entity';
import { CarRating } from '../entities/car/car-rating.entity';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Car,
      Call,
      AnonymousUser,
      User,
      Brand,
      Model,
      Chat,
      ChatMessage,
      CarDriver,
      CarRating,
    ]),
    ConfigModule,
    ChatModule,
    UserModule,
  ],
  controllers: [CarController],
  providers: [CarService],
  exports: [CarService],
})
export class CarModule {}
