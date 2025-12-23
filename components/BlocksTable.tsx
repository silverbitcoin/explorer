'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Block } from '@/lib/models';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface BlocksTableProps {
  limit?: number;
  showPagination?: boolean;
}

/**
 * Production-grade blocks table component
 * Displays real blockchain blocks with:
 * - Block height and hash
 * - Miner information
 * - Transaction count
 * - Difficulty and rewards
 * - Real-time updates
 */
export function BlocksTable({ limit = 10, showPagination = true }: BlocksTableProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/blocks/latest?limit=${limit}&offset=${page * limit}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch blocks');
        }

        const data = await response.json();
        setBlocks(data.blocks || []);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();

    // Refresh every 10 seconds
    const interval = setInterval(fetchBlocks, 10000);
    return () => clearInterval(interval);
  }, [limit, page]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Error loading blocks: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Height</TableHead>
              <TableHead>Hash</TableHead>
              <TableHead>Miner</TableHead>
              <TableHead className="text-right">Transactions</TableHead>
              <TableHead className="text-right">Reward</TableHead>
              <TableHead className="text-right">Difficulty</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : blocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No blocks found
                </TableCell>
              </TableRow>
            ) : (
              blocks.map((block) => (
                <TableRow key={block.hash}>
                  <TableCell>
                    <Link
                      href={`/block/${block.height}`}
                      className="font-mono font-semibold text-blue-600 hover:underline"
                    >
                      {block.height}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/block/${block.hash}`}
                      className="font-mono text-sm text-gray-600 hover:text-blue-600"
                    >
                      {block.hash.substring(0, 16)}...
                    </Link>
                  </TableCell>
                  <TableCell>
                    {block.miner_address ? (
                      <Link
                        href={`/address/${block.miner_address}`}
                        className="font-mono text-sm text-blue-600 hover:underline"
                      >
                        {block.miner_address.substring(0, 12)}...
                      </Link>
                    ) : (
                      <span className="text-gray-500">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{block.txs?.length || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {block.block_reward ? (block.block_reward / 1e8).toFixed(2) : '0'} SLVR
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {block.difficulty?.toFixed(2) || '0'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDistanceToNow(new Date(block.timestamp * 1000), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && total > limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of{' '}
            {total} blocks
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * limit >= total}
              className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
