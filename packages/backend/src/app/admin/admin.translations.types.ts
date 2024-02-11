import { LocaleTranslationsBlock } from 'adminjs'
import { BaseEntity, ObjectType } from 'typeorm'

export type ResourcePropertiesTranslations<T extends BaseEntity> = Partial<
  {
    [key in keyof T]: string
  }
>

export interface ResourceTranslations<T extends BaseEntity> {
  name?: string
  properties?: ResourcePropertiesTranslations<T>
}

export const entityTranslations = <T extends BaseEntity>(
  entity: ObjectType<T>,
  translations: ResourceTranslations<T>
): Record<string, LocaleTranslationsBlock> => {
  const properties = translations.properties
    ? Object.fromEntries(
        Object.keys(translations.properties).map(key => [
          key,
          (translations.properties as Record<string, string>)[key] ?? ''
        ])
      )
    : {}

  return {
    [entity.name]: {
      properties,
      labels: {
        ...(translations.name ? { [entity.name]: translations.name } : {})
      },
      actions: {},
      buttons: {},
      messages: {}
    }
  }
}
