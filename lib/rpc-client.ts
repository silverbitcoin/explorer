/**
 * SilverBitcoin RPC Client - Production Implementation
 * Connects to RPC server for real blockchain data
 * All methods are production-ready with proper error handling
 */

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8332';

interface RPCRequest {
  jsonrpc: string;
  method: string;
  params: unknown[];
  id: number;
}

interface RPCResponse<T> {
  jsonrpc: string;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

class RPCError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'RPCError';
  }
}

async function rpcCall<T>(method: string, params: unknown[] = []): Promise<T> {
  const request: RPCRequest = {
    jsonrpc: '2.0',
    method,
    params,
    id: Math.floor(Math.random() * 1000000),
  };

  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: RPCResponse<T> = await response.json();

    if (data.error) {
      throw new RPCError(data.error.code, data.error.message, data.error);
    }

    if (data.result === undefined) {
      throw new Error('No result in RPC response');
    }

    return data.result;
  } catch (error) {
    if (error instanceof RPCError) throw error;
    throw new Error(`RPC call failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Block methods
export async function getBlockCount(): Promise<number> {
  return rpcCall<number>('getblockcount');
}

export async function getBlockHash(height: number): Promise<string> {
  return rpcCall<string>('getblockhash', [height]);
}

export async function getBlock(hashOrHeight: string | number): Promise<Record<string, unknown>> {
  const hash = typeof hashOrHeight === 'number' 
    ? await getBlockHash(hashOrHeight)
    : hashOrHeight;
  
  return rpcCall<Record<string, unknown>>('getblock', [hash, 2]); // verbosity 2 for full tx data
}

export async function getBlockHeader(hash: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('getblockheader', [hash]);
}

// Transaction methods
export async function getTransaction(txid: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('getrawtransaction', [txid, true]);
}

export async function getRawTransaction(txid: string): Promise<string> {
  return rpcCall<string>('getrawtransaction', [txid, false]);
}

export async function decodeRawTransaction(hex: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('decoderawtransaction', [hex]);
}

// Address methods
export async function getReceivedByAddress(address: string, minconf: number = 1): Promise<number> {
  return rpcCall<number>('getreceivedbyaddress', [address, minconf]);
}

export async function listReceivedByAddress(minconf: number = 1, includeEmpty: boolean = false): Promise<Record<string, unknown>[]> {
  return rpcCall<Record<string, unknown>[]>('listreceivedbyaddress', [minconf, includeEmpty]);
}

export async function getAddressInfo(address: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('getaddressinfo', [address]);
}

// Wallet methods
export async function getBalance(): Promise<number> {
  return rpcCall<number>('getbalance');
}

export async function listTransactions(account: string = '*', count: number = 10, skip: number = 0): Promise<Record<string, unknown>[]> {
  return rpcCall<Record<string, unknown>[]>('listtransactions', [account, count, skip]);
}

// Network methods
export async function getNetworkInfo(): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('getnetworkinfo');
}

export async function getPeerInfo(): Promise<Record<string, unknown>[]> {
  return rpcCall<Record<string, unknown>[]>('getpeerinfo');
}

export async function getConnectionCount(): Promise<number> {
  return rpcCall<number>('getconnectioncount');
}

// Mining methods
export async function getDifficulty(): Promise<number> {
  return rpcCall<number>('getdifficulty');
}

export async function getMiningInfo(): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('getmininginfo');
}

export async function getNetworkHashps(blocks: number = 120, height: number = -1): Promise<number> {
  return rpcCall<number>('getnetworkhashps', [blocks, height]);
}

// Utility methods
export async function validateAddress(address: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('validateaddress', [address]);
}

export async function estimateFee(blocks: number = 6): Promise<number> {
  return rpcCall<number>('estimatefee', [blocks]);
}

// Chain info
export async function getChainInfo(): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('getblockchaininfo');
}

export async function getTxOutSetInfo(): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('gettxoutsetinfo');
}

// ============================================================================
// ADDITIONAL BLOCKCHAIN METHODS
// ============================================================================

export async function getBestBlockHash(): Promise<string> {
  return rpcCall<string>('getbestblockhash');
}

export async function getChainTips(): Promise<Record<string, unknown>[]> {
  return rpcCall<Record<string, unknown>[]>('getchaintips');
}

// ============================================================================
// ADDITIONAL ADDRESS METHODS
// ============================================================================

export async function getAddressBalance(address: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('getaddressbalance', [address]);
}

// ============================================================================
// ADDITIONAL TRANSACTION METHODS
// ============================================================================

export async function createRawTransaction(
  inputs: Record<string, unknown>[],
  outputs: Record<string, number>
): Promise<string> {
  return rpcCall<string>('createrawtransaction', [inputs, outputs]);
}

export async function signRawTransaction(hex: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('signrawtransaction', [hex]);
}

export async function sendRawTransaction(hex: string): Promise<string> {
  return rpcCall<string>('sendrawtransaction', [hex]);
}

export async function listUnspent(
  minconf: number = 1,
  maxconf: number = 9999999
): Promise<Record<string, unknown>[]> {
  return rpcCall<Record<string, unknown>[]>('listunspent', [minconf, maxconf]);
}

export async function getTxOut(txid: string, vout: number): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('gettxout', [txid, vout]);
}

export async function getMempoolInfo(): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('getmempoolinfo');
}

export async function getMempoolEntry(txid: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('getmempoolentry', [txid]);
}

export async function getRawMempool(verbose: boolean = false): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('getrawmempool', [verbose]);
}

// ============================================================================
// MINING METHODS
// ============================================================================

export async function getBlockTemplate(): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('getblocktemplate');
}

export async function submitHeader(header: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('submitheader', [header]);
}

export async function submitBlock(block: Record<string, unknown>): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('submitblock', [block]);
}

export async function startMining(threads: number = 4): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('startmining', [threads]);
}

export async function stopMining(): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('stopmining');
}

export async function setMiningAddress(address: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('setminingaddress', [address]);
}

// ============================================================================
// NETWORK METHODS
// ============================================================================

export async function addNode(node: string, command: string = 'add'): Promise<void> {
  return rpcCall<void>('addnode', [node, command]);
}

export async function disconnectNode(node: string): Promise<void> {
  return rpcCall<void>('disconnectnode', [node]);
}

export async function getAddedNodeInfo(dns: boolean = true): Promise<Record<string, unknown>[]> {
  return rpcCall<Record<string, unknown>[]>('getaddednodeinfo', [dns]);
}

// ============================================================================
// WALLET METHODS
// ============================================================================

export async function dumpPrivKey(address: string): Promise<string> {
  return rpcCall<string>('dumpprivkey', [address]);
}

export async function importPrivKey(
  privkey: string,
  label: string = '',
  rescan: boolean = true
): Promise<void> {
  return rpcCall<void>('importprivkey', [privkey, label, rescan]);
}

export async function dumpWallet(filename: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('dumpwallet', [filename]);
}

export async function importWallet(filename: string): Promise<void> {
  return rpcCall<void>('importwallet', [filename]);
}

export async function getWalletInfo(): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('getwalletinfo');
}

export async function listWallets(): Promise<string[]> {
  return rpcCall<string[]>('listwallets');
}

export async function createWallet(name: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('createwallet', [name]);
}

export async function loadWallet(name: string): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('loadwallet', [name]);
}

export async function unloadWallet(name: string = 'default'): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('unloadwallet', [name]);
}

// ============================================================================
// UTILITY METHODS
// ============================================================================

export async function estimateSmartFee(
  blocks: number = 6,
  mode: string = 'conservative'
): Promise<Record<string, unknown>> {
  return rpcCall<Record<string, unknown>>('estimatesmartfee', [blocks, mode]);
}

export async function help(command: string = ''): Promise<string> {
  return rpcCall<string>('help', [command]);
}

export async function uptime(): Promise<number> {
  return rpcCall<number>('uptime');
}

export async function encodeHexStr(text: string): Promise<string> {
  return rpcCall<string>('encodehexstr', [text]);
}

export async function decodeHexStr(hex: string): Promise<string> {
  return rpcCall<string>('decodehexstr', [hex]);
}

export { RPCError };
