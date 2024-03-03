import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { User } from '../user/user.entity';

@Entity()
export class Car extends BaseEntity {
  @PrimaryColumn()
  no: string;

  @ManyToOne(() => User)
  owner: User;

  @Column()
  brand: string | null;

  @Column()
  model: string | null;

  @Column()
  version: string | null;

  @Column()
  year: number | null;

  @Column()
  code: string;
}
