import { Controller, UseGuards, UseFilters, Inject } from '@nestjs/common';
import {
  DefaultAdminController,
  DefaultAdminSite,
  DefaultAdminNunjucksEnvironment,
  injectionTokens,
} from 'nestjs-admin';
import type { AdminEntity } from 'nestjs-admin';
import { EntityManager } from 'typeorm';
// Guard и Filter не экспортируются из nestjs-admin
/* eslint-disable @typescript-eslint/no-require-imports */
const { AdminGuard } = require('nestjs-admin/dist/src/adminCore/admin.guard');
const { AdminFilter } = require('nestjs-admin/dist/src/adminAuth/admin.filter');
/* eslint-enable @typescript-eslint/no-require-imports */

/**
 * Контроллер админки, совместимый с TypeORM 0.3+.
 * nestjs-admin использует устаревший API findOneOrFail(entity, id, options),
 * в TypeORM 0.3 требуется findOneOrFail(entity, { where, relations }).
 */
@Controller('admin')
@UseGuards(AdminGuard)
@UseFilters(AdminFilter)
export class TypeOrmCompatibleAdminController extends DefaultAdminController {
  protected readonly em: EntityManager;

  constructor(
    @Inject(injectionTokens.ADMIN_SITE)
    adminSite: DefaultAdminSite,
    @Inject(injectionTokens.ADMIN_ENVIRONMENT)
    env: DefaultAdminNunjucksEnvironment,
    entityManager: EntityManager,
  ) {
    super(adminSite, env, entityManager);
    this.em = entityManager;
  }

  /**
   * Переопределение для TypeORM 0.3: передаём where в options.
   */
  async getEntityWithRelations(
    adminEntity: AdminEntity,
    primaryKey: number | string | Record<string, unknown>,
  ): Promise<object> {
    const metadata = adminEntity.metadata;
    const relations = metadata.relations.map((r) => r.propertyName);
    const where =
      typeof primaryKey === 'object' &&
      primaryKey !== null &&
      !Array.isArray(primaryKey)
        ? (primaryKey as Record<string, unknown>)
        : { [metadata.primaryColumns[0].propertyName]: primaryKey };

    return this.em.findOneOrFail(adminEntity.entity as never, {
      where,
      relations,
    });
  }
}
