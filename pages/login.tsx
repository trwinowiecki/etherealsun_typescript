/* eslint-disable jsx-a11y/control-has-associated-label */
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@ui/Button';
import Divider from '@ui/Divider';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
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

interface LoginForm {
  email: string;
  password: string;
}

const login = ({ callbackUrl }: LoginProps) => {
  const { signIn, user, signInProvider } = useFirebaseAuth();
  const router = useRouter();
  const [routerActive, setRouterActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<LoginForm>();
  const emailRegex =
    '?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+*|"?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\]';

  if (user && !routerActive) {
    setRouterActive(true);
    router.push('/');
  }

  const onSubmit: SubmitHandler<LoginForm> = async data => {
    setRouterActive(true);
    setLoading(true);
    try {
      await signIn!(data.email, data.password);
      router.push(callbackUrl || '/');
    } catch (error: any) {
      setRouterActive(false);
      setLoading(false);
      toast.error(`Failed: ${(error as FirebaseError).code}`);
    }
  };

  const handleProviderLogin = async (providerId: string) => {
    try {
      await signInProvider(providerId);
      router.push(callbackUrl || '/');
    } catch (error) {
      toast.error(`Failed: ${(error as FirebaseError).code}`);
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
          <form
            className="flex flex-col w-full gap-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            <label
              htmlFor="email"
              className={`${errors.email ? 'error' : ''} input-field`}
            >
              Email
              <input
                {...register('email', {
                  required: true,
                  validate: value => value.length > 0,
                  pattern:
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                })}
                type="email"
                autoComplete="true"
              />
            </label>
            <label
              htmlFor="password"
              className={`${errors.password ? 'error' : ''} input-field`}
            >
              Password
              <input
                {...register('password', {
                  required: true,
                  validate: value => value.length > 0
                })}
                type="password"
                autoComplete="true"
              />
            </label>
            <Button
              disabled={loading}
              onClick={() => null}
              extraClasses="shadow-md mt-2"
            >
              <input type="submit" name="submit" id="submit" value="Login" />
            </Button>
          </form>
          <Divider>OR</Divider>
          <div className="flex justify-center w-full gap-4 px-4">
            {loginProviders.map(provider => (
              <button
                key={provider.id}
                className={`flex justify-center flex-1 p-2 text-center rounded-md shadow-md cursor-pointer bg-[${provider.bgColor}]`}
                onClick={() => handleProviderLogin(provider.id)}
                aria-label={provider.name}
                type="button"
                title={provider.name}
              >
                <FontAwesomeIcon
                  icon={provider.icon}
                  className="w-8"
                  color={provider.iconColor}
                />
              </button>
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
