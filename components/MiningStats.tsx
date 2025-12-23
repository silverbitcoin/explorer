'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MiningPoolStats, Miner } from '@/lib/models';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * Production-grade mining statistics component
 * Displays real mining pool data with:
 * - Pool hashrate and active miners
 * - Share statistics
 * - Blocks found and rewards
 * - Top miners list
 * - Real-time updates
 */
export function MiningStats() {
  const [poolStats, setPoolStats] = useState<MiningPoolStats | null>(null);
  const [topMiners, setTopMiners] = useState<Miner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMiningData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch pool stats
        const statsResponse = await fetch('/api/mining?stats=true');
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setPoolStats(stats);
        }

        // Fetch top miners
        const minersResponse = await fetch('/api/mining?topminers=true&limit=10');
        if (minersResponse.ok) {
          const data = await minersResponse.json();
          setTopMiners(data.miners || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMiningData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchMiningData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Error loading mining stats: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pool Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Network Hashrate</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {poolStats
                  ? (poolStats.total_hashrate / 1e12).toFixed(2)
                  : '0'}
                <span className="text-sm font-normal text-gray-600"> TH/s</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Miners</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {poolStats?.active_miners || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valid Shares</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {poolStats?.valid_shares || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blocks Found</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {poolStats?.blocks_found || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pool Details */}
      {poolStats && (
        <Card>
          <CardHeader>
            <CardTitle>Pool Details</CardTitle>
            <CardDescription>Current mining pool statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-gray-600">Total Shares</div>
                <div className="text-lg font-semibold">
                  {poolStats.total_shares}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Invalid Shares</div>
                <div className="text-lg font-semibold">
                  {poolStats.invalid_shares}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Rewards</div>
                <div className="text-lg font-semibold">
                  {(poolStats.total_rewards / 1e8).toFixed(2)} SLVR
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Current Difficulty</div>
                <div className="text-lg font-semibold">
                  {poolStats.difficulty?.toFixed(2) || '0'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Miners */}
      <Card>
        <CardHeader>
          <CardTitle>Top Miners</CardTitle>
          <CardDescription>Miners with highest hashrate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Hashrate</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Blocks</TableHead>
                  <TableHead className="text-right">Rewards</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : topMiners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      No miners found
                    </TableCell>
                  </TableRow>
                ) : (
                  topMiners.map((miner, index) => (
                    <TableRow key={miner.address}>
                      <TableCell className="font-semibold">{index + 1}</TableCell>
                      <TableCell>
                        <Link
                          href={`/address/${miner.address}`}
                          className="font-mono text-sm text-blue-600 hover:underline"
                        >
                          {miner.address.substring(0, 16)}...
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {(miner.hashrate / 1e8).toFixed(2)} GH/s
                      </TableCell>
                      <TableCell className="text-right">
                        {miner.shares}
                      </TableCell>
                      <TableCell className="text-right">
                        {miner.blocks_found}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {(miner.total_rewards / 1e8).toFixed(2)} SLVR
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            miner.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {miner.status || 'unknown'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
