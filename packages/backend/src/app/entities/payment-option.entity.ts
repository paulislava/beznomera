import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Organization } from './organization.entity';

@Entity('payments_options')
export class PaymentOption extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  summ: number;

  @Column('numeric', { name: 'bonus_percent', nullable: true })
  bonusPercent: number | null;

  @Column('numeric', { name: 'bonus_summ', nullable: true })
  bonusSumm: number | null;

  @Column({ default: false })
  recommended: boolean;

  @Column({ name: 'organization_id' })
  organizationId: number;

  @JoinColumn({ name: 'organization_id' })
  @ManyToOne(() => Organization)
  organization: Organization;
}
