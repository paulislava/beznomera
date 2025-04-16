import { BrandInfo } from '@paulislava/shared/car/car.types';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Model } from './model.entity';

@Entity()
export class Brand extends BaseEntity implements BrandInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  logoUrl: string | null;

  @Column({ nullable: true })
  logoUrlColored: string | null;

  @OneToMany(() => Model, (model) => model.brand)
  models: Model[];
}
