import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsersEntity1693823793152 implements MigrationInterface {
    name = 'UpdateUsersEntity1693823793152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying NOT NULL`);
    }

}
