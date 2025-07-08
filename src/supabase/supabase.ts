import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_PROJECT_URL  as string;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;