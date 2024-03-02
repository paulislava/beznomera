import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AuthMode } from '../auth/auth.types';

import { UserDraft } from './user/user-draft.entity';
import { User } from './user/user.entity';

@Entity('auth_codes')
export class AuthCode extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  identifier: string;

  @Column({ name: 'auth_mode' })
  authMode: AuthMode;

  @Column()
  code: string;

  @Column({ name: 'user_id', nullable: true })
  userId: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'user_draft_id', nullable: true })
  userDraftId: number | null;

  @ManyToOne(() => UserDraft)
  @JoinColumn({ name: 'user_draft_id' })
  userDraft: UserDraft | null;

  @CreateDateColumn({ name: 'created_at' })
  readonly createdAt: Date;

  @Column('timestamp', { name: 'closed_at', nullable: true })
  closedAt: Date | null;

  @Column({ default: false })
  closed: boolean;
}
