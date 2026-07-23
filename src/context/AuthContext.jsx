import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'employee'
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up as Admin
  const signupAdmin = async (name, email, password, designation) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const adminData = {
      role: 'admin',
      name,
      email,
      designation: designation || 'Trainer',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Save to Firestore
    await setDoc(doc(db, 'users', user.uid), adminData);
    
    // Sign out immediately as they need Master Admin approval
    await signOut(auth);
    setUserRole(null);
    setUserData(null);
    return user;
  };

  // Login (Email/Password)
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error('User record not found in database.');
    }
    
    const data = userDoc.data();
    if (data.status === 'inactive') {
      await signOut(auth);
      throw new Error('Your account has been deactivated. Please contact an Admin.');
    }
    if (data.status === 'pending') {
      await signOut(auth);
      throw new Error('Your account is pending approval by the Master Admin (admin@globiva.com). Please check back later.');
    }
    
    setUserRole(data.role);
    setUserData(data);
    return user;
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserRole(null);
    setUserData(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.status === 'active') {
              setCurrentUser(user);
              setUserRole(data.role);
              setUserData(data);
            } else {
              // User deactivated
              await signOut(auth);
              setCurrentUser(null);
              setUserRole(null);
              setUserData(null);
            }
          } else {
            // No firestore document
            setCurrentUser(user);
            setUserRole(null);
            setUserData(null);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userData,
    loading,
    login,
    logout,
    signupAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
