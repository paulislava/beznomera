import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { Car } from '../car/car.entity';
import { LocationInfo } from '@paulislava/shared/car/car.types';
import { User } from '../user/user.entity';
@Entity()
export class ChatMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chatId: number;

  @ManyToOne(() => Chat)
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column({ type: 'text' })
  text: string;

  @Column({ nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true })
  user?: User;

  @ManyToOne(() => Car)
  car?: Car;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  telegramId: number | null;

  @ManyToOne(() => ChatMessage, { nullable: true })
  forwardedMessage?: ChatMessage;

  @Column({ type: 'jsonb', nullable: true })
  location?: LocationInfo;
}
