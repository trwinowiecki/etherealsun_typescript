/* eslint-disable @typescript-eslint/naming-convention */
import { Session, User } from '@supabase/auth-helpers-react';
import { Customer } from 'square';
import { Database } from './supabase-data';

export type UserProfileSupa = Database['public']['Tables']['profiles']['Row'];

export type UserCustom = User &
  UserProfileSupa & {
    square_customer: Customer;
    favorites: string[];
  };

export interface DefaultSessionProps {
  session: Session;
}
