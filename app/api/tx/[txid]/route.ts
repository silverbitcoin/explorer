/**
 * GET /api/tx/[txid]
 * Fetch a specific transaction by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

interface TransactionData {
  txid?: string;
  hash?: string;
  blockhash?: string;
  blockindex?: number;
  blocktime?: number;
  time?: number;
  confirmations?: number;
  hex?: string;
  version?: number;
  size?: number;
  vsize?: number;
  weight?: number;
  locktime?: number;
  vin?: Array<{ value?: number; scriptPubKey?: { addresses?: string[] } }>;
  vout?: Array<{ value?: number; scriptPubKey?: { addresses?: string[] }; script_type?: string }>;
}

interface BlockHeader {
  time?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ txid: string }> }
) {
  try {
    const { txid } = await params;

    if (!txid || txid.length !== 64) {
      return NextResponse.json(
        { error: 'Valid transaction ID (64 hex chars) is required' },
        { status: 400 }
      );
    }

    // Fetch transaction data
    const tx = (await rpcClient.getTransaction(txid)) as TransactionData;

    // Get block info if confirmed
    let blockInfo: BlockHeader | null = null;
    if (tx.blockhash) {
      try {
        blockInfo = (await rpcClient.getBlockHeader(tx.blockhash)) as BlockHeader;
      } catch (error) {
        console.error('Error fetching block info:', error);
      }
    }

    // Calculate total input and output amounts
    const totalInput = tx.vin?.reduce((sum: number, input) => {
      return sum + (input.value || 0);
    }, 0) || 0;

    const totalOutput = tx.vout?.reduce((sum: number, output) => {
      return sum + (output.value || 0);
    }, 0) || 0;

    const fee = totalInput - totalOutput;

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
      blocktime: tx.blocktime,
      time: tx.time,
      confirmations: tx.confirmations || 0,
      hex: tx.hex,
      totalInput,
      totalOutput,
      fee,
      status: tx.confirmations ? 'confirmed' : 'pending',
      blockInfo,
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch transaction',
      },
      { status: 500 }
    );
  }
}
