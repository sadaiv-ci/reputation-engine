import { CredentialRequest, CredentialStatusType } from "@0xpolygonid/js-sdk";
import { getExpirationTime } from "../helper/maths";
import { Credential, REPUTATION_DECIMAL_POINTS } from "../types";
import { RHS_URL } from "../env";

export const createCredentialRequest = (userDid: string, credential: Credential) => {

  const expiry = getExpirationTime().getTime() / 1000 // To get UNIX timestamp.
  const score = parseInt((credential.value * (credential.value % 1 !== 0 ? Math.pow(10, REPUTATION_DECIMAL_POINTS) : 1)).toString())

  const credentialRequest: CredentialRequest = {
    credentialSchema:
      `http://localhost:4000/schemas/${credential.type}/cred.json`,
    type: `ProofOf${credential.type}`,
    credentialSubject: {
      id: userDid,
      score,
      calculatedOn: Date.now(),
    },
    expiration: expiry,
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: RHS_URL
    }
  };

  if (credential.properties) {
    credentialRequest.credentialSubject = {
      ...credentialRequest.credentialSubject,
      ...credential.properties
    }
  }
  return credentialRequest;
}

