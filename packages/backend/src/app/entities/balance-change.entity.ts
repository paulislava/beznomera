import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PayableService } from './payable-service.entity';
import { User } from './user/user.entity';

@Entity('balance_changes')
export class BalanceChange extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'user_id' })
  userId: number;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User)
  user: User;

  @Column({ default: 0 })
  summ: number;

  @Column({ name: 'bonus_summ', default: 0 })
  bonusSumm: number;

  @Column('varchar', { nullable: true })
  description: string | null;

  @Column('varchar', { name: 'payable_service_id', nullable: true })
  payableServiceId: string | null;

  @JoinColumn({ name: 'payable_service_id' })
  @ManyToOne(() => PayableService)
  payableService: PayableService | null;

  @CreateDateColumn()
  readonly date: Date;
}
