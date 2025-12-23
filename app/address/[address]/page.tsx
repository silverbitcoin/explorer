/**
 * Address detail page
 * Displays address information and transaction history
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

interface AddressPageProps {
  params: Promise<{
    address: string;
  }>;
}

export default async function AddressPage({ params }: AddressPageProps) {
  const { address } = await params;

  if (!address) {
    notFound();
  }

  try {
    // Fetch address data from API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/address/${address}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      notFound();
    }

    const addressData = await response.json();

    if (!addressData.isvalid) {
      notFound();
    }

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
            <h1 className="text-3xl font-bold text-slate-900">Address</h1>
            <p className="mt-2 break-all font-mono text-sm text-slate-600">{address}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Address Summary */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(addressData.balance / 1e8).toFixed(8)}
                </div>
                <p className="text-xs text-gray-500">SLVR</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(addressData.received / 1e8).toFixed(8)}
                </div>
                <p className="text-xs text-gray-500">SLVR</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(addressData.sent / 1e8).toFixed(8)}
                </div>
                <p className="text-xs text-gray-500">SLVR</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{addressData.txcount}</div>
                <p className="text-xs text-gray-500">Total</p>
              </CardContent>
            </Card>
          </div>

          {/* Address Details */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Address</div>
                  <div className="break-all font-mono text-sm">{address}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-semibold">
                    {addressData.isscript ? 'Script' : 'Standard'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Account</div>
                  <div className="font-mono text-sm">
                    {addressData.account || 'default'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addressData.pubkey && (
                  <div>
                    <div className="text-sm text-gray-600">Public Key</div>
                    <div className="break-all font-mono text-xs">
                      {addressData.pubkey}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-600">Compressed</div>
                  <div className="font-semibold">
                    {addressData.iscompressed ? 'Yes' : 'No'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* UTXOs */}
          {addressData.utxos && addressData.utxos.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Unspent Outputs (UTXOs)</CardTitle>
                <CardDescription>
                  {addressData.utxos.length} UTXO{addressData.utxos.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction</TableHead>
                        <TableHead className="text-right">Index</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Confirmations</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {addressData.utxos.map((utxo: Record<string, unknown>, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Link
                              href={`/tx/${utxo.txid}`}
                              className="font-mono text-sm text-blue-600 hover:underline"
                            >
                              {String(utxo.txid).substring(0, 16)}...
                            </Link>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {utxo.vout as number}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {(((utxo.amount as number) / 1e8).toFixed(8))} SLVR
                          </TableCell>
                          <TableCell className="text-right">
                            {utxo.confirmations as number}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                utxo.spendable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {(utxo.spendable as boolean) ? 'Spendable' : 'Locked'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transactions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                {addressData.txcount} transaction{addressData.txcount !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Confirmations</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addressData.transactions && addressData.transactions.length > 0 ? (
                      addressData.transactions.map((tx: Record<string, unknown>, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Link
                              href={`/tx/${tx.txid}`}
                              className="font-mono text-sm text-blue-600 hover:underline"
                            >
                              {String(tx.txid).substring(0, 16)}...
                            </Link>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {(((tx.amount as number) / 1e8).toFixed(8))} SLVR
                          </TableCell>
                          <TableCell className="text-right">
                            {tx.confirmations as number}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDistanceToNow(new Date(((tx.time as number) * 1000)), {
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
    console.error('Error loading address:', error);
    notFound();
  }
}
