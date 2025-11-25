import { useState } from 'react';
import { JsonRPCClient, Args } from '@massalabs/massa-web3';
import { useWallet } from './useWallet';

// Contract address - update after deployment
const CONTRACT_ADDRESS = (import.meta as any).env?.VITE_CONTRACT_ADDRESS || 'AS121byc9dBwjbeREk4rzUZisFyfMkdZ1Uhtcnm6n6s5hnCX6fsHc';

export function useContract() {
  const { client, address } = useWallet();
  const [contractAddress] = useState(CONTRACT_ADDRESS);

  const callContract = async (functionName: string, args: Args): Promise<Uint8Array | null> => {
    if (!client || !address) return null;
    
    try {
      // This is a simplified version - in production you'd use proper contract calling
      // For Massa, you'd use the client to call smart contracts
      const result = await client.smartContracts().callSmartContract({
        targetAddress: contractAddress,
        functionName,
        parameter: args.serialize(),
        maxGas: BigInt(1000000),
        coins: BigInt(0),
      });
      
      return result.returnValue;
    } catch (error) {
      console.error('Contract call error:', error);
      return null;
    }
  };

  const readContract = async (functionName: string, args: Args): Promise<Uint8Array | null> => {
    if (!client) return null;
    
    try {
      const result = await client.smartContracts().readSmartContract({
        targetAddress: contractAddress,
        functionName,
        parameter: args.serialize(),
      });
      
      return result.returnValue;
    } catch (error) {
      console.error('Contract read error:', error);
      return null;
    }
  };

  return {
    contractAddress,
    callContract,
    readContract,
    client,
    address,
  };
}
