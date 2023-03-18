/* eslint-disable react-hooks/exhaustive-deps */
import {
  useSession,
  useSupabaseClient,
  useUser
} from '@supabase/auth-helpers-react';
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
    if (session) {
      getProfile();
    } else {
      router.push('/login');
    }
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!user) throw new Error('No user');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`first_name, last_name`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
      }
    } catch (error) {
      toast.error('Error loading user data!');
      console.log(error);
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
      console.log(session);

      setLoading(true);
      if (!user) throw new Error('No user');

      const updates = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Error updating the data!');
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    session && (
      <Layout title="Account Settings">
        {/* <h1>{user?.displayName ? `Hi, ${user.displayName}!` : 'Hi!'}</h1> */}
        {/* <AddressForm /> */}
        <div className="form-widget">
          <div className="account-form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              value={session.user.email}
              disabled
              autoComplete="false"
              aria-label="email"
            />
          </div>
          <div className="account-form-field">
            <label htmlFor="firstName">firstName</label>
            <input
              id="firstName"
              type="text"
              value={firstName ?? ''}
              onChange={event => setFirstName(event.target.value)}
              autoComplete="true"
              aria-label="first name"
            />
          </div>
          <div className="account-form-field">
            <label htmlFor="lastName">lastName</label>
            <input
              id="lastName"
              type="text"
              value={lastName ?? ''}
              onChange={event => setLastName(event.target.value)}
              autoComplete="true"
              aria-label="last name"
            />
          </div>

          <div className="account-form-field">
            <button
              className="block button primary"
              onClick={() => updateProfile({ firstName, lastName })}
              disabled={loading}
              type="button"
            >
              {loading ? 'Loading ...' : 'Update'}
            </button>
          </div>

          <div className="account-form-field">
            <button
              className="block button"
              onClick={() => supabase.auth.signOut()}
              type="button"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Layout>
    )
  );
};

export default account;
