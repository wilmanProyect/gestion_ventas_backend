import { Branch } from '../../../domain/models/branch.model';
import { BranchOrmEntity } from '../entities/branch.orm-entity';

export class BranchMapper {
  static toDomain(ormEntity: BranchOrmEntity): Branch {
    return new Branch(
      ormEntity.id,
      ormEntity.name,
      ormEntity.address,
      ormEntity.isActive,
      ormEntity.deletedAt,
    );
  }

  static toOrm(domainModel: Branch): BranchOrmEntity {
    const ormEntity = new BranchOrmEntity();
    ormEntity.id = domainModel.getId();
    ormEntity.name = domainModel.getName();
    ormEntity.address = domainModel.getAddress();
    ormEntity.isActive = domainModel.getIsActive();
    ormEntity.deletedAt = domainModel.getDeletedAt();
    return ormEntity;
  }
}
