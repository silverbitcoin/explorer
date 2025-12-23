/**
 * GET /api/search
 * Search for blocks, transactions, or addresses
 * 
 * Query parameters:
 * - q: search query (required)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

interface BlockResult {
  height?: number;
  hash?: string;
  time?: number;
  tx?: string[];
}

interface TransactionResult {
  txid?: string;
  blockhash?: string;
  time?: number;
  confirmations?: number;
}

interface AddressValidation {
  isvalid: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: 'Search query must be at least 3 characters' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    const results: Record<string, unknown[]> = {
      blocks: [],
      transactions: [],
      addresses: [],
    };

    // Check if it's a number (block height)
    if (/^\d+$/.test(trimmedQuery)) {
      try {
        const height = parseInt(trimmedQuery);
        const blockHash = await rpcClient.getBlockHash(height);
        const block = (await rpcClient.getBlock(blockHash)) as BlockResult;
        results.blocks.push({
          height: block.height,
          hash: block.hash,
          timestamp: block.time,
          txcount: block.tx?.length || 0,
        });
      } catch (error) {
        console.error('Error searching for block height:', error);
      }
    }

    // Check if it's a 64-char hex string (hash or txid)
    if (/^[a-f0-9]{64}$/i.test(trimmedQuery)) {
      // Try as block hash
      try {
        const block = (await rpcClient.getBlock(trimmedQuery)) as BlockResult;
        results.blocks.push({
          height: block.height,
          hash: block.hash,
          timestamp: block.time,
          txcount: block.tx?.length || 0,
        });
      } catch (error) {
        console.error('Error searching for block hash:', error);
      }

      // Try as transaction ID
      try {
        const tx = (await rpcClient.getTransaction(trimmedQuery)) as TransactionResult;
        results.transactions.push({
          txid: tx.txid,
          blockhash: tx.blockhash,
          time: tx.time,
          confirmations: tx.confirmations,
        });
      } catch (error) {
        console.error('Error searching for transaction:', error);
      }
    }

    // Try as address
    try {
      const validation = (await rpcClient.validateAddress(trimmedQuery)) as unknown as AddressValidation;
      if (validation.isvalid) {
        const balance = await rpcClient.getReceivedByAddress(trimmedQuery, 0);
        results.addresses.push({
          address: trimmedQuery,
          balance,
          isvalid: true,
        });
      }
    } catch (error) {
      console.error('Error validating address:', error);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Search failed',
      },
      { status: 500 }
    );
  }
}
