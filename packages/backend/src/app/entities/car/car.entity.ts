import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { User } from '../user/user.entity';
import { randomUUID } from 'crypto';
import { Brand } from './brand.entity';
import { Color } from './color.entity';
import { CarInfo, RgbColor } from '@paulislava/shared/car/car.types';

@Entity('cars')
export class Car extends BaseEntity implements CarInfo {
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

  @ManyToOne(() => Color)
  color: Maybe<Color>;

  @Column({ nullable: true, type: 'jsonb' })
  rawColor: RgbColor;

  @Column({ default: randomUUID() })
  code: string;
}
