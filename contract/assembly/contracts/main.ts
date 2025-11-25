// Main contract entry point - exports all functions from sub-contracts
import { Context } from '@massalabs/massa-as-sdk';

// Re-export UserRegistry functions
export {
  registerUser,
  registerCreator,
  getUser,
  getCreator,
  isInTrial,
  updateUserProfile
} from './UserRegistry';

// Re-export SubscriptionManager functions
export {
  createTier,
  getTier,
  getCreatorTiers,
  subscribe,
  cancelSubscription,
  getSubscription,
  isSubscribed,
  scheduleBilling,
  processBilling,
  withdrawEarnings,
  getVaultBalance
} from './SubscriptionManager';

// Re-export ContentRegistry functions
export {
  createContent,
  getContent,
  getCreatorContent,
  canViewContent,
  getFreeTrialCount,
  deleteContent,
  Visibility
} from './ContentRegistry';

/**
 * Constructor - called once on deployment
 * @param binaryArgs - optional initialization args
 */
export function constructor(binaryArgs: StaticArray<u8>): void {
  assert(Context.isDeployingContract());
  // Initialize contract
}
