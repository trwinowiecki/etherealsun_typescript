/* eslint-disable react-hooks/exhaustive-deps */
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import AddressForm from '../components/AddressForm';
import Layout from '../components/Layout';

const account = () => {
  const router = useRouter();
  const session = useSession();
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    const getUser = async () => {};
    if (!session?.user.id) {
      router.push('/');
    }
  }, [session?.user]);

  return (
    <Layout title="Account Settings">
      {/* <h1>{user?.displayName ? `Hi, ${user.displayName}!` : 'Hi!'}</h1> */}
      <AddressForm />
    </Layout>
  );
};

export default account;
