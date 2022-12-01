import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User
} from 'firebase/auth';
import { createContext, useEffect, useReducer } from 'react';
import { AuthCommands } from './AuthCommands';
import { auth } from './firebase';

interface AuthContextInterface {
  state: State;
  dispatch: React.Dispatch<any>;
}

type State = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

const initialState: State = {
  user: null,
  loading: true,
  error: null
};

type Action = {
  type: AuthCommands.LOGIN_EMAIL_PASSWORD;
  payload: { email: string; password: string };
};

const reducer = (state: State, action: Action): State => {
  if (typeof window !== undefined) {
    switch (action.type) {
      case AuthCommands.LOGIN_EMAIL_PASSWORD: {
        const { email, password } = action.payload;
        let user = null;
        let error = null;
        signInWithEmailAndPassword(auth, email, password)
          .then(
            userCredential => (user = userCredential),
            rejected => (error = rejected)
          )
          .catch(error => (error = error));

        return { user, loading: false, error };
      }
    }
  }
};

export const FirebaseAuth = createContext<AuthContextInterface>({
  state: initialState,
  dispatch: () => null
});

export const FirebaseAuthProvider = ({ children }: React.PropsWithChildren) => {
  let user: User | null = null;
  let error = null;
  useEffect(() => {
    const sub = onAuthStateChanged(auth, user => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        user = user;
        // ...
      } else {
        // User is signed out
        // ...
        error = 'Logged out';
      }
    });

    return sub;
  }, []);

  const [state, dispatch] = useReducer(reducer, initialState);

  if (user && user.uid !== state.user?.uid) {
    state.user = user;
  } else if (error && error !== state.error) {
    state.error = error;
  }

  const value = { state, dispatch };
  return (
    <FirebaseAuth.Provider value={value}>{children}</FirebaseAuth.Provider>
  );
};
