import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ txid: string }> }
) {
  try {
    const { txid } = await params;
    if (!txid || txid.length !== 64) return NextResponse.json({ error: 'Valid transaction ID required' }, { status: 400 });

    const tx = (await rpcClient.getTransaction(txid)) as unknown as Record<string, unknown>;
    const totalInput = ((tx.vin as Array<{ value?: number }>)?.reduce((sum: number, input) => sum + (input.value || 0), 0) || 0);
    const totalOutput = ((tx.vout as Array<{ value?: number }>)?.reduce((sum: number, output) => sum + (output.value || 0), 0) || 0);

    return NextResponse.json({
      txid: tx.txid || txid,
      hash: tx.hash,
      version: tx.version || 0,
      size: tx.size || 0,
      vsize: tx.vsize || 0,
      weight: tx.weight || 0,
      locktime: tx.locktime || 0,
      vin: tx.vin || [],
      vout: tx.vout || [],
      blockhash: tx.blockhash,
      blockindex: tx.blockindex,
      time: tx.time,
      confirmations: tx.confirmations || 0,
      hex: tx.hex,
      totalInput,
      totalOutput,
      fee: totalInput - totalOutput,
      status: (tx.confirmations as number) ? 'confirmed' : 'pending',
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch transaction' }, { status: 500 });
  }
}
