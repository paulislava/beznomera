import { Column, Entity } from 'typeorm'

import { UserCore } from './user-core.entity'

@Entity('users')
export class User extends UserCore {
  @Column({ default: 0 })
  money: number

  @Column({ default: 0 })
  bonuses: number
}
