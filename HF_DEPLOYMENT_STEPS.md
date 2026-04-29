# Hugging Face Backend Deployment - Step by Step

## ✅ PHASE: Deploy to Hugging Face Spaces

### Step 1: Create HF Space ⭐
1. Go to: https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Fill in:
   - **Owner:** Select your username
   - **Space name:** `golf-platform-backend`
   - **License:** Select any (e.g., MIT)
   - **Space SDK:** Select **"Docker"** ⭐
   - **Visibility:** Public or Private
4. Click **"Create Space"**

**⏱️ Wait ~30 seconds for space to initialize**

---

### Step 2: Clone HF Space Locally
After space is created, open terminal and run:

```bash
# Navigate to a temporary directory
cd c:\Users\ASUS\Desktop

# Clone the HF space
git clone https://huggingface.co/spaces/sai12sharan/golf-platform-backend
cd golf-platform-backend

# List files (should be mostly empty)
dir
```

---

### Step 3: Copy Backend Files from Main Repo

Copy these files from your main golf-platform repo to the HF space:

```bash
# From main repo location, copy server files to HF space

# Copy from:  c:\Users\ASUS\OneDrive\Desktop\golf -platform\server\*
# Copy to:    c:\Users\ASUS\Desktop\golf-platform-backend\

Files to copy:
  ✅ Dockerfile
  ✅ .dockerignore
  ✅ server.js
  ✅ package.json
  ❌ node_modules/ (not needed)
```

**Or use this command:**
```bash
# Copy Dockerfile
copy "c:\Users\ASUS\OneDrive\Desktop\golf -platform\server\Dockerfile" "c:\Users\ASUS\Desktop\golf-platform-backend\"

# Copy .dockerignore
copy "c:\Users\ASUS\OneDrive\Desktop\golf -platform\server\.dockerignore" "c:\Users\ASUS\Desktop\golf-platform-backend\"

# Copy server.js
copy "c:\Users\ASUS\OneDrive\Desktop\golf -platform\server\server.js" "c:\Users\ASUS\Desktop\golf-platform-backend\"

# Copy package.json
copy "c:\Users\ASUS\OneDrive\Desktop\golf -platform\server\package.json" "c:\Users\ASUS\Desktop\golf-platform-backend\"
```

---

### Step 4: Create .env File in HF Space

In `c:\Users\ASUS\Desktop\golf-platform-backend\` create `.env`:

```
PORT=7860
NODE_ENV=production
CORS_ORIGIN=https://golf-platform-frontend.onrender.com
```

---

### Step 5: Verify Files in HF Space Directory

```bash
# In c:\Users\ASUS\Desktop\golf-platform-backend\
dir

# Should see:
  - Dockerfile
  - .dockerignore
  - server.js
  - package.json
  - .env
  - README.md (HF default)
```

---

### Step 6: Commit & Push to HF Space

```bash
cd c:\Users\ASUS\Desktop\golf-platform-backend

# Check git status
git status

# Add all files
git add .

# Commit
git commit -m "Add golf platform backend"

# Push to Hugging Face (this triggers auto-build & deploy)
git push
```

**⏱️ HF will auto-build Docker image (2-5 minutes)**

---

### Step 7: Get Your Backend URL

Once deployed:

1. Go to: https://huggingface.co/spaces/sai12sharan/golf-platform-backend
2. Your backend URL will be at the top:
   ```
   https://sai12sharan-golf-platform-backend.hf.space
   ```
3. Copy this URL - you'll need it for frontend

---

### Step 8: Test Backend API

In browser console or terminal:

```javascript
// Test the API
fetch('https://sai12sharan-golf-platform-backend.hf.space/api/draw')
  .then(r => r.json())
  .then(data => console.log('Success:', data))
  .catch(e => console.log('Error:', e.message))
```

Expected response:
```json
{
  "numbers": [5, 23, 41, 8, 35]
}
```

---

### Step 9: Check HF Space Logs (if issues)

1. Go to your Space: https://huggingface.co/spaces/sai12sharan/golf-platform-backend
2. Click **"Logs"** tab (top right)
3. Look for errors or issues
4. Fix and re-push if needed

---

## ⚠️ Troubleshooting

### Issue: Build failed
**Check:**
- Dockerfile syntax correct
- package.json valid JSON
- server.js has no syntax errors

### Issue: Container keeps restarting
**Check:**
- PORT must be 7860
- server.js listens on correct port
- No require() errors

### Issue: API returns 404
**Check:**
- Backend is actually running (check logs)
- Correct URL format
- Endpoints exist in server.js

---

## ✅ Checklist

- [ ] HF Space created as "Docker"
- [ ] Cloned to local computer
- [ ] Copied all 5 files (Dockerfile, .dockerignore, server.js, package.json, .env)
- [ ] Committed and pushed to HF
- [ ] Waited for build (check HF logs)
- [ ] Got backend URL: `https://sai12sharan-golf-platform-backend.hf.space`
- [ ] Tested API with curl/fetch
- [ ] **SAVE THIS URL** - needed for frontend

---

## 🎯 Next After HF Deployment

Once backend is running:
1. Note your HF backend URL
2. Move to **Frontend Deployment (Render)**
3. Update `NEXT_PUBLIC_API_URL` with HF backend URL
4. Deploy to Render

---

**Ready?** Follow the steps above and let me know when backend is deployed! 🚀
