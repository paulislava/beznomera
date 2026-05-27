import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LostItemInfo } from '@paulislava/shared/lost/lost.types';
import { User } from '../user/user.entity';

@Entity('lost_items')
export class LostItem extends BaseEntity implements LostItemInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: number | null;

  @JoinColumn({ name: 'created_by_id' })
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
