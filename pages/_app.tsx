import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Session, SessionContextProvider } from '@supabase/auth-helpers-react';
import { AppProps } from 'next/app';
import { useState } from 'react';

import '../styles/globals.scss';
import { Database } from '../types/SupabaseDbTypes';
import { StoreProvider } from '../utils/Store';

function MyApp({
  Component,
  pageProps
}: AppProps<{ initialSession: Session }>) {
  const [supabase] = useState(() => createBrowserSupabaseClient<Database>());

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <StoreProvider>
        <Component {...pageProps} />
      </StoreProvider>
    </SessionContextProvider>
  );
}

export default MyApp;
