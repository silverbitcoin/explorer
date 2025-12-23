'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import * as rpcClient from '@/lib/rpc-client';

interface BlockchainStats {
  blockHeight: number;
  difficulty: number;
  networkHashrate: number;
  totalSupply: number;
  connections: number;
  lastBlockTime: number;
}

/**
 * Production-grade blockchain statistics dashboard
 * Displays real blockchain metrics from RPC API with:
 * - Block height and difficulty
 * - Network hashrate
 * - Supply information
 * - Real-time updates
 */
export function BlockchainStatsDashboard() {
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all blockchain data in parallel using RPC client
        const [blockCount, difficulty, networkHashps, chainInfo, networkInfo] = await Promise.all([
          rpcClient.getBlockCount(),
          rpcClient.getDifficulty(),
          rpcClient.getNetworkHashps(120, -1),
          rpcClient.getChainInfo(),
          rpcClient.getNetworkInfo(),
        ]);

        // Extract supply from chain info
        const chainInfoData = chainInfo as Record<string, unknown>;
        const networkInfoData = networkInfo as Record<string, unknown>;

        setStats({
          blockHeight: blockCount,
          difficulty,
          networkHashrate: networkHashps,
          totalSupply: (chainInfoData.moneysupply as number) || 0,
          connections: (networkInfoData.connections as number) || 0,
          lastBlockTime: (chainInfoData.time as number) || 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Error loading blockchain stats: {error}
      </div>
    );
  }

  const StatCard = ({
    title,
    value,
    description,
    loading: isLoading,
  }: {
    title: string;
    value: string | number;
    description?: string;
    loading?: boolean;
  }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Block Height"
          value={loading ? '-' : stats?.blockHeight || 0}
          description="Current blockchain height"
          loading={loading}
        />

        <StatCard
          title="Network Difficulty"
          value={
            loading
              ? '-'
              : stats?.difficulty
              ? stats.difficulty.toFixed(2)
              : '0'
          }
          description="Current mining difficulty"
          loading={loading}
        />

        <StatCard
          title="Network Hashrate"
          value={
            loading
              ? '-'
              : stats?.networkHashrate
              ? (stats.networkHashrate / 1e12).toFixed(2) + ' TH/s'
              : '0 TH/s'
          }
          description="Total network hashrate"
          loading={loading}
        />

        <StatCard
          title="Total Supply"
          value={
            loading
              ? '-'
              : stats?.totalSupply
              ? (stats.totalSupply / 1e9).toFixed(0) + ' SLVR'
              : '0 SLVR'
          }
          description="Total SLVR in circulation"
          loading={loading}
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Network Connections"
          value={loading ? '-' : stats?.connections || 0}
          description="Connected peers"
          loading={loading}
        />

        <StatCard
          title="Last Block"
          value={
            loading
              ? '-'
              : new Date(stats?.lastBlockTime ? stats.lastBlockTime * 1000 : 0).toLocaleTimeString()
          }
          description="Time of last block"
          loading={loading}
        />
      </div>
    </div>
  );
}
