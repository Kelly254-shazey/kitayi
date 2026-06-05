# Kitayi Solutions — Water Utility Digital Platform

## Structure
```
kitayi/
├── backend/   # Django REST Framework API (port 8000)
└── frontend/  # React + Vite + TypeScript + Tailwind (port 5173)
```

---

## Quick Start (Local Dev — No Docker)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/api/docs/
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

The frontend proxies `/api` → `http://localhost:8000` automatically via Vite.

---

## Quick Start (Docker)
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/v1/
- Swagger: http://localhost:8000/api/docs/

---

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register/` | Register user |
| POST | `/api/v1/auth/login/` | Login, get JWT tokens |
| POST | `/api/v1/auth/logout/` | Blacklist refresh token |
| POST | `/api/v1/auth/refresh/` | Refresh access token |
| GET  | `/api/v1/products/` | List products |
| GET/POST | `/api/v1/orders/` | Orders |
| POST | `/api/v1/payments/pay-mpesa/` | M-Pesa STK push |
| POST | `/api/v1/payments/pay-stripe/` | Stripe checkout |
| GET/POST | `/api/v1/subscriptions/` | Subscriptions |
| GET  | `/api/v1/deliveries/` | Deliveries |

---

## Create Superuser
```bash
cd backend
python manage.py createsuperuser
```
Admin panel: http://localhost:8000/admin/
