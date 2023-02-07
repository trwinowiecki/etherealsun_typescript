/* eslint-disable @typescript-eslint/naming-convention */
import { Session } from '@supabase/auth-helpers-react';
import { Customer } from 'square';

export interface UserProfile {
  id: string;
  updated_at: string;
  username: string;
  full_name: string;
  square_id: string;
  square_customer?: Customer;
}

export interface DefaultSessionProps {
  session: Session;
}
