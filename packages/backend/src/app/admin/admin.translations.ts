import { LocaleTranslations, LocaleTranslationsBlock } from 'adminjs'

import { PayableService } from '../entities/payable-service.entity'
import { UserDraft } from '../entities/user/user-draft.entity'
import { User } from '../entities/user/user.entity'

import { ResourceTranslations, entityTranslations } from './admin.translations.types'

const properties: Record<string, string> = {
  firstName: 'Имя',
  lastName: 'Фамилия',
  organizationId: 'Клиника',
  email: 'E-mail',
  tel: 'Телефон',
  createdAt: 'Дата создания',
  bonuses: 'Бонусы',
  userId: 'Пользователь',
  from: 'От',
  to: 'До',
  id: 'ID'
}

const labels: Record<string, string> = {}

const userTranslations: ResourceTranslations<User> = {
  name: 'Пользователи',
  properties: {
    money: 'Баланс'
  }
}

const userDraftTranslations: ResourceTranslations<UserDraft> = {
  name: 'Приглашения пользователей',
  properties: {}
}

const payableServiceTranslations: ResourceTranslations<PayableService> = {
  name: 'Платные услуги',
  properties: {}
}

const resources: { [key: string]: Partial<LocaleTranslationsBlock> } = {
  ...entityTranslations(User, userTranslations),
  ...entityTranslations(PayableService, payableServiceTranslations),
  ...entityTranslations(UserDraft, userDraftTranslations)
}

export const adminTranslations: LocaleTranslations = {
  resources,
  properties,
  labels
}
