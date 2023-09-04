/* eslint-disable @typescript-eslint/naming-convention */
import { Session, User } from '@supabase/auth-helpers-react';
import { Customer } from 'square';

export interface UserProfile extends User {
  first_name: string | null;
  id: string;
  last_name: string | null;
  square_id: string | null;
  updated_at: string | undefined;
  square_customer?: Customer;
}

export interface DefaultSessionProps {
  session: Session;
}
