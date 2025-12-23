/**
 * Block detail page
 * Displays complete block information and transactions
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BlockPageProps {
  params: Promise<{
    hash: string;
  }>;
}

export default async function BlockPage({ params }: BlockPageProps) {
  const { hash } = await params;

  try {
    // Fetch block data from API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/blocks/${hash}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      notFound();
    }

    const block = await response.json();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-4">
              <Link href="/" className="text-blue-600 hover:underline">
                ← Back to Explorer
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Block #{block.height}</h1>
            <p className="mt-2 font-mono text-sm text-slate-600">{block.hash}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Block Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Block Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Height</div>
                  <div className="font-mono font-semibold">{block.height}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Hash</div>
                  <div className="break-all font-mono text-sm">{block.hash}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Previous Block</div>
                  <Link
                    href={`/block/${block.previousblockhash}`}
                    className="font-mono text-sm text-blue-600 hover:underline"
                  >
                    {block.previousblockhash?.substring(0, 16)}...
                  </Link>
                </div>
                {block.nextblockhash && (
                  <div>
                    <div className="text-sm text-gray-600">Next Block</div>
                    <Link
                      href={`/block/${block.nextblockhash}`}
                      className="font-mono text-sm text-blue-600 hover:underline"
                    >
                      {block.nextblockhash.substring(0, 16)}...
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mining Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Miner</div>
                  {block.miner ? (
                    <Link
                      href={`/address/${block.miner}`}
                      className="font-mono text-sm text-blue-600 hover:underline"
                    >
                      {block.miner}
                    </Link>
                  ) : (
                    <div className="text-gray-500">Unknown</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Block Reward</div>
                  <div className="font-mono font-semibold">
                    {(block.reward / 1e8).toFixed(8)} SLVR
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Difficulty</div>
                  <div className="font-mono font-semibold">
                    {block.difficulty?.toFixed(2) || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Nonce</div>
                  <div className="font-mono font-semibold">{block.nonce}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Block Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Timestamp</div>
                  <div className="font-semibold">
                    {new Date(block.timestamp * 1000).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(block.timestamp * 1000), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Confirmations</div>
                  <div className="font-mono font-semibold">{block.confirmations}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Size</div>
                  <div className="font-mono font-semibold">{block.size} bytes</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Weight</div>
                  <div className="font-mono font-semibold">{block.weight} WU</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Merkle Tree</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Merkle Root</div>
                  <div className="break-all font-mono text-sm">{block.merkleroot}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bits</div>
                  <div className="font-mono font-semibold">{block.bits}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Version</div>
                  <div className="font-mono font-semibold">{block.version}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                {block.transactions} transaction{block.transactions !== 1 ? 's' : ''} in this block
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {block.txs && block.txs.length > 0 ? (
                      block.txs.map((tx: Record<string, unknown>) => (
                        <TableRow key={tx.txid as string}>
                          <TableCell>
                            <Link
                              href={`/tx/${tx.txid}`}
                              className="font-mono text-sm text-blue-600 hover:underline"
                            >
                              {String(tx.txid).substring(0, 16)}...
                            </Link>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {(((tx.vout as Array<Record<string, unknown>>)?.reduce((sum: number, out) => sum + (out.value as number || 0), 0) || 0) / 1e8)} SLVR
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {(((tx.fee as number) || 0) / 1e8)} SLVR
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDistanceToNow(new Date((tx.time as number) * 1000), {
                              addSuffix: true,
                            })}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading block:', error);
    notFound();
  }
}
