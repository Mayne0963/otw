# OTW — Thee Motion of the People

> Thee Motion of the People. Powered by community. Moving with purpose.

## Project Overview
A Next.js platform for food, rides, errands, and community service — dual-branded for Broski's Kitchen and OTW. Features Tier Membership, Volunteer Recognition, real-time tracking, and more.

## Tech Stack
- Next.js + React
- TailwindCSS (Poppins font, OTW color palette)
- Firebase (auth, data)
- Vercel (deployment)

## Official Tagline
**OTW — Thee Motion of the People**

## Folder Structure
```
/components         # Shared UI components
/pages              # Next.js pages (core routes)
/lib                # Utilities, Firebase config
/contexts           # React context providers
/data               # Mock data for Tier/Volunteers
/public/assets/logos# Brand logos
/public/assets/images# App images
```

## Environment Setup
1. Copy `.env.example` to `.env.local` and fill in your Firebase credentials.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the dev server:
   ```sh
   npm run dev
   ```

## Deployment (Vercel)
1. Push your repo to GitHub.
2. Import to [Vercel](https://vercel.com/import).
3. Add environment variables from `.env.example` in Vercel dashboard.
4. Deploy!

## Branding
- **Font:** Poppins (Google Fonts)
- **Colors:**
  - Background: Black
  - Primary Red: #C1272D
  - Accent Gold: #FFD700
- **Logos:** Place in `/public/assets/logos/`
- **Tagline:**
  - Homepage hero: "Flavors + Motion. All On The Way."
  - Tooltip on OTW logo: "Powered by Thee Motion of the People"

## Features
- Firebase Auth (login/signup)
- Tier Membership (mock logic, upgrade flow)
- Volunteer Recognition (mock logic, live feed)
- Real-time tracking (placeholder)
- Emergency button in Navbar
- Fully responsive, mobile-first

---

> "This is more than an app — this is movement. This is motion. This is Big'um Visions in action. Broskis for the flavor. OTW for the motion. Together, we feeding, lifting, and moving our people." 