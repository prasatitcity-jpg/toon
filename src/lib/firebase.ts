import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import configData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: configData.apiKey,
  authDomain: configData.authDomain,
  projectId: configData.projectId,
  storageBucket: configData.storageBucket,
  messagingSenderId: configData.messagingSenderId,
  appId: configData.appId,
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Support named firestoreDatabaseId if configured in project
export const db: Firestore = configData.firestoreDatabaseId
  ? getFirestore(app, configData.firestoreDatabaseId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);
export { app };
export const databaseId = configData.firestoreDatabaseId || '(default)';
export const projectId = configData.projectId;
