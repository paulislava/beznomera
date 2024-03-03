import { Column, Entity, OneToMany } from 'typeorm';

import { UserCore } from './user-core.entity';
import { Car } from '../car/car.entity';

@Entity('users')
export class User extends UserCore {
  @Column({ default: 0 })
  money: number;

  @Column({ default: 0 })
  bonuses: number;

  @OneToMany(() => Car, (car) => car.owner)
  cars: Car[];
}
