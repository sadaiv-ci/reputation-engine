import { FirebaseApp, initializeApp } from 'firebase/app'
import { getFirestore, query, collection, where, getDocs } from '@firebase/firestore'

const DEVELOPERS_COLLECTION_NAME = 'developers'

let app: FirebaseApp

export const initFirebase = () => {
  try {
    const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG!)
    app = initializeApp(firebaseConfig)
    console.log('✨ [firebase]: initalised successfully.')
  } catch (e) {
    console.log(`[error]: ${e}`)
  }
}


// Function to get installationId of the user from wallet address.
export const getUserFromWallet = async (scw: string): Promise<string | null> => {
  const db = getFirestore(app)

  const q = query(collection(db, DEVELOPERS_COLLECTION_NAME), where('scwAddress', "==", scw))
  const snapshot = await getDocs(q)

  const docs = snapshot.docs

  if (docs.length == 0) return null;

  const doc = docs[0]

  const installationId = doc.data()['installation_id']

  return installationId
}

