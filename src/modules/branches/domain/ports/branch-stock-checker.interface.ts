export interface IBranchStockChecker {
  hasActiveStock(branchId: string): Promise<boolean>;
}

export const BRANCH_STOCK_CHECKER = 'IBranchStockChecker';
