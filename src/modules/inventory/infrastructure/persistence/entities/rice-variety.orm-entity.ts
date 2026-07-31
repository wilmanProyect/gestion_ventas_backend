import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('rice_varieties')
export class RiceVarietyOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
