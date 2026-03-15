import imageCompression from 'browser-image-compression'

/**
 * Compress and convert image to WebP format
 * @param file - The image file to compress
 * @returns Compressed File object
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5, // Maximum file size in MB (500KB)
    maxWidthOrHeight: 1920, // Maximum width or height
    useWebWorker: true,
    fileType: 'image/webp', // Convert to WebP
    initialQuality: 0.8, // Initial quality (0-1)
  }

  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    throw new Error('Failed to compress image')
  }
}

/**
 * Upload image to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToSupabase(
  file: File,
  bucket: string = 'memories',
  folder: string = 'images'
): Promise<string> {
  const { createClient } = await import('@supabase/supabase-js')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured')
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Compress image first (converts to WebP)
  const compressedFile = await compressImage(file)
  
  // Generate unique filename with .webp extension
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.webp`
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, compressedFile, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading image:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

/**
 * Upload a file to Supabase Storage without compression (for audio, or any file)
 * @param file - The file to upload
 * @param bucket - Storage bucket name
 * @param folder - Folder path inside the bucket
 * @returns Public URL of the uploaded file
 */
export async function uploadFileToSupabase(
  file: File,
  bucket: string = 'memories',
  folder: string = 'surprises'
): Promise<string> {
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured')
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const ext = file.name.split('.').pop() || 'bin'
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${ext}`

  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    console.error('Error uploading file:', error)
    throw new Error(`Failed to upload: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicUrl
}
