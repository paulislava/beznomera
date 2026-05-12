import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatMessengerFields1747051200000 implements MigrationInterface {
  name = 'ChatMessengerFields1747051200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chat" ADD "contactType" character varying`);
    await queryRunner.query(`ALTER TABLE "chat" ADD "contactValue" character varying`);
    await queryRunner.query(`ALTER TABLE "chat_message" ADD "attachmentUrl" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chat_message" DROP COLUMN "attachmentUrl"`);
    await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "contactValue"`);
    await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "contactType"`);
  }
}
