import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class UserCore extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ nullable: true })
  firstName: string | null;

  @Column({ nullable: true })
  lastName: string | null;

  @Column({ nullable: true })
  email: string | null;

  @Column({ nullable: true })
  tel: string | null;

  @Column({ nullable: true, unique: true })
  telegramID: number | null;

  @Column()
  nickname: string | null;

  @CreateDateColumn({ name: 'created_at' })
  readonly createdAt: Date;
}
