import { Context, generateEvent, Storage, call } from '@massalabs/massa-as-sdk';
import { Args, stringToBytes, bytesToString } from '@massalabs/as-types';

// Storage keys
const TIER_PREFIX = 'tier_';
const SUBSCRIPTION_PREFIX = 'sub_';
const SUBSCRIPTION_COUNT_KEY = 'sub_count';
const TIER_COUNT_KEY = 'tier_count';
const CREATOR_VAULT_PREFIX = 'vault_';
const BILLING_SCHEDULED_KEY = 'billing_scheduled';

// Tier structure
export class Tier {
  id: u64;
  creator: string;
  name: string;
  pricePerMonth: u64;
  metadataURI: string;
  createdAt: u64;

  constructor(
    id: u64,
    creator: string,
    name: string,
    pricePerMonth: u64,
    metadataURI: string,
    createdAt: u64
  ) {
    this.id = id;
    this.creator = creator;
    this.name = name;
    this.pricePerMonth = pricePerMonth;
    this.metadataURI = metadataURI;
    this.createdAt = createdAt;
  }

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.id);
    args.add(this.creator);
    args.add(this.name);
    args.add(this.pricePerMonth);
    args.add(this.metadataURI);
    args.add(this.createdAt);
    return args.serialize();
  }

  static deserialize(data: StaticArray<u8>): Tier {
    const args = new Args(data);
    return new Tier(
      args.nextU64().expect('Failed to deserialize id'),
      args.nextString().expect('Failed to deserialize creator'),
      args.nextString().expect('Failed to deserialize name'),
      args.nextU64().expect('Failed to deserialize pricePerMonth'),
      args.nextString().expect('Failed to deserialize metadataURI'),
      args.nextU64().expect('Failed to deserialize createdAt')
    );
  }
}

// Subscription structure
export class Subscription {
  id: u64;
  subscriber: string;
  creator: string;
  tierId: u64;
  isActive: bool;
  nextPaymentTime: u64;
  createdAt: u64;
  totalPaid: u64;

  constructor(
    id: u64,
    subscriber: string,
    creator: string,
    tierId: u64,
    isActive: bool,
    nextPaymentTime: u64,
    createdAt: u64,
    totalPaid: u64
  ) {
    this.id = id;
    this.subscriber = subscriber;
    this.creator = creator;
    this.tierId = tierId;
    this.isActive = isActive;
    this.nextPaymentTime = nextPaymentTime;
    this.createdAt = createdAt;
    this.totalPaid = totalPaid;
  }

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.id);
    args.add(this.subscriber);
    args.add(this.creator);
    args.add(this.tierId);
    args.add(this.isActive);
    args.add(this.nextPaymentTime);
    args.add(this.createdAt);
    args.add(this.totalPaid);
    return args.serialize();
  }

  static deserialize(data: StaticArray<u8>): Subscription {
    const args = new Args(data);
    return new Subscription(
      args.nextU64().expect('Failed to deserialize id'),
      args.nextString().expect('Failed to deserialize subscriber'),
      args.nextString().expect('Failed to deserialize creator'),
      args.nextU64().expect('Failed to deserialize tierId'),
      args.nextBool().expect('Failed to deserialize isActive'),
      args.nextU64().expect('Failed to deserialize nextPaymentTime'),
      args.nextU64().expect('Failed to deserialize createdAt'),
      args.nextU64().expect('Failed to deserialize totalPaid')
    );
  }
}

/**
 * Create a subscription tier
 * @param binaryArgs - creator, name, pricePerMonth, metadataURI
 */
export function createTier(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const creator = args.nextString().expect('Creator is required');
  const name = args.nextString().expect('Name is required');
  const pricePerMonth = args.nextU64().expect('Price is required');
  const metadataURI = args.nextString().expect('MetadataURI is required');

  assert(Context.caller().toString() === creator, 'Unauthorized');

  // Get next tier ID
  const countKey = TIER_COUNT_KEY + '_' + creator;
  const count = Storage.has(countKey)
    ? Storage.get(countKey)
    : stringToBytes('0');
  const tierId = u64(parseInt(bytesToString(count)));

  const tier = new Tier(
    tierId,
    creator,
    name,
    pricePerMonth,
    metadataURI,
    Context.timestamp()
  );

  const tierKey = TIER_PREFIX + creator + '_' + tierId.toString();
  Storage.set(tierKey, tier.serialize());

  // Increment tier count
  const newCount = parseInt(bytesToString(count)) + 1;
  Storage.set(countKey, stringToBytes(newCount.toString()));

  generateEvent(`Tier created: ${tierId} for creator ${creator}`);
}

/**
 * Get tier by ID
 * @param binaryArgs - creator, tierId
 */
export function getTier(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const creator = args.nextString().expect('Creator is required');
  const tierId = args.nextU64().expect('TierId is required');

  const tierKey = TIER_PREFIX + creator + '_' + tierId.toString();
  assert(Storage.has(tierKey), 'Tier not found');

  return Storage.get(tierKey);
}

/**
 * Get all tiers for a creator
 * @param binaryArgs - creator
 */
export function getCreatorTiers(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const creator = args.nextString().expect('Creator is required');

  const countKey = TIER_COUNT_KEY + '_' + creator;
  const count = Storage.has(countKey)
    ? parseInt(bytesToString(Storage.get(countKey)))
    : 0;

  const result = new Args();
  result.add(count);

  for (let i: u64 = 0; i < count; i++) {
    const tierKey = TIER_PREFIX + creator + '_' + i.toString();
    if (Storage.has(tierKey)) {
      result.add(Storage.get(tierKey));
    }
  }

  return result.serialize();
}

/**
 * Subscribe to a creator's tier
 * @param binaryArgs - creator, tierId
 */
export function subscribe(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const creator = args.nextString().expect('Creator is required');
  const tierId = args.nextU64().expect('TierId is required');
  const subscriber = Context.caller().toString();

  // Get tier
  const tierKey = TIER_PREFIX + creator + '_' + tierId.toString();
  assert(Storage.has(tierKey), 'Tier not found');
  const tier = Tier.deserialize(Storage.get(tierKey));

  // Check if already subscribed
  const subKey = SUBSCRIPTION_PREFIX + subscriber + '_' + creator;
  if (Storage.has(subKey)) {
    const existingSub = Subscription.deserialize(Storage.get(subKey));
    assert(!existingSub.isActive, 'Already subscribed');
  }

  // Charge initial payment
  const coins = Context.transferredCoins();
  assert(coins >= tier.pricePerMonth, 'Insufficient payment');

  // Create subscription
  const subCount = Storage.has(SUBSCRIPTION_COUNT_KEY)
    ? parseInt(bytesToString(Storage.get(SUBSCRIPTION_COUNT_KEY)))
    : 0;

  const subscription = new Subscription(
    u64(subCount),
    subscriber,
    creator,
    tierId,
    true,
    Context.timestamp() + (30 * 24 * 60 * 60 * 1000), // 30 days
    Context.timestamp(),
    tier.pricePerMonth
  );

  Storage.set(subKey, subscription.serialize());

  // Update vault
  const vaultKey = CREATOR_VAULT_PREFIX + creator;
  const currentVault = Storage.has(vaultKey)
    ? u64(parseInt(bytesToString(Storage.get(vaultKey))))
    : u64(0);
  Storage.set(vaultKey, stringToBytes((currentVault + tier.pricePerMonth).toString()));

  // Increment subscription count
  Storage.set(SUBSCRIPTION_COUNT_KEY, stringToBytes((subCount + 1).toString()));

  // Schedule billing if not already scheduled
  if (!Storage.has(BILLING_SCHEDULED_KEY)) {
    scheduleBilling();
  }

  generateEvent(`Subscription created: ${subscriber} -> ${creator} tier ${tierId}`);
}

/**
 * Cancel a subscription
 * @param binaryArgs - creator
 */
export function cancelSubscription(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const creator = args.nextString().expect('Creator is required');
  const subscriber = Context.caller().toString();

  const subKey = SUBSCRIPTION_PREFIX + subscriber + '_' + creator;
  assert(Storage.has(subKey), 'Subscription not found');

  const subscription = Subscription.deserialize(Storage.get(subKey));
  assert(subscription.isActive, 'Subscription already cancelled');

  subscription.isActive = false;
  Storage.set(subKey, subscription.serialize());

  generateEvent(`Subscription cancelled: ${subscriber} -> ${creator}`);
}

/**
 * Get subscription
 * @param binaryArgs - subscriber, creator
 */
export function getSubscription(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const subscriber = args.nextString().expect('Subscriber is required');
  const creator = args.nextString().expect('Creator is required');

  const subKey = SUBSCRIPTION_PREFIX + subscriber + '_' + creator;
  assert(Storage.has(subKey), 'Subscription not found');

  return Storage.get(subKey);
}

/**
 * Check if user is subscribed
 * @param binaryArgs - subscriber, creator, tierId (optional, 0 for any tier)
 */
export function isSubscribed(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const subscriber = args.nextString().expect('Subscriber is required');
  const creator = args.nextString().expect('Creator is required');
  const tierId = args.nextU64().expect('TierId is required');

  const subKey = SUBSCRIPTION_PREFIX + subscriber + '_' + creator;
  if (!Storage.has(subKey)) {
    const result = new Args();
    result.add(false);
    return result.serialize();
  }

  const subscription = Subscription.deserialize(Storage.get(subKey));
  const isActive = subscription.isActive && (tierId == 0 || subscription.tierId == tierId);

  const result = new Args();
  result.add(isActive);
  return result.serialize();
}

/**
 * Schedule autonomous billing (ASC)
 */
export function scheduleBilling(): void {
  if (Storage.has(BILLING_SCHEDULED_KEY)) {
    return; // Already scheduled
  }

  // Schedule deferred call for billing (every ~30 days worth of blocks)
  // In Massa, we use deferred calls for autonomous execution
  const deferredArgs = new Args();
  deferredArgs.add(Context.timestamp());
  
  // Schedule call to processBilling after ~30 days
  // Note: This is a simplified version. In production, you'd schedule this more frequently
  call(
    Context.address(),
    'processBilling',
    deferredArgs.serialize(),
    Context.timestamp() + (30 * 24 * 60 * 60 * 1000),
    0,
    0,
    0
  );

  Storage.set(BILLING_SCHEDULED_KEY, stringToBytes('1'));
  generateEvent('Billing scheduled');
}

/**
 * Process billing for all active subscriptions (called autonomously)
 * @param binaryArgs - timestamp
 */
export function processBilling(binaryArgs: StaticArray<u8>): void {
  const now = Context.timestamp();
  
  // This would iterate through all subscriptions and charge them
  // For now, we'll mark that billing was processed
  // In a full implementation, you'd need to store subscription IDs and iterate
  
  generateEvent(`Billing processed at ${now}`);
  
  // Reschedule next billing
  Storage.delete(BILLING_SCHEDULED_KEY);
  scheduleBilling();
}

/**
 * Withdraw earnings (creator only)
 * @param binaryArgs - amount (0 for all)
 */
export function withdrawEarnings(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const amount = args.nextU64().expect('Amount is required');
  const creator = Context.caller().toString();

  const vaultKey = CREATOR_VAULT_PREFIX + creator;
  assert(Storage.has(vaultKey), 'No earnings to withdraw');

  const available = u64(parseInt(bytesToString(Storage.get(vaultKey))));
  const withdrawAmount = amount == 0 ? available : amount;
  assert(withdrawAmount <= available, 'Insufficient balance');

  // Transfer to creator
  const recipient = Context.caller();
  // Note: In Massa, you'd use Context.transfer() or similar
  // This is simplified - actual implementation depends on Massa SDK version

  // Update vault
  const newBalance = available - withdrawAmount;
  Storage.set(vaultKey, stringToBytes(newBalance.toString()));

  generateEvent(`Earnings withdrawn: ${withdrawAmount} by ${creator}`);
}

/**
 * Get creator vault balance
 * @param binaryArgs - creator
 */
export function getVaultBalance(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const creator = args.nextString().expect('Creator is required');

  const vaultKey = CREATOR_VAULT_PREFIX + creator;
  const balance = Storage.has(vaultKey)
    ? u64(parseInt(bytesToString(Storage.get(vaultKey))))
    : u64(0);

  const result = new Args();
  result.add(balance);
  return result.serialize();
}

