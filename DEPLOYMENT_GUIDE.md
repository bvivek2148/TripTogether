# TripTogether - Vercel Deployment Guide

## 🎯 Current Status
Your project has been linked to Vercel and is ready for deployment!

**Project URL:** https://vercel.com/aio-s-projects/trip-together

## ✅ Completed Steps
- [x] Linked to Vercel
- [x] Updated Prisma schema to PostgreSQL
- [x] Added Prisma generate to build script
- [x] Created .vercelignore file

## 📋 Next Steps to Complete Deployment

### 1. Create PostgreSQL Database
**Visit:** https://vercel.com/aio-s-projects/trip-together/stores

1. Click **"Create Database"**
2. Select **"Postgres"**
3. Name it: `trip-together-db`
4. Click **"Create"**

This will automatically add `DATABASE_URL` to your environment variables.

### 2. Add Environment Variables
**Visit:** https://vercel.com/aio-s-projects/trip-together/settings/environment-variables

For each variable, select all three environments: **Production**, **Preview**, and **Development**

#### Required Variables:

**Authentication:**
```
NEXTAUTH_SECRET=tUOp1V5MlVf4wlz8rBhsvKkC54p7lLd7rmAl3oYV6Lw=
NEXTAUTH_URL=https://trip-together-fuvkavni4-aio-s-projects.vercel.app
```
*Note: Update NEXTAUTH_URL if you set up a custom domain*

**Google OAuth:**
Get these from [Google Cloud Console](https://console.cloud.google.com/):
```
GOOGLE_CLIENT_ID=[your_google_client_id]
GOOGLE_CLIENT_SECRET=[your_google_client_secret]
```

**Stripe Payments:**
Get these from [Stripe Dashboard](https://dashboard.stripe.com/):
```
STRIPE_PUBLISHABLE_KEY=[your_publishable_key]
STRIPE_SECRET_KEY=[your_secret_key]
STRIPE_WEBHOOK_SECRET=[your_webhook_secret]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[same_as_STRIPE_PUBLISHABLE_KEY]
```

**Google Maps:**
Get this from [Google Cloud Console](https://console.cloud.google.com/):
```
GOOGLE_MAPS_API_KEY=[your_api_key]
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[same_as_GOOGLE_MAPS_API_KEY]
```

**Other:**
```
NODE_ENV=production
```

### 3. Update OAuth Redirect URLs

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://trip-together-fuvkavni4-aio-s-projects.vercel.app/api/auth/callback/google
   ```

#### Stripe Webhooks:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** > **Webhooks**
3. Add endpoint:
   ```
   https://trip-together-fuvkavni4-aio-s-projects.vercel.app/api/webhooks/stripe
   ```
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, etc.

### 4. Push Database Schema
After setting up the database, run migrations:

```bash
# Pull the DATABASE_URL from Vercel
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy

# (Optional) Seed the database
npm run db:seed
```

### 5. Redeploy
Once all environment variables are set:

```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

## 🔍 Monitoring

**Deployment URL:** https://trip-together-fuvkavni4-aio-s-projects.vercel.app

**Dashboard:** https://vercel.com/aio-s-projects/trip-together

**Logs:** Check the Vercel dashboard for build and runtime logs

## 🐛 Troubleshooting

### Build Fails
- Check that all environment variables are set
- Verify DATABASE_URL is configured
- Check build logs in Vercel dashboard

### Database Connection Issues
- Ensure DATABASE_URL is set in all environments
- Run `npx prisma generate` locally first
- Check Prisma migrations are up to date

### API Routes Fail
- Verify all API keys are valid
- Check that OAuth redirect URLs are updated
- Review function logs in Vercel dashboard

## 📚 Additional Resources
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## 🎉 After Deployment
1. Test all functionality (auth, bookings, payments)
2. Monitor error logs
3. Set up custom domain (optional)
4. Configure production analytics
5. Set up monitoring and alerting
