const SUB_KEY = 'creatororbit:user_subscriptions';
const CREATOR_KEY = 'creatororbit:creator_followers';

type StoredSubs = Record<string, string[]>;

function readRecord(key: string): StoredSubs {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as StoredSubs) : {};
  } catch {
    return {};
  }
}

function writeRecord(key: string, data: StoredSubs) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(data));
}

function uniquePush(list: string[], value: string): string[] {
  if (list.includes(value)) return list;
  return [...list, value];
}

function removeValue(list: string[], value: string): string[] {
  return list.filter((entry) => entry !== value);
}

export function getUserSubscriptions(address: string | null): string[] {
  if (!address) return [];
  const record = readRecord(SUB_KEY);
  return record[address] ?? [];
}

export function addUserSubscription(address: string, handle: string) {
  const record = readRecord(SUB_KEY);
  const current = record[address] ?? [];
  record[address] = uniquePush(current, handle);
  writeRecord(SUB_KEY, record);
}

export function removeUserSubscription(address: string, handle: string) {
  const record = readRecord(SUB_KEY);
  const current = record[address] ?? [];
  record[address] = removeValue(current, handle);
  writeRecord(SUB_KEY, record);
}

export function getCreatorFollowers(creator: string | null): string[] {
  if (!creator) return [];
  const record = readRecord(CREATOR_KEY);
  return record[creator] ?? [];
}

export function addCreatorFollower(creator: string, subscriber: string) {
  const record = readRecord(CREATOR_KEY);
  const current = record[creator] ?? [];
  record[creator] = uniquePush(current, subscriber);
  writeRecord(CREATOR_KEY, record);
}

export function removeCreatorFollower(creator: string, subscriber: string) {
  const record = readRecord(CREATOR_KEY);
  const current = record[creator] ?? [];
  record[creator] = removeValue(current, subscriber);
  writeRecord(CREATOR_KEY, record);
}

