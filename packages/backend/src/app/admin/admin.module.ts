import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DefaultAdminSite,
  AdminCoreModuleFactory,
  AdminUserEntity,
} from 'nestjs-admin';
import { TypeOrmCompatibleAdminController } from './typeorm-compatible-admin.controller';
// AdminUserModule не экспортируется из nestjs-admin
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  AdminUserModule,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
} = require('nestjs-admin/dist/src/adminUser/adminUser.module');
import { User } from '../entities/user/user.entity';
import { Car } from '../entities/car/car.entity';
import { Brand } from '../entities/car/brand.entity';
import { Model } from '../entities/car/model.entity';
import { Color } from '../entities/car/color.entity';

const AdminCoreModule = AdminCoreModuleFactory.createAdminCoreModule({
  adminController: TypeOrmCompatibleAdminController,
});

@Module({
  imports: [
    AdminCoreModule,
    AdminUserModule,
    TypeOrmModule.forFeature([User, Car, Brand, Model, Color]),
  ],
})
export class AdminModule {
  constructor(private readonly adminSite: DefaultAdminSite) {
    adminSite.register('Administration', AdminUserEntity);
    adminSite.register('Пользователи', User);
    adminSite.register('Автомобили', Car);
    adminSite.register('Бренды', Brand);
    adminSite.register('Модели', Model);
    adminSite.register('Цвета', Color);
  }
}
