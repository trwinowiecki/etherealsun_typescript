import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Session, SessionContextProvider } from '@supabase/auth-helpers-react';
import { AppProps } from 'next/app';
import { useState } from 'react';
import '../styles/globals.scss';

import { StoreProvider } from '../utils/Store';

function MyApp({
  Component,
  pageProps
}: AppProps<{ initialSession: Session }>) {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      {/* <FirebaseAuthProvider> */}
      <StoreProvider>
        {/* {Component.auth ? (
        <Auth> */}
        <Component {...pageProps} />
        {/* </Auth>
        ) : (
          <Component {...pageProps} />
        )} */}
      </StoreProvider>
      {/* </FirebaseAuthProvider> */}
    </SessionContextProvider>
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
