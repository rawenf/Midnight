import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import LoadingScreen from '../components/LoadingScreen';

interface AuthContextType {
  user: User | null;
  profileData: any | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profileData: null, loading: true, isAdmin: false });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen to profile changes
        unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            // Ensure counts exist in local state
            setProfileData({
              followersCount: 0,
              followingCount: 0,
              ...data
            });
          } else {
            // Initial profile creation if doesn't exist
            setDoc(userRef, {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              handle: firebaseUser.email?.split('@')[0].toLowerCase() || 'void',
              photoURL: firebaseUser.photoURL,
              followersCount: 0,
              followingCount: 0,
              createdAt: serverTimestamp(),
            }).catch(err => console.warn("Initial profile creation failed:", err));
          }
        }, (error) => {
          console.warn("Profile listener error:", error);
          // If permission denied, we might be in a logout transition
          if (error.code === 'permission-denied') {
            setProfileData(null);
          }
        });
      } else {
        setProfileData(null);
        if (unsubscribeProfile) unsubscribeProfile();
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profileData, loading, isAdmin }}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};
