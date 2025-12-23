import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 3) return NextResponse.json({ error: 'Query must be at least 3 characters' }, { status: 400 });

    const trimmedQuery = query.trim();
    const results: Record<string, unknown[]> = { blocks: [], transactions: [], addresses: [] };

    if (/^\d+$/.test(trimmedQuery)) {
      try {
        const height = parseInt(trimmedQuery);
        const blockHash = await rpcClient.getBlockHash(height);
        const block = (await rpcClient.getBlock(blockHash)) as unknown as { height?: number; hash?: string; time?: number; tx?: string[] };
        results.blocks.push({ height: block.height, hash: block.hash, timestamp: block.time, txcount: block.tx?.length || 0 });
      } catch (error) {
        console.error('Error searching for block height:', error);
      }
    }

    if (/^[a-f0-9]{64}$/i.test(trimmedQuery)) {
      try {
        const block = (await rpcClient.getBlock(trimmedQuery)) as unknown as { height?: number; hash?: string; time?: number; tx?: string[] };
        results.blocks.push({ height: block.height, hash: block.hash, timestamp: block.time, txcount: block.tx?.length || 0 });
      } catch (error) {
        console.error('Error searching for block hash:', error);
      }

      try {
        const tx = (await rpcClient.getTransaction(trimmedQuery)) as unknown as { txid?: string; blockhash?: string; time?: number; confirmations?: number };
        results.transactions.push({ txid: tx.txid, blockhash: tx.blockhash, time: tx.time, confirmations: tx.confirmations });
      } catch (error) {
        console.error('Error searching for transaction:', error);
      }
    }

    try {
      const validation = (await rpcClient.validateAddress(trimmedQuery)) as unknown as { isvalid: boolean };
      if ((validation as Record<string, unknown>).isvalid) {
        const balance = await rpcClient.getReceivedByAddress(trimmedQuery, 0);
        results.addresses.push({ address: trimmedQuery, balance, isvalid: true });
      }
    } catch (error) {
      console.error('Error validating address:', error);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Search failed' }, { status: 500 });
  }
}
