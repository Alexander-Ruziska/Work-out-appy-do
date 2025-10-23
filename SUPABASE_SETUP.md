# Supabase Database Setup Guide

## What You Need to Do

### 1. Create a Supabase Account (2 minutes)
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email

### 2. Create a New Project (2 minutes)
1. Click "New Project"
2. Give it a name (e.g., "workout-tracker")
3. Create a strong database password (save it!)
4. Choose a region close to you
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

### 3. Create Database Tables (3 minutes)

Once your project is ready:

1. Click on the **SQL Editor** icon in the left sidebar
2. Click **New Query**
3. Copy and paste this SQL code:

```sql
-- Table for storing the current active workout
CREATE TABLE current_workout (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  workout_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for storing saved workout library
CREATE TABLE saved_workouts (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  workout_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  workout_data JSONB NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(device_id, workout_id)
);

-- Create indexes for better performance
CREATE INDEX idx_current_workout_device ON current_workout(device_id);
CREATE INDEX idx_saved_workouts_device ON saved_workouts(device_id);
CREATE INDEX idx_saved_workouts_device_workout ON saved_workouts(device_id, workout_id);
```

4. Click **Run** button
5. You should see "Success. No rows returned"

### 4. Get Your API Keys (1 minute)

1. Click on the **Settings** icon (gear) in the left sidebar
2. Click on **API** in the settings menu
3. Find these two values:
   - **Project URL** (starts with https://...)
   - **anon public** key (long string of characters)

### 5. Add Keys to Your App (1 minute)

1. In your project folder, create a file called `.env` (copy from `.env.example`)
2. Add your credentials:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **IMPORTANT**: Never commit the `.env` file to GitHub!

### 6. Test It!

1. Restart your app: `npm start`
2. Check the browser console (F12 → Console tab)
3. You should see: "Saved to Supabase" when making changes
4. If you see fallback messages, check your `.env` file

## How It Works

- **Automatic Fallback**: If Supabase isn't configured or is unavailable, the app automatically uses localStorage
- **Device-Based**: Each browser/device gets a unique ID, so your workouts are personal
- **Cloud Sync**: Data is saved to Supabase cloud database
- **Works Anywhere**: Deploy to Fly.io, Vercel, Netlify, etc. - Supabase works with all of them!

## Troubleshooting

### "Saved to localStorage" instead of "Saved to Supabase"
- Check that your `.env` file exists and has the correct keys
- Restart your development server
- Make sure the keys don't have quotes or extra spaces

### Database errors in console
- Verify the SQL tables were created correctly
- Check that your anon key is correct
- Make sure your Supabase project is running (not paused)

### Can't see my data in Supabase
- Go to Table Editor in Supabase dashboard
- Select `current_workout` or `saved_workouts` table
- You should see your data there

## Cost
- **Free tier**: 500MB database, 1GB file storage, 2GB bandwidth
- **Perfect for personal use** - you'll likely never exceed this!

## Security Notes
- The anon key is safe to expose in client-side code
- Each device gets a unique ID, so users can't see each other's data
- For production with user accounts, you'd add Row Level Security (RLS) policies

## Need Help?
- Supabase docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
