import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBranchRepository } from '../../../domain/repositories/branch.repository.interface';
import { Branch } from '../../../domain/models/branch.model';
import { BranchOrmEntity } from '../entities/branch.orm-entity';
import { BranchMapper } from '../mappers/branch.mapper';

@Injectable()
export class BranchTypeormRepository implements IBranchRepository {
  constructor(
    @InjectRepository(BranchOrmEntity)
    private readonly repository: Repository<BranchOrmEntity>,
  ) {}

  async save(branch: Branch): Promise<void> {
    const ormEntity = BranchMapper.toOrm(branch);
    await this.repository.save(ormEntity);
  }

  async findById(id: string): Promise<Branch | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? BranchMapper.toDomain(ormEntity) : null;
  }

  async findAll(): Promise<Branch[]> {
    const entities = await this.repository.find();
    return entities.map(entity => BranchMapper.toDomain(entity));
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findActiveByName(name: string): Promise<Branch | null> {
    // TypeORM's default queries filter out soft-deleted entities automatically.
    const ormEntity = await this.repository.findOne({
      where: { name: name.trim() },
    });
    return ormEntity ? BranchMapper.toDomain(ormEntity) : null;
  }
}
