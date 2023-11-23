import { BaseSchemaType, CredentialType } from "../types"

export const getSchemaFromCredentialType = (type: CredentialType, ld: boolean) => {

  let cred: BaseSchemaType

  switch (type) {
    case 'Reputation':
      cred = {
        type: type,
        title: "Reputation Credential",
        description: "Sadaiv Protocol's reputation credential issued based on developer's Proof of Work.",
        scoreTitle: "Reputation Score",
        scoreDescription: "The reputation score of the developer calculated by Sadaiv's Reputation Engine."
      }
      if (ld) {
        return CREDENTIAL_SCHEMA_JSONLD(cred)
      }
      return CREDENTIAL_SCHEMA_JSON(cred)

    case 'PublicRepository':
      cred = {
        type: type,
        title: "Public Repositories Credential",
        description: "Credential that signifies number of owned (not fork) public repositories of the developer.",
        scoreTitle: "Number of Public Repositories",
        scoreDescription: "Total number of public repositories owned by the developer"
      }
      if (ld) {
        return CREDENTIAL_SCHEMA_JSONLD(cred)
      }
      return CREDENTIAL_SCHEMA_JSON(cred)


    case 'ValidForkRepository':
      cred = {
        type: type,
        title: "Valid Fork Repositories Credential",
        description: "Credential that signifies number of valid fork (atleast one commit by user) public repositories are of the developer.",
        scoreTitle: "Number of Valid Forked Repositories",
        scoreDescription: "Total number of fork repositories with atleast one commit by developer"
      }
      if (ld) {
        return CREDENTIAL_SCHEMA_JSONLD(cred)
      }
      return CREDENTIAL_SCHEMA_JSON(cred)

    case 'YearsOfExperience':
      cred = {
        type: type,
        title: "Years of Experience Credential",
        description: "Number of years of experience developer have been on GitHub.",
        scoreTitle: "Number of Years",
        scoreDescription: ""
      }
      if (ld) {
        return CREDENTIAL_SCHEMA_JSONLD(cred)
      }
      return CREDENTIAL_SCHEMA_JSON(cred)

    case 'Consistency':
      cred = {
        type: type,
        title: "Consistency Score Credential",
        description: "Developer code activity score from GitHub issued by Sadaiv Reputation Engine.",
        scoreTitle: "Consistency Score",
        scoreDescription: "Range (0 to 1), more the better."
      }
      if (ld) {
        return CREDENTIAL_SCHEMA_JSONLD(cred)
      }
      return CREDENTIAL_SCHEMA_JSON(cred)

    case 'LanguageProjects':
      cred = {
        type: type,
        title: "Programming Language Credential",
        description: "Credential issued based on developer's experience in a programming language.",
        scoreTitle: "Number of Repositories",
        scoreDescription: "Total number of repositories that uses this language as primary.",

        properties: {
          language: {
            title: "Programming Language",
            description: "Name of the programming language",
            type: "string"
          }
        }
      }
      if (ld) {
        return CREDENTIAL_SCHEMA_JSONLD(cred)
      }
      return CREDENTIAL_SCHEMA_JSON(cred)

  }
}

// List of schemas & structures.
export const CREDENTIAL_SCHEMA_JSONLD = (cred: BaseSchemaType) => JSON.parse(`
  {
    "@context": [
        {
            "@protected": true,
            "@version": 1.1,
            "id": "@id",
            "type": "@type",
            "ProofOf${cred.type}": {
                "@context": {
                    "@propagate": true,
                    "@protected": true,
                    "vocab": "http://localhost:4000/schemas/${cred.type}/cred#",
                    "xsd": "http://www.w3.org/2001/XMLSchema#",
                    "score": {
                        "@id": "vocab:score",
                        "@type": "xsd:integer"
                    },
                    ${cred.properties ?
    Object.entries(cred.properties)
      .map((i) => {
        const k = i[0]
        const p = i[1]
        return `
                "${k}": {
                  "@id": "vocab:${k}",
                  "@type": "xsd:${p.type}"
                },
              `
      }) : ""}
                    "calculatedOn": {
                        "@id": "vocab:calculatedOn",
                        "@type": "xsd:integer"
                    }
                },
                "@id": "http://localhost:4000/schemas/${cred.type}/cred.jsonld#ProofOf${cred.type}"
            }
        }
    ]
  }
`)

export const CREDENTIAL_SCHEMA_JSON = (cred: BaseSchemaType) => JSON.parse(`
  {
    "$metadata": {
        "uris": {
            "jsonLdContext": "http://localhost:4000/schemas/${cred.type}/cred.jsonld"
        },
        "version": "1.0",
        "type": "ProofOf${cred.type}"
    },
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "description": "${cred.description}",
    "title": "${cred.title}",
    "properties": {
        "credentialSubject": {
            "description": "Stores the data of the credential",
            "title": "Credential subject",
            "properties": {
                "id": {
                    "description": "Stores the DID of the subject that owns the credential",
                    "title": "Credential subject ID",
                    "format": "uri",
                    "type": "string"
                },
                "score": {
                    "description": "${cred.scoreDescription}",
                    "title": "${cred.scoreTitle}",
                    "type": "integer"
                },
                ${cred.properties ?
    Object.entries(cred.properties)
      .map((item) => {
        const k = item[0]
        const v = item[1]

        return `
                    "${k}": {
                      "title": "${v.title}",
                      "description": "${v.description}",
                      "type": "${v.type}"
                    },
                  `
      }) : ""}
                "calculatedOn": {
                    "description": "Exact time at which it was calculated.",
                    "title": "Timestamp of Calculation",
                    "type": "integer"
                }
            },
            "required": [
                "score",
                "calculatedOn"
                ${cred.properties ? ', ' + Object.keys(cred.properties).map((v, i) => `"${v}"` + (i == (Object.keys(cred.properties!).length - 1) ? '' : ',')) : ""}
            ],
  "type": "object"
          },
  "@context": {
    "type": [
      "string",
      "array",
      "object"
    ]
  },
  "expirationDate": {
    "format": "date-time",
      "type": "string"
  },
  "id": {
    "type": "string"
  },
  "issuanceDate": {
    "format": "date-time",
      "type": "string"
  },
  "issuer": {
    "type": [
      "string",
      "object"
    ],
      "format": "uri",
        "properties": {
      "id": {
        "format": "uri",
          "type": "string"
      }
    },
    "required": [
      "id"
    ]
  },
  "type": {
    "type": [
      "string",
      "array"
    ],
      "items": {
      "type": "string"
    }
  },
  "credentialSchema": {
    "properties": {
      "id": {
        "format": "uri",
          "type": "string"
      },
      "type": {
        "type": "string"
      }
    },
    "required": [
      "id",
      "type"
    ],
      "type": "object"
  }
      },
  "required": [
    "credentialSubject",
    "@context",
    "id",
    "issuanceDate",
    "issuer",
    "type",
    "credentialSchema"
  ],
    "type": "object"
    }
`)
