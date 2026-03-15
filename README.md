# SevaSetu

SevaSetu is a rural demand-supply marketplace connecting villagers and farmers with nearby pharmacies, agro stores, and local service providers.

## What Is Implemented

- React + Tailwind customer and provider UI
- Django REST backend with complete workflow APIs
- Smart provider matching within 10 km based on category and service type
- Offer comparison by price, distance, rating, and ETA
- Offer acceptance, request completion, and provider rating flow
- Demo seed data for 3 hackathon scenarios

## Architecture

- Frontend: React + Tailwind (`frontend`)
- Backend: Django REST Framework (`backend/sevasetu`)
- DB: PostgreSQL-ready via `.env` + SQLite fallback for local quick demo

## Backend Setup

1. Open terminal in `backend/sevasetu`
2. Create `.env` from `.env.example`
3. Install dependencies:

```powershell
pip install -r requirements.txt
```

4. Run migrations:

```powershell
python manage.py makemigrations
python manage.py migrate
```

5. (Optional) Clear all existing data:

```powershell
python manage.py clear_data
```

6. Seed demo data (customers and providers):

```powershell
python manage.py seed_demo
```

8. Start backend:

```powershell
python manage.py runserver
```

Backend URL: `http://localhost:8000/api`

- Use `python manage.py clear_data` to remove all users, providers, requests, offers, and ratings. Run `seed_demo` again to repopulate.

## Frontend Setup

1. Open terminal in `frontend`
2. Create `.env` from `.env.example`
3. Install dependencies:

```powershell
npm install
```

4. Start app:

```powershell
npm run dev
```

Frontend URL: `http://localhost:5173`

## Core API Endpoints

- `POST /api/requests/`
- `GET /api/requests/{id}/offers/`
- `POST /api/offers/`
- `POST /api/offers/{id}/accept/`
- `POST /api/requests/{id}/complete/`
- `POST /api/ratings/`
- `GET /api/provider-inbox/?provider_id={id}`
- `GET /api/dashboard/`

## Demo Scenarios

### 1. Local Services

- Customer posts electrician request
- Providers respond with offer
- Customer compares price/distance/rating and accepts

### 2. Prescription Medicines

- Customer posts medicine request with prescription image URL
- Pharmacies respond with availability + delivery options
- Customer selects provider

### 3. Farm Supplies

- Farmer requests fertilizer/seeds/pesticides/tools
- Agro stores provide per-unit pricing
- Farmer selects best offer

## Notes for Judges

- Matching filters providers by category + service type
- Matching enforces max distance (10 km default)
- Workflow is transparent and comparison-first (not first-come-first-serve)
