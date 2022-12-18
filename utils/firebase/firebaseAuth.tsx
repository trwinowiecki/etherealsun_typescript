import axios, { AxiosResponse } from 'axios';
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
import { Customer, SearchCustomersResponse } from 'square';

import { SquareCommand } from '../../enums/SquareCommands';
import { auth } from '../../pages/api/firebase';

export interface CustomUser extends User {
  squareCustomer?: Customer | null;
}

interface FirebaseAuthContext {
  user: CustomUser | null;
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
  const [squareCustomer, setSquareCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, async newUser => {
      if (newUser?.email) {
        const squareRes: AxiosResponse<SearchCustomersResponse> = await axios({
          method: 'POST',
          url: `api/square`,
          data: { type: SquareCommand.SEARCH_FOR_USER, email: newUser?.email }
        });

        setSquareCustomer(prev =>
          squareRes.data.customers?.length === 1
            ? squareRes.data.customers[0]
            : prev
        );
      }

      setUser(newUser);
    });
    return () => unSubscribe();
  }, []);

  const value: FirebaseAuthContext = useMemo(
    () => ({
      user: user ? { ...user, squareCustomer } : null,
      ...AuthCommands
    }),
    [user, squareCustomer]
  );

  return (
    <FirebaseAuth.Provider value={value}>{children}</FirebaseAuth.Provider>
  );
};
