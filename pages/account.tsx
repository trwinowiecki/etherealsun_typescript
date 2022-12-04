import { useRouter } from 'next/router';

import Layout from '../components/Layout';
import { useFirebaseAuth } from '../utils/firebase/firebaseAuth';

const account = () => {
  const { user } = useFirebaseAuth();
  const router = useRouter();

  if (!user) {
    router.push('/');
  }

  return <Layout title="Account Settings">account</Layout>;
};

export default account;
