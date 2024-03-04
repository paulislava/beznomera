import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Car } from './car/car.entity';

@Entity('calls')
export class Call extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Car)
  car: Car;

  @CreateDateColumn()
  date: Date;
}
