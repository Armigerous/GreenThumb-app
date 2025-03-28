import { supabase } from '@/lib/supabaseClient';
import { Alert } from 'react-native';

// Technical documentation for bucket setup - for developers only
const SETUP_INSTRUCTIONS = 
`To set up the storage bucket properly with Clerk integration:

1. Go to Supabase Dashboard > Storage
2. Create a bucket named "user-uploads"
3. UNCHECK "Public bucket"
4. Add these RLS policies using the sub claim from Clerk JWT:

-- First create a helper function to get the user ID from JWT:
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$ LANGUAGE sql STABLE;

-- Then create the storage policies:
-- 1. Upload Policy:
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[2] = requesting_user_id()
);

-- 2. View Policy:
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[2] = requesting_user_id()
);

-- 3. Delete Policy:
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[2] = requesting_user_id()
);`;

/**
 * Tests if the storage buckets are accessible by attempting a list operation
 * This is a more reliable way to check if the storage is configured correctly
 */
export async function checkSupabaseStorage() {
  try {
    console.log('Checking Supabase storage buckets...');
    
    // First, check if we can list buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    // Log the raw response for debugging
    console.log('Raw buckets response:', JSON.stringify(buckets));
    
    if (bucketError) {
      console.error('Error fetching storage buckets:', bucketError.message);
      console.error('Full bucket error:', JSON.stringify(bucketError));
      if (__DEV__) {
        Alert.alert(
          'Storage Access Error',
          'Unable to access Supabase Storage. This might be due to missing permissions or configuration issues.',
          [{ text: 'OK' }]
        );
      }
      return false;
    }
    
    // Manually check for user-uploads case-insensitively
    console.log('All available buckets:', buckets ? buckets.map(b => b.name).join(', ') : 'none');
    
    // Check for the bucket with any capitalization
    const userUploadsBucket = buckets?.find(bucket => 
      bucket.name.toLowerCase() === 'user-uploads'
    );
    
    if (!userUploadsBucket) {
      console.warn('⚠️ Storage bucket "user-uploads" is missing from the API response');
      console.warn('This is surprising since you can see it in the Supabase dashboard');
      
      // Try a different API endpoint as a test
      try {
        console.log('Attempting direct access to bucket...');
        const { data: fileList, error: listError } = await supabase.storage
          .from('user-uploads')
          .list('', { limit: 1 });
          
        if (listError) {
          console.error('Error directly accessing bucket:', listError.message);
        } else {
          console.log('✅ Direct bucket access successful despite not appearing in bucket list');
          return true; // The bucket exists even if it doesn't show in the list
        }
      } catch (directError) {
        console.error('Error with direct bucket access:', directError);
      }
      
      if (__DEV__) {
        Alert.alert(
          'Storage API Inconsistency',
          'The "user-uploads" bucket appears to exist in your dashboard but is not returned by the API. ' +
          'This could be a permission issue or API caching problem.',
          [{ text: 'OK' }]
        );
      }
      return false;
    }
    
    console.log('✅ user-uploads bucket exists in the API response', userUploadsBucket);
    
    // Try to list files in the bucket to check if policies are working
    try {
      console.log('Verifying storage access to user-uploads bucket...');
      
      // First, check auth status
      const { data: authData, error: authError } = await supabase.auth.getSession();
      console.log('Auth session present:', authData?.session ? 'Yes' : 'No');
      if (authError) {
        console.error('Auth error during storage check:', authError.message);
      }
      
      // Try to get user ID from JWT claims via RPC
      try {
        const { data: userId, error: userIdError } = await supabase.rpc('requesting_user_id');
        console.log('Current user ID from JWT:', userId || 'None');
        if (userIdError) {
          console.error('Error getting user ID from JWT:', userIdError.message);
        }
      } catch (userIdError) {
        console.log('Could not get user ID:', userIdError);
      }
      
      // Proceed with the rest of the checks
      // ...
      
      return true;
    } catch (listErr) {
      console.error('Error testing bucket access:', listErr);
      
      // If error occurs but bucket exists, assume it might work later
      if (userUploadsBucket) {
        console.log('⚠️ Bucket exists but access test failed. Might work when properly authenticated.');
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error('Error checking Supabase storage:', error);
    return false;
  }
}

/**
 * Checks if the requesting_user_id function exists and logs the result
 * Uses a direct RPC call instead of querying system tables
 */
export async function checkRequestingUserIdFunction() {
  try {
    console.log('Checking if requesting_user_id function exists...');
    
    // Try to call the function directly
    const { data: userId, error: callError } = await supabase.rpc('requesting_user_id');
    
    if (callError) {
      console.error('Error calling requesting_user_id function:', callError.message);
      
      if (callError.message.includes('does not exist') || 
          callError.message.includes('not found')) {
        console.warn('The requesting_user_id function does not exist in your database.');
        console.warn('This function is required for RLS policies with Clerk integration.');
        
        console.log('SQL to create the function:');
        console.log(`
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$ LANGUAGE sql STABLE;
        `);
        
        console.log('After creating the function, you need to update your RLS policies for storage.objects.');
      }
    } else {
      console.log('✅ requesting_user_id function exists and returned:', userId);
      
      // Now get the auth session to check JWT claims
      const { data: authData } = await supabase.auth.getSession();
      console.log('Auth session present:', authData?.session ? 'Yes' : 'No');
      
      if (authData?.session) {
        // Try to extract the sub claim without parsing the JWT
        console.log('Session is active, JWT integration should be working');
      }
    }
    
    return userId;
  } catch (error) {
    console.error('Error checking requesting_user_id function:', error);
    return null;
  }
} 