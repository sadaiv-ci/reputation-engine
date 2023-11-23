import dotenv from 'dotenv'

dotenv.config()

export const PORT = process.env.PORT || 4000;

export const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY ?? ''
export const APP_ID = process.env.GITHUB_APP_ID ?? ''

export const FIREBASE_CONFIG = process.env.FIREBASE_CONFIG ?? ''

export const RHS_URL = process.env.POLGYON_ID_RHS_URL ?? ''
export const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY ?? ''

export const POLYGON_ID_CONTRACT_ADDRESS = process.env.POLYGON_ID_CONTRACT_ADDRESS ?? ''
export const POLYGON_MUMBAI_RPC = process.env.POLYGON_MUMBAI_RPC ?? ''