import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBranchesAndMigrateLots1724000000000 implements MigrationInterface {
  name = 'CreateBranchesAndMigrateLots1724000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create branches table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      )
    `);

    // 2. Create conditional unique index
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_active_branch_name 
      ON branches (name) 
      WHERE deleted_at IS NULL
    `);

    // 3. Add column branch_id to inventory_lots as nullable initially
    await queryRunner.query(`
      ALTER TABLE inventory_lots 
      ADD COLUMN IF NOT EXISTS branch_id UUID NULL
    `);

    // 4. Backfill logic: Determine branch for migration
    const existingBranches = await queryRunner.query(`SELECT id FROM branches LIMIT 1`);
    let defaultBranchId: string;

    if (existingBranches.length === 0) {
      // Create a default "Sucursal Principal"
      defaultBranchId = 'da2c1df5-0d0b-486c-85a0-e5bf397ee482'; // static deterministic UUID
      await queryRunner.query(`
        INSERT INTO branches (id, name, address, is_active, created_at, updated_at)
        VALUES ('${defaultBranchId}', 'Sucursal Principal', 'Matriz', true, NOW(), NOW())
      `);
      console.log('🌱 Migración: Creada Sucursal Principal por defecto.');
    } else {
      defaultBranchId = existingBranches[0].id;
      console.log(`🌱 Migración: Usando sucursal existente (ID: ${defaultBranchId}) para migrar lotes.`);
    }

    // 5. Update existing lots pointing to default branch
    await queryRunner.query(`
      UPDATE inventory_lots 
      SET branch_id = '${defaultBranchId}' 
      WHERE branch_id IS NULL
    `);

    // 6. Alter branch_id to NOT NULL
    await queryRunner.query(`
      ALTER TABLE inventory_lots 
      ALTER COLUMN branch_id SET NOT NULL
    `);

    // 7. Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE inventory_lots 
      ADD CONSTRAINT fk_inventory_lots_branch 
      FOREIGN KEY (branch_id) 
      REFERENCES branches (id) 
      ON DELETE RESTRICT
    `);

    // 8. Create index on inventory_lots(branch_id)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_inventory_lots_branch_id 
      ON inventory_lots (branch_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_inventory_lots_branch_id`);
    await queryRunner.query(`ALTER TABLE inventory_lots DROP CONSTRAINT IF EXISTS fk_inventory_lots_branch`);
    await queryRunner.query(`ALTER TABLE inventory_lots DROP COLUMN IF EXISTS branch_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS unique_active_branch_name`);
    await queryRunner.query(`DROP TABLE IF EXISTS branches`);
  }
}
