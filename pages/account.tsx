/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import Layout from '../components/Layout';
import { useFirebaseAuth } from '../utils/firebase/firebaseAuth';

const account = () => {
  const { user } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user]);

  return <Layout title="Account Settings">account</Layout>;
};

export default account;
