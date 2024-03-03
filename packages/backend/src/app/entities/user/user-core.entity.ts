import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class UserCore extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column('varchar', { name: 'first_name', nullable: true })
  firstName: string | null;

  @Column('varchar', { name: 'last_name', nullable: true })
  lastName: string | null;

  @Column()
  email: string | null;

  @Column()
  tel: string | null;

  @Column('numeric', { name: 'telegram_id', nullable: true })
  telegramID: number | null;

  @Column()
  nickname: string | null;

  @CreateDateColumn({ name: 'created_at' })
  readonly createdAt: Date;
}
