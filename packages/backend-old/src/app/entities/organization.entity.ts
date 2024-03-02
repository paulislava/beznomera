import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('organizations')
export class Organization extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column()
  name: string

  @Column('varchar', { name: 'logo_path', nullable: true })
  logoPath: string | null

  @CreateDateColumn({ name: 'created_at' })
  readonly createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
