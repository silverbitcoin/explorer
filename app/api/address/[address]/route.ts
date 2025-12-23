import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 });

    const validation = (await rpcClient.validateAddress(address)) as unknown as { isvalid: boolean };
    if (!validation.isvalid) return NextResponse.json({ error: 'Invalid address' }, { status: 400 });

    await rpcClient.getAddressInfo(address);
    const balance = await rpcClient.getReceivedByAddress(address, 0);
    const txList = (await rpcClient.listTransactions('*', 100)) as unknown as Array<Record<string, unknown>>;
    const addressTxs = txList.filter((tx) => (tx.address === address));
    const utxos = (await rpcClient.listUnspent(0, 9999999)) as unknown as Array<{ address?: string; txid: string; vout: number; amount: number; confirmations: number; spendable: boolean; solvable: boolean }>;
    const addressUtxos = utxos.filter((utxo) => utxo.address === address);
    const totalUtxoValue = addressUtxos.reduce((sum: number, utxo) => sum + (utxo.amount || 0), 0);

    return NextResponse.json({
      address,
      isvalid: validation.isvalid,
      balance: totalUtxoValue,
      received: balance,
      sent: balance - totalUtxoValue,
      txcount: addressTxs.length,
      transactions: addressTxs.map((tx) => ({ txid: tx.txid, time: tx.time, amount: tx.amount, confirmations: tx.confirmations, blockhash: tx.blockhash })),
      utxos: addressUtxos.map((utxo) => ({ txid: utxo.txid, vout: utxo.vout, amount: utxo.amount, confirmations: utxo.confirmations, spendable: utxo.spendable, solvable: utxo.solvable })),
    });
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch address' }, { status: 500 });
  }
}
