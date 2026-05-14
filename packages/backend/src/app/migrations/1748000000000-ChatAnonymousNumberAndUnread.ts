import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatAnonymousNumberAndUnread1748000000000
  implements MigrationInterface
{
  name = 'ChatAnonymousNumberAndUnread1748000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH ranked AS (
        SELECT id, "reciever_id",
          ROW_NUMBER() OVER (
            PARTITION BY "reciever_id"
            ORDER BY "created_at"
          ) AS rn
        FROM chat
        WHERE "sender_id" IS NULL AND "anonymous_sender_id" IS NOT NULL
      )
      UPDATE chat SET "anonymous_number" = ranked.rn
      FROM ranked WHERE chat.id = ranked.id
    `);
  }

  public async down(): Promise<void> {}
}
