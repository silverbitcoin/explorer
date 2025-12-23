/**
 * GET /api/blocks/[hash]
 * Fetch a specific block by hash or height
 */

import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

interface BlockData {
  hash?: string;
  height?: number;
  time?: number;
  difficulty?: number;
  merkleroot?: string;
  previousblockhash?: string;
  nextblockhash?: string;
  nonce?: number;
  bits?: string;
  size?: number;
  weight?: number;
  version?: number;
  confirmations?: number;
  tx?: string[];
  coinbase?: {
    vout?: Array<{
      scriptPubKey?: {
        addresses?: string[];
      };
      value?: number;
    }>;
  };
}

interface Transaction {
  txid?: string;
  blockhash?: string;
  blockindex?: number;
  time?: number;
  vout?: Array<{ value?: number }>;
  vin?: Array<{ value?: number }>;
  fee?: number;
  size?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;

    if (!hash) {
      return NextResponse.json(
        { error: 'Block hash or height is required' },
        { status: 400 }
      );
    }

    // Try to fetch as hash or height
    let blockData: BlockData;
    try {
      blockData = (await rpcClient.getBlock(hash)) as BlockData;
    } catch (error) {
      // Try as height if hash fails
      const heightNum = parseInt(hash);
      if (!isNaN(heightNum)) {
        blockData = (await rpcClient.getBlock(heightNum)) as BlockData;
      } else {
        throw error;
      }
    }

    // Fetch all transactions in the block
    const transactions: Transaction[] = [];
    if (blockData.tx && Array.isArray(blockData.tx)) {
      for (const txid of blockData.tx) {
        try {
          const tx = (await rpcClient.getTransaction(txid)) as Transaction;
          transactions.push(tx);
        } catch (error) {
          console.error(`Error fetching transaction ${txid}:`, error);
        }
      }
    }

    return NextResponse.json({
      hash: blockData.hash || hash,
      height: blockData.height,
      timestamp: blockData.time,
      difficulty: blockData.difficulty,
      merkleroot: blockData.merkleroot,
      previousblockhash: blockData.previousblockhash,
      nextblockhash: blockData.nextblockhash,
      nonce: blockData.nonce,
      bits: blockData.bits,
      size: blockData.size,
      weight: blockData.weight,
      version: blockData.version,
      confirmations: blockData.confirmations,
      transactions: transactions.length,
      txs: transactions,
      miner: blockData.coinbase?.vout?.[0]?.scriptPubKey?.addresses?.[0],
      reward: blockData.coinbase?.vout?.[0]?.value || 0,
    });
  } catch (error) {
    console.error('Error fetching block:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch block',
      },
      { status: 500 }
    );
  }
}
