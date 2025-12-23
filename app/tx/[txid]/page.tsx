/**
 * Transaction detail page
 * Displays complete transaction information
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
import { Badge } from '@/components/ui/badge';

interface TxPageProps {
  params: Promise<{
    txid: string;
  }>;
}

export default async function TxPage({ params }: TxPageProps) {
  const { txid } = await params;

  if (!txid || txid.length !== 64) {
    notFound();
  }

  try {
    // Fetch transaction data from API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tx/${txid}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      notFound();
    }

    const tx = await response.json();

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
            <h1 className="text-3xl font-bold text-slate-900">Transaction</h1>
            <p className="mt-2 font-mono text-sm text-slate-600">{tx.txid}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Transaction Status */}
          <div className="mb-6">
            <Badge
              className={
                tx.confirmations > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }
            >
              {tx.confirmations > 0 ? 'Confirmed' : 'Pending'}
            </Badge>
            {tx.confirmations > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                {tx.confirmations} confirmation{tx.confirmations !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Transaction Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Transaction ID</div>
                  <div className="break-all font-mono text-sm">{tx.txid}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Hash</div>
                  <div className="break-all font-mono text-sm">{tx.hash}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Block Hash</div>
                  {tx.blockhash ? (
                    <Link
                      href={`/block/${tx.blockhash}`}
                      className="font-mono text-sm text-blue-600 hover:underline"
                    >
                      {tx.blockhash.substring(0, 16)}...
                    </Link>
                  ) : (
                    <div className="text-gray-500">Unconfirmed</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Block Index</div>
                  <div className="font-mono font-semibold">{tx.blockindex || 'N/A'}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Timestamp</div>
                  <div className="font-semibold">
                    {new Date(tx.time * 1000).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(tx.time * 1000), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Version</div>
                  <div className="font-mono font-semibold">{tx.version}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Locktime</div>
                  <div className="font-mono font-semibold">{tx.locktime}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Size</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Size</div>
                  <div className="font-mono font-semibold">{tx.size} bytes</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Virtual Size (vSize)</div>
                  <div className="font-mono font-semibold">{tx.vsize} vB</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Weight</div>
                  <div className="font-mono font-semibold">{tx.weight} WU</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Value</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Total Input</div>
                  <div className="font-mono font-semibold">
                    {(tx.totalInput / 1e8).toFixed(8)} SLVR
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Output</div>
                  <div className="font-mono font-semibold">
                    {(tx.totalOutput / 1e8).toFixed(8)} SLVR
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Fee</div>
                  <div className="font-mono font-semibold">
                    {(tx.fee / 1e8).toFixed(8)} SLVR
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inputs */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>{tx.vin?.length || 0} input{tx.vin?.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Previous Output</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tx.vin && tx.vin.length > 0 ? (
                      tx.vin.map((input: Record<string, unknown>, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            {input.txid ? (
                              <Link
                                href={`/tx/${input.txid}`}
                                className="font-mono text-sm text-blue-600 hover:underline"
                              >
                                {String(input.txid).substring(0, 16)}...:{input.vout as number}
                              </Link>
                            ) : (
                              <span className="text-gray-500">Coinbase</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {(((input.value as number) || 0) / 1e8)} SLVR
                          </TableCell>
                          <TableCell>
                            {input.addresses ? (
                              <Link
                                href={`/address/${input.addresses}`}
                                className="font-mono text-sm text-blue-600 hover:underline"
                              >
                                {String(input.addresses).substring(0, 16)}...
                              </Link>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500">
                          No inputs
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Outputs */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Outputs</CardTitle>
              <CardDescription>{tx.vout?.length || 0} output{tx.vout?.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Index</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Script Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tx.vout && tx.vout.length > 0 ? (
                      tx.vout.map((output: Record<string, unknown>, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono font-semibold">{index}</TableCell>
                          <TableCell className="text-right font-mono">
                            {(((output.value as number) || 0) / 1e8)} SLVR
                          </TableCell>
                          <TableCell>
                            {output.addresses ? (
                              <Link
                                href={`/address/${output.addresses}`}
                                className="font-mono text-sm text-blue-600 hover:underline"
                              >
                                {String(output.addresses).substring(0, 16)}...
                              </Link>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {(output.script_type as string) || 'unknown'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          No outputs
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Raw Transaction */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Raw Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded bg-gray-100 p-4">
                <code className="break-all font-mono text-xs text-gray-800">
                  {tx.hex}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading transaction:', error);
    notFound();
  }
}
