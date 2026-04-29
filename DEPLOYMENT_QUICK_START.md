# QUICK START DEPLOYMENT CHECKLIST

## ✅ STEP 1: Setup Git & GitHub (5 minutes)
- [ ] Initialize git: `git init`
- [ ] Commit all files: `git add . && git commit -m "Initial commit"`
- [ ] Create GitHub repo: `golf-platform`
- [ ] Add remote: `git remote add origin https://github.com/YOUR_USERNAME/golf-platform.git`
- [ ] Push to GitHub: `git push -u origin main`

## ✅ STEP 2: Create Hugging Face Account & Space (10 minutes)
- [ ] Sign up at https://huggingface.co
- [ ] Create new Space: `golf-platform-backend`
- [ ] Select Docker SDK
- [ ] Clone the space locally
- [ ] Copy `server/` files into space directory
- [ ] Git push to HF Space
- [ ] Wait for auto-deploy (~2-5 minutes)
- [ ] Get your backend URL: `https://YOUR_USERNAME-golf-platform-backend.hf.space`

## ✅ STEP 3: Create Render Account & Deploy Frontend (10 minutes)
- [ ] Sign up at https://render.com
- [ ] Connect GitHub account
- [ ] Create new Web Service
- [ ] Select `golf-platform` repository
- [ ] Configuration:
  - Name: `golf-platform-frontend`
  - Root Directory: `client/golf-client`
  - Build Command: `npm ci && npm run build`
  - Start Command: `npm start`
  - Plan: Free
- [ ] Add Environment Variable:
  - NEXT_PUBLIC_API_URL = (your HF backend URL)
- [ ] Click Deploy
- [ ] Get your frontend URL: `https://golf-platform-frontend.onrender.com`

## ✅ STEP 4: Deploy Backend to Render (Optional but Recommended) (5 minutes)
Alternative to HF: Deploy backend to Render too
- [ ] Create another Web Service on Render
- [ ] Same GitHub repo
- [ ] Root Directory: `server`
- [ ] Build: `npm install`
- [ ] Start: `node server.js`
- [ ] Add Environment Variables:
  - CORS_ORIGIN = (your frontend URL)
  - PORT = (auto-assigned by Render)
- [ ] Click Deploy

## ✅ STEP 5: Update Configuration (5 minutes)
- [ ] Test API from browser console:
  ```javascript
  fetch('https://YOUR_BACKEND_URL/api/draw').then(r => r.json()).then(console.log)
  ```
- [ ] If using Render backend, update frontend env var to Render URL
- [ ] Test login/scores APIs

## ✅ STEP 6: Post-Deployment Checks (5 minutes)
- [ ] Frontend loads at render.com URL
- [ ] API calls succeed
- [ ] CORS errors resolved
- [ ] No 5xx errors in logs
- [ ] All features work (login, scores, draw)

---

## IMPORTANT ENVIRONMENT VARIABLES

### Backend (.env in server/)
```
PORT=7860              # For Hugging Face
NODE_ENV=production
CORS_ORIGIN=https://golf-platform-frontend.onrender.com
```

### Frontend (.env.production in client/golf-client/)
```
NEXT_PUBLIC_API_URL=https://YOUR_USERNAME-golf-platform-backend.hf.space
```

---

## TOTAL DEPLOYMENT TIME: ~40 minutes

---

## NEED HELP?

### Issue: "Cannot reach API"
1. Check CORS_ORIGIN in backend .env
2. Check NEXT_PUBLIC_API_URL in frontend
3. Verify backend is running (check HF/Render logs)
4. Test API directly: `curl https://backend-url/api/draw`

### Issue: "Build failed on Render"
1. Check build logs in Render dashboard
2. Verify package.json has correct scripts
3. Ensure Node version is 18.x
4. Check for syntax errors

### Issue: "HF Space not deploying"
1. Verify Dockerfile syntax
2. Check docker build logs
3. Ensure server.js works locally
4. Try: `git push` again (triggers rebuild)

---

**Status:** Ready for deployment  
**Last Updated:** April 29, 2026
