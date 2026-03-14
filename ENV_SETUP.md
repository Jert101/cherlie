# Environment Variables Setup Guide

## Step 1: Get Your Supabase Credentials

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Log in to your account

2. **Select Your Project**
   - Click on your project (or create a new one if you haven't)

3. **Navigate to API Settings**
   - Click on **Settings** (gear icon) in the left sidebar
   - Click on **API** in the settings menu

4. **Copy Your Credentials**
   - **Project URL**: Found under "Project URL" section
     - Example: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: Found under "Project API keys" → "anon" → "public"
     - This is a long string starting with `eyJ...`

## Step 2: Create .env.local File

1. **Create the file in your project root**
   - In the root directory of your project (same level as `package.json`)
   - Create a new file named `.env.local`

2. **Add your credentials**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Replace the placeholders**
   - Replace `https://your-project-id.supabase.co` with your actual Project URL
   - Replace `your-anon-key-here` with your actual anon public key

## Step 3: Verify Setup

1. **Restart your development server**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

2. **Check for warnings**
   - If you see "Supabase credentials not found" in the console, double-check your `.env.local` file
   - Make sure there are no extra spaces or quotes around the values
   - Make sure the file is named exactly `.env.local` (not `.env.local.txt`)

## Example .env.local File

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

## Important Notes

- ✅ `.env.local` is already in `.gitignore` - your secrets won't be committed
- ✅ Never commit your `.env.local` file to Git
- ✅ The `NEXT_PUBLIC_` prefix makes these variables available in the browser
- ✅ Restart your dev server after creating/updating `.env.local`
- ⚠️ Keep your keys secret - don't share them publicly

## Troubleshooting

**"Supabase credentials not found" warning:**
- Check that `.env.local` exists in the project root
- Verify variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure there are no spaces around the `=` sign
- Restart your dev server

**Connection errors:**
- Verify your Project URL is correct
- Check that your anon key is the "anon public" key (not service_role)
- Make sure your Supabase project is active and not paused
