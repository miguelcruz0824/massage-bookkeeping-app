import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xeclrazvoyohiddfooyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY2xyYXp2b3lvaGlkZGZvb3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTIzNzEsImV4cCI6MjA5MTMyODM3MX0.nT40p6hFHeVTnFoI22hOT6kB1np7pCDWb0UKx7ZztTE';

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
