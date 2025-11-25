import { useState } from 'react';
import { JsonRPCClient, Args } from '@massalabs/massa-web3';
import { useWallet } from './useWallet';

const CONTRACT_ADDRESS =
  (import.meta as any).env?.VITE_CONTRACT_ADDRESS ||
  'AS1Q7xPV7EjGVLRw1JAeJo52JYUaJfhDgf7Yk4EMMZVT4k6F6jcZ';

const DEFAULT_MAX_GAS = BigInt(5_000_000);

export function useContract() {
  const { client, account, address } = useWallet();
  const [contractAddress] = useState(CONTRACT_ADDRESS);

  const readContract = async (
    functionName: string,
    args: Args,
    caller?: string,
  ): Promise<Uint8Array | null> => {
    if (!client) return null;

    try {
      const result = await client.executeReadOnlyCall({
        target: contractAddress,
        func: functionName,
        parameter: args.serialize(),
        caller: caller ?? address ?? contractAddress,
        maxGas: DEFAULT_MAX_GAS,
      });

      return result.value;
    } catch (error) {
      console.error('Contract read error:', error);
      return null;
    }
  };

  const callContract = async (
    functionName: string,
    args: Args,
    coins: bigint = 0n,
    maxGas: bigint = DEFAULT_MAX_GAS,
    fee: bigint = 0n,
  ) => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    try {
      return await account.callSC(
        contractAddress,
        functionName,
        args.serialize(),
        coins,
        fee,
        maxGas,
      );
    } catch (error) {
      console.error('Contract execution error:', error);
      throw error;
    }
  };

  return {
    contractAddress,
    callContract,
    readContract,
    client: client ?? JsonRPCClient.buildnet(),
    address,
  };
}
