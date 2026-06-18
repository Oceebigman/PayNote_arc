/**
 * Arc Testnet Contract Addresses
 * Source: https://docs.arc.io/arc/references/contract-addresses
 * All addresses verified from official Arc documentation.
 * Do NOT modify without re-checking docs.arc.io
 */

// Stablecoins
export const USDC_ADDRESS   = '0x3600000000000000000000000000000000000000' // 6 decimals ERC-20, 18 decimals native gas
export const EURC_ADDRESS   = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a' // 6 decimals
export const USYC_ADDRESS   = '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C' // 6 decimals — allowlist required
export const USYC_TELLER    = '0x9fdF14c5B14173D74C08Af27AebFf39240dC105A'
export const USYC_ENTITLE   = '0xcc205224862c7641930c87679e98999d23c26113'

// CCTP — Cross-Chain Transfer Protocol (Domain 26)
export const CCTP_DOMAIN              = 26
export const CCTP_TOKEN_MESSENGER_V2  = '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA'
export const CCTP_MESSAGE_TRANSMITTER = '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275'
export const CCTP_TOKEN_MINTER_V2     = '0xb43db544E2c27092c107639Ad201b3dEfAbcF192'
export const CCTP_MESSAGE_V2          = '0xbaC0179bB358A8936169a63408C8481D582390C4'

// Gateway (Domain 26)
export const GATEWAY_WALLET = '0x0077777d7EBA4688BDeF3E311b846F25870A19B9'
export const GATEWAY_MINTER = '0x0022222ABE238Cc2C7Bb1f21003F0a260052475B'

// StableFX
export const STABLEFX_ESCROW = '0x867650F5eAe8df91445971f14d89fd84F0C9a9f8'

// Transaction Extensions (Arc v0.7.2)
// Both route subcalls through CallFrom precompile — preserves original msg.sender
export const MEMO           = '0x5294E9927c3306DcBaDb03fe70b92e01cCede505' // Attaches memo metadata, emits Memo events
export const MULTICALL3FROM = '0x522fAf9A91c41c443c66765030741e4AaCe147D0' // Batches calls, preserves msg.sender

// Common Ethereum Contracts
export const CREATE2_FACTORY = '0x4e59b44847b379578588920cA78FbF26c0B4956C'
export const MULTICALL3      = '0xcA11bde05977b3631167028862bE2a173976CA11'
export const PERMIT2         = '0x000000000022D473030F116dDEE9F6B43aC78BA3'

// PayNote Contracts
export const PAYNOTE_ROUTER    = '0x829fe116E221d14Db289623028c5AC6b2F30BD82'
export const PAYNOTE_ROUTER_V2 = '0xc7190DBb23861b7dB15eED4326eBa33B0eeacEa4'

// Test address (blocklisted — for testing revert behavior only)
export const TEST_BLOCKLISTED = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
