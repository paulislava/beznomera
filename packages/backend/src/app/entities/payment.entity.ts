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

import { User } from './user/user.entity';

export enum PaymentStatus {
  CREATED = 'created',
  PROCESS = 'process',
  SUCCESS = 'success',
  FAIL = 'fail',
}

@Entity('payments')
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @CreateDateColumn({ name: 'created_at' })
  readonly createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  readonly updatedAt: Date;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  summ: number;

  @Column({ default: 0, name: 'bonus_summ' })
  bonusSumm: number;

  @Column({ default: PaymentStatus.CREATED })
  status: PaymentStatus;
}
