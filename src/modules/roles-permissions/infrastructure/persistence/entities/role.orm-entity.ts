import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, DeleteDateColumn, Index } from 'typeorm';
import { PermissionOrmEntity } from './permission.orm-entity';

@Entity('roles')
@Index('unique_active_role_name', ['name'], { unique: true, where: '"deleted_at" IS NULL' })
export class RoleOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @ManyToMany(() => PermissionOrmEntity, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: PermissionOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
