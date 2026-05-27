import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { LostItem } from './lost-item.entity';

@Entity('loss_events')
export class LossEvent extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ name: 'item_id' })
  itemId: number;

  @JoinColumn({ name: 'item_id' })
  @ManyToOne(() => LostItem)
  item: LostItem;

  @CreateDateColumn()
  createdAt: Date;
}
