import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hapdigskzxftsvfudzzn.supabase.co';

// ====================================================================================
// ⚠️ CONFIGURAÇÃO ⚠️
// ====================================================================================
// Chave configurada conforme fornecido.
// ====================================================================================

const SUPABASE_ANON_KEY = 'sb_publishable_CZ1dPKwFN81JNymFtP4s8Q_kW5xVqf9'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);