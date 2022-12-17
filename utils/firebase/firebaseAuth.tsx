import { FirebaseError } from 'firebase/app';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  UserCredential
} from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { auth } from '../../pages/api/firebase';

interface FirebaseAuthContext {
  user: User | null;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInProvider: (providerId: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

export const useFirebaseAuth = () => {
  return useContext(FirebaseAuth);
};

const AuthCommands = {
  signIn: (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },
  signInProvider: (providerId: string) => {
    let provider;
    switch (providerId) {
      case 'google': {
        provider = new GoogleAuthProvider();
        break;
      }
      case 'facebook': {
        provider = new FacebookAuthProvider();
        break;
      }
      default: {
        throw new FirebaseError('Unknown Provider', 'Unknown Provider');
      }
    }
    return signInWithPopup(auth, provider);
  },
  logout: () => {
    return signOut(auth);
  }
};

export const FirebaseAuth = createContext<FirebaseAuthContext>({
  user: null,
  ...AuthCommands
});

export const FirebaseAuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, newUser => setUser(newUser));
    return () => unSubscribe();
  }, []);

  const value = useMemo(() => ({ user, ...AuthCommands }), [user]);

  return (
    <FirebaseAuth.Provider value={value}>{children}</FirebaseAuth.Provider>
  );
};
