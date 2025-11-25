import { Args } from '@massalabs/massa-web3';

export const MAS_DECIMALS = 1_000_000_000;

export type DecodedUser = {
  address: string;
  isCreator: boolean;
  isNew: boolean;
  trialEndTimestamp: number;
  createdAt: number;
  username: string;
  bio: string;
};

export type DecodedCreator = {
  address: string;
  name: string;
  handle: string;
  bio: string;
  category: string;
  createdAt: number;
  metadataURI: string;
};

export type DecodedTier = {
  id: bigint;
  creator: string;
  name: string;
  pricePerMonth: bigint;
  metadataURI: string;
  createdAt: number;
};

export type DecodedSubscription = {
  id: bigint;
  subscriber: string;
  creator: string;
  tierId: bigint;
  isActive: boolean;
  nextPaymentTime: number;
  createdAt: number;
  totalPaid: bigint;
};

export type DecodedContent = {
  id: bigint;
  creator: string;
  tierIdRequired: bigint;
  visibility: number;
  contentCID: string;
  title: string;
  description: string;
  contentType: string;
  createdAt: number;
};

function nextBigIntToNumber(value: bigint): number {
  const asNumber = Number(value);
  return Number.isNaN(asNumber) ? 0 : asNumber;
}

export function parseUser(bytes: Uint8Array): DecodedUser {
  const args = new Args(bytes);
  return {
    address: args.nextString(),
    isCreator: args.nextBool(),
    isNew: args.nextBool(),
    trialEndTimestamp: nextBigIntToNumber(args.nextU64()),
    createdAt: nextBigIntToNumber(args.nextU64()),
    username: args.nextString(),
    bio: args.nextString(),
  };
}

export function parseCreator(bytes: Uint8Array): DecodedCreator {
  const args = new Args(bytes);
  return {
    address: args.nextString(),
    name: args.nextString(),
    handle: args.nextString(),
    bio: args.nextString(),
    category: args.nextString(),
    createdAt: nextBigIntToNumber(args.nextU64()),
    metadataURI: args.nextString(),
  };
}

export function parseTier(bytes: Uint8Array): DecodedTier {
  const args = new Args(bytes);
  return {
    id: args.nextU64(),
    creator: args.nextString(),
    name: args.nextString(),
    pricePerMonth: args.nextU64(),
    metadataURI: args.nextString(),
    createdAt: nextBigIntToNumber(args.nextU64()),
  };
}

export function parseSubscription(bytes: Uint8Array): DecodedSubscription {
  const args = new Args(bytes);
  return {
    id: args.nextU64(),
    subscriber: args.nextString(),
    creator: args.nextString(),
    tierId: args.nextU64(),
    isActive: args.nextBool(),
    nextPaymentTime: nextBigIntToNumber(args.nextU64()),
    createdAt: nextBigIntToNumber(args.nextU64()),
    totalPaid: args.nextU64(),
  };
}

export function parseContent(bytes: Uint8Array): DecodedContent {
  const args = new Args(bytes);
  return {
    id: args.nextU64(),
    creator: args.nextString(),
    tierIdRequired: args.nextU64(),
    visibility: Number(args.nextU8()),
    contentCID: args.nextString(),
    title: args.nextString(),
    description: args.nextString(),
    contentType: args.nextString(),
    createdAt: nextBigIntToNumber(args.nextU64()),
  };
}

export function parseBooleanResponse(bytes: Uint8Array | null): boolean {
  if (!bytes) return false;
  const args = new Args(bytes);
  return args.nextBool();
}

export function parseU64Response(bytes: Uint8Array | null): bigint {
  if (!bytes) return BigInt(0);
  const args = new Args(bytes);
  return args.nextU64();
}

export function parseTierList(bytes: Uint8Array | null): DecodedTier[] {
  if (!bytes) return [];
  const args = new Args(bytes);
  const total = Number(args.nextU32());
  const tiers: DecodedTier[] = [];

  for (let i = 0; i < total; i++) {
    const tierBytes = args.nextUint8Array();
    tiers.push(parseTier(tierBytes));
  }

  return tiers;
}

export function parseContentList(bytes: Uint8Array | null): DecodedContent[] {
  if (!bytes) return [];
  const args = new Args(bytes);
  const total = Number(args.nextU32());
  const contents: DecodedContent[] = [];

  for (let i = 0; i < total; i++) {
    const contentBytes = args.nextUint8Array();
    contents.push(parseContent(contentBytes));
  }

  return contents.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
}

export function parseFreeTrialCount(bytes: Uint8Array | null): number {
  if (!bytes) return 0;
  const args = new Args(bytes);
  return Number(args.nextU64());
}

export function formatMassa(value: bigint | number, fractionDigits = 2): string {
  const amount =
    typeof value === 'bigint'
      ? Number(value) / MAS_DECIMALS
      : Number(value) / MAS_DECIMALS;
  return `${amount.toFixed(fractionDigits)} MASSA`;
}

export function toCoins(amount: number): bigint {
  return BigInt(Math.round(amount * MAS_DECIMALS));
}

