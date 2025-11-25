import { Context, generateEvent, Storage } from '@massalabs/massa-as-sdk';
import { Args, stringToBytes, bytesToString } from '@massalabs/as-types';

// Storage keys
const USER_PREFIX = 'user_';
const CREATOR_PREFIX = 'creator_';
const USER_COUNT_KEY = 'user_count';
const CREATOR_COUNT_KEY = 'creator_count';

// User profile structure
export class User {
  address: string;
  isCreator: bool;
  isNew: bool;
  trialEndTimestamp: u64;
  createdAt: u64;
  username: string;
  bio: string;

  constructor(
    address: string,
    isCreator: bool,
    isNew: bool,
    trialEndTimestamp: u64,
    createdAt: u64,
    username: string,
    bio: string
  ) {
    this.address = address;
    this.isCreator = isCreator;
    this.isNew = isNew;
    this.trialEndTimestamp = trialEndTimestamp;
    this.createdAt = createdAt;
    this.username = username;
    this.bio = bio;
  }

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.address);
    args.add(this.isCreator);
    args.add(this.isNew);
    args.add(this.trialEndTimestamp);
    args.add(this.createdAt);
    args.add(this.username);
    args.add(this.bio);
    return args.serialize();
  }

  static deserialize(data: StaticArray<u8>): User {
    const args = new Args(data);
    return new User(
      args.nextString().expect('Failed to deserialize address'),
      args.nextBool().expect('Failed to deserialize isCreator'),
      args.nextBool().expect('Failed to deserialize isNew'),
      args.nextU64().expect('Failed to deserialize trialEndTimestamp'),
      args.nextU64().expect('Failed to deserialize createdAt'),
      args.nextString().expect('Failed to deserialize username'),
      args.nextString().expect('Failed to deserialize bio')
    );
  }
}

// Creator profile structure
export class CreatorProfile {
  address: string;
  name: string;
  handle: string;
  bio: string;
  category: string;
  createdAt: u64;
  metadataURI: string;

  constructor(
    address: string,
    name: string,
    handle: string,
    bio: string,
    category: string,
    createdAt: u64,
    metadataURI: string
  ) {
    this.address = address;
    this.name = name;
    this.handle = handle;
    this.bio = bio;
    this.category = category;
    this.createdAt = createdAt;
    this.metadataURI = metadataURI;
  }

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.address);
    args.add(this.name);
    args.add(this.handle);
    args.add(this.bio);
    args.add(this.category);
    args.add(this.createdAt);
    args.add(this.metadataURI);
    return args.serialize();
  }

  static deserialize(data: StaticArray<u8>): CreatorProfile {
    const args = new Args(data);
    return new CreatorProfile(
      args.nextString().expect('Failed to deserialize address'),
      args.nextString().expect('Failed to deserialize name'),
      args.nextString().expect('Failed to deserialize handle'),
      args.nextString().expect('Failed to deserialize bio'),
      args.nextString().expect('Failed to deserialize category'),
      args.nextU64().expect('Failed to deserialize createdAt'),
      args.nextString().expect('Failed to deserialize metadataURI')
    );
  }
}

/**
 * Register a new user
 * @param binaryArgs - address, username, bio
 */
export function registerUser(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('Address is required');
  const username = args.nextString().expect('Username is required');
  const bio = args.nextString().expect('Bio is required');

  const userKey = USER_PREFIX + address;
  assert(!Storage.has(userKey), 'User already exists');

  const now = Context.timestamp();
  const trialEnd = now + (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

  const user = new User(
    address,
    false, // isCreator
    true,  // isNew
    trialEnd,
    now,
    username,
    bio
  );

  Storage.set(userKey, user.serialize());
  
  // Increment user count
  const count = Storage.has(USER_COUNT_KEY) 
    ? Storage.get(USER_COUNT_KEY) 
    : stringToBytes('0');
  const countNum = parseInt(bytesToString(count));
  Storage.set(USER_COUNT_KEY, stringToBytes((countNum + 1).toString()));

  generateEvent(`User registered: ${address}`);
}

/**
 * Register as a creator
 * @param binaryArgs - address, name, handle, bio, category, metadataURI
 */
export function registerCreator(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('Address is required');
  const name = args.nextString().expect('Name is required');
  const handle = args.nextString().expect('Handle is required');
  const bio = args.nextString().expect('Bio is required');
  const category = args.nextString().expect('Category is required');
  const metadataURI = args.nextString().expect('MetadataURI is required');

  // Check if user exists
  const userKey = USER_PREFIX + address;
  assert(Storage.has(userKey), 'User must be registered first');

  // Check if handle is already taken
  const handleKey = 'handle_' + handle;
  assert(!Storage.has(handleKey), 'Handle already taken');

  // Update user to creator
  const userData = Storage.get(userKey);
  const user = User.deserialize(userData);
  user.isCreator = true;
  Storage.set(userKey, user.serialize());

  // Create creator profile
  const creator = new CreatorProfile(
    address,
    name,
    handle,
    bio,
    category,
    Context.timestamp(),
    metadataURI
  );

  const creatorKey = CREATOR_PREFIX + address;
  Storage.set(creatorKey, creator.serialize());
  Storage.set(handleKey, stringToBytes(address)); // Map handle to address

  // Increment creator count
  const count = Storage.has(CREATOR_COUNT_KEY)
    ? Storage.get(CREATOR_COUNT_KEY)
    : stringToBytes('0');
  const countNum = parseInt(bytesToString(count));
  Storage.set(CREATOR_COUNT_KEY, stringToBytes((countNum + 1).toString()));

  generateEvent(`Creator registered: ${address} with handle ${handle}`);
}

/**
 * Get user profile
 * @param binaryArgs - address
 */
export function getUser(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('Address is required');
  
  const userKey = USER_PREFIX + address;
  assert(Storage.has(userKey), 'User not found');
  
  return Storage.get(userKey);
}

/**
 * Get creator profile
 * @param binaryArgs - address or handle
 */
export function getCreator(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const identifier = args.nextString().expect('Address or handle is required');
  
  let address = identifier;
  
  // If it's a handle, resolve to address
  const handleKey = 'handle_' + identifier;
  if (Storage.has(handleKey)) {
    address = bytesToString(Storage.get(handleKey));
  }
  
  const creatorKey = CREATOR_PREFIX + address;
  assert(Storage.has(creatorKey), 'Creator not found');
  
  return Storage.get(creatorKey);
}

/**
 * Check if user is in trial period
 * @param binaryArgs - address
 */
export function isInTrial(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('Address is required');
  
  const userKey = USER_PREFIX + address;
  assert(Storage.has(userKey), 'User not found');
  
  const userData = Storage.get(userKey);
  const user = User.deserialize(userData);
  const now = Context.timestamp();
  
  const inTrial = user.isNew && now < user.trialEndTimestamp;
  const result = new Args();
  result.add(inTrial);
  return result.serialize();
}

/**
 * Update user profile
 * @param binaryArgs - address, username, bio
 */
export function updateUserProfile(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('Address is required');
  const username = args.nextString().expect('Username is required');
  const bio = args.nextString().expect('Bio is required');

  assert(Context.caller().toString() === address, 'Unauthorized');

  const userKey = USER_PREFIX + address;
  assert(Storage.has(userKey), 'User not found');

  const userData = Storage.get(userKey);
  const user = User.deserialize(userData);
  user.username = username;
  user.bio = bio;
  user.isNew = false; // Mark as no longer new after first update

  Storage.set(userKey, user.serialize());
  generateEvent(`User profile updated: ${address}`);
}

