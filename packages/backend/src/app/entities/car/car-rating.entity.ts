import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { Car } from './car.entity';
import { User } from '../user/user.entity';

@Entity('car_ratings')
@Unique(['carId', 'userId'])
@Index(['carId'])
@Index(['userId'])
export class CarRating extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Car, { onDelete: 'CASCADE' })
  car: Car;

  @Column()
  carId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

