import { BrandInfo } from '@paulislava/shared/car/car.types';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Brand extends BaseEntity implements BrandInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  slug: string;
}
