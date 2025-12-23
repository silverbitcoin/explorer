/**
 * GET /api/transactions
 * Fetch transactions with optional filtering
 * 
 * Query parameters:
 * - limit: number of transactions to fetch (default: 25, max: 100)
 * - offset: pagination offset (default: 0)
 * - blockhash: filter by block hash (optional)
 * - address: filter by address (optional)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

interface BlockData {
  tx?: string[];
}

interface TransactionData {
  txid?: string;
  blockhash?: string;
  blockindex?: number;
  time?: number;
  vout?: Array<{ value?: number }>;
  vin?: Array<{ value?: number; scriptPubKey?: { addresses?: string[] } }>;
  fee?: number;
  size?: number;
  vsize?: number;
  weight?: number;
  version?: number;
  locktime?: number;
}

interface TransactionRecord {
  txid?: string;
  blockhash?: string;
  blockindex?: number;
  amount?: number;
  fee?: number;
  confirmations?: number;
  address?: string;
  time?: number;
  vin?: Array<{ value?: number }>;
  vout?: Array<{ value?: number }>;
  size?: number;
  vsize?: number;
  weight?: number;
  version?: number;
  locktime?: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const blockhash = searchParams.get('blockhash');
    const address = searchParams.get('address');

    let transactions: TransactionData[] = [];
    let total = 0;

    if (blockhash) {
      // Fetch transactions from specific block
      try {
        const blockData = (await rpcClient.getBlock(blockhash)) as BlockData;
        total = blockData.tx?.length || 0;

        if (blockData.tx && Array.isArray(blockData.tx)) {
          const txids = blockData.tx.slice(offset, offset + limit);
          for (const txid of txids) {
            try {
              const tx = (await rpcClient.getTransaction(txid)) as TransactionData;
              transactions.push(tx);
            } catch (error) {
              console.error(`Error fetching transaction ${txid}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching block transactions:', error);
        return NextResponse.json(
          { error: 'Failed to fetch block transactions' },
          { status: 500 }
        );
      }
    } else if (address) {
      // Fetch transactions for specific address
      try {
        const txList = (await rpcClient.listTransactions('*', limit + offset)) as TransactionRecord[];
        total = txList.length;

        transactions = txList
          .slice(offset, offset + limit)
          .map((tx) => ({
            txid: tx.txid || '',
            blockhash: tx.blockhash || '',
            blockindex: tx.blockindex || 0,
            time: tx.time || 0,
            vout: tx.vout || [],
            vin: tx.vin || [],
            fee: tx.fee || 0,
            size: tx.size || 0,
            vsize: tx.vsize || 0,
            weight: tx.weight || 0,
            version: tx.version || 0,
            locktime: tx.locktime || 0,
          }));
      } catch (error) {
        console.error('Error fetching address transactions:', error);
        return NextResponse.json(
          { error: 'Failed to fetch address transactions' },
          { status: 500 }
        );
      }
    } else {
      // Fetch recent transactions from mempool and recent blocks
      try {
        const blockCount = await rpcClient.getBlockCount();
        const recentBlockHeight = Math.max(0, blockCount - 10);

        for (let height = blockCount; height >= recentBlockHeight && transactions.length < limit + offset; height--) {
          try {
            const blockHashResult = await rpcClient.getBlockHash(height);
            const blockData = (await rpcClient.getBlock(blockHashResult)) as BlockData;

            if (blockData.tx && Array.isArray(blockData.tx)) {
              for (const txid of blockData.tx) {
                if (transactions.length >= limit + offset) break;
                try {
                  const tx = (await rpcClient.getTransaction(txid)) as TransactionData;
                  transactions.push(tx);
                } catch (error) {
                  console.error(`Error fetching transaction ${txid}:`, error);
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching block at height ${height}:`, error);
          }
        }

        total = transactions.length;
        transactions = transactions.slice(offset, offset + limit);
      } catch (error) {
        console.error('Error fetching recent transactions:', error);
        return NextResponse.json(
          { error: 'Failed to fetch transactions' },
          { status: 500 }
        );
      }
    }

    const formattedTransactions = transactions.map((tx) => ({
      txid: tx.txid || '',
      blockhash: tx.blockhash || '',
      blockindex: tx.blockindex || 0,
      timestamp: tx.time || 0,
      total: tx.vout?.reduce((sum: number, out) => sum + (out.value || 0), 0) || 0,
      fee: tx.fee || 0,
      size: tx.size || 0,
      vsize: tx.vsize || 0,
      weight: tx.weight || 0,
      version: tx.version || 0,
      locktime: tx.locktime || 0,
      vin: tx.vin || [],
      vout: tx.vout || [],
      status: 'success',
      sender: tx.vin?.[0]?.scriptPubKey?.addresses?.[0],
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in transactions API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
      },
      { status: 500 }
    );
  }
}
