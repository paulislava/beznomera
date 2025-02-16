import { ColorInfo, RgbColor } from '@paulislava/shared/car/car.types';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Color extends BaseEntity implements ColorInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'jsonb' })
  value: RgbColor;
}
