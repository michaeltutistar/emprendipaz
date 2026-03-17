---
description: Build and deploy the frontend application to AWS S3 and invalidate CloudFront cache.
---

1. Build the frontend application.
   ```powershell
   cd c:\Users\USUARIO\Projects\e-learning-platform\frontend\frontend-app
   pnpm run build
   ```

2. Sync the build output to the S3 bucket.
   ```powershell
   cd c:\Users\USUARIO\Projects\e-learning-platform\frontend\frontend-app
   aws s3 sync dist/ s3://elearning-frontend-prod-v2 --delete
   ```

3. Invalidate the CloudFront cache to ensure users see the latest changes.
   ```powershell
   // turbo
   cd c:\Users\USUARIO\Projects\e-learning-platform\frontend\frontend-app
   aws cloudfront create-invalidation --distribution-id E3QN9WFZXCI4DS --paths "/*"
   ```
