import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../user/user.entity';
import { LostItem } from './lost-item.entity';

@Entity('lost_shortcut_tokens')
@Unique(['userId', 'itemId'])
export class LostShortcutToken extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  token: string;

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
