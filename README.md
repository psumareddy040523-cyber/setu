# 🌾 SevaSetu - Rural Services Platform

A platform connecting rural communities with local services, medicines, and farm supplies.

## Project Structure

```
sethu/
├── backend/          # Django REST API backend
│   └── sevasetu/
├── frontend/         # React + Vite frontend
│   └── src/
└── README.md
```

## Features

- **Local Services** - Electricians, Plumbers, Mechanics
- **Medicine Delivery** - Pharmacy services
- **Farm Supplies** - Fertilizers, Seeds, Pesticides, Tools
- **User Authentication** - Phone + PIN based login
- **Bilingual Support** - English and Hindi

## Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- Axios
- Lucide React icons

### Backend
- Django 5.2
- Django REST Framework
- PostgreSQL
- Gunicorn (production)

## Quick Start

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

```bash
cd backend/sevasetu
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`
5. Deploy

### Frontend (Netlify)

1. Push code to GitHub
2. Import project in [Netlify](https://netlify.com)
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/dist`
5. Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`
6. Deploy

### Backend (Render)

1. Push code to GitHub
2. Create new Web Service in [Render](https://render.com)
3. Set root directory to `backend/sevasetu`
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `gunicorn sevasetu.wsgi:application`
6. Add environment variables:
   - `SECRET_KEY`
   - `DATABASE_URL`
   - `ALLOWED_HOSTS`
   - `CORS_ALLOWED_ORIGINS`

### Backend (Railway)

1. Push code to GitHub
2. Deploy from GitHub in [Railway](https://railway.app)
3. Set root directory to `backend/sevasetu`
4. Add environment variables as above

## Demo Credentials

| Role | Phone | PIN |
|------|-------|-----|
| Customer | 9000000001 | 123456 |
| Provider | 9100000001 | 123456 |
| Admin | admin | 123456 |

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/sevasetu
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## License

MIT
