/* src/utils/supabase.ts */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xqyzkllufjsnccccexqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxeXprbGx1ZmpzbmNjY2NleHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTU0NzgsImV4cCI6MjA5MTIzMTQ3OH0.tA495i4EG4fiUPFrwbk1hQzLvYapYgb3XgxGFojgO3s';

export const supabase = createClient(supabaseUrl, supabaseKey);