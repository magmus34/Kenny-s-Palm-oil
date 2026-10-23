import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import rawConfig from '../firebase-applet-config.json';

// Validate and prioritize the actual provisioned firebase-applet-config.json credentials
function resolveValidCredential(
  rawVal: string | undefined,
  envVal: string | undefined,
  fallback: string
): string {
  if (rawVal && rawVal.trim() && !rawVal.includes('...') && rawVal.length > 5) {
    return rawVal;
  }
  if (envVal && envVal.trim() && !envVal.includes('...') && envVal.length > 5 && !['apiKey', 'authDomain', 'projectId', 'appId', 'storageBucket', 'messagingSenderId'].includes(envVal)) {
    return envVal;
  }
  return fallback;
}

const firebaseConfig = {
  apiKey: rawConfig.apiKey && rawConfig.apiKey.startsWith('AIza') ? rawConfig.apiKey : (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || rawConfig.apiKey),
  authDomain: resolveValidCredential(rawConfig.authDomain, process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, 'project-d8dd0e03-cbfc-4ee5-a7a.firebaseapp.com'),
  projectId: resolveValidCredential(rawConfig.projectId, process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, 'project-d8dd0e03-cbfc-4ee5-a7a'),
  storageBucket: resolveValidCredential(rawConfig.storageBucket, process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, 'project-d8dd0e03-cbfc-4ee5-a7a.firebasestorage.app'),
  messagingSenderId: resolveValidCredential(rawConfig.messagingSenderId, process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, '627860072441'),
  appId: resolveValidCredential(rawConfig.appId, process.env.NEXT_PUBLIC_FIREBASE_APP_ID, '1:627860072441:web:4886b7abbf76fe411dbf28'),
  firestoreDatabaseId: rawConfig.firestoreDatabaseId || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || 'ai-studio-acac9fde-64f4-435a-ba97-4545158e0502',
};

// Singleton Firebase initialization
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firestore with experimentalForceLongPolling to ensure reliable connectivity
// in sandboxed iframe environments, Cloud Run, and behind restrictive proxies
let db: Firestore;
try {
  db = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);
export { db, app, firebaseConfig };

// Validate connection on initial client boot gracefully
if (typeof window !== 'undefined') {
  (async () => {
    try {
      await getDoc(doc(db, 'settings', 'store'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firebase client is offline or network restricted. Operating with cached data.');
      }
    }
  })();
}
