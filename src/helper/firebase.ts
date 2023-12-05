import { FirebaseApp, initializeApp } from 'firebase/app'
import { getFirestore, query, collection, where, getDocs, updateDoc, DocumentReference } from '@firebase/firestore'
import { FIREBASE_CONFIG } from '../env'
import { W3CCredential } from '@0xpolygonid/js-sdk'

const DEVELOPERS_COLLECTION_NAME = 'developers'

let app: FirebaseApp

export const initFirebase = () => {
  try {
    const firebaseConfig = JSON.parse(FIREBASE_CONFIG)
    app = initializeApp(firebaseConfig)
    console.log('✨ [firebase]: initalised successfully.')
  } catch (e) {
    console.log(`[error]: ${e}`)
  }
}


// Function to get installationId of the user from wallet address.
export const getUserFromWallet = async (scw: string): Promise<any> => {
  const db = getFirestore(app)

  const q = query(collection(db, DEVELOPERS_COLLECTION_NAME), where('scwAddress', "==", scw))
  const snapshot = await getDocs(q)

  const docs = snapshot.docs
  console.log('⚡️ [server]: Fetching user: ', scw, docs.length)

  if (docs.length == 0) return null;

  const doc = docs[0]

  const installationId = doc.data()['installation_id']
  const did = doc.data()['did']

  const reputation = doc.data()['reputation']
  const reputationCalculatedOn = doc.data()['reputationCalculatedOn']

  return { installationId, did, reputation, reputationCalculatedOn }
}

export const getUserDocRef = async (scw: string) => {

  const db = getFirestore(app)

  const q = query(collection(db, DEVELOPERS_COLLECTION_NAME), where('scwAddress', "==", scw))
  const snapshot = await getDocs(q)

  const docs = snapshot.docs

  if (docs.length == 0) return null;

  const doc = docs[0].ref

  return doc
}

export const updateReputationAndCredentials = async (ref: DocumentReference<any>, reputation: number, calculatedOn: number, creds: W3CCredential[]) => {
  try {
    await updateDoc(ref, {
      reputation,
      reputationCalculatedOn: calculatedOn.toString(),

      credentials: creds.map((i) => JSON.stringify(i.toJSON()))
    })
    return true;
  } catch (e) {
    console.log("[firebase]: Error", e)
    return null;
  }
}
