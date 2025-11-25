import { Storage } from '@massalabs/massa-as-sdk';
import { Args, stringToBytes } from '@massalabs/as-types';

/**
 * Utility helpers to keep storage interactions type-safe.
 */
export function storageKey(label: string): StaticArray<u8> {
  return stringToBytes(label);
}

export function writeU64(key: string, value: u64): void {
  const serializer = new Args();
  serializer.add(value);
  Storage.set<StaticArray<u8>>(storageKey(key), serializer.serialize());
}

export function readU64(key: string): u64 {
  const k = storageKey(key);
  if (!Storage.has<StaticArray<u8>>(k)) {
    return 0;
  }
  const data = Storage.get<StaticArray<u8>>(k);
  const deser = new Args(data);
  return deser.nextU64().expect('Failed to deserialize u64');
}

export function writeBytes(key: string, value: StaticArray<u8>): void {
  Storage.set<StaticArray<u8>>(storageKey(key), value);
}

export function readBytes(key: string): StaticArray<u8> {
  return Storage.get<StaticArray<u8>>(storageKey(key));
}

export function hasBytes(key: string): bool {
  return Storage.has<StaticArray<u8>>(storageKey(key));
}

export function deleteBytes(key: string): void {
  Storage.del<StaticArray<u8>>(storageKey(key));
}

