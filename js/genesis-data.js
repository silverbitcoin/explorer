/**
 * Genesis Data - Hardcoded genesis validators and accounts
 * Production-grade genesis data from genesis-mainnet.json
 */

const GenesisData = (() => {
    // Genesis validators from genesis-mainnet.json
    // Real validator addresses from blockchain
    const GENESIS_VALIDATORS = [
        {
            address: "41615a9438256ead7369195a73c3c8b966e3b26574cea3459af355c916f8a252d49ad409fc0e5ffb168a79335c284235d7d83fc790a1f684e8059ce998f11783",
            name: "validator1",
            stake_amount: 2500000000000000,
            commission_rate: 0.05,
            status: "active",
            voting_power: 25,
            blocks_created: 0
        },
        {
            address: "bae01f16c1af41c990153d3f3442b0e2b86af576cfddf44b30a43fba351c78532351bbf85a71bd46b76f81bb7ae529a6f0da5de3a82ba44936a8414919ac8b64",
            name: "validator2",
            stake_amount: 2500000000000000,
            commission_rate: 0.05,
            status: "active",
            voting_power: 25,
            blocks_created: 0
        },
        {
            address: "4fc60816142f1ed6ebaee121f96c2bdcc11fd700ac2a54baf07c5eea6e23b722e284301d1047601b27f5d162d1d317a0235b5465ec1fea1ef1499223ce37aa67",
            name: "validator3",
            stake_amount: 2500000000000000,
            commission_rate: 0.05,
            status: "active",
            voting_power: 25,
            blocks_created: 0
        },
        {
            address: "7a90f60556c293fd90500e5af6d1a1ae348fe648ae11027d72c609b367a51f6066812cd7e1386d977cfa02f93afb0ff6c3c63f4a9a5c367d57c85886ab7aa452",
            name: "validator4",
            stake_amount: 2500000000000000,
            commission_rate: 0.05,
            status: "active",
            voting_power: 25,
            blocks_created: 0
        }
    ];

    /**
     * Get genesis validators
     * @returns {Array} Genesis validators
     */
    function getValidators() {
        return GENESIS_VALIDATORS;
    }

    /**
     * Get validator by address
     * @param {string} address - Validator address
     * @returns {Object|null} Validator or null
     */
    function getValidatorByAddress(address) {
        return GENESIS_VALIDATORS.find(v => v.address.toLowerCase() === address.toLowerCase()) || null;
    }

    /**
     * Get validator count
     * @returns {number} Number of validators
     */
    function getValidatorCount() {
        return GENESIS_VALIDATORS.length;
    }

    /**
     * Get total voting power
     * @returns {number} Total voting power
     */
    function getTotalVotingPower() {
        return GENESIS_VALIDATORS.reduce((sum, v) => sum + (v.voting_power || 0), 0);
    }

    // Genesis initial accounts from genesis-mainnet.json
    // Balances are in 9 decimal format (matching TOKEN_DECIMALS: 9)
    const GENESIS_ACCOUNTS = [
        {
            address: "46c56dbc9b8169bfc189f9c13b61e46b1fea3ffd27a29c33224d03ef9ebfcb13f0b0391c2d3763479fe5608ba1848080d7e8debe9a8b9f0cc1a72e33af627d22",
            balance: "500000000000000000",
            name: "validator_rewards_pool",
            description: "Validator Rewards Pool (50% - 500M SBTC)"
        },
        {
            address: "618401f57a5a8c85e7cb9165037da015eb22dba0580a8abfe24f196c178bf28fb7736654349a21071cc95dc0f1d144a426541e02dd473ffbe5dabf4000878a88",
            balance: "80000000000000000",
            name: "community_reserve",
            description: "Community Reserve (8% - 80M SBTC)"
        },
        {
            address: "6520f7f3eeb5b7adec93a0e94738aa323ac341c9b60fcc347e965030ebc718c75f72d8a9d6b541803ba499c32874c168b187b15b7e3d8865e8470c737d59ef40",
            balance: "16000000000000000",
            name: "seed_round_vesting",
            description: "Seed Round Vesting (16M SBTC)"
        },
        {
            address: "f3e9e4edbf5b20f530e5476372bdff65135f85eb8c465a1890e416af2d1ff737e9f8618a3bd57dddbd3b13e7b42f25006f96b92a3ea1807d0e57089ea52f50ca",
            balance: "14000000000000000",
            name: "private_sale_vesting",
            description: "Private Sale Vesting (14M SBTC)"
        },
        {
            address: "fd53ef6480566603fce1403bf3ae3a1231cb1d522e718f75c00d2001ccf6f24d16a647e90fbc5fbb552251f6f38cbcfcfd935b00a392b921027197a18ea188e3",
            balance: "30000000000000000",
            name: "public_sale_vesting",
            description: "Public Sale Vesting (30M SBTC)"
        },
        {
            address: "e09e308e745b4e4213b44daf390df9bf9247611e4c9d2c751781468e2a961dd54f7404af91600138fd4f421fca4bbdf3ca64538a93babe802a1466ceb61d8a42",
            balance: "4000000000000000",
            name: "seed_round_tge",
            description: "Seed Round TGE (4M SBTC)"
        },
        {
            address: "7158f108e40fd49585a3f5b88ba9ef729bac64bb2f997a986e2d231757dcc3b6428794231aa1bbd1934755e53b13e06a0b0b0c2ed2caec21249de1f2ce55f2b3",
            balance: "6000000000000000",
            name: "private_sale_tge",
            description: "Private Sale TGE (6M SBTC)"
        },
        {
            address: "8578255292b343866e75387971a1010c74335d3fa4fefcfcbb5b69d03e1b7c265f2e35942ee9f1aefbceeaa117418f9076ca4397ca5fbe16110200a003ada475",
            balance: "30000000000000000",
            name: "public_sale_tge",
            description: "Public Sale TGE (30M SBTC)"
        },
        {
            address: "633134494749b82848b435c70c868450a46394851edf106f8407ef0223c0940630cbf88a82772ec37ff59171641c4048f9cb26f111470b63252f1e328dda697b",
            balance: "90000000000000000",
            name: "team_advisors",
            description: "Team & Advisors (9% - 90M SBTC)"
        },
        {
            address: "6497725c66bc98e0d1c778b3c2c42abe94f210432bbf3d360bce13a4f53f55bcae40b7c08247793a46a80f5e4c7c890b77a5cae626627a66d174659ca743f103",
            balance: "90000000000000000",
            name: "foundation",
            description: "Foundation (9% - 90M SBTC)"
        },
        {
            address: "e0785a80eb94a5fffe4ba66f2a32c9b86a6f404bdb3075f27d2de6e33cd847fec9201e8f424e4d2bd599fa754728c91370872f99463dd777a7380d7adfcfb8e6",
            balance: "60000000000000000",
            name: "early_investors",
            description: "Early Investors (6% - 60M SBTC)"
        },
        {
            address: "17aea1e75c6cdf0dd4ca212f6f61cf41ca188f3519f4e1decb54c74a4609d3c3ad40ec3e63c93704f76b866b06954c9da99095fa4f7dd131070b6c3b403a85d8",
            balance: "60000000000000000",
            name: "ecosystem_fund",
            description: "Ecosystem Fund (6% - 60M SBTC)"
        },
        {
            address: "5f0fcf7016596f9b8aad108ad5adfac377b3bfa220095eae1fabe969ebdda3900a08ac5c3fb6ad6a767512fa30987c2ba3346c19f243c57bef7d67bfae536138",
            balance: "10000000000000000",
            name: "airdrop",
            description: "Airdrop (1% - 10M SBTC)"
        }
    ];

    /**
     * Get initial accounts
     * @returns {Array} Genesis accounts
     */
    function getInitialAccounts() {
        return GENESIS_ACCOUNTS;
    }

    /**
     * Get account by address
     * @param {string} address - Account address
     * @returns {Object|null} Account or null
     */
    function getAccountByAddress(address) {
        return GENESIS_ACCOUNTS.find(a => a.address.toLowerCase() === address.toLowerCase()) || null;
    }

    return {
        getValidators,
        getValidatorByAddress,
        getValidatorCount,
        getTotalVotingPower,
        getInitialAccounts,
        getAccountByAddress,
    };
})();
