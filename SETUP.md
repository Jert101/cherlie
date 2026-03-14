# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to initialize (takes ~2 minutes)
4. Go to **SQL Editor** in the left sidebar
5. Click **New Query** and paste the entire contents of `supabase/schema.sql`
6. Click **Run** to execute the schema
7. Go to **Settings** > **API** and copy:
   - Project URL
   - `anon` `public` key

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 5: First Login

- **GF Code**: `love2024`
- **Admin Code**: `admin2024`

**Important**: Change these codes immediately in the admin panel after first login!

## Step 6: Add Your First Content

1. Login with the admin code
2. Go to **Memories** and add your first memory
3. Go to **Letters** and write your first letter
4. Go to **Settings** and customize:
   - Change access codes
   - Add music URL (optional)
   - Customize final message

## Step 7: Upload Images (Optional)

### Option A: Supabase Storage (Recommended)

1. In Supabase, go to **Storage**
2. Create a new bucket named `memories`
3. Set it to **Public**
4. Upload your images
5. Copy the public URL and use it in the admin panel

### Option B: External URLs

Use any image hosting service (Imgur, Cloudinary, etc.) and paste the URL

## Step 8: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

## Tips

- Test everything locally before deploying
- Keep images under 500KB for best performance
- Use WEBP format for images
- Regularly backup your Supabase database
- The admin panel allows real-time content updates without redeployment

## Troubleshooting

### "Supabase credentials not found"
- Make sure `.env.local` exists and has the correct variables
- Restart the dev server after adding environment variables

### Images not loading
- Check that image URLs are publicly accessible
- For Supabase Storage, ensure the bucket is set to public

### Admin panel not working
- Make sure you're logged in with the admin code
- Check browser console for errors
- Verify Supabase RLS policies are set correctly

### 3D planet not showing
- This requires WebGL support in your browser
- Some mobile browsers may have limited 3D support
- The site will gracefully degrade to 2D on unsupported devices
