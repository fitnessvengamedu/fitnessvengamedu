---
name: deploy
description: Builds the project locally and deploys the production bundle to Vercel.
---

Build and deploy the application to Vercel:

1. **Local Build Check**:
   - Run the production build command: `npm run build`.
   - Verify that there are no compilation, TypeScript, linting, or configuration errors.
   - If the build fails, fix all issues before attempting deployment.

2. **Deploy to Vercel**:
   - Run the Vercel deployment command: `npx vercel --prod` or `vercel --prod`.
   - Monitor the deployment output.
   - If authentication is required, guide the user to log in or use Vercel project environment tokens.

3. **Post-Deployment Verification**:
   - Extract the production URL from the Vercel output.
   - Visit the page or use a simple health check to ensure that the site loads successfully.
