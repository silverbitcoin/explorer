'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Transaction } from '@/lib/models';
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

interface TransactionsTableProps {
  limit?: number;
  blockhash?: string;
  showPagination?: boolean;
}

/**
 * Production-grade transactions table component
 * Displays real blockchain transactions with:
 * - Transaction ID and status
 * - Sender and recipient
 * - Amount and fees
 * - Confirmations
 * - Real-time updates
 */
export function TransactionsTable({
  limit = 25,
  blockhash,
  showPagination = true,
}: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = '/api/transactions?';
        if (blockhash) {
          url += `blockhash=${blockhash}&`;
        }
        url += `limit=${limit}&offset=${page * limit}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        setTransactions(data.transactions || []);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    // Refresh every 5 seconds
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, [limit, page, blockhash]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Error loading transactions: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead className="text-right">Confirmations</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.txid}>
                  <TableCell>
                    <Link
                      href={`/tx/${tx.txid}`}
                      className="font-mono text-sm text-blue-600 hover:underline"
                    >
                      {tx.txid.substring(0, 16)}...
                    </Link>
                  </TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell>
                    {tx.sender ? (
                      <Link
                        href={`/address/${tx.sender}`}
                        className="font-mono text-sm text-blue-600 hover:underline"
                      >
                        {tx.sender.substring(0, 12)}...
                      </Link>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tx.vin && tx.vin.length > 0 ? (
                      <Link
                        href={`/address/${tx.vin[0].addresses}`}
                        className="font-mono text-sm text-blue-600 hover:underline"
                      >
                        {tx.vin[0].addresses.substring(0, 12)}...
                      </Link>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {(tx.total / 1e8).toFixed(8)} SLVR
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {tx.fee ? (tx.fee / 1e8).toFixed(8) : '0'} SLVR
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.blockindex ? (
                      <Badge variant="outline">{tx.blockindex}</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Unconfirmed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDistanceToNow(new Date(tx.timestamp * 1000), {
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
            {total} transactions
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
