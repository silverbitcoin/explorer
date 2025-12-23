import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const blockCount = await rpcClient.getBlockCount();
    const transactions = [];
    const recentBlockHeight = Math.max(0, blockCount - 10);

    for (let height = blockCount; height >= recentBlockHeight && transactions.length < limit + offset; height--) {
      try {
        const blockHash = await rpcClient.getBlockHash(height);
        const blockData = (await rpcClient.getBlock(blockHash)) as unknown as { tx?: string[] };

        if (blockData.tx && Array.isArray(blockData.tx)) {
          for (const txid of blockData.tx) {
            if (transactions.length >= limit + offset) break;
            try {
              const tx = await rpcClient.getTransaction(txid);
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

    return NextResponse.json({
      transactions: transactions.slice(offset, offset + limit),
      pagination: { total: transactions.length, limit, offset, pages: Math.ceil(transactions.length / limit) },
    });
  } catch (error) {
    console.error('Error in transactions API:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch transactions' }, { status: 500 });
  }
}
