import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Car } from './car.entity';
import { User } from '../user/user.entity';

@Entity('car_drivers')
export class CarDriver extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Car, { onDelete: 'CASCADE' })
  car: Car;

  @Column()
  carId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  driver: User;

  @Column()
  driverId: number;

  @Column({ default: false })
  isOwner: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 