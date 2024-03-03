import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { UserCore } from './user-core.entity';
import { User } from './user.entity';

@Entity('user_drafts')
export class UserDraft extends UserCore {
  @Column({ nullable: true })
  userId: number | null;

  @OneToOne(() => User)
  @JoinColumn()
  user: User | null;
}
