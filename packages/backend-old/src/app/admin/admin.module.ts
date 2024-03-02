import { dirname, resolve } from 'path'
import { copyFileSync, existsSync, unlinkSync, promises } from 'fs'

import { AdminModule } from '@adminjs/nestjs'
import { Database, Resource } from '@adminjs/typeorm'
import uploadFileFeature, { BaseProvider } from '@adminjs/upload'
import { Module } from '@nestjs/common'
import AdminJS, { ActionContext, CurrentAdmin, UploadedFile } from 'adminjs'

import { AuthModule } from '../auth/auth.module'
import { AuthService } from '../auth/auth.service'
import { AdminUser } from '../entities/admin-user.entity'
import { BalanceChange } from '../entities/balance-change.entity'
import { Organization } from '../entities/organization.entity'
import { PayableService } from '../entities/payable-service.entity'
import { PaymentOption } from '../entities/payment-option.entity'
import { Payment } from '../entities/payment.entity'
import { UserDraft } from '../entities/user/user-draft.entity'
import { User } from '../entities/user/user.entity'

import { adminTranslations } from './admin.translations'

import { assetUrl } from '~/common/utils/assetUrl'
import { ASSETS_FILE_PATH } from '~/constants'
import { prefixPath } from '~/common/utils/prefixPath'

AdminJS.registerAdapter({ Database, Resource })

export class UploadProvider extends BaseProvider {
  assetPath: string

  constructor(bucket: string, assetPath: string) {
    super(bucket)

    this.assetPath = resolve(ASSETS_FILE_PATH, assetPath)
  }

  async upload(file: UploadedFile, key: string, context: ActionContext): Promise<any> {
    const fullPath = resolve(this.assetPath, key)
    const dirPath = dirname(fullPath)

    if (!existsSync(dirPath)) {
      await promises.mkdir(dirPath, { recursive: true })
    }
    copyFileSync(file.path, fullPath)
    unlinkSync(file.path)
    return key
  }

  async delete(key: string, bucket: string, context: ActionContext): Promise<any> {
    const filePath = resolve(this.assetPath, key)

    if (existsSync(filePath)) {
      await promises.unlink(filePath)
    }
  }

  path(key: string, bucket: string, context: ActionContext): Promise<string> | string {
    return assetUrl(`${bucket}/${key}`)
  }
}

@Module({
  imports: [
    AuthModule,
    AdminModule.createAdminAsync({
      imports: [AuthModule],
      inject: [AuthService],
      useFactory: (authService: AuthService) => {
        return {
          adminJsOptions: {
            rootPath: prefixPath('/admin'),
            loginPath: prefixPath('/admin/login'),
            logoutPath: prefixPath('/admin/logout'),
            resources: [
              User,
              UserDraft,
              {
                resource: Organization,
                properties: {},
                features: [
                  uploadFileFeature({
                    provider: new UploadProvider('organizations', 'organizations'),
                    properties: {
                      key: 'logoPath',
                      mimeType: 'image/*'
                    }
                  })
                ]
              },
              BalanceChange,
              PayableService,
              PaymentOption,
              Payment,
              AdminUser
            ],
            locale: {
              language: 'ru',
              translations: adminTranslations
            }
          },
          auth: {
            authenticate: (email: string, password: string): Promise<CurrentAdmin | null> => {
              return authService.authAdmin(email, password)
            },
            cookieName: 'test',
            cookiePassword: 'testPass'
          }
        }
      }
    })
  ]
})
export class AppAdminModule {}
