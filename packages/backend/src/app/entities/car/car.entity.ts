import {
  BaseEntity,
  Column,
  Entity,
  Generated,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { User } from '../user/user.entity';
import { randomUUID } from 'crypto';
import { Brand } from './brand.entity';

@Entity('cars')
export class Car extends BaseEntity {
  @PrimaryColumn()
  no: string;

  @Column({ nullable: true })
  title: string | null;

  @ManyToOne(() => User)
  owner: User;

  @ManyToOne(() => Brand)
  brand: Brand | null;

  @Column({ nullable: true })
  brandRaw: string | null;

  @Column({ nullable: true })
  model: string | null;

  @Column({ nullable: true })
  version: string | null;

  @Column({ nullable: true })
  year: number | null;

  @Column({ nullable: true })
  color: string | null;

  @Column({ default: randomUUID() })
  code: string;
}
