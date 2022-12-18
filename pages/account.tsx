/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import AddressForm from '../components/AddressForm';
import Layout from '../components/Layout';
import { useFirebaseAuth } from '../utils/firebase/firebaseAuth';

const account = () => {
  const { user } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.uid) {
      router.push('/');
    }
  }, [user?.uid]);

  return (
    <Layout title="Account Settings">
      <h1>{user?.displayName ? `Hi, ${user.displayName}!` : 'Hi!'}</h1>
      <AddressForm />
    </Layout>
  );
};

export default account;
