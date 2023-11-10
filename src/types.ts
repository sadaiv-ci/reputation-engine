export const REPUTATION_DECIMAL_POINTS = 8

export type Credential = {
  name: string
  description: string
  value: number
}

export type Source = {
  reputation: number
  credentials: Credential[]
}

export type Reputation = {
  reputation: number
  sources: Source[]
}

