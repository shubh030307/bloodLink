import { createClient } from '@supabase/supabase-js';

let supabaseClientInstance: any = null;

const getSupabaseClient = () => {
  if (supabaseClientInstance) return supabaseClientInstance;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Requires service role to bypass RLS for uploads from server

  if (supabaseUrl && supabaseKey) {
    supabaseClientInstance = createClient(supabaseUrl, supabaseKey);
  } else {
    console.warn('Supabase URL or Key is missing. File uploads to Supabase will fail.');
    supabaseClientInstance = {
      storage: {
        from: () => ({
          upload: () => ({ data: null, error: new Error('Supabase not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      }
    };
  }
  return supabaseClientInstance;
};

/**
 * Uploads a buffer to Supabase Storage and returns the public URL.
 * @param bucketName Name of the Supabase storage bucket
 * @param filePath Path inside the bucket (e.g. 'reports/123.pdf')
 * @param fileBuffer The file buffer
 * @param contentType The MIME type
 * @returns The public URL of the uploaded file
 */
export const uploadBufferToSupabase = async (
  bucketName: string,
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase Storage is not configured correctly on the server.');
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload file to Supabase: ${error.message}`);
  }

  const { data: publicData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicData.publicUrl;
};
