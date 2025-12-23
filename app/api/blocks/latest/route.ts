import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const blockCount = await rpcClient.getBlockCount();
    const blocks = [];
    const startHeight = Math.max(0, blockCount - offset - 1);
    const endHeight = Math.max(0, startHeight - limit + 1);

    for (let height = startHeight; height >= endHeight; height--) {
      try {
        const blockHash = await rpcClient.getBlockHash(height);
        const blockData = (await rpcClient.getBlock(blockHash)) as unknown as Record<string, unknown>;
        
        blocks.push({
          hash: (blockData.hash as string) || blockHash,
          height: (blockData.height as number) || height,
          timestamp: (blockData.time as number) || 0,
          txs: (blockData.tx as string[]) || [],
          difficulty: (blockData.difficulty as number) || 0,
          merkle: (blockData.merkleroot as string) || '',
          prev_hash: (blockData.previousblockhash as string) || '',
          next_hash: blockData.nextblockhash as string | undefined,
          miner_address: ((((blockData.coinbase as unknown as { vout?: Array<{ scriptPubKey?: { addresses?: string[] } }> })?.vout?.[0]?.scriptPubKey?.addresses?.[0]) || undefined)),
          block_reward: ((blockData.coinbase as unknown as { vout?: Array<{ value?: number }> })?.vout?.[0]?.value) || 0,
          size: (blockData.size as number) || 0,
          nonce: (blockData.nonce as number) || 0,
          bits: (blockData.bits as string) || '',
          confirmations: (blockData.confirmations as number) || 0,
          total: ((blockData.tx as string[])?.length || 0),
        });
      } catch (error) {
        console.error(`Error fetching block at height ${height}:`, error);
        continue;
      }
    }

    return NextResponse.json({
      blocks,
      pagination: {
        total: blockCount,
        limit,
        offset,
        pages: Math.ceil(blockCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching latest blocks:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch blocks',
      },
      { status: 500 }
    );
  }
}
