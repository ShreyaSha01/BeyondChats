# BeyondChats Gmail Integration Dashboard

This project is a dashboard for BeyondChats that allows users to connect their Gmail account and manage email conversations in a chat-style interface.

The application consists of:

- **Frontend:** React (Vite)
- **Backend:** Laravel
- **Database:** MySQL
- **Containerization:** Docker (Laravel Sail)

The project is structured so that it can run on machines where PHP or Composer may not be installed locally.

---

# Project Structure

BeyondChats/
├── beyondchat-frontend/              # React dashboard
└── beyondchat-backend/    # Laravel backend (Docker + Sail)

---

# Prerequisites

Make sure the following tools are installed:

- Docker
- Node.js (v18 or later)
- npm

PHP and Composer do **not** need to be installed locally because the backend runs through Docker.

---

# Backend Setup (Laravel)

Navigate to the backend directory:

cd beyondchat-backend

Copy the environment configuration:

cp .env.example .env

Install backend dependencies using Docker Composer:

docker run --rm \
-u $(id -u):$(id -g) \
-v $(pwd):/app \
-w /app \
composer install

Start Laravel Sail containers:

./vendor/bin/sail up -d

Run database migrations:

./vendor/bin/sail artisan migrate

The backend will now be available at:

http://localhost

---

# Frontend Setup (React)

Open a new terminal and navigate to the frontend folder:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will run at:

http://localhost:5173

---

# Running the Project

Start backend:

cd beyondchat-backend
./vendor/bin/sail up -d

Start frontend:

cd frontend
npm run dev

After both services are running:

Frontend: http://localhost:5173  
Backend: http://localhost

---

# Environment Configuration

The backend uses environment variables defined in `.env`.

For Gmail integration, add the following values to `.env`:

GOOGLE_CLIENT_ID=your_client_id  
GOOGLE_CLIENT_SECRET=your_client_secret  
GOOGLE_REDIRECT_URI=http://localhost/api/auth/google/callback

These credentials should be obtained from the Google Cloud Console after enabling the Gmail API.

---

# Author

Shreya Sharma