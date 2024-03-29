import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsername1693828915013 implements MigrationInterface {
    name = 'AddUsername1693828915013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    }

}
