import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@ui/Button';
import Divider from '@ui/Divider';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify';

import Layout from '../components/Layout';
import { useFirebaseAuth } from '../utils/firebase/firebaseAuth';

interface LoginProps {
  callbackUrl: string;
}

const GoogleIconSvg = (
  <svg
    height="100%"
    viewBox="0 0 20 20"
    width="100%"
    fit=""
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
  >
    <path
      d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
      fill="#4285F4"
    />
    <path
      d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
      fill="#34A853"
    />
    <path
      d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
      fill="#FBBC05"
    />
    <path
      d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
      fill="#EA4335"
    />
  </svg>
);

const login = ({ callbackUrl }: LoginProps) => {
  const { signIn, user, signInProvider } = useFirebaseAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });

  if (user) {
    router.push('/');
  }

  const handleChange = (event: any) => {
    setFormData(prev => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      await signIn(formData.email, formData.password);
      router.push(callbackUrl || '/');
    } catch (error) {
      toast.error(`Failed: ${error.code}`);
    }
  };

  const handleProviderLogin = async (providerId: string) => {
    try {
      await signInProvider(providerId);
      router.push(callbackUrl || '/');
    } catch (error) {
      toast.error(`Failed: ${error.code}`);
    }
  };

  const loginProviders = [
    {
      name: 'Google',
      id: 'google',
      icon: faGoogle,
      iconColor: 'white',
      bgColor: '#dB4437'
    },
    {
      name: 'Facebook',
      id: 'facebook',
      icon: faFacebook,
      iconColor: '#4267B2',
      bgColor: 'white'
    }
  ];

  return (
    <Layout title="Login">
      <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center justify-center w-full sm:max-w-md">
          <form className="w-[90%] flex flex-col gap-2" onSubmit={handleSubmit}>
            <label
              htmlFor="email"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-md"
            >
              Email
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={e => handleChange(e)}
                required
                autoComplete="true"
                className="flex-1 py-1 pl-2 bg-transparent"
              />
            </label>
            <label
              htmlFor="password"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-md "
            >
              Password
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={e => handleChange(e)}
                required
                autoComplete="true"
                className="flex-1 py-1 pl-2 bg-transparent"
              />
            </label>
            <Button
              onClick={() => null}
              extraClasses="shadow-md mt-2"
              type="submit"
            >
              Login
            </Button>
          </form>
          <Divider>OR</Divider>
          <div className="flex justify-center w-full gap-4 px-4">
            {loginProviders.map(provider => (
              <div
                key={provider.id}
                className={`flex justify-center flex-1 p-2 text-center rounded-md shadow-md cursor-pointer bg-[${provider.bgColor}]`}
                onClick={() => handleProviderLogin(provider.id)}
                aria-label={provider.name}
                title={provider.name}
              >
                <FontAwesomeIcon
                  icon={provider.icon}
                  className="w-8"
                  color={provider.iconColor}
                />
              </div>
            ))}
          </div>
          <Divider>Don&apos;t have an account?</Divider>
          <div className="w-full px-4">
            <Button
              extraClasses="w-full"
              onClick={() => router.push('/signup')}
            >
              Register
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default login;
