export const REPUTATION_DECIMAL_POINTS = 8
export const REPUTATION_EXPIRATION_TIME = 14

export type CredentialType = 'PublicRepository' | 'ValidForkRepository' | 'YearsOfExperience' | 'LanguageProjects' | 'Consistency' | 'Reputation'

export type Credential = {
  name: string
  description: string
  value: number
  type: CredentialType
  properties?: {
    [key: string]: any
  }
}

export type Source = {
  reputation: number
  credentials: Credential[]
}

export type Reputation = {
  reputation: number
  sources: Source[]
}


export type BaseSchemaType = {
  type: CredentialType,
  title: string,
  description: string,

  scoreTitle: string,
  scoreDescription: string,

  properties?: {
    [key: string]: {
      title: string,
      description: string,
      type: 'integer' | 'string' // for decimal values the type format changes in json & jsonld.
    }
  }
}

