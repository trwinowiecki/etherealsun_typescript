/* eslint-disable @typescript-eslint/naming-convention */
import { Session } from '@supabase/auth-helpers-react';
import { Customer } from 'square';

export interface UserProfile {
  id: string;
  updated_at?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  square_id?: string;
  square_customer?: Customer;
}

export interface DefaultSessionProps {
  session: Session;
}
