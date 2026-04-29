# Golf Platform Deployment Guide
## Frontend: Render | Backend: Hugging Face

---

## PHASE 1: PREPARATION

### 1.1 Prerequisites
- [ ] GitHub account (for version control)
- [ ] Render account (https://render.com)
- [ ] Hugging Face account (https://huggingface.co)
- [ ] Git installed locally
- [ ] Node.js installed locally

### 1.2 Initialize Git Repository (if not already done)
```bash
cd "c:\Users\ASUS\OneDrive\Desktop\golf -platform"
git init
git add .
git commit -m "Initial commit - golf platform"
```

### 1.3 Create GitHub Repository
1. Go to https://github.com/new
2. Create repository: `golf-platform`
3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/golf-platform.git
git branch -M main
git push -u origin main
```

---

## PHASE 2: BACKEND DEPLOYMENT (Hugging Face)

### 2.1 Prepare Backend for Hugging Face

**Note:** Hugging Face is primarily for ML models. However, we'll deploy the Express server using their Spaces feature (containerized apps).

#### Step 1: Create Environment Variables File
In `server/` create `.env`:
```
PORT=7860
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

#### Step 2: Update Server Configuration
Edit [server/server.js](server/server.js) to use environment variables:

```javascript
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 7860;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// REST OF YOUR CODE...

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Step 3: Add dotenv dependency
In `server/package.json`, update dependencies:
```json
"dependencies": {
  "cors": "^2.8.6",
  "express": "^5.2.1",
  "dotenv": "^16.0.3"
}
```

Run: `npm install`

#### Step 4: Create Dockerfile
In `server/` create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production

COPY server.js .
COPY .env .

EXPOSE 7860

CMD ["node", "server.js"]
```

#### Step 5: Create .dockerignore
In `server/` create `.dockerignore`:
```
node_modules
npm-debug.log
.git
.gitignore
.env.local
```

### 2.2 Deploy to Hugging Face Spaces

#### Step 1: Create Hugging Face Space
1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Name: `golf-platform-backend`
4. License: Choose one
5. Space SDK: Select "Docker"
6. Create Space

#### Step 2: Clone the Space
```bash
git clone https://huggingface.co/spaces/YOUR_USERNAME/golf-platform-backend
cd golf-platform-backend
```

#### Step 3: Add Your Backend Files
Copy your server files to the space directory:
- `Dockerfile`
- `server.js`
- `package.json`
- `.env`

#### Step 4: Push to Hugging Face
```bash
git add .
git commit -m "Deploy golf backend"
git push
```

**Hugging Face will auto-build and deploy!**

#### Step 5: Get Backend URL
- Go to your Space page: https://huggingface.co/spaces/YOUR_USERNAME/golf-platform-backend
- Your API URL will be: `https://YOUR_USERNAME-golf-platform-backend.hf.space`

---

## PHASE 3: FRONTEND DEPLOYMENT (Render)

### 3.1 Prepare Frontend for Render

#### Step 1: Create Environment Variables
Create `.env.production` in `client/golf-client/`:
```
NEXT_PUBLIC_API_URL=https://YOUR_USERNAME-golf-platform-backend.hf.space
```

#### Step 2: Update API Calls
Make sure your frontend uses this environment variable. Example in your API calls:
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Then use:
fetch(`${API_URL}/api/login`, {...})
```

#### Step 3: Update next.config.ts
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {},
    },
  },
  // Add this for API proxy during development
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
```

#### Step 4: Create render.yaml
In root of `client/golf-client/` create `render.yaml`:
```yaml
services:
  - type: web
    name: golf-platform-frontend
    env: node
    plan: free
    buildCommand: npm ci && npm run build
    startCommand: npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://YOUR_USERNAME-golf-platform-backend.hf.space
      - key: NODE_ENV
        value: production
```

### 3.2 Deploy to Render

#### Step 1: Connect GitHub to Render
1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" > "Web Service"
4. Select your `golf-platform` repository
5. Branch: `main`

#### Step 2: Configure Deployment
- **Name:** `golf-platform-frontend`
- **Environment:** Node
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Plan:** Free (or upgrade as needed)

#### Step 3: Add Environment Variables
In Render dashboard:
1. Go to your service settings
2. Environment variables:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://YOUR_USERNAME-golf-platform-backend.hf.space`

#### Step 4: Deploy
Click "Create Web Service" and Render will automatically deploy!

Your frontend URL: `https://golf-platform-frontend.onrender.com`

---

## PHASE 4: POST-DEPLOYMENT VERIFICATION

### 4.1 Update Backend CORS
Edit your Hugging Face Space `.env`:
```
CORS_ORIGIN=https://golf-platform-frontend.onrender.com
```

Push the change:
```bash
cd golf-platform-backend  # HF Space directory
git add .env
git commit -m "Update CORS for frontend"
git push
```

### 4.2 Test API Connectivity
Frontend API test:
```javascript
// In browser console or any page
fetch('https://YOUR_USERNAME-golf-platform-backend.hf.space/api/draw')
  .then(r => r.json())
  .then(console.log)
```

### 4.3 Check Logs
- **Frontend logs:** Render dashboard > Service > Logs
- **Backend logs:** Hugging Face Space page > View Logs

---

## PHASE 5: ALTERNATIVE: Deploy Backend to Render (Recommended)

**Why:** Easier to manage, better support for Node.js apps, free tier includes server resources.

### 5.1 Instead of Hugging Face, Use Render for Backend Too

#### Option A: Separate Services (Recommended)
1. Deploy backend as separate Render Web Service
2. Follow same steps as frontend but use `server/` directory

#### Option B: Monorepo Approach
1. Create root `render.yaml` for both services
2. Point to different directories

**Quick Backend Render Setup:**
1. Create new Web Service on Render
2. Connect same GitHub repo
3. Root directory: `server`
4. Build: `npm install`
5. Start: `node server.js`
6. Set `PORT` env var to be assigned by Render

---

## PHASE 6: SECURITY CHECKLIST

- [ ] Add API rate limiting
- [ ] Enable HTTPS (Render/HF does automatically)
- [ ] Move secrets to environment variables
- [ ] Add input validation on backend
- [ ] Enable authentication properly
- [ ] Set up database for production (currently in-memory)
- [ ] Add error handling and logging
- [ ] Test CORS thoroughly

---

## PHASE 7: MONITORING & MAINTENANCE

### Render
- Monitoring: https://render.com/docs/monitoring
- Auto-redeploys on push to main
- Free tier has limited resources

### Hugging Face Spaces
- Logs accessible from Space page
- Auto-rebuilds on git push
- Limited compute resources on free tier

### Recommended Tools
- **Monitoring:** DataDog, New Relic, or built-in dashboards
- **Error Tracking:** Sentry
- **Logging:** Winston or Pino

---

## TROUBLESHOOTING

### Frontend Can't Reach Backend
1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify CORS is enabled on backend
3. Check firewall/network settings
4. Test directly with curl from backend URL

### Build Fails on Render
1. Check Node version matches
2. Verify all dependencies in package.json
3. Check build logs in Render dashboard

### HF Space Not Starting
1. Check Docker build logs
2. Verify PORT is set to 7860
3. Check for syntax errors in server.js

### API Timeouts
1. HF free tier has limited resources
2. Consider upgrading or using Render for backend
3. Add caching strategies

---

## QUICK REFERENCE

| Component | Platform | URL Pattern | Status |
|-----------|----------|-------------|--------|
| Frontend | Render | `https://golf-platform-frontend.onrender.com` | ✓ |
| Backend | Hugging Face | `https://USERNAME-golf-platform-backend.hf.space` | ✓ |
| Repo | GitHub | `https://github.com/USERNAME/golf-platform` | ✓ |

---

## NEXT STEPS

1. **Immediate:** Complete Phase 1 (Git setup)
2. **Then:** Choose backend deployment (Phase 2 OR Phase 5)
3. **Then:** Deploy frontend (Phase 3)
4. **Finally:** Test and verify (Phase 4)

**Estimated time:** 30-45 minutes

---

*Last updated: April 29, 2026*
