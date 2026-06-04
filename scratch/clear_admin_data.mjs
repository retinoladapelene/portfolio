import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using anon key might not work for delete if RLS is on, but often admin has service role or we can use the env one.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function clearDashboardData() {
  console.log('--- Starting Cloud Asset & Data Purge ---');

  // 1. Clear Database Tables
  const tables = ['gallery_art', 'projects', 'life_journey', 'sketchbook_archive'];
  
  for (const table of tables) {
    console.log(`Clearing table: ${table}...`);
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.error(`Error clearing ${table}:`, error.message);
    } else {
      console.log(`✓ Table ${table} cleared.`);
    }
  }

  // 2. Clear Storage Bucket 'portfolio'
  console.log('Clearing storage bucket: portfolio...');
  
  // List all files recursively
  const { data: folders, error: listError } = await supabase.storage.from('portfolio').list();
  
  if (listError) {
    console.error('Error listing storage:', listError.message);
  } else if (folders) {
    for (const folder of folders) {
        // Skip metadata files if any
        if (folder.name === '.emptyFolderPlaceholder') continue;
        
        console.log(`Processing folder/file: ${folder.name}`);
        
        // If it's a "folder" in Supabase Storage, we need to list contents
        // But list() returns both files and folder placeholders
        // We'll try to delete everything in subdirectories we know
        const subDirs = ['gallery', 'projects', 'journey', 'sketchbook'];
        for (const dir of subDirs) {
            const { data: files, error: dirError } = await supabase.storage.from('portfolio').list(dir);
            if (files && files.length > 0) {
                const paths = files.map(f => `${dir}/${f.name}`);
                const { error: delError } = await supabase.storage.from('portfolio').remove(paths);
                if (delError) {
                    console.error(`Error deleting files in ${dir}:`, delError.message);
                } else {
                    console.log(`✓ Deleted ${paths.length} files from ${dir}.`);
                }
            }
        }
    }
  }

  console.log('--- Purge Complete ---');
}

clearDashboardData();
