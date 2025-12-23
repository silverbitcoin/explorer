"use strict";

const Decimal = require("decimal.js");
const Decimal8 = Decimal.clone({ precision:8, rounding:8 });

// Block reward eras for SLVR (50 SLVR initial, halves every 210,000 blocks)
const blockRewardEras = [ new Decimal8(50) ];
for (let i = 1; i < 34; i++) {
	let previous = blockRewardEras[i - 1];
	blockRewardEras.push(new Decimal8(previous).dividedBy(2));
}

const currencyUnits = [
	{
		type:"native",
		name:"SLVR",
		multiplier:1,
		default:true,
		values:["", "slvr", "SLVR"],
		decimalPlaces:8
	},
	{
		type:"native",
		name:"mSLVR",
		multiplier:1000,
		values:["mslvr"],
		decimalPlaces:5
	},
	{
		type:"native",
		name:"bits",
		multiplier:1000000,
		values:["bits"],
		decimalPlaces:2
	},
	{
		type:"native",
		name:"MIST",
		multiplier:100000000,
		values:["mist", "satoshi"],
		decimalPlaces:0
	},
	{
		type:"exchanged",
		name:"USD",
		multiplier:"usd",
		values:["usd"],
		decimalPlaces:2,
		symbol:"$"
	},
	{
		type:"exchanged",
		name:"EUR",
		multiplier:"eur",
		values:["eur"],
		decimalPlaces:2,
		symbol:"€"
	},
];

module.exports = {
	name:"SilverBitcoin",
	ticker:"SLVR",
	logoUrlsByNetwork:{
		"main":"./img/network-mainnet/logo.svg",
		"test":"./img/network-testnet/logo.svg",
		"regtest":"./img/network-regtest/logo.svg",
		"signet":"./img/network-signet/logo.svg"
	},
	coinIconUrlsByNetwork:{
		"main":"./img/network-mainnet/coin-icon.svg",
		"test":"./img/network-testnet/coin-icon.svg",
		"signet":"./img/network-signet/coin-icon.svg",
		"regtest":"./img/network-regtest/coin-icon.svg"
	},
	coinColorsByNetwork: {
		"main": "#c0c0c0",
		"test": "#1daf00",
		"signet": "#af008c",
		"regtest": "#777"
	},
	siteTitlesByNetwork: {
		"main":"SilverBitcoin Explorer",
		"test":"Testnet Explorer",
		"regtest":"Regtest Explorer",
		"signet":"Signet Explorer",
	},
	demoSiteUrlsByNetwork: {
		"main": "https://explorer.silverbitcoin.org",
		"test": "https://testnet-explorer.silverbitcoin.org",
		"signet": "https://signet-explorer.silverbitcoin.org",
	},
	knownTransactionsByNetwork: {
		main: "00000000000000000000000000000000000000000000000000000000000000000"
	},
	miningPoolsConfigUrls:[
		"https://raw.githubusercontent.com/silverbitcoin/SilverBitcoin-Known-Miners/master/miners.json"
	],
	maxBlockWeight: 32000000,
	maxBlockSize: 8000000,
	minTxBytes: 166,
	minTxWeight: 166 * 4,
	difficultyAdjustmentBlockCount: 2016,
	maxSupplyByNetwork: {
		"main": new Decimal(21000000),
		"test": new Decimal(21000000),
		"regtest": new Decimal(21000000),
		"signet": new Decimal(21000000)
	},
	targetBlockTimeSeconds: 30,
	targetBlockTimeMinutes: 0.5,
	currencyUnits:currencyUnits,
	currencyUnitsByName:{"SLVR":currencyUnits[0], "mSLVR":currencyUnits[1], "bits":currencyUnits[2], "MIST":currencyUnits[3]},
	baseCurrencyUnit:currencyUnits[3],
	defaultCurrencyUnit:currencyUnits[0],
	feeSatoshiPerByteBucketMaxima: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 50, 75, 100, 150],
	
	halvingBlockIntervalsByNetwork: {
		"main": 210000,
		"test": 210000,
		"regtest": 150,
		"signet": 210000
	},

	terminalHalvingCountByNetwork: {
		"main": 32,
		"test": 32,
		"regtest": 32,
		"signet": 32
	},

	coinSupplyCheckpointsByNetwork: {
		"main": [ 0, new Decimal(0) ]
	},

	utxoSetCheckpointsByNetwork: {
		"main": {
			"height": 0,
			"bestblock": "0000000000000000000000000000000000000000000000000000000000000000",
			"txouts": 0,
			"bogosize": 0,
			"muhash": "0000000000000000000000000000000000000000000000000000000000000000",
			"total_amount": "0.00000000",
			"total_unspendable_amount": "0",
			"transactions": 0,
			"disk_size": 0,
			"hash_serialized_2": "0000000000000000000000000000000000000000000000000000000000000000",
			"lastUpdated": 0
		}
	},

	genesisBlockHashesByNetwork:{
		"main":	"0000000000000000000000000000000000000000000000000000000000000000",
	},

	genesisCoinbaseTransactionIdsByNetwork: {
		"main":	"0000000000000000000000000000000000000000000000000000000000000000"
	},

	genesisCoinbaseTransactionsByNetwork:{
		"main": {
			"hex": "020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff025200ffffffff0200f2052a010000001976a914308de579491c528e5a89db28aab01816d202ffff88ac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000",
			"txid": "0000000000000000000000000000000000000000000000000000000000000000",
			"hash": "0000000000000000000000000000000000000000000000000000000000000000",
			"size": 170,
			"vsize": 143,
			"version": 2,
			"confirmations":1,
			"vin": [
				{
					"coinbase": "5200",
					"sequence": 4294967295
				}
			],
			"vout": [
				{
					"value": 50,
					"n": 0,
					"scriptPubKey": {
						"asm": "OP_DUP OP_HASH160 308de579491c528e5a89db28aab01816d202ffff OP_EQUALVERIFY OP_CHECKSIG",
						"hex": "76a914308de579491c528e5a89db28aab01816d202ffff88ac",
						"reqSigs": 1,
						"type": "pubkey",
						"addresses": [
							"SLVR1234567890abcdef"
						]
					}
				}
			],
			"blockhash": "0000000000000000000000000000000000000000000000000000000000000000",
			"time": 0,
			"blocktime": 0
		}
	},

	genesisBlockStatsByNetwork:{
		"main": {
			"avgfee": 0,
			"avgfeerate": 0,
			"avgtxsize": 0,
			"blockhash": "0000000000000000000000000000000000000000000000000000000000000000",
			"feerate_percentiles": [0, 0, 0, 0, 0],
			"height": 0,
			"ins": 0,
			"maxfee": 0,
			"maxfeerate": 0,
			"maxtxsize": 0,
			"medianfee": 0,
			"mediantime": 0,
			"mediantxsize": 0,
			"minfee": 0,
			"minfeerate": 0,
			"mintxsize": 0,
			"outs": 1,
			"subsidy": 5000000000,
			"swtotal_size": 0,
			"swtotal_weight": 0,
			"swtxs": 0,
			"time": 0,
			"total_out": 0,
			"total_size": 0,
			"total_weight": 0,
			"totalfee": 0,
			"txs": 1,
			"utxo_increase": 1,
			"utxo_size_inc": 117
		}
	},

	testData: {
		txDisplayTestList: {}
	},

	genesisCoinbaseOutputAddressScripthash:"0000000000000000000000000000000000000000000000000000000000000000",
	historicalData: [],

	exchangeRateData:{
		jsonUrl:"https://api.coindesk.com/v1/bpi/currentprice.json",
		responseBodySelectorFunction:function(responseBody) {
			var exchangedCurrencies = ["USD", "GBP", "EUR"];

			if (responseBody.bpi) {
				var exchangeRates = {};

				for (var i = 0; i < exchangedCurrencies.length; i++) {
					if (responseBody.bpi[exchangedCurrencies[i]]) {
						exchangeRates[exchangedCurrencies[i].toLowerCase()] = responseBody.bpi[exchangedCurrencies[i]].rate_float;
					}
				}

				return exchangeRates;
			}
			
			return null;
		}
	},

	blockRewardFunction:function(blockHeight, chain) {
		let halvingBlockInterval = (chain == "regtest" ? 150 : 210000);
		let index = Math.floor(blockHeight / halvingBlockInterval);

		return blockRewardEras[index];
	}
};
