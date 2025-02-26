import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnonymousUser } from '../user/anonymous-user.entity';
import { User } from '../user/user.entity';

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

  @CreateDateColumn()
  createdAt: Date;
}
