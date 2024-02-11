import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Organization } from './organization.entity'

@Entity('payable_services')
// Платная услуга
export class PayableService extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string

  @Column()
  name: string

  @Column('varchar', { nullable: true })
  description: string | null

  @Column({ default: 0 })
  summ: number

  @Column({ name: 'organization_id' })
  organizationId: string

  @JoinColumn({ name: 'organization_id' })
  @ManyToOne(() => Organization)
  organization: Organization
}
