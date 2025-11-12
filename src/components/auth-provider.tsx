'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import type { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  rawUser: User | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  rawUser: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [rawUser, setRawUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useFirebaseAuth();
  const db = useFirestore();

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setRawUser(firebaseUser);
        const userDocRef = doc(db, 'voyagers', firebaseUser.uid);
        
        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            console.warn("User document not found for authenticated user:", firebaseUser.uid);
            // This can happen briefly during signup. Let's create a temporary profile.
            const role = firebaseUser.email?.includes('@cruiselink.com') ? (firebaseUser.email.split('@')[0] as UserProfile['role']) : 'voyager';
            const tempProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              role: role,
            };
            setUser(tempProfile);
          }
        } catch (error: any) {
           if (error.code === 'permission-denied') {
             const permissionError = new FirestorePermissionError({ path: userDocRef.path, operation: 'get' });
             errorEmitter.emit('permission-error', permissionError);
           } else {
             console.error('Error fetching user document:', error);
           }
           setUser(null);
        }
      } else {
        setUser(null);
        setRawUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const value = { user, loading, rawUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAppAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAppAuth must be used within an AuthProvider');
  }
  return context;
};
