/**
 * GET /api/mining
 * Fetch mining pool statistics and miner information
 * 
 * Query parameters:
 * - stats: get pool statistics (true/false)
 * - topminers: get top miners list (true/false)
 * - limit: number of miners to return (default: 10, max: 100)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

interface MiningInfo {
  threads?: number;
  pooledtx?: number;
  time?: number;
}

interface Block {
  coinbase?: {
    vout?: Array<{
      scriptPubKey?: {
        addresses?: string[];
      };
      value?: number;
    }>;
  };
}

interface MinerStats {
  [address: string]: {
    address: string;
    hashrate: number;
    shares: number;
    valid_shares: number;
    invalid_shares: number;
    blocks_found: number;
    total_rewards: number;
    status: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const getStats = searchParams.get('stats') === 'true';
    const getTopMiners = searchParams.get('topminers') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    const response: Record<string, unknown> = {};

    if (getStats) {
      // Get mining info
      const miningInfo = (await rpcClient.getMiningInfo()) as MiningInfo;
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
      // Get recent blocks to find top miners
      const blockCount = await rpcClient.getBlockCount();
      const minerStats: MinerStats = {};

      // Scan last 100 blocks for miners
      const scanDepth = Math.min(100, blockCount);
      for (let i = 0; i < scanDepth; i++) {
        try {
          const height = blockCount - i;
          const blockHash = await rpcClient.getBlockHash(height);
          const block = (await rpcClient.getBlock(blockHash)) as Block;

          // Extract miner address from coinbase
          const minerAddress = block.coinbase?.vout?.[0]?.scriptPubKey?.addresses?.[0];
          if (minerAddress) {
            if (!minerStats[minerAddress]) {
              minerStats[minerAddress] = {
                address: minerAddress,
                hashrate: 0,
                shares: 0,
                valid_shares: 0,
                invalid_shares: 0,
                blocks_found: 0,
                total_rewards: 0,
                status: 'active',
              };
            }
            minerStats[minerAddress].blocks_found += 1;
            minerStats[minerAddress].total_rewards += block.coinbase?.vout?.[0]?.value || 0;
          }
        } catch (error) {
          console.error(`Error scanning block ${blockCount - i}:`, error);
        }
      }

      // Sort by blocks found and get top miners
      const topMiners = Object.values(minerStats)
        .sort((a, b) => b.blocks_found - a.blocks_found)
        .slice(0, limit);

      response.miners = topMiners;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching mining data:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch mining data',
      },
      { status: 500 }
    );
  }
}
