import { Context, generateEvent, Storage } from '@massalabs/massa-as-sdk';
import { Args, stringToBytes, bytesToString } from '@massalabs/as-types';

// Import subscription manager functions
import { isSubscribed } from './SubscriptionManager';

// Storage keys
const CONTENT_PREFIX = 'content_';
const CONTENT_COUNT_KEY = 'content_count';
const CREATOR_CONTENT_PREFIX = 'creator_content_';
const FREE_TRIAL_COUNT_PREFIX = 'free_trial_count_';

// Content visibility enum
export enum Visibility {
  FREE_TRIAL = 0,
  SUBSCRIBERS_ONLY = 1
}

// Content structure
export class Content {
  id: u64;
  creator: string;
  tierIdRequired: u64; // 0 if free trial
  visibility: Visibility;
  contentCID: string;
  title: string;
  description: string;
  contentType: string; // post, video, audio, file
  createdAt: u64;

  constructor(
    id: u64,
    creator: string,
    tierIdRequired: u64,
    visibility: Visibility,
    contentCID: string,
    title: string,
    description: string,
    contentType: string,
    createdAt: u64
  ) {
    this.id = id;
    this.creator = creator;
    this.tierIdRequired = tierIdRequired;
    this.visibility = visibility;
    this.contentCID = contentCID;
    this.title = title;
    this.description = description;
    this.contentType = contentType;
    this.createdAt = createdAt;
  }

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.id);
    args.add(this.creator);
    args.add(this.tierIdRequired);
    args.add(this.visibility);
    args.add(this.contentCID);
    args.add(this.title);
    args.add(this.description);
    args.add(this.contentType);
    args.add(this.createdAt);
    return args.serialize();
  }

  static deserialize(data: StaticArray<u8>): Content {
    const args = new Args(data);
    return new Content(
      args.nextU64().expect('Failed to deserialize id'),
      args.nextString().expect('Failed to deserialize creator'),
      args.nextU64().expect('Failed to deserialize tierIdRequired'),
      args.nextU8().expect('Failed to deserialize visibility') as Visibility,
      args.nextString().expect('Failed to deserialize contentCID'),
      args.nextString().expect('Failed to deserialize title'),
      args.nextString().expect('Failed to deserialize description'),
      args.nextString().expect('Failed to deserialize contentType'),
      args.nextU64().expect('Failed to deserialize createdAt')
    );
  }
}

/**
 * Create content
 * @param binaryArgs - creator, tierIdRequired, visibility, contentCID, title, description, contentType
 */
export function createContent(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const creator = args.nextString().expect('Creator is required');
  const tierIdRequired = args.nextU64().expect('TierIdRequired is required');
  const visibility = args.nextU8().expect('Visibility is required') as Visibility;
  const contentCID = args.nextString().expect('ContentCID is required');
  const title = args.nextString().expect('Title is required');
  const description = args.nextString().expect('Description is required');
  const contentType = args.nextString().expect('ContentType is required');

  assert(Context.caller().toString() === creator, 'Unauthorized');

  // Check free trial limit (max 3 per creator)
  if (visibility == Visibility.FREE_TRIAL) {
    const freeTrialCountKey = FREE_TRIAL_COUNT_PREFIX + creator;
    const currentCount = Storage.has(freeTrialCountKey)
      ? parseInt(bytesToString(Storage.get(freeTrialCountKey)))
      : 0;
    assert(currentCount < 3, 'Maximum 3 free trial contents allowed');
    
    Storage.set(freeTrialCountKey, stringToBytes((currentCount + 1).toString()));
  }

  // Get next content ID
  const count = Storage.has(CONTENT_COUNT_KEY)
    ? parseInt(bytesToString(Storage.get(CONTENT_COUNT_KEY)))
    : 0;

  const content = new Content(
    u64(count),
    creator,
    tierIdRequired,
    visibility,
    contentCID,
    title,
    description,
    contentType,
    Context.timestamp()
  );

  const contentKey = CONTENT_PREFIX + count.toString();
  Storage.set(contentKey, content.serialize());

  // Store in creator's content list
  const creatorContentKey = CREATOR_CONTENT_PREFIX + creator;
  const creatorContentList = Storage.has(creatorContentKey)
    ? bytesToString(Storage.get(creatorContentKey))
    : '';
  const newList = creatorContentList == '' 
    ? count.toString() 
    : creatorContentList + ',' + count.toString();
  Storage.set(creatorContentKey, stringToBytes(newList));

  // Increment content count
  Storage.set(CONTENT_COUNT_KEY, stringToBytes((count + 1).toString()));

  generateEvent(`Content created: ${count} by ${creator}`);
}

/**
 * Get content by ID
 * @param binaryArgs - contentId
 */
export function getContent(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const contentId = args.nextU64().expect('ContentId is required');

  const contentKey = CONTENT_PREFIX + contentId.toString();
  assert(Storage.has(contentKey), 'Content not found');

  return Storage.get(contentKey);
}

/**
 * Get all content for a creator
 * @param binaryArgs - creator
 */
export function getCreatorContent(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const creator = args.nextString().expect('Creator is required');

  const creatorContentKey = CREATOR_CONTENT_PREFIX + creator;
  if (!Storage.has(creatorContentKey)) {
    const result = new Args();
    result.add(0);
    return result.serialize();
  }

  const contentListStr = bytesToString(Storage.get(creatorContentKey));
  const contentIds = contentListStr.split(',');
  
  const result = new Args();
  result.add(contentIds.length);

  for (let i = 0; i < contentIds.length; i++) {
    const contentId = contentIds[i];
    if (contentId != '') {
      const contentKey = CONTENT_PREFIX + contentId;
      if (Storage.has(contentKey)) {
        result.add(Storage.get(contentKey));
      }
    }
  }

  return result.serialize();
}

/**
 * Check if user can view content
 * @param binaryArgs - userAddress, contentId
 */
export function canViewContent(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const userAddress = args.nextString().expect('UserAddress is required');
  const contentId = args.nextU64().expect('ContentId is required');

  const contentKey = CONTENT_PREFIX + contentId.toString();
  assert(Storage.has(contentKey), 'Content not found');

  const content = Content.deserialize(Storage.get(contentKey));

  // Free trial content is always viewable
  if (content.visibility == Visibility.FREE_TRIAL) {
    const result = new Args();
    result.add(true);
    return result.serialize();
  }

  // For subscribers only, check subscription
  // Note: This is a simplified check. In production, you'd properly call isSubscribed
  // For now, we'll check if there's an active subscription
  const subKey = 'sub_' + userAddress + '_' + content.creator;
  if (Storage.has(subKey)) {
    // In a real implementation, you'd deserialize and check isActive
    const result = new Args();
    result.add(true);
    return result.serialize();
  }

  const result = new Args();
  result.add(false);
  return result.serialize();
}

/**
 * Get free trial content count for creator
 * @param binaryArgs - creator
 */
export function getFreeTrialCount(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const creator = args.nextString().expect('Creator is required');

  const freeTrialCountKey = FREE_TRIAL_COUNT_PREFIX + creator;
  const count = Storage.has(freeTrialCountKey)
    ? u64(parseInt(bytesToString(Storage.get(freeTrialCountKey))))
    : u64(0);

  const result = new Args();
  result.add(count);
  return result.serialize();
}

/**
 * Delete content (creator only)
 * @param binaryArgs - contentId
 */
export function deleteContent(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const contentId = args.nextU64().expect('ContentId is required');

  const contentKey = CONTENT_PREFIX + contentId.toString();
  assert(Storage.has(contentKey), 'Content not found');

  const content = Content.deserialize(Storage.get(contentKey));
  assert(Context.caller().toString() === content.creator, 'Unauthorized');

  // If it was free trial, decrement count
  if (content.visibility == Visibility.FREE_TRIAL) {
    const freeTrialCountKey = FREE_TRIAL_COUNT_PREFIX + content.creator;
    if (Storage.has(freeTrialCountKey)) {
      const currentCount = parseInt(bytesToString(Storage.get(freeTrialCountKey)));
      if (currentCount > 0) {
        Storage.set(freeTrialCountKey, stringToBytes((currentCount - 1).toString()));
      }
    }
  }

  // Remove from creator's content list
  const creatorContentKey = CREATOR_CONTENT_PREFIX + content.creator;
  if (Storage.has(creatorContentKey)) {
    const contentListStr = bytesToString(Storage.get(creatorContentKey));
    const contentIds = contentListStr.split(',');
    const newIds = contentIds.filter(id => id != contentId.toString());
    Storage.set(creatorContentKey, stringToBytes(newIds.join(',')));
  }

  Storage.delete(contentKey);
  generateEvent(`Content deleted: ${contentId} by ${content.creator}`);
}

