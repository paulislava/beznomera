import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'

import { UserCore } from './user-core.entity'
import { User } from './user.entity'

@Entity('user_drafts')
export class UserDraft extends UserCore {
  @Column({ name: 'user_id', nullable: true })
  userId: number | null

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User | null
}
