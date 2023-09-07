/* eslint-disable @typescript-eslint/naming-convention */
import { Session, User } from '@supabase/auth-helpers-react';
import { Customer } from 'square';
import { Database } from './SupabaseDbTypes';

export type UserProfileSupa = Database['public']['Tables']['profiles']['Row'];

export type UserSupaFull = User &
  UserProfileSupa & {
    square_customer: Customer;
  };

export interface DefaultSessionProps {
  session: Session;
}
