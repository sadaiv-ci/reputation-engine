import { InMemoryPrivateKeyStore, BjjProvider, KmsKeyType, KMS, EthConnectionConfig, defaultEthConnectionConfig, CredentialStorage, InMemoryDataSource, W3CCredential, IdentityStorage, Identity, Profile, InMemoryMerkleTreeStorage, EthStateStorage, CredentialStatusResolverRegistry, CredentialStatusType, IssuerResolver, RHSResolver, OnChainResolver, AgentResolver, CredentialWallet, IdentityWallet, core, IProofService, ProofService, IIdentityWallet, ICredentialWallet, IStateStorage, CircuitStorage, CircuitData, CircuitId, FSCircuitStorage } from "@0xpolygonid/js-sdk";
import dotenv from 'dotenv'
import { Credential, Source } from "../types";
import { createCredentialRequest } from "./credential";
import { CIRCUITS_FOLDER, POLYGON_ID_CONTRACT_ADDRESS, POLYGON_MUMBAI_RPC, RHS_URL, WALLET_PRIVATE_KEY } from "../env";
import { ethers } from "ethers";
import path from "path";

dotenv.config();

// Convert the private key to a Buffer
const privateKeyBuffer = Buffer.from(WALLET_PRIVATE_KEY, 'hex');

// Ensure that the private key is 32 bytes long
if (privateKeyBuffer.length !== 32) {
  throw new Error("Private key must be 32 bytes long");
}

// Convert the Buffer to a Uint8Array
const encryptedSeed = new Uint8Array(privateKeyBuffer);

let id: IdentityWallet
let proofService: IProofService
let credentialWallet: CredentialWallet
let issuer: {
  did: core.DID;
  credential: W3CCredential;
}
let dataStorage: any

export const setup = async () => {
  // KMS setup.
  const keyStore = new InMemoryPrivateKeyStore();
  const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore);
  const kms = new KMS();
  kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

  // data storage.
  let conf: EthConnectionConfig = defaultEthConnectionConfig;
  conf.contractAddress = POLYGON_ID_CONTRACT_ADDRESS;
  conf.url = POLYGON_MUMBAI_RPC;

  dataStorage = {
    credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
    identity: new IdentityStorage(
      new InMemoryDataSource<Identity>(),
      new InMemoryDataSource<Profile>()
    ),
    mt: new InMemoryMerkleTreeStorage(40),

    states: new EthStateStorage(conf)
  };

  // Credential wallet.
  const resolvers = new CredentialStatusResolverRegistry();
  resolvers.register(CredentialStatusType.SparseMerkleTreeProof, new IssuerResolver());
  resolvers.register(
    CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
    new RHSResolver(dataStorage.states)
  );
  resolvers.register(
    CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
    new OnChainResolver([conf])
  );
  resolvers.register(CredentialStatusType.Iden3commRevocationStatusV1, new AgentResolver());

  credentialWallet = new CredentialWallet(dataStorage, resolvers);

  // id object created.
  id = new IdentityWallet(kms, dataStorage, credentialWallet);

  proofService = await initProofService(id, credentialWallet, dataStorage.states)

  await initIssuer()

  console.log("🆔 [id]: Identity setup successful.")

  return { identityWallet: id, credentialWallet }
}

export const initProofService = async (
  identityWallet: IIdentityWallet,
  credentialWallet: ICredentialWallet,
  stateStorage: IStateStorage
): Promise<ProofService> => {
  const circuitStorage = new FSCircuitStorage({ dirname: path.join(__dirname, '../circuits') });

  return new ProofService(identityWallet, credentialWallet, circuitStorage, stateStorage);

}

export const initIssuer = async () => {
  issuer = await id.createIdentity({
    method: core.DidMethod.Iden3,
    blockchain: core.Blockchain.Polygon,
    networkId: core.NetworkId.Mumbai,
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: RHS_URL
    },
    seed: encryptedSeed
  })
}

export const issueCredentials = async (s: Source, did: string) => {

  const reputationCredential: Credential = { value: s.reputation, name: "Reputation", description: "", type: 'Reputation' }
  const creds = [reputationCredential, ...s.credentials]

  // Issue other types of credentials.

  const issueCredsPromise: Promise<W3CCredential>[] = []
  creds.forEach((cred) => {
    const issueCredReq = createCredentialRequest(did, cred)
    issueCredsPromise.push(id.issueCredential(issuer.did, issueCredReq, { ipfsGatewayURL: "https://ipfs.io/ipfs/" }))
  })


  const response = await Promise.all(issueCredsPromise)



  // ================= generate Iden3SparseMerkleTreeProof =======================

  const res = await id.addCredentialsToMerkleTree(response, issuer.did);

  // ================= push states to rhs ===================

  await id.publishStateToRHS(issuer.did, RHS_URL);

  const provider = (dataStorage.states as EthStateStorage).provider as any as ethers.JsonRpcProvider
  const ethSigner = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);

  const txId = await proofService.transitState(
    issuer.did,
    res.oldTreeState,
    true,
    dataStorage.states,
    ethSigner as any
  );

  console.log('Transaction ID:', txId);

  return {
    creds: response
  }
}

export default { setup }
