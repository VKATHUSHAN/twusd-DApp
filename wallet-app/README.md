# USDOX Wallet App

This is a secure, non-custodial EVM wallet application built for the USDOX ecosystem.

## Tech Stack
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Library**: ethers.js v6
- **Deployment**: Vercel

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Deployment via Vercel
To deploy this application to Vercel:

1. Ensure you are logged in to Vercel CLI:
   ```bash
   vercel login
   ```

2. Deploy to production:
   ```bash
   vercel --prod
   ```

## Environment Variables
The application relies on environment variables defined in `.env`.
The Vercel configuration has been set up to use your team ID.
If you encounter issues with `VERCEL_ORG_ID`, check the `.env` file.
