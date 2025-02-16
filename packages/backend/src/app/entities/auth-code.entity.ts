import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
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

  @Column({ nullable: true })
  userId: number | null;

  @ManyToOne(() => User)
  user: User | null;

  @Column({ nullable: true })
  userDraftId: number | null;

  @ManyToOne(() => UserDraft)
  userDraft: UserDraft | null;

  @CreateDateColumn()
  readonly createdAt: Date;

  @Column('timestamp', { nullable: true })
  closedAt: Date | null;

  @Column({ default: false })
  closed: boolean;
}
