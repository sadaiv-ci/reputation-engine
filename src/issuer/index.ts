import { InMemoryPrivateKeyStore, BjjProvider, KmsKeyType, KMS, EthConnectionConfig, defaultEthConnectionConfig, CredentialStorage, InMemoryDataSource, W3CCredential, IdentityStorage, Identity, Profile, InMemoryMerkleTreeStorage, EthStateStorage, CredentialStatusResolverRegistry, CredentialStatusType, IssuerResolver, RHSResolver, OnChainResolver, AgentResolver, CredentialWallet, IdentityWallet, core } from "@0xpolygonid/js-sdk";
import dotenv from 'dotenv'
import { Credential, Source } from "../types";
import { createCredentialRequest } from "./credential";
import { POLYGON_ID_CONTRACT_ADDRESS, POLYGON_MUMBAI_RPC, RHS_URL, WALLET_PRIVATE_KEY } from "../env";

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
let credentialWallet: CredentialWallet
let issuer: {
  did: core.DID;
  credential: W3CCredential;
}

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

  let dataStorage = {
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

  await initIssuer()

  console.log("🆔 [id]: Identity setup successful.")

  return { identityWallet: id, credentialWallet }
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

  return {
    creds: response
  }
}

export default { setup }
