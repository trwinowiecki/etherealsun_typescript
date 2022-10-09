import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import type { PropsWithChildren } from 'react';
import type { Session } from 'next-auth';
import { SessionProvider, useSession } from 'next-auth/react';
import { StoreProvider } from '../utils/Store';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={pageProps.session}>
      <StoreProvider>
        {/* {Component.auth ? (
          <Auth> */}
        <Component {...pageProps} />
        {/* </Auth>
        ) : (
          <Component {...pageProps} />
        )} */}
      </StoreProvider>
    </SessionProvider>
  );
}

function Auth({ children }: PropsWithChildren) {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/unauthorized?message=login required');
    },
  });
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return children;
}

export default MyApp;
