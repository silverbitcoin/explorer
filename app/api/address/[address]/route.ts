/**
 * GET /api/address/[address]
 * Fetch address information and transaction history
 */

import { NextRequest, NextResponse } from 'next/server';
import * as rpcClient from '@/lib/rpc-client';

interface AddressValidation {
  isvalid: boolean;
  isscript?: boolean;
  pubkey?: string;
  iscompressed?: boolean;
  account?: string;
}

interface TransactionRecord {
  address?: string;
  vin?: Array<{ addresses?: string }>;
  vout?: Array<{ addresses?: string }>;
  txid?: string;
  time?: number;
  amount?: number;
  confirmations?: number;
  blockhash?: string;
}

interface UTXO {
  txid: string;
  vout: number;
  amount: number;
  confirmations: number;
  spendable: boolean;
  solvable: boolean;
  address?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Validate address
    const validation = (await rpcClient.validateAddress(address)) as unknown as AddressValidation;
    if (!validation.isvalid) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }

    // Get address info
    await rpcClient.getAddressInfo(address);

    // Get balance
    const balance = await rpcClient.getReceivedByAddress(address, 0);

    // Get transaction history
    const txList = (await rpcClient.listTransactions('*', 100)) as TransactionRecord[];
    const addressTxs = txList.filter((tx) => 
      tx.address === address || 
      tx.vin?.some((input) => input.addresses === address) ||
      tx.vout?.some((output) => output.addresses === address)
    );

    // Get unspent outputs for this address
    const utxos = (await rpcClient.listUnspent(0, 9999999)) as unknown as UTXO[];
    const addressUtxos = utxos.filter((utxo) => utxo.address === address);

    const totalUtxoValue = addressUtxos.reduce((sum: number, utxo) => {
      return sum + (utxo.amount || 0);
    }, 0);

    return NextResponse.json({
      address,
      isvalid: validation.isvalid,
      isscript: validation.isscript,
      pubkey: validation.pubkey,
      iscompressed: validation.iscompressed,
      account: validation.account,
      balance: totalUtxoValue,
      received: balance,
      sent: balance - totalUtxoValue,
      txcount: addressTxs.length,
      unconfirmedbalance: 0,
      unconfirmedtxcount: 0,
      transactions: addressTxs.map((tx) => ({
        txid: tx.txid,
        time: tx.time,
        amount: tx.amount,
        confirmations: tx.confirmations,
        blockhash: tx.blockhash,
      })),
      utxos: addressUtxos.map((utxo) => ({
        txid: utxo.txid,
        vout: utxo.vout,
        amount: utxo.amount,
        confirmations: utxo.confirmations,
        spendable: utxo.spendable,
        solvable: utxo.solvable,
      })),
    });
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch address',
      },
      { status: 500 }
    );
  }
}
