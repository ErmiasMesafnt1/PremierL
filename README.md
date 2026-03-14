# CornerGuard

I had made this app since I believe there is a serious problem with the modern day play style within my favorite soccer/football leauge in the world the Premier League. I included features that show in what means certain teams are winning and if the stats reflect where they stand in the actual Premier League Table.


An Expo project built for Expo Go.

## Running with Expo Go

1. **Install Expo Go** on your device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the dev server:**
   ```bash
   npm start
   ```

3. **Connect your device:**
   - **Same Wi‑Fi:** Ensure your phone and computer are on the same network. Scan the QR code shown in the terminal or browser with the Expo Go app.
   - **Tunnel (different networks):** Press `s` in the terminal to switch to tunnel mode, then scan the QR code.

4. **Platform shortcuts:**
   - `a` — open on Android
   - `i` — open on iOS Simulator
   - `w` — open in web browser

## Supabase Setup

The login flow uses Supabase for authentication. To enable it:

1. Create a project at [supabase.com](https://supabase.com)
2. Run your schema (profiles, teams, etc.) in the SQL Editor
3. Run `supabase/seed-teams.sql` to populate the 20 Premier League teams
4. Run `supabase/add-profile-team-fk.sql` to add the foreign key (enables profile + team join)
5. Copy your project URL and anon key from Project Settings → API
6. Create a `.env` file in the project root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
7. Restart the dev server (`npm start`)

Until configured, the app shows a friendly prompt when you try to sign in.

## Project Structure

- `app/` — Expo Router screens (file-based routing)
- `app/(auth)/` — Login and sign-up screens
- `app/(tabs)/` — Main app (after login)
- `lib/supabase.ts` — Supabase client
- `assets/` — Images and other static assets
