/* eslint-disable no-negated-condition */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  useSession,
  useSupabaseClient,
  useUser
} from '@supabase/auth-helpers-react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { ViewType } from '@supabase/auth-ui-react/dist/esm/src/types';
import Button from '@ui/Button';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import axios from 'axios';
import Layout from '../components/Layout';
import { SquareCommand } from '../enums/SquareCommands';
import { UserProfileSupa } from '../types/Supabase';
import { Database } from '../types/SupabaseDbTypes';
import { useStoreContext } from '../utils/Store';
import { handleError } from '../utils/supabaseUtils';

const account = () => {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const session = useSession();
  const { state } = useStoreContext();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] =
    useState<UserProfileSupa['first_name']>(null);
  const [lastName, setLastName] = useState<UserProfileSupa['last_name']>(null);
  const [redirect, setRedirect] = useState<string | null>(null);
  const [authView, setAuthView] = useState<ViewType>('sign_in');

  useEffect(() => {
    setRedirect(prev =>
      router.query.callbackUrl ? router.query.callbackUrl.toString() : prev
    );
    setAuthView(
      router.query.view && router.query.view === 'sign_up'
        ? 'sign_up'
        : 'sign_in'
    );
  }, [router.isReady, router.query.callbackUrl]);

  useEffect(() => {
    const controller = new AbortController();

    if (session) {
      getProfile(controller.signal);
    }

    return () => controller.abort();
  }, [session]);

  async function getProfile(signal: AbortSignal) {
    try {
      setLoading(true);
      if (!user) throw new Error('No user');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`first_name, last_name`)
        .eq('id', user.id)
        .abortSignal(signal)
        .single();

      if (error && status !== 406) {
        handleError(error);
        return;
      }

      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
      }
    } catch (error) {
      toast.error('Error loading user data!');
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    firstName,
    lastName
  }: {
    firstName: UserProfileSupa['first_name'];
    lastName: UserProfileSupa['last_name'];
  }) {
    try {
      setLoading(true);
      if (!user) throw new Error('No user');

      const updates = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) {
        handleError(error);
        return;
      }
      toast.success('Profile updated!');

      await axios({
        method: 'POST',
        url: 'api/square',
        data: {
          type: SquareCommand.UPDATE_CUSTOMER,
          customer: state.user,
          id: state.user.square_id,
          address: state.cart.shippingAddress
        }
      });
    } catch (error) {
      toast.error('Error updating the data!');
    } finally {
      setLoading(false);
      router.reload();
    }
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && redirect != null) {
      router.push(redirect);
    }
    if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
      router.reload();
    }
  });

  return (
    <Layout title="Account Settings">
      {!user ? (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['apple', 'facebook', 'google']}
          view={authView}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <h1>{firstName ? `Hi, ${firstName}!` : 'Hi!'}</h1>
          <label htmlFor="email" className="input-field">
            Email
            <input
              id="email"
              type="text"
              value={user.email}
              disabled
              autoComplete="false"
              aria-label="email"
            />
          </label>
          <label htmlFor="firstName" className="input-field">
            First Name
            <input
              id="firstName"
              type="text"
              value={firstName ?? ''}
              onChange={event => setFirstName(event.target.value)}
              autoComplete="true"
              aria-label="first name"
            />
          </label>
          <label htmlFor="lastName" className="input-field">
            Last Name
            <input
              id="lastName"
              type="text"
              value={lastName ?? ''}
              onChange={event => setLastName(event.target.value)}
              autoComplete="true"
              aria-label="last name"
            />
          </label>

          <Button
            onClick={() => updateProfile({ firstName, lastName })}
            disabled={loading}
          >
            {loading ? 'Loading ...' : 'Update'}
          </Button>

          <Button intent="danger" onClick={() => supabase.auth.signOut()}>
            Sign Out
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default account;
