import { ObjectId } from 'mongodb';

// ============================================================================
// CORE BLOCKCHAIN DATA MODELS - PRODUCTION IMPLEMENTATION
// ============================================================================

/**
 * Block data model - represents a complete block in the blockchain
 * Integrates with silver-pow and silver-storage crates
 */
export interface Block {
  _id: ObjectId;
  hash: string;
  height: number;
  confirmations: number;
  size: number;
  bits: string;
  nonce: number;
  timestamp: number;
  txs: string[];
  difficulty: number;
  merkle: string;
  prev_hash: string;
  next_hash?: string;
  total: number;
  // Real blockchain fields
  miner_address?: string;
  block_reward?: number;
  chain_id?: number; // For sharding support (0-19)
  version?: number;
  weight?: number;
  stripping_time?: number;
}

/**
 * Transaction data model - represents a complete transaction
 * Integrates with silver-core and silver-storage crates
 */
export interface Transaction {
  _id: ObjectId;
  txid: string;
  blockindex: number;
  blockhash: string;
  timestamp: number;
  total: number;
  vout: TransactionOutput[];
  vin: TransactionInput[];
  // Real blockchain fields
  version?: number;
  locktime?: number;
  size?: number;
  vsize?: number;
  weight?: number;
  fee?: number;
  fuel_used?: number;
  fuel_price?: number;
  status?: 'pending' | 'success' | 'failed';
  sender?: string;
  sponsor?: string;
  expiration?: number;
  is_privacy?: boolean; // Lelantus transaction
  is_mimblewimble?: boolean; // Mimblewimble transaction
}

/**
 * Transaction output - represents UTXO
 */
export interface TransactionOutput {
  addresses: string;
  amount: number;
  script_pubkey?: string;
  script_type?: string;
}

/**
 * Transaction input - represents spent UTXO
 */
export interface TransactionInput {
  addresses: string;
  amount: number;
  txid?: string;
  vout?: number;
  script_sig?: string;
  sequence?: number;
}

/**
 * Address data model - represents a blockchain address
 * Integrates with silver-core address types
 */
export interface Address {
  _id: ObjectId;
  a_id: string;
  name?: string;
  balance: number;
  received: number;
  sent: number;
  txs?: string[];
  // Real blockchain fields
  address_type?: 'standard' | 'stealth' | 'contract';
  is_contract?: boolean;
  contract_code?: string;
  token_balances?: Record<string, number>;
  last_activity?: number;
  first_activity?: number;
  tx_count?: number;
}

/**
 * Address transaction - represents a transaction involving an address
 */
export interface AddressTx {
  _id: ObjectId;
  a_id: string;
  blockindex: number;
  txid: string;
  amount: number;
  timestamp?: number;
  direction?: 'in' | 'out';
}

/**
 * Richlist entry - represents an address in the richlist
 */
export interface RichlistEntry {
  address: string;
  balance: number;
  received: number;
  rank?: number;
  percentage?: number;
}

/**
 * Richlist - represents the richlist snapshot
 */
export interface Richlist {
  _id: ObjectId;
  coin: string;
  received: RichlistEntry[];
  balance: RichlistEntry[];
  timestamp?: number;
  total_supply?: number;
}

/**
 * Blockchain statistics
 */
export interface Stats {
  _id: ObjectId;
  coin: string;
  count: number;
  last: number;
  supply: number;
  connections: number;
  last_price: number;
  // Real blockchain fields
  difficulty?: number;
  network_hashrate?: number;
  avg_block_time?: number;
  total_transactions?: number;
  active_addresses?: number;
  timestamp?: number;
}

/**
 * Peer information
 */
export interface Peers {
  _id: ObjectId;
  createdAt: Date;
  address: string;
  port: string;
  protocol: string;
  version: string;
  country: string;
  country_code: string;
  // Real blockchain fields
  latency?: number;
  last_seen?: number;
  user_agent?: string;
  services?: number;
  height?: number;
}

/**
 * Market summary data
 */
export interface MarketSummary {
  last: number;
  high: number;
  low: number;
  volume: number;
  bid: number;
  ask: number;
  change: number;
  baseVolume?: number;
  quoteVolume?: number;
  timestamp?: number;
}

/**
 * Chart data point
 */
export interface ChartData {
  date: number;
  price: number;
  volume: number;
}

/**
 * Order book entry
 */
export interface OrderBookEntry {
  price: number;
  quantity: number;
  total?: number;
}

/**
 * Trade history entry
 */
export interface TradeHistoryEntry {
  timestamp: number;
  price: number;
  quantity: number;
  total: number;
  type: 'buy' | 'sell';
}

/**
 * Market data
 */
export interface Markets {
  _id: ObjectId;
  market: string;
  summary: MarketSummary;
  chartdata: ChartData[];
  buys: OrderBookEntry[];
  sells: OrderBookEntry[];
  history: TradeHistoryEntry[];
}

/**
 * Mining pool data - integrates with silver-pow mining pool
 */
export interface MiningPoolStats {
  _id: ObjectId;
  pool_name: string;
  total_hashrate: number;
  active_miners: number;
  total_shares: number;
  valid_shares: number;
  invalid_shares: number;
  blocks_found: number;
  total_rewards: number;
  difficulty: number;
  last_block_time?: number;
  timestamp?: number;
}

/**
 * Miner data - integrates with silver-pow mining pool
 */
export interface Miner {
  _id: ObjectId;
  address: string;
  pool_name: string;
  hashrate: number;
  shares: number;
  valid_shares: number;
  invalid_shares: number;
  blocks_found: number;
  total_rewards: number;
  last_share_time?: number;
  joined_at?: number;
  status?: 'active' | 'inactive';
}

/**
 * Difficulty adjustment record - integrates with silver-pow
 */
export interface DifficultyRecord {
  _id: ObjectId;
  height: number;
  chain_id: number;
  old_difficulty: number;
  new_difficulty: number;
  adjustment_factor: number;
  timestamp?: number;
}

/**
 * Block reward record - integrates with silver-pow
 */
export interface BlockRewardRecord {
  _id: ObjectId;
  height: number;
  miner_address: string;
  reward_amount: number;
  transaction_fees: number;
  total_reward: number;
  timestamp?: number;
}

/**
 * Heavy voting data (if applicable)
 */
export interface HeavyVote {
  count: number;
  reward: number;
  vote: number;
}

/**
 * Heavy voting system
 */
export interface Heavy {
  _id: ObjectId;
  coin: string;
  lvote: number;
  reward: number;
  supply: number;
  cap: number;
  estnext: number;
  phase: string;
  maxvote: number;
  nextin: string;
  votes: HeavyVote[];
}