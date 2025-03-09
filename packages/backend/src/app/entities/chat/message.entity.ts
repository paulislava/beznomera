import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { MessageSource } from '@paulislava/shared/chat/chat.types';
import { Car } from '../car/car.entity';
import { LocationInfo } from '@paulislava/shared/car/car.types';

@Entity()
export class ChatMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat)
  chat: Chat;

  @Column({ type: 'text' })
  text: string;

  @Column()
  source: MessageSource;

  @ManyToOne(() => Car)
  car?: Car;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  location?: LocationInfo;
}
