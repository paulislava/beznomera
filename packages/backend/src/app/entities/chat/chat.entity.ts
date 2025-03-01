import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnonymousUser } from '../user/anonymous-user.entity';
import { User } from '../user/user.entity';
import { ChatMessage } from './message.entity';

@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  reciever: User;

  @ManyToOne(() => User)
  sender?: User;

  @ManyToOne(() => AnonymousUser)
  anonymousSender?: AnonymousUser;

  @OneToMany(() => ChatMessage, (message) => message.chat)
  messages: ChatMessage[];

  @CreateDateColumn()
  createdAt: Date;
}
