import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import React from 'react';
import { Database } from '../types/SupabaseDbTypes';

const Login = () => {
  const supabase = useSupabaseClient<Database>();

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={['apple', 'facebook', 'google']}
      view={'sign_in'}
    />
  );
};

export default Login;
