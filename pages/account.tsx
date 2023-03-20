/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  useSession,
  useSupabaseClient,
  useUser
} from '@supabase/auth-helpers-react';
import Button from '@ui/Button';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Layout from '../components/Layout';
import { Database } from '../types/SupabaseDbTypes';

type Profiles = Database['public']['Tables']['profiles']['Row'];

const account = () => {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState<Profiles['first_name']>(null);
  const [lastName, setLastName] = useState<Profiles['last_name']>(null);

  useEffect(() => {
    const controller = new AbortController();

    if (session) {
      getProfile(controller.signal);
    } else {
      router.push('/login');
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
        throw new Error(error.message);
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
    firstName: Profiles['first_name'];
    lastName: Profiles['last_name'];
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
      if (error) throw new Error(error.message);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Error updating the data!');
    } finally {
      setLoading(false);
    }
  }

  return (
    session && (
      <Layout title="Account Settings">
        {/* <h1>{user?.displayName ? `Hi, ${user.displayName}!` : 'Hi!'}</h1> */}
        {/* <AddressForm /> */}
        <div className="flex flex-col gap-4">
          <label htmlFor="email" className="input-field">
            Email
            <input
              id="email"
              type="text"
              value={session.user.email}
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
      </Layout>
    )
  );
};

export default account;
