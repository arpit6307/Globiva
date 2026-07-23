import { initializeApp, deleteApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updatePassword
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "watch-together-app-b7392",
  appId: "1:261640063005:web:edf18a2befc98c765a9ef4",
  databaseURL: "https://watch-together-app-b7392-default-rtdb.firebaseio.com",
  storageBucket: "watch-together-app-b7392.firebasestorage.app",
  apiKey: "AIzaSyCXaJzxQDea4_09U-00p15Nn6LKC6JE8J4",
  authDomain: "watch-together-app-b7392.firebaseapp.com",
  messagingSenderId: "261640063005"
};

// Initialize Primary App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Creates an employee account on the client side without logging out the current admin.
 * Uses a temporary secondary app instance that is created and destroyed on demand.
 */
export const createSecondaryUser = async (email, password) => {
  const secondaryAppName = `SecondaryApp_${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);
  
  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const newUid = userCredential.user.uid;
    // Sign out of secondary instance to prevent it from persisting local state
    await signOut(secondaryAuth);
    // Destroy secondary app to prevent memory leak
    await deleteApp(secondaryApp);
    return newUid;
  } catch (error) {
    // Attempt cleanup in case of error
    try {
      await deleteApp(secondaryApp);
    } catch (_) {}
    throw error;
  }
};

export default app;
