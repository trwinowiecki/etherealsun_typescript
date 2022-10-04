import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider, useSession } from 'next-auth/react';
import { StoreProvider } from '../utils/Store';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider>
      <Component {...pageProps} />
    </StoreProvider>
  );
}

export default MyApp;
