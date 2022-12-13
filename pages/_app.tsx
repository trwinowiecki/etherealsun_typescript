import { AppProps } from 'next/app';

import '../styles/globals.scss';
import { FirebaseAuthProvider } from '../utils/firebase/firebaseAuth';
import { StoreProvider } from '../utils/Store';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <FirebaseAuthProvider>
      <StoreProvider>
        {/* {Component.auth ? (
        <Auth> */}
        <Component {...pageProps} />
        {/* </Auth>
        ) : (
          <Component {...pageProps} />
        )} */}
      </StoreProvider>
    </FirebaseAuthProvider>
  );
}

// function Auth({ children }: PropsWithChildren) {
//   const router = useRouter();
//   const { status } = useSession({
//     required: true,
//     onUnauthenticated() {
//       router.push('/unauthorized?message=login required');
//     }
//   });
//   if (status === 'loading') {
//     return <div>Loading...</div>;
//   }

//   return children;
// }

export default MyApp;
