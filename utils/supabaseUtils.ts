import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

const IGNORABLE_ERRORS = ['PGRST116', 20, 406];

export const handleError = (error: PostgrestError) => {
  if (IGNORABLE_ERRORS.includes(error.code)) {
    return;
  }
  toast.error(error.message);
  console.error('error found: ', error);
};
