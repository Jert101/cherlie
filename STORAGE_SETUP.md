# Supabase Storage Setup Guide

## Step 1: Create Storage Bucket

1. Go to your **Supabase Dashboard**
2. Click on **Storage** in the left sidebar
3. Click **New bucket**
4. Enter bucket name: `memories`
5. **Important**: Check **Public bucket** (this makes images publicly accessible)
6. Click **Create bucket**

## Step 2: Set Up Storage Policies

After creating the bucket, you need to set up policies to allow uploads:

### Option A: Using SQL (Recommended)

1. Go to **SQL Editor** in Supabase
2. Run the SQL from `supabase/storage_setup.sql`

### Option B: Using Dashboard

1. Go to **Storage** > **Policies**
2. Click on the `memories` bucket
3. Click **New Policy**
4. Create these policies:

**Policy 1: Public Read Access**
- Policy name: `Public Access`
- Allowed operation: `SELECT`
- Policy definition: `bucket_id = 'memories'`

**Policy 2: Public Upload**
- Policy name: `Allow public uploads`
- Allowed operation: `INSERT`
- Policy definition: `bucket_id = 'memories'`

**Policy 3: Public Update**
- Policy name: `Allow public updates`
- Allowed operation: `UPDATE`
- Policy definition: `bucket_id = 'memories'`

**Policy 4: Public Delete**
- Policy name: `Allow public deletes`
- Allowed operation: `DELETE`
- Policy definition: `bucket_id = 'memories'`

## Step 3: Verify Setup

1. Go to **Storage** > **memories** bucket
2. Try uploading a test image manually
3. If it works, the setup is complete!

## How It Works

- **Automatic Compression**: Images are automatically compressed to WebP format
- **Size Limit**: Maximum 500KB after compression
- **Resolution**: Maximum 1920px width/height
- **Format**: All images converted to WebP for better performance
- **Storage**: Images stored in `memories/images/` folder

## Troubleshooting

**"Bucket not found" error:**
- Make sure the bucket is named exactly `memories`
- Check that the bucket exists in Storage

**"Permission denied" error:**
- Verify the bucket is set to **Public**
- Check that storage policies are set up correctly
- Make sure you ran the storage_setup.sql

**"Upload failed" error:**
- Check your Supabase credentials in `.env.local`
- Verify the bucket exists and is public
- Check browser console for detailed error messages

## Notes

- Free tier includes 1GB of storage
- Images are automatically optimized before upload
- Old images are not automatically deleted (you can delete them manually from Storage)
