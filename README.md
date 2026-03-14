# Our World - Interactive Romantic Website

A beautiful, interactive website dedicated to a special relationship, featuring memories, love letters, games, surprises, and a romantic confession experience.

## Features

- **Code Entry System**: Separate access codes for GF and Admin
- **3D Planet View**: Interactive floating planet with orbiting memories
- **Interactive World Map**: Explore different locations:
  - Memory Garden: Browse shared memories with photos
  - Love Letter House: Read heartfelt letters
  - Game Arcade: Play mini-games together
  - Star Hill: Discover hidden surprises
  - Final Cliff: The ultimate romantic confession
- **Admin Panel**: Full CRUD operations for all content
- **Dynamic Content**: All content stored in Supabase, editable without redeployment
- **Beautiful Animations**: GSAP animations and particle effects throughout
- **Mobile Responsive**: Works beautifully on all devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: React Three Fiber, Three.js
- **Animations**: GSAP, Framer Motion
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **Hosting**: Vercel (recommended)

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project URL and anon key from Settings > API
4. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configure Storage (Optional)

If you want to upload images directly:

1. Go to Storage in Supabase
2. Create a bucket named `memories`
3. Set it to public
4. Upload images and copy the public URL

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Default Access Codes

- **GF Code**: `love2024`
- **Admin Code**: `admin2024`

Change these in the admin panel after first login.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Admin Panel Features

Access the admin panel with the admin code to:

- **Memories**: Add/edit/delete memories with photos, dates, and locations
- **Letters**: Create and reorder love letters
- **Surprises**: Add messages, audio, or images as surprises
- **Games**: Enable/disable games and customize success messages
- **Settings**: Configure access codes, time locks, music, animations, and final message

## Content Guidelines

- **Memories**: Max 500KB images (WEBP recommended), 300 char descriptions
- **Letters**: Max 2000 characters
- **Surprises**: Messages, audio URLs, or image URLs
- **Images**: Upload to Supabase Storage or use external URLs

## Customization

- Colors: Edit `tailwind.config.ts` for cosmic theme colors
- Fonts: Handwritten font (Dancing Script) and sans-serif (Poppins)
- Animations: GSAP animations throughout, customizable in components
- 3D Planet: Adjust rotation speed in admin settings

## Project Structure

```
├── app/
│   ├── admin/          # Admin panel pages
│   ├── planet/         # 3D planet view
│   ├── welcome/        # Welcome screen
│   ├── world/          # Interactive map world
│   └── layout.tsx      # Root layout
├── components/
│   ├── admin/          # Admin panel components
│   ├── games/          # Mini-game components
│   ├── locations/      # World map location components
│   └── ...            # Shared components
├── lib/
│   └── supabase.ts    # Supabase client and types
└── supabase/
    └── schema.sql     # Database schema
```

## Tips

- Test all features in development before deploying
- Use Supabase Storage for images (free tier: 1GB)
- Keep images optimized (WEBP format, <500KB)
- Regularly backup your Supabase database
- Customize the final message for your special moment

## Support

For issues or questions, check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

---

Made with ❤️ for someone special
