import {
  BaseEntity,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { Organization } from '../organization.entity'

export abstract class UserCore extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column('varchar', { name: 'first_name', nullable: true })
  firstName: string | null

  @Column('varchar', { name: 'last_name', nullable: true })
  lastName: string | null

  @Column('varchar', { nullable: true })
  email: string | null

  @Column('varchar', { nullable: true })
  tel: string | null

  @Column({ name: 'organization_id' })
  organizationId: number

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @CreateDateColumn({ name: 'created_at' })
  readonly createdAt: Date
}
