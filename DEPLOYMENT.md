# 🚀 SevaSetu - Complete Deployment Guide

## 📋 Pre-Deployment Checklist

### Files to Keep (Push to Git)
✅ `frontend/` - All React source code
✅ `backend/sevasetu/` - All Django source code
✅ `vercel.json`, `netlify.toml` - Deployment configs
✅ `README.md`, `DEPLOYMENT.md` - Documentation
✅ `frontend/.env.example`, `backend/sevasetu/.env.example` - Env templates

### Files to Exclude (DO NOT Push)
❌ `.env` files (contain secrets)
❌ `node_modules/`
❌ `__pycache__/`, `*.pyc`
❌ `db.sqlite3` (local database)
❌ `media/`, `staticfiles/`
❌ `.venv/`, `venv/`

---

## 🛠️ Tools You Need

| Purpose | Tool | Link |
|---------|------|------|
| Code Hosting | **GitHub** | github.com |
| Frontend Hosting | **Vercel** (recommended) or Netlify | vercel.com |
| Backend Hosting | **Render** (recommended) or Railway | render.com |
| Database | **PostgreSQL** (via Render/Railway) | Included with hosting |

---

## 📝 Step-by-Step Deployment

### Step 1: Prepare Your Code

```bash
cd /home/suma/sethu

# Create .env files locally (DO NOT COMMIT)
echo "VITE_API_URL=http://localhost:8000/api" > frontend/.env

# Test locally first
cd frontend && npm install && npm run build
cd ../backend/sevasetu && pip install -r requirements.txt
```

### Step 2: Push to GitHub

```bash
cd /home/suma/sethu

# Initialize git if not done
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/sevasetu.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy Backend (Render)

1. Go to **render.com** → Sign up/Login
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: sevasetu-api
   - **Root Directory**: `backend/sevasetu`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn sevasetu.wsgi:application`
   - **Instance**: Free
5. Add Environment Variables:
   ```
   SECRET_KEY=<generate-random-string>
   DEBUG=False
   ALLOWED_HOSTS=*
   CORS_ALLOWED_ORIGINS=https://sevasetu.vercel.app
   ```
6. Click **Create Web Service**
7. Add PostgreSQL:
   - Go to **New +** → **PostgreSQL**
   - Copy the **Internal Database URL**
   - Add to env vars: `DATABASE_URL=postgresql://...`

8. Copy your backend URL (e.g., `https://sevasetu-api.onrender.com`)

### Step 4: Deploy Frontend (Vercel)

1. Go to **vercel.com** → Sign up/Login
2. Click **Add New Project**
3. Import your GitHub repo
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://sevasetu-api.onrender.com/api
   ```
6. Click **Deploy**

### Step 5: Update Backend CORS

After frontend deploys, update backend CORS:
```
CORS_ALLOWED_ORIGINS=https://sevasetu.vercel.app
```

---

## ✅ Verify Deployment

1. Visit your frontend URL
2. Test login with demo credentials:
   - Customer: `9000000001` / `123456`
   - Provider: `9100000001` / `123456`

---

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| CORS Error | Add frontend URL to `CORS_ALLOWED_ORIGINS` |
| 500 Error | Check backend logs in Render dashboard |
| Blank Page | Check `VITE_API_URL` in Vercel settings |
| Database Error | Run migrations: `python manage.py migrate` |

---

## 📊 URLs After Deployment

- **Frontend**: `https://sevasetu.vercel.app`
- **Backend API**: `https://sevasetu-api.onrender.com/api`
- **Admin Panel**: `https://sevasetu-api.onrender.com/admin`

---

## 🧹 Cleanup Before Pushing

```bash
cd /home/suma/sethu

# Remove any local build artifacts
rm -rf frontend/node_modules
rm -rf frontend/dist
rm -rf backend/sevasetu/__pycache__
rm -rf backend/sevasetu/*.pyc
rm -f backend/sevasetu/db.sqlite3*
rm -f frontend/.env

# Check what will be pushed
git status

# Push
git add .
git commit -m "Ready for deployment"
git push
```
