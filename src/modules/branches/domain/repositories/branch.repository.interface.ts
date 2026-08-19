import { Branch } from '../models/branch.model';

export interface IBranchRepository {
  save(branch: Branch): Promise<void>;
  findById(id: string): Promise<Branch | null>;
  findAll(): Promise<Branch[]>;
  softDelete(id: string): Promise<void>;
  findActiveByName(name: string): Promise<Branch | null>;
}

export const BRANCH_REPOSITORY = 'IBranchRepository';
