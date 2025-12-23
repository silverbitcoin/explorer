import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    if (!hash) return NextResponse.json({ error: 'Block hash required' }, { status: 400 });

    let blockData: Record<string, unknown>;
    try {
      blockData = (await rpcClient.getBlock(hash)) as unknown as Record<string, unknown>;
    } catch {
      const heightNum = parseInt(hash);
      if (!isNaN(heightNum)) {
        blockData = (await rpcClient.getBlock(heightNum)) as unknown as Record<string, unknown>;
      } else {
        throw new Error('Invalid block hash or height');
      }
    }

    const transactions = [];
    if (blockData.tx && Array.isArray(blockData.tx)) {
      for (const txid of blockData.tx) {
        try {
          const tx = await rpcClient.getTransaction(txid as string);
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
      miner: ((blockData.coinbase as unknown as { vout?: Array<{ scriptPubKey?: { addresses?: string[] } }> })?.vout?.[0]?.scriptPubKey?.addresses?.[0]),
      reward: ((blockData.coinbase as unknown as { vout?: Array<{ value?: number }> })?.vout?.[0]?.value) || 0,
    });
  } catch (error) {
    console.error('Error fetching block:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch block' }, { status: 500 });
  }
}
