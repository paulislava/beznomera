import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Car } from './car/car.entity';

@Entity()
export class Call extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Car, { onDelete: 'SET NULL' })
  car?: Car;

  @CreateDateColumn()
  date: Date;

  @Column()
  ip: string;
}
