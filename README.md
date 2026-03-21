# 🌾 SevaSetu - Rural Services Platform

A full-stack platform connecting rural communities with local services, medicines, and farm supplies.

**Tech Stack:**
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Django 5 + Django REST Framework
- **Database**: PostgreSQL (production) / SQLite (development)
- **Deployment**: Railway, Render, Vercel, Netlify ready

---

## 🚀 Quick Start

### Option 1: Frontend Only (Mock Data - No Backend)

Perfect for demo/testing without setting up backend:

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

**Demo Credentials:**
| Role | Phone | PIN |
|------|-------|-----|
| Customer | 9000000001 | 123456 |
| Provider | 9100000001 | 123456 |
| Admin | admin | 123456 |

---

### Option 2: Full Stack (Frontend + Backend)

#### Backend Setup

```bash
cd backend/sevasetu

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend runs at http://localhost:8000

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (connect to backend)
echo "VITE_MOCK_MODE=false" > .env
echo "VITE_API_URL=http://localhost:8000/api" >> .env

# Start development server
npm run dev
```

Frontend runs at http://localhost:5173

---

## 📁 Project Structure

```
sethu/
├── backend/
│   └── sevasetu/
│       ├── core/              # Django app
│       │   ├── models.py      # Database models
│       │   ├── views.py       # API endpoints
│       │   ├── serializers.py # DRF serializers
│       │   └── urls.py        # URL routing
│       ├── sevasetu/          # Django project
│       │   ├── settings.py    # Django settings
│       │   └── urls.py        # Main URL config
│       ├── manage.py          # Django management
│       ├── requirements.txt   # Python dependencies
│       └── Procfile           # Deployment config
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # React pages
│   │   ├── services/          # API services
│   │   │   ├── api.js         # API calls
│   │   │   └── mockData.js    # Mock data
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json           # Node dependencies
│   └── vite.config.js         # Vite config
│
├── README.md                  # This file
├── DEPLOYMENT.md              # Deployment guide
└── RAILWAY_DEPLOY.md          # Railway-specific guide
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login/` - Login with phone + PIN
- `POST /api/auth/register/` - Register new user

### Users
- `GET /api/users/` - List all users
- `GET /api/users/{id}/` - Get user details

### Providers
- `GET /api/providers/` - List all providers
- `GET /api/providers/{id}/` - Get provider details

### Requests
- `GET /api/requests/` - List all requests
- `POST /api/requests/` - Create new request
- `GET /api/requests/{id}/offers/` - Get offers for request
- `POST /api/requests/{id}/complete/` - Mark request complete

### Offers
- `GET /api/offers/` - List all offers
- `POST /api/offers/` - Create new offer
- `POST /api/offers/{id}/accept/` - Accept offer
- `POST /api/offers/{id}/reject/` - Reject offer

### Other
- `GET /api/dashboard/` - Dashboard statistics
- `GET /api/provider-inbox/` - Provider's matching requests
- `GET /api/my-requests/` - User's requests

---

## 🌐 Deployment

### Frontend (Vercel/Netlify)

1. Push to GitHub
2. Import project in Vercel/Netlify
3. Set root directory: `frontend`
4. Set environment variables:
   - `VITE_MOCK_MODE=false`
   - `VITE_API_URL=https://your-backend-url.com/api`
5. Deploy

### Backend (Railway/Render)

1. Push to GitHub
2. Deploy `backend/sevasetu` directory
3. Set environment variables:
   - `SECRET_KEY=<random-string>`
   - `DEBUG=False`
   - `DATABASE_URL=<postgresql-url>`
   - `CORS_ALLOWED_ORIGINS=https://your-frontend-url.com`
4. Deploy

See `DEPLOYMENT.md` and `RAILWAY_DEPLOY.md` for detailed guides.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend/sevasetu
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 📊 Features

- **User Authentication**: Phone + PIN based login
- **Service Categories**: Electrician, Plumber, Mechanic, Medicine, Farm Supplies
- **Request Management**: Create, track, and complete service requests
- **Offer System**: Providers can send offers, customers can accept/reject
- **Rating System**: Rate providers after service completion
- **Multi-language**: English, Hindi, Telugu support
- **Responsive Design**: Works on mobile and desktop

---

## 🛠️ Development

### Backend Commands

```bash
# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Run development server
python manage.py runserver
```

### Frontend Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Environment Variables

### Frontend (.env)
```bash
VITE_MOCK_MODE=true          # Use mock data
VITE_API_URL=http://localhost:8000/api  # Backend URL
```

### Backend (.env)
```bash
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
DATABASE_URL=sqlite:///db.sqlite3
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📄 License

MIT License

---

## 📞 Support

For issues or questions, please open an issue on GitHub.
