import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hapdigskzxftsvfudzzn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_secret_EfNzGCb0k4WDd6IiZzKM-A_Xv9coy_S';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);