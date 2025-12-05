# Deployment Commands
# Copy these commands when deploying to Google Cloud Run

## Production URLs:
- **Frontend**: https://virtual-closet-web-310822052817.us-central1.run.app
- **Backend**: https://virtual-closet-api-310822052817.us-central1.run.app

---

## Backend Deployment

**From:** `virtual-closet-app/server` directory

```bash
cd virtual-closet-app/server

gcloud run deploy virtual-closet-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,GCS_PROJECT_ID=virtualcloset-477422,GCS_BUCKET=pfw-virtual-close,MONGODB_URI=mongodb+srv://raulfloresjr2020_db_user:EuHTtKNaovVkqSSo@virtualcloset.rb4i8um.mongodb.net/virtual-closet?retryWrites=true&w=majority&appName=VirtualCloset"
```

---

## Frontend Deployment

**From:** `virtual-closet-app/client` directory

```bash
cd virtual-closet-app/client

gcloud run deploy virtual-closet-web \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

**Note:** Frontend `.env.production` must contain:
```
VITE_API_URL=https://virtual-closet-api-310822052817.us-central1.run.app/api
```

---

## Environment Variables:

### Required:
- `NODE_ENV=production`
- `GCS_PROJECT_ID=virtualcloset-477422`
- `GCS_BUCKET=pfw-virtual-close`
- `MONGODB_URI=mongodb+srv://raulfloresjr2020_db_user:EuHTtKNaovVkqSSo@virtualcloset.rb4i8um.mongodb.net/virtual-closet?retryWrites=true&w=majority&appName=VirtualCloset`

### Optional:
- `PORT=8080` (automatically set by Cloud Run)
- `JWT_SECRET` (if implementing JWT auth)
- `FRONTEND_URL` (for CORS configuration)

## Security Notes:
- ⚠️ Never commit this file to git
- ⚠️ Keep MongoDB credentials private
- ⚠️ Rotate credentials if exposed
- ✅ Uses GCS Application Default Credentials (no file needed in production)

## Update Instructions:

### To update environment variables on existing deployment:
```bash
gcloud run services update virtual-closet-api \
  --region us-central1 \
  --set-env-vars "KEY=VALUE"
```

### To add new variable:
```bash
gcloud run services update virtual-closet-api \
  --region us-central1 \
  --update-env-vars "NEW_KEY=NEW_VALUE"
```

### To remove variable:
```bash
gcloud run services update virtual-closet-api \
  --region us-central1 \
  --remove-env-vars "KEY_NAME"
```

### To view current domain mappings:
```bash
gcloud run domain-mappings list --region us-central1
```

### To delete domain mapping:
```bash
gcloud run domain-mappings delete \
  --domain yourdomain.com \
  --region us-central1
```
