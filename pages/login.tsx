import { useRouter } from 'next/router';
import { useContext } from 'react';
import Layout from '../components/Layout';
import { FirebaseAuth } from '../utils/firebase/firebaseAuth';

const login = () => {
  const { state, dispatch } = useContext(FirebaseAuth);
  const router = useRouter();

  if (state.user) {
    router.push('/');
  }

  return (
    <Layout title="Login">
      <div className="flex items-center justify-center w-screen h-screen">
        Login
      </div>
    </Layout>
  );
};

export default login;
