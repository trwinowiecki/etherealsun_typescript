/* eslint-disable react/jsx-no-constructed-context-values */
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
import { createContext, useContext, useEffect, useState } from 'react';

import { auth } from '../../pages/api/firebase';

interface FirebaseAuthContext {
  user?: User | null;
  signIn?: (email: string, password: string) => Promise<UserCredential>;
  logout?: () => Promise<void>;
  signInProvider?: (providerId: string) => Promise<UserCredential>;
}

export const useFirebaseAuth = () => {
  return useContext(FirebaseAuth);
};

export const FirebaseAuth = createContext<FirebaseAuthContext>({});

export const FirebaseAuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInProvider = (providerId: string) => {
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
        throw { code: 'Unkown Provider' };
      }
    }

    return signInWithPopup(auth, provider);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, newUser => setUser(newUser));
  }, []);

  const value = { user, signIn, logout, signInProvider };

  return (
    <FirebaseAuth.Provider value={value}>{children}</FirebaseAuth.Provider>
  );
};
