import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const getStats = searchParams.get('stats') === 'true';
    const getTopMiners = searchParams.get('topminers') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    const response: Record<string, unknown> = {};

    if (getStats) {
      const miningInfo = (await rpcClient.getMiningInfo()) as unknown as { threads?: number; pooledtx?: number; time?: number };
      const networkHashps = await rpcClient.getNetworkHashps(120, -1);
      const difficulty = await rpcClient.getDifficulty();
      const blockCount = await rpcClient.getBlockCount();

      response.stats = {
        pool_name: 'SilverBitcoin Network',
        total_hashrate: networkHashps || 0,
        active_miners: miningInfo.threads || 0,
        total_shares: miningInfo.pooledtx || 0,
        valid_shares: miningInfo.pooledtx || 0,
        invalid_shares: 0,
        blocks_found: blockCount || 0,
        total_rewards: 0,
        difficulty: difficulty || 0,
        last_block_time: miningInfo.time || 0,
        timestamp: Date.now(),
      };
    }

    if (getTopMiners) {
      const blockCount = await rpcClient.getBlockCount();
      const minerStats: Record<string, unknown> = {};
      const scanDepth = Math.min(100, blockCount);

      for (let i = 0; i < scanDepth; i++) {
        try {
          const height = blockCount - i;
          const blockHash = await rpcClient.getBlockHash(height);
          const block = (await rpcClient.getBlock(blockHash)) as unknown as { coinbase?: { vout?: Array<{ scriptPubKey?: { addresses?: string[] }; value?: number }> } };
          const minerAddress = block.coinbase?.vout?.[0]?.scriptPubKey?.addresses?.[0];

          if (minerAddress) {
            if (!minerStats[minerAddress]) {
              minerStats[minerAddress] = { address: minerAddress, hashrate: 0, shares: 0, valid_shares: 0, invalid_shares: 0, blocks_found: 0, total_rewards: 0, status: 'active' };
            }
            const miner = minerStats[minerAddress] as Record<string, unknown>;
            miner.blocks_found = ((miner.blocks_found as number) || 0) + 1;
            miner.total_rewards = ((miner.total_rewards as number) || 0) + (block.coinbase?.vout?.[0]?.value || 0);
          }
        } catch (error) {
          console.error(`Error scanning block ${blockCount - i}:`, error);
        }
      }

      response.miners = Object.values(minerStats).sort((a: unknown, b: unknown) => ((b as Record<string, unknown>).blocks_found as number) - ((a as Record<string, unknown>).blocks_found as number)).slice(0, limit);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching mining data:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch mining data' }, { status: 500 });
  }
}
