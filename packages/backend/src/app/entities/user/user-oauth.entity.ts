import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OAuthProvider } from '@paulislava/shared/auth/auth.types';

import { User } from './user.entity';

@Entity('user_oauth')
@Index(['provider', 'providerUserId'], { unique: true })
export class UserOAuth extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: OAuthProvider })
  provider: OAuthProvider;

  @Column({ name: 'provider_user_id' })
  providerUserId: string;

  @Column({ nullable: true })
  email: string | null;

  @Column({ nullable: true, name: 'display_name' })
  displayName: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
