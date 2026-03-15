# Deploying to Vercel

This guide will help you deploy your "SoLuna" application to Vercel.

## Prerequisites

1. A GitHub, GitLab, or Bitbucket account
2. A Vercel account (sign up at [vercel.com](https://vercel.com))
3. Your Supabase project URL and anon key

## Step 1: Push Your Code to Git

If you haven't already, initialize a git repository and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js settings
5. **Configure Environment Variables** (see Step 3 below)
6. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and add environment variables when asked

## Step 3: Configure Environment Variables

In your Vercel project settings, add these environment variables:

### Required Environment Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: Your Supabase project URL
   - Example: `https://xxxxxxxxxxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: Your Supabase anon/public key
   - Found in: Supabase Dashboard → Settings → API

### How to Add Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase URL
   - **Environment**: Production, Preview, Development (select all)
4. Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Save**

## Step 4: Configure Supabase Storage (If Not Done)

Make sure your Supabase Storage bucket is set up:

1. Go to Supabase Dashboard → Storage
2. Create a bucket named `memories` (if not exists)
3. Make it **Public**
4. Run the SQL from `supabase/storage_setup.sql` in the SQL Editor

## Step 5: Verify Deployment

After deployment:

1. Visit your Vercel deployment URL
2. Test the code entry page
3. Test the admin panel
4. Verify images load correctly
5. Test music playback (if configured)

## Step 6: Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

## Troubleshooting

### Build Errors

- Check that all environment variables are set
- Verify `next.config.js` is correct
- Check build logs in Vercel Dashboard

### Images Not Loading

- Verify Supabase Storage bucket is public
- Check image URLs in browser console
- Verify `next.config.js` has correct remote patterns

### Environment Variables Not Working

- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### Database Connection Issues

- Verify Supabase URL and anon key are correct
- Check Supabase project is active
- Verify RLS policies are set up correctly

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase Storage bucket created and public
- [ ] Database schema applied
- [ ] RLS policies set up
- [ ] Test code entry page
- [ ] Test admin panel login
- [ ] Test image uploads
- [ ] Test music playback
- [ ] Test all location modals
- [ ] Test games functionality

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Check build logs in Vercel Dashboard for specific errors
