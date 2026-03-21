# 🚀 SevaSetu - Deployment Guide

Complete guide for deploying SevaSetu to production.

---

## 📋 Pre-Deployment Checklist

### ✅ Files to Keep (Push to Git)
- `frontend/` - All React source code
- `backend/sevasetu/` - All Django source code
- `vercel.json`, `netlify.toml` - Deployment configs
- `README.md`, `DEPLOYMENT.md` - Documentation
- `.env.example` files - Environment templates

### ❌ Files to Exclude (DO NOT Push)
- `.env` files (contain secrets)
- `node_modules/`
- `__pycache__/`, `*.pyc`
- `db.sqlite3` (local database)
- `media/`, `staticfiles/`
- `.venv/`, `venv/`

---

## 🛠️ Required Tools

| Purpose | Tool | Link |
|---------|------|------|
| Code Hosting | **GitHub** | github.com |
| Frontend Hosting | **Vercel** or **Netlify** | vercel.com / netlify.com |
| Backend Hosting | **Railway** or **Render** | railway.app / render.com |
| Database | **PostgreSQL** | Included with hosting |

---

## 📝 Deployment Steps

### Step 1: Push to GitHub

```bash
cd /home/suma/sethu

# Clean build artifacts
./cleanup.sh

# Commit and push
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

### Step 2: Deploy Backend

#### Option A: Railway (Recommended)

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub

2. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `sethu` repository

3. **Configure Backend Service**
   - Click "New" → "Empty Service"
   - Settings:
     - **Name**: `sevasetu-backend`
     - **Root Directory**: `backend/sevasetu`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn sevasetu.wsgi:application`

4. **Add PostgreSQL Database**
   - Click "New" → "PostgreSQL"
   - Railway auto-provisions the database

5. **Set Environment Variables**
   ```
   SECRET_KEY=<generate-random-string>
   DEBUG=False
   ALLOWED_HOSTS=*
   DATABASE_URL=${{PostgreSQL.DATABASE_URL}}
   CORS_ALLOWED_ORIGINS=https://your-frontend.railway.app
   ```

6. **Deploy** - Railway builds automatically

7. **Get Backend URL**
   - Copy the Public URL (e.g., `https://sevasetu-backend-production.up.railway.app`)

#### Option B: Render

1. **Go to [render.com](https://render.com)** and sign in

2. **New Web Service**
   - Connect GitHub repo
   - **Root Directory**: `backend/sevasetu`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn sevasetu.wsgi:application`

3. **Add PostgreSQL**
   - New + → PostgreSQL
   - Copy Internal Database URL

4. **Environment Variables**
   ```
   SECRET_KEY=<generate-random-string>
   DEBUG=False
   ALLOWED_HOSTS=*
   DATABASE_URL=<postgresql-url>
   CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

---

### Step 3: Deploy Frontend

#### Option A: Vercel (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select your GitHub repo
   - **Root Directory**: `frontend`

3. **Configure Build**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Set Environment Variables**
   ```
   VITE_MOCK_MODE=false
   VITE_API_URL=https://sevasetu-backend-production.up.railway.app/api
   ```

5. **Deploy**

#### Option B: Netlify

1. **Go to [netlify.com](https://netlify.com)** and sign in

2. **Add New Site**
   - "Import an existing project"
   - Connect GitHub

3. **Configure Build**
   - **Base Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**
   ```
   VITE_MOCK_MODE=false
   VITE_API_URL=https://sevasetu-backend-production.up.railway.app/api
   ```

5. **Deploy**

---

### Step 4: Update CORS (Important!)

After frontend deploys:

1. Go to backend service (Railway/Render)
2. Update `CORS_ALLOWED_ORIGINS`:
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend-production.up.railway.app
   ```
3. Save - backend redeploys automatically

---

## ✅ Verify Deployment

### Test Backend
Visit: `https://your-backend.railway.app/api/dashboard/`

Should return:
```json
{
  "open_requests": 0,
  "active_providers": 0,
  "accepted_offers": 0,
  "completed_requests": 0
}
```

### Test Frontend
Visit: `https://your-frontend.vercel.app`

Login with demo credentials:
- Customer: `9000000001` / `123456`
- Provider: `9100000001` / `123456`
- Admin: `admin` / `123456`

---

## 🔧 Troubleshooting

### Backend Issues

**Build fails:**
- Check `requirements.txt` is in `backend/sevasetu/`
- Verify Start Command is correct

**Database error:**
- Ensure PostgreSQL is added
- Check `DATABASE_URL` variable

**CORS error:**
- Update `CORS_ALLOWED_ORIGINS` with actual frontend URL
- Use `*` for testing (not recommended for production)

### Frontend Issues

**Build fails:**
- Check Root Directory is set to `frontend`
- Verify `package.json` exists

**Can't connect to backend:**
- Check `VITE_API_URL` is correct
- Ensure backend is deployed and running

**Blank page:**
- Check browser console for errors
- Verify `VITE_MOCK_MODE=false`

---

## 📊 Environment Variables Summary

### Backend
```bash
SECRET_KEY=<random-string>
DEBUG=False
ALLOWED_HOSTS=*
DATABASE_URL=<postgresql-connection-string>
CORS_ALLOWED_ORIGINS=<frontend-url>
```

### Frontend
```bash
VITE_MOCK_MODE=false
VITE_API_URL=<backend-url>/api
```

---

## 🎯 Post-Deployment Tasks

### Run Migrations (Backend)
In Railway/Render shell:
```bash
python manage.py migrate
python manage.py createsuperuser
```

### Create Demo Data
```bash
python manage.py shell
>>> from core.models import AppUser
>>> AppUser.objects.create(name="Test Customer", phone="9000000001", pin="123456", role="customer", location="Test")
>>> AppUser.objects.create(name="Test Provider", phone="9100000001", pin="123456", role="provider", location="Test")
```

---

## 💰 Cost Estimates

### Railway
- **Free Tier**: $5 credit/month
- **Typical Cost**: Free for small apps

### Render
- **Free Tier**: Available with limitations
- **Web Service**: $7/month minimum

### Vercel/Netlify
- **Free Tier**: Generous for small apps
- **Typical Cost**: Free for demo/personal use

**Total Estimated Cost**: $0-7/month for demo usage

---

## 📞 Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Render Docs: [docs.render.com](https://docs.render.com)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Netlify Docs: [docs.netlify.com](https://docs.netlify.com)

For project-specific issues, check browser console and backend logs.
