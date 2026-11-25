# Employee Management & Onboarding System

This is a full-stack web application designed for comprehensive employee management and onboarding. It features a React-based frontend and a Django backend API.

## 🛠️ Technology Stack
- **Frontend:** React 19, Vite, React Router DOM
- **Backend:** Django 5.x, Django REST Framework
- **Database:** MySQL (Local / AWS RDS)

## 🌟 Features
- Employee CRUD operations (Create, Read, Update, Delete)
- Unified Employee Profiles (Bank Details, Compliance, CTC History)
- Onboarding Task Tracking and Checklists
- HR Dashboard with Onboarding Statistics
- Document Management (Upload and verify Compliance documents)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v16 or above) and **npm**
- **Python** (v3.9 or above)
- **MySQL Server** (If running a local database)

### 1. Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the `.env` file in the `backend` directory. (See *Environment Configuration* below).
5. Run database migrations:
   ```bash
   python manage.py migrate
   ```
6. (Optional) Seed the database with test data:
   ```bash
   python ../seed_test_data.py
   cd backend
   python seed_unified_profiles.py
   python seed_onboarding.py
   ```
7. Start the backend server:
   ```bash
   python manage.py runserver
   ```
   *The API will run at `http://127.0.0.1:8000/`*

### 2. Frontend Setup (React/Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Ensure you have a `.env` file in the `frontend` directory:
   ```env
   VITE_BACKEND_URL=http://127.0.0.1:8000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will typically run at `http://localhost:5173/` or `http://localhost:3000/`*

---

## ⚙️ Environment Configuration

### Backend Credentials (`backend/.env`)

Below is the remote database configuration previously used for this project. If you wish to use a local MySQL database, change `DB_HOST` to `127.0.0.1`, `DB_USER` to your local root user, and `DB_PASSWORD` to your local password.

```env
# Remote Database Configuration
DB_NAME=team16
DB_USER=team16
DB_PASSWORD=c4f9b56b118b
DB_HOST=internship-league-feb.cvuouqwaej9d.ap-south-1.rds.amazonaws.com
DB_PORT=3306

USE_MYSQL=true

# Authentication URLs
REGISTER_URL=https://zdotapps.com/screeningTest/store_user.php
SEND_OTP_URL=https://zdotapps.com/screeningTest/store_user_otp.php
VERIFY_OTP_URL=https://zdotapps.com/screeningTest/verify_user_otp.php
LOGIN_THROUGH_PASSWORD_URL=https://zdotapps.com/screeningTest/verify_user.php
FORGET_PASSWORD_URL=https://zdotapps.com/screeningTest/reset_password.php
```
