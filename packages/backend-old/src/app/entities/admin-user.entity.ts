import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('admin_users')
export class AdminUser extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column()
  email: string

  @Column()
  title: string

  @Column({ name: 'password_hash' })
  passwordHash: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Column('timestamp', { nullable: true, name: 'authorized_at' })
  authorizedAt: Date | null
}
